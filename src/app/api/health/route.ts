import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  const checks: Record<string, { status: string; latency: number; details?: string }> = {};
  let overallStatus = 'healthy';
  const startTime = Date.now();

  try {
    const dbStart = Date.now();
    await prisma.$queryRaw`SELECT 1`;
    checks.database = {
      status: 'healthy',
      latency: Date.now() - dbStart,
    };
  } catch (error) {
    checks.database = {
      status: 'unhealthy',
      latency: -1,
      details: error instanceof Error ? error.message : 'Connection failed',
    };
    overallStatus = 'degraded';
  }

  try {
    const envStart = Date.now();
    const requiredEnvVars = [
      'DATABASE_URL', 'NEXTAUTH_SECRET', 'NEXTAUTH_URL',
    ];
    const missing = requiredEnvVars.filter((v) => !process.env[v]);

    checks.environment = {
      status: missing.length === 0 ? 'healthy' : 'warning',
      latency: Date.now() - envStart,
      details: missing.length > 0 ? `Missing: ${missing.join(', ')}` : 'All present',
    };

    if (missing.length > 0 && overallStatus === 'healthy') {
      overallStatus = 'degraded';
    }
  } catch (error) {
    checks.environment = {
      status: 'unhealthy',
      latency: -1,
      details: error instanceof Error ? error.message : 'Check failed',
    };
    overallStatus = 'degraded';
  }

  try {
    const cacheStart = Date.now();
    checks.cache = {
      status: 'healthy',
      latency: Date.now() - cacheStart,
      details: process.env.REDIS_URL ? 'Redis configured' : 'In-memory fallback',
    };
  } catch (error) {
    checks.cache = {
      status: 'unhealthy',
      latency: -1,
      details: error instanceof Error ? error.message : 'Cache unavailable',
    };
  }

  try {
    const storageStart = Date.now();
    checks.storage = {
      status: process.env.STORAGE_ENDPOINT ? 'healthy' : 'warning',
      latency: Date.now() - storageStart,
      details: process.env.STORAGE_ENDPOINT ? 'Configured' : 'Using local storage',
    };
  } catch (error) {
    checks.storage = {
      status: 'unhealthy',
      latency: -1,
      details: error instanceof Error ? error.message : 'Storage check failed',
    };
  }

  try {
    const aiStart = Date.now();
    checks.ai = {
      status: process.env.AI_API_KEY ? 'healthy' : 'warning',
      latency: Date.now() - aiStart,
      details: process.env.AI_API_KEY ? 'API key configured' : 'Using mock responses',
    };
  } catch (error) {
    checks.ai = {
      status: 'unhealthy',
      latency: -1,
      details: error instanceof Error ? error.message : 'AI check failed',
    };
  }

  const totalLatency = Date.now() - startTime;

  return NextResponse.json({
    status: overallStatus,
    version: process.env.npm_package_version || '2.0.0',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    totalLatency,
    checks,
    memory: {
      heapUsed: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
      heapTotal: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
      rss: Math.round(process.memoryUsage().rss / 1024 / 1024),
      external: Math.round(process.memoryUsage().external / 1024 / 1024),
    },
  }, {
    status: overallStatus === 'healthy' ? 200 : 503,
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'X-Health-Status': overallStatus,
    },
  });
}
