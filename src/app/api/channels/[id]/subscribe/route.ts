import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

interface Params {
  params: { id: string };
}

export async function GET(request: NextRequest, { params }: Params) {
  try {
    const { id } = params;
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    const channel = await prisma.channel.findUnique({
      where: { id },
      select: {
        id: true,
        subscriberCount: true,
      },
    });

    if (!channel) {
      return NextResponse.json({ error: 'Channel not found' }, { status: 404 });
    }

    let isSubscribed = false;
    if (userId) {
      const sub = await prisma.subscription.findUnique({
        where: { channelId_userId: { channelId: id, userId } },
        select: { id: true },
      });
      isSubscribed = !!sub;
    }

    return NextResponse.json({
      subscriberCount: channel.subscriberCount,
      isSubscribed,
    });
  } catch (error) {
    console.error('[SUBSCRIBE_GET]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest, { params }: Params) {
  try {
    const user = await requireAuth();
    const { id } = params;

    const channel = await prisma.channel.findUnique({
      where: { id },
      select: { id: true, ownerId: true },
    });

    if (!channel) {
      return NextResponse.json({ error: 'Channel not found' }, { status: 404 });
    }

    if (channel.ownerId === user.id) {
      return NextResponse.json({ error: 'Cannot subscribe to own channel' }, { status: 400 });
    }

    const existing = await prisma.subscription.findUnique({
      where: { channelId_userId: { channelId: id, userId: user.id } },
    });

    if (existing) {
      return NextResponse.json({ error: 'Already subscribed' }, { status: 409 });
    }

    const [, updatedChannel] = await prisma.$transaction([
      prisma.subscription.create({
        data: { channelId: id, userId: user.id },
      }),
      prisma.channel.update({
        where: { id },
        data: { subscriberCount: { increment: 1 } },
        select: { subscriberCount: true },
      }),
    ]);

    await prisma.notification.create({
      data: {
        type: 'NEW_SUBSCRIBER',
        title: 'New Subscriber',
        message: `${user.name} subscribed to your channel`,
        userId: channel.ownerId,
        actorId: user.id,
        metadata: { channelId: id },
      },
    });

    return NextResponse.json({
      subscribed: true,
      subscriberCount: updatedChannel.subscriberCount,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    if (message === 'Unauthorized') return NextResponse.json({ error: message }, { status: 401 });
    console.error('[SUBSCRIBE_POST]', error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: Params) {
  try {
    const user = await requireAuth();
    const { id } = params;

    const existing = await prisma.subscription.findUnique({
      where: { channelId_userId: { channelId: id, userId: user.id } },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Not subscribed' }, { status: 404 });
    }

    const [, updatedChannel] = await prisma.$transaction([
      prisma.subscription.delete({
        where: { channelId_userId: { channelId: id, userId: user.id } },
      }),
      prisma.channel.update({
        where: { id },
        data: { subscriberCount: { decrement: 1 } },
        select: { subscriberCount: true },
      }),
    ]);

    return NextResponse.json({
      subscribed: false,
      subscriberCount: updatedChannel.subscriberCount,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    if (message === 'Unauthorized') return NextResponse.json({ error: message }, { status: 401 });
    console.error('[SUBSCRIBE_DELETE]', error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
