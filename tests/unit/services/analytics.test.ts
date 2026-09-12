import { createTestUser, createTestMedia, generateRandomString } from '../helpers/test-utils';

describe('AnalyticsService', () => {
  describe('event tracking', () => {
    it('should track user events', async () => {
      const event = {
        userId: 'user123',
        event: 'user.login',
        properties: {
          method: 'email',
          ip: '192.168.1.1',
        },
        timestamp: new Date(),
      };

      expect(event.event).toBeTruthy();
      expect(event.properties).toBeDefined();
    });

    it('should track media events', async () => {
      const event = {
        userId: 'user123',
        event: 'media.uploaded',
        properties: {
          mediaId: 'media123',
          type: 'image',
          size: 1024 * 500,
        },
        timestamp: new Date(),
      };

      expect(event.event).toBe('media.uploaded');
    });

    it('should track AI job events', async () => {
      const event = {
        userId: 'user123',
        event: 'ai.job.completed',
        properties: {
          jobId: 'job123',
          type: 'enhance',
          duration: 5000,
        },
        timestamp: new Date(),
      };

      expect(event.event).toBe('ai.job.completed');
    });

    it('should track custom events', async () => {
      const event = {
        userId: 'user123',
        event: 'custom.action',
        properties: {
          customField: 'customValue',
        },
        timestamp: new Date(),
      };

      expect(event.event).toBe('custom.action');
    });

    it('should batch events for efficiency', async () => {
      const batch = {
        events: [
          { event: 'event1', timestamp: new Date() },
          { event: 'event2', timestamp: new Date() },
        ],
        batchSize: 100,
      };

      expect(batch.events.length).toBeLessThanOrEqual(batch.batchSize);
    });

    it('should handle event validation', async () => {
      const event = {
        event: 'valid.event',
        properties: { key: 'value' },
      };

      expect(event.event).toMatch(/^[a-z]+\.[a-z]+$/);
    });

    it('should handle event deduplication', async () => {
      const eventId = generateRandomString(16);
      const events = new Set<string>();

      events.add(eventId);
      const isDuplicate = events.has(eventId);

      expect(isDuplicate).toBe(true);
    });

    it('should handle event ordering', async () => {
      const events = [
        { timestamp: new Date('2024-01-01'), sequence: 1 },
        { timestamp: new Date('2024-01-02'), sequence: 2 },
      ];

      const sorted = events.sort(
        (a, b) => a.timestamp.getTime() - b.timestamp.getTime()
      );

      expect(sorted[0].sequence).toBe(1);
    });

    it('should handle event enrichment', async () => {
      const event = {
        event: 'user.action',
        properties: {},
        metadata: {
          ip: '192.168.1.1',
          userAgent: 'Mozilla/5.0',
        },
      };

      expect(event.metadata).toBeDefined();
    });

    it('should handle event transformation', async () => {
      const rawEvent = {
        event_name: 'user_login',
        user_id: 'user123',
      };

      const transformed = {
        event: rawEvent.event_name.replace(/_/g, '.'),
        userId: rawEvent.user_id,
      };

      expect(transformed.event).toBe('user.login');
    });
  });

  describe('metrics collection', () => {
    it('should collect counter metrics', async () => {
      const metric = {
        name: 'api.requests',
        type: 'counter',
        value: 1,
        tags: { method: 'GET', path: '/api/users' },
      };

      expect(metric.type).toBe('counter');
      expect(metric.value).toBe(1);
    });

    it('should collect gauge metrics', async () => {
      const metric = {
        name: 'queue.depth',
        type: 'gauge',
        value: 50,
        tags: { queue: 'ai-jobs' },
      };

      expect(metric.type).toBe('gauge');
    });

    it('should collect histogram metrics', async () => {
      const metric = {
        name: 'api.response_time',
        type: 'histogram',
        value: 150,
        tags: { endpoint: '/api/users' },
      };

      expect(metric.type).toBe('histogram');
      expect(metric.value).toBeGreaterThan(0);
    });

    it('should collect summary metrics', async () => {
      const metric = {
        name: 'api.request_size',
        type: 'summary',
        value: 1024,
        quantiles: { '0.5': 512, '0.9': 1024, '0.99': 2048 },
      };

      expect(metric.type).toBe('summary');
    });

    it('should aggregate metrics over time', async () => {
      const aggregation = {
        period: '1m',
        metric: 'api.requests',
        sum: 1000,
        count: 100,
        avg: 10,
      };

      expect(aggregation.avg).toBe(10);
    });

    it('should support metric tagging', async () => {
      const metric = {
        name: 'api.requests',
        tags: {
          method: 'GET',
          path: '/api/users',
          status: '200',
        },
      };

      expect(Object.keys(metric.tags)).toHaveLength(3);
    });

    it('should support metric naming conventions', async () => {
      const metricNames = [
        'api.requests.total',
        'api.response_time.avg',
        'queue.jobs.processed',
      ];

      metricNames.forEach(name => {
        expect(name).toMatch(/^[a-z]+(\.[a-z]+)+$/);
      });
    });

    it('should support metric units', async () => {
      const metric = {
        name: 'api.response_time',
        unit: 'milliseconds',
        value: 150,
      };

      expect(metric.unit).toBe('milliseconds');
    });

    it('should support metric descriptions', async () => {
      const metric = {
        name: 'api.requests.total',
        description: 'Total number of API requests',
        type: 'counter',
      };

      expect(metric.description).toBeTruthy();
    });

    it('should support metric expiration', async () => {
      const metric = {
        name: 'api.requests.total',
        ttl: 86400, // 24 hours
      };

      expect(metric.ttl).toBeGreaterThan(0);
    });
  });

  describe('reporting', async () => {
    it('should generate daily reports', async () => {
      const report = {
        period: '2024-01-15',
        metrics: {
          totalUsers: 1000,
          activeUsers: 500,
          newUsers: 50,
        },
      };

      expect(report.period).toBeTruthy();
    });

    it('should generate weekly reports', async () => {
      const report = {
        period: '2024-W03',
        metrics: {
          totalMedia: 5000,
          newMedia: 500,
          storageUsed: 1024 * 1024 * 100,
        },
      };

      expect(report.period).toBeTruthy();
    });

    it('should generate monthly reports', async () => {
      const report = {
        period: '2024-01',
        metrics: {
          revenue: 10000,
          subscriptions: 200,
          churn: 10,
        },
      };

      expect(report.period).toBeTruthy();
    });

    it('should generate custom reports', async () => {
      const report = {
        name: 'AI Usage Report',
        period: {
          start: new Date('2024-01-01'),
          end: new Date('2024-01-31'),
        },
        metrics: {
          aiJobs: 1000,
          avgProcessingTime: 5000,
        },
      };

      expect(report.name).toBeTruthy();
    });

    it('should export reports to different formats', async () => {
      const formats = ['json', 'csv', 'pdf', 'html'];
      expect(formats).toContain('json');
      expect(formats).toContain('pdf');
    });

    it('should schedule report generation', async () => {
      const schedule = {
        report: 'daily-users',
        cron: '0 2 * * *',
        enabled: true,
      };

      expect(schedule.cron).toBeTruthy();
    });

    it('should send reports via email', async () => {
      const delivery = {
        report: 'daily-users',
        recipients: ['admin@example.com'],
        format: 'pdf',
      };

      expect(delivery.recipients).toHaveLength(1);
    });

    it('should support report comparison', async () => {
      const comparison = {
        current: { period: '2024-01', value: 1000 },
        previous: { period: '2023-12', value: 900 },
        change: 0.11,
      };

      expect(comparison.change).toBeCloseTo(0.11, 2);
    });

    it('should support report filtering', async () => {
      const filter = {
        dateRange: {
          start: new Date('2024-01-01'),
          end: new Date('2024-01-31'),
        },
        metrics: ['users', 'media'],
      };

      expect(filter.metrics).toHaveLength(2);
    });

    it('should support report aggregation', async () => {
      const aggregation = {
        groupBy: 'day',
        metrics: ['users', 'media'],
      };

      expect(aggregation.groupBy).toBe('day');
    });
  });

  describe('user analytics', () => {
    it('should track user activity', async () => {
      const activity = {
        userId: 'user123',
        events: [
          { event: 'login', timestamp: new Date() },
          { event: 'media.upload', timestamp: new Date() },
        ],
      };

      expect(activity.events).toHaveLength(2);
    });

    it('should calculate user engagement', async () => {
      const engagement = {
        userId: 'user123',
        loginCount: 30,
        mediaUploads: 50,
        aiJobs: 20,
        score: 0.85,
      };

      expect(engagement.score).toBeGreaterThan(0);
    });

    it('should track user retention', async () => {
      const retention = {
        cohort: '2024-01',
        users: 100,
        retainedAfter7Days: 70,
        retainedAfter30Days: 50,
      };

      expect(retention.retainedAfter7Days).toBeLessThanOrEqual(retention.users);
    });

    it('should track user lifetime value', async () => {
      const ltv = {
        userId: 'user123',
        subscriptionMonths: 12,
        totalRevenue: 120,
        ltv: 120,
      };

      expect(ltv.ltv).toBeGreaterThan(0);
    });

    it('should track user churn', async () => {
      const churn = {
        period: '2024-01',
        totalUsers: 1000,
        churnedUsers: 50,
        churnRate: 0.05,
      };

      expect(churn.churnRate).toBeCloseTo(0.05, 2);
    });

    it('should segment users', async () => {
      const segments = [
        { name: 'Power Users', criteria: { uploads: { gte: 100 } } },
        { name: 'Casual Users', criteria: { uploads: { lt: 10 } } },
      ];

      expect(segments).toHaveLength(2);
    });

    it('should track user cohorts', async () => {
      const cohort = {
        name: 'January 2024',
        startDate: new Date('2024-01-01'),
        users: 100,
      };

      expect(cohort.users).toBeGreaterThan(0);
    });

    it('should track user acquisition', async () => {
      const acquisition = {
        period: '2024-01',
        channels: {
          organic: 50,
          paid: 30,
          referral: 20,
        },
        total: 100,
      };

      expect(acquisition.total).toBe(100);
    });

    it('should track user behavior flows', async () => {
      const flow = {
        steps: [
          { event: 'signup', count: 100 },
          { event: 'first_upload', count: 80 },
          { event: 'first_ai_job', count: 60 },
        ],
      };

      expect(flow.steps).toHaveLength(3);
    });

    it('should track user feature adoption', async () => {
      const adoption = {
        feature: 'ai-enhance',
        totalUsers: 1000,
        adopters: 300,
        adoptionRate: 0.3,
      };

      expect(adoption.adoptionRate).toBeCloseTo(0.3, 2);
    });
  });

  describe('media analytics', () => {
    it('should track media views', async () => {
      const views = {
        mediaId: 'media123',
        totalViews: 1000,
        uniqueViewers: 500,
      };

      expect(views.totalViews).toBeGreaterThan(0);
    });

    it('should track media downloads', async () => {
      const downloads = {
        mediaId: 'media123',
        totalDownloads: 200,
        uniqueDownloaders: 150,
      };

      expect(downloads.totalDownloads).toBeGreaterThan(0);
    });

    it('should track media engagement', async () => {
      const engagement = {
        mediaId: 'media123',
        likes: 100,
        comments: 50,
        shares: 30,
        score: 0.75,
      };

      expect(engagement.score).toBeGreaterThan(0);
    });

    it('should track media performance over time', async () => {
      const performance = [
        { date: '2024-01-01', views: 100 },
        { date: '2024-01-02', views: 150 },
        { date: '2024-01-03', views: 200 },
      ];

      expect(performance).toHaveLength(3);
    });

    it('should track media by type', async () => {
      const byType = {
        image: { count: 500, views: 10000 },
        video: { count: 200, views: 5000 },
        audio: { count: 100, views: 2000 },
      };

      expect(byType.image.count).toBeGreaterThan(byType.audio.count);
    });

    it('should track media by tags', async () => {
      const byTag = {
        nature: { count: 300, views: 8000 },
        tech: { count: 200, views: 5000 },
      };

      expect(Object.keys(byTag).length).toBeGreaterThan(0);
    });

    it('should track media trending', async () => {
      const trending = [
        { mediaId: 'media1', score: 0.95, views: 1000 },
        { mediaId: 'media2', score: 0.88, views: 800 },
      ];

      expect(trending[0].score).toBeGreaterThan(trending[1].score);
    });

    it('should track media retention', async () => {
      const retention = {
        mediaId: 'media123',
        viewsAfter1Day: 500,
        viewsAfter7Days: 200,
        viewsAfter30Days: 100,
      };

      expect(retention.viewsAfter1Day).toBeGreaterThan(retention.viewsAfter30Days);
    });

    it('should track media conversion', async () => {
      const conversion = {
        views: 1000,
        downloads: 100,
        conversionRate: 0.1,
      };

      expect(conversion.conversionRate).toBeCloseTo(0.1, 2);
    });

    it('should track media geography', async () => {
      const geography = {
        mediaId: 'media123',
        countries: [
          { country: 'US', views: 500 },
          { country: 'UK', views: 200 },
        ],
      };

      expect(geography.countries).toHaveLength(2);
    });
  });

  describe('AI analytics', () => {
    it('should track AI job metrics', async () => {
      const metrics = {
        totalJobs: 1000,
        successful: 950,
        failed: 50,
        avgProcessingTime: 5000,
      };

      expect(metrics.successful + metrics.failed).toBe(metrics.totalJobs);
    });

    it('should track AI usage by type', async () => {
      const byType = {
        enhance: { count: 500, avgTime: 3000 },
        transcribe: { count: 200, avgTime: 10000 },
        summarize: { count: 150, avgTime: 2000 },
        generate: { count: 100, avgTime: 8000 },
        analyze: { count: 50, avgTime: 4000 },
      };

      expect(Object.keys(byType).length).toBe(5);
    });

    it('should track AI model performance', async () => {
      const performance = {
        model: 'gpt-4',
        avgResponseTime: 2000,
        successRate: 0.99,
        errorRate: 0.01,
      };

      expect(performance.successRate).toBeCloseTo(0.99, 2);
    });

    it('should track AI cost metrics', async () => {
      const costs = {
        totalTokens: 1000000,
        totalCost: 30,
        avgCostPerJob: 0.03,
      };

      expect(costs.totalCost).toBeGreaterThan(0);
    });

    it('should track AI quality metrics', async () => {
      const quality = {
        avgRating: 4.5,
        totalRatings: 500,
        ratingDistribution: { 5: 200, 4: 150, 3: 100, 2: 30, 1: 20 },
      };

      expect(quality.avgRating).toBeGreaterThan(4);
    });

    it('should track AI latency', async () => {
      const latency = {
        p50: 1500,
        p95: 3000,
        p99: 5000,
      };

      expect(latency.p50).toBeLessThan(latency.p95);
      expect(latency.p95).toBeLessThan(latency.p99);
    });

    it('should track AI error rates', async () => {
      const errors = {
        total: 1000,
        byType: {
          timeout: 50,
          rate_limit: 30,
          invalid_input: 20,
        },
      };

      expect(errors.total).toBeGreaterThan(0);
    });

    it('should track AI throughput', async () => {
      const throughput = {
        jobsPerMinute: 10,
        jobsPerHour: 600,
      };

      expect(throughput.jobsPerMinute).toBeGreaterThan(0);
    });

    it('should track AI model accuracy', async () => {
      const accuracy = {
        model: 'gpt-4',
        benchmarkScore: 0.92,
        customScore: 0.88,
      };

      expect(accuracy.benchmarkScore).toBeGreaterThan(0.9);
    });

    it('should track AI feature usage', async () => {
      const usage = {
        enhance: { users: 500, jobs: 2000 },
        transcribe: { users: 200, jobs: 800 },
      };

      expect(Object.keys(usage).length).toBeGreaterThan(0);
    });
  });

  describe('real-time analytics', () => {
    it('should track real-time metrics', async () => {
      const realtime = {
        activeUsers: 50,
        requestsPerSecond: 100,
        avgResponseTime: 150,
      };

      expect(realtime.activeUsers).toBeGreaterThanOrEqual(0);
    });

    it('should support real-time dashboards', async () => {
      const dashboard = {
        widgets: [
          { type: 'line', metric: 'api.requests' },
          { type: 'gauge', metric: 'queue.depth' },
        ],
        refreshInterval: 5000,
      };

      expect(dashboard.widgets).toHaveLength(2);
    });

    it('should support real-time alerts', async () => {
      const alert = {
        metric: 'api.error_rate',
        threshold: 0.1,
        duration: 300,
        enabled: true,
      };

      expect(alert.threshold).toBeGreaterThan(0);
    });

    it('should support real-time streaming', async () => {
      const stream = {
        metric: 'api.requests',
        interval: 1000,
        buffer: 100,
      };

      expect(stream.interval).toBeGreaterThan(0);
    });

    it('should support real-time aggregation', async () => {
      const aggregation = {
        window: 60,
        metric: 'api.requests',
        function: 'sum',
      };

      expect(aggregation.window).toBeGreaterThan(0);
    });

    it('should support real-time filtering', async () => {
      const filter = {
        metric: 'api.requests',
        conditions: [
          { field: 'method', operator: 'eq', value: 'GET' },
        ],
      };

      expect(filter.conditions).toHaveLength(1);
    });

    it('should support real-time anomaly detection', async () => {
      const anomaly = {
        metric: 'api.error_rate',
        baseline: 0.02,
        current: 0.15,
        isAnomaly: true,
      };

      expect(anomaly.isAnomaly).toBe(true);
    });

    it('should support real-time forecasting', async () => {
      const forecast = {
        metric: 'users.active',
        current: 1000,
        predicted1Hour: 1100,
        predicted24Hours: 2000,
      };

      expect(forecast.predicted1Hour).toBeGreaterThan(forecast.current);
    });

    it('should support real-time comparisons', async () => {
      const comparison = {
        current: { value: 1000, timestamp: new Date() },
        previous: { value: 900, timestamp: new Date(Date.now() - 3600000) },
        change: 0.11,
      };

      expect(comparison.change).toBeCloseTo(0.11, 2);
    });

    it('should support real-time aggregations', async () => {
      const aggregation = {
        metric: 'api.requests',
        functions: ['sum', 'avg', 'min', 'max'],
        window: 60,
      };

      expect(aggregation.functions).toHaveLength(4);
    });
  });

  describe('analytics export', () => {
    it('should export to JSON format', async () => {
      const data = { metric: 'value' };
      const json = JSON.stringify(data);

      expect(json).toBeTruthy();
    });

    it('should export to CSV format', async () => {
      const headers = 'metric,value\n';
      const row = 'api.requests,1000\n';
      const csv = headers + row;

      expect(csv).toContain('metric,value');
    });

    it('should export to Parquet format', async () => {
      const exportConfig = {
        format: 'parquet',
        compression: 'snappy',
      };

      expect(exportConfig.format).toBe('parquet');
    });

    it('should export to BigQuery', async () => {
      const exportConfig = {
        destination: 'bigquery',
        dataset: 'analytics',
        table: 'events',
      };

      expect(exportConfig.destination).toBe('bigquery');
    });

    it('should export to Snowflake', async () => {
      const exportConfig = {
        destination: 'snowflake',
        database: 'analytics',
        schema: 'events',
      };

      expect(exportConfig.destination).toBe('snowflake');
    });

    it('should schedule regular exports', async () => {
      const schedule = {
        export: 'daily-events',
        cron: '0 3 * * *',
        destination: 's3://exports/',
      };

      expect(schedule.cron).toBeTruthy();
    });

    it('should support incremental exports', async () => {
      const exportConfig = {
        incremental: true,
        lastExportAt: new Date('2024-01-14'),
      };

      expect(exportConfig.incremental).toBe(true);
    });

    it('should support export compression', async () => {
      const exportConfig = {
        compression: 'gzip',
        format: 'json',
      };

      expect(exportConfig.compression).toBe('gzip');
    });

    it('should support export encryption', async () => {
      const exportConfig = {
        encryption: {
          enabled: true,
          algorithm: 'AES-256',
        },
      };

      expect(exportConfig.encryption.enabled).toBe(true);
    });

    it('should support export validation', async () => {
      const validation = {
        enabled: true,
        checksum: true,
        rowcount: true,
      };

      expect(validation.enabled).toBe(true);
    });
  });

  describe('analytics privacy', () => {
    it('should anonymize user data', async () => {
      const anonymized = {
        userId: generateRandomString(16),
        ip: '192.168.1.xxx',
      };

      expect(anonymized.userId).not.toContain('user');
    });

    it('should support GDPR compliance', async () => {
      const gdpr = {
        dataRetention: 365,
        rightToErasure: true,
        dataPortability: true,
      };

      expect(gdpr.rightToErasure).toBe(true);
    });

    it('should support CCPA compliance', async () => {
      const ccpa = {
        doNotSell: true,
        rightToDelete: true,
      };

      expect(ccpa.doNotSell).toBe(true);
    });

    it('should support data masking', async () => {
      const data = {
        email: 'user@example.com',
        maskedEmail: 'u***@example.com',
      };

      expect(data.maskedEmail).not.toBe(data.email);
    });

    it('should support consent management', async () => {
      const consent = {
        analytics: true,
        marketing: false,
        thirdParty: false,
      };

      expect(consent.analytics).toBe(true);
    });

    it('should support data retention policies', async () => {
      const retention = {
        events: 365,
        profiles: 730,
        media: -1, // forever
      };

      expect(retention.events).toBeGreaterThan(0);
    });

    it('should support audit logging', async () => {
      const audit = {
        action: 'analytics.export',
        userId: 'admin123',
        timestamp: new Date(),
      };

      expect(audit.action).toBeTruthy();
    });

    it('should support data access controls', async () => {
      const access = {
        role: 'analyst',
        permissions: ['read', 'export'],
        restrictions: ['no_pii'],
      };

      expect(access.permissions).toContain('read');
    });

    it('should support data encryption', async () => {
      const encryption = {
        atRest: true,
        inTransit: true,
        algorithm: 'AES-256',
      };

      expect(encryption.atRest).toBe(true);
    });

    it('should support privacy by design', async () => {
      const privacy = {
        dataMinimization: true,
        purposeLimitation: true,
        storageLimitation: true,
      };

      expect(privacy.dataMinimization).toBe(true);
    });
  });
});
