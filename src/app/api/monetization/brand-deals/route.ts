import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { validateInput, brandDealSchema, paginationSchema } from '@/lib/validators';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const params = Object.fromEntries(searchParams.entries());
    const pagination = validateInput(paginationSchema, params);

    if (!pagination.success) {
      return NextResponse.json({ error: pagination.error }, { status: 400 });
    }

    const { page, limit, sort, order, search } = pagination.data;
    const skip = (page - 1) * limit;

    const status = searchParams.get('status');
    const userId = searchParams.get('userId');
    const channelId = searchParams.get('channelId');

    const where: Record<string, unknown> = {};
    if (status) where.status = status;
    if (userId) where.authorId = userId;
    if (channelId) where.channelId = channelId;
    if (search) {
      where.OR = [
        { brandName: { contains: search, mode: 'insensitive' } },
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [deals, total] = await Promise.all([
      prisma.brandDeal.findMany({
        where,
        include: {
          channel: { select: { id: true, name: true, avatar: true } },
          author: { select: { id: true, name: true, avatar: true } },
        },
        orderBy: { [sort]: order },
        skip,
        take: limit,
      }),
      prisma.brandDeal.count({ where }),
    ]);

    return NextResponse.json({
      deals,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasMore: skip + limit < total,
      },
    });
  } catch (error) {
    console.error('[BRAND_DEALS_GET]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await request.json();
    const validation = validateInput(brandDealSchema, body);

    if (!validation.success) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const { brandName, title, description, budget, currency, deadline, requirements } = validation.data;

    const channel = searchParamsGet(body, 'channelId');

    let channelId = body.channelId;
    if (channelId) {
      const ch = await prisma.channel.findFirst({
        where: { id: channelId, ownerId: user.id },
      });
      if (!ch) {
        return NextResponse.json({ error: 'Channel not found or unauthorized' }, { status: 404 });
      }
    }

    const deal = await prisma.brandDeal.create({
      data: {
        brandName,
        title,
        description,
        budget,
        currency,
        deadline: deadline ? new Date(deadline) : null,
        requirements: requirements || [],
        channelId: channelId || null,
        authorId: user.id,
        status: 'OPEN',
      },
      include: {
        channel: { select: { id: true, name: true, avatar: true } },
        author: { select: { id: true, name: true, avatar: true } },
      },
    });

    return NextResponse.json({ deal }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    if (message === 'Unauthorized') return NextResponse.json({ error: message }, { status: 401 });
    console.error('[BRAND_DEALS_POST]', error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

function searchParamsGet(body: Record<string, unknown>, key: string): string | null {
  const val = body[key];
  return typeof val === 'string' ? val : null;
}
