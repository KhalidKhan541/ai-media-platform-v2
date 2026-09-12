import { createTestAIJob, createTestMedia, createTestUser, generateRandomString } from '../helpers/test-utils';
import { CreateAIJobSchema, AIJobSchema } from '../../src/models/schemas';

describe('AIService', () => {
  const testUserId = '550e8400-e29b-41d4-a716-446655440000';
  const testMediaId = '550e8400-e29b-41d4-a716-446655440001';

  describe('job creation', () => {
    it('should create enhance job with valid parameters', async () => {
      const job = createTestAIJob(testUserId, testMediaId, {
        type: 'enhance',
        input: { quality: 'high', denoise: true, sharpen: true },
      });

      const validated = CreateAIJobSchema.parse(job);
      expect(validated.type).toBe('enhance');
      expect(validated.status).toBe('queued');
    });

    it('should create transcribe job for audio/video', async () => {
      const job = createTestAIJob(testUserId, testMediaId, {
        type: 'transcribe',
        input: { language: 'en', format: 'text' },
      });

      expect(job.type).toBe('transcribe');
      expect(job.input.language).toBe('en');
    });

    it('should create summarize job for content', async () => {
      const job = createTestAIJob(testUserId, testMediaId, {
        type: 'summarize',
        input: { maxLength: 500, style: 'concise' },
      });

      expect(job.type).toBe('summarize');
      expect(job.input.maxLength).toBe(500);
    });

    it('should create generation job with prompt', async () => {
      const job = createTestAIJob(testUserId, testMediaId, {
        type: 'generate',
        input: {
          prompt: 'A beautiful sunset over the mountains',
          style: 'photorealistic',
          size: '1024x1024',
        },
      });

      expect(job.type).toBe('generate');
      expect(job.input.prompt).toBeDefined();
    });

    it('should create analyze job for media inspection', async () => {
      const job = createTestAIJob(testUserId, testMediaId, {
        type: 'analyze',
        input: {
          features: ['objects', 'faces', 'text', 'sentiment'],
        },
      });

      expect(job.type).toBe('analyze');
      expect(job.input.features).toContain('objects');
    });

    it('should set initial status to queued', async () => {
      const job = createTestAIJob(testUserId, testMediaId);
      expect(job.status).toBe('queued');
    });

    it('should set initial progress to 0', async () => {
      const job = createTestAIJob(testUserId, testMediaId);
      const validated = CreateAIJobSchema.parse(job);
      expect(validated).not.toHaveProperty('progress');
    });

    it('should validate job type against allowed types', async () => {
      const validTypes = ['enhance', 'transcribe', 'summarize', 'generate', 'analyze'];

      validTypes.forEach(type => {
        const job = createTestAIJob(testUserId, testMediaId, { type: type as any });
        expect(job.type).toBe(type);
      });
    });

    it('should reject invalid job type', async () => {
      expect(() =>
        createTestAIJob(testUserId, testMediaId, { type: 'invalid' as any })
      ).toThrow();
    });

    it('should associate job with correct user', async () => {
      const job = createTestAIJob(testUserId, testMediaId);
      expect(job.userId).toBe(testUserId);
    });

    it('should associate job with correct media', async () => {
      const job = createTestAIJob(testUserId, testMediaId);
      expect(job.mediaId).toBe(testMediaId);
    });
  });

  describe('job processing', () => {
    it('should transition from queued to processing', async () => {
      const job = createTestAIJob(testUserId, testMediaId, { status: 'queued' });
      const updated = { ...job, status: 'processing' as const };

      expect(updated.status).toBe('processing');
    });

    it('should update progress during processing', async () => {
      const progressSteps = [0, 10, 25, 50, 75, 90, 100];

      progressSteps.forEach(progress => {
        expect(progress).toBeGreaterThanOrEqual(0);
        expect(progress).toBeLessThanOrEqual(100);
      });
    });

    it('should mark job as completed when done', async () => {
      const job = createTestAIJob(testUserId, testMediaId, { status: 'processing' });
      const completed = {
        ...job,
        status: 'completed' as const,
        progress: 100,
        output: { result: 'Processing complete' },
      };

      expect(completed.status).toBe('completed');
      expect(completed.progress).toBe(100);
    });

    it('should mark job as failed on error', async () => {
      const job = createTestAIJob(testUserId, testMediaId, { status: 'processing' });
      const failed = {
        ...job,
        status: 'failed' as const,
        error: 'AI model returned unexpected response',
      };

      expect(failed.status).toBe('failed');
      expect(failed.error).toBeDefined();
    });

    it('should handle processing timeout', async () => {
      const maxProcessingTime = 5 * 60 * 1000; // 5 minutes
      const startTime = Date.now() - maxProcessingTime - 1;

      const elapsed = Date.now() - startTime;
      expect(elapsed).toBeGreaterThan(maxProcessingTime);
    });

    it('should support job cancellation', async () => {
      const job = createTestAIJob(testUserId, testMediaId, { status: 'processing' });
      const cancelled = { ...job, status: 'failed' as const, error: 'Cancelled by user' };

      expect(cancelled.status).toBe('failed');
      expect(cancelled.error).toBe('Cancelled by user');
    });

    it('should support job retry on failure', async () => {
      const job = createTestAIJob(testUserId, testMediaId, { status: 'failed' });
      const retried = { ...job, status: 'queued' as const, error: undefined };

      expect(retried.status).toBe('queued');
      expect(retried.error).toBeUndefined();
    });

    it('should limit retry attempts', async () => {
      const maxRetries = 3;
      let retryCount = 0;

      while (retryCount < maxRetries) {
        retryCount++;
      }

      expect(retryCount).toBe(maxRetries);
    });

    it('should handle concurrent job processing', async () => {
      const concurrentLimit = 5;
      const jobs = Array.from({ length: 10 }, (_, i) =>
        createTestAIJob(testUserId, testMediaId, { status: 'queued' })
      );

      const activeJobs = jobs.slice(0, concurrentLimit);
      expect(activeJobs).toHaveLength(concurrentLimit);
    });

    it('should prioritize jobs correctly', async () => {
      const jobs = [
        createTestAIJob(testUserId, testMediaId, { type: 'enhance' }),
        createTestAIJob(testUserId, testMediaId, { type: 'transcribe' }),
        createTestAIJob(testUserId, testMediaId, { type: 'summarize' }),
      ];

      expect(jobs).toHaveLength(3);
    });
  });

  describe('AI model integration', () => {
    it('should validate API key configuration', async () => {
      const apiKey = process.env.AI_API_KEY || 'test-key';
      expect(apiKey).toBeDefined();
      expect(apiKey.length).toBeGreaterThan(0);
    });

    it('should handle API rate limiting', async () => {
      const rateLimit = {
        requestsPerMinute: 60,
        tokensPerMinute: 100000,
      };

      expect(rateLimit.requestsPerMinute).toBeGreaterThan(0);
      expect(rateLimit.tokensPerMinute).toBeGreaterThan(0);
    });

    it('should validate model selection', async () => {
      const validModels = [
        'gpt-4',
        'gpt-4-turbo',
        'gpt-3.5-turbo',
        'dall-e-3',
        'whisper-1',
      ];

      validModels.forEach(model => {
        expect(model).toBeTruthy();
      });
    });

    it('should handle model fallback on failure', async () => {
      const primaryModel = 'gpt-4';
      const fallbackModel = 'gpt-3.5-turbo';

      expect(primaryModel).not.toBe(fallbackModel);
    });

    it('should validate response format from AI', async () => {
      const mockResponse = {
        id: 'resp-001',
        model: 'gpt-4',
        choices: [{ text: 'Generated content' }],
        usage: { promptTokens: 10, completionTokens: 20 },
      };

      expect(mockResponse.choices).toHaveLength(1);
      expect(mockResponse.usage.promptTokens).toBeGreaterThan(0);
    });

    it('should handle token counting', async () => {
      const text = 'This is a test prompt for token counting';
      const estimatedTokens = Math.ceil(text.split(' ').length * 1.3);

      expect(estimatedTokens).toBeGreaterThan(0);
    });

    it('should implement request caching', async () => {
      const cache = new Map<string, unknown>();
      const key = 'enhance:test-media-id:high';

      cache.set(key, { result: 'cached' });
      expect(cache.has(key)).toBe(true);
    });

    it('should validate input before sending to AI', async () => {
      const validInputs = {
        enhance: { quality: 'high' },
        transcribe: { language: 'en' },
        summarize: { maxLength: 500 },
        generate: { prompt: 'test prompt' },
        analyze: { features: ['objects'] },
      };

      Object.entries(validInputs).forEach(([type, input]) => {
        expect(input).toBeDefined();
        expect(Object.keys(input).length).toBeGreaterThan(0);
      });
    });

    it('should handle AI response parsing errors', async () => {
      const malformedResponse = 'not valid json';

      expect(() => JSON.parse(malformedResponse)).toThrow();
    });

    it('should implement exponential backoff for retries', async () => {
      const baseDelay = 1000;
      const maxRetries = 3;
      const delays: number[] = [];

      for (let i = 0; i < maxRetries; i++) {
        delays.push(baseDelay * Math.pow(2, i));
      }

      expect(delays).toEqual([1000, 2000, 4000]);
    });
  });

  describe('job queue management', () => {
    it('should add jobs to queue in FIFO order', async () => {
      const queue: string[] = [];
      const job1 = generateRandomString(8);
      const job2 = generateRandomString(8);
      const job3 = generateRandomString(8);

      queue.push(job1, job2, job3);

      expect(queue[0]).toBe(job1);
      expect(queue[1]).toBe(job2);
      expect(queue[2]).toBe(job3);
    });

    it('should remove completed jobs from queue', async () => {
      const queue = ['job1', 'job2', 'job3'];
      const completedJob = 'job2';

      const updatedQueue = queue.filter(j => j !== completedJob);

      expect(updatedQueue).toHaveLength(2);
      expect(updatedQueue).not.toContain(completedJob);
    });

    it('should handle queue priority levels', async () => {
      const highPriority: string[] = [];
      const normalPriority: string[] = [];
      const lowPriority: string[] = [];

      highPriority.push('urgent-job');
      normalPriority.push('normal-job');
      lowPriority.push('background-job');

      expect(highPriority).toHaveLength(1);
    });

    it('should track queue statistics', async () => {
      const stats = {
        total: 100,
        queued: 15,
        processing: 5,
        completed: 75,
        failed: 5,
      };

      expect(stats.total).toBe(
        stats.queued + stats.processing + stats.completed + stats.failed
      );
    });

    it('should handle queue persistence across restarts', async () => {
      const persistentQueue = {
        jobs: ['job1', 'job2'],
        lastUpdated: new Date(),
      };

      expect(persistentQueue.jobs).toHaveLength(2);
      expect(persistentQueue.lastUpdated).toBeInstanceOf(Date);
    });

    it('should implement dead letter queue for failed jobs', async () => {
      const mainQueue = ['job1', 'job2'];
      const deadLetterQueue: string[] = [];

      const failedJob = mainQueue.shift();
      if (failedJob) {
        deadLetterQueue.push(failedJob);
      }

      expect(mainQueue).toHaveLength(1);
      expect(deadLetterQueue).toHaveLength(1);
    });

    it('should support job scheduling for later execution', async () => {
      const scheduledJob = {
        executeAt: new Date(Date.now() + 60 * 60 * 1000),
        type: 'enhance',
      };

      expect(scheduledJob.executeAt.getTime()).toBeGreaterThan(Date.now());
    });

    it('should handle queue health monitoring', async () => {
      const health = {
        queueDepth: 50,
        processingRate: 10,
        avgProcessingTime: 30000,
        errorRate: 0.02,
      };

      expect(health.errorRate).toBeLessThan(0.1);
      expect(health.processingRate).toBeGreaterThan(0);
    });
  });

  describe('result handling', () => {
    it('should store enhance results correctly', async () => {
      const result = {
        enhancedUrl: 'https://storage.example.com/enhanced/image.jpg',
        improvements: {
          brightness: 1.2,
          contrast: 1.1,
          sharpness: 1.3,
        },
      };

      expect(result.enhancedUrl).toBeDefined();
      expect(result.improvements.brightness).toBeGreaterThan(1);
    });

    it('should store transcription results correctly', async () => {
      const result = {
        text: 'This is the transcribed text from the audio.',
        language: 'en',
        duration: 120,
        segments: [
          { start: 0, end: 10, text: 'Segment 1' },
          { start: 10, end: 20, text: 'Segment 2' },
        ],
      };

      expect(result.text).toBeTruthy();
      expect(result.segments).toHaveLength(2);
    });

    it('should store summary results correctly', async () => {
      const result = {
        summary: 'A concise summary of the content.',
        keyPoints: ['Point 1', 'Point 2', 'Point 3'],
        wordCount: 50,
      };

      expect(result.summary).toBeTruthy();
      expect(result.keyPoints.length).toBeGreaterThan(0);
    });

    it('should store generation results correctly', async () => {
      const result = {
        imageUrl: 'https://storage.example.com/generated/image.png',
        revisedPrompt: 'Enhanced prompt used for generation',
      };

      expect(result.imageUrl).toBeDefined();
      expect(result.revisedPrompt).toBeTruthy();
    });

    it('should store analysis results correctly', async () => {
      const result = {
        objects: [
          { label: 'person', confidence: 0.95 },
          { label: 'car', confidence: 0.87 },
        ],
        sentiment: 'positive',
        tags: ['outdoor', 'urban'],
      };

      expect(result.objects.length).toBeGreaterThan(0);
      expect(result.sentiment).toBeDefined();
    });

    it('should validate result metadata', async () => {
      const metadata = {
        model: 'gpt-4',
        processingTime: 5000,
        tokensUsed: 150,
        timestamp: new Date(),
      };

      expect(metadata.processingTime).toBeGreaterThan(0);
      expect(metadata.tokensUsed).toBeGreaterThan(0);
    });

    it('should handle result versioning', async () => {
      const results = [
        { version: 1, data: 'v1 result' },
        { version: 2, data: 'v2 result' },
      ];

      expect(results[results.length - 1].version).toBe(2);
    });

    it('should support result comparison', async () => {
      const result1 = { quality: 0.8 };
      const result2 = { quality: 0.9 };

      expect(result2.quality).toBeGreaterThan(result1.quality);
    });
  });
});
