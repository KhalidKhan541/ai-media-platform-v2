import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { validateInput, articleSchema } from '@/lib/validators';

interface Params {
  params: { id: string };
}

export async function GET(request: NextRequest, { params }: Params) {
  try {
    const { id } = params;

    const article = await prisma.article.findFirst({
      where: { OR: [{ id }, { slug: id }] },
      include: {
        channel: {
          select: {
            id: true, name: true, avatar: true, slug: true,
            description: true, subscriberCount: true,
          },
        },
        author: { select: { id: true, name: true, avatar: true } },
        comments: {
          where: { parentId: null },
          include: {
            author: { select: { id: true, name: true, avatar: true } },
            replies: {
              include: {
                author: { select: { id: true, name: true, avatar: true } },
              },
              orderBy: { createdAt: 'asc' },
            },
            _count: { select: { likes: true } },
          },
          orderBy: { createdAt: 'desc' },
          take: 50,
        },
        _count: { select: { comments: true } },
      },
    });

    if (!article) {
      return NextResponse.json({ error: 'Article not found' }, { status: 404 });
    }

    await prisma.article.update({
      where: { id: article.id },
      data: { viewCount: { increment: 1 } },
    });

    return NextResponse.json({ article: { ...article, viewCount: article.viewCount + 1 } });
  } catch (error) {
    console.error('[ARTICLE_GET]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: Params) {
  try {
    const user = await requireAuth();
    const { id } = params;
    const body = await request.json();

    const existing = await prisma.article.findUnique({
      where: { id },
      select: { authorId: true },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Article not found' }, { status: 404 });
    }

    if (existing.authorId !== user.id && user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const validation = validateInput(articleSchema.partial(), body);
    if (!validation.success) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const article = await prisma.article.update({
      where: { id },
      data: validation.data,
      include: {
        channel: {
          select: { id: true, name: true, avatar: true, slug: true },
        },
        author: { select: { id: true, name: true, avatar: true } },
      },
    });

    return NextResponse.json({ article });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    if (message === 'Unauthorized') return NextResponse.json({ error: message }, { status: 401 });
    if (message === 'Forbidden') return NextResponse.json({ error: message }, { status: 403 });
    console.error('[ARTICLE_PATCH]', error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: Params) {
  try {
    const user = await requireAuth();
    const { id } = params;

    const existing = await prisma.article.findUnique({
      where: { id },
      select: { authorId: true },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Article not found' }, { status: 404 });
    }

    if (existing.authorId !== user.id && user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await prisma.$transaction([
      prisma.comment.deleteMany({ where: { articleId: id } }),
      prisma.article.delete({ where: { id } }),
    ]);

    return NextResponse.json({ message: 'Article deleted' });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    if (message === 'Unauthorized') return NextResponse.json({ error: message }, { status: 401 });
    if (message === 'Forbidden') return NextResponse.json({ error: message }, { status: 403 });
    console.error('[ARTICLE_DELETE]', error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
