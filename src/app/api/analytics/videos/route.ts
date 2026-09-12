import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth();
    const { searchParams } = new URL(request.url);
    const videoId = searchParams.get('videoId');
    const channelId = searchParams.get('channelId');
    const period = searchParams.get('period') || '30d';

    const startDate = getStartDate(period);

    if (videoId) {
      const video = await prisma.video.findUnique({
        where: { id: videoId },
        select: { authorId: true },
      });

      if (!video || (video.authorId !== user.id && user.role !== 'ADMIN')) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }

      const snapshots = await prisma.analyticsSnapshot.findMany({
        where: {
          targetType: 'VIDEO',
          targetId: videoId,
          createdAt: { gte: startDate },
        },
        orderBy: { createdAt: 'asc' },
      });

      const videoAnalytics = await prisma.video.findUnique({
        where: { id: videoId },
        select: {
          id: true,
          title: true,
          viewCount: true,
          likeCount: true,
          duration: true,
          createdAt: true,
          _count: { select: { comments: true } },
        },
      });

      const dailyViews = aggregateByDay(snapshots, 'viewCount');
      const dailyLikes = aggregateByDay(snapshots, 'likeCount');

      return NextResponse.json({
        video: videoAnalytics,
        period,
        dailyViews,
        dailyLikes,
        totalViews: videoAnalytics?.viewCount || 0,
        totalLikes: videoAnalytics?.likeCount || 0,
        totalComments: videoAnalytics?._count.comments || 0,
      });
    }

    if (channelId) {
      const channel = await prisma.channel.findFirst({
        where: { id: channelId, ownerId: user.id },
      });

      if (!channel) {
        return NextResponse.json({ error: 'Channel not found or unauthorized' }, { status: 404 });
      }

      const [totalViews, totalLikes, totalComments, videoCount, subscriberCount] = await Promise.all([
        prisma.video.aggregate({
          where: { channelId },
          _sum: { viewCount: true, likeCount: true },
        }),
        prisma.comment.count({ where: { video: { channelId } } }),
        prisma.video.count({ where: { channelId } }),
        prisma.subscription.count({ where: { channelId } }),
      ]);

      const videos = await prisma.video.findMany({
        where: { channelId },
        select: {
          id: true, title: true, thumbnailUrl: true,
          viewCount: true, likeCount: true, createdAt: true,
          _count: { select: { comments: true } },
        },
        orderBy: { viewCount: 'desc' },
        take: 10,
      });

      const recentGrowth = await prisma.subscription.findMany({
        where: {
          channelId,
          createdAt: { gte: startDate },
        },
        select: { createdAt: true },
      });

      const dailySubs = aggregateByDay(
        recentGrowth.map((s) => ({ createdAt: s.createdAt, value: 1 })),
        'value'
      );

      return NextResponse.json({
        channel: {
          id: channel.id,
          name: channel.name,
          subscriberCount,
        },
        period,
        totalViews: totalViews._sum.viewCount || 0,
        totalLikes: totalViews._sum.likeCount || 0,
        totalComments,
        videoCount,
        topVideos: videos,
        dailySubscribers: dailySubs,
        estimatedRevenue: calculateEstimatedRevenue(totalViews._sum.viewCount || 0),
      });
    }

    const channels = await prisma.channel.findMany({
      where: { ownerId: user.id },
      select: {
        id: true, name: true, subscriberCount: true,
        videos: {
          select: { viewCount: true, likeCount: true },
        },
      },
    });

    const totalViews = channels.reduce(
      (sum, ch) => sum + ch.videos.reduce((vSum, v) => vSum + v.viewCount, 0), 0
    );
    const totalLikes = channels.reduce(
      (sum, ch) => sum + ch.videos.reduce((vSum, v) => vSum + v.likeCount, 0), 0
    );
    const totalSubscribers = channels.reduce((sum, ch) => sum + ch.subscriberCount, 0);

    return NextResponse.json({
      overview: {
        totalViews,
        totalLikes,
        totalSubscribers,
        channelCount: channels.length,
        estimatedRevenue: calculateEstimatedRevenue(totalViews),
      },
      channels: channels.map((ch) => ({
        id: ch.id,
        name: ch.name,
        subscriberCount: ch.subscriberCount,
        viewCount: ch.videos.reduce((sum, v) => sum + v.viewCount, 0),
        videoCount: ch.videos.length,
      })),
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Internal server error';
    if (msg === 'Unauthorized') return NextResponse.json({ error: msg }, { status: 401 });
    if (msg === 'Forbidden') return NextResponse.json({ error: msg }, { status: 403 });
    console.error('[ANALYTICS_VIDEOS_GET]', error);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

function getStartDate(period: string): Date {
  const now = new Date();
  switch (period) {
    case '7d': return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    case '30d': return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    case '90d': return new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
    case '1y': return new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
    default: return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  }
}

function aggregateByDay(
  items: Array<{ createdAt: Date; [key: string]: unknown }>,
  field: string
): Array<{ date: string; count: number }> {
  const grouped: Record<string, number> = {};
  for (const item of items) {
    const date = item.createdAt.toISOString().split('T')[0];
    grouped[date] = (grouped[date] || 0) + ((item[field] as number) || 0);
  }
  return Object.entries(grouped)
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

function calculateEstimatedRevenue(views: number): number {
  const cpm = 2.50;
  return Math.round((views / 1000) * cpm * 100) / 100;
}
