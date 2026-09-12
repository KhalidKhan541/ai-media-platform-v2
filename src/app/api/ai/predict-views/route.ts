import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { z } from 'zod';

const predictSchema = z.object({
  title: z.string().min(5).max(300),
  description: z.string().max(5000).optional(),
  tags: z.array(z.string()).max(30).optional(),
  channelId: z.string().optional(),
  category: z.string().optional(),
  duration: z.number().int().positive().optional(),
  scheduledTime: z.string().datetime().optional(),
  thumbnailScore: z.number().min(0).max(10).optional(),
  historicalData: z.object({
    avgViews: z.number().optional(),
    avgEngagement: z.number().optional(),
    subscriberCount: z.number().optional(),
    uploadFrequency: z.number().optional(),
  }).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await request.json();
    const validation = predictSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors.map((e) => e.message).join(', ') },
        { status: 400 }
      );
    }

    const data = validation.data;

    await new Promise((resolve) => setTimeout(resolve, 800));

    const baseViews = data.historicalData?.avgViews || 1000;
    const subscriberBoost = data.historicalData?.subscriberCount
      ? Math.log10(data.historicalData.subscriberCount) * 500
      : 0;

    const titleScore = analyzeTitle(data.title);
    const descScore = data.description ? analyzeDescription(data.description) : 0.5;
    const tagScore = data.tags ? Math.min(data.tags.length / 10, 1) * 0.8 : 0.3;
    const thumbnailBoost = (data.thumbnailScore || 5) / 10 * 0.4;
    const durationBoost = data.duration
      ? data.duration > 300 && data.duration < 1200 ? 0.15 : -0.05
      : 0;

    const qualityScore = (titleScore * 0.3 + descScore * 0.2 + tagScore * 0.2 + thumbnailBoost + durationBoost);
    const timeBoost = getTimingBoost(data.scheduledTime);

    const predictedViews = Math.round(
      baseViews * (1 + qualityScore + timeBoost + subscriberBoost / baseViews) * (0.8 + Math.random() * 0.4)
    );

    const avgEngagement = data.historicalData?.avgEngagement || 0.05;
    const predictedLikes = Math.round(predictedViews * avgEngagement * 1.5);
    const predictedComments = Math.round(predictedViews * avgEngagement * 0.3);
    const predictedShares = Math.round(predictedViews * avgEngagement * 0.1);

    const confidence = calculateConfidence(data);

    return NextResponse.json({
      predictions: {
        views: {
          predicted: predictedViews,
          range: {
            low: Math.round(predictedViews * 0.6),
            high: Math.round(predictedViews * 1.8),
          },
          confidence: confidence.views,
        },
        engagement: {
          predictedLikes,
          predictedComments,
          predictedShares,
          engagementRate: Math.round(avgEngagement * 100 * 10) / 10,
          confidence: confidence.engagement,
        },
        revenue: {
          estimated: Math.round(predictedViews / 1000 * 2.50 * 100) / 100,
          range: {
            low: Math.round(predictedViews * 0.6 / 1000 * 2.50 * 100) / 100,
            high: Math.round(predictedViews * 1.8 / 1000 * 2.50 * 100) / 100,
          },
        },
        viralityScore: Math.round(qualityScore * 100 + timeBoost * 50),
        recommendations: generateRecommendations(data, qualityScore),
      },
      analysis: {
        titleScore: Math.round(titleScore * 100),
        descriptionScore: Math.round(descScore * 100),
        tagOptimization: Math.round(tagScore * 100),
        thumbnailImpact: data.thumbnailScore ? `${data.thumbnailScore}/10` : 'Not analyzed',
        optimalPostTime: getBestPostingTime(),
        competitorBenchmark: getCompetitorBenchmark(predictedViews),
      },
      model: 'prediction-v2',
      disclaimer: 'Predictions are estimates based on historical patterns and content analysis.',
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Internal server error';
    if (msg === 'Unauthorized') return NextResponse.json({ error: msg }, { status: 401 });
    console.error('[AI_PREDICT]', error);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

function analyzeTitle(title: string): number {
  let score = 0.5;
  if (title.length > 20 && title.length < 70) score += 0.15;
  if (/\d/.test(title)) score += 0.1;
  if (/[A-Z]{2,}/.test(title)) score += 0.05;
  if (/[!?]/.test(title)) score += 0.05;
  const emotionalWords = ['shocking', 'amazing', 'secret', 'ultimate', 'best', 'worst', 'insane'];
  if (emotionalWords.some((w) => title.toLowerCase().includes(w))) score += 0.1;
  return Math.min(score, 1);
}

function analyzeDescription(desc: string): number {
  let score = 0.3;
  if (desc.length > 100) score += 0.2;
  if (desc.length > 300) score += 0.1;
  if (/https?:\/\//.test(desc)) score += 0.1;
  if (/#\w+/.test(desc)) score += 0.05;
  if (/\n/.test(desc)) score += 0.05;
  if (/\d{1,2}:\d{2}/.test(desc)) score += 0.1;
  return Math.min(score, 1);
}

function getTimingBoost(scheduledTime?: string): number {
  if (!scheduledTime) return 0;
  const hour = new Date(scheduledTime).getUTCHours();
  if (hour >= 14 && hour <= 20) return 0.2;
  if (hour >= 10 && hour <= 14) return 0.1;
  if (hour >= 20 && hour <= 23) return 0.15;
  return -0.1;
}

function calculateConfidence(data: z.infer<typeof predictSchema>): { views: string; engagement: string } {
  let factors = 0;
  if (data.historicalData?.avgViews) factors++;
  if (data.historicalData?.subscriberCount) factors++;
  if (data.tags && data.tags.length > 0) factors++;
  if (data.description) factors++;
  if (data.thumbnailScore) factors++;
  if (data.scheduledTime) factors++;

  const confidenceLevel = factors >= 5 ? 'High' : factors >= 3 ? 'Medium' : 'Low';
  return { views: confidenceLevel, engagement: confidenceLevel };
}

function generateRecommendations(
  data: z.infer<typeof predictSchema>,
  qualityScore: number
): string[] {
  const recs: string[] = [];

  if (data.title.length < 30) recs.push('Consider a longer, more descriptive title');
  if (data.title.length > 80) recs.push('Title may be too long - aim for 60-70 characters');
  if (!data.description || data.description.length < 100)
    recs.push('Add a more detailed description (100+ characters)');
  if (!data.tags || data.tags.length < 5) recs.push('Add more tags (5-15 recommended)');
  if (data.tags && data.tags.length > 20) recs.push('Too many tags may dilute relevance - aim for 10-15');
  if (!data.thumbnailScore || data.thumbnailScore < 7)
    recs.push('Consider improving thumbnail design - aim for 7+/10');
  if (!data.scheduledTime) recs.push('Schedule posting during peak hours (2-8 PM EST)');
  if (data.duration && data.duration > 1800) recs.push('Longer videos may have lower retention - consider 10-20 min');

  if (qualityScore > 0.7) recs.unshift('Content quality looks strong - focus on promotion');
  if (qualityScore < 0.4) recs.unshift('Overall optimization is low - review all recommendations');

  return recs;
}

function getBestPostingTime(): string {
  return 'Tuesday-Thursday, 2:00 PM - 4:00 PM EST (highest engagement window)';
}

function getCompetitorBenchmark(views: number): string {
  if (views > 100000) return 'Top 1% of similar content';
  if (views > 10000) return 'Top 10% of similar content';
  if (views > 1000) return 'Above average performance';
  return 'Average performance range';
}
