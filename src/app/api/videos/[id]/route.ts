import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { validateInput, videoUpdateSchema } from '@/lib/validators';

interface Params {
  params: { id: string };
}

export async function GET(request: NextRequest, { params }: Params) {
  try {
    const { id } = params;

    const video = await prisma.video.findUnique({
      where: { id },
      include: {
        channel: {
          select: {
            id: true, name: true, avatar: true, slug: true, subscriberCount: true,
          },
        },
        author: {
          select: { id: true, name: true, avatar: true },
        },
        comments: {
          where: { parentId: null },
          include: {
            author: { select: { id: true, name: true, avatar: true } },
            replies: {
              include: {
                author: { select: { id: true, name: true, avatar: true } },
              },
              orderBy: { createdAt: 'asc' },
            },
            _count: { select: { likes: true } },
          },
          orderBy: { createdAt: 'desc' },
          take: 50,
        },
        _count: { select: { comments: true, likes: true } },
      },
    });

    if (!video) {
      return NextResponse.json({ error: 'Video not found' }, { status: 404 });
    }

    await prisma.video.update({
      where: { id },
      data: { viewCount: { increment: 1 } },
    });

    return NextResponse.json({ video: { ...video, viewCount: video.viewCount + 1 } });
  } catch (error) {
    console.error('[VIDEO_GET]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: Params) {
  try {
    const user = await requireAuth();
    const { id } = params;
    const body = await request.json();

    const existing = await prisma.video.findUnique({
      where: { id },
      select: { authorId: true },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Video not found' }, { status: 404 });
    }

    if (existing.authorId !== user.id && user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const validation = validateInput(videoUpdateSchema, body);
    if (!validation.success) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const video = await prisma.video.update({
      where: { id },
      data: validation.data,
      include: {
        channel: { select: { id: true, name: true, avatar: true, slug: true } },
      },
    });

    return NextResponse.json({ video });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    if (message === 'Unauthorized') return NextResponse.json({ error: message }, { status: 401 });
    if (message === 'Forbidden') return NextResponse.json({ error: message }, { status: 403 });
    console.error('[VIDEO_PATCH]', error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: Params) {
  try {
    const user = await requireAuth();
    const { id } = params;

    const existing = await prisma.video.findUnique({
      where: { id },
      select: { authorId: true },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Video not found' }, { status: 404 });
    }

    if (existing.authorId !== user.id && user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await prisma.$transaction([
      prisma.comment.deleteMany({ where: { videoId: id } }),
      prisma.like.deleteMany({ where: { videoId: id } }),
      prisma.video.delete({ where: { id } }),
    ]);

    return NextResponse.json({ message: 'Video deleted' });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    if (message === 'Unauthorized') return NextResponse.json({ error: message }, { status: 401 });
    if (message === 'Forbidden') return NextResponse.json({ error: message }, { status: 403 });
    console.error('[VIDEO_DELETE]', error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
