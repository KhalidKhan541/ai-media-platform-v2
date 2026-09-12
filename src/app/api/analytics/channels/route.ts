import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth();
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || '30d';
    const startDate = getStartDate(period);

    const channels = await prisma.channel.findMany({
      where: { ownerId: user.id },
      select: {
        id: true,
        name: true,
        slug: true,
        avatar: true,
        subscriberCount: true,
        description: true,
        createdAt: true,
      },
      orderBy: { subscriberCount: 'desc' },
    });

    if (channels.length === 0) {
      return NextResponse.json({ channels: [], overview: null });
    }

    const channelIds = channels.map((ch) => ch.id);

    const [videoStats, recentSubs, recentDonations, topVideos] = await Promise.all([
      prisma.video.groupBy({
        by: ['channelId'],
        where: { channelId: { in: channelIds } },
        _sum: { viewCount: true, likeCount: true },
        _count: true,
      }),
      prisma.subscription.findMany({
        where: {
          channelId: { in: channelIds },
          createdAt: { gte: startDate },
        },
        select: { channelId: true, createdAt: true },
      }),
      prisma.donation.aggregate({
        where: {
          channelId: { in: channelIds },
          status: 'COMPLETED',
          createdAt: { gte: startDate },
        },
        _sum: { amount: true, creatorEarning: true },
        _count: true,
      }),
      prisma.video.findMany({
        where: { channelId: { in: channelIds }, status: 'PUBLISHED' },
        select: {
          id: true, title: true, thumbnailUrl: true, channelId: true,
          viewCount: true, likeCount: true, createdAt: true,
        },
        orderBy: { viewCount: 'desc' },
        take: 5,
      }),
    ]);

    const videoStatsMap = new Map(
      videoStats.map((stat) => [stat.channelId, stat])
    );

    const enrichedChannels = channels.map((ch) => {
      const stats = videoStatsMap.get(ch.id);
      const channelSubs = recentSubs.filter((s) => s.channelId === ch.id);

      return {
        ...ch,
        totalViews: stats?._sum.viewCount || 0,
        totalLikes: stats?._sum.likeCount || 0,
        videoCount: stats?._count || 0,
        recentSubscriberGrowth: channelSubs.length,
      };
    });

    const totalViews = enrichedChannels.reduce((sum, ch) => sum + ch.totalViews, 0);
    const totalLikes = enrichedChannels.reduce((sum, ch) => sum + ch.totalLikes, 0);
    const totalVideos = enrichedChannels.reduce((sum, ch) => sum + ch.videoCount, 0);
    const totalSubscribers = channels.reduce((sum, ch) => sum + ch.subscriberCount, 0);
    const recentSubGrowth = recentSubs.length;
    const totalRevenue = recentDonations._sum.creatorEarning || 0;
    const donationCount = recentDonations._count || 0;

    return NextResponse.json({
      period,
      overview: {
        totalChannels: channels.length,
        totalSubscribers,
        totalViews,
        totalLikes,
        totalVideos,
        recentSubGrowth,
        totalRevenue,
        donationCount,
        estimatedAdRevenue: Math.round((totalViews / 1000) * 2.50 * 100) / 100,
      },
      channels: enrichedChannels,
      topVideos,
      subscriberGrowth: aggregateSubsByDay(recentSubs),
      recentDonations: await prisma.donation.findMany({
        where: {
          channelId: { in: channelIds },
          status: 'COMPLETED',
        },
        include: {
          donor: { select: { id: true, name: true, avatar: true } },
          channel: { select: { id: true, name: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: 10,
      }),
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Internal server error';
    if (msg === 'Unauthorized') return NextResponse.json({ error: msg }, { status: 401 });
    console.error('[ANALYTICS_CHANNELS_GET]', error);
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

function aggregateSubsByDay(
  subs: Array<{ createdAt: Date; channelId: string }>
): Array<{ date: string; count: number }> {
  const grouped: Record<string, number> = {};
  for (const sub of subs) {
    const date = sub.createdAt.toISOString().split('T')[0];
    grouped[date] = (grouped[date] || 0) + 1;
  }
  return Object.entries(grouped)
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => a.date.localeCompare(b.date));
}
