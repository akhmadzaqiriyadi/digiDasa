import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query/query-keys';
import {
  getWhatsAppStatus,
  connectWhatsApp,
  disconnectWhatsApp,
  logoutWhatsApp,
  sendTestWhatsAppMessage
} from '@/lib/api/whatsapp';
import { SendTestMessageInput } from '@/lib/schemas';
import { toast } from 'sonner';

export function useWhatsAppStatus(refetchInterval: number = 3000) {
  return useQuery({
    queryKey: queryKeys.whatsapp.status(),
    queryFn: getWhatsAppStatus,
    refetchInterval,
  });
}

export function useConnectWhatsApp() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: connectWhatsApp,
    onSuccess: (data) => {
      toast.success(data.message || 'Inisialisasi sesi WhatsApp berhasil dimulai.');
      queryClient.invalidateQueries({ queryKey: queryKeys.whatsapp.all });
    },
    onError: (err: Error) => {
      toast.error(`Gagal menghubungkan WhatsApp: ${err.message}`);
    },
  });
}

export function useDisconnectWhatsApp() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: disconnectWhatsApp,
    onSuccess: (data) => {
      toast.success(data.message || 'Koneksi WhatsApp berhasil diputus.');
      queryClient.invalidateQueries({ queryKey: queryKeys.whatsapp.all });
    },
    onError: (err: Error) => {
      toast.error(`Gagal memutuskan koneksi WhatsApp: ${err.message}`);
    },
  });
}

export function useLogoutWhatsApp() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: logoutWhatsApp,
    onSuccess: (data) => {
      toast.success(data.message || 'Sesi WhatsApp berhasil keluar (logout) dan auth dibersihkan.');
      queryClient.invalidateQueries({ queryKey: queryKeys.whatsapp.all });
    },
    onError: (err: Error) => {
      toast.error(`Gagal keluar sesi WhatsApp: ${err.message}`);
    },
  });
}

export function useSendTestWhatsAppMessage() {
  return useMutation({
    mutationFn: (input: SendTestMessageInput) => sendTestWhatsAppMessage(input),
    onSuccess: (data) => {
      toast.success(data.message || 'Pesan uji coba berhasil dikirim!');
    },
    onError: (err: Error) => {
      toast.error(`Gagal mengirim pesan: ${err.message}`);
    },
  });
}
