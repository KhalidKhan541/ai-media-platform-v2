import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export default prisma;

export type {
  User,
  Video,
  Channel,
  Comment,
  Like,
  Subscription,
  Playlist,
  Podcast,
  Episode,
  Article,
  LiveStream,
  LiveChat,
  MonetizationPlan,
  Donation,
  BrandDeal,
  Notification,
  Report,
  AnalyticsSnapshot,
} from '@prisma/client';
