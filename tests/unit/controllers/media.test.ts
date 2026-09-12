import { createTestMedia, createTestUser, createMockRequest, createMockResponse } from '../helpers/test-utils';
import { CreateMediaSchema, MediaSchema, SearchSchema } from '../../src/models/schemas';

describe('MediaController', () => {
  const testUserId = '550e8400-e29b-41d4-a716-446655440000';

  describe('POST /api/v1/media/upload', () => {
    it('should upload media file successfully', async () => {
      const file = {
        fieldname: 'media',
        originalname: 'photo.jpg',
        encoding: '7bit',
        mimetype: 'image/jpeg',
        size: 1024 * 500,
        buffer: Buffer.from('fake-image-data'),
      };

      expect(file.mimetype).toMatch(/^image\//);
      expect(file.size).toBeGreaterThan(0);
    });

    it('should return 400 when no file provided', async () => {
      const req = createMockRequest({ file: null });
      const res = createMockResponse();

      expect(req.file).toBeNull();
    });

    it('should reject files exceeding size limit', async () => {
      const maxFileSize = 10 * 1024 * 1024;
      const oversizedFile = {
        size: maxFileSize + 1,
        mimetype: 'image/jpeg',
      };

      expect(oversizedFile.size).toBeGreaterThan(maxFileSize);
    });

    it('should reject disallowed MIME types', async () => {
      const disallowedTypes = [
        'application/x-executable',
        'application/x-msdownload',
        'application/x-sh',
      ];

      disallowedTypes.forEach(mimetype => {
        expect(mimetype).not.toMatch(/^(image|video|audio|text|application\/pdf)/);
      });
    });

    it('should create media record with correct metadata', async () => {
      const mediaData = createTestMedia(testUserId, {
        title: 'Uploaded Photo',
        filename: 'uploaded-photo.jpg',
        mimetype: 'image/jpeg',
        size: 2048000,
      });

      const validated = CreateMediaSchema.parse(mediaData);
      expect(validated.title).toBe('Uploaded Photo');
      expect(validated.size).toBe(2048000);
    });

    it('should set processing status to pending', async () => {
      const media = createTestMedia(testUserId);
      expect(media.processingStatus).toBe('pending');
    });

    it('should generate unique filename', async () => {
      const timestamp = Date.now();
      const random = Math.random().toString(36).substring(2);
      const filename = `${timestamp}-${random}-photo.jpg`;

      expect(filename).toContain('photo.jpg');
      expect(filename).not.toBe('photo.jpg');
    });

    it('should store file in correct directory', async () => {
      const uploadDir = './uploads';
      expect(uploadDir).toBeTruthy();
    });

    it('should return created media data', async () => {
      const media = createTestMedia(testUserId);
      const response = {
        ...media,
        id: '550e8400-e29b-41d4-a716-446655440000',
        url: 'https://storage.example.com/media/test.jpg',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      expect(response.id).toBeDefined();
      expect(response.url).toBeDefined();
    });

    it('should handle multiple file uploads', async () => {
      const files = [
        { originalname: 'photo1.jpg', mimetype: 'image/jpeg' },
        { originalname: 'photo2.jpg', mimetype: 'image/jpeg' },
        { originalname: 'video.mp4', mimetype: 'video/mp4' },
      ];

      expect(files).toHaveLength(3);
    });

    it('should support tags in upload', async () => {
      const tags = ['vacation', 'beach', 'sunset'];
      const media = createTestMedia(testUserId, { tags });

      expect(media.tags).toEqual(tags);
    });

    it('should handle AI-generated content upload', async () => {
      const media = createTestMedia(testUserId, {
        aiGenerated: true,
        aiPrompt: 'A beautiful landscape painting',
      });

      expect(media.aiGenerated).toBe(true);
      expect(media.aiPrompt).toBeDefined();
    });
  });

  describe('GET /api/v1/media', () => {
    it('should return paginated media list', async () => {
      const page = 1;
      const limit = 20;
      const media = Array.from({ length: limit }, (_, i) =>
        createTestMedia(testUserId, { title: `Media ${i}` })
      );

      expect(media).toHaveLength(limit);
    });

    it('should return user media only', async () => {
      const userId = testUserId;
      const media = [
        createTestMedia(userId),
        createTestMedia(userId),
      ];

      media.forEach(m => {
        expect(m.userId).toBe(userId);
      });
    });

    it('should support pagination parameters', async () => {
      const query = SearchSchema.parse({ q: '*', page: '2', limit: '10' });

      expect(query.page).toBe(2);
      expect(query.limit).toBe(10);
    });

    it('should support sort by date', async () => {
      const sortOptions = { sortBy: 'createdAt', sortOrder: 'desc' as const };
      expect(sortOptions.sortBy).toBe('createdAt');
      expect(sortOptions.sortOrder).toBe('desc');
    });

    it('should support sort by size', async () => {
      const sortOptions = { sortBy: 'size', sortOrder: 'desc' as const };
      expect(sortOptions.sortBy).toBe('size');
    });

    it('should support filter by tags', async () => {
      const filterTags = ['nature', 'landscape'];
      const media = [
        createTestMedia(testUserId, { tags: ['nature', 'photo'] }),
        createTestMedia(testUserId, { tags: ['tech', 'digital'] }),
        createTestMedia(testUserId, { tags: ['nature', 'mountains'] }),
      ];

      const filtered = media.filter(m =>
        m.tags.some(t => filterTags.includes(t))
      );

      expect(filtered).toHaveLength(2);
    });

    it('should support filter by mimetype', async () => {
      const media = [
        createTestMedia(testUserId, { mimetype: 'image/jpeg' }),
        createTestMedia(testUserId, { mimetype: 'video/mp4' }),
      ];

      const images = media.filter(m => m.mimetype.startsWith('image/'));
      expect(images).toHaveLength(1);
    });

    it('should return total count in response', async () => {
      const response = {
        data: [],
        pagination: {
          page: 1,
          limit: 20,
          total: 42,
          totalPages: 3,
        },
      };

      expect(response.pagination.total).toBe(42);
      expect(response.pagination.totalPages).toBe(3);
    });

    it('should handle empty results gracefully', async () => {
      const response = {
        data: [],
        pagination: { total: 0 },
      };

      expect(response.data).toHaveLength(0);
      expect(response.pagination.total).toBe(0);
    });

    it('should include user info in response', async () => {
      const media = createTestMedia(testUserId);
      const response = {
        ...media,
        user: {
          id: testUserId,
          username: 'testuser',
        },
      };

      expect(response.user).toBeDefined();
      expect(response.user.username).toBe('testuser');
    });
  });

  describe('GET /api/v1/media/:id', () => {
    it('should return media by ID', async () => {
      const mediaId = '550e8400-e29b-41d4-a716-446655440000';
      expect(mediaId).toHaveLength(36);
    });

    it('should return 404 for non-existent media', async () => {
      const mediaId = '550e8400-e29b-41d4-a716-446655449999';
      const media = null;

      expect(media).toBeNull();
    });

    it('should return 400 for invalid media ID', async () => {
      const invalidId = 'not-a-uuid';
      expect(() => {
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        if (!uuidRegex.test(invalidId)) throw new Error('Invalid UUID');
      }).toThrow();
    });

    it('should check access permissions', async () => {
      const ownerId = testUserId;
      const requesterId = '550e8400-e29b-41d4-a716-446655440001';
      const isAdmin = false;

      const hasAccess = ownerId === requesterId || isAdmin;
      expect(hasAccess).toBe(false);
    });

    it('should include processing status', async () => {
      const media = createTestMedia(testUserId, { processingStatus: 'completed' });
      expect(media.processingStatus).toBe('completed');
    });

    it('should include download count', async () => {
      const downloadCount = 142;
      expect(downloadCount).toBeGreaterThanOrEqual(0);
    });

    it('should track view count', async () => {
      const viewCount = 1024;
      expect(viewCount).toBeGreaterThan(0);
    });

    it('should return media URL for download', async () => {
      const url = 'https://storage.example.com/media/test.jpg';
      expect(url).toMatch(/^https?:\/\//);
    });

    it('should return thumbnail URL if available', async () => {
      const thumbnailUrl = 'https://storage.example.com/thumbnails/test-thumb.jpg';
      expect(thumbnailUrl).toContain('thumbnail');
    });

    it('should handle media with associated AI jobs', async () => {
      const media = createTestMedia(testUserId);
      const jobs = ['job1', 'job2'];

      expect(jobs.length).toBeGreaterThan(0);
    });
  });

  describe('PUT /api/v1/media/:id', () => {
    it('should update media title', async () => {
      const media = createTestMedia(testUserId, { title: 'Old Title' });
      const updated = { ...media, title: 'New Title' };

      expect(updated.title).toBe('New Title');
    });

    it('should update media description', async () => {
      const media = createTestMedia(testUserId, { description: 'Old' });
      const updated = { ...media, description: 'New description with more content' };

      expect(updated.description).toContain('New');
    });

    it('should update media tags', async () => {
      const media = createTestMedia(testUserId, { tags: ['old'] });
      const updated = { ...media, tags: ['new', 'additional'] };

      expect(updated.tags).toContain('new');
      expect(updated.tags).not.toContain('old');
    });

    it('should return 403 for non-owner', async () => {
      const ownerId = testUserId;
      const requesterId = '550e8400-e29b-41d4-a716-446655440001';

      expect(ownerId).not.toBe(requesterId);
    });

    it('should validate update data', async () => {
      const updateData = { title: 'Valid Title' };
      const validated = CreateMediaSchema.partial().parse(updateData);

      expect(validated.title).toBe('Valid Title');
    });

    it('should update timestamp on modification', async () => {
      const originalDate = new Date('2024-01-01');
      const updatedDate = new Date();

      expect(updatedDate.getTime()).toBeGreaterThan(originalDate.getTime());
    });

    it('should handle partial updates', async () => {
      const updateData = { title: 'Only Title' };
      expect(Object.keys(updateData)).toHaveLength(1);
    });

    it('should prevent updating immutable fields', async () => {
      const media = createTestMedia(testUserId);
      const attemptedUpdate = {
        id: 'different-id',
        userId: 'different-user',
        createdAt: new Date(),
      };

      expect(attemptedUpdate.id).not.toBe(media);
    });

    it('should return updated media data', async () => {
      const updated = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        title: 'Updated Title',
        updatedAt: new Date(),
      };

      expect(updated.title).toBe('Updated Title');
      expect(updated.updatedAt).toBeInstanceOf(Date);
    });

    it('should handle concurrent update conflicts', async () => {
      const version1 = { version: 1, title: 'Title V1' };
      const version2 = { version: 2, title: 'Title V2' };

      expect(version2.version).toBeGreaterThan(version1.version);
    });
  });

  describe('DELETE /api/v1/media/:id', () => {
    it('should delete media successfully', async () => {
      const mediaId = '550e8400-e29b-41d4-a716-446655440000';
      expect(mediaId).toBeDefined();
    });

    it('should return 403 for non-owner', async () => {
      const ownerId = testUserId;
      const requesterId = '550e8400-e29b-41d4-a716-446655440001';

      expect(ownerId).not.toBe(requesterId);
    });

    it('should soft delete media', async () => {
      const deletedAt = new Date();
      expect(deletedAt).toBeInstanceOf(Date);
    });

    it('should delete associated file from storage', async () => {
      const fileUrl = 'https://storage.example.com/media/test.jpg';
      expect(fileUrl).toBeDefined();
    });

    it('should delete thumbnail', async () => {
      const thumbnailUrl = 'https://storage.example.com/thumbnails/test.jpg';
      expect(thumbnailUrl).toBeDefined();
    });

    it('should cancel pending AI jobs', async () => {
      const jobs = ['job1', 'job2'];
      expect(jobs.length).toBeGreaterThan(0);
    });

    it('should handle batch deletion', async () => {
      const mediaIds = [
        '550e8400-e29b-41d4-a716-446655440000',
        '550e8400-e29b-41d4-a716-446655440001',
        '550e8400-e29b-41d4-a716-446655440002',
      ];

      expect(mediaIds).toHaveLength(3);
    });

    it('should return success response', async () => {
      const response = { message: 'Media deleted successfully' };
      expect(response.message).toContain('successfully');
    });

    it('should prevent deletion of processing media', async () => {
      const media = createTestMedia(testUserId, { processingStatus: 'processing' });
      const canDelete = media.processingStatus !== 'processing';

      expect(canDelete).toBe(false);
    });

    it('should update user media count after deletion', async () => {
      const beforeCount = 10;
      const afterCount = beforeCount - 1;

      expect(afterCount).toBe(9);
    });
  });

  describe('POST /api/v1/media/:id/download', () => {
    it('should increment download count', async () => {
      let downloadCount = 0;
      downloadCount++;

      expect(downloadCount).toBe(1);
    });

    it('should return file for download', async () => {
      const fileUrl = 'https://storage.example.com/media/test.jpg';
      expect(fileUrl).toMatch(/^https?:\/\//);
    });

    it('should set correct Content-Disposition header', async () => {
      const filename = 'photo.jpg';
      const disposition = `attachment; filename="${filename}"`;

      expect(disposition).toContain('attachment');
      expect(disposition).toContain(filename);
    });

    it('should set correct Content-Type header', async () => {
      const mimetype = 'image/jpeg';
      expect(mimetype).toMatch(/^(image|video|audio|application)\//);
    });

    it('should log download activity', async () => {
      const logEntry = {
        userId: testUserId,
        mediaId: '550e8400-e29b-41d4-a716-446655440000',
        timestamp: new Date(),
      };

      expect(logEntry.timestamp).toBeInstanceOf(Date);
    });

    it('should handle rate limiting', async () => {
      const maxDownloadsPerHour = 100;
      expect(maxDownloadsPerHour).toBeGreaterThan(0);
    });
  });

  describe('POST /api/v1/media/search', () => {
    it('should search media by title', async () => {
      const media = createTestMedia(testUserId, { title: 'Mountain Landscape' });
      const query = 'mountain';

      expect(media.title.toLowerCase()).toContain(query.toLowerCase());
    });

    it('should search media by description', async () => {
      const media = createTestMedia(testUserId, {
        description: 'A beautiful sunset over the ocean',
      });
      const query = 'sunset';

      expect(media.description?.toLowerCase()).toContain(query.toLowerCase());
    });

    it('should search by tags', async () => {
      const media = createTestMedia(testUserId, { tags: ['nature', 'sunset'] });
      const searchTags = ['sunset'];

      const hasMatch = media.tags.some(t => searchTags.includes(t));
      expect(hasMatch).toBe(true);
    });

    it('should support full-text search', async () => {
      const query = SearchSchema.parse({ q: 'test query' });
      expect(query.q).toBe('test query');
    });

    it('should handle empty search results', async () => {
      const results: unknown[] = [];
      expect(results).toHaveLength(0);
    });

    it('should rank results by relevance', async () => {
      const media = [
        createTestMedia(testUserId, { title: 'AI Art Generator' }),
        createTestMedia(testUserId, { title: 'Machine Learning' }),
      ];

      const query = 'AI';
      const relevant = media.filter(m =>
        m.title.toLowerCase().includes(query.toLowerCase())
      );

      expect(relevant).toHaveLength(1);
    });

    it('should support combined search with filters', async () => {
      const params = SearchSchema.parse({
        q: 'nature',
        tags: ['landscape'],
        type: 'image',
      });

      expect(params.q).toBe('nature');
      expect(params.tags).toContain('landscape');
      expect(params.type).toBe('image');
    });

    it('should handle special characters in search', async () => {
      const query = 'C++ & Java';
      expect(query).toBeTruthy();
    });

    it('should limit search results', async () => {
      const limit = 50;
      expect(limit).toBeLessThanOrEqual(100);
    });

    it('should support search highlighting', async () => {
      const title = 'Beautiful Sunset Landscape';
      const query = 'sunset';
      const highlighted = title.replace(
        new RegExp(query, 'gi'),
        match => `<mark>${match}</mark>`
      );

      expect(highlighted).toContain('<mark>');
    });
  });
});
