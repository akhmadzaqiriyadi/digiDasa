import { Client, LocalAuth, Message } from 'whatsapp-web.js';
import QRCode from 'qrcode';
import { EventEmitter } from 'events';
import fs from 'fs';
import path from 'path';
import { aiService } from '../ai/AIService';
import { ticketService } from '../tickets/TicketService';
import { WhatsAppFormatter } from '../../core/WhatsAppFormatter';
import { env, APP_CONFIG } from '../../config/env';
import { logger } from '../../core/logger';
import { BadRequestError } from '../../core/AppError';

export type WAConnectionStatus =
  'DISCONNECTED' | 'INITIALIZING' | 'SCAN_QR' | 'CONNECTED' | 'ERROR';

export class WhatsAppProvider extends EventEmitter {
  private static instance: WhatsAppProvider;
  private client: Client | null = null;
  private isReady = false;
  private currentQrCode: string | null = null;
  private currentQrDataUrl: string | null = null;
  private status: WAConnectionStatus = 'DISCONNECTED';

  private constructor() {
    super();
    if (env.ENABLE_WA_AUTOSTART) {
      this.init();
    }
  }

  public static getInstance(): WhatsAppProvider {
    if (!WhatsAppProvider.instance) {
      WhatsAppProvider.instance = new WhatsAppProvider();
    }
    return WhatsAppProvider.instance;
  }

  public cleanupLocks(): void {
    const sessionDir = path.resolve('./.wwebjs_auth/session');
    if (fs.existsSync(sessionDir)) {
      const lockFiles = ['SingletonLock', 'SingletonCookie', 'SingletonSocket', 'DevToolsActivePort'];
      for (const file of lockFiles) {
        const filePath = path.join(sessionDir, file);
        if (fs.existsSync(filePath)) {
          try {
            fs.unlinkSync(filePath);
            logger.info(`[WhatsAppProvider] Cleaned stale lock file: ${file}`);
          } catch (e) {
            logger.warn(`[WhatsAppProvider] Could not remove lock file ${file}: ${e}`);
          }
        }
      }
    }
  }

  public async connect(): Promise<void> {
    if (this.client) {
      try {
        await this.client.destroy().catch(() => {});
      } catch {
        // ignore
      }
      this.client = null;
    }
    this.cleanupLocks();
    this.init();
  }

  public async disconnect(): Promise<void> {
    if (this.client) {
      try {
        await this.client.destroy();
        this.client = null;
        this.isReady = false;
        this.status = 'DISCONNECTED';
        this.currentQrCode = null;
        this.currentQrDataUrl = null;
        logger.info('[WhatsAppProvider] WhatsApp client disconnected and destroyed.');
        this.emit('status', this.status);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        logger.error('[WhatsAppProvider] Disconnect error: ' + msg);
      }
    }
  }

  public async logout(): Promise<void> {
    const oldClient = this.client;
    this.client = null;
    this.isReady = false;
    this.status = 'DISCONNECTED';
    this.currentQrCode = null;
    this.currentQrDataUrl = null;

    if (oldClient) {
      try {
        await oldClient.logout().catch(() => {});
      } catch (err) {
        logger.warn('[WhatsAppProvider] Client logout error: ' + err);
      }
      try {
        await oldClient.destroy().catch(() => {});
      } catch (err) {
        logger.warn('[WhatsAppProvider] Client destroy error: ' + err);
      }
    }

    if (fs.existsSync('./.wwebjs_auth')) {
      try {
        fs.rmSync('./.wwebjs_auth', { recursive: true, force: true });
      } catch (e) {
        logger.warn('[WhatsAppProvider] Could not remove auth folder: ' + e);
      }
    }
    this.cleanupLocks();
    logger.info('[WhatsAppProvider] WhatsApp session logged out and auth data cleared.');
    this.emit('status', this.status);
  }

  public init(): void {
    if (this.client) {
      logger.warn('[WhatsAppProvider] Client already initialized.');
      return;
    }

    this.cleanupLocks();

    logger.info('[WhatsAppProvider] Initializing WhatsApp Client (LocalAuth)...');
    this.status = 'INITIALIZING';
    this.emit('status', this.status);

    const isMac = process.platform === 'darwin';
    const chromePath =
      isMac && fs.existsSync('/Applications/Google Chrome.app/Contents/MacOS/Google Chrome')
        ? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
        : undefined;

    this.client = new Client({
      authStrategy: new LocalAuth({ dataPath: './.wwebjs_auth' }),
      webVersionCache: {
        type: 'remote',
        remotePath:
          'https://raw.githubusercontent.com/wppconnect-team/wa-js/main/dist/wppconnect-wa.js'
      },
      puppeteer: {
        headless: true,
        executablePath: chromePath,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--disable-gpu'
        ]
      }
    });

    this.client.on('loading_screen', (percent, message) => {
      logger.info(`⏳ [WhatsAppProvider] Loading: ${percent}% - ${message}`);
    });

    this.client.on('qr', async (qr: string) => {
      this.currentQrCode = qr;
      this.status = 'SCAN_QR';
      try {
        this.currentQrDataUrl = await QRCode.toDataURL(qr);
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : String(e);
        logger.error('[WhatsAppProvider] QR DataURL error: ' + msg);
      }

      logger.info(
        '📱 [WhatsAppProvider] QR Code siap di-scan via Frontend atau API GET /api/v1/whatsapp/status'
      );

      this.emit('qr', { qr, dataUrl: this.currentQrDataUrl });
      this.emit('status', this.status);
    });

    this.client.on('ready', () => {
      this.isReady = true;
      this.currentQrCode = null;
      this.currentQrDataUrl = null;
      this.status = 'CONNECTED';
      logger.info('✅ [WhatsAppProvider] WhatsApp Client is CONNECTED and READY!');
      this.emit('ready');
      this.emit('status', this.status);
    });

    this.client.on('authenticated', () => {
      logger.info('🔑 [WhatsAppProvider] Session Authenticated.');
    });

    this.client.on('auth_failure', (msg: string) => {
      this.status = 'ERROR';
      logger.error('❌ [WhatsAppProvider] Auth Failure: ' + msg);
      this.emit('status', this.status);
    });

    this.client.on('disconnected', async (reason: string) => {
      this.isReady = false;
      this.status = 'DISCONNECTED';
      this.currentQrCode = null;
      this.currentQrDataUrl = null;
      logger.warn('⚠️ [WhatsAppProvider] Disconnected: ' + reason);
      this.emit('status', this.status);

      const oldClient = this.client;
      this.client = null;
      if (oldClient) {
        try {
          await oldClient.destroy().catch(() => {});
        } catch {
          // ignore
        }
      }
      this.cleanupLocks();
    });

    // Listen to standard incoming messages
    this.client.on('message', async (msg: Message) => {
      logger.info(`[WA Event: message] Received from: ${msg.from}`);
      await this.handleIncomingMessage(msg);
    });

    // Listen to all created messages (including self-chat)
    this.client.on('message_create', async (msg: Message) => {
      if (msg.fromMe) {
        await this.handleIncomingMessage(msg);
      }
    });

    this.client.initialize().catch((err: unknown) => {
      this.status = 'ERROR';
      const msg = err instanceof Error ? err.message : String(err);
      logger.error('[WhatsAppProvider] Init error: ' + msg);
      this.emit('status', this.status);
    });
  }

  private lastRepliedText: string = '';

  private async handleIncomingMessage(msg: Message): Promise<void> {
    // Ignore group chats
    if (msg.from.endsWith('@g.us') || msg.to?.endsWith('@g.us')) return;

    const body = msg.body ? msg.body.trim() : '';
    if (!body) return;

    // Prevent infinite loop if message is the bot's own response
    if (
      body.includes('Surat Keputusan (SK) Panitia SPMB') ||
      body.includes('ADAPTIVA-BOT') ||
      body === this.lastRepliedText
    ) {
      return;
    }

    const sender = msg.from;
    const isSelfChat =
      msg.fromMe && (msg.to === msg.from || msg.to?.includes(msg.from.split('@')[0]));

    // If it's fromMe but NOT a self-chat test, ignore (regular outgoing reply to another person)
    if (msg.fromMe && !isSelfChat) {
      return;
    }

    logger.info(`[WA Received] From: ${sender} | Text: "${body}" | SelfChat: ${isSelfChat}`);

    try {
      // Optional typing state
      try {
        const chat = await msg.getChat();
        await chat.sendStateTyping();
      } catch {
        // Ignore typing state errors on LID contacts
      }

      const startTime = Date.now();
      const response = await aiService.generateReply(body);
      const latency = Date.now() - startTime;

      this.lastRepliedText = response.reply;
      ticketService.recordInteraction(body, response.requiresHumanEscalation);

      if (response.requiresHumanEscalation) {
        ticketService.createTicket(sender, sender, body);
      }

      const finalReply = WhatsAppFormatter.format(response.reply);

      // Send reply directly to the chat target
      if (this.client) {
        await this.client.sendMessage(msg.from, finalReply);
      } else {
        await msg.reply(finalReply);
      }

      logger.info(`[WA Sent] Replied to ${sender} in ${latency}ms via [${response.source}]`);
    } catch (err: unknown) {
      const msgError = err instanceof Error ? err.message : String(err);
      logger.error('[WhatsAppProvider] Message reply failed: ' + msgError);
    }
  }

  public getStatus(): {
    isReady: boolean;
    ready: boolean;
    status: WAConnectionStatus;
    qr: string | null;
    qrDataUrl: string | null;
    panitiaContact: string;
    user?: { id: string; name?: string } | null;
  } {
    return {
      isReady: this.isReady,
      ready: this.isReady,
      status: this.status,
      qr: this.currentQrCode,
      qrDataUrl: this.currentQrDataUrl,
      panitiaContact: APP_CONFIG.panitiaWaNumber,
      user: this.client?.info ? { id: this.client.info.wid?._serialized || '', name: this.client.info.pushname } : null
    };
  }

  public sanitizeNumber(numberStr: string): string {
    let cleaned = numberStr.replace(/[^0-9]/g, '');
    if (cleaned.startsWith('0')) {
      cleaned = '62' + cleaned.slice(1);
    } else if (cleaned.startsWith('8')) {
      cleaned = '62' + cleaned;
    }
    return cleaned;
  }

  public async sendManualMessage(targetNumber: string, text: string): Promise<Message> {
    if (!this.isReady || !this.client) {
      throw new BadRequestError('WhatsApp Gateway belum terhubung. Silakan scan QR code terlebih dahulu.');
    }

    const cleaned = this.sanitizeNumber(targetNumber);
    if (cleaned.length < 9) {
      throw new BadRequestError('Format nomor WhatsApp tidak valid. Gunakan format contoh: 08123456789 atau 628123456789');
    }

    try {
      let targetJid = `${cleaned}@c.us`;
      try {
        const numberId = await this.client.getNumberId(cleaned);
        if (numberId?._serialized) {
          targetJid = numberId._serialized;
        } else {
          logger.warn(`[WhatsAppProvider] Number ${cleaned} might not be registered on WhatsApp.`);
        }
      } catch (errCheck) {
        logger.warn(`[WhatsAppProvider] getNumberId check warning: ${errCheck}`);
      }

      return await this.client.sendMessage(targetJid, text);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      logger.error(`[WhatsAppProvider] Send manual message error to ${targetNumber}: ${msg}`);
      if (msg === 't' || msg.includes('Evaluation failed') || msg.includes('getChat')) {
        throw new BadRequestError(`Nomor tujuan (${targetNumber}) tidak valid atau belum terdaftar di WhatsApp.`);
      }
      throw new BadRequestError(`Gagal mengirim pesan WhatsApp: ${msg}`);
    }
  }
}

export const whatsAppProvider = WhatsAppProvider.getInstance();
