import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { validateInput, commentSchema, paginationSchema } from '@/lib/validators';

interface Params {
  params: { id: string };
}

export async function GET(request: NextRequest, { params }: Params) {
  try {
    const { id } = params;
    const { searchParams } = new URL(request.url);
    const pagination = validateInput(paginationSchema, Object.fromEntries(searchParams.entries()));

    if (!pagination.success) {
      return NextResponse.json({ error: pagination.error }, { status: 400 });
    }

    const { page, limit, sort, order } = pagination.data;
    const skip = (page - 1) * limit;

    const video = await prisma.video.findUnique({ where: { id }, select: { id: true } });
    if (!video) {
      return NextResponse.json({ error: 'Video not found' }, { status: 404 });
    }

    const [comments, total] = await Promise.all([
      prisma.comment.findMany({
        where: { videoId: id, parentId: null },
        include: {
          author: { select: { id: true, name: true, avatar: true } },
          replies: {
            include: {
              author: { select: { id: true, name: true, avatar: true } },
            },
            orderBy: { createdAt: 'asc' },
            take: 10,
          },
          _count: { select: { likes: true, replies: true } },
        },
        orderBy: { [sort]: order },
        skip,
        take: limit,
      }),
      prisma.comment.count({ where: { videoId: id, parentId: null } }),
    ]);

    return NextResponse.json({
      comments,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasMore: skip + limit < total,
      },
    });
  } catch (error) {
    console.error('[COMMENTS_GET]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest, { params }: Params) {
  try {
    const user = await requireAuth();
    const { id } = params;
    const body = await request.json();
    const validation = validateInput(commentSchema, body);

    if (!validation.success) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const video = await prisma.video.findUnique({ where: { id }, select: { id: true } });
    if (!video) {
      return NextResponse.json({ error: 'Video not found' }, { status: 404 });
    }

    if (validation.data.parentId) {
      const parent = await prisma.comment.findUnique({
        where: { id: validation.data.parentId },
        select: { id: true, videoId: true },
      });
      if (!parent || parent.videoId !== id) {
        return NextResponse.json({ error: 'Parent comment not found' }, { status: 404 });
      }
    }

    const comment = await prisma.comment.create({
      data: {
        content: validation.data.content,
        videoId: id,
        authorId: user.id,
        parentId: validation.data.parentId || null,
      },
      include: {
        author: { select: { id: true, name: true, avatar: true } },
        _count: { select: { likes: true, replies: true } },
      },
    });

    return NextResponse.json({ comment }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    if (message === 'Unauthorized') return NextResponse.json({ error: message }, { status: 401 });
    console.error('[COMMENTS_POST]', error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
