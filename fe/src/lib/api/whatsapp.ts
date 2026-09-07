import { apiClient } from './client';
import {
  WhatsAppStatusResponseSchema,
  WhatsAppStatusResponse,
  SendTestMessageInput
} from '../schemas';

export async function getWhatsAppStatus(): Promise<WhatsAppStatusResponse> {
  const data = await apiClient<unknown>('/whatsapp/status', {
    method: 'GET',
    cache: 'no-store'
  });
  return WhatsAppStatusResponseSchema.parse(data);
}

export async function connectWhatsApp(): Promise<{ success: boolean; message: string; data?: unknown }> {
  return apiClient('/whatsapp/connect', {
    method: 'POST'
  });
}

export async function sendTestWhatsAppMessage(input: SendTestMessageInput): Promise<{ success: boolean; message: string }> {
  return apiClient('/whatsapp/send-test', {
    method: 'POST',
    body: JSON.stringify(input)
  });
}
