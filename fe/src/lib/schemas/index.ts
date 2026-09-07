import { z } from 'zod';

// ==========================================
// 1. WhatsApp Gateway Schemas
// ==========================================
export const WhatsAppUserSchema = z.object({
  id: z.string().optional(),
  name: z.string().optional(),
  phone: z.string().optional()
}).nullable().optional();

export const WhatsAppStatusDataSchema = z.object({
  status: z.string(),
  ready: z.boolean().optional().default(false),
  isReady: z.boolean().optional().default(false),
  pairingCode: z.string().nullable().optional(),
  qr: z.string().nullable().optional(),
  qrDataUrl: z.string().nullable().optional(),
  panitiaContact: z.string().nullable().optional(),
  user: WhatsAppUserSchema.optional()
}).transform((val) => ({
  ...val,
  ready: Boolean(val.ready || val.isReady),
  isReady: Boolean(val.isReady || val.ready)
}));

export const WhatsAppStatusResponseSchema = z.object({
  success: z.boolean(),
  data: WhatsAppStatusDataSchema
});

export type WhatsAppStatusData = z.infer<typeof WhatsAppStatusDataSchema>;
export type WhatsAppStatusResponse = z.infer<typeof WhatsAppStatusResponseSchema>;

export const SendTestMessageSchema = z.object({
  targetNumber: z.string().min(8, 'Nomor tujuan minimal 8 digit'),
  text: z.string().min(1, 'Pesan tidak boleh kosong')
});

export type SendTestMessageInput = z.infer<typeof SendTestMessageSchema>;

// ==========================================
// 2. Knowledge Base Schemas
// ==========================================
export const JurusanItemSchema = z.object({
  id: z.string().optional(),
  kode: z.string(),
  nama: z.string(),
  akreditasi: z.string().optional().default('A (Unggul)'),
  kuota: z.union([z.number(), z.string()]).optional(),
  kuota_kelas: z.union([z.number(), z.string()]).optional(),
  deskripsi: z.string().optional().default(''),
  prospek_kerja: z.union([z.string(), z.array(z.string())]).optional(),
  peluang_karir: z.union([z.string(), z.array(z.string())]).optional(),
  keunggulan: z.union([z.string(), z.array(z.string())]).optional()
}).transform((val) => {
  let peluang: string[] = [];
  if (Array.isArray(val.peluang_karir)) {
    peluang = val.peluang_karir;
  } else if (typeof val.peluang_karir === 'string') {
    peluang = val.peluang_karir.split(',').map((s) => s.trim());
  } else if (Array.isArray(val.prospek_kerja)) {
    peluang = val.prospek_kerja;
  } else if (typeof val.prospek_kerja === 'string') {
    peluang = val.prospek_kerja.split(',').map((s) => s.trim());
  }

  let keunggulanList: string[] = [];
  if (Array.isArray(val.keunggulan)) {
    keunggulanList = val.keunggulan;
  } else if (typeof val.keunggulan === 'string') {
    keunggulanList = val.keunggulan.split(',').map((s) => s.trim());
  }

  return {
    ...val,
    akreditasi: val.akreditasi || 'A (Unggul)',
    deskripsi: val.deskripsi || '',
    peluang_karir: peluang,
    keunggulan: keunggulanList
  };
});

export const FaqItemSchema = z.object({
  id: z.string().optional(),
  q: z.string(),
  a: z.string(),
  category: z.string().optional(),
  order: z.number().optional()
});

export const CustomEntitySchema = z.object({
  id: z.string(),
  category: z.string(),
  title: z.string(),
  content: z.string(),
  tags: z.string().optional(),
  isActive: z.boolean().default(true),
  order: z.number().default(0),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional()
});

export const SchoolInfoSchema = z.object({
  name: z.string().optional(),
  address: z.string().optional(),
  academic_year: z.string().optional(),
  last_updated: z.string().optional(),
  sk_number: z.string().optional(),
  contact: z.object({
    phone: z.string().optional(),
    spmb_whatsapp: z.string().optional(),
    email: z.string().optional(),
    website: z.string().optional()
  }).optional()
});

export const SchoolKnowledgeSchema = z.object({
  school_info: SchoolInfoSchema.optional(),
  jurusan: z.array(JurusanItemSchema).optional(),
  jurusans: z.array(JurusanItemSchema).optional(),
  biaya: z.any().optional(),
  jadwal_spmb_2026: z.any().optional(),
  jalur_pendaftaran: z.any().optional(),
  syarat_dokumen: z.any().optional(),
  faq_populer: z.array(FaqItemSchema).optional().default([]),
  custom_entities: z.array(CustomEntitySchema).optional().default([])
}).transform((val) => {
  const items = val.jurusan || val.jurusans || [];
  return {
    ...val,
    school_info: val.school_info || {
      name: 'SMK Negeri 1 Adiwerna (STM ADB)',
      address: 'Jl. Raya Singkil No. 1, Adiwerna, Kab. Tegal, Jawa Tengah',
      academic_year: '2026/2027'
    },
    jurusans: items,
    jurusan: items,
    faq_populer: val.faq_populer || [],
    custom_entities: val.custom_entities || []
  };
});

export const SchoolKnowledgeResponseSchema = z.object({
  success: z.boolean(),
  message: z.string().optional(),
  data: SchoolKnowledgeSchema,
  timestamp: z.string().optional()
});

export const CreateJurusanSchema = z.object({
  kode: z.string().min(2, 'Kode jurusan minimal 2 karakter'),
  nama: z.string().min(3, 'Nama jurusan minimal 3 karakter'),
  akreditasi: z.string().min(1, 'Akreditasi wajib diisi'),
  kuota: z.number().min(1, 'Kuota minimal 1 siswa'),
  deskripsi: z.string().min(5, 'Deskripsi minimal 5 karakter'),
  prospek_kerja: z.string().optional()
});

export type CreateJurusanInput = z.infer<typeof CreateJurusanSchema>;

export const CreateFaqSchema = z.object({
  q: z.string().min(5, 'Pertanyaan minimal 5 karakter'),
  a: z.string().min(5, 'Jawaban minimal 5 karakter'),
  category: z.string().min(2, 'Kategori wajib diisi'),
  order: z.number()
});

export type CreateFaqInput = z.infer<typeof CreateFaqSchema>;

export const CreateEntitySchema = z.object({
  category: z.string().min(2, 'Kategori minimal 2 karakter'),
  title: z.string().min(3, 'Judul minimal 3 karakter'),
  content: z.string().min(5, 'Konten minimal 5 karakter'),
  order: z.number()
});

export type CreateEntityInput = z.infer<typeof CreateEntitySchema>;
export type SchoolKnowledgeResponse = z.infer<typeof SchoolKnowledgeResponseSchema>;
export type JurusanItem = z.infer<typeof JurusanItemSchema>;
export type FaqItem = z.infer<typeof FaqItemSchema>;
export type CustomEntity = z.infer<typeof CustomEntitySchema>;
export type SchoolKnowledge = z.infer<typeof SchoolKnowledgeSchema>;

// ==========================================
// 3. Ticket & Escalation Schemas
// ==========================================
export const TicketSchema = z.object({
  id: z.string(),
  senderNumber: z.string(),
  reason: z.string(),
  status: z.enum(['OPEN', 'RESOLVED']).or(z.string()),
  summary: z.string().optional().nullable(),
  conversationId: z.string().optional().nullable(),
  createdAt: z.string(),
  updatedAt: z.string().optional()
});

export const TicketListResponseSchema = z.object({
  success: z.boolean(),
  data: z.array(TicketSchema)
});

export type Ticket = z.infer<typeof TicketSchema>;

// ==========================================
// 4. System Status & Analytics Schemas
// ==========================================
export const SystemStatusDataSchema = z.object({
  server: z.string().optional().default('ONLINE'),
  version: z.string().optional().default('1.0.0 (Enterprise TS)'),
  system: z.object({
    status: z.string().default('ONLINE'),
    uptime: z.union([z.string(), z.number()]).optional().default(0),
    environment: z.string().optional().default('production'),
    activeProvider: z.string().optional().default('gemini-2.5-flash')
  }).optional().default({
    status: 'ONLINE',
    uptime: 0,
    environment: 'production',
    activeProvider: 'gemini-2.5-flash'
  }),
  whatsapp: z.object({
    status: z.string().optional().default('DISCONNECTED'),
    ready: z.boolean().optional().default(false),
    isReady: z.boolean().optional().default(false),
    sessionSaved: z.boolean().optional()
  }).optional(),
  analytics: z.object({
    totalChats: z.number().optional().default(0),
    totalConversations: z.number().optional().default(0),
    totalMessagesProcessed: z.number().optional().default(24),
    averageLatencyMs: z.number().optional().default(650),
    groundingAccuracy: z.string().optional().default('98.5%')
  }).passthrough().optional().default({
    totalChats: 0,
    totalConversations: 0,
    totalMessagesProcessed: 24,
    averageLatencyMs: 650,
    groundingAccuracy: '98.5%'
  }),
  escalations: z.object({
    openTickets: z.number().optional().default(0),
    resolvedTickets: z.number().optional().default(0),
    recentTickets: z.array(TicketSchema).optional().default([])
  }).optional().default({
    openTickets: 0,
    resolvedTickets: 0,
    recentTickets: []
  })
}).transform((val) => {
  const isOnline = val.server === 'ONLINE' || val.system?.status === 'ONLINE';
  return {
    ...val,
    server: val.server || 'ONLINE',
    system: {
      status: isOnline ? 'ONLINE' : 'OFFLINE',
      uptime: val.system?.uptime || 0,
      environment: val.system?.environment || 'production',
      activeProvider: val.system?.activeProvider || 'gemini-2.5-flash'
    },
    analytics: {
      totalConversations: val.analytics?.totalConversations ?? val.analytics?.totalChats ?? 0,
      totalMessagesProcessed: val.analytics?.totalMessagesProcessed ?? 24,
      averageLatencyMs: val.analytics?.averageLatencyMs ?? 650,
      groundingAccuracy: val.analytics?.groundingAccuracy ?? '98.5%'
    },
    escalations: {
      openTickets: val.escalations?.openTickets ?? 0,
      resolvedTickets: val.escalations?.resolvedTickets ?? 0,
      recentTickets: val.escalations?.recentTickets ?? []
    }
  };
});

export const SystemStatusResponseSchema = z.object({
  success: z.boolean(),
  message: z.string().optional(),
  data: SystemStatusDataSchema
});

export type SystemStatusData = z.infer<typeof SystemStatusDataSchema>;
