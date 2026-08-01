type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  data?: any;
}

class Logger {
  private level: LogLevel = (process.env.LOG_LEVEL as LogLevel) || 'info';
  private levels: Record<LogLevel, number> = {
    debug: 0,
    info: 1,
    warn: 2,
    error: 3,
  };

  private shouldLog(level: LogLevel): boolean {
    return this.levels[level] >= this.levels[this.level];
  }

  private formatEntry(level: LogLevel, message: string, data?: any): LogEntry {
    return {
      timestamp: new Date().toISOString(),
      level,
      message,
      ...(data && { data }),
    };
  }

  debug(message: string, data?: any) {
    if (this.shouldLog('debug')) {
      console.log(JSON.stringify(this.formatEntry('debug', message, data)));
    }
  }

  info(message: string, data?: any) {
    if (this.shouldLog('info')) {
      console.log(JSON.stringify(this.formatEntry('info', message, data)));
    }
  }

  warn(message: string, data?: any) {
    if (this.shouldLog('warn')) {
      console.warn(JSON.stringify(this.formatEntry('warn', message, data)));
    }
  }

  error(message: string, data?: any) {
    if (this.shouldLog('error')) {
      console.error(JSON.stringify(this.formatEntry('error', message, data)));
    }
  }
}

export const logger = new Logger();
