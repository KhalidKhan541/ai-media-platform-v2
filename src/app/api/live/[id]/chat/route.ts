import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { z } from 'zod';

interface Params {
  params: { id: string };
}

const chatMessageSchema = z.object({
  content: z.string().min(1).max(500),
});

export async function GET(request: NextRequest, { params }: Params) {
  try {
    const { id } = params;
    const { searchParams } = new URL(request.url);
    const cursor = searchParams.get('cursor');
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100);

    const stream = await prisma.liveStream.findUnique({
      where: { id },
      select: { id: true, status: true },
    });

    if (!stream) {
      return NextResponse.json({ error: 'Stream not found' }, { status: 404 });
    }

    const where: Record<string, unknown> = { streamId: id };
    if (cursor) {
      const cursorMessage = await prisma.liveChat.findUnique({
        where: { id: cursor },
        select: { createdAt: true },
      });
      if (cursorMessage) {
        where.createdAt = { gt: cursorMessage.createdAt };
      }
    }

    const messages = await prisma.liveChat.findMany({
      where,
      include: {
        user: { select: { id: true, name: true, avatar: true } },
      },
      orderBy: { createdAt: 'asc' },
      take: limit,
    });

    const nextCursor = messages.length === limit
      ? messages[messages.length - 1].id
      : null;

    return NextResponse.json({ messages, nextCursor });
  } catch (error) {
    console.error('[LIVE_CHAT_GET]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest, { params }: Params) {
  try {
    const user = await requireAuth();
    const { id } = params;
    const body = await request.json();

    const validation = chatMessageSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors.map((e) => e.message).join(', ') },
        { status: 400 }
      );
    }

    const stream = await prisma.liveStream.findUnique({
      where: { id },
      select: { id: true, status: true, channelId: true },
    });

    if (!stream) {
      return NextResponse.json({ error: 'Stream not found' }, { status: 404 });
    }

    if (stream.status !== 'LIVE') {
      return NextResponse.json({ error: 'Stream is not live' }, { status: 400 });
    }

    const channel = await prisma.channel.findUnique({
      where: { id: stream.channelId },
      select: {
        blockedUsers: { select: { id: true } },
      },
    });

    const isBlocked = channel?.blockedUsers?.some((u) => u.id === user.id);
    if (isBlocked) {
      return NextResponse.json({ error: 'You are blocked from this channel' }, { status: 403 });
    }

    const message = await prisma.liveChat.create({
      data: {
        content: validation.data.content,
        streamId: id,
        userId: user.id,
      },
      include: {
        user: { select: { id: true, name: true, avatar: true } },
      },
    });

    return NextResponse.json({ message }, { status: 201 });
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Internal server error';
    if (msg === 'Unauthorized') return NextResponse.json({ error: msg }, { status: 401 });
    console.error('[LIVE_CHAT_POST]', error);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: Params) {
  try {
    const user = await requireAuth();
    const { id } = params;
    const { searchParams } = new URL(request.url);
    const messageId = searchParams.get('messageId');

    if (!messageId) {
      return NextResponse.json({ error: 'Message ID required' }, { status: 400 });
    }

    const message = await prisma.liveChat.findUnique({
      where: { id: messageId },
      select: { userId: true, streamId: true },
    });

    if (!message) {
      return NextResponse.json({ error: 'Message not found' }, { status: 404 });
    }

    const stream = await prisma.liveStream.findUnique({
      where: { id: message.streamId },
      include: { channel: { select: { ownerId: true } } },
    });

    const isOwner = stream?.channel.ownerId === user.id;
    const isAdmin = user.role === 'ADMIN';
    const isAuthor = message.userId === user.id;

    if (!isOwner && !isAdmin && !isAuthor) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await prisma.liveChat.delete({ where: { id: messageId } });
    return NextResponse.json({ message: 'Message deleted' });
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Internal server error';
    if (msg === 'Unauthorized') return NextResponse.json({ error: msg }, { status: 401 });
    if (msg === 'Forbidden') return NextResponse.json({ error: msg }, { status: 403 });
    console.error('[LIVE_CHAT_DELETE]', error);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
