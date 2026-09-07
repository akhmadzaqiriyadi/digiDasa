export type TicketStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED';

export interface ITicket {
  id: string;
  sender: string;
  name: string;
  issue: string;
  status: TicketStatus;
  createdAt: string;
  resolvedAt?: string;
}

export interface IAnalyticsStats {
  totalChats: number;
  aiHandled: number;
  escalatedToHuman: number;
  openTickets: number;
  resolvedTickets: number;
  popularTopics: {
    biaya: number;
    jurusan: number;
    jadwal: number;
    syarat: number;
    lainnya: number;
  };
}
