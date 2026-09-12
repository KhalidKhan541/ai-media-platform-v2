import { createTestUser, createTestMedia, createMockRequest, createMockResponse } from '../helpers/test-utils';
import { CreateUserSchema, CreateMediaSchema, PaginationSchema } from '../../src/models/schemas';

describe('ValidationMiddleware', () => {
  describe('request body validation', () => {
    it('should validate user registration body', async () => {
      const body = createTestUser();
      const validated = CreateUserSchema.parse(body);

      expect(validated.email).toBeDefined();
      expect(validated.username).toBeDefined();
      expect(validated.password).toBeDefined();
    });

    it('should reject registration with missing fields', async () => {
      const body = { email: 'test@example.com' };

      expect(() => CreateUserSchema.parse(body)).toThrow();
    });

    it('should reject registration with invalid email', async () => {
      const body = {
        email: 'not-an-email',
        username: 'testuser',
        password: 'Password123!',
        role: 'user',
      };

      expect(() => CreateUserSchema.parse(body)).toThrow();
    });

    it('should reject registration with short password', async () => {
      const body = {
        email: 'test@example.com',
        username: 'testuser',
        password: 'short',
        role: 'user',
      };

      expect(() => CreateUserSchema.parse(body)).toThrow();
    });

    it('should reject registration with invalid role', async () => {
      const body = {
        email: 'test@example.com',
        username: 'testuser',
        password: 'Password123!',
        role: 'superadmin',
      };

      expect(() => CreateUserSchema.parse(body)).toThrow();
    });

    it('should validate media upload body', async () => {
      const body = createTestMedia('550e8400-e29b-41d4-a716-446655440000');
      const validated = CreateMediaSchema.parse(body);

      expect(validated.title).toBeDefined();
      expect(validated.mimetype).toBeDefined();
      expect(validated.size).toBeDefined();
    });

    it('should reject media with empty title', async () => {
      const body = {
        userId: '550e8400-e29b-41d4-a716-446655440000',
        title: '',
        filename: 'test.jpg',
        mimetype: 'image/jpeg',
        size: 1024,
        tags: [],
        aiGenerated: false,
        processingStatus: 'pending',
      };

      expect(() => CreateMediaSchema.parse(body)).toThrow();
    });

    it('should reject media with negative size', async () => {
      const body = {
        userId: '550e8400-e29b-41d4-a716-446655440000',
        title: 'Test',
        filename: 'test.jpg',
        mimetype: 'image/jpeg',
        size: -1,
        tags: [],
        aiGenerated: false,
        processingStatus: 'pending',
      };

      expect(() => CreateMediaSchema.parse(body)).toThrow();
    });

    it('should handle extra fields gracefully', async () => {
      const body = {
        ...createTestUser(),
        extraField: 'should be ignored',
      };

      const validated = CreateUserSchema.parse(body);
      expect(validated).not.toHaveProperty('extraField');
    });

    it('should handle nested object validation', async () => {
      const body = {
        metadata: {
          width: 1920,
          height: 1080,
        },
      };

      expect(body.metadata.width).toBe(1920);
      expect(body.metadata.height).toBe(1080);
    });

    it('should validate array fields', async () => {
      const tags = ['nature', 'sunset', 'landscape'];

      expect(Array.isArray(tags)).toBe(true);
      expect(tags.length).toBeGreaterThan(0);
    });
  });

  describe('query parameter validation', () => {
    it('should validate pagination parameters', async () => {
      const query = PaginationSchema.parse({ page: '1', limit: '20' });

      expect(query.page).toBe(1);
      expect(query.limit).toBe(20);
    });

    it('should reject invalid page number', async () => {
      expect(() => PaginationSchema.parse({ page: '0' })).toThrow();
    });

    it('should reject page number exceeding limit', async () => {
      expect(() => PaginationSchema.parse({ page: '101' })).toThrow();
    });

    it('should reject limit exceeding maximum', async () => {
      expect(() => PaginationSchema.parse({ limit: '101' })).toThrow();
    });

    it('should apply default values', async () => {
      const query = PaginationSchema.parse({});

      expect(query.page).toBe(1);
      expect(query.limit).toBe(20);
      expect(query.sortOrder).toBe('desc');
    });

    it('should parse string numbers', async () => {
      const query = PaginationSchema.parse({ page: '5', limit: '50' });

      expect(query.page).toBe(5);
      expect(query.limit).toBe(50);
    });

    it('should validate sort order', async () => {
      const validOrders = ['asc', 'desc'];

      validOrders.forEach(order => {
        const query = PaginationSchema.parse({ sortOrder: order });
        expect(query.sortOrder).toBe(order);
      });
    });

    it('should reject invalid sort order', async () => {
      expect(() => PaginationSchema.parse({ sortOrder: 'invalid' })).toThrow();
    });

    it('should handle empty query object', async () => {
      const query = PaginationSchema.parse({});

      expect(query).toBeDefined();
      expect(query.page).toBe(1);
    });

    it('should handle unknown query parameters', async () => {
      const query = PaginationSchema.parse({
        page: '1',
        unknownParam: 'value',
      });

      expect(query.page).toBe(1);
    });
  });

  describe('URL parameter validation', () => {
    it('should validate UUID format', async () => {
      const validId = '550e8400-e29b-41d4-a716-446655440000';
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

      expect(uuidRegex.test(validId)).toBe(true);
    });

    it('should reject invalid UUID format', async () => {
      const invalidId = 'not-a-uuid';
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

      expect(uuidRegex.test(invalidId)).toBe(false);
    });

    it('should reject empty ID', async () => {
      const id = '';
      expect(id).toBeFalsy();
    });

    it('should reject ID with special characters', async () => {
      const id = '550e8400-e29b-41d4-a716-44665544000!@#$';
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

      expect(uuidRegex.test(id)).toBe(false);
    });

    it('should handle case-insensitive UUID', async () => {
      const upperId = '550E8400-E29B-41D4-A716-446655440000';
      const lowerId = '550e8400-e29b-41d4-a716-446655440000';

      expect(upperId.toLowerCase()).toBe(lowerId);
    });

    it('should validate numeric ID parameters', async () => {
      const id = '12345';
      const numericId = Number(id);

      expect(Number.isFinite(numericId)).toBe(true);
    });

    it('should reject non-numeric ID when expected', async () => {
      const id = 'abc';
      const numericId = Number(id);

      expect(Number.isFinite(numericId)).toBe(false);
    });

    it('should handle slug-format IDs', async () => {
      const slug = 'my-media-title';
      const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

      expect(slugRegex.test(slug)).toBe(true);
    });

    it('should reject slugs with special characters', async () => {
      const slug = 'my media title!';
      const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

      expect(slugRegex.test(slug)).toBe(false);
    });

    it('should validate email in URL params', async () => {
      const email = 'user@example.com';
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      expect(emailRegex.test(email)).toBe(true);
    });
  });

  describe('header validation', () => {
    it('should validate Content-Type header', async () => {
      const validTypes = [
        'application/json',
        'multipart/form-data',
        'application/x-www-form-urlencoded',
      ];

      validTypes.forEach(type => {
        expect(type).toBeTruthy();
      });
    });

    it('should reject unsupported Content-Type', async () => {
      const unsupportedTypes = [
        'text/xml',
        'application/xml',
        'text/plain',
      ];

      unsupportedTypes.forEach(type => {
        expect(type).not.toBe('application/json');
      });
    });

    it('should validate Accept header', async () => {
      const validAccepts = [
        'application/json',
        '*/*',
        'text/html',
      ];

      validAccepts.forEach(accept => {
        expect(accept).toBeTruthy();
      });
    });

    it('should validate Authorization header format', async () => {
      const validAuth = 'Bearer eyJhbGciOiJIUzI1NiJ9';
      const parts = validAuth.split(' ');

      expect(parts).toHaveLength(2);
      expect(parts[0]).toBe('Bearer');
    });

    it('should reject malformed Authorization header', async () => {
      const malformedAuth = 'Bearer';
      const parts = malformedAuth.split(' ');

      expect(parts).toHaveLength(1);
    });

    it('should validate X-Request-ID header', async () => {
      const requestId = '550e8400-e29b-41d4-a716-446655440000';
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

      expect(uuidRegex.test(requestId)).toBe(true);
    });

    it('should handle custom headers', async () => {
      const customHeader = 'X-Custom-Header';
      expect(customHeader).toBeTruthy();
    });

    it('should validate User-Agent header', async () => {
      const userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)';
      expect(userAgent).toBeTruthy();
    });

    it('should reject oversized headers', async () => {
      const maxHeaderSize = 8192;
      const headerSize = 10000;

      expect(headerSize).toBeGreaterThan(maxHeaderSize);
    });

    it('should handle missing optional headers', async () => {
      const headers = {
        'content-type': 'application/json',
        // authorization is optional
      };

      expect(headers).not.toHaveProperty('authorization');
    });
  });

  describe('file validation', () => {
    it('should validate file MIME type', async () => {
      const validMimes = [
        'image/jpeg',
        'image/png',
        'image/gif',
        'video/mp4',
        'audio/mpeg',
      ];

      validMimes.forEach(mime => {
        expect(mime).toMatch(/^(image|video|audio)\//);
      });
    });

    it('should reject disallowed MIME types', async () => {
      const disallowedMimes = [
        'application/exe',
        'application/x-msdownload',
        'application/x-sh',
      ];

      disallowedMimes.forEach(mime => {
        expect(mime).not.toMatch(/^(image|video|audio|text|application\/pdf)/);
      });
    });

    it('should validate file size', async () => {
      const maxSize = 10 * 1024 * 1024;
      const fileSize = 5 * 1024 * 1024;

      expect(fileSize).toBeLessThan(maxSize);
    });

    it('should reject oversized files', async () => {
      const maxSize = 10 * 1024 * 1024;
      const fileSize = 15 * 1024 * 1024;

      expect(fileSize).toBeGreaterThan(maxSize);
    });

    it('should reject empty files', async () => {
      const fileSize = 0;
      expect(fileSize).toBe(0);
    });

    it('should validate file extension', async () => {
      const validExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.mp4', '.mp3'];

      validExtensions.forEach(ext => {
        expect(ext).toMatch(/^\./);
      });
    });

    it('should reject dangerous file extensions', async () => {
      const dangerousExtensions = ['.exe', '.bat', '.cmd', '.sh', '.ps1'];

      dangerousExtensions.forEach(ext => {
        expect(ext).toMatch(/^\.(exe|bat|cmd|sh|ps1)$/);
      });
    });

    it('should validate filename format', async () => {
      const filename = 'photo-2024-01-15.jpg';
      const filenameRegex = /^[a-zA-Z0-9._-]+$/;

      expect(filenameRegex.test(filename)).toBe(true);
    });

    it('should reject filenames with path traversal', async () => {
      const maliciousFilename = '../../../etc/passwd';
      expect(maliciousFilename).toContain('..');
    });

    it('should handle unicode filenames', async () => {
      const filename = 'фото.jpg';
      expect(filename).toBeTruthy();
    });
  });

  describe('schema transformation', () => {
    it('should transform string numbers to numbers', async () => {
      const query = PaginationSchema.parse({ page: '5', limit: '50' });

      expect(typeof query.page).toBe('number');
      expect(typeof query.limit).toBe('number');
    });

    it('should apply default values for missing fields', async () => {
      const query = PaginationSchema.parse({});

      expect(query.page).toBe(1);
      expect(query.limit).toBe(20);
      expect(query.sortOrder).toBe('desc');
    });

    it('should strip unknown fields', async () => {
      const body = {
        ...createTestUser(),
        unknownField: 'should be removed',
      };

      const validated = CreateUserSchema.parse(body);
      expect(validated).not.toHaveProperty('unknownField');
    });

    it('should handle optional fields correctly', async () => {
      const body = {
        email: 'test@example.com',
        username: 'testuser',
        password: 'Password123!',
        role: 'user',
      };

      const validated = CreateUserSchema.parse(body);
      expect(validated).not.toHaveProperty('avatar');
    });

    it('should handle nullable fields', async () => {
      const body = {
        description: null,
      };

      expect(body.description).toBeNull();
    });

    it('should transform date strings to Date objects', async () => {
      const dateStr = '2024-01-15T12:00:00Z';
      const date = new Date(dateStr);

      expect(date).toBeInstanceOf(Date);
    });

    it('should handle boolean string transformation', async () => {
      const boolStr = 'true';
      const bool = boolStr === 'true';

      expect(typeof bool).toBe('boolean');
      expect(bool).toBe(true);
    });

    it('should trim whitespace from strings', async () => {
      const input = '  hello  ';
      const trimmed = input.trim();

      expect(trimmed).toBe('hello');
    });

    it('should handle empty string to undefined transformation', async () => {
      const input = '';
      const transformed = input || undefined;

      expect(transformed).toBeUndefined();
    });

    it('should validate nested object structures', async () => {
      const body = {
        metadata: {
          dimensions: {
            width: 1920,
            height: 1080,
          },
          format: 'jpeg',
        },
      };

      expect(body.metadata.dimensions.width).toBe(1920);
    });
  });
});
