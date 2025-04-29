// src/utils/logger.ts
type LogLevel = 'DEBUG' | 'INFO' | 'WARN' | 'ERROR';

export class AppLogger {
  private category: string;
  private level: LogLevel;
  
  // 로그 레벨 우선순위 (낮을수록 더 중요)
  private static readonly LOG_LEVELS: Record<LogLevel, number> = {
    'DEBUG': 0,
    'INFO': 1,
    'WARN': 2,
    'ERROR': 3
  };
  
  constructor(category: string, level: LogLevel = 'INFO') {
    this.category = category;
    this.level = level;
  }
  
  private shouldLog(messageLevel: LogLevel): boolean {
    return AppLogger.LOG_LEVELS[messageLevel] >= AppLogger.LOG_LEVELS[this.level];
  }
  
  private formatMessage(message: string): string {
    return `[\${this.category}] \${message}`;
  }
  
  debug(message: string, ...args: any[]): void {
    if (this.shouldLog('DEBUG')) {
      console.debug(this.formatMessage(message), ...args);
    }
  }
  
  info(message: string, ...args: any[]): void {
    if (this.shouldLog('INFO')) {
      console.info(this.formatMessage(message), ...args);
    }
  }
  
  warn(message: string, ...args: any[]): void {
    if (this.shouldLog('WARN')) {
      console.warn(this.formatMessage(message), ...args);
    }
  }
  
  error(message: string, ...args: any[]): void {
    if (this.shouldLog('ERROR')) {
      console.error(this.formatMessage(message), ...args);
    }
  }
}