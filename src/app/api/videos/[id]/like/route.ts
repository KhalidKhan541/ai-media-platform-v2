import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

interface Params {
  params: { id: string };
}

export async function GET(request: NextRequest, { params }: Params) {
  try {
    const { id } = params;
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    const video = await prisma.video.findUnique({
      where: { id },
      select: { id: true, likeCount: true },
    });

    if (!video) {
      return NextResponse.json({ error: 'Video not found' }, { status: 404 });
    }

    let isLiked = false;
    if (userId) {
      const like = await prisma.like.findUnique({
        where: { videoId_userId: { videoId: id, userId } },
        select: { id: true },
      });
      isLiked = !!like;
    }

    return NextResponse.json({
      likeCount: video.likeCount,
      isLiked,
    });
  } catch (error) {
    console.error('[LIKE_GET]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest, { params }: Params) {
  try {
    const user = await requireAuth();
    const { id } = params;

    const video = await prisma.video.findUnique({ where: { id }, select: { id: true } });
    if (!video) {
      return NextResponse.json({ error: 'Video not found' }, { status: 404 });
    }

    const existing = await prisma.like.findUnique({
      where: { videoId_userId: { videoId: id, userId: user.id } },
    });

    if (existing) {
      return NextResponse.json({ error: 'Already liked' }, { status: 409 });
    }

    const [like, updatedVideo] = await prisma.$transaction([
      prisma.like.create({
        data: { videoId: id, userId: user.id },
      }),
      prisma.video.update({
        where: { id },
        data: { likeCount: { increment: 1 } },
        select: { likeCount: true },
      }),
    ]);

    return NextResponse.json({
      liked: true,
      likeCount: updatedVideo.likeCount,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    if (message === 'Unauthorized') return NextResponse.json({ error: message }, { status: 401 });
    console.error('[LIKE_POST]', error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: Params) {
  try {
    const user = await requireAuth();
    const { id } = params;

    const existing = await prisma.like.findUnique({
      where: { videoId_userId: { videoId: id, userId: user.id } },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Not liked' }, { status: 404 });
    }

    const [, updatedVideo] = await prisma.$transaction([
      prisma.like.delete({
        where: { videoId_userId: { videoId: id, userId: user.id } },
      }),
      prisma.video.update({
        where: { id },
        data: { likeCount: { decrement: 1 } },
        select: { likeCount: true },
      }),
    ]);

    return NextResponse.json({
      liked: false,
      likeCount: updatedVideo.likeCount,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    if (message === 'Unauthorized') return NextResponse.json({ error: message }, { status: 401 });
    console.error('[LIKE_DELETE]', error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
