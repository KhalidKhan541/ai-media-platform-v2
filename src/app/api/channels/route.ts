import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { validateInput, channelSchema, paginationSchema } from '@/lib/validators';

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

    const where: Record<string, unknown> = {};
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [channels, total] = await Promise.all([
      prisma.channel.findMany({
        where,
        include: {
          owner: { select: { id: true, name: true, avatar: true } },
          _count: { select: { videos: true, subscribers: true } },
        },
        orderBy: sort === 'subscriberCount'
          ? { subscriberCount: order }
          : { [sort]: order },
        skip,
        take: limit,
      }),
      prisma.channel.count({ where }),
    ]);

    return NextResponse.json({
      channels,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasMore: skip + limit < total,
      },
    });
  } catch (error) {
    console.error('[CHANNELS_GET]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await request.json();
    const validation = validateInput(channelSchema, body);

    if (!validation.success) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const { name, description, avatar, banner } = validation.data;
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    const existing = await prisma.channel.findUnique({ where: { slug } });
    if (existing) {
      return NextResponse.json({ error: 'Channel name taken' }, { status: 409 });
    }

    const channel = await prisma.channel.create({
      data: {
        name,
        slug,
        description: description || '',
        avatar: avatar || '',
        banner: banner || '',
        ownerId: user.id,
      },
      include: {
        owner: { select: { id: true, name: true, avatar: true } },
        _count: { select: { videos: true, subscribers: true } },
      },
    });

    return NextResponse.json({ channel }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    if (message === 'Unauthorized') return NextResponse.json({ error: message }, { status: 401 });
    console.error('[CHANNELS_POST]', error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
