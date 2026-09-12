import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { paginationSchema, validateInput } from '@/lib/validators';

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth();
    const { searchParams } = new URL(request.url);
    const params = Object.fromEntries(searchParams.entries());
    const pagination = validateInput(paginationSchema, params);

    if (!pagination.success) {
      return NextResponse.json({ error: pagination.error }, { status: 400 });
    }

    const { page, limit } = pagination.data;
    const skip = (page - 1) * limit;

    const type = searchParams.get('type');
    const read = searchParams.get('read');

    const where: Record<string, unknown> = { userId: user.id };
    if (type) where.type = type;
    if (read !== null) where.read = read === 'true';

    const [notifications, total, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.notification.count({ where }),
      prisma.notification.count({
        where: { userId: user.id, read: false },
      }),
    ]);

    return NextResponse.json({
      notifications,
      unreadCount,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasMore: skip + limit < total,
      },
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Internal server error';
    if (msg === 'Unauthorized') return NextResponse.json({ error: msg }, { status: 401 });
    console.error('[NOTIFICATIONS_GET]', error);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await request.json();

    const { title, message, type, targetUserId, metadata } = body;

    if (!title || !message || !type || !targetUserId) {
      return NextResponse.json(
        { error: 'title, message, type, and targetUserId are required' },
        { status: 400 }
      );
    }

    const allowedTypes = [
      'NEW_VIDEO', 'NEW_COMMENT', 'NEW_SUBSCRIBER', 'LIKE',
      'MENTION', 'DONATION', 'SYSTEM', 'CHANNEL_UPDATE',
    ];
    if (!allowedTypes.includes(type)) {
      return NextResponse.json({ error: 'Invalid notification type' }, { status: 400 });
    }

    const notification = await prisma.notification.create({
      data: {
        type,
        title,
        message,
        userId: targetUserId,
        actorId: user.id,
        metadata: metadata || {},
      },
    });

    return NextResponse.json({ notification }, { status: 201 });
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Internal server error';
    if (msg === 'Unauthorized') return NextResponse.json({ error: msg }, { status: 401 });
    console.error('[NOTIFICATIONS_POST]', error);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await request.json();

    const { action, notificationIds } = body;

    if (action === 'read_all') {
      await prisma.notification.updateMany({
        where: { userId: user.id, read: false },
        data: { read: true },
      });
      return NextResponse.json({ message: 'All notifications marked as read' });
    }

    if (action === 'read' && notificationIds?.length) {
      await prisma.notification.updateMany({
        where: {
          id: { in: notificationIds },
          userId: user.id,
        },
        data: { read: true },
      });
      return NextResponse.json({ message: 'Selected notifications marked as read' });
    }

    if (action === 'delete' && notificationIds?.length) {
      await prisma.notification.deleteMany({
        where: {
          id: { in: notificationIds },
          userId: user.id,
        },
      });
      return NextResponse.json({ message: 'Notifications deleted' });
    }

    if (action === 'delete_all') {
      await prisma.notification.deleteMany({
        where: { userId: user.id },
      });
      return NextResponse.json({ message: 'All notifications deleted' });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Internal server error';
    if (msg === 'Unauthorized') return NextResponse.json({ error: msg }, { status: 401 });
    console.error('[NOTIFICATIONS_PATCH]', error);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await requireAuth();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Notification ID required' }, { status: 400 });
    }

    const notification = await prisma.notification.findUnique({
      where: { id },
      select: { userId: true },
    });

    if (!notification || notification.userId !== user.id) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    await prisma.notification.delete({ where: { id } });
    return NextResponse.json({ message: 'Notification deleted' });
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Internal server error';
    if (msg === 'Unauthorized') return NextResponse.json({ error: msg }, { status: 401 });
    console.error('[NOTIFICATIONS_DELETE]', error);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
