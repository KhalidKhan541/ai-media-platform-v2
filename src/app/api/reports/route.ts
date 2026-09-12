import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { validateInput, reportSchema, paginationSchema } from '@/lib/validators';

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth();
    const { searchParams } = new URL(request.url);
    const params = Object.fromEntries(searchParams.entries());
    const pagination = validateInput(paginationSchema, params);

    if (!pagination.success) {
      return NextResponse.json({ error: pagination.error }, { status: 400 });
    }

    const { page, limit, sort, order } = pagination.data;
    const skip = (page - 1) * limit;

    const status = searchParams.get('status');
    const reason = searchParams.get('reason');
    const targetType = searchParams.get('targetType');

    const isAdmin = user.role === 'ADMIN';
    const where: Record<string, unknown> = {};

    if (!isAdmin) {
      where.reporterId = user.id;
    }

    if (status) where.status = status;
    if (reason) where.reason = reason;
    if (targetType) where.targetType = targetType;

    const [reports, total] = await Promise.all([
      prisma.report.findMany({
        where,
        include: {
          reporter: { select: { id: true, name: true, avatar: true } },
          video: { select: { id: true, title: true, thumbnailUrl: true } },
          channel: { select: { id: true, name: true, avatar: true } },
          user: { select: { id: true, name: true, avatar: true } },
          reviewer: { select: { id: true, name: true } },
        },
        orderBy: { [sort]: order },
        skip,
        take: limit,
      }),
      prisma.report.count({ where }),
    ]);

    const stats = isAdmin ? await prisma.report.groupBy({
      by: ['status'],
      _count: true,
    }) : null;

    return NextResponse.json({
      reports,
      stats,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasMore: skip + limit < total,
      },
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Internal server error';
    if (msg === 'Unauthorized') return NextResponse.json({ error: msg }, { status: 401 });
    console.error('[REPORTS_GET]', error);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await request.json();
    const validation = validateInput(reportSchema, body);

    if (!validation.success) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const { reason, description, targetType, targetId } = validation.data;

    const existingReport = await prisma.report.findFirst({
      where: {
        reporterId: user.id,
        targetType,
        targetId,
        status: { not: 'DISMISSED' },
      },
    });

    if (existingReport) {
      return NextResponse.json(
        { error: 'You have already reported this content' },
        { status: 409 }
      );
    }

    const report = await prisma.report.create({
      data: {
        reason,
        description: description || '',
        targetType,
        targetId,
        reporterId: user.id,
        status: 'PENDING',
      },
      include: {
        reporter: { select: { id: true, name: true, avatar: true } },
      },
    });

    return NextResponse.json({ report }, { status: 201 });
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Internal server error';
    if (msg === 'Unauthorized') return NextResponse.json({ error: msg }, { status: 401 });
    console.error('[REPORTS_POST]', error);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const user = await requireAuth();
    if (user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Admin only' }, { status: 403 });
    }

    const body = await request.json();
    const { reportId, status, resolution } = body;

    if (!reportId || !status) {
      return NextResponse.json({ error: 'reportId and status required' }, { status: 400 });
    }

    const validStatuses = ['PENDING', 'REVIEWING', 'RESOLVED', 'DISMISSED'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    const report = await prisma.report.update({
      where: { id: reportId },
      data: {
        status,
        reviewedBy: user.id,
        reviewedAt: new Date(),
        resolution: resolution || null,
      },
    });

    if (status === 'RESOLVED' && report.reporterId) {
      await prisma.notification.create({
        data: {
          type: 'SYSTEM',
          title: 'Report Resolved',
          message: `Your report has been reviewed and resolved`,
          userId: report.reporterId,
          metadata: { reportId, resolution },
        },
      });
    }

    return NextResponse.json({ report });
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Internal server error';
    if (msg === 'Unauthorized') return NextResponse.json({ error: msg }, { status: 401 });
    if (msg === 'Forbidden') return NextResponse.json({ error: msg }, { status: 403 });
    console.error('[REPORTS_PATCH]', error);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
