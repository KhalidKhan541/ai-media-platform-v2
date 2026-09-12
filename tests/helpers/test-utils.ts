import { v4 as uuidv4 } from 'uuid';
import { CreateUserSchema, CreateMediaSchema, CreateAIJobSchema } from '../models/schemas';

export function createTestUser(overrides: Partial<CreateUserSchema> = {}): CreateUserSchema {
  return {
    email: `test-${uuidv4().slice(0, 8)}@example.com`,
    username: `user-${uuidv4().slice(0, 8)}`,
    password: 'TestPass123!',
    role: 'user',
    ...overrides,
  };
}

export function createTestMedia(userId: string, overrides: Partial<CreateMediaSchema> = {}): CreateMediaSchema {
  return {
    userId,
    title: `Test Media ${uuidv4().slice(0, 8)}`,
    description: 'A test media file for unit testing',
    filename: `test-${Date.now()}.jpg`,
    mimetype: 'image/jpeg',
    size: 1024 * 100,
    tags: ['test', 'sample'],
    aiGenerated: false,
    processingStatus: 'pending',
    ...overrides,
  };
}

export function createTestAIJob(userId: string, mediaId: string, overrides: Partial<CreateAIJobSchema> = {}): CreateAIJobSchema {
  return {
    userId,
    mediaId,
    type: 'enhance',
    status: 'queued',
    input: { quality: 'high', format: 'jpeg' },
    ...overrides,
  };
}

export function createMockRequest(overrides: Record<string, unknown> = {}) {
  return {
    body: {},
    params: {},
    query: {},
    headers: {},
    user: null,
    file: null,
    ...overrides,
  } as any;
}

export function createMockResponse() {
  const res: any = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
    send: jest.fn().mockReturnThis(),
    sendFile: jest.fn().mockReturnThis(),
    redirect: jest.fn().mockReturnThis(),
    cookie: jest.fn().mockReturnThis(),
    clearCookie: jest.fn().mockReturnThis(),
    header: jest.fn().mockReturnThis(),
    set: jest.fn().mockReturnThis(),
  };
  return res;
}

export function createMockNext() {
  return jest.fn();
}

export const TEST_CONFIG = {
  JWT_SECRET: 'test-secret-key-for-testing-only',
  JWT_EXPIRES_IN: '1h',
  MONGODB_URI: 'mongodb://localhost:27017/test-db',
  REDIS_URL: 'redis://localhost:6379',
  UPLOAD_DIR: './test-uploads',
  MAX_FILE_SIZE: 10 * 1024 * 1024,
  AI_API_KEY: 'test-ai-api-key',
} as const;

export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export function generateRandomString(length: number): string {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export function expectToBeValidUUID(value: string): void {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  expect(uuidRegex.test(value)).toBe(true);
}

export function expectToBeValidEmail(value: string): void {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  expect(emailRegex.test(value)).toBe(true);
}

export function expectToBeValidDate(value: string | Date): void {
  const date = new Date(value);
  expect(date.getTime()).not.toBeNaN();
}

export function expectToMatchSchema<T>(data: unknown, schema: { parse: (data: unknown) => T }): T {
  return schema.parse(data);
}
