import {
  UserRole,
  VideoStatus,
  LiveStatus,
  PodcastStatus,
  ArticleStatus,
  MonetizationType,
  ContentType,
  AdStatus,
  PaymentStatus,
  SubscriptionTier,
  ContentVisibility,
} from "@prisma/client";

export type {
  UserRole,
  VideoStatus,
  LiveStatus,
  PodcastStatus,
  ArticleStatus,
  MonetizationType,
  ContentType,
  AdStatus,
  PaymentStatus,
  SubscriptionTier,
  ContentVisibility,
};

export interface BaseUser {
  id: string;
  email: string;
  name: string | null;
  username: string | null;
  displayName: string | null;
  avatar: string | null;
  coverImage: string | null;
  bio: string | null;
  location: string | null;
  website: string | null;
  socialLinks: Record<string, string> | null;
  role: UserRole;
  isActive: boolean;
  isVerified: boolean;
  isPremium: boolean;
  lastLoginAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserProfile extends BaseUser {
  channels: ChannelSummary[];
  _count: {
    channels: number;
    videos: number;
    followers: number;
  };
}

export interface UserSession {
  id: string;
  user: {
    id: string;
    email: string;
    name: string | null;
    username: string | null;
    avatar: string | null;
    role: UserRole;
    isVerified: boolean;
    isPremium: boolean;
  };
  expires: Date;
}

export interface ChannelSummary {
  id: string;
  name: string;
  slug: string;
  avatar: string | null;
  isVerified: boolean;
  subscriberCount: number;
}

export interface Channel extends ChannelSummary {
  userId: string;
  description: string | null;
  coverImage: string | null;
  isPartner: boolean;
  viewCount: number;
  videoCount: number;
  monetizationType: MonetizationType;
  defaultVisibility: ContentVisibility;
  createdAt: Date;
  updatedAt: Date;
  user?: BaseUser;
  _count?: {
    videos: number;
    subscribers: number;
    playlists: number;
    liveStreams: number;
    podcasts: number;
    articles: number;
  };
}

export interface ChannelWithDetails extends Channel {
  videos?: Video[];
  playlists?: Playlist[];
  liveStreams?: LiveStream[];
  podcasts?: Podcast[];
  articles?: Article[];
  analytics?: ChannelAnalytics[];
}

export interface VideoSummary {
  id: string;
  title: string;
  slug: string;
  thumbnail: string | null;
  duration: number | null;
  status: VideoStatus;
  visibility: ContentVisibility;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  publishedAt: Date | null;
  createdAt: Date;
}

export interface Video extends VideoSummary {
  channelId: string;
  description: string | null;
  videoUrl: string | null;
  fileSize: bigint | null;
  isPremium: boolean;
  isFeatured: boolean;
  shareCount: number;
  dislikeCount: number;
  scheduledAt: Date | null;
  aiSummary: string | null;
  aiTags: string[] | null;
  aiTranscript: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  seoKeywords: string | null;
  updatedAt: Date;
  channel?: Channel;
  category?: VideoCategory;
  tags?: VideoTag[];
  subtitles?: VideoSubtitle[];
  _count?: {
    comments: number;
    likes: number;
    shares: number;
  };
}

export interface VideoWithDetails extends Video {
  comments?: VideoComment[];
  likes?: VideoLike[];
  analytics?: VideoAnalytics[];
}

export interface VideoCategory {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  parentId: string | null;
  sortOrder: number;
  isActive: boolean;
  children?: VideoCategory[];
  _count?: {
    videos: number;
  };
}

export interface VideoTag {
  id: string;
  videoId: string;
  tag: string;
  createdAt: Date;
}

export interface VideoSubtitle {
  id: string;
  videoId: string;
  language: string;
  label: string;
  url: string | null;
  content: string | null;
  format: string;
  isAuto: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface VideoAnalytics {
  id: string;
  videoId: string;
  date: Date;
  views: number;
  uniqueViews: number;
  watchTime: number;
  avgWatchTime: number;
  retentionRate: number;
  likes: number;
  comments: number;
  shares: number;
  clicks: number;
  ctr: number;
  trafficSources: Record<string, number> | null;
  topCountries: Record<string, number> | null;
  topDevices: Record<string, number> | null;
  createdAt: Date;
}

export interface VideoComment {
  id: string;
  videoId: string;
  userId: string;
  parentId: string | null;
  content: string;
  isPinned: boolean;
  isHidden: boolean;
  likeCount: number;
  createdAt: Date;
  updatedAt: Date;
  user?: BaseUser;
  replies?: VideoComment[];
  _count?: {
    replies: number;
    likes: number;
  };
}

export interface VideoLike {
  id: string;
  videoId: string;
  userId: string;
  commentId: string | null;
  type: string;
  createdAt: Date;
  user?: BaseUser;
}

export interface VideoShare {
  id: string;
  videoId: string;
  userId: string | null;
  platform: string;
  referrer: string | null;
  createdAt: Date;
}

export interface ChannelAnalytics {
  id: string;
  channelId: string;
  date: Date;
  views: number;
  uniqueViews: number;
  watchTime: number;
  subscribers: number;
  revenue: number;
  engagementRate: number;
  topCountries: Record<string, number> | null;
  topDevices: Record<string, number> | null;
  trafficSources: Record<string, number> | null;
  createdAt: Date;
}

export interface Playlist {
  id: string;
  channelId: string;
  title: string;
  description: string | null;
  thumbnail: string | null;
  visibility: ContentVisibility;
  itemCount: number;
  viewCount: number;
  createdAt: Date;
  updatedAt: Date;
  channel?: Channel;
  items?: PlaylistItem[];
}

export interface PlaylistItem {
  id: string;
  playlistId: string;
  videoId: string;
  position: number;
  createdAt: Date;
  video?: Video;
}

export interface LiveStream {
  id: string;
  channelId: string;
  userId: string;
  title: string;
  description: string | null;
  thumbnail: string | null;
  streamKey: string;
  streamUrl: string | null;
  playbackUrl: string | null;
  status: LiveStatus;
  isScheduled: boolean;
  scheduledAt: Date | null;
  startedAt: Date | null;
  endedAt: Date | null;
  duration: number | null;
  peakViewers: number;
  totalViewers: number;
  chatEnabled: boolean;
  donationsEnabled: boolean;
  isPremium: boolean;
  createdAt: Date;
  updatedAt: Date;
  channel?: Channel;
  user?: BaseUser;
  chats?: LiveChat[];
  donations?: LiveDonation[];
  _count?: {
    viewers: number;
  };
}

export interface LiveChat {
  id: string;
  streamId: string;
  userId: string;
  message: string;
  isSuperChat: boolean;
  amount: number | null;
  color: string | null;
  isDeleted: boolean;
  createdAt: Date;
  user?: BaseUser;
}

export interface LiveDonation {
  id: string;
  streamId: string;
  senderId: string;
  amount: number;
  message: string | null;
  isPublic: boolean;
  status: PaymentStatus;
  createdAt: Date;
  sender?: BaseUser;
}

export interface LiveViewer {
  id: string;
  streamId: string;
  userId: string | null;
  ipAddress: string | null;
  userAgent: string | null;
  watchTime: number;
  joinedAt: Date;
  leftAt: Date | null;
}

export interface Podcast {
  id: string;
  channelId: string;
  title: string;
  slug: string;
  description: string | null;
  coverImage: string | null;
  status: PodcastStatus;
  visibility: ContentVisibility;
  episodeCount: number;
  subscriberCount: number;
  totalDownloads: number;
  feedUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
  channel?: Channel;
  episodes?: PodcastEpisode[];
}

export interface PodcastEpisode {
  id: string;
  podcastId: string;
  title: string;
  slug: string;
  description: string | null;
  audioUrl: string | null;
  duration: number | null;
  fileSize: bigint | null;
  episodeNumber: number;
  seasonNumber: number | null;
  status: PodcastStatus;
  publishedAt: Date | null;
  downloadCount: number;
  createdAt: Date;
  updatedAt: Date;
  podcast?: Podcast;
}

export interface PodcastSubscription {
  id: string;
  podcastId: string;
  userId: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Article {
  id: string;
  channelId: string;
  userId: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string | null;
  coverImage: string | null;
  status: ArticleStatus;
  visibility: ContentVisibility;
  isPremium: boolean;
  readTime: number | null;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  publishedAt: Date | null;
  scheduledAt: Date | null;
  seoTitle: string | null;
  seoDescription: string | null;
  seoKeywords: string | null;
  createdAt: Date;
  updatedAt: Date;
  channel?: Channel;
  user?: BaseUser;
  comments?: ArticleComment[];
  likes?: ArticleLike[];
}

export interface ArticleComment {
  id: string;
  articleId: string;
  userId: string;
  parentId: string | null;
  content: string;
  isHidden: boolean;
  likeCount: number;
  createdAt: Date;
  updatedAt: Date;
  user?: BaseUser;
  replies?: ArticleComment[];
  _count?: {
    replies: number;
  };
}

export interface ArticleLike {
  id: string;
  articleId: string;
  userId: string;
  commentId: string | null;
  createdAt: Date;
}

export interface MediaAsset {
  id: string;
  userId: string;
  folderId: string | null;
  filename: string;
  originalName: string;
  mimeType: string;
  fileSize: bigint;
  url: string;
  cdnUrl: string | null;
  alt: string | null;
  metadata: Record<string, unknown> | null;
  videoId: string | null;
  createdAt: Date;
  updatedAt: Date;
  folder?: MediaFolder;
  processing?: MediaProcessing[];
}

export interface MediaFolder {
  id: string;
  userId: string;
  name: string;
  parentId: string | null;
  path: string;
  createdAt: Date;
  updatedAt: Date;
  children?: MediaFolder[];
  assets?: MediaAsset[];
  _count?: {
    assets: number;
    children: number;
  };
}

export interface MediaProcessing {
  id: string;
  assetId: string;
  status: string;
  progress: number;
  inputUrl: string;
  outputUrl: string | null;
  settings: Record<string, unknown> | null;
  error: string | null;
  startedAt: Date | null;
  completedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface ContentSchedule {
  id: string;
  userId: string;
  contentType: ContentType;
  contentId: string;
  scheduledAt: Date;
  publishedAt: Date | null;
  status: string;
  metadata: Record<string, unknown> | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface ContentSeries {
  id: string;
  channelId: string;
  title: string;
  slug: string;
  description: string | null;
  coverImage: string | null;
  isActive: boolean;
  videoCount: number;
  createdAt: Date;
  updatedAt: Date;
  channel?: Channel;
  videos?: Video[];
}

export interface Monetization {
  id: string;
  channelId: string;
  userId: string;
  type: MonetizationType;
  isActive: boolean;
  settings: Record<string, unknown> | null;
  totalRevenue: number;
  monthlyRevenue: number;
  createdAt: Date;
  updatedAt: Date;
  channel?: Channel;
  plans?: MonetizationPlan[];
  _count?: {
    subscribers: number;
  };
}

export interface MonetizationPlan {
  id: string;
  monetizationId: string;
  name: string;
  description: string | null;
  price: number;
  currency: string;
  interval: string;
  features: string[] | null;
  isActive: boolean;
  subscriberCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Subscriber {
  id: string;
  channelId: string;
  subscriberId: string;
  monetizationId: string | null;
  planId: string | null;
  tier: SubscriptionTier;
  isActive: boolean;
  expiresAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  channel?: Channel;
  subscriber?: BaseUser;
  plan?: MonetizationPlan;
}

export interface Donation {
  id: string;
  senderId: string;
  receiverId: string;
  amount: number;
  currency: string;
  message: string | null;
  isAnonymous: boolean;
  status: PaymentStatus;
  goalId: string | null;
  createdAt: Date;
  updatedAt: Date;
  sender?: BaseUser;
  receiver?: BaseUser;
  goal?: DonationGoal;
}

export interface DonationGoal {
  id: string;
  userId: string;
  title: string;
  description: string | null;
  targetAmount: number;
  currentAmount: number;
  isActive: boolean;
  expiresAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  donations?: Donation[];
  _count?: {
    donations: number;
  };
}

export interface BrandDeal {
  id: string;
  channelId: string;
  brandName: string;
  contactEmail: string | null;
  title: string;
  description: string | null;
  budget: number;
  startDate: Date;
  endDate: Date;
  status: string;
  deliverables: Record<string, unknown> | null;
  metrics: Record<string, unknown> | null;
  createdAt: Date;
  updatedAt: Date;
  channel?: Channel;
  videos?: Video[];
  metrics_?: BrandDealMetric[];
}

export interface BrandDealMetric {
  id: string;
  brandDealId: string;
  date: Date;
  views: number;
  clicks: number;
  impressions: number;
  revenue: number;
  createdAt: Date;
}

export interface AdCampaign {
  id: string;
  name: string;
  advertiser: string;
  budget: number;
  spent: number;
  status: AdStatus;
  startDate: Date;
  endDate: Date;
  targeting: Record<string, unknown> | null;
  creative: Record<string, unknown> | null;
  createdAt: Date;
  updatedAt: Date;
  impressions?: AdImpression[];
  _count?: {
    impressions: number;
  };
}

export interface AdImpression {
  id: string;
  campaignId: string;
  userId: string | null;
  videoId: string | null;
  impression: boolean;
  click: boolean;
  revenue: number;
  createdAt: Date;
}

export interface Revenue {
  id: string;
  userId: string;
  source: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  period: string;
  metadata: Record<string, unknown> | null;
  paidAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  source_?: RevenueSource;
}

export interface RevenueSource {
  id: string;
  name: string;
  type: string;
  description: string | null;
  isActive: boolean;
  createdAt: Date;
  revenues?: Revenue[];
}

export interface Notification {
  id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  data: Record<string, unknown> | null;
  readAt: Date | null;
  createdAt: Date;
}

export interface NotificationPreference {
  id: string;
  userId: string;
  emailEnabled: boolean;
  pushEnabled: boolean;
  smsEnabled: boolean;
  types: string[] | null;
  quietHoursStart: string | null;
  quietHoursEnd: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuditLog {
  id: string;
  userId: string | null;
  action: string;
  resource: string;
  resourceId: string | null;
  details: Record<string, unknown> | null;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: Date;
}

export interface Report {
  id: string;
  reporterId: string;
  targetType: string;
  targetId: string;
  reason: string;
  description: string | null;
  status: string;
  resolvedAt: Date | null;
  resolvedBy: string | null;
  createdAt: Date;
  updatedAt: Date;
  reporter?: BaseUser;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: Record<string, string[]>;
  };
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
  };
}

export interface VideoProcessingJob {
  id: string;
  videoId: string;
  status: "pending" | "processing" | "completed" | "failed";
  progress: number;
  inputUrl: string;
  outputUrl?: string;
  thumbnailUrl?: string;
  duration?: number;
  formats?: VideoFormat[];
  error?: string;
  startedAt?: Date;
  completedAt?: Date;
}

export interface VideoFormat {
  quality: string;
  url: string;
  fileSize: number;
  mimeType: string;
}

export interface StreamingMetrics {
  concurrentViewers: number;
  peakViewers: number;
  totalViews: number;
  chatMessages: number;
  donations: number;
  revenue: number;
  averageWatchTime: number;
  engagementRate: number;
}

export interface ContentRecommendation {
  contentId: string;
  contentType: ContentType;
  title: string;
  thumbnail: string;
  score: number;
  reason: string;
}

export interface AISummary {
  summary: string;
  keyPoints: string[];
  sentiment: "positive" | "negative" | "neutral";
  topics: string[];
  confidence: number;
}

export interface AISearchResult {
  contentId: string;
  contentType: ContentType;
  title: string;
  snippet: string;
  relevanceScore: number;
  highlights: string[];
}

export type SortOption =
  | "createdAt"
  | "updatedAt"
  | "viewCount"
  | "likeCount"
  | "commentCount"
  | "publishedAt"
  | "title"
  | "relevance";

export type TimeRange = "day" | "week" | "month" | "quarter" | "year" | "all";

export type MetricPeriod = "hourly" | "daily" | "weekly" | "monthly";

export interface DateRange {
  start: Date;
  end: Date;
}

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface GeoLocation {
  country: string;
  region?: string;
  city?: string;
  coordinates?: Coordinates;
}

export interface DeviceInfo {
  type: "desktop" | "mobile" | "tablet" | "tv" | "other";
  os: string;
  browser: string;
  userAgent: string;
}

export interface TrafficSource {
  source: string;
  medium: string;
  campaign?: string;
  referrer?: string;
}

export interface SearchFilters {
  query?: string;
  type?: ContentType[];
  status?: (VideoStatus | PodcastStatus | ArticleStatus)[];
  visibility?: ContentVisibility[];
  dateRange?: DateRange;
  minViews?: number;
  maxViews?: number;
  minDuration?: number;
  maxDuration?: number;
  tags?: string[];
  categoryId?: string;
  channelId?: string;
}

export interface ExportOptions {
  format: "csv" | "json" | "xlsx";
  dateRange: DateRange;
  metrics: string[];
  filters?: SearchFilters;
  includeHeaders?: boolean;
}

export interface WebhookPayload {
  event: string;
  timestamp: Date;
  data: Record<string, unknown>;
  signature?: string;
}

export interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
  message?: string;
  skipSuccessfulRequests?: boolean;
}

export interface CacheConfig {
  ttl: number;
  staleWhileRevalidate?: number;
  tags?: string[];
}

export interface EmailTemplate {
  to: string;
  subject: string;
  template: string;
  data: Record<string, unknown>;
  cc?: string[];
  bcc?: string[];
  attachments?: Array<{
    filename: string;
    content: Buffer | string;
    contentType?: string;
  }>;
}

export interface PushNotification {
  userId: string;
  title: string;
  body: string;
  icon?: string;
  image?: string;
  url?: string;
  data?: Record<string, unknown>;
}

export interface AnalyticsDashboard {
  overview: {
    totalViews: number;
    totalRevenue: number;
    totalSubscribers: number;
    averageWatchTime: number;
    engagementRate: number;
  };
  trends: {
    views: TrendData[];
    revenue: TrendData[];
    subscribers: TrendData[];
  };
  topContent: VideoSummary[];
  recentActivity: AuditLog[];
  geographic: GeoData[];
  devices: DeviceData[];
}

export interface TrendData {
  date: string;
  value: number;
  change: number;
  changePercent: number;
}

export interface GeoData {
  country: string;
  views: number;
  percentage: number;
}

export interface DeviceData {
  type: string;
  views: number;
  percentage: number;
}
