import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { validateInput, paginationSchema } from '@/lib/validators';

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

    const where: Record<string, unknown> = { userId: user.id };
    const status = searchParams.get('status');
    if (status) where.status = status;

    const [subscriptions, total] = await Promise.all([
      prisma.userSubscription.findMany({
        where,
        include: {
          plan: {
            include: {
              channel: { select: { id: true, name: true, avatar: true, slug: true } },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.userSubscription.count({ where }),
    ]);

    return NextResponse.json({
      subscriptions,
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
    console.error('[SUBSCRIPTIONS_GET]', error);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await request.json();

    const { planId } = body;
    if (!planId) {
      return NextResponse.json({ error: 'Plan ID required' }, { status: 400 });
    }

    const plan = await prisma.monetizationPlan.findUnique({
      where: { id: planId },
      include: { channel: { select: { id: true, ownerId: true, name: true } } },
    });

    if (!plan) {
      return NextResponse.json({ error: 'Plan not found' }, { status: 404 });
    }

    if (plan.channel.ownerId === user.id) {
      return NextResponse.json({ error: 'Cannot subscribe to own channel' }, { status: 400 });
    }

    const existing = await prisma.userSubscription.findFirst({
      where: { userId: user.id, planId, status: 'ACTIVE' },
    });

    if (existing) {
      return NextResponse.json({ error: 'Already subscribed to this plan' }, { status: 409 });
    }

    const subscription = await prisma.userSubscription.create({
      data: {
        userId: user.id,
        planId,
        status: 'ACTIVE',
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
      include: {
        plan: {
          include: {
            channel: { select: { id: true, name: true, avatar: true } },
          },
        },
      },
    });

    await prisma.notification.create({
      data: {
        type: 'NEW_SUBSCRIBER',
        title: 'New Paid Subscriber',
        message: `${user.name} subscribed to ${plan.name}`,
        userId: plan.channel.ownerId,
        actorId: user.id,
        metadata: { planId, amount: plan.price, currency: plan.currency },
      },
    });

    return NextResponse.json({ subscription }, { status: 201 });
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Internal server error';
    if (msg === 'Unauthorized') return NextResponse.json({ error: msg }, { status: 401 });
    console.error('[SUBSCRIPTIONS_POST]', error);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await requireAuth();
    const { searchParams } = new URL(request.url);
    const subscriptionId = searchParams.get('id');

    if (!subscriptionId) {
      return NextResponse.json({ error: 'Subscription ID required' }, { status: 400 });
    }

    const subscription = await prisma.userSubscription.findUnique({
      where: { id: subscriptionId },
      select: { userId: true, status: true },
    });

    if (!subscription) {
      return NextResponse.json({ error: 'Subscription not found' }, { status: 404 });
    }

    if (subscription.userId !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    if (subscription.status !== 'ACTIVE') {
      return NextResponse.json({ error: 'Subscription is not active' }, { status: 400 });
    }

    const updated = await prisma.userSubscription.update({
      where: { id: subscriptionId },
      data: { status: 'CANCELLED', cancelledAt: new Date() },
    });

    return NextResponse.json({ subscription: updated });
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Internal server error';
    if (msg === 'Unauthorized') return NextResponse.json({ error: msg }, { status: 401 });
    if (msg === 'Forbidden') return NextResponse.json({ error: msg }, { status: 403 });
    console.error('[SUBSCRIPTIONS_DELETE]', error);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
