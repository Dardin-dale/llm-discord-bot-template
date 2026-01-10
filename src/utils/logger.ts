/**
 * Structured Logger
 *
 * Outputs JSON logs for easy CloudWatch querying.
 * Use this instead of console.log for production logging.
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LogContext {
  /** Command name if applicable */
  command?: string;
  /** User ID if applicable */
  userId?: string;
  /** Server/Guild ID if applicable */
  serverId?: string;
  /** Request/interaction ID for tracing */
  requestId?: string;
  /** Duration in milliseconds */
  durationMs?: number;
  /** Any additional context */
  [key: string]: unknown;
}

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: LogContext;
  error?: {
    name: string;
    message: string;
    stack?: string;
  };
}

class Logger {
  private defaultContext: LogContext = {};

  /**
   * Set default context that will be included in all logs
   */
  public setDefaultContext(context: LogContext): void {
    this.defaultContext = { ...this.defaultContext, ...context };
  }

  /**
   * Clear default context
   */
  public clearDefaultContext(): void {
    this.defaultContext = {};
  }

  /**
   * Log at debug level
   */
  public debug(message: string, context?: LogContext): void {
    this.log('debug', message, context);
  }

  /**
   * Log at info level
   */
  public info(message: string, context?: LogContext): void {
    this.log('info', message, context);
  }

  /**
   * Log at warn level
   */
  public warn(message: string, context?: LogContext): void {
    this.log('warn', message, context);
  }

  /**
   * Log at error level
   */
  public error(message: string, error?: Error, context?: LogContext): void {
    this.log('error', message, context, error);
  }

  /**
   * Log command execution
   */
  public command(
    commandName: string,
    action: 'start' | 'complete' | 'error',
    context?: LogContext & { durationMs?: number }
  ): void {
    const message = `Command ${commandName} ${action}`;
    this.info(message, { command: commandName, ...context });
  }

  /**
   * Create a child logger with additional default context
   */
  public child(context: LogContext): Logger {
    const child = new Logger();
    child.defaultContext = { ...this.defaultContext, ...context };
    return child;
  }

  /**
   * Internal log method
   */
  private log(
    level: LogLevel,
    message: string,
    context?: LogContext,
    error?: Error
  ): void {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
    };

    // Merge contexts
    const mergedContext = { ...this.defaultContext, ...context };
    if (Object.keys(mergedContext).length > 0) {
      entry.context = mergedContext;
    }

    // Add error details if present
    if (error) {
      entry.error = {
        name: error.name,
        message: error.message,
        stack: error.stack,
      };
    }

    // Output as JSON
    const output = JSON.stringify(entry);

    switch (level) {
      case 'debug':
        console.debug(output);
        break;
      case 'info':
        console.info(output);
        break;
      case 'warn':
        console.warn(output);
        break;
      case 'error':
        console.error(output);
        break;
    }
  }
}

// Singleton instance
export const logger = new Logger();

/**
 * Create a request-scoped logger
 */
export function createRequestLogger(requestId: string, context?: LogContext): Logger {
  return logger.child({ requestId, ...context });
}
