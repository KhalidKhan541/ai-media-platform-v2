import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth();

    const channels = await prisma.channel.findMany({
      where: { ownerId: user.id },
      select: { id: true },
    });

    const channelIds = channels.map((ch) => ch.id);

    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const [
      totalVideos,
      totalViews,
      totalLikes,
      totalComments,
      totalSubscribers,
      todayViews,
      weekViews,
      monthViews,
      todayNewSubs,
      weekNewSubs,
      recentVideos,
      recentComments,
      pendingReports,
      activeLiveStreams,
      unreadNotifications,
      revenue,
    ] = await Promise.all([
      prisma.video.count({
        where: { channelId: { in: channelIds }, status: 'PUBLISHED' },
      }),
      prisma.video.aggregate({
        where: { channelId: { in: channelIds } },
        _sum: { viewCount: true, likeCount: true },
      }),
      prisma.comment.count({
        where: { video: { channelId: { in: channelIds } } },
      }),
      prisma.subscription.aggregate({
        where: { channelId: { in: channelIds } },
        _sum: { channelId: true },
      }),
      prisma.video.aggregate({
        where: {
          channelId: { in: channelIds },
          createdAt: { gte: todayStart },
        },
        _sum: { viewCount: true },
      }),
      prisma.video.aggregate({
        where: {
          channelId: { in: channelIds },
          createdAt: { gte: weekAgo },
        },
        _sum: { viewCount: true },
      }),
      prisma.video.aggregate({
        where: {
          channelId: { in: channelIds },
          createdAt: { gte: monthAgo },
        },
        _sum: { viewCount: true },
      }),
      prisma.subscription.count({
        where: {
          channelId: { in: channelIds },
          createdAt: { gte: todayStart },
        },
      }),
      prisma.subscription.count({
        where: {
          channelId: { in: channelIds },
          createdAt: { gte: weekAgo },
        },
      }),
      prisma.video.findMany({
        where: { authorId: user.id },
        select: {
          id: true, title: true, thumbnailUrl: true, viewCount: true,
          likeCount: true, createdAt: true, status: true,
        },
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),
      prisma.comment.findMany({
        where: { video: { channelId: { in: channelIds } } },
        include: {
          author: { select: { id: true, name: true, avatar: true } },
          video: { select: { id: true, title: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),
      prisma.report.count({
        where: {
          OR: [
            { video: { channelId: { in: channelIds } } },
            { channel: { id: { in: channelIds } } },
          ],
          status: 'PENDING',
        },
      }),
      prisma.liveStream.count({
        where: { channelId: { in: channelIds }, status: 'LIVE' },
      }),
      prisma.notification.count({
        where: { userId: user.id, read: false },
      }),
      prisma.donation.aggregate({
        where: {
          channelId: { in: channelIds },
          status: 'COMPLETED',
          createdAt: { gte: monthAgo },
        },
        _sum: { amount: true, creatorEarning: true },
        _count: true,
      }),
    ]);

    const totalSubCount = channels.length > 0
      ? (await Promise.all(
          channels.map((ch) =>
            prisma.subscription.count({ where: { channelId: ch.id } })
          )
        )).reduce((a, b) => a + b, 0)
      : 0;

    return NextResponse.json({
      overview: {
        totalVideos,
        totalViews: totalViews._sum.viewCount || 0,
        totalLikes: totalViews._sum.likeCount || 0,
        totalComments,
        totalSubscribers: totalSubCount,
        channelCount: channels.length,
      },
      period: {
        todayViews: todayViews._sum.viewCount || 0,
        weekViews: weekViews._sum.viewCount || 0,
        monthViews: monthViews._sum.viewCount || 0,
        todayNewSubs,
        weekNewSubs,
      },
      revenue: {
        monthlyDonations: revenue._sum.amount || 0,
        monthlyCreatorEarnings: revenue._sum.creatorEarning || 0,
        donationCount: revenue._count || 0,
        estimatedAdRevenue: Math.round(((totalViews._sum.viewCount || 0) / 1000) * 2.50 * 100) / 100,
      },
      activity: {
        recentVideos,
        recentComments,
        pendingReports,
        activeLiveStreams,
        unreadNotifications,
      },
      alerts: generateAlerts(
        totalVideos,
        totalViews._sum.viewCount || 0,
        totalSubCount,
        pendingReports,
        channels.length
      ),
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Internal server error';
    if (msg === 'Unauthorized') return NextResponse.json({ error: msg }, { status: 401 });
    console.error('[DASHBOARD_STATS]', error);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

function generateAlerts(
  videos: number,
  views: number,
  subscribers: number,
  pendingReports: number,
  channelCount: number
): Array<{ type: string; message: string; severity: 'info' | 'warning' | 'error' }> {
  const alerts: Array<{ type: string; message: string; severity: 'info' | 'warning' | 'error' }> = [];

  if (videos === 0) {
    alerts.push({
      type: 'GET_STARTED',
      message: 'Upload your first video to get started!',
      severity: 'info',
    });
  }

  if (channelCount === 0) {
    alerts.push({
      type: 'NO_CHANNEL',
      message: 'Create a channel to start publishing content.',
      severity: 'warning',
    });
  }

  if (pendingReports > 0) {
    alerts.push({
      type: 'PENDING_REPORTS',
      message: `You have ${pendingReports} pending reports to review.`,
      severity: 'warning',
    });
  }

  if (subscribers > 100 && videos < 5) {
    alerts.push({
      type: 'CONTENT_GAP',
      message: 'You have subscribers but few videos. Upload more to keep them engaged!',
      severity: 'info',
    });
  }

  return alerts;
}
