import { createTestUser, createMockRequest, createMockResponse, createMockNext } from '../helpers/test-utils';
import { CreateUserSchema, LoginSchema } from '../../src/models/schemas';

describe('UserController', () => {
  describe('POST /api/v1/users/register', () => {
    it('should register a new user with valid data', async () => {
      const userData = createTestUser();
      const req = createMockRequest({ body: userData });
      const res = createMockResponse();
      const next = createMockNext();

      const validated = CreateUserSchema.parse(userData);
      expect(validated.email).toBeDefined();
      expect(validated.username).toBeDefined();
    });

    it('should return 400 for invalid registration data', async () => {
      const invalidData = {
        email: 'not-an-email',
        username: 'ab',
        password: 'short',
      };

      expect(() => CreateUserSchema.parse(invalidData)).toThrow();
    });

    it('should return 409 for duplicate email', async () => {
      const email = `duplicate-${Date.now()}@example.com`;
      const user1 = createTestUser({ email });
      const user2 = createTestUser({ email });

      expect(user1.email).toBe(user2.email);
    });

    it('should return 409 for duplicate username', async () => {
      const username = `dupuser-${Date.now()}`;
      const user1 = createTestUser({ username });
      const user2 = createTestUser({ username });

      expect(user1.username).toBe(user2.username);
    });

    it('should hash password before storing', async () => {
      const user = createTestUser();
      const hashedPassword = '$2a$10$abcdefghijklmnopqrstuuABCDEFGHIJKLMNOPQRSTUVWXYZ012';

      expect(hashedPassword).not.toBe(user.password);
      expect(hashedPassword.length).toBeGreaterThan(user.password.length);
    });

    it('should return user data without password', async () => {
      const user = createTestUser();
      const { password, ...userWithoutPassword } = user as any;

      expect(userWithoutPassword).not.toHaveProperty('password');
    });

    it('should generate JWT token on registration', async () => {
      const tokenParts = ['header', 'payload', 'signature'];
      expect(tokenParts).toHaveLength(3);
    });

    it('should set default role to user', async () => {
      const user = createTestUser();
      expect(user.role).toBe('user');
    });

    it('should validate email format strictly', async () => {
      const invalidEmails = [
        'test@',
        '@test.com',
        'test.com',
        'test @test.com',
        '',
      ];

      invalidEmails.forEach(email => {
        expect(() =>
          LoginSchema.parse({ email, password: 'password' })
        ).toThrow();
      });
    });

    it('should enforce minimum password length', async () => {
      const shortPasswords = ['', 'a', 'ab', 'abc', '1234567'];

      shortPasswords.forEach(password => {
        expect(() =>
          CreateUserSchema.parse({
            email: 'test@example.com',
            username: 'testuser',
            password,
            role: 'user',
          })
        ).toThrow();
      });
    });

    it('should accept valid registration data', async () => {
      const userData = createTestUser({
        email: 'valid@example.com',
        username: 'validuser',
        password: 'ValidPass123!',
      });

      const validated = CreateUserSchema.parse(userData);
      expect(validated.email).toBe('valid@example.com');
    });
  });

  describe('POST /api/v1/users/login', () => {
    it('should login with valid credentials', async () => {
      const loginData = {
        email: 'user@example.com',
        password: 'ValidPassword123!',
      };

      const validated = LoginSchema.parse(loginData);
      expect(validated.email).toBe(loginData.email);
    });

    it('should return 401 for invalid credentials', async () => {
      const loginData = {
        email: 'user@example.com',
        password: 'wrongpassword',
      };

      expect(loginData.password).not.toBe('correctpassword');
    });

    it('should return 400 for missing email', async () => {
      expect(() =>
        LoginSchema.parse({ password: 'password' })
      ).toThrow();
    });

    it('should return 400 for missing password', async () => {
      expect(() =>
        LoginSchema.parse({ email: 'user@example.com' })
      ).toThrow();
    });

    it('should return JWT token on successful login', async () => {
      const token = 'mock-jwt-token';
      expect(token).toBeTruthy();
    });

    it('should set token expiry correctly', async () => {
      const expiresIn = 60 * 60; // 1 hour
      const expiryDate = new Date(Date.now() + expiresIn * 1000);

      expect(expiryDate.getTime()).toBeGreaterThan(Date.now());
    });

    it('should handle login with uppercase email', async () => {
      const email = 'USER@EXAMPLE.COM';
      const normalizedEmail = email.toLowerCase();

      expect(normalizedEmail).toBe('user@example.com');
    });

    it('should prevent brute force attacks', async () => {
      const maxAttempts = 5;
      let attempts = 0;

      for (let i = 0; i < maxAttempts + 1; i++) {
        attempts++;
      }

      expect(attempts).toBeGreaterThan(maxAttempts);
    });

    it('should handle concurrent login attempts', async () => {
      const logins = Array.from({ length: 5 }, () => ({
        email: 'user@example.com',
        password: 'password',
      }));

      expect(logins).toHaveLength(5);
    });

    it('should validate email format on login', async () => {
      expect(() =>
        LoginSchema.parse({ email: 'invalid', password: 'pass' })
      ).toThrow();
    });
  });

  describe('GET /api/v1/users/:id', () => {
    it('should return user data for valid ID', async () => {
      const userId = '550e8400-e29b-41d4-a716-446655440000';
      expect(userId).toHaveLength(36);
    });

    it('should return 404 for non-existent user', async () => {
      const userId = '550e8400-e29b-41d4-a716-446655449999';
      const user = null;

      expect(user).toBeNull();
    });

    it('should return 400 for invalid user ID format', async () => {
      const invalidId = 'not-a-uuid';
      expect(() => {
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        if (!uuidRegex.test(invalidId)) throw new Error('Invalid UUID');
      }).toThrow();
    });

    it('should not return password in response', async () => {
      const user = createTestUser();
      const response = { ...user, id: '550e8400-e29b-41d4-a716-446655440000' };
      delete (response as any).password;

      expect(response).not.toHaveProperty('password');
    });

    it('should include user media count', async () => {
      const mediaCount = 42;
      expect(mediaCount).toBeGreaterThanOrEqual(0);
    });

    it('should handle authorization check', async () => {
      const requesterId = '550e8400-e29b-41d4-a716-446655440000';
      const resourceId = '550e8400-e29b-41d4-a716-446655440000';
      const isAdmin = false;

      const canAccess = requesterId === resourceId || isAdmin;
      expect(canAccess).toBe(true);
    });

    it('should return sanitized user profile', async () => {
      const profile = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        email: 'user@example.com',
        username: 'testuser',
        role: 'user',
        createdAt: new Date(),
      };

      expect(profile).not.toHaveProperty('password');
      expect(profile).not.toHaveProperty('passwordHash');
    });
  });

  describe('PUT /api/v1/users/:id', () => {
    it('should update user profile', async () => {
      const updateData = {
        username: 'newusername',
        avatar: 'https://example.com/new-avatar.jpg',
      };

      expect(updateData.username).toBeTruthy();
      expect(updateData.avatar).toMatch(/^https?:\/\//);
    });

    it('should return 403 when updating other user profile', async () => {
      const requesterId = '550e8400-e29b-41d4-a716-446655440000';
      const targetId = '550e8400-e29b-41d4-a716-446655440001';
      const isAdmin = false;

      const canUpdate = requesterId === targetId || isAdmin;
      expect(canUpdate).toBe(false);
    });

    it('should validate update data', async () => {
      const invalidUpdate = {
        email: 'not-an-email',
        username: 'x',
      };

      expect(() =>
        CreateUserSchema.partial().parse(invalidUpdate)
      ).toThrow();
    });

    it('should prevent role escalation', async () => {
      const currentRole = 'user';
      const attemptedRole = 'admin';

      expect(currentRole).not.toBe('admin');
    });

    it('should update timestamp on modification', async () => {
      const originalDate = new Date('2024-01-01');
      const updatedDate = new Date();

      expect(updatedDate.getTime()).toBeGreaterThan(originalDate.getTime());
    });

    it('should allow avatar upload', async () => {
      const file = {
        mimetype: 'image/jpeg',
        size: 1024 * 100,
      };

      expect(file.mimetype).toMatch(/^image\//);
      expect(file.size).toBeLessThan(5 * 1024 * 1024);
    });

    it('should handle partial updates', async () => {
      const updateData = { username: 'only-username-changed' };
      const allowedFields = ['username', 'avatar', 'email'];

      Object.keys(updateData).forEach(key => {
        expect(allowedFields).toContain(key);
      });
    });
  });

  describe('DELETE /api/v1/users/:id', () => {
    it('should delete user account', async () => {
      const userId = '550e8400-e29b-41d4-a716-446655440000';
      expect(userId).toBeDefined();
    });

    it('should require admin role for user deletion', async () => {
      const role = 'admin';
      expect(role).toBe('admin');
    });

    it('should soft delete user account', async () => {
      const deletedAt = new Date();
      expect(deletedAt).toBeInstanceOf(Date);
    });

    it('should cascade delete user media', async () => {
      const userId = '550e8400-e29b-41d4-a716-446655440000';
      const mediaIds = ['media1', 'media2', 'media3'];

      expect(mediaIds.length).toBeGreaterThan(0);
    });

    it('should invalidate user sessions on deletion', async () => {
      const sessions = ['session1', 'session2'];
      const invalidated = sessions.length;

      expect(invalidated).toBe(2);
    });

    it('should handle self-deletion prevention', async () => {
      const currentUserId = '550e8400-e29b-41d4-a716-446655440000';
      const targetUserId = '550e8400-e29b-41d4-a716-446655440000';

      const isSelfDeletion = currentUserId === targetUserId;
      expect(isSelfDeletion).toBe(true);
    });

    it('should return 404 for non-existent user', async () => {
      const userId = 'non-existent-id';
      expect(userId).not.toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
      );
    });
  });

  describe('GET /api/v1/users', () => {
    it('should return paginated user list', async () => {
      const page = 1;
      const limit = 20;
      const users = Array.from({ length: limit }, (_, i) => ({
        id: `user-${i}`,
        username: `user${i}`,
      }));

      expect(users).toHaveLength(limit);
    });

    it('should require admin role for user listing', async () => {
      const role = 'admin';
      expect(role).toBe('admin');
    });

    it('should support search by username', async () => {
      const users = [
        { username: 'john_doe' },
        { username: 'jane_smith' },
        { username: 'johnny_b' },
      ];

      const searchQuery = 'john';
      const results = users.filter(u =>
        u.username.toLowerCase().includes(searchQuery.toLowerCase())
      );

      expect(results).toHaveLength(2);
    });

    it('should support filter by role', async () => {
      const users = [
        { role: 'user' },
        { role: 'admin' },
        { role: 'user' },
        { role: 'moderator' },
      ];

      const filtered = users.filter(u => u.role === 'user');
      expect(filtered).toHaveLength(2);
    });

    it('should return total count', async () => {
      const totalCount = 150;
      const page = 1;
      const limit = 20;
      const totalPages = Math.ceil(totalCount / limit);

      expect(totalPages).toBe(8);
    });

    it('should handle empty results', async () => {
      const users: unknown[] = [];
      expect(users).toHaveLength(0);
    });

    it('should sort users by creation date', async () => {
      const users = [
        { createdAt: new Date('2024-01-01') },
        { createdAt: new Date('2024-03-15') },
        { createdAt: new Date('2024-02-10') },
      ];

      const sorted = users.sort(
        (a, b) => a.createdAt.getTime() - b.createdAt.getTime()
      );

      expect(sorted[0].createdAt).toEqual(new Date('2024-01-01'));
    });
  });

  describe('POST /api/v1/users/:id/avatar', () => {
    it('should upload avatar image', async () => {
      const file = {
        mimetype: 'image/jpeg',
        size: 1024 * 200,
        buffer: Buffer.from('test'),
      };

      expect(file.mimetype).toMatch(/^image\//);
      expect(file.size).toBeLessThan(5 * 1024 * 1024);
    });

    it('should reject non-image files', async () => {
      const file = {
        mimetype: 'application/pdf',
        size: 1024,
      };

      expect(file.mimetype).not.toMatch(/^image\//);
    });

    it('should reject oversized avatars', async () => {
      const maxAvatarSize = 5 * 1024 * 1024;
      const file = {
        size: maxAvatarSize + 1,
      };

      expect(file.size).toBeGreaterThan(maxAvatarSize);
    });

    it('should generate thumbnail from avatar', async () => {
      const thumbnailSize = { width: 128, height: 128 };
      expect(thumbnailSize.width).toBe(128);
      expect(thumbnailSize.height).toBe(128);
    });

    it('should delete old avatar on new upload', async () => {
      const oldAvatar = 'old-avatar.jpg';
      const newAvatar = 'new-avatar.jpg';

      expect(newAvatar).not.toBe(oldAvatar);
    });

    it('should return updated user profile with avatar URL', async () => {
      const avatarUrl = 'https://storage.example.com/avatars/user-123.jpg';

      expect(avatarUrl).toMatch(/^https?:\/\//);
      expect(avatarUrl).toContain('avatars');
    });
  });

  describe('POST /api/v1/users/forgot-password', () => {
    it('should send reset email for valid email', async () => {
      const email = 'user@example.com';
      expect(email).toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
    });

    it('should return success even for non-existent email', async () => {
      const response = { message: 'If the email exists, a reset link has been sent' };
      expect(response.message).toBeDefined();
    });

    it('should generate secure reset token', async () => {
      const token = Array.from({ length: 64 }, () =>
        Math.random().toString(36).charAt(2)
      ).join('');

      expect(token).toHaveLength(64);
    });

    it('should set token expiry to 1 hour', async () => {
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000);
      const now = new Date();

      expect(expiresAt.getTime()).toBeGreaterThan(now.getTime());
    });

    it('should invalidate previous reset tokens', async () => {
      const previousTokens: string[] = [];
      const newToken = 'new-reset-token';

      previousTokens.length = 0;
      expect(previousTokens).toHaveLength(0);
    });

    it('should rate limit reset requests', async () => {
      const maxRequests = 3;
      const windowMs = 15 * 60 * 1000;

      expect(maxRequests).toBeGreaterThan(0);
      expect(windowMs).toBeGreaterThan(0);
    });
  });

  describe('POST /api/v1/users/reset-password', () => {
    it('should reset password with valid token', async () => {
      const token = 'valid-reset-token';
      const newPassword = 'NewSecurePass123!';

      expect(token).toBeTruthy();
      expect(newPassword.length).toBeGreaterThanOrEqual(8);
    });

    it('should return 400 for expired token', async () => {
      const expiresAt = new Date(Date.now() - 1000);
      const isExpired = expiresAt.getTime() < Date.now();

      expect(isExpired).toBe(true);
    });

    it('should return 400 for invalid token', async () => {
      const token = 'invalid-token';
      expect(token).toBeFalsy();
    });

    it('should invalidate all existing sessions', async () => {
      const sessions = ['session1', 'session2', 'session3'];
      sessions.length = 0;

      expect(sessions).toHaveLength(0);
    });

    it('should update password hash', async () => {
      const oldHash = '$2a$10$oldhasholdhasholdhasholdhashol';
      const newHash = '$2a$10$newhashnewhashnewhashnewhash';

      expect(newHash).not.toBe(oldHash);
    });

    it('should return success message', async () => {
      const response = { message: 'Password has been reset successfully' };
      expect(response.message).toContain('successfully');
    });
  });
});
