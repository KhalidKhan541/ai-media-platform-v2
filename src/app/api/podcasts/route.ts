import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { validateInput, podcastSchema, paginationSchema } from '@/lib/validators';

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

    const where: Record<string, unknown> = {};
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const category = searchParams.get('category');
    if (category) where.category = category;

    const channelId = searchParams.get('channelId');
    if (channelId) where.channelId = channelId;

    const [podcasts, total] = await Promise.all([
      prisma.podcast.findMany({
        where,
        include: {
          channel: {
            select: { id: true, name: true, avatar: true, slug: true },
          },
          _count: { select: { episodes: true, subscribers: true } },
        },
        orderBy: { [sort]: order },
        skip,
        take: limit,
      }),
      prisma.podcast.count({ where }),
    ]);

    return NextResponse.json({
      podcasts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasMore: skip + limit < total,
      },
    });
  } catch (error) {
    console.error('[PODCASTS_GET]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await request.json();
    const validation = validateInput(podcastSchema, body);

    if (!validation.success) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const { title, description, channelId, coverImage, category, explicit } = validation.data;

    const channel = await prisma.channel.findFirst({
      where: { id: channelId, ownerId: user.id },
    });

    if (!channel) {
      return NextResponse.json(
        { error: 'Channel not found or unauthorized' },
        { status: 404 }
      );
    }

    const podcast = await prisma.podcast.create({
      data: {
        title,
        description: description || '',
        channelId,
        coverImage: coverImage || '',
        category: category || 'General',
        explicit,
        authorId: user.id,
      },
      include: {
        channel: {
          select: { id: true, name: true, avatar: true, slug: true },
        },
        _count: { select: { episodes: true, subscribers: true } },
      },
    });

    return NextResponse.json({ podcast }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    if (message === 'Unauthorized') return NextResponse.json({ error: message }, { status: 401 });
    console.error('[PODCASTS_POST]', error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
