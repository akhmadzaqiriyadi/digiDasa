import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  PORT: z
    .string()
    .default('3000')
    .transform((val) => parseInt(val, 10)),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  GEMINI_API_KEY: z.string().optional().default(''),
  PANITIA_WA_NUMBER: z.string().default('6281234567890'),
  PANITIA_NAME: z.string().default('Panitia SPMB SMK Negeri 1 Adiwerna'),
  ENABLE_WA_AUTOSTART: z
    .string()
    .optional()
    .default('false')
    .transform((val) => val === 'true'),
  SCHOOL_NAME: z.string().default('SMK Negeri 1 Adiwerna (STM ADB)'),
  ACADEMIC_YEAR: z.string().default('2026/2027')
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('❌ Invalid environment variables:', parsed.error.format());
  process.exit(1);
}

export const env = parsed.data;

export const APP_CONFIG = {
  schoolName: env.SCHOOL_NAME,
  academicYear: env.ACADEMIC_YEAR,
  panitiaWaNumber: env.PANITIA_WA_NUMBER,
  panitiaName: env.PANITIA_NAME,
  disclaimer: `Informasi ini resmi dan bersumber dari Surat Keputusan (SK) Panitia SPMB ${env.SCHOOL_NAME} Tahun Ajaran ${env.ACADEMIC_YEAR}.`
} as const;
