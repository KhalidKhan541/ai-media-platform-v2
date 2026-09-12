import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';
import { paginationSchema, validateInput } from '@/lib/validators';

export async function GET(request: NextRequest) {
  try {
    await requireAdmin();
    const { searchParams } = new URL(request.url);
    const params = Object.fromEntries(searchParams.entries());
    const pagination = validateInput(paginationSchema, params);

    if (!pagination.success) {
      return NextResponse.json({ error: pagination.error }, { status: 400 });
    }

    const { page, limit, sort, order, search } = pagination.data;
    const skip = (page - 1) * limit;

    const role = searchParams.get('role');
    const status = searchParams.get('status');
    const banned = searchParams.get('banned');

    const where: Record<string, unknown> = {};
    if (role) where.role = role;
    if (status) where.status = status;
    if (banned !== null) where.banned = banned === 'true';
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          name: true,
          email: true,
          avatar: true,
          role: true,
          status: true,
          banned: true,
          createdAt: true,
          updatedAt: true,
          _count: {
            select: {
              videos: true,
              channels: true,
              comments: true,
              subscriptions: true,
            },
          },
        },
        orderBy: { [sort]: order },
        skip,
        take: limit,
      }),
      prisma.user.count({ where }),
    ]);

    const stats = await prisma.user.groupBy({
      by: ['role'],
      _count: true,
    });

    const bannedCount = await prisma.user.count({ where: { banned: true } });

    return NextResponse.json({
      users,
      stats: {
        byRole: stats,
        totalUsers: total,
        bannedUsers: bannedCount,
      },
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
    if (msg === 'Forbidden') return NextResponse.json({ error: msg }, { status: 403 });
    console.error('[ADMIN_USERS_GET]', error);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const admin = await requireAdmin();
    const body = await request.json();
    const { userId, action, data } = body;

    if (!userId || !action) {
      return NextResponse.json({ error: 'userId and action required' }, { status: 400 });
    }

    const targetUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, role: true, banned: true },
    });

    if (!targetUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (targetUser.id === admin.id) {
      return NextResponse.json({ error: 'Cannot modify own account via admin' }, { status: 400 });
    }

    switch (action) {
      case 'ban': {
        const updated = await prisma.user.update({
          where: { id: userId },
          data: { banned: true, status: 'BANNED' },
          select: { id: true, name: true, email: true, banned: true, status: true },
        });

        await prisma.notification.create({
          data: {
            type: 'SYSTEM',
            title: 'Account Suspended',
            message: data?.reason || 'Your account has been suspended by an administrator',
            userId,
            metadata: { reason: data?.reason, adminId: admin.id },
          },
        });

        return NextResponse.json({ user: updated, message: 'User banned' });
      }

      case 'unban': {
        const updated = await prisma.user.update({
          where: { id: userId },
          data: { banned: false, status: 'ACTIVE' },
          select: { id: true, name: true, email: true, banned: true, status: true },
        });

        await prisma.notification.create({
          data: {
            type: 'SYSTEM',
            title: 'Account Reinstated',
            message: 'Your account has been reinstated',
            userId,
          },
        });

        return NextResponse.json({ user: updated, message: 'User unbanned' });
      }

      case 'change_role': {
        const { role } = data || {};
        if (!role || !['USER', 'CREATOR', 'MODERATOR', 'ADMIN'].includes(role)) {
          return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
        }

        const updated = await prisma.user.update({
          where: { id: userId },
          data: { role },
          select: { id: true, name: true, email: true, role: true },
        });

        return NextResponse.json({ user: updated, message: `Role changed to ${role}` });
      }

      case 'delete': {
        await prisma.$transaction([
          prisma.comment.deleteMany({ where: { authorId: userId } }),
          prisma.like.deleteMany({ where: { userId } }),
          prisma.subscription.deleteMany({ where: { userId } }),
          prisma.notification.deleteMany({ where: { userId } }),
          prisma.video.deleteMany({ where: { authorId: userId } }),
          prisma.channel.deleteMany({ where: { ownerId: userId } }),
          prisma.user.delete({ where: { id: userId } }),
        ]);

        return NextResponse.json({ message: 'User deleted permanently' });
      }

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Internal server error';
    if (msg === 'Unauthorized') return NextResponse.json({ error: msg }, { status: 401 });
    if (msg === 'Forbidden') return NextResponse.json({ error: msg }, { status: 403 });
    console.error('[ADMIN_USERS_PATCH]', error);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
