import fs from 'fs';
import path from 'path';
import { ITicket, TicketStatus, IAnalyticsStats } from './types';
import { logger } from '../../core/logger';

const TICKETS_FILE = path.join(process.cwd(), 'tickets.json');

export class TicketService {
  private static instance: TicketService;
  private tickets: ITicket[] = [];
  private stats: IAnalyticsStats = {
    totalChats: 0,
    aiHandled: 0,
    escalatedToHuman: 0,
    openTickets: 0,
    resolvedTickets: 0,
    popularTopics: {
      biaya: 0,
      jurusan: 0,
      jadwal: 0,
      syarat: 0,
      lainnya: 0
    }
  };

  private constructor() {
    this.loadFromFile();
  }

  public static getInstance(): TicketService {
    if (!TicketService.instance) {
      TicketService.instance = new TicketService();
    }
    return TicketService.instance;
  }

  private loadFromFile(): void {
    try {
      if (fs.existsSync(TICKETS_FILE)) {
        const raw = fs.readFileSync(TICKETS_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          this.tickets = parsed;
          this.stats.openTickets = this.tickets.filter((t) => t.status === 'OPEN').length;
          this.stats.resolvedTickets = this.tickets.filter((t) => t.status === 'RESOLVED').length;
          this.stats.escalatedToHuman = this.tickets.length;
          logger.info(`[TicketService] Loaded ${this.tickets.length} tickets from ${TICKETS_FILE}`);
          return;
        }
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      logger.warn(`[TicketService] Failed to load tickets from file: ${msg}`);
    }

    // Default seed ticket if empty
    this.tickets = [
      {
        id: 'TCK-956915',
        sender: '201000963063809@lid',
        senderNumber: '201000963063809@lid',
        name: 'Orang Tua / Calon Siswa (WhatsApp)',
        issue: 'admin',
        reason: 'Permintaan bantuan staf panitia (admin)',
        summary: 'Pendaftar menanyakan bantuan langsung panitia via kata kunci "admin".',
        status: 'OPEN',
        createdAt: '2026-09-07T06:52:36.915Z',
        updatedAt: '2026-09-07T06:52:36.915Z'
      }
    ];
    this.saveToFile();
  }

  private saveToFile(): void {
    try {
      fs.writeFileSync(TICKETS_FILE, JSON.stringify(this.tickets, null, 2), 'utf-8');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      logger.error(`[TicketService] Failed to save tickets to file: ${msg}`);
    }
  }

  public recordInteraction(message: string, isEscalation = false): void {
    this.stats.totalChats++;
    if (!isEscalation) {
      this.stats.aiHandled++;
    }

    const lower = message.toLowerCase();
    if (lower.includes('biaya') || lower.includes('seragam') || lower.includes('spp')) {
      this.stats.popularTopics.biaya++;
    } else if (lower.includes('jurusan') || lower.includes('rpl') || lower.includes('tkj')) {
      this.stats.popularTopics.jurusan++;
    } else if (lower.includes('jadwal') || lower.includes('tanggal')) {
      this.stats.popularTopics.jadwal++;
    } else if (lower.includes('syarat') || lower.includes('berkas')) {
      this.stats.popularTopics.syarat++;
    } else {
      this.stats.popularTopics.lainnya++;
    }
  }

  public createTicket(sender: string, name: string, issue: string): ITicket {
    const ticket: ITicket = {
      id: `TCK-${Date.now().toString().slice(-6)}`,
      sender,
      senderNumber: sender,
      name: name || 'Orang Tua / Calon Siswa',
      issue,
      reason: issue,
      summary: issue,
      status: 'OPEN',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.tickets.unshift(ticket);
    this.stats.escalatedToHuman++;
    this.saveToFile();
    logger.info(`[TicketService] Escalation ticket created: ${ticket.id} (${sender})`);
    return ticket;
  }

  public getTickets(statusFilter?: TicketStatus): ITicket[] {
    const list = statusFilter ? this.tickets.filter((t) => t.status === statusFilter) : this.tickets;
    return list.map((t) => ({
      ...t,
      senderNumber: t.senderNumber || t.sender,
      reason: t.reason || t.issue,
      summary: t.summary || t.issue
    }));
  }

  public updateTicketStatus(id: string, status: TicketStatus): ITicket | null {
    const ticket = this.tickets.find((t) => t.id === id);
    if (ticket) {
      ticket.status = status;
      ticket.updatedAt = new Date().toISOString();
      if (status === 'RESOLVED') {
        ticket.resolvedAt = new Date().toISOString();
      }
      this.saveToFile();
      logger.info(`[TicketService] Ticket ${id} status updated to ${status}`);
      return ticket;
    }
    return null;
  }

  public getAnalytics(): IAnalyticsStats {
    return {
      ...this.stats,
      openTickets: this.tickets.filter((t) => t.status === 'OPEN').length,
      resolvedTickets: this.tickets.filter((t) => t.status === 'RESOLVED').length
    };
  }
}

export const ticketService = TicketService.getInstance();
