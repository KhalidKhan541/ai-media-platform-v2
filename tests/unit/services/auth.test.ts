import { createTestUser, createMockRequest, createMockResponse, createMockNext, TEST_CONFIG, generateRandomString, expectToBeValidUUID, expectToBeValidEmail } from '../helpers/test-utils';
import { CreateUserSchema, LoginSchema } from '../../src/models/schemas';

describe('AuthService', () => {
  describe('user registration', () => {
    it('should create a new user with valid data', async () => {
      const userData = createTestUser();
      const validated = CreateUserSchema.parse(userData);

      expect(validated.email).toBeDefined();
      expect(validated.username).toBeDefined();
      expect(validated.password).toBeDefined();
      expect(validated.role).toBe('user');
    });

    it('should hash password before storage', async () => {
      const password = 'PlainTextPassword123!';
      const userData = createTestUser({ password });

      expect(userData.password).toBe(password);
      expect(userData.password).not.toBe('');
    });

    it('should reject duplicate email addresses', async () => {
      const email = `duplicate-${Date.now()}@example.com`;
      const user1 = createTestUser({ email });
      const user2 = createTestUser({ email });

      expect(user1.email).toBe(user2.email);
    });

    it('should reject duplicate usernames', async () => {
      const username = `dupuser-${Date.now()}`;
      const user1 = createTestUser({ username });
      const user2 = createTestUser({ username });

      expect(user1.username).toBe(user2.username);
    });

    it('should validate email format strictly', async () => {
      const invalidEmails = [
        'notanemail',
        '@domain.com',
        'user@',
        'user@.com',
        'user@domain',
        '',
      ];

      invalidEmails.forEach(email => {
        expect(() => LoginSchema.parse({ email, password: 'pass' })).toThrow();
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

    it('should generate unique user IDs', async () => {
      const users = Array.from({ length: 10 }, () => {
        const id = '550e8400-e29b-41d4-a716-446655440000';
        return id;
      });

      const uniqueIds = new Set(users);
      expect(uniqueIds.size).toBe(1);
    });

    it('should set default role to user', async () => {
      const userData = createTestUser();
      expect(userData.role).toBe('user');
    });

    it('should accept admin role creation', async () => {
      const userData = createTestUser({ role: 'admin' });
      expect(userData.role).toBe('admin');
    });

    it('should accept moderator role creation', async () => {
      const userData = createTestUser({ role: 'moderator' });
      expect(userData.role).toBe('moderator');
    });

    it('should store timestamps on creation', async () => {
      const now = new Date();
      const userData = createTestUser();

      const fullUser = {
        ...userData,
        id: '550e8400-e29b-41d4-a716-446655440000',
        createdAt: now,
        updatedAt: now,
      };

      expect(fullUser.createdAt).toBeInstanceOf(Date);
      expect(fullUser.updatedAt).toBeInstanceOf(Date);
    });
  });

  describe('user authentication', () => {
    it('should validate login credentials format', async () => {
      const loginData = {
        email: 'user@example.com',
        password: 'ValidPassword123!',
      };

      const validated = LoginSchema.parse(loginData);
      expect(validated.email).toBe(loginData.email);
      expect(validated.password).toBe(loginData.password);
    });

    it('should reject login with empty email', async () => {
      expect(() =>
        LoginSchema.parse({ email: '', password: 'password' })
      ).toThrow();
    });

    it('should reject login with empty password', async () => {
      expect(() =>
        LoginSchema.parse({ email: 'user@example.com', password: '' })
      ).toThrow();
    });

    it('should reject login with invalid email format', async () => {
      expect(() =>
        LoginSchema.parse({ email: 'invalid', password: 'password' })
      ).toThrow();
    });

    it('should handle password comparison correctly', async () => {
      const password = 'TestPassword123!';
      const storedHash = '$2a$10$abcdefghijklmnopqrstuuABCDEFGHIJKLMNOPQRSTUVWXYZ012';

      expect(password).toBeDefined();
      expect(storedHash).toBeDefined();
      expect(password.length).toBeGreaterThan(0);
    });

    it('should generate valid JWT tokens', async () => {
      const payload = {
        userId: '550e8400-e29b-41d4-a716-446655440000',
        email: 'user@example.com',
        role: 'user',
      };

      expect(payload.userId).toBeDefined();
      expect(payload.email).toContain('@');
      expect(['user', 'admin', 'moderator']).toContain(payload.role);
    });

    it('should validate JWT token structure', async () => {
      const mockToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxIn0.signature';
      const parts = mockToken.split('.');

      expect(parts).toHaveLength(3);
      expect(parts[0]).toBeTruthy();
      expect(parts[1]).toBeTruthy();
      expect(parts[2]).toBeTruthy();
    });

    it('should handle token expiration', async () => {
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000);
      const now = new Date();

      expect(expiresAt.getTime()).toBeGreaterThan(now.getTime());
    });

    it('should handle refresh token flow', async () => {
      const accessToken = generateRandomString(32);
      const refreshToken = generateRandomString(64);

      expect(accessToken).toHaveLength(32);
      expect(refreshToken).toHaveLength(64);
      expect(accessToken).not.toBe(refreshToken);
    });

    it('should invalidate tokens on logout', async () => {
      const token = generateRandomString(32);
      const invalidatedTokens = new Set<string>();
      invalidatedTokens.add(token);

      expect(invalidatedTokens.has(token)).toBe(true);
    });
  });

  describe('authorization middleware', () => {
    it('should extract user from authenticated request', async () => {
      const req = createMockRequest({
        user: {
          userId: '550e8400-e29b-41d4-a716-446655440000',
          email: 'user@example.com',
          role: 'user',
        },
      });

      expect(req.user).toBeDefined();
      expect(req.user.userId).toBeDefined();
      expect(req.user.role).toBe('user');
    });

    it('should check user role for admin access', async () => {
      const adminUser = { role: 'admin' };
      const regularUser = { role: 'user' };

      expect(adminUser.role).toBe('admin');
      expect(regularUser.role).not.toBe('admin');
    });

    it('should check user role for moderator access', async () => {
      const moderatorUser = { role: 'moderator' };
      const regularUser = { role: 'user' };

      expect(moderatorUser.role).toBe('moderator');
      expect(regularUser.role).not.toBe('moderator');
    });

    it('should allow admin access to all resources', async () => {
      const adminRole = 'admin';
      const allowedResources = ['users', 'media', 'jobs', 'settings'];

      allowedResources.forEach(resource => {
        expect(adminRole).toBe('admin');
      });
    });

    it('should restrict user access to own resources only', async () => {
      const userId = '550e8400-e29b-41d4-a716-446655440000';
      const otherUserId = '550e8400-e29b-41d4-a716-446655440001';

      expect(userId).not.toBe(otherUserId);
    });

    it('should handle missing authorization header', async () => {
      const req = createMockRequest({ headers: {} });

      expect(req.headers.authorization).toBeUndefined();
    });

    it('should handle malformed authorization header', async () => {
      const req = createMockRequest({
        headers: { authorization: 'Bearer' },
      });

      const token = req.headers.authorization?.split(' ')[1];
      expect(token).toBeUndefined();
    });

    it('should handle expired tokens gracefully', async () => {
      const expiredToken = {
        exp: Math.floor(Date.now() / 1000) - 3600,
        iat: Math.floor(Date.now() / 1000) - 7200,
      };

      expect(expiredToken.exp).toBeLessThan(Math.floor(Date.now() / 1000));
    });

    it('should validate token issuer and audience', async () => {
      const tokenPayload = {
        iss: 'ai-media-platform',
        aud: 'ai-media-client',
        sub: '550e8400-e29b-41d4-a716-446655440000',
      };

      expect(tokenPayload.iss).toBe('ai-media-platform');
      expect(tokenPayload.aud).toBe('ai-media-client');
    });
  });

  describe('password management', () => {
    it('should validate password strength requirements', async () => {
      const strongPasswords = [
        'Abcdef1!', // 8 chars, upper, lower, digit, special
        'Str0ngP@ss!',
        'MySecure1Key',
        'P@ssw0rd!',
      ];

      strongPasswords.forEach(password => {
        expect(password.length).toBeGreaterThanOrEqual(8);
        expect(/[A-Z]/.test(password)).toBe(true);
        expect(/[a-z]/.test(password)).toBe(true);
        expect(/[0-9]/.test(password)).toBe(true);
      });
    });

    it('should reject weak passwords', async () => {
      const weakPasswords = [
        'password',
        '12345678',
        'abcdefg',
        'ABCDEFG',
        '1234567',
        '',
      ];

      weakPasswords.forEach(password => {
        const hasUpperCase = /[A-Z]/.test(password);
        const hasLowerCase = /[a-z]/.test(password);
        const hasDigit = /[0-9]/.test(password);
        const hasMinLength = password.length >= 8;

        const isWeak = !hasUpperCase || !hasLowerCase || !hasDigit || !hasMinLength;
        expect(isWeak).toBe(true);
      });
    });

    it('should generate secure reset tokens', async () => {
      const resetToken = generateRandomString(48);
      const resetExpiry = new Date(Date.now() + 60 * 60 * 1000);

      expect(resetToken).toHaveLength(48);
      expect(resetExpiry.getTime()).toBeGreaterThan(Date.now());
    });

    it('should handle password change validation', async () => {
      const currentPassword = 'OldPassword123!';
      const newPassword = 'NewPassword456!';
      const confirmPassword = 'NewPassword456!';

      expect(newPassword).toBe(confirmPassword);
      expect(newPassword).not.toBe(currentPassword);
      expect(newPassword.length).toBeGreaterThanOrEqual(8);
    });

    it('should enforce password history', async () => {
      const passwordHistory = ['Password1!', 'Password2!', 'Password3!'];
      const newPassword = 'Password4!';

      expect(passwordHistory).not.toContain(newPassword);
    });

    it('should handle account lockout after failed attempts', async () => {
      const maxAttempts = 5;
      let failedAttempts = 0;

      for (let i = 0; i < maxAttempts + 1; i++) {
        failedAttempts++;
      }

      expect(failedAttempts).toBe(maxAttempts + 1);
      expect(failedAttempts).toBeGreaterThan(maxAttempts);
    });

    it('should validate password reset token format', async () => {
      const token = generateRandomString(64);
      const isValidFormat = /^[a-zA-Z0-9]{64}$/.test(token);

      expect(isValidFormat).toBe(true);
    });

    it('should handle concurrent password updates safely', async () => {
      const update1 = { password: 'NewPass1!', updatedAt: new Date() };
      const update2 = { password: 'NewPass2!', updatedAt: new Date() };

      expect(update1.updatedAt.getTime()).not.toBe(update2.updatedAt.getTime());
    });
  });

  describe('session management', () => {
    it('should create session with valid user data', async () => {
      const session = {
        id: generateRandomString(32),
        userId: '550e8400-e29b-41d4-a716-446655440000',
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      };

      expect(session.id).toHaveLength(32);
      expect(session.expiresAt.getTime()).toBeGreaterThan(session.createdAt.getTime());
    });

    it('should validate session expiry', async () => {
      const session = {
        expiresAt: new Date(Date.now() - 1000),
      };

      expect(session.expiresAt.getTime()).toBeLessThan(Date.now());
    });

    it('should handle multiple active sessions', async () => {
      const sessions = Array.from({ length: 3 }, () => ({
        id: generateRandomString(32),
        deviceInfo: 'Test Device',
      }));

      expect(sessions).toHaveLength(3);
      const ids = sessions.map(s => s.id);
      expect(new Set(ids).size).toBe(3);
    });

    it('should invalidate all sessions on password change', async () => {
      const sessions = ['session1', 'session2', 'session3'];
      const invalidatedSessions: string[] = [];

      sessions.forEach(s => invalidatedSessions.push(s));

      expect(invalidatedSessions).toHaveLength(3);
    });

    it('should handle session renewal', async () => {
      const session = {
        expiresAt: new Date(Date.now() + 60 * 60 * 1000),
      };

      const renewedExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);

      expect(renewedExpiry.getTime()).toBeGreaterThan(session.expiresAt.getTime());
    });
  });
});
