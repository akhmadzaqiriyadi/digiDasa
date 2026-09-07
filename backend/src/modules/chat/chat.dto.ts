import { z } from 'zod';

export const ChatMessageSchema = z.object({
  message: z.string().min(1, 'Pesan tidak boleh kosong').max(1000, 'Pesan maksimal 1000 karakter'),
  sender: z.string().optional().default('Web User'),
  history: z
    .array(
      z.object({
        sender: z.enum(['user', 'bot']),
        message: z.string(),
        timestamp: z.string()
      })
    )
    .optional()
    .default([])
});

export type ChatMessageDto = z.infer<typeof ChatMessageSchema>;

export const UpdateKnowledgeSchema = z.object({
  school_info: z
    .object({
      name: z.string().optional(),
      address: z.string().optional(),
      academic_year: z.string().optional(),
      contact: z
        .object({
          phone: z.string().optional(),
          spmb_whatsapp: z.string().optional(),
          email: z.string().optional(),
          website: z.string().optional()
        })
        .optional(),
      last_updated: z.string().optional(),
      sk_number: z.string().optional()
    })
    .optional(),
  jurusan: z.array(z.any()).optional(),
  biaya: z.record(z.string(), z.any()).optional(),
  jadwal_spmb_2026: z.array(z.any()).optional(),
  jalur_pendaftaran: z.array(z.any()).optional(),
  syarat_dokumen: z.array(z.string()).optional(),
  faq_populer: z.array(z.any()).optional()
});

export type UpdateKnowledgeDto = z.infer<typeof UpdateKnowledgeSchema>;
