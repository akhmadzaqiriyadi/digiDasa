import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query/query-keys';
import { getTickets, resolveTicket, getSystemStatus } from '@/lib/api/tickets';
import { toast } from 'sonner';

export function useTickets(status?: string, refetchInterval: number = 5000) {
  return useQuery({
    queryKey: queryKeys.tickets.list(status),
    queryFn: () => getTickets(status),
    refetchInterval,
  });
}

export function useSystemStatus(refetchInterval: number = 5000) {
  return useQuery({
    queryKey: queryKeys.system.status(),
    queryFn: getSystemStatus,
    refetchInterval,
  });
}

export function useResolveTicket() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => resolveTicket(id),
    onSuccess: (data) => {
      toast.success(data.message || 'Tiket berhasil diselesaikan panitia!');
      queryClient.invalidateQueries({ queryKey: queryKeys.tickets.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.system.all });
    },
    onError: (err: Error) => {
      toast.error(`Gagal menyelesaikan tiket: ${err.message}`);
    },
  });
}
