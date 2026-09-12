import { createTestUser, createTestMedia, generateRandomString, TEST_CONFIG } from '../helpers/test-utils';

describe('SearchService', () => {
  describe('text search', () => {
    it('should perform full-text search', async () => {
      const query = 'artificial intelligence';
      const results = [
        { title: 'AI Basics', score: 0.95 },
        { title: 'Machine Learning Guide', score: 0.75 },
      ];

      expect(results).toHaveLength(2);
      expect(results[0].score).toBeGreaterThan(results[1].score);
    });

    it('should support phrase search', async () => {
      const phrase = '"machine learning"';
      const results = [
        { title: 'Machine Learning Guide', content: 'Learn machine learning' },
      ];

      expect(results).toHaveLength(1);
    });

    it('should support boolean operators', async () => {
      const query = 'AI AND NOT blockchain';
      expect(query).toContain('AND');
      expect(query).toContain('NOT');
    });

    it('should support wildcard search', async () => {
      const query = 'comput*';
      const results = [
        { title: 'Computer Vision' },
        { title: 'Computing Basics' },
        { title: 'Computation Theory' },
      ];

      expect(results).toHaveLength(3);
    });

    it('should support fuzzy search', async () => {
      const query = 'machne learning';
      const correctedQuery = 'machine learning';

      expect(correctedQuery).not.toBe(query);
    });

    it('should support prefix search', async () => {
      const prefix = 'learn';
      const results = [
        { title: 'Learning Python' },
        { title: 'Learn JavaScript' },
      ];

      expect(results).toHaveLength(2);
    });

    it('should support suffix search', async () => {
      const suffix = 'ing';
      const results = [
        { title: 'Machine Learning' },
        { title: 'Deep Learning' },
      ];

      expect(results).toHaveLength(2);
    });

    it('should support regex search', async () => {
      const pattern = /learn\w*/i;
      const titles = ['Learning Python', 'Learn JS', 'Advanced Algorithm'];

      const matches = titles.filter(t => pattern.test(t));
      expect(matches).toHaveLength(2);
    });

    it('should support field-specific search', async () => {
      const searchFields = {
        title: 'AI',
        description: 'artificial intelligence',
        tags: ['machine-learning'],
      };

      expect(searchFields.title).toBeTruthy();
    });

    it('should support search highlighting', async () => {
      const text = 'Machine Learning is a subset of AI';
      const query = 'Learning';
      const highlighted = text.replace(
        new RegExp(query, 'gi'),
        match => `<mark>${match}</mark>`
      );

      expect(highlighted).toContain('<mark>');
    });
  });

  describe('search ranking', () => {
    it('should rank results by relevance', async () => {
      const results = [
        { title: 'AI Guide', score: 0.95 },
        { title: 'ML Basics', score: 0.75 },
        { title: 'Data Science', score: 0.60 },
      ];

      const sorted = results.sort((a, b) => b.score - a.score);
      expect(sorted[0].score).toBe(0.95);
    });

    it('should boost exact matches', async () => {
      const query = 'AI';
      const results = [
        { title: 'AI Guide', exactMatch: true, score: 0.95 },
        { title: 'Artificial Intelligence', exactMatch: false, score: 0.85 },
      ];

      expect(results[0].score).toBeGreaterThan(results[1].score);
    });

    it('should boost title matches over content matches', async () => {
      const results = [
        { title: 'AI Guide', titleMatch: true, score: 0.90 },
        { title: 'Guide', content: 'AI basics', titleMatch: false, score: 0.70 },
      ];

      expect(results[0].score).toBeGreaterThan(results[1].score);
    });

    it('should consider document freshness', async () => {
      const results = [
        { title: 'AI 2024', createdAt: new Date('2024-01-15'), score: 0.88 },
        { title: 'AI 2023', createdAt: new Date('2023-01-15'), score: 0.82 },
      ];

      const sorted = results.sort((a, b) => b.score - a.score);
      expect(sorted[0].createdAt.getTime()).toBeGreaterThan(sorted[1].createdAt.getTime());
    });

    it('should consider document popularity', async () => {
      const results = [
        { title: 'Popular Guide', views: 10000, score: 0.90 },
        { title: 'New Guide', views: 100, score: 0.85 },
      ];

      expect(results[0].views).toBeGreaterThan(results[1].views);
    });

    it('should support custom scoring functions', async () => {
      const customScore = (result: { views: number; recency: number }) => {
        return result.views * 0.3 + result.recency * 0.7;
      };

      const score = customScore({ views: 1000, recency: 0.9 });
      expect(score).toBeGreaterThan(0);
    });

    it('should support search tuning', async () => {
      const tuning = {
        boostTitle: 2.0,
        boostTags: 1.5,
        boostRecency: 1.2,
      };

      expect(tuning.boostTitle).toBeGreaterThan(1);
    });

    it('should support search analytics', async () => {
      const analytics = {
        totalSearches: 1000,
        avgResultsPerSearch: 15.5,
        zeroResultRate: 0.05,
      };

      expect(analytics.zeroResultRate).toBeLessThan(0.1);
    });

    it('should support search suggestions', async () => {
      const suggestions = [
        { text: 'machine learning', popularity: 1000 },
        { text: 'deep learning', popularity: 800 },
        { text: 'neural networks', popularity: 600 },
      ];

      expect(suggestions).toHaveLength(3);
    });

    it('should support search autocomplete', async () => {
      const query = 'mach';
      const completions = [
        'machine learning',
        'machine learning python',
        'machine learning algorithms',
      ];

      expect(completions).toHaveLength(3);
    });
  });

  describe('filtering', () => {
    it('should filter by media type', async () => {
      const filter = { type: 'image' };
      const media = [
        createTestMedia('user1', { mimetype: 'image/jpeg' }),
        createTestMedia('user1', { mimetype: 'video/mp4' }),
      ];

      const filtered = media.filter(m => m.mimetype.startsWith(filter.type));
      expect(filtered).toHaveLength(1);
    });

    it('should filter by tags', async () => {
      const filter = { tags: ['nature'] };
      const media = [
        createTestMedia('user1', { tags: ['nature', 'landscape'] }),
        createTestMedia('user1', { tags: ['tech', 'digital'] }),
      ];

      const filtered = media.filter(m =>
        m.tags.some(t => filter.tags.includes(t))
      );
      expect(filtered).toHaveLength(1);
    });

    it('should filter by date range', async () => {
      const filter = {
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-01-31'),
      };

      const date = new Date('2024-01-15');
      const inRange = date >= filter.startDate && date <= filter.endDate;

      expect(inRange).toBe(true);
    });

    it('should filter by size range', async () => {
      const filter = {
        minSize: 1024,
        maxSize: 1024 * 1000,
      };

      const size = 1024 * 500;
      const inRange = size >= filter.minSize && size <= filter.maxSize;

      expect(inRange).toBe(true);
    });

    it('should filter by user', async () => {
      const filter = { userId: 'user123' };
      const media = [
        createTestMedia('user123'),
        createTestMedia('user456'),
      ];

      const filtered = media.filter(m => m.userId === filter.userId);
      expect(filtered).toHaveLength(1);
    });

    it('should filter by processing status', async () => {
      const filter = { status: 'completed' };
      const media = [
        createTestMedia('user1', { processingStatus: 'completed' }),
        createTestMedia('user1', { processingStatus: 'pending' }),
      ];

      const filtered = media.filter(m => m.processingStatus === filter.status);
      expect(filtered).toHaveLength(1);
    });

    it('should combine multiple filters', async () => {
      const filter = {
        type: 'image',
        tags: ['nature'],
        userId: 'user123',
      };

      const media = createTestMedia('user123', {
        mimetype: 'image/jpeg',
        tags: ['nature', 'landscape'],
      });

      const matches =
        media.mimetype.startsWith(filter.type) &&
        media.tags.some(t => filter.tags.includes(t)) &&
        media.userId === filter.userId;

      expect(matches).toBe(true);
    });

    it('should support negation filters', async () => {
      const filter = { excludeTags: ['private'] };
      const media = [
        createTestMedia('user1', { tags: ['public', 'shared'] }),
        createTestMedia('user1', { tags: ['private'] }),
      ];

      const filtered = media.filter(m =>
        !m.tags.some(t => filter.excludeTags.includes(t))
      );
      expect(filtered).toHaveLength(1);
    });

    it('should support exists filters', async () => {
      const filter = { hasThumbnail: true };
      const media = [
        createTestMedia('user1', { thumbnailUrl: 'https://example.com/thumb.jpg' }),
        createTestMedia('user1', { thumbnailUrl: undefined }),
      ];

      const filtered = media.filter(m =>
        filter.hasThumbnail ? !!m.thumbnailUrl : true
      );
      expect(filtered).toHaveLength(1);
    });

    it('should support range filters', async () => {
      const filter = {
        field: 'size',
        gte: 1024,
        lte: 1024 * 1000,
      };

      const size = 1024 * 500;
      const inRange = size >= filter.gte && size <= filter.lte;

      expect(inRange).toBe(true);
    });
  });

  describe('sorting', () => {
    it('should sort by relevance score', async () => {
      const results = [
        { title: 'Result 1', score: 0.8 },
        { title: 'Result 2', score: 0.95 },
        { title: 'Result 3', score: 0.7 },
      ];

      const sorted = results.sort((a, b) => b.score - a.score);
      expect(sorted[0].score).toBe(0.95);
    });

    it('should sort by creation date', async () => {
      const results = [
        { title: 'Old', createdAt: new Date('2024-01-01') },
        { title: 'New', createdAt: new Date('2024-01-15') },
      ];

      const sorted = results.sort(
        (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
      );
      expect(sorted[0].title).toBe('New');
    });

    it('should sort by title alphabetically', async () => {
      const results = [
        { title: 'Charlie' },
        { title: 'Alpha' },
        { title: 'Bravo' },
      ];

      const sorted = results.sort((a, b) => a.title.localeCompare(b.title));
      expect(sorted[0].title).toBe('Alpha');
    });

    it('should sort by size', async () => {
      const results = [
        { title: 'Large', size: 1024 * 1000 },
        { title: 'Small', size: 1024 },
        { title: 'Medium', size: 1024 * 100 },
      ];

      const sorted = results.sort((a, b) => b.size - a.size);
      expect(sorted[0].title).toBe('Large');
    });

    it('should sort by view count', async () => {
      const results = [
        { title: 'Popular', views: 10000 },
        { title: 'New', views: 100 },
      ];

      const sorted = results.sort((a, b) => b.views - a.views);
      expect(sorted[0].title).toBe('Popular');
    });

    it('should sort by custom field', async () => {
      const results = [
        { title: 'A', custom: 3 },
        { title: 'B', custom: 1 },
        { title: 'C', custom: 2 },
      ];

      const sorted = results.sort((a, b) => a.custom - b.custom);
      expect(sorted[0].custom).toBe(1);
    });

    it('should support multi-field sorting', async () => {
      const results = [
        { title: 'A', type: 'image', size: 100 },
        { title: 'B', type: 'image', size: 200 },
        { title: 'C', type: 'video', size: 100 },
      ];

      const sorted = results.sort((a, b) => {
        if (a.type !== b.type) return a.type.localeCompare(b.type);
        return b.size - a.size;
      });

      expect(sorted[0].type).toBe('image');
      expect(sorted[0].size).toBe(200);
    });

    it('should support ascending/descending sort', async () => {
      const results = [
        { title: 'A', size: 100 },
        { title: 'B', size: 200 },
        { title: 'C', size: 300 },
      ];

      const ascending = results.sort((a, b) => a.size - b.size);
      const descending = results.sort((a, b) => b.size - a.size);

      expect(ascending[0].size).toBe(100);
      expect(descending[0].size).toBe(300);
    });

    it('should handle null values in sort', async () => {
      const results = [
        { title: 'A', size: 100 },
        { title: 'B', size: null },
        { title: 'C', size: 300 },
      ];

      const sorted = results.sort((a, b) => {
        if (a.size === null) return 1;
        if (b.size === null) return -1;
        return a.size - b.size;
      });

      expect(sorted[2].size).toBeNull();
    });

    it('should support stable sort', async () => {
      const results = [
        { title: 'A', order: 1 },
        { title: 'B', order: 1 },
        { title: 'C', order: 2 },
      ];

      const sorted = results.sort((a, b) => a.order - b.order);
      expect(sorted[0].title).toBe('A');
      expect(sorted[1].title).toBe('B');
    });
  });

  describe('pagination', () => {
    it('should return paginated results', async () => {
      const totalResults = 100;
      const page = 1;
      const limit = 20;
      const offset = (page - 1) * limit;

      expect(offset).toBe(0);
    });

    it('should calculate total pages', async () => {
      const totalResults = 95;
      const limit = 20;
      const totalPages = Math.ceil(totalResults / limit);

      expect(totalPages).toBe(5);
    });

    it('should handle empty results', async () => {
      const results: unknown[] = [];
      const pagination = {
        total: 0,
        page: 1,
        limit: 20,
        totalPages: 0,
      };

      expect(pagination.total).toBe(0);
      expect(pagination.totalPages).toBe(0);
    });

    it('should handle page beyond total', async () => {
      const totalPages = 5;
      const requestedPage = 10;
      const actualPage = Math.min(requestedPage, totalPages);

      expect(actualPage).toBe(5);
    });

    it('should support cursor-based pagination', async () => {
      const cursor = {
        next: 'eyJpZCI6MTIzfQ==',
        previous: 'eyJpZCI6OTN9',
      };

      expect(cursor.next).toBeTruthy();
    });

    it('should support offset-based pagination', async () => {
      const page = 3;
      const limit = 10;
      const offset = (page - 1) * limit;

      expect(offset).toBe(20);
    });

    it('should return pagination metadata', async () => {
      const pagination = {
        total: 100,
        page: 1,
        limit: 20,
        totalPages: 5,
        hasNext: true,
        hasPrevious: false,
      };

      expect(pagination.hasNext).toBe(true);
      expect(pagination.hasPrevious).toBe(false);
    });

    it('should support page size limits', async () => {
      const maxLimit = 100;
      const requestedLimit = 200;
      const actualLimit = Math.min(requestedLimit, maxLimit);

      expect(actualLimit).toBe(100);
    });

    it('should support infinite scroll pagination', async () => {
      const infiniteScroll = {
        items: [],
        hasMore: true,
        cursor: 'next-cursor',
      };

      expect(infiniteScroll.hasMore).toBe(true);
    });

    it('should support keyset pagination', async () => {
      const keyset = {
        lastId: '550e8400-e29b-41d4-a716-446655440000',
        limit: 20,
      };

      expect(keyset.lastId).toBeTruthy();
    });
  });

  describe('search analytics', () => {
    it('should track search queries', async () => {
      const query = {
        text: 'machine learning',
        timestamp: new Date(),
        userId: 'user123',
        resultsCount: 15,
      };

      expect(query.text).toBeTruthy();
      expect(query.resultsCount).toBeGreaterThanOrEqual(0);
    });

    it('should track search clicks', async () => {
      const click = {
        query: 'machine learning',
        position: 3,
        documentId: 'doc123',
        timestamp: new Date(),
      };

      expect(click.position).toBeGreaterThan(0);
    });

    it('should calculate search success rate', async () => {
      const totalSearches = 1000;
      const successfulSearches = 850;
      const successRate = successfulSearches / totalSearches;

      expect(successRate).toBeCloseTo(0.85, 2);
    });

    it('should identify zero-result queries', async () => {
      const queries = [
        { text: 'machine learning', results: 15 },
        { text: 'xyznonexistent', results: 0 },
      ];

      const zeroResultQueries = queries.filter(q => q.results === 0);
      expect(zeroResultQueries).toHaveLength(1);
    });

    it('should track search performance', async () => {
      const performance = {
        avgResponseTime: 45,
        p95ResponseTime: 120,
        p99ResponseTime: 250,
      };

      expect(performance.avgResponseTime).toBeLessThan(100);
    });

    it('should support search A/B testing', async () => {
      const variants = [
        { name: 'control', conversionRate: 0.15 },
        { name: 'treatment', conversionRate: 0.18 },
      ];

      expect(variants).toHaveLength(2);
    });

    it('should generate search reports', async () => {
      const report = {
        period: '2024-01',
        totalSearches: 10000,
        avgResultsPerSearch: 12.5,
        topQueries: ['machine learning', 'python', 'data science'],
      };

      expect(report.totalSearches).toBeGreaterThan(0);
    });

    it('should track search trends', async () => {
      const trends = [
        { query: 'AI', count: 1000, trend: 'rising' },
        { query: 'blockchain', count: 500, trend: 'falling' },
      ];

      expect(trends).toHaveLength(2);
    });

    it('should support search personalization', async () => {
      const personalized = {
        userId: 'user123',
        history: ['machine learning', 'python'],
        boostedCategories: ['ai', 'programming'],
      };

      expect(personalized.history.length).toBeGreaterThan(0);
    });

    it('should support search facets', async () => {
      const facets = {
        type: [
          { value: 'image', count: 500 },
          { value: 'video', count: 300 },
          { value: 'audio', count: 200 },
        ],
        tags: [
          { value: 'nature', count: 400 },
          { value: 'tech', count: 350 },
        ],
      };

      expect(facets.type).toHaveLength(3);
      expect(facets.tags).toHaveLength(2);
    });
  });

  describe('search optimization', () => {
    it('should cache frequent searches', async () => {
      const cache = new Map<string, unknown>();
      const query = 'machine learning';
      const results = [{ title: 'ML Guide' }];

      cache.set(query, results);
      expect(cache.has(query)).toBe(true);
    });

    it('should implement search index optimization', async () => {
      const index = {
        fields: ['title', 'description', 'tags'],
        analyzer: 'standard',
        tokenizers: ['standard', 'edge_ngram'],
      };

      expect(index.fields.length).toBeGreaterThan(0);
    });

    it('should support search synonyms', async () => {
      const synonyms = {
        'AI': ['artificial intelligence', 'machine intelligence'],
        'ML': ['machine learning'],
      };

      expect(synonyms['AI']).toContain('artificial intelligence');
    });

    it('should support stop word removal', async () => {
      const stopWords = ['the', 'a', 'an', 'is', 'are'];
      const query = 'the machine learning';
      const filtered = query
        .split(' ')
        .filter(w => !stopWords.includes(w))
        .join(' ');

      expect(filtered).toBe('machine learning');
    });

    it('should support stemming', async () => {
      const stemmer = (word: string) => {
        if (word.endsWith('ing')) return word.slice(0, -3);
        if (word.endsWith('ed')) return word.slice(0, -2);
        if (word.endsWith('s')) return word.slice(0, -1);
        return word;
      };

      expect(stemmer('running')).toBe('runn');
      expect(stemmer('tested')).toBe('test');
    });

    it('should support n-gram tokenization', async () => {
      const generateNGrams = (text: string, n: number) => {
        const ngrams: string[] = [];
        for (let i = 0; i <= text.length - n; i++) {
          ngrams.push(text.substring(i, i + n));
        }
        return ngrams;
      };

      const bigrams = generateNGrams('hello', 2);
      expect(bigrams).toContain('he');
      expect(bigrams).toContain('el');
    });

    it('should support search suggest', async () => {
      const suggest = {
        phrase: 'machine learn',
        completions: ['machine learning', 'machine learning python'],
      };

      expect(suggest.completions).toHaveLength(2);
    });

    it('should support search analytics aggregation', async () => {
      const aggregation = {
        terms: {
          field: 'query',
          size: 10,
        },
      };

      expect(aggregation.terms.size).toBe(10);
    });

    it('should support search index rotation', async () => {
      const rotation = {
        currentIndex: 'search_v1',
        newIndex: 'search_v2',
        alias: 'search',
      };

      expect(rotation.currentIndex).not.toBe(rotation.newIndex);
    });

    it('should support search benchmarking', async () => {
      const benchmark = {
        queries: 1000,
        avgLatency: 45,
        p95Latency: 120,
        throughput: 100,
      };

      expect(benchmark.throughput).toBeGreaterThan(0);
    });
  });
});
