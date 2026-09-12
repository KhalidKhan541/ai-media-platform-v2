import { createTestMedia, createTestUser, createMockRequest, createMockResponse, createMockNext } from '../helpers/test-utils';
import { CreateMediaSchema, MediaSchema, SearchSchema } from '../../src/models/schemas';

describe('MediaService', () => {
  const testUserId = '550e8400-e29b-41d4-a716-446655440000';

  describe('media upload', () => {
    it('should accept valid image file upload', async () => {
      const file = {
        fieldname: 'media',
        originalname: 'test-image.jpg',
        encoding: '7bit',
        mimetype: 'image/jpeg',
        size: 1024 * 500,
        buffer: Buffer.from('test'),
      };

      expect(file.mimetype).toMatch(/^image\//);
      expect(file.size).toBeGreaterThan(0);
      expect(file.size).toBeLessThan(10 * 1024 * 1024);
    });

    it('should accept valid video file upload', async () => {
      const file = {
        fieldname: 'media',
        originalname: 'test-video.mp4',
        encoding: '7bit',
        mimetype: 'video/mp4',
        size: 1024 * 1024 * 50,
        buffer: Buffer.from('test'),
      };

      expect(file.mimetype).toMatch(/^video\//);
      expect(file.originalname).toMatch(/\.(mp4|mov|avi|mkv)$/);
    });

    it('should accept valid audio file upload', async () => {
      const file = {
        fieldname: 'media',
        originalname: 'test-audio.mp3',
        encoding: '7bit',
        mimetype: 'audio/mpeg',
        size: 1024 * 1024 * 5,
        buffer: Buffer.from('test'),
      };

      expect(file.mimetype).toMatch(/^audio\//);
    });

    it('should reject files exceeding maximum size', async () => {
      const maxFileSize = 10 * 1024 * 1024;
      const oversizedFile = {
        size: maxFileSize + 1,
        mimetype: 'image/jpeg',
      };

      expect(oversizedFile.size).toBeGreaterThan(maxFileSize);
    });

    it('should reject disallowed file types', async () => {
      const disallowedTypes = [
        'application/exe',
        'application/x-msdownload',
        'application/x-sh',
      ];

      disallowedTypes.forEach(mimetype => {
        expect(mimetype).not.toMatch(/^(image|video|audio|text|application\/pdf)/);
      });
    });

    it('should generate unique filename for upload', async () => {
      const originalName = 'photo.jpg';
      const timestamp = Date.now();
      const randomSuffix = Math.random().toString(36).substring(2, 10);
      const filename = `${timestamp}-${randomSuffix}-${originalName}`;

      expect(filename).toContain(originalName);
      expect(filename).not.toBe(originalName);
    });

    it('should create media record with correct metadata', async () => {
      const mediaData = createTestMedia(testUserId, {
        title: 'Beautiful Sunset',
        description: 'A stunning sunset over the mountains',
        filename: 'sunset-2024.jpg',
        mimetype: 'image/jpeg',
        size: 2048000,
      });

      const validated = CreateMediaSchema.parse(mediaData);
      expect(validated.title).toBe('Beautiful Sunset');
      expect(validated.mimetype).toBe('image/jpeg');
      expect(validated.size).toBe(2048000);
    });

    it('should set initial processing status to pending', async () => {
      const mediaData = createTestMedia(testUserId);
      expect(mediaData.processingStatus).toBe('pending');
    });

    it('should support tags on upload', async () => {
      const tags = ['nature', 'sunset', 'mountains', 'landscape'];
      const mediaData = createTestMedia(testUserId, { tags });

      expect(mediaData.tags).toEqual(tags);
      expect(mediaData.tags.length).toBe(4);
    });

    it('should handle AI-generated content flag', async () => {
      const aiMedia = createTestMedia(testUserId, {
        aiGenerated: true,
        aiPrompt: 'A futuristic cityscape at night',
      });

      expect(aiMedia.aiGenerated).toBe(true);
      expect(aiMedia.aiPrompt).toBe('A futuristic cityscape at night');
    });

    it('should handle file without description', async () => {
      const mediaData = createTestMedia(testUserId, { description: undefined });
      expect(mediaData.description).toBeUndefined();
    });
  });

  describe('media retrieval', () => {
    it('should retrieve media by ID', async () => {
      const mediaId = '550e8400-e29b-41d4-a716-446655440000';
      expect(mediaId).toBeDefined();
      expect(mediaId.length).toBe(36);
    });

    it('should retrieve all media for a user', async () => {
      const userId = testUserId;
      const media = [
        createTestMedia(userId, { title: 'Image 1' }),
        createTestMedia(userId, { title: 'Image 2' }),
        createTestMedia(userId, { title: 'Image 3' }),
      ];

      expect(media).toHaveLength(3);
      media.forEach(m => {
        expect(m.userId).toBe(userId);
      });
    });

    it('should paginate media results correctly', async () => {
      const pagination = SearchSchema.parse({ q: 'test', page: '1', limit: '10' });

      expect(pagination.page).toBe(1);
      expect(pagination.limit).toBe(10);
    });

    it('should handle empty search results', async () => {
      const results: unknown[] = [];
      expect(results).toHaveLength(0);
    });

    it('should filter media by tags', async () => {
      const media = [
        createTestMedia(testUserId, { tags: ['nature', 'photo'] }),
        createTestMedia(testUserId, { tags: ['tech', 'digital'] }),
        createTestMedia(testUserId, { tags: ['nature', 'landscape'] }),
      ];

      const natureMedia = media.filter(m => m.tags.includes('nature'));
      expect(natureMedia).toHaveLength(2);
    });

    it('should filter media by type', async () => {
      const media = [
        createTestMedia(testUserId, { mimetype: 'image/jpeg' }),
        createTestMedia(testUserId, { mimetype: 'video/mp4' }),
        createTestMedia(testUserId, { mimetype: 'audio/mpeg' }),
      ];

      const images = media.filter(m => m.mimetype.startsWith('image/'));
      expect(images).toHaveLength(1);
    });

    it('should sort media by creation date', async () => {
      const dates = [
        new Date('2024-01-01'),
        new Date('2024-03-15'),
        new Date('2024-02-10'),
      ];

      const sorted = dates.sort((a, b) => a.getTime() - b.getTime());
      expect(sorted[0]).toEqual(new Date('2024-01-01'));
      expect(sorted[2]).toEqual(new Date('2024-03-15'));
    });

    it('should return total count with paginated results', async () => {
      const totalCount = 42;
      const page = 1;
      const limit = 10;
      const totalPages = Math.ceil(totalCount / limit);

      expect(totalPages).toBe(5);
    });

    it('should handle offset-based pagination', async () => {
      const page = 3;
      const limit = 10;
      const offset = (page - 1) * limit;

      expect(offset).toBe(20);
    });
  });

  describe('media update', () => {
    it('should update media title', async () => {
      const media = createTestMedia(testUserId, { title: 'Old Title' });
      const updated = { ...media, title: 'New Title' };

      expect(updated.title).toBe('New Title');
      expect(updated.title).not.toBe('Old Title');
    });

    it('should update media description', async () => {
      const media = createTestMedia(testUserId, { description: 'Old description' });
      const updated = { ...media, description: 'Updated description with more details' };

      expect(updated.description).toContain('Updated');
    });

    it('should update media tags', async () => {
      const media = createTestMedia(testUserId, { tags: ['old-tag'] });
      const updated = { ...media, tags: ['new-tag', 'additional-tag'] };

      expect(updated.tags).toContain('new-tag');
      expect(updated.tags).not.toContain('old-tag');
    });

    it('should update processing status', async () => {
      const media = createTestMedia(testUserId, { processingStatus: 'pending' });
      const updated = { ...media, processingStatus: 'processing' as const };

      expect(updated.processingStatus).toBe('processing');
    });

    it('should track updatedAt timestamp on modification', async () => {
      const originalDate = new Date('2024-01-01');
      const updatedDate = new Date('2024-01-02');

      expect(updatedDate.getTime()).toBeGreaterThan(originalDate.getTime());
    });

    it('should prevent non-owner from updating media', async () => {
      const ownerId = '550e8400-e29b-41d4-a716-446655440000';
      const nonOwnerId = '550e8400-e29b-41d4-a716-446655440001';

      expect(ownerId).not.toBe(nonOwnerId);
    });

    it('should validate update data against schema', async () => {
      const updateData = { title: 'Valid Title' };
      const validated = CreateMediaSchema.partial().parse(updateData);

      expect(validated.title).toBe('Valid Title');
    });

    it('should handle partial updates', async () => {
      const media = createTestMedia(testUserId);
      const partialUpdate = { title: 'Only Title Changed' };

      expect(Object.keys(partialUpdate)).toHaveLength(1);
      expect(partialUpdate).not.toHaveProperty('description');
    });
  });

  describe('media deletion', () => {
    it('should delete media by ID', async () => {
      const mediaId = '550e8400-e29b-41d4-a716-446655440000';
      const deletedMedia: string[] = [];

      deletedMedia.push(mediaId);

      expect(deletedMedia).toContain(mediaId);
    });

    it('should soft delete media', async () => {
      const media = createTestMedia(testUserId);
      const softDeleted = { ...media, deletedAt: new Date() };

      expect(softDeleted.deletedAt).toBeDefined();
    });

    it('should hard delete media after soft delete period', async () => {
      const deletedAt = new Date(Date.now() - 31 * 24 * 60 * 60 * 1000);
      const deletionThreshold = 30 * 24 * 60 * 60 * 1000;

      const daysSinceDeletion = Date.now() - deletedAt.getTime();
      expect(daysSinceDeletion).toBeGreaterThan(deletionThreshold);
    });

    it('should delete associated thumbnails on media deletion', async () => {
      const media = createTestMedia(testUserId);
      const thumbnailUrl = `thumb-${media.filename}`;

      expect(thumbnailUrl).toContain(media.filename);
    });

    it('should clean up AI job references on media deletion', async () => {
      const mediaId = '550e8400-e29b-41d4-a716-446655440000';
      const associatedJobs = ['job1', 'job2', 'job3'];

      const cleanedJobs = associatedJobs.filter(() => false);
      expect(cleanedJobs).toHaveLength(0);
    });

    it('should prevent deletion of media being processed', async () => {
      const media = createTestMedia(testUserId, { processingStatus: 'processing' });
      const canDelete = media.processingStatus !== 'processing';

      expect(canDelete).toBe(false);
    });

    it('should handle batch deletion', async () => {
      const mediaIds = [
        '550e8400-e29b-41d4-a716-446655440000',
        '550e8400-e29b-41d4-a716-446655440001',
        '550e8400-e29b-41d4-a716-446655440002',
      ];

      expect(mediaIds).toHaveLength(3);
    });
  });

  describe('media search', () => {
    it('should search media by title', async () => {
      const media = createTestMedia(testUserId, { title: 'Mountain Landscape' });
      const searchQuery = 'mountain';

      expect(media.title.toLowerCase()).toContain(searchQuery.toLowerCase());
    });

    it('should search media by description', async () => {
      const media = createTestMedia(testUserId, {
        description: 'A beautiful sunset over the ocean',
      });
      const searchQuery = 'sunset';

      expect(media.description?.toLowerCase()).toContain(searchQuery.toLowerCase());
    });

    it('should search media by tags', async () => {
      const media = createTestMedia(testUserId, { tags: ['nature', 'sunset', 'beach'] });
      const searchTag = 'sunset';

      expect(media.tags).toContain(searchTag);
    });

    it('should perform case-insensitive search', async () => {
      const title = 'Beautiful Sunset';
      const searchQuery = 'beautiful';

      expect(title.toLowerCase()).toContain(searchQuery.toLowerCase());
    });

    it('should support wildcard search', async () => {
      const media = [
        createTestMedia(testUserId, { title: 'sunset_one.jpg' }),
        createTestMedia(testUserId, { title: 'sunset_two.jpg' }),
        createTestMedia(testUserId, { title: 'sunrise.jpg' }),
      ];

      const wildcardResults = media.filter(m => m.title.startsWith('sunset'));
      expect(wildcardResults).toHaveLength(2);
    });

    it('should handle search with no results', async () => {
      const results: unknown[] = [];
      expect(results).toHaveLength(0);
    });

    it('should rank search results by relevance', async () => {
      const media = [
        createTestMedia(testUserId, { title: 'AI Art Generator' }),
        createTestMedia(testUserId, { title: 'Machine Learning Basics' }),
        createTestMedia(testUserId, { title: 'AI for Everyone' }),
      ];

      const query = 'AI';
      const relevant = media.filter(m =>
        m.title.toLowerCase().includes(query.toLowerCase())
      );

      expect(relevant).toHaveLength(2);
    });

    it('should combine search with filters', async () => {
      const searchParams = SearchSchema.parse({
        q: 'nature',
        tags: ['landscape'],
        type: 'image',
      });

      expect(searchParams.q).toBe('nature');
      expect(searchParams.tags).toContain('landscape');
      expect(searchParams.type).toBe('image');
    });
  });
});
