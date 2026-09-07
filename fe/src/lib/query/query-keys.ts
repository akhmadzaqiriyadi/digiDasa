export const queryKeys = {
  whatsapp: {
    all: ['whatsapp'] as const,
    status: () => [...queryKeys.whatsapp.all, 'status'] as const,
  },
  knowledge: {
    all: ['knowledge'] as const,
    detail: () => [...queryKeys.knowledge.all, 'detail'] as const,
    jurusans: () => [...queryKeys.knowledge.all, 'jurusans'] as const,
    faqs: (params?: { page?: number; limit?: number }) => [...queryKeys.knowledge.all, 'faqs', params] as const,
    entities: (params?: { category?: string; q?: string }) => [...queryKeys.knowledge.all, 'entities', params] as const,
  },
  tickets: {
    all: ['tickets'] as const,
    list: (status?: string) => [...queryKeys.tickets.all, 'list', status] as const,
  },
  system: {
    all: ['system'] as const,
    status: () => [...queryKeys.system.all, 'status'] as const,
  }
};
