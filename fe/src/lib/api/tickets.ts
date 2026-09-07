import { apiClient } from './client';
import {
  SystemStatusResponseSchema,
  SystemStatusData,
  TicketListResponseSchema,
  Ticket
} from '../schemas';

export async function getSystemStatus(): Promise<SystemStatusData> {
  const data = await apiClient<unknown>('/status', {
    method: 'GET',
    cache: 'no-store'
  });
  const parsed = SystemStatusResponseSchema.parse(data);
  return parsed.data;
}

export async function getTickets(status?: string): Promise<Ticket[]> {
  const query = status && status !== 'ALL' ? `?status=${status}` : '';
  const data = await apiClient<unknown>(`/tickets${query}`, {
    method: 'GET',
    cache: 'no-store'
  });
  const parsed = TicketListResponseSchema.parse(data);
  return parsed.data;
}

export async function resolveTicket(id: string): Promise<{ success: boolean; message: string }> {
  return apiClient(`/tickets/${id}/resolve`, {
    method: 'POST'
  });
}
