type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'silent';

interface LoggerOptions {
  level?: LogLevel;
  prefix?: string;
  enabled?: boolean;
}

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
  silent: 4,
};

// Check if we're in development mode
const isDev = typeof process !== 'undefined'
  ? process.env.NODE_ENV === 'development'
  : true;

export class Logger {
  private level: LogLevel;
  private prefix: string;
  private enabled: boolean;

  constructor(options: LoggerOptions = {}) {
    // Default to 'warn' in production to only show important messages
    this.level = options.level || (isDev ? 'debug' : 'warn');
    this.prefix = options.prefix || '';
    this.enabled = options.enabled ?? isDev;
  }

  private shouldLog(level: LogLevel): boolean {
    if (!this.enabled) return false;
    return LOG_LEVELS[level] >= LOG_LEVELS[this.level];
  }

  private formatMessage(message: string): string {
    const prefix = this.prefix ? `[${this.prefix}] ` : '';
    return `${prefix}${message}`;
  }

  debug(message: string, ...args: unknown[]): void {
    if (this.shouldLog('debug')) {
      console.debug(this.formatMessage(message), ...args);
    }
  }

  info(message: string, ...args: unknown[]): void {
    if (this.shouldLog('info')) {
      console.info(this.formatMessage(message), ...args);
    }
  }

  warn(message: string, ...args: unknown[]): void {
    if (this.shouldLog('warn')) {
      console.warn(this.formatMessage(message), ...args);
    }
  }

  error(message: string, ...args: unknown[]): void {
    if (this.shouldLog('error')) {
      console.error(this.formatMessage(message), ...args);
    }
  }

  /** Create a child logger with a specific prefix */
  child(prefix: string): Logger {
    const fullPrefix = this.prefix ? `${this.prefix}:${prefix}` : prefix;
    return new Logger({ level: this.level, prefix: fullPrefix, enabled: this.enabled });
  }
}

/** Default logger instance - only logs warnings/errors in production */
export const logger = new Logger({ prefix: 'bun-eth' });
