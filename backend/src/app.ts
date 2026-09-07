import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { apiRouter } from './routes/api.router';
import { scalarDocsHandler } from './docs/scalarMiddleware';
import { ApiResponse } from './core/ApiResponse';
import { AppError } from './core/AppError';
import { logger } from './core/logger';

export function createApp(): express.Application {
  const app = express();

  // Middlewares
  app.use(cors());
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true }));

  // Request Logger (Ignore polling noise for clean terminal output)
  app.use((req: Request, _res: Response, next: NextFunction) => {
    if (req.url !== '/api/v1/whatsapp/status' && req.url !== '/health') {
      logger.debug(`${req.method} ${req.url}`);
    }
    next();
  });

  // Scalar API Documentation & Reference (Futuristic Dark UI)
  app.use('/reference', scalarDocsHandler);
  app.use('/docs', scalarDocsHandler);

  // Health check
  app.get('/health', (_req: Request, res: Response) => {
    ApiResponse.success(
      res,
      { status: 'HEALTHY', uptime: process.uptime() },
      'Server is up and healthy'
    );
  });

  // Root redirect to Scalar docs
  app.get('/', (_req: Request, res: Response) => {
    res.redirect('/reference');
  });

  // API v1 Routes
  app.use('/api/v1', apiRouter);

  // 404 Handler
  app.use((req: Request, res: Response) => {
    ApiResponse.error(res, `Endpoint ${req.method} ${req.originalUrl} tidak ditemukan`, 404);
  });

  // Global Centralized Error Handler
  app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
    if (err instanceof AppError) {
      logger.warn(`[AppError] ${err.statusCode} - ${err.message}`);
      return ApiResponse.error(res, err.message, err.statusCode);
    }

    logger.error(`[UnhandledError] ${err.message}`, err.stack);
    return ApiResponse.error(
      res,
      process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message,
      500
    );
  });

  return app;
}
