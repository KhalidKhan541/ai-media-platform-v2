import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { validateInput, channelSchema } from '@/lib/validators';

interface Params {
  params: { id: string };
}

export async function GET(request: NextRequest, { params }: Params) {
  try {
    const { id } = params;

    const channel = await prisma.channel.findFirst({
      where: { OR: [{ id }, { slug: id }] },
      include: {
        owner: { select: { id: true, name: true, avatar: true } },
        videos: {
          where: { status: 'PUBLISHED', visibility: 'PUBLIC' },
          orderBy: { createdAt: 'desc' },
          take: 12,
          select: {
            id: true, title: true, thumbnailUrl: true, url: true,
            duration: true, viewCount: true, likeCount: true, createdAt: true,
          },
        },
        _count: { select: { videos: true, subscribers: true } },
      },
    });

    if (!channel) {
      return NextResponse.json({ error: 'Channel not found' }, { status: 404 });
    }

    return NextResponse.json({ channel });
  } catch (error) {
    console.error('[CHANNEL_GET]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: Params) {
  try {
    const user = await requireAuth();
    const { id } = params;
    const body = await request.json();

    const existing = await prisma.channel.findUnique({
      where: { id },
      select: { ownerId: true },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Channel not found' }, { status: 404 });
    }

    if (existing.ownerId !== user.id && user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const validation = validateInput(channelSchema.partial(), body);
    if (!validation.success) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const channel = await prisma.channel.update({
      where: { id },
      data: validation.data,
      include: {
        owner: { select: { id: true, name: true, avatar: true } },
        _count: { select: { videos: true, subscribers: true } },
      },
    });

    return NextResponse.json({ channel });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    if (message === 'Unauthorized') return NextResponse.json({ error: message }, { status: 401 });
    if (message === 'Forbidden') return NextResponse.json({ error: message }, { status: 403 });
    console.error('[CHANNEL_PATCH]', error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: Params) {
  try {
    const user = await requireAuth();
    const { id } = params;

    const existing = await prisma.channel.findUnique({
      where: { id },
      select: { ownerId: true },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Channel not found' }, { status: 404 });
    }

    if (existing.ownerId !== user.id && user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await prisma.$transaction([
      prisma.comment.deleteMany({ where: { video: { channelId: id } } }),
      prisma.like.deleteMany({ where: { video: { channelId: id } } }),
      prisma.video.deleteMany({ where: { channelId: id } }),
      prisma.subscription.deleteMany({ where: { channelId: id } }),
      prisma.channel.delete({ where: { id } }),
    ]);

    return NextResponse.json({ message: 'Channel deleted' });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    if (message === 'Unauthorized') return NextResponse.json({ error: message }, { status: 401 });
    if (message === 'Forbidden') return NextResponse.json({ error: message }, { status: 403 });
    console.error('[CHANNEL_DELETE]', error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
