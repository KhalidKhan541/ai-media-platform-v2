import { getAIProviderClient, createStructuredPrompt, type AIProvider } from './provider';

export type TimeGranularity = 'hourly' | 'daily' | 'weekly' | 'monthly';
export type TrendDirection = 'rising' | 'stable' | 'declining' | 'volatile';

export interface ChannelAnalytics {
  channelId: string;
  subscribers: number;
  totalViews: number;
  totalWatchTime: number;
  averageViewDuration: number;
  averageViewPercentage: number;
  estimatedRevenue: number;
  cpm: number;
  ctr: number;
  impressions: number;
  uniqueViewers: number;
  demographics: Demographics;
  topVideos: VideoPerformance[];
  recentGrowth: GrowthMetrics;
  period: { start: string; end: string };
}

export interface Demographics {
  ageGroups: Record<string, number>;
  genderSplit: Record<string, number>;
  topCountries: Array<{ country: string; percentage: number }>;
  topCities: Array<{ city: string; percentage: number }>;
  deviceTypes: Record<string, number>;
  watchTimeByDevice: Record<string, number>;
}

export interface VideoPerformance {
  videoId: string;
  title: string;
  views: number;
  likes: number;
  comments: number;
  shares: number;
  watchTime: number;
  averageViewDuration: number;
  averageViewPercentage: number;
  impressions: number;
  ctr: number;
  publishedAt: string;
  tags: string[];
  category: string;
}

export interface GrowthMetrics {
  subscribersGained: number;
  subscribersLost: number;
  netSubscribers: number;
  viewsGrowth: number;
  watchTimeGrowth: number;
  revenueGrowth: number;
  engagementRate: number;
  periodComparison: {
    previousPeriod: string;
    viewsChange: number;
    subscribersChange: number;
    revenueChange: number;
  };
}

export interface ViewPrediction {
  videoId?: string;
  channelId: string;
  predictions: PredictionPoint[];
  confidence: number;
  factors: PredictionFactor[];
  methodology: string;
  metadata: {
    provider: AIProvider;
    dataPoints: number;
    generatedAt: string;
    expiresAt: string;
  };
}

export interface PredictionPoint {
  date: string;
  predictedViews: number;
  lowerBound: number;
  upperBound: number;
  confidence: number;
}

export interface PredictionFactor {
  name: string;
  impact: 'positive' | 'negative' | 'neutral';
  weight: number;
  description: string;
  historicalCorrelation: number;
}

export interface TrendAnalysis {
  trends: TrendItem[];
  overallDirection: TrendDirection;
  momentum: number;
  seasonality: SeasonalityPattern;
  competitors: CompetitorTrend[];
  metadata: {
    provider: AIProvider;
    analyzedAt: string;
    dataRange: { start: string; end: string };
  };
}

export interface TrendItem {
  topic: string;
  direction: TrendDirection;
  volume: number;
  growth: number;
  peakDate: string;
  relevance: number;
  category: string;
  relatedKeywords: string[];
  sentiment: 'positive' | 'neutral' | 'negative';
}

export interface SeasonalityPattern {
  weeklyPattern: number[];
  monthlyPattern: number[];
  yearlyPeaks: Array<{ period: string; boost: number }>;
  dayOfWeekPerformance: Record<string, number>;
  timeOfDayPerformance: Record<string, number>;
}

export interface CompetitorTrend {
  channelId: string;
  channelName: string;
  subscriberCount: number;
  viewsGrowth: number;
  subscriberGrowth: number;
  averageViews: number;
  contentFrequency: number;
  strengths: string[];
  weaknesses: string[];
  opportunities: string[];
}

export interface RevenuePrediction {
  channelId: string;
  currentRevenue: number;
  predictedRevenue: PredictionPoint[];
  revenueBreakdown: {
    ads: number;
    memberships: number;
    superChats: number;
    merchandise: number;
    sponsorships: number;
    other: number;
  };
  optimizationSuggestions: RevenueOptimization[];
  metadata: {
    provider: AIProvider;
    generatedAt: string;
  };
}

export interface RevenueOptimization {
  area: string;
  current: number;
  potential: number;
  improvement: number;
  actions: string[];
  effort: 'low' | 'medium' | 'high';
  expectedImpact: number;
}

export interface ContentPerformancePrediction {
  title: string;
  predictedViews: number;
  predictedCtr: number;
  predictedWatchTime: number;
  predictedEngagement: number;
  optimalUploadTime: string;
  optimalTags: string[];
  targetAudience: string;
  thumbnailSuggestions: string[];
  titleSuggestions: string[];
  confidence: number;
  comparableVideos: Array<{
    title: string;
    views: number;
    channel: string;
    similarity: number;
  }>;
}

export interface OptimalScheduleRequest {
  channelId: string;
  contentTypes: string[];
  timezone: string;
  audienceTimezone?: string;
  goal: 'views' | 'engagement' | 'subscribers' | 'revenue';
  historicalData?: ChannelAnalytics;
}

export interface OptimalSchedule {
  bestDays: Array<{
    day: string;
    score: number;
    recommendedTime: string;
    expectedPerformance: number;
  }>;
  bestTimes: Array<{
    time: string;
    dayScore: number;
    overallScore: number;
  }>;
  uploadFrequency: {
    recommended: string;
    reason: string;
    expectedImpact: number;
  };
  avoidTimes: Array<{
    time: string;
    reason: string;
  }>;
  metadata: {
    provider: AIProvider;
    generatedAt: string;
  };
}

export interface ABTestResult {
  testId: string;
  titleA: string;
  titleB: string;
  predictedWinner: 'A' | 'B' | 'inconclusive';
  confidence: number;
  metrics: {
    titleA: { ctr: number; engagement: number; retention: number };
    titleB: { ctr: number; engagement: number; retention: number };
  };
  analysis: string;
  recommendation: string;
  metadata: {
    provider: AIProvider;
    generatedAt: string;
  };
}

function generateId(): string {
  return `analytics-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

function getDaysInRange(start: string, end: string): number {
  return Math.ceil((new Date(end).getTime() - new Date(start).getTime()) / (1000 * 60 * 60 * 24));
}

function addDays(date: string, days: number): string {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return formatDate(d);
}

function exponentialSmoothing(data: number[], alpha: number = 0.3): number[] {
  const result: number[] = [data[0]];
  for (let i = 1; i < data.length; i++) {
    result.push(alpha * data[i] + (1 - alpha) * result[i - 1]);
  }
  return result;
}

function calculateTrend(values: number[]): { slope: number; direction: TrendDirection; momentum: number } {
  if (values.length < 2) return { slope: 0, direction: 'stable', momentum: 0 };

  const n = values.length;
  const xMean = (n - 1) / 2;
  const yMean = values.reduce((a, b) => a + b, 0) / n;

  let numerator = 0;
  let denominator = 0;
  for (let i = 0; i < n; i++) {
    numerator += (i - xMean) * (values[i] - yMean);
    denominator += (i - xMean) ** 2;
  }

  const slope = denominator !== 0 ? numerator / denominator : 0;
  const normalizedSlope = yMean !== 0 ? slope / yMean : 0;

  const lastValues = values.slice(-7);
  const firstValues = values.slice(0, 7);
  const recentAvg = lastValues.reduce((a, b) => a + b, 0) / lastValues.length;
  const earlierAvg = firstValues.reduce((a, b) => a + b, 0) / firstValues.length;
  const momentum = earlierAvg !== 0 ? (recentAvg - earlierAvg) / earlierAvg : 0;

  let direction: TrendDirection;
  if (normalizedSlope > 0.05) direction = 'rising';
  else if (normalizedSlope < -0.05) direction = 'declining';
  else if (Math.abs(normalizedSlope) < 0.02 && Math.abs(momentum) > 0.3) direction = 'volatile';
  else direction = 'stable';

  return { slope, direction, momentum };
}

function calculateConfidence(dataPoints: number, variance: number): number {
  const baseConfidence = Math.min(0.95, 0.5 + Math.log10(dataPoints + 1) * 0.15);
  const variancePenalty = Math.min(0.3, variance * 0.01);
  return Math.max(0.1, Math.min(0.99, baseConfidence - variancePenalty));
}

export class AnalyticsPredictorService {
  private getClient() {
    return getAIProviderClient();
  }

  async predictViews(
    channelId: string,
    historicalData: ChannelAnalytics,
    forecastDays: number = 30,
  ): Promise<ViewPrediction> {
    const client = this.getClient();
    const model = client.getRecommendedModel('text_generation');

    const systemPrompt = `You are a YouTube analytics data scientist who builds accurate view prediction models.
Use historical data patterns, seasonality, and growth trends to forecast future views.
Provide confidence intervals and identify key prediction factors.
Consider: upload frequency, average views, growth rate, engagement metrics, and external factors.`;

    const userPrompt = `Predict views for channel ${channelId} over the next ${forecastDays} days.

Historical data:
- Current subscribers: ${historicalData.subscribers}
- Total views: ${historicalData.totalViews}
- Average view duration: ${historicalData.averageViewDuration}s
- Average view percentage: ${historicalData.averageViewPercentage}%
- Recent growth (views): ${historicalData.recentGrowth.viewsGrowth}%
- Recent growth (subscribers): ${historicalData.recentGrowth.subscribersGrowth}%
- Engagement rate: ${historicalData.recentGrowth.engagementRate}%
- Top performing videos: ${historicalData.topVideos.slice(0, 5).map((v) => `"${v.title}" (${v.views} views)`).join(', ')}

Generate daily predictions with confidence intervals.
Identify the top factors influencing the prediction.
Provide statistical methodology explanation.

Return as JSON with predictions array, confidence, and factors.`;

    const messages = createStructuredPrompt(
      z.object({
        predictions: z.array(z.any()),
        confidence: z.number(),
        factors: z.array(z.any()),
        methodology: z.string(),
      }),
      systemPrompt,
      userPrompt,
    );

    const response = await client.complete({
      model,
      messages,
      temperature: 0.3,
      maxTokens: 8192,
      responseFormat: { type: 'json_object' },
    });

    const parsed = JSON.parse(response.content) as Record<string, unknown>;
    const predictions = normalizePredictions(parsed.predictions, forecastDays, historicalData);
    const avgViews = historicalData.totalViews / Math.max(getDaysInRange(historicalData.period.start, historicalData.period.end), 1);

    return {
      channelId,
      predictions,
      confidence: Number(parsed.confidence ?? calculateConfidence(predictions.length, 0.1)),
      factors: normalizeFactors(parsed.factors),
      methodology: String(parsed.methodology ?? 'Exponential smoothing with seasonal adjustment'),
      metadata: {
        provider: response.provider,
        dataPoints: predictions.length,
        generatedAt: new Date().toISOString(),
        expiresAt: addDays(formatDate(new Date()), forecastDays),
      },
    };
  }

  async analyzeTrends(
    channelId: string,
    niche: string,
    dataRange: { start: string; end: string },
    competitorIds?: string[],
  ): Promise<TrendAnalysis> {
    const client = this.getClient();
    const model = client.getRecommendedModel('text_generation');

    const systemPrompt = `You are a YouTube trend analyst with expertise in content strategy.
Analyze current trends in the given niche, considering seasonality, viral patterns, and audience behavior.
Compare with competitors and identify opportunities and threats.
Be specific about trend direction, volume, and relevance.`;

    const userPrompt = `Analyze trends for channel ${channelId} in the "${niche}" niche.
Data range: ${dataRange.start} to ${dataRange.end}
${competitorIds?.length ? `Compare with competitors: ${competitorIds.join(', ')}` : ''}

Provide:
1. Top trending topics with direction, volume, and relevance
2. Overall trend direction and momentum score
3. Seasonality patterns (weekly, monthly, yearly)
4. Competitor trend comparison
5. Content opportunities based on trends
6. Sentiment analysis of trending topics

Return as JSON with trends array, overallDirection, momentum, seasonality, and competitors.`;

    const messages = createStructuredPrompt(
      z.object({
        trends: z.array(z.any()),
        overallDirection: z.string(),
        momentum: z.number(),
        seasonality: z.any(),
        competitors: z.array(z.any()),
      }),
      systemPrompt,
      userPrompt,
    );

    const response = await client.complete({
      model,
      messages,
      temperature: 0.5,
      maxTokens: 8192,
      responseFormat: { type: 'json_object' },
    });

    const parsed = JSON.parse(response.content) as Record<string, unknown>;

    return {
      trends: normalizeTrends(parsed.trends),
      overallDirection: (parsed.overallDirection as TrendDirection) ?? 'stable',
      momentum: Number(parsed.momentum ?? 0),
      seasonality: normalizeSeasonality(parsed.seasonality),
      competitors: normalizeCompetitors(parsed.competitors),
      metadata: {
        provider: response.provider,
        analyzedAt: new Date().toISOString(),
        dataRange,
      },
    };
  }

  async predictRevenue(
    channelId: string,
    analytics: ChannelAnalytics,
    forecastDays: number = 90,
  ): Promise<RevenuePrediction> {
    const client = this.getClient();
    const model = client.getRecommendedModel('text_generation');

    const systemPrompt = `You are a YouTube monetization analyst.
Predict future revenue based on historical performance, growth trends, and monetization strategies.
Break down revenue by source and provide actionable optimization suggestions.
Consider CPM trends, seasonal ad spend, and audience quality.`;

    const userPrompt = `Predict revenue for channel ${channelId} over the next ${forecastDays} days.

Current metrics:
- Subscribers: ${analytics.subscribers}
- Monthly views: ${analytics.totalViews}
- CPM: $${analytics.cpm}
- Average view duration: ${analytics.averageViewDuration}s
- Estimated monthly revenue: $${analytics.estimatedRevenue}
- Engagement rate: ${analytics.recentGrowth.engagementRate}%
- View growth: ${analytics.recentGrowth.viewsGrowth}%

Provide:
1. Daily revenue predictions with confidence intervals
2. Revenue breakdown by source (ads, memberships, super chats, merch, sponsorships)
3. Optimization suggestions ranked by effort and impact
4. Seasonal revenue adjustments

Return as JSON matching the revenue prediction schema.`;

    const messages = createStructuredPrompt(
      z.object({
        predictedRevenue: z.array(z.any()),
        revenueBreakdown: z.any(),
        optimizationSuggestions: z.array(z.any()),
      }),
      systemPrompt,
      userPrompt,
    );

    const response = await client.complete({
      model,
      messages,
      temperature: 0.3,
      maxTokens: 8192,
      responseFormat: { type: 'json_object' },
    });

    const parsed = JSON.parse(response.content) as Record<string, unknown>;
    const predictedRevenue = normalizePredictions(parsed.predictedRevenue, forecastDays, analytics);

    return {
      channelId,
      currentRevenue: analytics.estimatedRevenue,
      predictedRevenue,
      revenueBreakdown: normalizeRevenueBreakdown(parsed.revenueBreakdown),
      optimizationSuggestions: normalizeOptimizations(parsed.optimizationSuggestions),
      metadata: {
        provider: response.provider,
        generatedAt: new Date().toISOString(),
      },
    };
  }

  async predictContentPerformance(
    title: string,
    channelNiche: string,
    channelMetrics: { subscribers: number; averageViews: number; engagementRate: number },
  ): Promise<ContentPerformancePrediction> {
    const client = this.getClient();
    const model = client.getRecommendedModel('text_generation');

    const systemPrompt = `You are a YouTube content performance predictor.
Analyze a video title and predict its performance based on the channel's metrics and similar content.
Provide accurate predictions for views, CTR, watch time, and engagement.
Suggest optimizations for title, tags, and upload timing.`;

    const userPrompt = `Predict performance for video titled: "${title}"
Channel niche: ${channelNiche}
Channel subscribers: ${channelMetrics.subscribers.toLocaleString()}
Average views per video: ${channelMetrics.averageViews.toLocaleString()}
Engagement rate: ${channelMetrics.engagementRate}%

Provide:
1. Predicted views (with range)
2. Predicted CTR
3. Predicted average watch time
4. Predicted engagement rate
5. Optimal upload time
6. Recommended tags
7. Target audience description
8. Thumbnail suggestions
9. Title alternatives
10. 3 comparable videos with similarity scores

Return as JSON matching the content performance prediction schema.`;

    const messages = createStructuredPrompt(
      z.object({
        predictedViews: z.number(),
        predictedCtr: z.number(),
        predictedWatchTime: z.number(),
        predictedEngagement: z.number(),
        optimalUploadTime: z.string(),
        optimalTags: z.array(z.string()),
        targetAudience: z.string(),
        thumbnailSuggestions: z.array(z.string()),
        titleSuggestions: z.array(z.string()),
        confidence: z.number(),
        comparableVideos: z.array(z.any()),
      }),
      systemPrompt,
      userPrompt,
    );

    const response = await client.complete({
      model,
      messages,
      temperature: 0.5,
      maxTokens: 4096,
      responseFormat: { type: 'json_object' },
    });

    const parsed = JSON.parse(response.content) as Record<string, unknown>;

    return {
      title,
      predictedViews: Number(parsed.predictedViews ?? 0),
      predictedCtr: Number(parsed.predictedCtr ?? 0),
      predictedWatchTime: Number(parsed.predictedWatchTime ?? 0),
      predictedEngagement: Number(parsed.predictedEngagement ?? 0),
      optimalUploadTime: String(parsed.optimalUploadTime ?? ''),
      optimalTags: (parsed.optimalTags as string[]) ?? [],
      targetAudience: String(parsed.targetAudience ?? ''),
      thumbnailSuggestions: (parsed.thumbnailSuggestions as string[]) ?? [],
      titleSuggestions: (parsed.titleSuggestions as string[]) ?? [],
      confidence: Number(parsed.confidence ?? 0.5),
      comparableVideos: normalizeComparableVideos(parsed.comparableVideos),
    };
  }

  async findOptimalSchedule(request: OptimalScheduleRequest): Promise<OptimalSchedule> {
    const client = this.getClient();
    const model = client.getRecommendedModel('text_generation');

    const systemPrompt = `You are a YouTube scheduling optimization expert.
Determine the best upload schedule based on audience behavior, content type, and goals.
Consider timezone differences, audience online patterns, and competition levels.
Provide specific day/time recommendations with performance expectations.`;

    const userPrompt = `Find optimal upload schedule for channel ${request.channelId}.
Content types: ${request.contentTypes.join(', ')}
Timezone: ${request.timezone}
${request.audienceTimezone ? `Audience timezone: ${request.audienceTimezone}` : ''}
Goal: ${request.goal}
${request.historicalData ? `Current subscribers: ${request.historicalData.subscribers}, Avg views: ${Math.round(request.historicalData.totalViews / 30)}` : ''}

Provide:
1. Best days to upload with scores and recommended times
2. Best specific time slots
3. Recommended upload frequency with reasoning
4. Times to avoid and why
5. Expected performance impact for each recommendation

Return as JSON matching the optimal schedule schema.`;

    const messages = createStructuredPrompt(
      z.object({
        bestDays: z.array(z.any()),
        bestTimes: z.array(z.any()),
        uploadFrequency: z.any(),
        avoidTimes: z.array(z.any()),
      }),
      systemPrompt,
      userPrompt,
    );

    const response = await client.complete({
      model,
      messages,
      temperature: 0.4,
      maxTokens: 4096,
      responseFormat: { type: 'json_object' },
    });

    const parsed = JSON.parse(response.content) as Record<string, unknown>;

    return {
      bestDays: (parsed.bestDays as OptimalSchedule['bestDays']) ?? [],
      bestTimes: (parsed.bestTimes as OptimalSchedule['bestTimes']) ?? [],
      uploadFrequency: {
        recommended: String((parsed.uploadFrequency as Record<string, unknown>)?.recommended ?? '3x weekly'),
        reason: String((parsed.uploadFrequency as Record<string, unknown>)?.reason ?? ''),
        expectedImpact: Number((parsed.uploadFrequency as Record<string, unknown>)?.expectedImpact ?? 0),
      },
      avoidTimes: (parsed.avoidTimes as OptimalSchedule['avoidTimes']) ?? [],
      metadata: {
        provider: response.provider,
        generatedAt: new Date().toISOString(),
      },
    };
  }

  async runABTest(
    videoId: string,
    titleA: string,
    titleB: string,
    channelMetrics: { subscribers: number; averageViews: number },
  ): Promise<ABTestResult> {
    const client = this.getClient();
    const model = client.getRecommendedModel('text_generation');

    const systemPrompt = `You are a YouTube A/B testing analyst.
Compare two video titles and predict which will perform better.
Analyze clickbait level, SEO, emotional triggers, and audience appeal.
Provide a clear winner recommendation with confidence level.`;

    const userPrompt = `A/B test these two titles:
Title A: "${titleA}"
Title B: "${titleB}"

Channel metrics:
- Subscribers: ${channelMetrics.subscribers.toLocaleString()}
- Average views: ${channelMetrics.averageViews.toLocaleString()}

Analyze:
1. Predicted CTR for each title
2. Predicted engagement for each title
3. Predicted retention for each title
4. Which title wins overall and why
5. Confidence level in the prediction
6. Specific improvement suggestions for both titles

Return as JSON matching the A/B test result schema.`;

    const messages = createStructuredPrompt(
      z.object({
        predictedWinner: z.string(),
        confidence: z.number(),
        metrics: z.any(),
        analysis: z.string(),
        recommendation: z.string(),
      }),
      systemPrompt,
      userPrompt,
    );

    const response = await client.complete({
      model,
      messages,
      temperature: 0.4,
      maxTokens: 4096,
      responseFormat: { type: 'json_object' },
    });

    const parsed = JSON.parse(response.content) as Record<string, unknown>;
    const metrics = (parsed.metrics as Record<string, Record<string, number>>) ?? {};

    return {
      testId: generateId(),
      titleA,
      titleB,
      predictedWinner: (parsed.predictedWinner as 'A' | 'B' | 'inconclusive') ?? 'inconclusive',
      confidence: Number(parsed.confidence ?? 0.5),
      metrics: {
        titleA: {
          ctr: metrics.titleA?.ctr ?? 0,
          engagement: metrics.titleA?.engagement ?? 0,
          retention: metrics.titleA?.retention ?? 0,
        },
        titleB: {
          ctr: metrics.titleB?.ctr ?? 0,
          engagement: metrics.titleB?.engagement ?? 0,
          retention: metrics.titleB?.retention ?? 0,
        },
      },
      analysis: String(parsed.analysis ?? ''),
      recommendation: String(parsed.recommendation ?? ''),
      metadata: {
        provider: response.provider,
        generatedAt: new Date().toISOString(),
      },
    };
  }

  async generateGrowthStrategy(
    channelId: string,
    analytics: ChannelAnalytics,
    goals: {
      targetSubscribers?: number;
      targetMonthlyViews?: number;
      targetRevenue?: number;
      timeframeMonths?: number;
    },
  ): Promise<{
    currentScore: number;
    targetScore: number;
    gap: number;
    strategies: Array<{
      name: string;
      priority: 'high' | 'medium' | 'low';
      expectedImpact: number;
      timeframe: string;
      actions: string[];
      metrics: string[];
    }>;
    milestones: Array<{
      month: number;
      target: string;
      metric: string;
      expectedValue: number;
    }>;
    riskFactors: Array<{
      risk: string;
      probability: number;
      impact: number;
      mitigation: string;
    }>;
  }> {
    const client = this.getClient();
    const model = client.getRecommendedModel('text_generation');

    const systemPrompt = `You are a YouTube growth strategist.
Create a data-driven growth plan based on current channel metrics and target goals.
Provide actionable strategies with expected impact and timelines.
Include risk assessment and milestone tracking.`;

    const userPrompt = `Create a growth strategy for channel ${channelId}.

Current metrics:
- Subscribers: ${analytics.subscribers}
- Monthly views: ${analytics.totalViews}
- Average view duration: ${analytics.averageViewDuration}s
- Engagement rate: ${analytics.recentGrowth.engagementRate}%
- Revenue: $${analytics.estimatedRevenue}/month
- Growth rate: ${analytics.recentGrowth.viewsGrowth}% views, ${analytics.recentGrowth.subscribersGrowth}% subs

Goals:
- Target subscribers: ${goals.targetSubscribers?.toLocaleString() ?? 'N/A'}
- Target monthly views: ${goals.targetMonthlyViews?.toLocaleString() ?? 'N/A'}
- Target revenue: $${goals.targetRevenue?.toLocaleString() ?? 'N/A'}/month
- Timeframe: ${goals.timeframeMonths ?? 12} months

Provide:
1. Current score (0-100) based on channel health
2. Target score based on goals
3. Growth strategies ranked by priority and impact
4. Monthly milestones
5. Risk factors with probability and mitigation

Return as JSON with currentScore, targetScore, gap, strategies, milestones, and riskFactors.`;

    const messages = createStructuredPrompt(
      z.object({
        currentScore: z.number(),
        targetScore: z.number(),
        gap: z.number(),
        strategies: z.array(z.any()),
        milestones: z.array(z.any()),
        riskFactors: z.array(z.any()),
      }),
      systemPrompt,
      userPrompt,
    );

    const response = await client.complete({
      model,
      messages,
      temperature: 0.5,
      maxTokens: 8192,
      responseFormat: { type: 'json_object' },
    });

    const parsed = JSON.parse(response.content) as Record<string, unknown>;

    return {
      currentScore: Number(parsed.currentScore ?? 50),
      targetScore: Number(parsed.targetScore ?? 80),
      gap: Number(parsed.gap ?? 30),
      strategies: (parsed.strategies as Array<{
        name: string;
        priority: 'high' | 'medium' | 'low';
        expectedImpact: number;
        timeframe: string;
        actions: string[];
        metrics: string[];
      }>) ?? [],
      milestones: (parsed.milestones as Array<{
        month: number;
        target: string;
        metric: string;
        expectedValue: number;
      }>) ?? [],
      riskFactors: (parsed.riskFactors as Array<{
        risk: string;
        probability: number;
        impact: number;
        mitigation: string;
      }>) ?? [],
    };
  }
}

function normalizePredictions(
  data: unknown,
  forecastDays: number,
  analytics: ChannelAnalytics,
): PredictionPoint[] {
  if (Array.isArray(data)) {
    return data.map((p: Record<string, unknown>) => ({
      date: String(p.date ?? ''),
      predictedViews: Number(p.predictedViews ?? p.views ?? 0),
      lowerBound: Number(p.lowerBound ?? p.predictedViews ?? p.views ?? 0) * 0.8,
      upperBound: Number(p.upperBound ?? p.predictedViews ?? p.views ?? 0) * 1.2,
      confidence: Number(p.confidence ?? 0.7),
    }));
  }

  const avgViews = analytics.totalViews / Math.max(getDaysInRange(analytics.period.start, analytics.period.end), 1);
  const growthRate = analytics.recentGrowth.viewsGrowth / 100;
  const smoothed = [avgViews];

  for (let i = 1; i < forecastDays; i++) {
    const trend = avgViews * (1 + growthRate * (i / forecastDays));
    const noise = (Math.random() - 0.5) * avgViews * 0.1;
    smoothed.push(trend + noise);
  }

  const predictions = smoothed.map((v, i) => ({
    date: addDays(formatDate(new Date()), i),
    predictedViews: Math.round(v),
    lowerBound: Math.round(v * 0.75),
    upperBound: Math.round(v * 1.25),
    confidence: calculateConfidence(i + 1, 0.1),
  }));

  return predictions;
}

function normalizeFactors(data: unknown): PredictionFactor[] {
  if (!Array.isArray(data)) return [];
  return data.map((f: Record<string, unknown>) => ({
    name: String(f.name ?? ''),
    impact: (f.impact as 'positive' | 'negative' | 'neutral') ?? 'neutral',
    weight: Number(f.weight ?? 0),
    description: String(f.description ?? ''),
    historicalCorrelation: Number(f.historicalCorrelation ?? f.correlation ?? 0),
  }));
}

function normalizeTrends(data: unknown): TrendItem[] {
  if (!Array.isArray(data)) return [];
  return data.map((t: Record<string, unknown>) => ({
    topic: String(t.topic ?? t.name ?? ''),
    direction: (t.direction as TrendDirection) ?? 'stable',
    volume: Number(t.volume ?? 0),
    growth: Number(t.growth ?? 0),
    peakDate: String(t.peakDate ?? ''),
    relevance: Number(t.relevance ?? 0),
    category: String(t.category ?? ''),
    relatedKeywords: Array.isArray(t.relatedKeywords) ? t.relatedKeywords as string[] : [],
    sentiment: (t.sentiment as 'positive' | 'neutral' | 'negative') ?? 'neutral',
  }));
}

function normalizeSeasonality(data: unknown): SeasonalityPattern {
  if (!data || typeof data !== 'object') {
    return {
      weeklyPattern: Array(7).fill(1),
      monthlyPattern: Array(30).fill(1),
      yearlyPeaks: [],
      dayOfWeekPerformance: {},
      timeOfDayPerformance: {},
    };
  }
  const s = data as Record<string, unknown>;
  return {
    weeklyPattern: Array.isArray(s.weeklyPattern) ? s.weeklyPattern as number[] : Array(7).fill(1),
    monthlyPattern: Array.isArray(s.monthlyPattern) ? s.monthlyPattern as number[] : Array(30).fill(1),
    yearlyPeaks: Array.isArray(s.yearlyPeaks) ? s.yearlyPeaks as SeasonalityPattern['yearlyPeaks'] : [],
    dayOfWeekPerformance: (s.dayOfWeekPerformance as Record<string, number>) ?? {},
    timeOfDayPerformance: (s.timeOfDayPerformance as Record<string, number>) ?? {},
  };
}

function normalizeCompetitors(data: unknown): CompetitorTrend[] {
  if (!Array.isArray(data)) return [];
  return data.map((c: Record<string, unknown>) => ({
    channelId: String(c.channelId ?? ''),
    channelName: String(c.channelName ?? c.name ?? ''),
    subscriberCount: Number(c.subscriberCount ?? c.subscribers ?? 0),
    viewsGrowth: Number(c.viewsGrowth ?? 0),
    subscriberGrowth: Number(c.subscriberGrowth ?? 0),
    averageViews: Number(c.averageViews ?? 0),
    contentFrequency: Number(c.contentFrequency ?? 0),
    strengths: Array.isArray(c.strengths) ? c.strengths as string[] : [],
    weaknesses: Array.isArray(c.weaknesses) ? c.weaknesses as string[] : [],
    opportunities: Array.isArray(c.opportunities) ? c.opportunities as string[] : [],
  }));
}

function normalizeRevenueBreakdown(data: unknown): RevenuePrediction['revenueBreakdown'] {
  if (!data || typeof data !== 'object') {
    return { ads: 0, memberships: 0, superChats: 0, merchandise: 0, sponsorships: 0, other: 0 };
  }
  const r = data as Record<string, unknown>;
  return {
    ads: Number(r.ads ?? 0),
    memberships: Number(r.memberships ?? 0),
    superChats: Number(r.superChats ?? 0),
    merchandise: Number(r.merchandise ?? 0),
    sponsorships: Number(r.sponsorships ?? 0),
    other: Number(r.other ?? 0),
  };
}

function normalizeOptimizations(data: unknown): RevenueOptimization[] {
  if (!Array.isArray(data)) return [];
  return data.map((o: Record<string, unknown>) => ({
    area: String(o.area ?? ''),
    current: Number(o.current ?? 0),
    potential: Number(o.potential ?? 0),
    improvement: Number(o.improvement ?? 0),
    actions: Array.isArray(o.actions) ? o.actions as string[] : [],
    effort: (o.effort as 'low' | 'medium' | 'high') ?? 'medium',
    expectedImpact: Number(o.expectedImpact ?? 0),
  }));
}

function normalizeComparableVideos(data: unknown): ContentPerformancePrediction['comparableVideos'] {
  if (!Array.isArray(data)) return [];
  return data.map((v: Record<string, unknown>) => ({
    title: String(v.title ?? ''),
    views: Number(v.views ?? 0),
    channel: String(v.channel ?? v.channelName ?? ''),
    similarity: Number(v.similarity ?? 0),
  }));
}

export const analyticsPredictor = new AnalyticsPredictorService();
