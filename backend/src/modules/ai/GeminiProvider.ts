import { GoogleGenerativeAI, GenerativeModel } from '@google/generative-ai';
import { IAIEngine, IAIResponse, IChatHistoryItem } from './types';
import { PromptEngine } from './PromptEngine';
import { WhatsAppFormatter } from '../../core/WhatsAppFormatter';
import { knowledgeRepository } from '../knowledge/KnowledgeRepository';
import { env } from '../../config/env';
import { logger } from '../../core/logger';

export class GeminiProvider implements IAIEngine {
  private genAI: GoogleGenerativeAI | null = null;
  private model: GenerativeModel | null = null;

  constructor() {
    this.init();
  }

  private init(): void {
    if (env.GEMINI_API_KEY && env.GEMINI_API_KEY.trim() !== '') {
      try {
        this.genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);
        this.model = this.genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
        logger.info('[GeminiProvider] Google Gemini 2.5 Flash client initialized.');
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        logger.error('[GeminiProvider] Initialization error: ' + msg);
      }
    }
  }

  public isAvailable(): boolean {
    return this.model !== null;
  }

  public async generateReply(
    message: string,
    history: IChatHistoryItem[] = []
  ): Promise<IAIResponse> {
    if (!this.model) {
      throw new Error('Gemini API model is not initialized');
    }

    const groundingSummary = knowledgeRepository.getGroundingSummary();
    const systemPrompt = PromptEngine.buildGroundedSystemPrompt(groundingSummary);

    const fullPrompt = `${systemPrompt}\n\nRiwayat Pesan Sebelumnya:\n${JSON.stringify(
      history
    )}\n\nPertanyaan Pengguna Saat Ini:\n"${message}"\n\nJawab dengan ramah, santun, akurat, dan ringkas:`;

    const result = await this.model.generateContent(fullPrompt);
    const rawReply = result.response.text();
    const replyText = WhatsAppFormatter.format(rawReply);

    const lower = message.toLowerCase();
    const requiresHumanEscalation =
      lower.includes('admin') ||
      lower.includes('panitia') ||
      lower.includes('keringanan khusus') ||
      lower.includes('kasus');

    return {
      reply: replyText,
      source: 'gemini-2.5-flash',
      confidence: 0.99,
      isFallback: false,
      requiresHumanEscalation,
      timestamp: new Date().toISOString()
    };
  }
}
