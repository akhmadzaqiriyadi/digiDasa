import { createApp } from './app';
import { env, APP_CONFIG } from './config/env';
import { logger } from './core/logger';

const app = createApp();

const server = app.listen(env.PORT, () => {
  console.log(`
\x1b[36m==================================================================\x1b[0m
\x1b[32m  🚀 ADAPTIVA-BOT Cognitive Core Engine (Enterprise TypeScript)\x1b[0m
\x1b[36m==================================================================\x1b[0m
  🏫 School         : \x1b[1m${APP_CONFIG.schoolName}\x1b[0m
  📅 Academic Year  : \x1b[1m${APP_CONFIG.academicYear}\x1b[0m
  🌐 Server Port    : \x1b[33mhttp://localhost:${env.PORT}\x1b[0m
  📖 \x1b[1mScalar API Docs\x1b[0m: \x1b[34mhttp://localhost:${env.PORT}/reference\x1b[0m
  💬 Chat API       : \x1b[34mhttp://localhost:${env.PORT}/api/v1/chat\x1b[0m
  📊 System Status  : \x1b[34mhttp://localhost:${env.PORT}/api/v1/status\x1b[0m
\x1b[36m==================================================================\x1b[0m
  `);
  logger.info(`Server initialized in ${env.NODE_ENV} mode.`);
});

// Graceful Shutdown
function handleShutdown(signal: string) {
  logger.info(`Received ${signal}. Shutting down gracefully...`);
  server.close(() => {
    logger.info('HTTP server closed.');
    process.exit(0);
  });

  setTimeout(() => {
    logger.error('Forced shutdown after timeout.');
    process.exit(1);
  }, 10000);
}

process.on('SIGTERM', () => handleShutdown('SIGTERM'));
process.on('SIGINT', () => handleShutdown('SIGINT'));
