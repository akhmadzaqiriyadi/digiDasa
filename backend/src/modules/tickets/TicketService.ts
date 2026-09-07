import { ITicket, TicketStatus, IAnalyticsStats } from './types';
import { logger } from '../../core/logger';

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

  private constructor() {}

  public static getInstance(): TicketService {
    if (!TicketService.instance) {
      TicketService.instance = new TicketService();
    }
    return TicketService.instance;
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
      if (status === 'RESOLVED') {
        ticket.resolvedAt = new Date().toISOString();
      }
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
