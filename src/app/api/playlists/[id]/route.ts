import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { validateInput, playlistSchema } from '@/lib/validators';

interface Params {
  params: { id: string };
}

export async function GET(request: NextRequest, { params }: Params) {
  try {
    const { id } = params;

    const playlist = await prisma.playlist.findUnique({
      where: { id },
      include: {
        owner: { select: { id: true, name: true, avatar: true } },
        videos: {
          include: {
            channel: { select: { id: true, name: true, avatar: true } },
            _count: { select: { likes: true, comments: true } },
          },
          orderBy: { createdAt: 'asc' },
        },
        _count: { select: { videos: true } },
      },
    });

    if (!playlist) {
      return NextResponse.json({ error: 'Playlist not found' }, { status: 404 });
    }

    return NextResponse.json({ playlist });
  } catch (error) {
    console.error('[PLAYLIST_GET]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: Params) {
  try {
    const user = await requireAuth();
    const { id } = params;
    const body = await request.json();

    const existing = await prisma.playlist.findUnique({
      where: { id },
      select: { ownerId: true },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Playlist not found' }, { status: 404 });
    }

    if (existing.ownerId !== user.id && user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const validation = validateInput(playlistSchema.partial(), body);
    if (!validation.success) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const { videoIds, ...updateData } = validation.data;

    const playlist = await prisma.playlist.update({
      where: { id },
      data: updateData,
    });

    if (videoIds !== undefined) {
      await prisma.playlistVideo.deleteMany({ where: { playlistId: id } });

      if (videoIds.length > 0) {
        const validVideos = await prisma.video.findMany({
          where: { id: { in: videoIds } },
          select: { id: true },
        });

        await prisma.playlistVideo.createMany({
          data: validVideos.map((v, idx) => ({
            playlistId: id,
            videoId: v.id,
            position: idx,
          })),
        });
      }
    }

    const fullPlaylist = await prisma.playlist.findUnique({
      where: { id },
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

    return NextResponse.json({ playlist: fullPlaylist });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    if (message === 'Unauthorized') return NextResponse.json({ error: message }, { status: 401 });
    if (message === 'Forbidden') return NextResponse.json({ error: message }, { status: 403 });
    console.error('[PLAYLIST_PATCH]', error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: Params) {
  try {
    const user = await requireAuth();
    const { id } = params;

    const existing = await prisma.playlist.findUnique({
      where: { id },
      select: { ownerId: true },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Playlist not found' }, { status: 404 });
    }

    if (existing.ownerId !== user.id && user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await prisma.$transaction([
      prisma.playlistVideo.deleteMany({ where: { playlistId: id } }),
      prisma.playlist.delete({ where: { id } }),
    ]);

    return NextResponse.json({ message: 'Playlist deleted' });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    if (message === 'Unauthorized') return NextResponse.json({ error: message }, { status: 401 });
    if (message === 'Forbidden') return NextResponse.json({ error: message }, { status: 403 });
    console.error('[PLAYLIST_DELETE]', error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
