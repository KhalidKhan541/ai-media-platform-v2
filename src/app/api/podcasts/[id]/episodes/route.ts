import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { validateInput, episodeSchema, paginationSchema } from '@/lib/validators';

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

    const podcast = await prisma.podcast.findUnique({ where: { id }, select: { id: true } });
    if (!podcast) {
      return NextResponse.json({ error: 'Podcast not found' }, { status: 404 });
    }

    const season = searchParams.get('season');
    const where: Record<string, unknown> = { podcastId: id };
    if (season) where.seasonNumber = parseInt(season);

    const [episodes, total] = await Promise.all([
      prisma.episode.findMany({
        where,
        orderBy: [
          { seasonNumber: 'asc' },
          { episodeNumber: 'asc' },
          { [sort]: order },
        ],
        skip,
        take: limit,
      }),
      prisma.episode.count({ where }),
    ]);

    return NextResponse.json({
      episodes,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasMore: skip + limit < total,
      },
    });
  } catch (error) {
    console.error('[EPISODES_GET]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest, { params }: Params) {
  try {
    const user = await requireAuth();
    const { id } = params;
    const body = await request.json();
    const validation = validateInput(episodeSchema, body);

    if (!validation.success) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const podcast = await prisma.podcast.findUnique({
      where: { id },
      select: { authorId: true },
    });

    if (!podcast) {
      return NextResponse.json({ error: 'Podcast not found' }, { status: 404 });
    }

    if (podcast.authorId !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const data = validation.data;
    let episodeNumber = data.episodeNumber;

    if (!episodeNumber) {
      const maxEp = await prisma.episode.findFirst({
        where: { podcastId: id, seasonNumber: data.seasonNumber || 1 },
        orderBy: { episodeNumber: 'desc' },
        select: { episodeNumber: true },
      });
      episodeNumber = (maxEp?.episodeNumber || 0) + 1;
    }

    const episode = await prisma.episode.create({
      data: {
        title: data.title,
        description: data.description || '',
        audioUrl: data.audioUrl,
        duration: data.duration || 0,
        seasonNumber: data.seasonNumber || 1,
        episodeNumber,
        explicit: data.explicit,
        podcastId: id,
        authorId: user.id,
      },
    });

    return NextResponse.json({ episode }, { status: 201 });
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Internal server error';
    if (msg === 'Unauthorized') return NextResponse.json({ error: msg }, { status: 401 });
    if (msg === 'Forbidden') return NextResponse.json({ error: msg }, { status: 403 });
    console.error('[EPISODES_POST]', error);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
