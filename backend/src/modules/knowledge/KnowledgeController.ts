import { Request, Response, NextFunction } from 'express';
import { prisma } from '../../core/prisma';
import { ApiResponse } from '../../core/ApiResponse';
import { BadRequestError, NotFoundError } from '../../core/AppError';
import { knowledgeRepository } from './KnowledgeRepository';
import { z } from 'zod';

const CreateEntitySchema = z.object({
  category: z.string().min(1, 'Kategori wajib diisi'),
  title: z.string().min(1, 'Judul entitas wajib diisi'),
  content: z.string().min(1, 'Konten pengetahuan wajib diisi'),
  tags: z.string().optional(),
  order: z.number().optional().default(0),
  isActive: z.boolean().optional().default(true)
});

const UpdateEntitySchema = CreateEntitySchema.partial();

const CreateJurusanSchema = z.object({
  kode: z.string().min(1, 'Kode jurusan wajib diisi').toUpperCase(),
  nama: z.string().min(1, 'Nama jurusan wajib diisi'),
  kuota: z.number().int().min(1, 'Kuota minimal 1'),
  deskripsi: z.string().min(1, 'Deskripsi wajib diisi'),
  prospekKerja: z.string().min(1, 'Prospek kerja wajib diisi')
});

const UpdateJurusanSchema = CreateJurusanSchema.partial();

const CreateFaqSchema = z.object({
  question: z.string().min(1, 'Pertanyaan wajib diisi'),
  answer: z.string().min(1, 'Jawaban wajib diisi'),
  category: z.string().optional().default('SPMB'),
  order: z.number().optional().default(0)
});

const UpdateFaqSchema = CreateFaqSchema.partial();

export class KnowledgeController {
  // ==========================================
  // DYNAMIC CUSTOM KNOWLEDGE ENTITIES (CRUD + PAGINATION + FILTER)
  // ==========================================

  public static async getEntities(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const page = Math.max(1, parseInt(req.query.page as string, 10) || 1);
      const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string, 10) || 10));
      const skip = (page - 1) * limit;

      const q = typeof req.query.q === 'string' ? req.query.q.trim() : undefined;
      const category =
        typeof req.query.category === 'string' ? req.query.category.trim() : undefined;
      const isActiveParam = req.query.isActive;
      const isActive =
        isActiveParam !== undefined ? isActiveParam === 'true' || isActiveParam === '1' : undefined;

      const where: Record<string, unknown> = {};

      if (category) {
        where.category = { equals: category, mode: 'insensitive' };
      }

      if (isActive !== undefined) {
        where.isActive = isActive;
      }

      if (q) {
        where.OR = [
          { title: { contains: q, mode: 'insensitive' } },
          { content: { contains: q, mode: 'insensitive' } },
          { tags: { contains: q, mode: 'insensitive' } }
        ];
      }

      const sortBy = typeof req.query.sortBy === 'string' ? req.query.sortBy : 'order';
      const sortOrder = req.query.sortOrder === 'desc' ? 'desc' : 'asc';

      const orderBy: Record<string, 'asc' | 'desc'>[] = [];
      if (sortBy === 'title') {
        orderBy.push({ title: sortOrder });
      } else if (sortBy === 'createdAt') {
        orderBy.push({ createdAt: sortOrder });
      } else {
        orderBy.push({ order: sortOrder });
        orderBy.push({ createdAt: 'desc' });
      }

      const [total, items] = await Promise.all([
        prisma.knowledgeEntity.count({ where }),
        prisma.knowledgeEntity.findMany({
          where,
          skip,
          take: limit,
          orderBy
        })
      ]);

      const totalPages = Math.ceil(total / limit) || 1;

      ApiResponse.success(
        res,
        {
          items,
          pagination: {
            total,
            page,
            limit,
            totalPages,
            hasNext: page < totalPages,
            hasPrev: page > 1
          }
        },
        'Daftar entitas pengetahuan dinamis berhasil dimuat'
      );
    } catch (err) {
      next(err);
    }
  }

  public static async getEntityById(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const id = String(req.params.id);
      const entity = await prisma.knowledgeEntity.findUnique({ where: { id } });
      if (!entity) {
        throw new NotFoundError(`Entitas pengetahuan dengan ID ${id} tidak ditemukan`);
      }
      ApiResponse.success(res, entity, 'Detail entitas pengetahuan ditemukan');
    } catch (err) {
      next(err);
    }
  }

  public static async createEntity(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const parseResult = CreateEntitySchema.safeParse(req.body);
      if (!parseResult.success) {
        const errorMsg = parseResult.error.issues.map((e) => e.message).join(', ');
        throw new BadRequestError(errorMsg);
      }

      const created = await prisma.knowledgeEntity.create({
        data: parseResult.data
      });

      // Synchronize live AI grounding cache
      await knowledgeRepository.syncFromDb();

      ApiResponse.success(
        res,
        created,
        'Entitas pengetahuan baru berhasil disimpan ke database',
        201
      );
    } catch (err) {
      next(err);
    }
  }

  public static async updateEntity(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = String(req.params.id);
      const parseResult = UpdateEntitySchema.safeParse(req.body);
      if (!parseResult.success) {
        const errorMsg = parseResult.error.issues.map((e) => e.message).join(', ');
        throw new BadRequestError(errorMsg);
      }

      const existing = await prisma.knowledgeEntity.findUnique({ where: { id } });
      if (!existing) {
        throw new NotFoundError(`Entitas pengetahuan dengan ID ${id} tidak ditemukan`);
      }

      const updated = await prisma.knowledgeEntity.update({
        where: { id },
        data: parseResult.data
      });

      // Synchronize live AI grounding cache
      await knowledgeRepository.syncFromDb();

      ApiResponse.success(res, updated, 'Entitas pengetahuan berhasil diperbarui di PostgreSQL');
    } catch (err) {
      next(err);
    }
  }

  public static async deleteEntity(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = String(req.params.id);
      const existing = await prisma.knowledgeEntity.findUnique({ where: { id } });
      if (!existing) {
        throw new NotFoundError(`Entitas pengetahuan dengan ID ${id} tidak ditemukan`);
      }

      await prisma.knowledgeEntity.delete({ where: { id } });

      // Synchronize live AI grounding cache
      await knowledgeRepository.syncFromDb();

      ApiResponse.success(res, { id }, `Entitas pengetahuan ${id} berhasil dihapus dari database`);
    } catch (err) {
      next(err);
    }
  }

  // ==========================================
  // JURUSAN / KONSENTRASI KEAHLIAN (CRUD + PAGINATION + FILTER)
  // ==========================================

  public static async getJurusan(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const page = Math.max(1, parseInt(req.query.page as string, 10) || 1);
      const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string, 10) || 10));
      const skip = (page - 1) * limit;
      const q = typeof req.query.q === 'string' ? req.query.q.trim() : undefined;

      const where: Record<string, unknown> = {};
      if (q) {
        where.OR = [
          { kode: { contains: q, mode: 'insensitive' } },
          { nama: { contains: q, mode: 'insensitive' } },
          { deskripsi: { contains: q, mode: 'insensitive' } },
          { prospekKerja: { contains: q, mode: 'insensitive' } }
        ];
      }

      const sortBy = typeof req.query.sortBy === 'string' ? req.query.sortBy : 'kode';
      const sortOrder = req.query.sortOrder === 'desc' ? 'desc' : 'asc';
      const orderBy: Record<string, 'asc' | 'desc'> = {};
      if (sortBy === 'kuota') {
        orderBy.kuota = sortOrder;
      } else if (sortBy === 'nama') {
        orderBy.nama = sortOrder;
      } else {
        orderBy.kode = sortOrder;
      }

      const [total, items] = await Promise.all([
        prisma.jurusan.count({ where }),
        prisma.jurusan.findMany({
          where,
          skip,
          take: limit,
          orderBy
        })
      ]);

      const totalPages = Math.ceil(total / limit) || 1;

      ApiResponse.success(
        res,
        {
          items,
          pagination: {
            total,
            page,
            limit,
            totalPages,
            hasNext: page < totalPages,
            hasPrev: page > 1
          }
        },
        'Daftar jurusan berhasil dimuat'
      );
    } catch (err) {
      next(err);
    }
  }

  public static async createJurusan(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const parseResult = CreateJurusanSchema.safeParse(req.body);
      if (!parseResult.success) {
        const errorMsg = parseResult.error.issues.map((e) => e.message).join(', ');
        throw new BadRequestError(errorMsg);
      }

      const existing = await prisma.jurusan.findUnique({ where: { kode: parseResult.data.kode } });
      if (existing) {
        throw new BadRequestError(`Jurusan dengan kode ${parseResult.data.kode} sudah terdaftar`);
      }

      const created = await prisma.jurusan.create({ data: parseResult.data });
      await knowledgeRepository.syncFromDb();

      ApiResponse.success(res, created, 'Jurusan baru berhasil didaftarkan', 201);
    } catch (err) {
      next(err);
    }
  }

  public static async updateJurusan(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const kode = String(req.params.kode).toUpperCase();
      const parseResult = UpdateJurusanSchema.safeParse(req.body);
      if (!parseResult.success) {
        const errorMsg = parseResult.error.issues.map((e) => e.message).join(', ');
        throw new BadRequestError(errorMsg);
      }

      const existing = await prisma.jurusan.findUnique({ where: { kode } });
      if (!existing) {
        throw new NotFoundError(`Jurusan dengan kode ${kode} tidak ditemukan`);
      }

      const updated = await prisma.jurusan.update({
        where: { kode },
        data: parseResult.data
      });

      await knowledgeRepository.syncFromDb();
      ApiResponse.success(res, updated, `Jurusan ${kode} berhasil diperbarui di PostgreSQL`);
    } catch (err) {
      next(err);
    }
  }

  public static async deleteJurusan(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const kode = String(req.params.kode).toUpperCase();
      const existing = await prisma.jurusan.findUnique({ where: { kode } });
      if (!existing) {
        throw new NotFoundError(`Jurusan dengan kode ${kode} tidak ditemukan`);
      }

      await prisma.jurusan.delete({ where: { kode } });
      await knowledgeRepository.syncFromDb();

      ApiResponse.success(res, { kode }, `Jurusan ${kode} berhasil dihapus dari database`);
    } catch (err) {
      next(err);
    }
  }

  // ==========================================
  // FAQ TERVERIFIKASI (CRUD + PAGINATION + FILTER)
  // ==========================================

  public static async getFaqs(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const page = Math.max(1, parseInt(req.query.page as string, 10) || 1);
      const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string, 10) || 10));
      const skip = (page - 1) * limit;
      const q = typeof req.query.q === 'string' ? req.query.q.trim() : undefined;
      const category =
        typeof req.query.category === 'string' ? req.query.category.trim() : undefined;

      const where: Record<string, unknown> = {};
      if (category) {
        where.category = { equals: category, mode: 'insensitive' };
      }
      if (q) {
        where.OR = [
          { question: { contains: q, mode: 'insensitive' } },
          { answer: { contains: q, mode: 'insensitive' } }
        ];
      }

      const sortBy = typeof req.query.sortBy === 'string' ? req.query.sortBy : 'order';
      const sortOrder = req.query.sortOrder === 'desc' ? 'desc' : 'asc';
      const orderBy: Record<string, 'asc' | 'desc'>[] = [];
      if (sortBy === 'createdAt') {
        orderBy.push({ createdAt: sortOrder });
      } else {
        orderBy.push({ order: sortOrder });
        orderBy.push({ createdAt: 'desc' });
      }

      const [total, items] = await Promise.all([
        prisma.faqItem.count({ where }),
        prisma.faqItem.findMany({
          where,
          skip,
          take: limit,
          orderBy
        })
      ]);

      const totalPages = Math.ceil(total / limit) || 1;

      ApiResponse.success(
        res,
        {
          items,
          pagination: {
            total,
            page,
            limit,
            totalPages,
            hasNext: page < totalPages,
            hasPrev: page > 1
          }
        },
        'Daftar FAQ berhasil dimuat'
      );
    } catch (err) {
      next(err);
    }
  }

  public static async createFaq(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const parseResult = CreateFaqSchema.safeParse(req.body);
      if (!parseResult.success) {
        const errorMsg = parseResult.error.issues.map((e) => e.message).join(', ');
        throw new BadRequestError(errorMsg);
      }

      const created = await prisma.faqItem.create({ data: parseResult.data });
      await knowledgeRepository.syncFromDb();

      ApiResponse.success(res, created, 'FAQ baru berhasil ditambahkan', 201);
    } catch (err) {
      next(err);
    }
  }

  public static async updateFaq(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = String(req.params.id);
      const parseResult = UpdateFaqSchema.safeParse(req.body);
      if (!parseResult.success) {
        const errorMsg = parseResult.error.issues.map((e) => e.message).join(', ');
        throw new BadRequestError(errorMsg);
      }

      const existing = await prisma.faqItem.findUnique({ where: { id } });
      if (!existing) {
        throw new NotFoundError(`FAQ dengan ID ${id} tidak ditemukan`);
      }

      const updated = await prisma.faqItem.update({
        where: { id },
        data: parseResult.data
      });

      await knowledgeRepository.syncFromDb();
      ApiResponse.success(res, updated, `FAQ ${id} berhasil diperbarui`);
    } catch (err) {
      next(err);
    }
  }

  public static async deleteFaq(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = String(req.params.id);
      const existing = await prisma.faqItem.findUnique({ where: { id } });
      if (!existing) {
        throw new NotFoundError(`FAQ dengan ID ${id} tidak ditemukan`);
      }

      await prisma.faqItem.delete({ where: { id } });
      await knowledgeRepository.syncFromDb();

      ApiResponse.success(res, { id }, `FAQ ${id} berhasil dihapus dari database`);
    } catch (err) {
      next(err);
    }
  }
}
