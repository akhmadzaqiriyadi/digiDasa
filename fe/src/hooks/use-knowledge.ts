import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query/query-keys';
import {
  getSchoolKnowledge,
  syncKnowledgeFromDb,
  createCustomEntity,
  updateCustomEntity,
  deleteCustomEntity,
  createJurusan,
  updateJurusan,
  deleteJurusan,
  createFaq,
  updateFaq,
  deleteFaq
} from '@/lib/api/knowledge';
import { CreateEntityInput, CreateJurusanInput, CreateFaqInput } from '@/lib/schemas';
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

// 1. Custom Entity Hooks
export function useCreateCustomEntity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateEntityInput) => createCustomEntity(payload),
    onSuccess: () => {
      toast.success('Entitas pengetahuan baru berhasil disimpan ke PostgreSQL!');
      queryClient.invalidateQueries({ queryKey: queryKeys.knowledge.all });
    },
    onError: (err: Error) => {
      toast.error(`Gagal menambahkan data: ${err.message}`);
    },
  });
}

export function useUpdateCustomEntity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<CreateEntityInput> }) =>
      updateCustomEntity(id, payload),
    onSuccess: () => {
      toast.success('Entitas pengetahuan berhasil diperbarui!');
      queryClient.invalidateQueries({ queryKey: queryKeys.knowledge.all });
    },
    onError: (err: Error) => {
      toast.error(`Gagal memperbarui data: ${err.message}`);
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

// 2. Jurusan Hooks
export function useCreateJurusan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateJurusanInput) => createJurusan(payload),
    onSuccess: () => {
      toast.success('Jurusan baru berhasil ditambahkan ke database!');
      queryClient.invalidateQueries({ queryKey: queryKeys.knowledge.all });
    },
    onError: (err: Error) => {
      toast.error(`Gagal menambahkan jurusan: ${err.message}`);
    },
  });
}

export function useUpdateJurusan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ kode, payload }: { kode: string; payload: Partial<CreateJurusanInput> }) =>
      updateJurusan(kode, payload),
    onSuccess: () => {
      toast.success('Data jurusan berhasil diperbarui!');
      queryClient.invalidateQueries({ queryKey: queryKeys.knowledge.all });
    },
    onError: (err: Error) => {
      toast.error(`Gagal memperbarui jurusan: ${err.message}`);
    },
  });
}

export function useDeleteJurusan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (kode: string) => deleteJurusan(kode),
    onSuccess: () => {
      toast.success('Jurusan berhasil dihapus dari database!');
      queryClient.invalidateQueries({ queryKey: queryKeys.knowledge.all });
    },
    onError: (err: Error) => {
      toast.error(`Gagal menghapus jurusan: ${err.message}`);
    },
  });
}

// 3. FAQ Hooks
export function useCreateFaq() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateFaqInput) => createFaq(payload),
    onSuccess: () => {
      toast.success('FAQ baru berhasil ditambahkan ke database!');
      queryClient.invalidateQueries({ queryKey: queryKeys.knowledge.all });
    },
    onError: (err: Error) => {
      toast.error(`Gagal menambahkan FAQ: ${err.message}`);
    },
  });
}

export function useUpdateFaq() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<CreateFaqInput> }) =>
      updateFaq(id, payload),
    onSuccess: () => {
      toast.success('FAQ berhasil diperbarui!');
      queryClient.invalidateQueries({ queryKey: queryKeys.knowledge.all });
    },
    onError: (err: Error) => {
      toast.error(`Gagal memperbarui FAQ: ${err.message}`);
    },
  });
}

export function useDeleteFaq() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteFaq(id),
    onSuccess: () => {
      toast.success('FAQ berhasil dihapus dari database!');
      queryClient.invalidateQueries({ queryKey: queryKeys.knowledge.all });
    },
    onError: (err: Error) => {
      toast.error(`Gagal menghapus FAQ: ${err.message}`);
    },
  });
}
