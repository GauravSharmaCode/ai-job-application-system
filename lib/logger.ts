import { prisma } from "./prisma";

export type LogLevel = "info" | "warn" | "error";

export interface LogContext {
  method?: string;
  url?: string;
  statusCode?: number;
  duration?: number;
  userAgent?: string;
  ip?: string;
  [key: string]: any;
}

class Logger {
  async log(level: LogLevel, message: string, context?: LogContext) {
    try {
      // Console log for development
      console.log(`[${level.toUpperCase()}] ${message}`, context ? JSON.stringify(context) : '');
      
      // Database log
      await prisma.log.create({
        data: {
          level,
          message,
          context: context || null,
        },
      });
    } catch (error) {
      console.error('Failed to write log:', error);
    }
  }

  info(message: string, context?: LogContext) {
    return this.log("info", message, context);
  }

  warn(message: string, context?: LogContext) {
    return this.log("warn", message, context);
  }

  error(message: string, context?: LogContext) {
    return this.log("error", message, context);
  }
}

export const logger = new Logger();