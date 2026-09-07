import { PrismaClient } from '@prisma/client';
import { logger } from './logger';

declare global {
  var prismaClient: PrismaClient | undefined;
}

export const prisma =
  globalThis.prismaClient ||
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error']
  });

if (process.env.NODE_ENV !== 'production') {
  globalThis.prismaClient = prisma;
}

logger.info('[Prisma] Client instance initialized.');
