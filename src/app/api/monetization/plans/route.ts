import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { validateInput, monetizationPlanSchema, paginationSchema } from '@/lib/validators';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const params = Object.fromEntries(searchParams.entries());
    const pagination = validateInput(paginationSchema, params);

    if (!pagination.success) {
      return NextResponse.json({ error: pagination.error }, { status: 400 });
    }

    const { page, limit } = pagination.data;
    const skip = (page - 1) * limit;

    const channelId = searchParams.get('channelId');
    const where: Record<string, unknown> = {};
    if (channelId) where.channelId = channelId;

    const [plans, total] = await Promise.all([
      prisma.monetizationPlan.findMany({
        where,
        include: {
          channel: { select: { id: true, name: true, avatar: true } },
          _count: { select: { subscribers: true } },
        },
        orderBy: { price: 'asc' },
        skip,
        take: limit,
      }),
      prisma.monetizationPlan.count({ where }),
    ]);

    return NextResponse.json({
      plans,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasMore: skip + limit < total,
      },
    });
  } catch (error) {
    console.error('[PLANS_GET]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await request.json();
    const validation = validateInput(monetizationPlanSchema, body);

    if (!validation.success) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const { name, price, currency, features, channelId } = validation.data;

    const channel = await prisma.channel.findFirst({
      where: { id: channelId, ownerId: user.id },
    });

    if (!channel) {
      return NextResponse.json(
        { error: 'Channel not found or unauthorized' },
        { status: 404 }
      );
    }

    const existingPlan = await prisma.monetizationPlan.findFirst({
      where: { channelId, name },
    });

    if (existingPlan) {
      return NextResponse.json(
        { error: 'Plan with this name already exists' },
        { status: 409 }
      );
    }

    const plan = await prisma.monetizationPlan.create({
      data: {
        name,
        price,
        currency,
        features,
        channelId,
        authorId: user.id,
      },
      include: {
        channel: { select: { id: true, name: true, avatar: true } },
        _count: { select: { subscribers: true } },
      },
    });

    return NextResponse.json({ plan }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    if (message === 'Unauthorized') return NextResponse.json({ error: message }, { status: 401 });
    console.error('[PLANS_POST]', error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
