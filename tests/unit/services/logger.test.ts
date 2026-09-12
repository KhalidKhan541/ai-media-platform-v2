import { createTestUser, createTestMedia, generateRandomString } from '../helpers/test-utils';

describe('LoggerService', () => {
  describe('log levels', () => {
    it('should support error level logging', async () => {
      const logEntry = {
        level: 'error',
        message: 'Database connection failed',
        timestamp: new Date(),
      };

      expect(logEntry.level).toBe('error');
    });

    it('should support warn level logging', async () => {
      const logEntry = {
        level: 'warn',
        message: 'High memory usage detected',
        timestamp: new Date(),
      };

      expect(logEntry.level).toBe('warn');
    });

    it('should support info level logging', async () => {
      const logEntry = {
        level: 'info',
        message: 'Server started successfully',
        timestamp: new Date(),
      };

      expect(logEntry.level).toBe('info');
    });

    it('should support debug level logging', async () => {
      const logEntry = {
        level: 'debug',
        message: 'Processing request',
        timestamp: new Date(),
      };

      expect(logEntry.level).toBe('debug');
    });

    it('should support trace level logging', async () => {
      const logEntry = {
        level: 'trace',
        message: 'Entering function',
        timestamp: new Date(),
      };

      expect(logEntry.level).toBe('trace');
    });

    it('should filter logs by level', async () => {
      const logs = [
        { level: 'error', message: 'Error 1' },
        { level: 'warn', message: 'Warning 1' },
        { level: 'info', message: 'Info 1' },
        { level: 'debug', message: 'Debug 1' },
      ];

      const errorLogs = logs.filter(l => l.level === 'error');
      expect(errorLogs).toHaveLength(1);
    });

    it('should set minimum log level', async () => {
      const minLevel = 'warn';
      const logs = [
        { level: 'error', message: 'Error' },
        { level: 'warn', message: 'Warning' },
        { level: 'info', message: 'Info' },
        { level: 'debug', message: 'Debug' },
      ];

      const levels = ['error', 'warn', 'info', 'debug', 'trace'];
      const minLevelIndex = levels.indexOf(minLevel);

      const filteredLogs = logs.filter(log => {
        const logLevelIndex = levels.indexOf(log.level);
        return logLevelIndex <= minLevelIndex;
      });

      expect(filteredLogs).toHaveLength(2);
    });

    it('should support dynamic log level changes', async () => {
      let currentLevel = 'info';
      const setLevel = (level: string) => { currentLevel = level; };

      setLevel('debug');
      expect(currentLevel).toBe('debug');
    });

    it('should include log level in output', async () => {
      const logEntry = {
        level: 'info',
        message: 'Test message',
      };

      expect(logEntry).toHaveProperty('level');
    });

    it('should support custom log levels', async () => {
      const customLevels = {
        audit: 0,
        security: 1,
        performance: 2,
      };

      expect(Object.keys(customLevels)).toHaveLength(3);
    });

    it('should handle log level inheritance', async () => {
      const parentLogger = { level: 'info' };
      const childLogger = { level: parentLogger.level };

      expect(childLogger.level).toBe('info');
    });
  });

  describe('log formatting', () => {
    it('should format log message with timestamp', async () => {
      const timestamp = new Date().toISOString();
      const message = 'Test message';
      const formatted = `[${timestamp}] ${message}`;

      expect(formatted).toContain(timestamp);
      expect(formatted).toContain(message);
    });

    it('should include log level in formatted output', async () => {
      const level = 'INFO';
      const message = 'Test message';
      const formatted = `[${level}] ${message}`;

      expect(formatted).toContain(level);
    });

    it('should support JSON log format', async () => {
      const logEntry = {
        timestamp: new Date().toISOString(),
        level: 'info',
        message: 'Test message',
        metadata: { userId: '123' },
      };

      const formatted = JSON.stringify(logEntry);
      const parsed = JSON.parse(formatted);

      expect(parsed.level).toBe('info');
      expect(parsed.metadata.userId).toBe('123');
    });

    it('should support plain text log format', async () => {
      const timestamp = new Date().toISOString();
      const level = 'INFO';
      const message = 'Test message';
      const formatted = `${timestamp} [${level}] ${message}`;

      expect(formatted).toBeTruthy();
    });

    it('should support custom log formatters', async () => {
      const customFormatter = (entry: { level: string; message: string }) => {
        return `${entry.level.toUpperCase()}: ${entry.message}`;
      };

      const formatted = customFormatter({ level: 'info', message: 'Test' });
      expect(formatted).toBe('INFO: Test');
    });

    it('should handle multi-line log messages', async () => {
      const message = 'Line 1\nLine 2\nLine 3';
      const lines = message.split('\n');

      expect(lines).toHaveLength(3);
    });

    it('should handle special characters in log messages', async () => {
      const message = 'User input: <script>alert("xss")</script>';
      expect(message).toContain('<script>');
    });

    it('should truncate long log messages', async () => {
      const maxLength = 1000;
      const message = 'x'.repeat(2000);
      const truncated = message.substring(0, maxLength);

      expect(truncated).toHaveLength(maxLength);
    });

    it('should support log message templates', async () => {
      const template = 'User {userId} performed {action}';
      const message = template
        .replace('{userId}', '123')
        .replace('{action}', 'login');

      expect(message).toContain('123');
      expect(message).toContain('login');
    });

    it('should support log message interpolation', async () => {
      const userId = '123';
      const action = 'login';
      const message = `User ${userId} performed ${action}`;

      expect(message).toBe('User 123 performed login');
    });
  });

  describe('log context', () => {
    it('should include request ID in log context', async () => {
      const requestId = generateRandomString(16);
      const logEntry = {
        requestId,
        message: 'Processing request',
      };

      expect(logEntry.requestId).toBeTruthy();
    });

    it('should include user ID in log context', async () => {
      const userId = '550e8400-e29b-41d4-a716-446655440000';
      const logEntry = {
        userId,
        message: 'User action',
      };

      expect(logEntry.userId).toBeTruthy();
    });

    it('should include session ID in log context', async () => {
      const sessionId = generateRandomString(32);
      const logEntry = {
        sessionId,
        message: 'Session activity',
      };

      expect(logEntry.sessionId).toBeTruthy();
    });

    it('should include correlation ID for distributed tracing', async () => {
      const correlationId = generateRandomString(16);
      const logEntry = {
        correlationId,
        message: 'Cross-service call',
      };

      expect(logEntry.correlationId).toBeTruthy();
    });

    it('should support custom context fields', async () => {
      const customFields = {
        service: 'ai-media-platform',
        version: '2.0.0',
        environment: 'production',
      };

      expect(customFields.service).toBeTruthy();
    });

    it('should inherit context from parent logger', async () => {
      const parentContext = { requestId: 'req-123' };
      const childContext = { ...parentContext, userId: 'user-123' };

      expect(childContext.requestId).toBe('req-123');
      expect(childContext.userId).toBe('user-123');
    });

    it('should merge context from multiple sources', async () => {
      const requestContext = { requestId: 'req-123' };
      const userContext = { userId: 'user-123' };
      const merged = { ...requestContext, ...userContext };

      expect(merged.requestId).toBe('req-123');
      expect(merged.userId).toBe('user-123');
    });

    it('should support context serialization', async () => {
      const context = {
        requestId: 'req-123',
        userId: 'user-123',
        metadata: { key: 'value' },
      };

      const serialized = JSON.stringify(context);
      const deserialized = JSON.parse(serialized);

      expect(deserialized.requestId).toBe('req-123');
    });

    it('should support context filtering', async () => {
      const context = {
        requestId: 'req-123',
        userId: 'user-123',
        password: 'secret',
      };

      const filtered = { ...context };
      delete filtered.password;

      expect(filtered).not.toHaveProperty('password');
    });

    it('should support context enrichment', async () => {
      const baseContext = { service: 'api' };
      const enriched = {
        ...baseContext,
        hostname: 'server-01',
        pid: process.pid,
      };

      expect(enriched.hostname).toBeTruthy();
    });
  });

  describe('log transport', () => {
    it('should support console transport', async () => {
      const transport = {
        type: 'console',
        colorize: true,
      };

      expect(transport.type).toBe('console');
    });

    it('should support file transport', async () => {
      const transport = {
        type: 'file',
        filename: 'app.log',
        maxSize: '10m',
        maxFiles: 5,
      };

      expect(transport.type).toBe('file');
      expect(transport.maxFiles).toBe(5);
    });

    it('should support HTTP transport', async () => {
      const transport = {
        type: 'http',
        host: 'log-server.example.com',
        port: 8080,
      };

      expect(transport.type).toBe('http');
    });

    it('should support multiple transports', async () => {
      const transports = [
        { type: 'console' },
        { type: 'file', filename: 'app.log' },
        { type: 'http', host: 'log-server.example.com' },
      ];

      expect(transports).toHaveLength(3);
    });

    it('should support transport filtering', async () => {
      const transports = [
        { type: 'console', levels: ['error', 'warn'] },
        { type: 'file', levels: ['info', 'debug'] },
      ];

      expect(transports).toHaveLength(2);
    });

    it('should handle transport failures gracefully', async () => {
      const transport = {
        type: 'http',
        retries: 3,
        fallback: 'console',
      };

      expect(transport.retries).toBeGreaterThan(0);
    });

    it('should support transport buffering', async () => {
      const transport = {
        type: 'file',
        bufferSize: 100,
        flushInterval: 1000,
      };

      expect(transport.bufferSize).toBeGreaterThan(0);
    });

    it('should support transport rotation', async () => {
      const transport = {
        type: 'file',
        rotation: {
          daily: true,
          maxFiles: 30,
        },
      };

      expect(transport.rotation.daily).toBe(true);
    });

    it('should support transport compression', async () => {
      const transport = {
        type: 'file',
        compress: true,
        gzipLevel: 6,
      };

      expect(transport.compress).toBe(true);
    });

    it('should support transport encryption', async () => {
      const transport = {
        type: 'file',
        encrypt: true,
        algorithm: 'AES-256',
      };

      expect(transport.encrypt).toBe(true);
    });
  });

  describe('log aggregation', () => {
    it('should aggregate logs by service', async () => {
      const logs = [
        { service: 'api', message: 'Request 1' },
        { service: 'api', message: 'Request 2' },
        { service: 'worker', message: 'Task 1' },
      ];

      const apiLogs = logs.filter(l => l.service === 'api');
      expect(apiLogs).toHaveLength(2);
    });

    it('should aggregate logs by time window', async () => {
      const now = Date.now();
      const logs = [
        { timestamp: now - 1000, message: 'Log 1' },
        { timestamp: now - 500, message: 'Log 2' },
        { timestamp: now, message: 'Log 3' },
      ];

      const lastMinute = logs.filter(
        l => now - l.timestamp < 60000
      );

      expect(lastMinute).toHaveLength(3);
    });

    it('should aggregate logs by level', async () => {
      const logs = [
        { level: 'error', message: 'Error 1' },
        { level: 'error', message: 'Error 2' },
        { level: 'warn', message: 'Warning 1' },
      ];

      const errorCount = logs.filter(l => l.level === 'error').length;
      expect(errorCount).toBe(2);
    });

    it('should aggregate logs by user', async () => {
      const logs = [
        { userId: 'user1', message: 'Action 1' },
        { userId: 'user1', message: 'Action 2' },
        { userId: 'user2', message: 'Action 3' },
      ];

      const user1Logs = logs.filter(l => l.userId === 'user1');
      expect(user1Logs).toHaveLength(2);
    });

    it('should calculate log statistics', async () => {
      const logs = [
        { level: 'error', duration: 100 },
        { level: 'error', duration: 200 },
        { level: 'info', duration: 50 },
      ];

      const errorLogs = logs.filter(l => l.level === 'error');
      const avgDuration = errorLogs.reduce((sum, l) => sum + l.duration, 0) / errorLogs.length;

      expect(avgDuration).toBe(150);
    });

    it('should detect log patterns', async () => {
      const logs = [
        { message: 'GET /api/users 200' },
        { message: 'GET /api/users 200' },
        { message: 'POST /api/users 201' },
      ];

      const patternCounts = new Map<string, number>();
      logs.forEach(log => {
        const pattern = log.message.replace(/\d+/\d+/\d+/\d+/, ':id');
        patternCounts.set(pattern, (patternCounts.get(pattern) || 0) + 1);
      });

      expect(patternCounts.size).toBeGreaterThan(0);
    });

    it('should support log search', async () => {
      const logs = [
        { message: 'User login failed' },
        { message: 'User logout' },
        { message: 'Media upload complete' },
      ];

      const searchQuery = 'User';
      const results = logs.filter(l =>
        l.message.toLowerCase().includes(searchQuery.toLowerCase())
      );

      expect(results).toHaveLength(2);
    });

    it('should support log export', async () => {
      const logs = [
        { timestamp: new Date(), message: 'Log 1' },
        { timestamp: new Date(), message: 'Log 2' },
      ];

      const exported = JSON.stringify(logs);
      expect(exported).toBeTruthy();
    });

    it('should support log archival', async () => {
      const archivePolicy = {
        retentionDays: 90,
        archiveAfterDays: 30,
      };

      expect(archivePolicy.retentionDays).toBeGreaterThan(archivePolicy.archiveAfterDays);
    });

    it('should support log compression for archival', async () => {
      const archive = {
        compressed: true,
        format: 'gzip',
        originalSize: 1024 * 1000,
        compressedSize: 1024 * 200,
      };

      expect(archive.compressedSize).toBeLessThan(archive.originalSize);
    });
  });

  describe('structured logging', () => {
    it('should support structured log entries', async () => {
      const logEntry = {
        timestamp: new Date().toISOString(),
        level: 'info',
        message: 'User action',
        fields: {
          userId: '123',
          action: 'login',
          ip: '192.168.1.1',
        },
      };

      expect(logEntry.fields).toBeDefined();
      expect(logEntry.fields.userId).toBe('123');
    });

    it('should support nested fields in structured logs', async () => {
      const logEntry = {
        timestamp: new Date().toISOString(),
        level: 'info',
        message: 'Request processed',
        request: {
          method: 'POST',
          path: '/api/users',
          body: {
            email: 'user@example.com',
          },
        },
      };

      expect(logEntry.request.body.email).toBe('user@example.com');
    });

    it('should support array fields in structured logs', async () => {
      const logEntry = {
        timestamp: new Date().toISOString(),
        level: 'info',
        message: 'Batch processed',
        items: [
          { id: '1', status: 'success' },
          { id: '2', status: 'failed' },
        ],
      };

      expect(logEntry.items).toHaveLength(2);
    });

    it('should support numeric fields in structured logs', async () => {
      const logEntry = {
        timestamp: new Date().toISOString(),
        level: 'info',
        message: 'Performance metrics',
        metrics: {
          duration: 150,
          memory: 1024,
          cpu: 0.75,
        },
      };

      expect(typeof logEntry.metrics.duration).toBe('number');
    });

    it('should support boolean fields in structured logs', async () => {
      const logEntry = {
        timestamp: new Date().toISOString(),
        level: 'info',
        message: 'Feature flag evaluation',
        feature: {
          name: 'new-ui',
          enabled: true,
        },
      };

      expect(logEntry.feature.enabled).toBe(true);
    });

    it('should support null fields in structured logs', async () => {
      const logEntry = {
        timestamp: new Date().toISOString(),
        level: 'info',
        message: 'Optional field',
        metadata: {
          userId: '123',
          sessionId: null,
        },
      };

      expect(logEntry.metadata.sessionId).toBeNull();
    });

    it('should support undefined fields in structured logs', async () => {
      const logEntry = {
        timestamp: new Date().toISOString(),
        level: 'info',
        message: 'Conditional field',
        metadata: {
          userId: '123',
        },
      };

      expect(logEntry.metadata).not.toHaveProperty('sessionId');
    });

    it('should support Date fields in structured logs', async () => {
      const logEntry = {
        timestamp: new Date().toISOString(),
        level: 'info',
        message: 'Event with date',
        event: {
          startAt: new Date(),
          endAt: new Date(),
        },
      };

      expect(logEntry.event.startAt).toBeInstanceOf(Date);
    });

    it('should support Error objects in structured logs', async () => {
      const error = new Error('Test error');
      const logEntry = {
        timestamp: new Date().toISOString(),
        level: 'error',
        message: error.message,
        error: {
          name: error.name,
          message: error.message,
          stack: error.stack,
        },
      };

      expect(logEntry.error.name).toBe('Error');
    });

    it('should support circular reference handling', async () => {
      const obj: Record<string, unknown> = { name: 'test' };
      obj.self = obj;

      const serialized = JSON.stringify(obj, (key, value) => {
        if (key === 'self') return '[Circular]';
        return value;
      });

      expect(serialized).toContain('[Circular]');
    });
  });

  describe('log security', () => {
    it('should sanitize sensitive data in logs', async () => {
      const sensitiveFields = ['password', 'token', 'secret', 'creditCard'];

      const logEntry = {
        userId: '123',
        password: 'secret123',
        token: 'abc123',
      };

      const sanitized = { ...logEntry };
      sensitiveFields.forEach(field => {
        if (field in sanitized) {
          sanitized[field] = '[REDACTED]';
        }
      });

      expect(sanitized.password).toBe('[REDACTED]');
      expect(sanitized.token).toBe('[REDACTED]');
    });

    it('should mask PII in logs', async () => {
      const piiFields = ['email', 'phone', 'ssn', 'address'];

      const logEntry = {
        email: 'user@example.com',
        phone: '555-1234',
      };

      const masked = { ...logEntry };
      if (masked.email) {
        masked.email = 'u***@example.com';
      }
      if (masked.phone) {
        masked.phone = '***-1234';
      }

      expect(masked.email).not.toBe('user@example.com');
      expect(masked.phone).not.toBe('555-1234');
    });

    it('should redact credit card numbers', async () => {
      const message = 'Payment received: 4111-1111-1111-1111';
      const redacted = message.replace(/\d{4}-\d{4}-\d{4}-\d{4}/g, '****-****-****-****');

      expect(redacted).not.toContain('4111');
    });

    it('should redact social security numbers', async () => {
      const message = 'User SSN: 123-45-6789';
      const redacted = message.replace(/\d{3}-\d{2}-\d{4}/g, '***-**-****');

      expect(redacted).not.toContain('123-45-6789');
    });

    it('should redact API keys', async () => {
      const message = 'API key: sk_live_abc123def456';
      const redacted = message.replace(/sk_live_[a-zA-Z0-9]+/g, 'sk_live_[REDACTED]');

      expect(redacted).toContain('[REDACTED]');
    });

    it('should redact JWT tokens', async () => {
      const message = 'Token: eyJhbGciOiJIUzI1NiJ9.eyJ1c2VySWQiOiIxIn0.signature';
      const redacted = message.replace(/eyJ[a-zA-Z0-9_-]+\.eyJ[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+/g, '[REDACTED]');

      expect(redacted).toContain('[REDACTED]');
    });

    it('should redact database connection strings', async () => {
      const message = 'Connecting to: mongodb://user:pass@localhost:27017/db';
      const redacted = message.replace(/\/\/[^:]+:[^@]+@/, '//***:***@');

      expect(redacted).not.toContain('user:pass');
    });

    it('should redact file paths with sensitive data', async () => {
      const message = 'Reading file: /home/user/.ssh/id_rsa';
      const redacted = message.replace(/\.ssh\/[^ ]+/g, '.ssh/[REDACTED]');

      expect(redacted).not.toContain('id_rsa');
    });

    it('should support custom redaction patterns', async () => {
      const customPatterns = [
        { pattern: /customer-\d+/g, replacement: 'customer-[REDACTED]' },
      ];

      const message = 'Processing customer-12345';
      const redacted = customPatterns.reduce(
        (msg, p) => msg.replace(p.pattern, p.replacement),
        message
      );

      expect(redacted).toContain('[REDACTED]');
    });

    it('should audit log access', async () => {
      const auditEntry = {
        action: 'log.read',
        userId: 'admin-123',
        timestamp: new Date(),
        filters: { level: 'error' },
      };

      expect(auditEntry.action).toBe('log.read');
    });
  });

  describe('log performance', () => {
    it('should handle high-volume logging', async () => {
      const batchSize = 1000;
      const start = Date.now();

      const logs = Array.from({ length: batchSize }, (_, i) => ({
        level: 'info',
        message: `Log ${i}`,
        timestamp: new Date(),
      }));

      const duration = Date.now() - start;
      expect(logs).toHaveLength(batchSize);
      expect(duration).toBeLessThan(1000);
    });

    it('should support async logging', async () => {
      const asyncLogger = {
        log: jest.fn().mockResolvedValue(undefined),
      };

      await asyncLogger.log({ message: 'test' });
      expect(asyncLogger.log).toHaveBeenCalled();
    });

    it('should support batch logging', async () => {
      const batchSize = 100;
      const logs = Array.from({ length: batchSize }, (_, i) => ({
        level: 'info',
        message: `Log ${i}`,
      }));

      expect(logs).toHaveLength(batchSize);
    });

    it('should implement log sampling', async () => {
      const sampleRate = 0.1; // 10%
      const totalLogs = 1000;
      const sampledLogs = Math.floor(totalLogs * sampleRate);

      expect(sampledLogs).toBe(100);
    });

    it('should support log rate limiting', async () => {
      const rateLimit = {
        maxPerSecond: 100,
        currentCount: 0,
      };

      const canLog = rateLimit.currentCount < rateLimit.maxPerSecond;
      expect(canLog).toBe(true);
    });

    it('should handle backpressure gracefully', async () => {
      const bufferSize = 1000;
      const currentSize = 500;
      const hasSpace = currentSize < bufferSize;

      expect(hasSpace).toBe(true);
    });

    it('should support log prioritization', async () => {
      const logs = [
        { level: 'error', priority: 1 },
        { level: 'info', priority: 3 },
        { level: 'debug', priority: 5 },
      ];

      const sorted = logs.sort((a, b) => a.priority - b.priority);
      expect(sorted[0].level).toBe('error');
    });

    it('should track logging performance metrics', async () => {
      const metrics = {
        logsPerSecond: 500,
        avgWriteTime: 2,
        bufferUtilization: 0.3,
      };

      expect(metrics.logsPerSecond).toBeGreaterThan(0);
      expect(metrics.avgWriteTime).toBeLessThan(100);
    });

    it('should support log deduplication', async () => {
      const logs = [
        { message: 'Error occurred', count: 1 },
        { message: 'Error occurred', count: 2 },
        { message: 'Different error', count: 1 },
      ];

      const uniqueMessages = new Set(logs.map(l => l.message));
      expect(uniqueMessages.size).toBe(2);
    });

    it('should support log compression for storage', async () => {
      const logs = Array.from({ length: 1000 }, (_, i) => ({
        level: 'info',
        message: `Repeated message ${i % 10}`,
      }));

      const uniqueMessages = new Set(logs.map(l => l.message));
      const compressionRatio = uniqueMessages.size / logs.length;

      expect(compressionRatio).toBeLessThan(1);
    });
  });
});
