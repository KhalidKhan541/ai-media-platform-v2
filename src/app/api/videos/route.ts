import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { validateInput, videoSchema, paginationSchema } from '@/lib/validators';

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

    const where: Record<string, unknown> = {
      status: 'PUBLISHED',
      visibility: 'PUBLIC',
    };

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { tags: { hasSome: [search] } },
      ];
    }

    const categoryId = searchParams.get('categoryId');
    if (categoryId) where.categoryId = categoryId;

    const channelId = searchParams.get('channelId');
    if (channelId) where.channelId = channelId;

    const [videos, total] = await Promise.all([
      prisma.video.findMany({
        where,
        include: {
          channel: {
            select: { id: true, name: true, avatar: true, slug: true },
          },
          _count: { select: { comments: true, likes: true } },
        },
        orderBy: { [sort]: order },
        skip,
        take: limit,
      }),
      prisma.video.count({ where }),
    ]);

    return NextResponse.json({
      videos,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasMore: skip + limit < total,
      },
    });
  } catch (error) {
    console.error('[VIDEOS_GET]', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await request.json();
    const validation = validateInput(videoSchema, body);

    if (!validation.success) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const data = validation.data;

    const channel = await prisma.channel.findFirst({
      where: { id: data.channelId, ownerId: user.id },
    });

    if (!channel) {
      return NextResponse.json(
        { error: 'Channel not found or unauthorized' },
        { status: 404 }
      );
    }

    const video = await prisma.video.create({
      data: {
        title: data.title,
        description: data.description || '',
        url: data.url,
        thumbnailUrl: data.thumbnailUrl || '',
        duration: data.duration || 0,
        tags: data.tags || [],
        visibility: data.visibility,
        channelId: data.channelId,
        authorId: user.id,
        status: 'PUBLISHED',
        viewCount: 0,
        likeCount: 0,
      },
      include: {
        channel: {
          select: { id: true, name: true, avatar: true, slug: true },
        },
      },
    });

    return NextResponse.json({ video }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    if (message === 'Unauthorized') {
      return NextResponse.json({ error: message }, { status: 401 });
    }
    console.error('[VIDEOS_POST]', error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
