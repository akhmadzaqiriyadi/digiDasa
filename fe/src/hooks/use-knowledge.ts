import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query/query-keys';
import {
  getSchoolKnowledge,
  syncKnowledgeFromDb,
  createCustomEntity,
  deleteCustomEntity,
} from '@/lib/api/knowledge';
import { toast } from 'sonner';

export function useSchoolKnowledge() {
  return useQuery({
    queryKey: queryKeys.knowledge.detail(),
    queryFn: getSchoolKnowledge,
  });
}

export function useSyncKnowledge() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: syncKnowledgeFromDb,
    onSuccess: (data) => {
      toast.success(data.message || 'Sinkronisasi basis data PostgreSQL berhasil!');
      queryClient.invalidateQueries({ queryKey: queryKeys.knowledge.all });
    },
    onError: (err: Error) => {
      toast.error(`Gagal sinkronisasi: ${err.message}`);
    },
  });
}

export function useCreateCustomEntity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: {
      category: string;
      title: string;
      content: string;
      order?: number;
    }) => createCustomEntity(payload),
    onSuccess: () => {
      toast.success('Entitas pengetahuan baru berhasil disimpan ke PostgreSQL!');
      queryClient.invalidateQueries({ queryKey: queryKeys.knowledge.all });
    },
    onError: (err: Error) => {
      toast.error(`Gagal menambahkan data: ${err.message}`);
    },
  });
}

export function useDeleteCustomEntity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteCustomEntity(id),
    onSuccess: () => {
      toast.success('Entitas pengetahuan berhasil dihapus!');
      queryClient.invalidateQueries({ queryKey: queryKeys.knowledge.all });
    },
    onError: (err: Error) => {
      toast.error(`Gagal menghapus data: ${err.message}`);
    },
  });
}
