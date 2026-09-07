import { Request, Response, NextFunction } from 'express';
import { whatsAppProvider } from './WhatsAppProvider';
import { ApiResponse } from '../../core/ApiResponse';
import { BadRequestError } from '../../core/AppError';
import { z } from 'zod';

const SendMessageSchema = z.object({
  targetNumber: z.string().min(8, 'Nomor tujuan minimal 8 digit'),
  message: z.string().min(1, 'Pesan tidak boleh kosong')
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

      ApiResponse.success(
        res,
        {
          id: sentMsg.id._serialized,
          to: sentMsg.to,
          timestamp: sentMsg.timestamp
        },
        `Pesan berhasil dikirim ke ${targetNumber}`
      );
    } catch (err) {
      next(err);
    }
  }
}

