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

export const CreateEntitySchema = z.object({
  category: z.string().min(2, 'Kategori minimal 2 karakter'),
  title: z.string().min(3, 'Judul minimal 3 karakter'),
  content: z.string().min(5, 'Konten minimal 5 karakter'),
  order: z.number().optional()
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
  system: z.object({
    status: z.string(),
    uptime: z.union([z.string(), z.number()]),
    environment: z.string().optional(),
    activeProvider: z.string().optional()
  }),
  whatsapp: z.object({
    status: z.string(),
    ready: z.boolean(),
    sessionSaved: z.boolean().optional()
  }).optional(),
  analytics: z.object({
    totalConversations: z.number().default(0),
    totalMessagesProcessed: z.number().default(0),
    averageLatencyMs: z.number().default(0),
    groundingAccuracy: z.string().optional()
  }).optional(),
  escalations: z.object({
    openTickets: z.number().default(0),
    resolvedTickets: z.number().default(0),
    recentTickets: z.array(TicketSchema).optional().default([])
  }).optional()
});

export const SystemStatusResponseSchema = z.object({
  success: z.boolean(),
  data: SystemStatusDataSchema
});

export type SystemStatusData = z.infer<typeof SystemStatusDataSchema>;
