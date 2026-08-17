import { Injectable, LoggerService } from '@nestjs/common';

@Injectable()
export class StructuredLoggerService implements LoggerService {
  private formatLog(level: string, message: any, context?: string, ...optionalParams: any[]) {
    const entry = {
      timestamp: new Date().toISOString(),
      level,
      context: context || 'Application',
      message: typeof message === 'object' ? message : String(message),
      extra: optionalParams.length > 0 ? optionalParams : undefined,
    };
    return JSON.stringify(entry);
  }

  log(message: any, context?: string, ...optionalParams: any[]) {
    process.stdout.write(this.formatLog('INFO', message, context, ...optionalParams) + '\n');
  }

  error(message: any, trace?: string, context?: string, ...optionalParams: any[]) {
    const entry = {
      timestamp: new Date().toISOString(),
      level: 'ERROR',
      context: context || 'Application',
      message: typeof message === 'object' ? message : String(message),
      trace,
      extra: optionalParams.length > 0 ? optionalParams : undefined,
    };
    process.stderr.write(JSON.stringify(entry) + '\n');
  }

  warn(message: any, context?: string, ...optionalParams: any[]) {
    process.stdout.write(this.formatLog('WARN', message, context, ...optionalParams) + '\n');
  }

  debug?(message: any, context?: string, ...optionalParams: any[]) {
    if (process.env.NODE_ENV !== 'production') {
      process.stdout.write(this.formatLog('DEBUG', message, context, ...optionalParams) + '\n');
    }
  }

  verbose?(message: any, context?: string, ...optionalParams: any[]) {
    if (process.env.NODE_ENV !== 'production') {
      process.stdout.write(this.formatLog('VERBOSE', message, context, ...optionalParams) + '\n');
    }
  }
}
