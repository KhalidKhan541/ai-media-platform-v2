import { z } from 'zod';

export const UserSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  username: z.string().min(3).max(30),
  password: z.string().min(8),
  role: z.enum(['user', 'admin', 'moderator']),
  avatar: z.string().url().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const CreateUserSchema = UserSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const MediaSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  title: z.string().min(1).max(200),
  description: z.string().max(2000).optional(),
  filename: z.string(),
  mimetype: z.string(),
  size: z.number().positive(),
  url: z.string().url(),
  thumbnailUrl: z.string().url().optional(),
  tags: z.array(z.string()).default([]),
  aiGenerated: z.boolean().default(false),
  aiPrompt: z.string().optional(),
  processingStatus: z.enum(['pending', 'processing', 'completed', 'failed']),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const CreateMediaSchema = MediaSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  url: true,
  thumbnailUrl: true,
});

export const AIJobSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  mediaId: z.string().uuid(),
  type: z.enum(['enhance', 'transcribe', 'summarize', 'generate', 'analyze']),
  status: z.enum(['queued', 'processing', 'completed', 'failed']),
  input: z.record(z.unknown()),
  output: z.record(z.unknown()).optional(),
  error: z.string().optional(),
  progress: z.number().min(0).max(100).default(0),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const CreateAIJobSchema = AIJobSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  output: true,
  error: true,
  progress: true,
});

export const PaginationSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export const SearchSchema = PaginationSchema.extend({
  q: z.string().min(1),
  tags: z.array(z.string()).optional(),
  type: z.string().optional(),
});
