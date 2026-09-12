import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { validateInput, donationSchema, paginationSchema } from '@/lib/validators';

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
    const where: Record<string, unknown> = { status: 'COMPLETED' };
    if (channelId) where.channelId = channelId;

    const [donations, total] = await Promise.all([
      prisma.donation.findMany({
        where,
        include: {
          donor: {
            select: { id: true, name: true, avatar: true },
          },
          channel: { select: { id: true, name: true, avatar: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.donation.count({ where }),
    ]);

    const sanitized = donations.map((d) => ({
      ...d,
      donor: d.anonymous ? null : d.donor,
    }));

    return NextResponse.json({
      donations: sanitized,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasMore: skip + limit < total,
      },
    });
  } catch (error) {
    console.error('[DONATIONS_GET]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await request.json();
    const validation = validateInput(donationSchema, body);

    if (!validation.success) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const { amount, currency, channelId, message, anonymous } = validation.data;

    if (channelId === user.id) {
      return NextResponse.json({ error: 'Cannot donate to yourself' }, { status: 400 });
    }

    const channel = await prisma.channel.findUnique({
      where: { id: channelId },
      select: { id: true, ownerId: true, name: true },
    });

    if (!channel) {
      return NextResponse.json({ error: 'Channel not found' }, { status: 404 });
    }

    const platformFee = Math.round(amount * 0.05 * 100) / 100;

    const donation = await prisma.donation.create({
      data: {
        amount,
        currency,
        channelId,
        donorId: user.id,
        message: message || '',
        anonymous,
        status: 'PENDING',
        platformFee,
        creatorEarning: amount - platformFee,
      },
      include: {
        channel: { select: { id: true, name: true, avatar: true } },
      },
    });

    await prisma.notification.create({
      data: {
        type: 'DONATION',
        title: 'New Donation',
        message: `You received a ${currency} ${amount} donation`,
        userId: channel.ownerId,
        actorId: user.id,
        metadata: { donationId: donation.id, amount, currency },
      },
    });

    return NextResponse.json({ donation }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    if (message === 'Unauthorized') return NextResponse.json({ error: message }, { status: 401 });
    console.error('[DONATIONS_POST]', error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
