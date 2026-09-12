import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { validateInput, playlistSchema, paginationSchema } from '@/lib/validators';

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

    const where: Record<string, unknown> = { visibility: 'PUBLIC' };
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const userId = searchParams.get('userId');
    if (userId) where.ownerId = userId;

    const [playlists, total] = await Promise.all([
      prisma.playlist.findMany({
        where,
        include: {
          owner: { select: { id: true, name: true, avatar: true } },
          videos: {
            select: {
              id: true, title: true, thumbnailUrl: true, duration: true,
              viewCount: true, channel: { select: { id: true, name: true } },
            },
            take: 4,
            orderBy: { createdAt: 'asc' },
          },
          _count: { select: { videos: true } },
        },
        orderBy: { [sort]: order },
        skip,
        take: limit,
      }),
      prisma.playlist.count({ where }),
    ]);

    return NextResponse.json({
      playlists,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasMore: skip + limit < total,
      },
    });
  } catch (error) {
    console.error('[PLAYLISTS_GET]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await request.json();
    const validation = validateInput(playlistSchema, body);

    if (!validation.success) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const { name, description, visibility, videoIds } = validation.data;

    const playlist = await prisma.playlist.create({
      data: {
        name,
        description: description || '',
        visibility,
        ownerId: user.id,
      },
    });

    if (videoIds && videoIds.length > 0) {
      const validVideos = await prisma.video.findMany({
        where: { id: { in: videoIds } },
        select: { id: true },
      });

      if (validVideos.length > 0) {
        await prisma.playlistVideo.createMany({
          data: validVideos.map((v, idx) => ({
            playlistId: playlist.id,
            videoId: v.id,
            position: idx,
          })),
        });
      }
    }

    const fullPlaylist = await prisma.playlist.findUnique({
      where: { id: playlist.id },
      include: {
        owner: { select: { id: true, name: true, avatar: true } },
        videos: {
          select: {
            id: true, title: true, thumbnailUrl: true, duration: true,
            viewCount: true, channel: { select: { id: true, name: true } },
          },
          orderBy: { createdAt: 'asc' },
        },
        _count: { select: { videos: true } },
      },
    });

    return NextResponse.json({ playlist: fullPlaylist }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    if (message === 'Unauthorized') return NextResponse.json({ error: message }, { status: 401 });
    console.error('[PLAYLISTS_POST]', error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
