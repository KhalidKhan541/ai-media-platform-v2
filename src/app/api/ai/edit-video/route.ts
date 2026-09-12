import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { z } from 'zod';

const editVideoSchema = z.object({
  videoUrl: z.string().url(),
  operations: z.array(z.object({
    type: z.enum(['TRIM', 'CROP', 'FILTER', 'ADD_TEXT', 'ADD_MUSIC', 'SPEED', 'TRANSITION']),
    params: z.record(z.unknown()),
  })).min(1).max(20),
  outputFormat: z.enum(['mp4', 'webm', 'mov']).default('mp4'),
  quality: z.enum(['low', 'medium', 'high', 'ultra']).default('medium'),
  resolution: z.enum(['480p', '720p', '1080p', '4k']).default('1080p'),
});

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await request.json();
    const validation = editVideoSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors.map((e) => e.message).join(', ') },
        { status: 400 }
      );
    }

    const { videoUrl, operations, outputFormat, quality, resolution } = validation.data;

    const estimatedDuration = estimateProcessingTime(operations, quality, resolution);

    const job = {
      id: `edit_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      userId: user.id,
      videoUrl,
      operations: operations.map((op) => ({
        ...op,
        description: describeOperation(op),
      })),
      output: {
        format: outputFormat,
        quality,
        resolution,
        estimatedFileSize: estimateFileSize(quality, resolution),
      },
      status: 'QUEUED',
      progress: 0,
      estimatedDuration,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    };

    const totalSteps = operations.length + 2;
    const steps = [
      { step: 'VALIDATE', description: 'Validating input video', progress: 0 },
      ...operations.map((op, idx) => ({
        step: op.type,
        description: describeOperation(op),
        progress: Math.round(((idx + 1) / totalSteps) * 100),
      })),
      { step: 'RENDER', description: 'Rendering final output', progress: 100 },
    ];

    return NextResponse.json({
      job,
      processingPipeline: steps,
      previewUrl: null,
      message: 'Video editing job queued successfully',
    }, { status: 202 });
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Internal server error';
    if (msg === 'Unauthorized') return NextResponse.json({ error: msg }, { status: 401 });
    console.error('[AI_EDIT_VIDEO]', error);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth();
    const { searchParams } = new URL(request.url);
    const jobId = searchParams.get('jobId');

    if (!jobId) {
      return NextResponse.json({ error: 'Job ID required' }, { status: 400 });
    }

    const mockStatus = {
      jobId,
      status: 'PROCESSING',
      progress: Math.floor(Math.random() * 80) + 10,
      currentStep: 'FILTER',
      steps: [
        { step: 'VALIDATE', status: 'completed', duration: '2s' },
        { step: 'TRIM', status: 'completed', duration: '15s' },
        { step: 'FILTER', status: 'processing', progress: 65 },
        { step: 'RENDER', status: 'pending' },
      ],
      estimatedTimeRemaining: '35s',
      outputUrl: null,
    };

    return NextResponse.json({ job: mockStatus });
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Internal server error';
    if (msg === 'Unauthorized') return NextResponse.json({ error: msg }, { status: 401 });
    console.error('[AI_EDIT_VIDEO_GET]', error);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

function describeOperation(op: { type: string; params: Record<string, unknown> }): string {
  switch (op.type) {
    case 'TRIM':
      return `Trim from ${op.params.start || 0}s to ${op.params.end || 'end'}`;
    case 'CROP':
      return `Crop to ${op.params.width || 'default'}x${op.params.height || 'default'}`;
    case 'FILTER':
      return `Apply ${op.params.name || 'default'} filter`;
    case 'ADD_TEXT':
      return `Add text: "${op.params.text || ''}" at position (${op.params.x || 0}, ${op.params.y || 0})`;
    case 'ADD_MUSIC':
      return `Add background music: ${op.params.trackId || 'default'}`;
    case 'SPEED':
      return `Change speed to ${op.params.multiplier || 1}x`;
    case 'TRANSITION':
      return `Add ${op.params.style || 'fade'} transition at ${op.params.position || 0}s`;
    default:
      return 'Unknown operation';
  }
}

function estimateProcessingTime(
  operations: Array<{ type: string }>,
  quality: string,
  resolution: string
): string {
  const baseTime = operations.length * 15;
  const qualityMultiplier: Record<string, number> = { low: 0.5, medium: 1, high: 1.5, ultra: 2.5 };
  const resolutionMultiplier: Record<string, number> = {
    '480p': 0.5, '720p': 1, '1080p': 1.5, '4k': 3,
  };

  const totalSeconds = Math.round(
    baseTime * (qualityMultiplier[quality] || 1) * (resolutionMultiplier[resolution] || 1)
  );

  if (totalSeconds < 60) return `~${totalSeconds}s`;
  return `~${Math.round(totalSeconds / 60)}m ${totalSeconds % 60}s`;
}

function estimateFileSize(quality: string, resolution: string): string {
  const baseSizes: Record<string, number> = { low: 5, medium: 15, high: 40, ultra: 100 };
  const resMultipliers: Record<string, number> = {
    '480p': 0.3, '720p': 0.6, '1080p': 1, '4k': 3,
  };

  const mb = Math.round(
    (baseSizes[quality] || 15) * (resMultipliers[resolution] || 1) * 10
  ) / 10;

  return `~${mb}MB`;
}
