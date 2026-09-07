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
  status: z.enum(['DISCONNECTED', 'CONNECTING', 'QR_READY', 'CONNECTED', 'READY', 'UNKNOWN']).or(z.string()),
  ready: z.boolean(),
  pairingCode: z.string().nullable().optional(),
  qr: z.string().nullable().optional(),
  user: WhatsAppUserSchema
});

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
  kode: z.string(),
  nama: z.string(),
  akreditasi: z.string().optional().default('A (Unggul)'),
  kuota_kelas: z.number().optional().default(3),
  deskripsi: z.string(),
  keunggulan: z.array(z.string()).optional().default([]),
  peluang_karir: z.array(z.string()).optional().default([])
});

export const FaqItemSchema = z.object({
  id: z.string().optional(),
  q: z.string(),
  a: z.string(),
  order: z.number().optional()
});

export const CustomEntitySchema = z.object({
  id: z.string(),
  category: z.string(),
  title: z.string(),
  content: z.string(),
  isActive: z.boolean().default(true),
  order: z.number().default(0),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional()
});

export const SchoolInfoSchema = z.object({
  name: z.string(),
  address: z.string(),
  academic_year: z.string(),
  contact: z.object({
    phone: z.string().optional(),
    spmb_whatsapp: z.string().optional(),
    email: z.string().optional(),
    website: z.string().optional()
  }).optional()
});

export const SchoolKnowledgeSchema = z.object({
  school_info: SchoolInfoSchema,
  jurusans: z.array(JurusanItemSchema),
  faq_populer: z.array(FaqItemSchema),
  custom_entities: z.array(CustomEntitySchema).optional().default([])
});

export const SchoolKnowledgeResponseSchema = z.object({
  success: z.boolean(),
  data: SchoolKnowledgeSchema
});

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
