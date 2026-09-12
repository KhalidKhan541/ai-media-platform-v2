import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { validateInput, liveStreamSchema, paginationSchema } from '@/lib/validators';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const params = Object.fromEntries(searchParams.entries());
    const pagination = validateInput(paginationSchema, params);

    if (!pagination.success) {
      return NextResponse.json({ error: pagination.error }, { status: 400 });
    }

    const { page, limit, sort, order, search } = pagination.data;
    const skip = (page - 1) * limit;

    const status = searchParams.get('status') as 'SCHEDULED' | 'LIVE' | 'ENDED' | null;

    const where: Record<string, unknown> = {};
    if (status) where.status = status;
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [streams, total] = await Promise.all([
      prisma.liveStream.findMany({
        where,
        include: {
          channel: {
            select: { id: true, name: true, avatar: true, slug: true },
          },
          _count: { select: { chatMessages: true, viewers: true } },
        },
        orderBy: { [sort]: order },
        skip,
        take: limit,
      }),
      prisma.liveStream.count({ where }),
    ]);

    return NextResponse.json({
      streams,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasMore: skip + limit < total,
      },
    });
  } catch (error) {
    console.error('[LIVE_GET]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await request.json();
    const validation = validateInput(liveStreamSchema, body);

    if (!validation.success) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const { title, description, channelId, scheduledAt, thumbnailUrl } = validation.data;

    const channel = await prisma.channel.findFirst({
      where: { id: channelId, ownerId: user.id },
    });

    if (!channel) {
      return NextResponse.json(
        { error: 'Channel not found or unauthorized' },
        { status: 404 }
      );
    }

    const activeStream = await prisma.liveStream.findFirst({
      where: { channelId, status: 'LIVE' },
    });

    if (activeStream) {
      return NextResponse.json(
        { error: 'Channel already has an active stream' },
        { status: 409 }
      );
    }

    const stream = await prisma.liveStream.create({
      data: {
        title,
        description: description || '',
        channelId,
        thumbnailUrl: thumbnailUrl || '',
        streamKey: `sk_${Date.now()}_${Math.random().toString(36).slice(2)}`,
        streamUrl: `rtmp://live.example.com/live/${channelId}`,
        playbackUrl: `https://live.example.com/play/${channelId}`,
        status: scheduledAt ? 'SCHEDULED' : 'LIVE',
        scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
        viewerCount: 0,
        startedAt: scheduledAt ? null : new Date(),
      },
      include: {
        channel: {
          select: { id: true, name: true, avatar: true, slug: true },
        },
      },
    });

    return NextResponse.json({ stream }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    if (message === 'Unauthorized') return NextResponse.json({ error: message }, { status: 401 });
    console.error('[LIVE_POST]', error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
