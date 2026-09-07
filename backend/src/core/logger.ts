type LogLevel = 'INFO' | 'WARN' | 'ERROR' | 'DEBUG';

class Logger {
  private format(level: LogLevel, message: string, meta?: unknown): string {
    const timestamp = new Date().toISOString();
    const metaStr = meta ? ` | ${typeof meta === 'object' ? JSON.stringify(meta) : meta}` : '';
    return `[${timestamp}] [${level}] ${message}${metaStr}`;
  }

  public info(message: string, meta?: unknown): void {
    console.log(`\x1b[32m${this.format('INFO', message, meta)}\x1b[0m`);
  }

  public warn(message: string, meta?: unknown): void {
    console.warn(`\x1b[33m${this.format('WARN', message, meta)}\x1b[0m`);
  }

  public error(message: string, meta?: unknown): void {
    console.error(`\x1b[31m${this.format('ERROR', message, meta)}\x1b[0m`);
  }

  public debug(message: string, meta?: unknown): void {
    if (process.env.NODE_ENV !== 'production') {
      console.log(`\x1b[36m${this.format('DEBUG', message, meta)}\x1b[0m`);
    }
  }
}

export const logger = new Logger();
