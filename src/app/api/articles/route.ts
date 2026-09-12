import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { validateInput, articleSchema, paginationSchema } from '@/lib/validators';

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

    const where: Record<string, unknown> = { published: true };
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { content: { contains: search, mode: 'insensitive' } },
        { tags: { hasSome: [search] } },
      ];
    }

    const tag = searchParams.get('tag');
    if (tag) where.tags = { hasSome: [tag] };

    const channelId = searchParams.get('channelId');
    if (channelId) where.channelId = channelId;

    const [articles, total] = await Promise.all([
      prisma.article.findMany({
        where,
        include: {
          channel: {
            select: { id: true, name: true, avatar: true, slug: true },
          },
          author: { select: { id: true, name: true, avatar: true } },
          _count: { select: { comments: true } },
        },
        orderBy: { [sort]: order },
        skip,
        take: limit,
      }),
      prisma.article.count({ where }),
    ]);

    return NextResponse.json({
      articles,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasMore: skip + limit < total,
      },
    });
  } catch (error) {
    console.error('[ARTICLES_GET]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await request.json();
    const validation = validateInput(articleSchema, body);

    if (!validation.success) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const { title, content, excerpt, coverImage, tags, channelId, published } = validation.data;

    const channel = await prisma.channel.findFirst({
      where: { id: channelId, ownerId: user.id },
    });

    if (!channel) {
      return NextResponse.json(
        { error: 'Channel not found or unauthorized' },
        { status: 404 }
      );
    }

    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    const existingSlug = await prisma.article.findFirst({
      where: { channelId, slug },
      select: { id: true },
    });

    const finalSlug = existingSlug ? `${slug}-${Date.now()}` : slug;

    const article = await prisma.article.create({
      data: {
        title,
        slug: finalSlug,
        content,
        excerpt: excerpt || content.slice(0, 200),
        coverImage: coverImage || '',
        tags: tags || [],
        channelId,
        authorId: user.id,
        published,
        viewCount: 0,
      },
      include: {
        channel: {
          select: { id: true, name: true, avatar: true, slug: true },
        },
        author: { select: { id: true, name: true, avatar: true } },
      },
    });

    return NextResponse.json({ article }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    if (message === 'Unauthorized') return NextResponse.json({ error: message }, { status: 401 });
    console.error('[ARTICLES_POST]', error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
