type LogLevel = "debug" | "info" | "warn" | "error";

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: string;
  data?: unknown;
  error?: Error;
  requestId?: string;
  userId?: string;
}

interface LoggerOptions {
  context?: string;
  minLevel?: LogLevel;
  enableConsole?: boolean;
  enableFile?: boolean;
  enableRemote?: boolean;
}

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

class Logger {
  private options: Required<LoggerOptions>;
  private buffer: LogEntry[] = [];
  private flushInterval: ReturnType<typeof setInterval> | null = null;

  constructor(options: LoggerOptions = {}) {
    this.options = {
      context: options.context ?? "app",
      minLevel: options.minLevel ?? "info",
      enableConsole: options.enableConsole ?? true,
      enableFile: options.enableFile ?? false,
      enableRemote: options.enableRemote ?? false,
    };

    if (this.options.enableFile) {
      this.flushInterval = setInterval(() => this.flush(), 30000);
    }
  }

  private shouldLog(level: LogLevel): boolean {
    return LOG_LEVELS[level] >= LOG_LEVELS[this.options.minLevel];
  }

  private formatEntry(entry: LogEntry): string {
    const prefix = `[${entry.timestamp}] [${entry.level.toUpperCase()}]`;
    const context = entry.context ? ` [${entry.context}]` : "";
    const requestId = entry.requestId ? ` [req:${entry.requestId}]` : "";
    const userId = entry.userId ? ` [user:${entry.userId}]` : "";
    const base = `${prefix}${context}${requestId}${userId} ${entry.message}`;

    if (entry.data) {
      return `${base}\n${JSON.stringify(entry.data, null, 2)}`;
    }

    if (entry.error) {
      return `${base}\n${entry.error.stack || entry.error.message}`;
    }

    return base;
  }

  private createEntry(
    level: LogLevel,
    message: string,
    meta?: {
      data?: unknown;
      error?: Error;
      requestId?: string;
      userId?: string;
    }
  ): LogEntry {
    return {
      timestamp: new Date().toISOString(),
      level,
      message,
      context: this.options.context,
      data: meta?.data,
      error: meta?.error,
      requestId: meta?.requestId,
      userId: meta?.userId,
    };
  }

  private write(entry: LogEntry): void {
    if (!this.shouldLog(entry.level)) return;

    if (this.options.enableConsole) {
      const formatted = this.formatEntry(entry);
      switch (entry.level) {
        case "error":
          console.error(formatted);
          break;
        case "warn":
          console.warn(formatted);
          break;
        case "debug":
          console.debug(formatted);
          break;
        default:
          console.log(formatted);
      }
    }

    if (this.options.enableFile) {
      this.buffer.push(entry);
      if (this.buffer.length >= 100) {
        this.flush();
      }
    }
  }

  debug(
    message: string,
    meta?: { data?: unknown; requestId?: string; userId?: string }
  ): void {
    this.write(this.createEntry("debug", message, meta));
  }

  info(
    message: string,
    meta?: { data?: unknown; requestId?: string; userId?: string }
  ): void {
    this.write(this.createEntry("info", message, meta));
  }

  warn(
    message: string,
    meta?: { data?: unknown; requestId?: string; userId?: string }
  ): void {
    this.write(this.createEntry("warn", message, meta));
  }

  error(
    message: string,
    meta?: { error?: Error; data?: unknown; requestId?: string; userId?: string }
  ): void {
    this.write(this.createEntry("error", message, meta));
  }

  child(context: string): Logger {
    return new Logger({
      ...this.options,
      context: `${this.options.context}:${context}`,
    });
  }

  private async flush(): Promise<void> {
    if (this.buffer.length === 0) return;

    const entries = [...this.buffer];
    this.buffer = [];

    if (this.options.enableFile) {
      try {
        const fs = await import("fs/promises");
        const path = await import("path");
        const logDir = path.join(process.cwd(), "logs");
        const logFile = path.join(
          logDir,
          `${new Date().toISOString().split("T")[0]}.log`
        );

        await fs.mkdir(logDir, { recursive: true });
        const content =
          entries.map((e) => this.formatEntry(e)).join("\n") + "\n";
        await fs.appendFile(logFile, content, "utf-8");
      } catch {
        this.buffer.unshift(...entries);
      }
    }
  }

  setContext(context: string): void {
    this.options.context = context;
  }

  setLevel(level: LogLevel): void {
    this.options.minLevel = level;
  }

  async shutdown(): Promise<void> {
    if (this.flushInterval) {
      clearInterval(this.flushInterval);
    }
    await this.flush();
  }
}

export const logger = new Logger({
  context: "ai-media-platform",
  minLevel: process.env.NODE_ENV === "production" ? "info" : "debug",
  enableConsole: true,
  enableFile: process.env.NODE_ENV === "production",
});

export function createContextLogger(context: string): Logger {
  return logger.child(context);
}

export function createRequestLogger(requestId: string): {
  debug: (message: string, data?: unknown) => void;
  info: (message: string, data?: unknown) => void;
  warn: (message: string, data?: unknown) => void;
  error: (message: string, error?: Error, data?: unknown) => void;
} {
  return {
    debug: (message: string, data?: unknown) =>
      logger.debug(message, { data, requestId }),
    info: (message: string, data?: unknown) =>
      logger.info(message, { data, requestId }),
    warn: (message: string, data?: unknown) =>
      logger.warn(message, { data, requestId }),
    error: (message: string, error?: Error, data?: unknown) =>
      logger.error(message, { error, data, requestId }),
  };
}

export { Logger, type LogLevel, type LogEntry, type LoggerOptions };
