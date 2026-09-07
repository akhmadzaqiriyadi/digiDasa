import { Request, Response, NextFunction } from 'express';
import { whatsAppProvider } from './WhatsAppProvider';
import { ApiResponse } from '../../core/ApiResponse';
import { BadRequestError } from '../../core/AppError';
import { z } from 'zod';

const SendMessageSchema = z
  .object({
    targetNumber: z.string().min(8, 'Nomor tujuan minimal 8 digit'),
    message: z.string().optional(),
    text: z.string().optional()
  })
  .transform((data) => ({
    targetNumber: data.targetNumber,
    message: (data.message || data.text || '').trim()
  }))
  .refine((data) => data.message.length > 0, {
    message: 'Pesan tidak boleh kosong',
    path: ['message']
  });

export class WhatsAppController {
  public static getStatus(_req: Request, res: Response, next: NextFunction): void {
    try {
      const status = whatsAppProvider.getStatus();
      ApiResponse.success(res, status, 'Status koneksi WhatsApp');
    } catch (err) {
      next(err);
    }
  }

  public static connect(_req: Request, res: Response, next: NextFunction): void {
    try {
      whatsAppProvider.connect();
      ApiResponse.success(
        res,
        whatsAppProvider.getStatus(),
        'Inisialisasi koneksi WhatsApp dimulai. Silakan scan QR code jika belum terhubung.'
      );
    } catch (err) {
      next(err);
    }
  }

  public static async disconnect(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await whatsAppProvider.disconnect();
      ApiResponse.success(res, whatsAppProvider.getStatus(), 'Koneksi WhatsApp diputus');
    } catch (err) {
      next(err);
    }
  }

  public static async logout(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await whatsAppProvider.logout();
      ApiResponse.success(
        res,
        whatsAppProvider.getStatus(),
        'Sesi WhatsApp berhasil keluar (logout) dan kredensial lokal dibersihkan.'
      );
    } catch (err) {
      next(err);
    }
  }

  public static async sendTestMessage(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const parseResult = SendMessageSchema.safeParse(req.body);
      if (!parseResult.success) {
        throw new BadRequestError(parseResult.error.issues.map((i) => i.message).join(', '));
      }

      const { targetNumber, message } = parseResult.data;
      const sentMsg = await whatsAppProvider.sendManualMessage(targetNumber, message);

      const messageId = sentMsg?.id?._serialized || `msg_${Date.now()}`;
      const to = sentMsg?.to || targetNumber;
      const timestamp = sentMsg?.timestamp || Math.floor(Date.now() / 1000);

      ApiResponse.success(
        res,
        {
          id: messageId,
          to,
          timestamp
        },
        `Pesan berhasil dikirim ke ${targetNumber}`
      );
    } catch (err) {
      next(err);
    }
  }
}

