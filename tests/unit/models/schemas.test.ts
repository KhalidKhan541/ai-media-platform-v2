import { UserSchema, CreateUserSchema, LoginSchema, MediaSchema, CreateMediaSchema, AIJobSchema, CreateAIJobSchema, PaginationSchema, SearchSchema } from '../../src/models/schemas';
import { createTestUser, createTestMedia, createTestAIJob, expectToBeValidUUID, expectToBeValidEmail, expectToBeValidDate } from '../helpers/test-utils';

describe('UserSchema', () => {
  describe('valid user creation', () => {
    it('should validate a complete user object', () => {
      const userData = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        email: 'user@example.com',
        username: 'testuser',
        password: 'SecurePass123!',
        role: 'user' as const,
        avatar: 'https://example.com/avatar.jpg',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const result = UserSchema.parse(userData);
      expect(result.id).toBe(userData.id);
      expect(result.email).toBe(userData.email);
      expect(result.username).toBe(userData.username);
      expect(result.role).toBe('user');
    });

    it('should validate user without optional avatar', () => {
      const userData = {
        id: '550e8400-e29b-41d4-a716-446655440001',
        email: 'noavatar@example.com',
        username: 'noavatar',
        password: 'SecurePass123!',
        role: 'admin' as const,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const result = UserSchema.parse(userData);
      expect(result.avatar).toBeUndefined();
    });

    it('should accept all valid roles', () => {
      const roles = ['user', 'admin', 'moderator'] as const;

      roles.forEach(role => {
        const userData = {
          id: '550e8400-e29b-41d4-a716-446655440002',
          email: `${role}@example.com`,
          username: `${role}user`,
          password: 'SecurePass123!',
          role,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        const result = UserSchema.parse(userData);
        expect(result.role).toBe(role);
      });
    });
  });

  describe('invalid user creation', () => {
    it('should reject invalid email format', () => {
      const userData = {
        id: '550e8400-e29b-41d4-a716-446655440003',
        email: 'not-an-email',
        username: 'testuser',
        password: 'SecurePass123!',
        role: 'user',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      expect(() => UserSchema.parse(userData)).toThrow();
    });

    it('should reject username shorter than 3 characters', () => {
      const userData = {
        id: '550e8400-e29b-41d4-a716-446655440004',
        email: 'user@example.com',
        username: 'ab',
        password: 'SecurePass123!',
        role: 'user',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      expect(() => UserSchema.parse(userData)).toThrow();
    });

    it('should reject username longer than 30 characters', () => {
      const userData = {
        id: '550e8400-e29b-41d4-a716-446655440005',
        email: 'user@example.com',
        username: 'a'.repeat(31),
        password: 'SecurePass123!',
        role: 'user',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      expect(() => UserSchema.parse(userData)).toThrow();
    });

    it('should reject password shorter than 8 characters', () => {
      const userData = {
        id: '550e8400-e29b-41d4-a716-446655440006',
        email: 'user@example.com',
        username: 'testuser',
        password: 'short',
        role: 'user',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      expect(() => UserSchema.parse(userData)).toThrow();
    });

    it('should reject invalid role', () => {
      const userData = {
        id: '550e8400-e29b-41d4-a716-446655440007',
        email: 'user@example.com',
        username: 'testuser',
        password: 'SecurePass123!',
        role: 'superadmin',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      expect(() => UserSchema.parse(userData)).toThrow();
    });

    it('should reject invalid UUID for id', () => {
      const userData = {
        id: 'not-a-uuid',
        email: 'user@example.com',
        username: 'testuser',
        password: 'SecurePass123!',
        role: 'user',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      expect(() => UserSchema.parse(userData)).toThrow();
    });

    it('should reject invalid URL for avatar', () => {
      const userData = {
        id: '550e8400-e29b-41d4-a716-446655440008',
        email: 'user@example.com',
        username: 'testuser',
        password: 'SecurePass123!',
        role: 'user',
        avatar: 'not-a-url',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      expect(() => UserSchema.parse(userData)).toThrow();
    });
  });
});

describe('CreateUserSchema', () => {
  it('should create a valid user without id and timestamps', () => {
    const userData = {
      email: 'newuser@example.com',
      username: 'newuser',
      password: 'SecurePass123!',
      role: 'user' as const,
    };

    const result = CreateUserSchema.parse(userData);
    expect(result.email).toBe(userData.email);
    expect(result.username).toBe(userData.username);
  });

  it('should not require id field', () => {
    const userData = {
      email: 'user@example.com',
      username: 'testuser',
      password: 'SecurePass123!',
      role: 'user',
    };

    const result = CreateUserSchema.parse(userData);
    expect(result).not.toHaveProperty('id');
  });

  it('should not require timestamp fields', () => {
    const userData = {
      email: 'user@example.com',
      username: 'testuser',
      password: 'SecurePass123!',
      role: 'user',
    };

    const result = CreateUserSchema.parse(userData);
    expect(result).not.toHaveProperty('createdAt');
    expect(result).not.toHaveProperty('updatedAt');
  });
});

describe('LoginSchema', () => {
  it('should validate correct login credentials', () => {
    const loginData = {
      email: 'user@example.com',
      password: 'password123',
    };

    const result = LoginSchema.parse(loginData);
    expect(result.email).toBe(loginData.email);
    expect(result.password).toBe(loginData.password);
  });

  it('should reject invalid email', () => {
    const loginData = {
      email: 'invalid-email',
      password: 'password123',
    };

    expect(() => LoginSchema.parse(loginData)).toThrow();
  });

  it('should reject empty password', () => {
    const loginData = {
      email: 'user@example.com',
      password: '',
    };

    expect(() => LoginSchema.parse(loginData)).toThrow();
  });

  it('should accept any non-empty password', () => {
    const loginData = {
      email: 'user@example.com',
      password: 'a',
    };

    const result = LoginSchema.parse(loginData);
    expect(result.password).toBe('a');
  });
});

describe('MediaSchema', () => {
  const validMedia = {
    id: '550e8400-e29b-41d4-a716-446655440000',
    userId: '550e8400-e29b-41d4-a716-446655440001',
    title: 'Test Image',
    description: 'A test image for validation',
    filename: 'test.jpg',
    mimetype: 'image/jpeg',
    size: 1024 * 500,
    url: 'https://storage.example.com/media/test.jpg',
    thumbnailUrl: 'https://storage.example.com/media/thumb-test.jpg',
    tags: ['test', 'image'],
    aiGenerated: false,
    processingStatus: 'completed' as const,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  it('should validate a complete media object', () => {
    const result = MediaSchema.parse(validMedia);
    expect(result.id).toBe(validMedia.id);
    expect(result.title).toBe(validMedia.title);
    expect(result.processingStatus).toBe('completed');
  });

  it('should require title', () => {
    const { title, ...mediaWithoutTitle } = validMedia;
    expect(() => MediaSchema.parse(mediaWithoutTitle)).toThrow();
  });

  it('should require positive size', () => {
    expect(() => MediaSchema.parse({ ...validMedia, size: -1 })).toThrow();
    expect(() => MediaSchema.parse({ ...validMedia, size: 0 })).toThrow();
  });

  it('should require valid processing status', () => {
    expect(() => MediaSchema.parse({ ...validMedia, processingStatus: 'invalid' })).toThrow();
  });

  it('should accept all valid processing statuses', () => {
    const statuses = ['pending', 'processing', 'completed', 'failed'] as const;
    statuses.forEach(status => {
      const result = MediaSchema.parse({ ...validMedia, processingStatus: status });
      expect(result.processingStatus).toBe(status);
    });
  });

  it('should default tags to empty array', () => {
    const { tags, ...mediaWithoutTags } = validMedia;
    const result = MediaSchema.parse(mediaWithoutTags);
    expect(result.tags).toEqual([]);
  });

  it('should default aiGenerated to false', () => {
    const { aiGenerated, ...mediaWithoutAi } = validMedia;
    const result = MediaSchema.parse(mediaWithoutAi);
    expect(result.aiGenerated).toBe(false);
  });
});

describe('CreateMediaSchema', () => {
  it('should create media without derived fields', () => {
    const mediaData = {
      userId: '550e8400-e29b-41d4-a716-446655440000',
      title: 'New Media',
      filename: 'new.jpg',
      mimetype: 'image/jpeg',
      size: 1024,
      tags: [],
      aiGenerated: false,
      processingStatus: 'pending' as const,
    };

    const result = CreateMediaSchema.parse(mediaData);
    expect(result).not.toHaveProperty('id');
    expect(result).not.toHaveProperty('url');
    expect(result).not.toHaveProperty('createdAt');
  });
});

describe('AIJobSchema', () => {
  const validJob = {
    id: '550e8400-e29b-41d4-a716-446655440000',
    userId: '550e8400-e29b-41d4-a716-446655440001',
    mediaId: '550e8400-e29b-41d4-a716-446655440002',
    type: 'enhance' as const,
    status: 'queued' as const,
    input: { quality: 'high' },
    progress: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  it('should validate a complete AI job', () => {
    const result = AIJobSchema.parse(validJob);
    expect(result.type).toBe('enhance');
    expect(result.status).toBe('queued');
    expect(result.progress).toBe(0);
  });

  it('should accept all valid job types', () => {
    const types = ['enhance', 'transcribe', 'summarize', 'generate', 'analyze'] as const;
    types.forEach(type => {
      const result = AIJobSchema.parse({ ...validJob, type });
      expect(result.type).toBe(type);
    });
  });

  it('should accept all valid job statuses', () => {
    const statuses = ['queued', 'processing', 'completed', 'failed'] as const;
    statuses.forEach(status => {
      const result = AIJobSchema.parse({ ...validJob, status });
      expect(result.status).toBe(status);
    });
  });

  it('should validate progress range 0-100', () => {
    expect(AIJobSchema.parse({ ...validJob, progress: 0 }).progress).toBe(0);
    expect(AIJobSchema.parse({ ...validJob, progress: 50 }).progress).toBe(50);
    expect(AIJobSchema.parse({ ...validJob, progress: 100 }).progress).toBe(100);
    expect(() => AIJobSchema.parse({ ...validJob, progress: -1 })).toThrow();
    expect(() => AIJobSchema.parse({ ...validJob, progress: 101 })).toThrow();
  });

  it('should default progress to 0', () => {
    const { progress, ...jobWithoutProgress } = validJob;
    const result = AIJobSchema.parse(jobWithoutProgress);
    expect(result.progress).toBe(0);
  });
});

describe('PaginationSchema', () => {
  it('should apply default values', () => {
    const result = PaginationSchema.parse({});
    expect(result.page).toBe(1);
    expect(result.limit).toBe(20);
    expect(result.sortOrder).toBe('desc');
  });

  it('should parse string numbers from query params', () => {
    const result = PaginationSchema.parse({ page: '3', limit: '50' });
    expect(result.page).toBe(3);
    expect(result.limit).toBe(50);
  });

  it('should enforce minimum page of 1', () => {
    expect(() => PaginationSchema.parse({ page: 0 })).toThrow();
    expect(() => PaginationSchema.parse({ page: -1 })).toThrow();
  });

  it('should enforce limit range 1-100', () => {
    expect(() => PaginationSchema.parse({ limit: 0 })).toThrow();
    expect(() => PaginationSchema.parse({ limit: 101 })).toThrow();
    expect(PaginationSchema.parse({ limit: 1 }).limit).toBe(1);
    expect(PaginationSchema.parse({ limit: 100 }).limit).toBe(100);
  });

  it('should accept valid sort order', () => {
    expect(PaginationSchema.parse({ sortOrder: 'asc' }).sortOrder).toBe('asc');
    expect(PaginationSchema.parse({ sortOrder: 'desc' }).sortOrder).toBe('desc');
  });
});

describe('SearchSchema', () => {
  it('should require search query', () => {
    expect(() => SearchSchema.parse({})).toThrow();
  });

  it('should validate search with minimum query', () => {
    const result = SearchSchema.parse({ q: 'test' });
    expect(result.q).toBe('test');
    expect(result.page).toBe(1);
    expect(result.limit).toBe(20);
  });

  it('should accept optional tags array', () => {
    const result = SearchSchema.parse({ q: 'test', tags: ['image', 'video'] });
    expect(result.tags).toEqual(['image', 'video']);
  });

  it('should accept optional type filter', () => {
    const result = SearchSchema.parse({ q: 'test', type: 'image' });
    expect(result.type).toBe('image');
  });
});

describe('Schema Integration Tests', () => {
  it('should create test user that validates against CreateUserSchema', () => {
    const user = createTestUser();
    const result = CreateUserSchema.parse(user);
    expect(result.email).toBeDefined();
    expect(result.username).toBeDefined();
  });

  it('should create test media that validates against CreateMediaSchema', () => {
    const userId = '550e8400-e29b-41d4-a716-446655440000';
    const media = createTestMedia(userId);
    const result = CreateMediaSchema.parse(media);
    expect(result.userId).toBe(userId);
    expect(result.title).toBeDefined();
  });

  it('should create test AI job that validates against CreateAIJobSchema', () => {
    const userId = '550e8400-e29b-41d4-a716-446655440000';
    const mediaId = '550e8400-e29b-41d4-a716-446655440001';
    const job = createTestAIJob(userId, mediaId);
    const result = CreateAIJobSchema.parse(job);
    expect(result.userId).toBe(userId);
    expect(result.mediaId).toBe(mediaId);
  });

  it('should validate complete user lifecycle schemas', () => {
    const createUser = CreateUserSchema.parse(createTestUser());
    expectToBeValidEmail(createUser.email);

    const fullUser = UserSchema.parse({
      ...createUser,
      id: '550e8400-e29b-41d4-a716-446655440000',
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    expectToBeValidUUID(fullUser.id);
    expectToBeValidDate(fullUser.createdAt);
  });

  it('should validate media with all processing statuses through lifecycle', () => {
    const userId = '550e8400-e29b-41d4-a716-446655440000';
    const baseMedia = createTestMedia(userId);

    const statuses = ['pending', 'processing', 'completed', 'failed'] as const;
    statuses.forEach(status => {
      const media = CreateMediaSchema.parse({ ...baseMedia, processingStatus: status });
      expect(media.processingStatus).toBe(status);
    });
  });

  it('should validate AI job with all job types', () => {
    const userId = '550e8400-e29b-41d4-a716-446655440000';
    const mediaId = '550e8400-e29b-41d4-a716-446655440001';

    const types = ['enhance', 'transcribe', 'summarize', 'generate', 'analyze'] as const;
    types.forEach(type => {
      const job = createTestAIJob(userId, mediaId, { type });
      const result = CreateAIJobSchema.parse(job);
      expect(result.type).toBe(type);
    });
  });

  it('should validate pagination through search workflow', () => {
    const pagination = PaginationSchema.parse({ page: '2', limit: '10' });
    expect(pagination.page).toBe(2);
    expect(pagination.limit).toBe(10);

    const search = SearchSchema.parse({ q: 'artificial intelligence', page: '1', limit: '5' });
    expect(search.q).toBe('artificial intelligence');
    expect(search.page).toBe(1);
  });
});
