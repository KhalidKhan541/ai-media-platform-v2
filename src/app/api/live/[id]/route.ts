import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

interface Params {
  params: { id: string };
}

export async function GET(request: NextRequest, { params }: Params) {
  try {
    const { id } = params;

    const stream = await prisma.liveStream.findUnique({
      where: { id },
      include: {
        channel: {
          select: {
            id: true, name: true, avatar: true, slug: true,
            description: true, subscriberCount: true,
          },
        },
        chatMessages: {
          include: {
            user: { select: { id: true, name: true, avatar: true } },
          },
          orderBy: { createdAt: 'asc' },
          take: 100,
        },
        _count: { select: { chatMessages: true, viewers: true } },
      },
    });

    if (!stream) {
      return NextResponse.json({ error: 'Stream not found' }, { status: 404 });
    }

    return NextResponse.json({ stream });
  } catch (error) {
    console.error('[LIVE_STREAM_GET]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: Params) {
  try {
    const user = await requireAuth();
    const { id } = params;
    const body = await request.json();

    const existing = await prisma.liveStream.findUnique({
      where: { id },
      include: { channel: { select: { ownerId: true } } },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Stream not found' }, { status: 404 });
    }

    if (existing.channel.ownerId !== user.id && user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const allowedFields = ['title', 'description', 'thumbnailUrl', 'status'];
    const data: Record<string, unknown> = {};
    for (const field of allowedFields) {
      if (field in body) data[field] = body[field];
    }

    if (data.status === 'LIVE' && existing.status !== 'LIVE') {
      data.startedAt = new Date();
    }
    if (data.status === 'ENDED') {
      data.endedAt = new Date();
    }

    const stream = await prisma.liveStream.update({
      where: { id },
      data,
      include: {
        channel: {
          select: { id: true, name: true, avatar: true, slug: true },
        },
      },
    });

    return NextResponse.json({ stream });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    if (message === 'Unauthorized') return NextResponse.json({ error: message }, { status: 401 });
    if (message === 'Forbidden') return NextResponse.json({ error: message }, { status: 403 });
    console.error('[LIVE_PATCH]', error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: Params) {
  try {
    const user = await requireAuth();
    const { id } = params;

    const existing = await prisma.liveStream.findUnique({
      where: { id },
      include: { channel: { select: { ownerId: true } } },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Stream not found' }, { status: 404 });
    }

    if (existing.channel.ownerId !== user.id && user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    if (existing.status === 'LIVE') {
      return NextResponse.json(
        { error: 'Cannot delete a live stream. End it first.' },
        { status: 400 }
      );
    }

    await prisma.$transaction([
      prisma.liveChat.deleteMany({ where: { streamId: id } }),
      prisma.liveViewer.deleteMany({ where: { streamId: id } }),
      prisma.liveStream.delete({ where: { id } }),
    ]);

    return NextResponse.json({ message: 'Stream deleted' });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    if (message === 'Unauthorized') return NextResponse.json({ error: message }, { status: 401 });
    if (message === 'Forbidden') return NextResponse.json({ error: message }, { status: 403 });
    console.error('[LIVE_DELETE]', error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
