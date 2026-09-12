import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { validateInput, podcastSchema } from '@/lib/validators';

interface Params {
  params: { id: string };
}

export async function GET(request: NextRequest, { params }: Params) {
  try {
    const { id } = params;

    const podcast = await prisma.podcast.findUnique({
      where: { id },
      include: {
        channel: {
          select: {
            id: true, name: true, avatar: true, slug: true,
            description: true, subscriberCount: true,
          },
        },
        author: { select: { id: true, name: true, avatar: true } },
        episodes: {
          orderBy: { createdAt: 'desc' },
          take: 20,
        },
        _count: { select: { episodes: true, subscribers: true } },
      },
    });

    if (!podcast) {
      return NextResponse.json({ error: 'Podcast not found' }, { status: 404 });
    }

    return NextResponse.json({ podcast });
  } catch (error) {
    console.error('[PODCAST_GET]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: Params) {
  try {
    const user = await requireAuth();
    const { id } = params;
    const body = await request.json();

    const existing = await prisma.podcast.findUnique({
      where: { id },
      select: { authorId: true },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Podcast not found' }, { status: 404 });
    }

    if (existing.authorId !== user.id && user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const validation = validateInput(podcastSchema.partial(), body);
    if (!validation.success) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const podcast = await prisma.podcast.update({
      where: { id },
      data: validation.data,
      include: {
        channel: {
          select: { id: true, name: true, avatar: true, slug: true },
        },
        _count: { select: { episodes: true, subscribers: true } },
      },
    });

    return NextResponse.json({ podcast });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    if (message === 'Unauthorized') return NextResponse.json({ error: message }, { status: 401 });
    if (message === 'Forbidden') return NextResponse.json({ error: message }, { status: 403 });
    console.error('[PODCAST_PATCH]', error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: Params) {
  try {
    const user = await requireAuth();
    const { id } = params;

    const existing = await prisma.podcast.findUnique({
      where: { id },
      select: { authorId: true },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Podcast not found' }, { status: 404 });
    }

    if (existing.authorId !== user.id && user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await prisma.$transaction([
      prisma.episode.deleteMany({ where: { podcastId: id } }),
      prisma.podcast.delete({ where: { id } }),
    ]);

    return NextResponse.json({ message: 'Podcast deleted' });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    if (message === 'Unauthorized') return NextResponse.json({ error: message }, { status: 401 });
    if (message === 'Forbidden') return NextResponse.json({ error: message }, { status: 403 });
    console.error('[PODCAST_DELETE]', error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
