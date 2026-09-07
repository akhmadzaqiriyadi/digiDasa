export type TicketStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED';

export interface ITicket {
  id: string;
  sender: string;
  senderNumber?: string;
  name: string;
  issue: string;
  reason?: string;
  summary?: string;
  status: TicketStatus;
  createdAt: string;
  resolvedAt?: string;
  updatedAt?: string;
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
