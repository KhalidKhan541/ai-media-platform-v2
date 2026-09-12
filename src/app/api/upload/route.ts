import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import prisma from '@/lib/prisma';

const MAX_FILE_SIZE = 500 * 1024 * 1024;
const ALLOWED_TYPES = {
  video: ['video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo', 'video/x-flv', 'video/x-matroska'],
  image: ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml'],
  audio: ['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/flac', 'audio/aac'],
  document: ['application/pdf', 'text/plain', 'application/msword'],
};

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();

    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const channelId = formData.get('channelId') as string | null;
    const purpose = formData.get('purpose') as string | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: 'File too large (max 500MB)' }, { status: 400 });
    }

    const detectedType = detectFileType(file.type, file.name);
    if (!detectedType) {
      return NextResponse.json(
        { error: `Unsupported file type: ${file.type}` },
        { status: 400 }
      );
    }

    if (channelId) {
      const channel = await prisma.channel.findFirst({
        where: { id: channelId, ownerId: user.id },
      });
      if (!channel) {
        return NextResponse.json({ error: 'Channel not found or unauthorized' }, { status: 404 });
      }
    }

    const ext = file.name.split('.').pop() || '';
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).slice(2, 10);
    const storageKey = `uploads/${detectedType}/${user.id}/${timestamp}-${randomId}.${ext}`;

    const fileUrl = `https://storage.example.com/${storageKey}`;
    const thumbnailUrl = detectedType === 'video'
      ? `https://storage.example.com/thumbnails/${user.id}/${timestamp}-${randomId}.jpg`
      : null;

    const upload = await prisma.upload.create({
      data: {
        fileName: file.name,
        fileUrl,
        fileType: file.type,
        fileSize: file.size,
        storageKey,
        thumbnailUrl,
        userId: user.id,
        channelId: channelId || null,
        purpose: purpose || 'general',
        status: 'COMPLETED',
        metadata: JSON.stringify({
          originalName: file.name,
          mimeType: file.type,
          size: file.size,
          detectedType,
        }),
      },
    });

    return NextResponse.json({
      upload,
      url: fileUrl,
      thumbnailUrl,
      message: 'File uploaded successfully',
    }, { status: 201 });
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Internal server error';
    if (msg === 'Unauthorized') return NextResponse.json({ error: msg }, { status: 401 });
    console.error('[UPLOAD_POST]', error);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth();
    const { searchParams } = new URL(request.url);
    const channelId = searchParams.get('channelId');
    const purpose = searchParams.get('purpose');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100);
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = { userId: user.id };
    if (channelId) where.channelId = channelId;
    if (purpose) where.purpose = purpose;

    const [uploads, total] = await Promise.all([
      prisma.upload.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.upload.count({ where }),
    ]);

    return NextResponse.json({
      uploads,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasMore: skip + limit < total,
      },
    });
  } catch (error) {
    console.error('[UPLOAD_GET]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

function detectFileType(mimeType: string, fileName: string): string | null {
  for (const [type, mimes] of Object.entries(ALLOWED_TYPES)) {
    if (mimes.includes(mimeType)) return type;
  }
  const ext = fileName.split('.').pop()?.toLowerCase();
  if (['mp4', 'webm', 'mov', 'avi', 'flv', 'mkv'].includes(ext || '')) return 'video';
  if (['jpg', 'jpeg', 'png', 'webp', 'gif', 'svg'].includes(ext || '')) return 'image';
  if (['mp3', 'wav', 'ogg', 'flac', 'aac'].includes(ext || '')) return 'audio';
  if (['pdf', 'doc', 'docx', 'txt'].includes(ext || '')) return 'document';
  return null;
}
