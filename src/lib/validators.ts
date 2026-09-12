import { z } from "zod";

const MAX_FILE_SIZE = 100 * 1024 * 1024;
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const ACCEPTED_VIDEO_TYPES = ["video/mp4", "video/webm", "video/quicktime"];
const ACCEPTED_AUDIO_TYPES = ["audio/mpeg", "audio/wav", "audio/ogg", "audio/mp4"];

const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(128, "Password must be at most 128 characters")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  .regex(/[0-9]/, "Password must contain at least one number")
  .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character");

const usernameSchema = z
  .string()
  .min(3, "Username must be at least 3 characters")
  .max(30, "Username must be at most 30 characters")
  .regex(/^[a-zA-Z0-9_-]+$/, "Username can only contain letters, numbers, underscores, and hyphens");

const slugSchema = z
  .string()
  .min(1)
  .max(200)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Invalid slug format");

const emailSchema = z.string().email("Invalid email address").toLowerCase();

export const authSchemas = {
  login: z.object({
    email: emailSchema,
    password: z.string().min(1, "Password is required"),
    rememberMe: z.boolean().optional(),
  }),

  register: z.object({
    name: z.string().min(1, "Name is required").max(100),
    email: emailSchema,
    username: usernameSchema,
    password: passwordSchema,
    confirmPassword: z.string(),
    acceptTerms: z.literal(true, {
      errorMap: () => ({ message: "You must accept the terms and conditions" }),
    }),
  }).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  }),

  forgotPassword: z.object({
    email: emailSchema,
  }),

  resetPassword: z.object({
    token: z.string().min(1),
    password: passwordSchema,
    confirmPassword: z.string(),
  }).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  }),

  changePassword: z.object({
    currentPassword: z.string().min(1),
    newPassword: passwordSchema,
    confirmPassword: z.string(),
  }).refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  }),

  verifyEmail: z.object({
    token: z.string().min(1),
  }),
};

export const userSchemas = {
  updateProfile: z.object({
    name: z.string().min(1).max(100).optional(),
    displayName: z.string().max(50).optional(),
    bio: z.string().max(500).optional(),
    location: z.string().max(100).optional(),
    website: z.string().url().optional().or(z.literal("")),
    socialLinks: z.object({
      twitter: z.string().optional(),
      instagram: z.string().optional(),
      youtube: z.string().optional(),
      tiktok: z.string().optional(),
      discord: z.string().optional(),
    }).optional(),
  }),

  updateAvatar: z.object({
    avatar: z.string().url(),
  }),

  updateCover: z.object({
    coverImage: z.string().url(),
  }),

  updateUsername: z.object({
    username: usernameSchema,
  }),

  updateEmail: z.object({
    email: emailSchema,
    password: z.string().min(1, "Password is required to change email"),
  }),

  updateNotificationPreferences: z.object({
    emailEnabled: z.boolean().optional(),
    pushEnabled: z.boolean().optional(),
    smsEnabled: z.boolean().optional(),
    types: z.array(z.string()).optional(),
    quietHoursStart: z.string().optional(),
    quietHoursEnd: z.string().optional(),
  }),

  deleteAccount: z.object({
    password: z.string().min(1, "Password is required"),
    confirmation: z.literal("DELETE", {
      errorMap: () => ({ message: 'Type DELETE to confirm' }),
    }),
  }),
};

export const channelSchemas = {
  create: z.object({
    name: z.string().min(1).max(100),
    slug: slugSchema,
    description: z.string().max(5000).optional(),
    avatar: z.string().url().optional(),
    coverImage: z.string().url().optional(),
  }),

  update: z.object({
    name: z.string().min(1).max(100).optional(),
    description: z.string().max(5000).optional(),
    avatar: z.string().url().optional(),
    coverImage: z.string().url().optional(),
    defaultVisibility: z.enum(["PUBLIC", "UNLISTED", "PRIVATE", "SUBSCRIBERS_ONLY", "PREMIUM_ONLY"]).optional(),
  }),

  updateSettings: z.object({
    defaultVisibility: z.enum(["PUBLIC", "UNLISTED", "PRIVATE", "SUBSCRIBERS_ONLY", "PREMIUM_ONLY"]),
    allowComments: z.boolean().optional(),
    allowRatings: z.boolean().optional(),
    showSubscriberCount: z.boolean().optional(),
  }),

  getByName: z.object({
    slug: slugSchema,
  }),
};

export const videoSchemas = {
  create: z.object({
    channelId: z.string().uuid(),
    title: z.string().min(1).max(200),
    slug: slugSchema,
    description: z.string().max(10000).optional(),
    thumbnail: z.string().url().optional(),
    visibility: z.enum(["PUBLIC", "UNLISTED", "PRIVATE", "SUBSCRIBERS_ONLY", "PREMIUM_ONLY"]).default("DRAFT"),
    isPremium: z.boolean().default(false),
    categoryId: z.string().uuid().optional(),
    tags: z.array(z.string().max(50)).max(30).optional(),
    scheduledAt: z.string().datetime().optional(),
  }),

  update: z.object({
    title: z.string().min(1).max(200).optional(),
    description: z.string().max(10000).optional(),
    thumbnail: z.string().url().optional(),
    visibility: z.enum(["PUBLIC", "UNLISTED", "PRIVATE", "SUBSCRIBERS_ONLY", "PREMIUM_ONLY"]).optional(),
    isPremium: z.boolean().optional(),
    categoryId: z.string().uuid().optional(),
    tags: z.array(z.string().max(50)).max(30).optional(),
    scheduledAt: z.string().datetime().optional(),
  }),

  publish: z.object({
    videoId: z.string().uuid(),
  }),

  uploadThumbnail: z.object({
    file: z.custom<File>(),
  }),

  addSubtitle: z.object({
    language: z.string().min(2).max(10),
    label: z.string().min(1).max(100),
    content: z.string().optional(),
    format: z.enum(["vtt", "srt", "ass"]).default("vtt"),
  }),

  search: z.object({
    q: z.string().max(200).optional(),
    channelId: z.string().uuid().optional(),
    categoryId: z.string().uuid().optional(),
    status: z.enum(["DRAFT", "PROCESSING", "PUBLISHED", "SCHEDULED", "UNLISTED", "PRIVATE", "ARCHIVED"]).optional(),
    visibility: z.enum(["PUBLIC", "UNLISTED", "PRIVATE", "SUBSCRIBERS_ONLY", "PREMIUM_ONLY"]).optional(),
    sortBy: z.enum(["createdAt", "viewCount", "likeCount", "publishedAt"]).default("createdAt"),
    sortOrder: z.enum(["asc", "desc"]).default("desc"),
    page: z.coerce.number().min(1).default(1),
    limit: z.coerce.number().min(1).max(100).default(20),
  }),

  batchUpdate: z.object({
    videoIds: z.array(z.string().uuid()).min(1).max(50),
    action: z.enum(["publish", "archive", "delete", "updateVisibility"]),
    data: z.object({
      visibility: z.enum(["PUBLIC", "UNLISTED", "PRIVATE", "SUBSCRIBERS_ONLY", "PREMIUM_ONLY"]).optional(),
    }).optional(),
  }),
};

export const commentSchemas = {
  create: z.object({
    content: z.string().min(1).max(5000),
    parentId: z.string().uuid().optional(),
  }),

  update: z.object({
    content: z.string().min(1).max(5000),
  }),

  list: z.object({
    page: z.coerce.number().min(1).default(1),
    limit: z.coerce.number().min(1).max(100).default(20),
    sortBy: z.enum(["createdAt", "likeCount"]).default("createdAt"),
    sortOrder: z.enum(["asc", "desc"]).default("desc"),
  }),
};

export const playlistSchemas = {
  create: z.object({
    channelId: z.string().uuid(),
    title: z.string().min(1).max(200),
    description: z.string().max(5000).optional(),
    thumbnail: z.string().url().optional(),
    visibility: z.enum(["PUBLIC", "UNLISTED", "PRIVATE", "SUBSCRIBERS_ONLY"]).default("PUBLIC"),
  }),

  update: z.object({
    title: z.string().min(1).max(200).optional(),
    description: z.string().max(5000).optional(),
    thumbnail: z.string().url().optional(),
    visibility: z.enum(["PUBLIC", "UNLISTED", "PRIVATE", "SUBSCRIBERS_ONLY"]).optional(),
  }),

  addItem: z.object({
    videoId: z.string().uuid(),
    position: z.number().min(0).optional(),
  }),

  reorderItems: z.object({
    itemIds: z.array(z.string().uuid()),
  }),
};

export const liveStreamSchemas = {
  create: z.object({
    channelId: z.string().uuid(),
    title: z.string().min(1).max(200),
    description: z.string().max(5000).optional(),
    thumbnail: z.string().url().optional(),
    isScheduled: z.boolean().default(false),
    scheduledAt: z.string().datetime().optional(),
    chatEnabled: z.boolean().default(true),
    donationsEnabled: z.boolean().default(true),
    isPremium: z.boolean().default(false),
  }),

  update: z.object({
    title: z.string().min(1).max(200).optional(),
    description: z.string().max(5000).optional(),
    thumbnail: z.string().url().optional(),
    scheduledAt: z.string().datetime().optional(),
    chatEnabled: z.boolean().optional(),
    donationsEnabled: z.boolean().optional(),
  }),

  end: z.object({
    streamId: z.string().uuid(),
  }),

  sendChat: z.object({
    message: z.string().min(1).max(500),
    isSuperChat: z.boolean().default(false),
    amount: z.number().min(0.5).max(500).optional(),
    color: z.string().optional(),
  }),
};

export const podcastSchemas = {
  create: z.object({
    channelId: z.string().uuid(),
    title: z.string().min(1).max(200),
    slug: slugSchema,
    description: z.string().max(5000).optional(),
    coverImage: z.string().url().optional(),
  }),

  update: z.object({
    title: z.string().min(1).max(200).optional(),
    description: z.string().max(5000).optional(),
    coverImage: z.string().url().optional(),
    status: z.enum(["DRAFT", "PROCESSING", "PUBLISHED", "SCHEDULED", "ARCHIVED"]).optional(),
  }),

  createEpisode: z.object({
    title: z.string().min(1).max(200),
    slug: slugSchema,
    description: z.string().max(10000).optional(),
    audioUrl: z.string().url().optional(),
    episodeNumber: z.number().min(1),
    seasonNumber: z.number().min(1).optional(),
    status: z.enum(["DRAFT", "PROCESSING", "PUBLISHED", "SCHEDULED"]).default("DRAFT"),
  }),

  updateEpisode: z.object({
    title: z.string().min(1).max(200).optional(),
    description: z.string().max(10000).optional(),
    audioUrl: z.string().url().optional(),
    status: z.enum(["DRAFT", "PROCESSING", "PUBLISHED", "SCHEDULED"]).optional(),
  }),
};

export const articleSchemas = {
  create: z.object({
    channelId: z.string().uuid(),
    title: z.string().min(1).max(200),
    slug: slugSchema,
    content: z.string().min(1),
    excerpt: z.string().max(500).optional(),
    coverImage: z.string().url().optional(),
    visibility: z.enum(["PUBLIC", "UNLISTED", "PRIVATE", "SUBSCRIBERS_ONLY", "PREMIUM_ONLY"]).default("DRAFT"),
    isPremium: z.boolean().default(false),
    scheduledAt: z.string().datetime().optional(),
  }),

  update: z.object({
    title: z.string().min(1).max(200).optional(),
    content: z.string().min(1).optional(),
    excerpt: z.string().max(500).optional(),
    coverImage: z.string().url().optional(),
    visibility: z.enum(["PUBLIC", "UNLISTED", "PRIVATE", "SUBSCRIBERS_ONLY", "PREMIUM_ONLY"]).optional(),
    isPremium: z.boolean().optional(),
    scheduledAt: z.string().datetime().optional(),
  }),

  publish: z.object({
    articleId: z.string().uuid(),
  }),
};

export const monetizationSchemas = {
  create: z.object({
    channelId: z.string().uuid(),
    type: z.enum(["ADS", "SUBSCRIPTION", "TIPS", "MERCHANDISE", "PREMIUM_CONTENT", "COURSES", "AFFILIATE"]),
    settings: z.record(z.unknown()).optional(),
  }),

  updateSettings: z.object({
    isActive: z.boolean().optional(),
    settings: z.record(z.unknown()).optional(),
  }),

  createPlan: z.object({
    monetizationId: z.string().uuid(),
    name: z.string().min(1).max(100),
    description: z.string().max(1000).optional(),
    price: z.number().min(0.5).max(10000),
    currency: z.string().default("USD"),
    interval: z.enum(["monthly", "yearly", "one-time"]).default("monthly"),
    features: z.array(z.string()).optional(),
  }),

  subscribe: z.object({
    channelId: z.string().uuid(),
    planId: z.string().uuid(),
  }),
};

export const donationSchemas = {
  create: z.object({
    receiverId: z.string().uuid(),
    amount: z.number().min(1).max(10000),
    currency: z.string().default("USD"),
    message: z.string().max(500).optional(),
    isAnonymous: z.boolean().default(false),
    goalId: z.string().uuid().optional(),
  }),

  createGoal: z.object({
    title: z.string().min(1).max(200),
    description: z.string().max(1000).optional(),
    targetAmount: z.number().min(10).max(1000000),
    expiresAt: z.string().datetime().optional(),
  }),
};

export const mediaSchemas = {
  upload: z.object({
    file: z.custom<File>(),
    folderId: z.string().uuid().optional(),
  }),

  createFolder: z.object({
    name: z.string().min(1).max(100),
    parentId: z.string().uuid().optional(),
  }),

  renameFolder: z.object({
    name: z.string().min(1).max(100),
  }),

  moveAsset: z.object({
    folderId: z.string().uuid().optional(),
  }),

  deleteMultiple: z.object({
    assetIds: z.array(z.string().uuid()).min(1).max(100),
  }),

  search: z.object({
    q: z.string().max(200).optional(),
    mimeType: z.string().optional(),
    folderId: z.string().uuid().optional(),
    page: z.coerce.number().min(1).default(1),
    limit: z.coerce.number().min(1).max(100).default(20),
  }),
};

export const reportSchemas = {
  create: z.object({
    targetType: z.enum(["VIDEO", "COMMENT", "CHANNEL", "USER", "ARTICLE", "LIVE_STREAM"]),
    targetId: z.string().uuid(),
    reason: z.enum([
      "SPAM",
      "HARASSMENT",
      "HATE_SPEECH",
      "VIOLENCE",
      "SEXUAL_CONTENT",
      "COPYRIGHT",
      "MISINFORMATION",
      "SCAM",
      "OTHER",
    ]),
    description: z.string().max(2000).optional(),
  }),

  resolve: z.object({
    reportId: z.string().uuid(),
    action: z.enum(["dismiss", "warn", "suspend", "ban", "remove_content"]),
    note: z.string().max(1000).optional(),
  }),
};

export const analyticsSchemas = {
  videoAnalytics: z.object({
    videoId: z.string().uuid(),
    startDate: z.string().datetime(),
    endDate: z.string().datetime(),
    granularity: z.enum(["hourly", "daily", "weekly", "monthly"]).default("daily"),
  }),

  channelAnalytics: z.object({
    channelId: z.string().uuid(),
    startDate: z.string().datetime(),
    endDate: z.string().datetime(),
    granularity: z.enum(["daily", "weekly", "monthly"]).default("daily"),
  }),

  revenueReport: z.object({
    userId: z.string().uuid().optional(),
    startDate: z.string().datetime(),
    endDate: z.string().datetime(),
    source: z.string().optional(),
  }),
};

export const contentScheduleSchemas = {
  create: z.object({
    contentType: z.enum(["VIDEO", "PODCAST", "ARTICLE", "LIVE_STREAM"]),
    contentId: z.string().uuid(),
    scheduledAt: z.string().datetime(),
    metadata: z.record(z.unknown()).optional(),
  }),

  update: z.object({
    scheduleId: z.string().uuid(),
    scheduledAt: z.string().datetime().optional(),
    status: z.enum(["pending", "published", "cancelled"]).optional(),
  }),

  cancel: z.object({
    scheduleId: z.string().uuid(),
  }),
};

export const brandDealSchemas = {
  create: z.object({
    channelId: z.string().uuid(),
    brandName: z.string().min(1).max(200),
    contactEmail: z.string().email().optional(),
    title: z.string().min(1).max(200),
    description: z.string().max(5000).optional(),
    budget: z.number().min(0),
    startDate: z.string().datetime(),
    endDate: z.string().datetime(),
    deliverables: z.record(z.unknown()).optional(),
  }),

  update: z.object({
    brandName: z.string().min(1).max(200).optional(),
    contactEmail: z.string().email().optional(),
    title: z.string().min(1).max(200).optional(),
    description: z.string().max(5000).optional(),
    budget: z.number().min(0).optional(),
    startDate: z.string().datetime().optional(),
    endDate: z.string().datetime().optional(),
    status: z.enum(["pending", "active", "completed", "cancelled"]).optional(),
    deliverables: z.record(z.unknown()).optional(),
  }),

  addMetric: z.object({
    brandDealId: z.string().uuid(),
    date: z.string().datetime(),
    views: z.number().min(0).optional(),
    clicks: z.number().min(0).optional(),
    impressions: z.number().min(0).optional(),
    revenue: z.number().min(0).optional(),
  }),
};

export const adCampaignSchemas = {
  create: z.object({
    name: z.string().min(1).max(200),
    advertiser: z.string().min(1).max(200),
    budget: z.number().min(0),
    startDate: z.string().datetime(),
    endDate: z.string().datetime(),
    targeting: z.record(z.unknown()).optional(),
    creative: z.record(z.unknown()).optional(),
  }),

  update: z.object({
    name: z.string().min(1).max(200).optional(),
    advertiser: z.string().min(1).max(200).optional(),
    budget: z.number().min(0).optional(),
    startDate: z.string().datetime().optional(),
    endDate: z.string().datetime().optional(),
    status: z.enum(["DRAFT", "PENDING", "ACTIVE", "PAUSED", "COMPLETED", "REJECTED", "EXPIRED"]).optional(),
    targeting: z.record(z.unknown()).optional(),
    creative: z.record(z.unknown()).optional(),
  }),

  recordImpression: z.object({
    campaignId: z.string().uuid(),
    userId: z.string().uuid().optional(),
    videoId: z.string().uuid().optional(),
    impression: z.boolean().default(true),
    click: z.boolean().default(false),
    revenue: z.number().min(0).optional(),
  }),
};

export const adminSchemas = {
  updateUserRole: z.object({
    userId: z.string().uuid(),
    role: z.enum(["USER", "CREATOR", "MODERATOR", "ADMIN", "SUPER_ADMIN"]),
  }),

  suspendUser: z.object({
    userId: z.string().uuid(),
    reason: z.string().min(1).max(1000),
    duration: z.number().min(1).max(365).optional(),
  }),

  banUser: z.object({
    userId: z.string().uuid(),
    reason: z.string().min(1).max(1000),
  }),

  systemSettings: z.object({
    siteName: z.string().optional(),
    siteDescription: z.string().optional(),
    maintenanceMode: z.boolean().optional(),
    registrationEnabled: z.boolean().optional(),
    maxUploadSize: z.number().optional(),
    allowedVideoTypes: z.array(z.string()).optional(),
    allowedImageTypes: z.array(z.string()).optional(),
  }),
};

export const paginationSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  sortBy: z.string().optional(),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

export const searchSchema = z.object({
  q: z.string().min(1).max(200),
  type: z.enum(["all", "videos", "channels", "articles", "podcasts"]).default("all"),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(50).default(20),
});

export const idParamSchema = z.object({
  id: z.string().uuid("Invalid ID format"),
});

export const slugParamSchema = z.object({
  slug: slugSchema,
});

export type LoginInput = z.infer<typeof authSchemas.login>;
export type RegisterInput = z.infer<typeof authSchemas.register>;
export type UpdateProfileInput = z.infer<typeof userSchemas.updateProfile>;
export type CreateChannelInput = z.infer<typeof channelSchemas.create>;
export type CreateVideoInput = z.infer<typeof videoSchemas.create>;
export type CreateCommentInput = z.infer<typeof commentSchemas.create>;
export type CreatePlaylistInput = z.infer<typeof playlistSchemas.create>;
export type CreateLiveStreamInput = z.infer<typeof liveStreamSchemas.create>;
export type CreatePodcastInput = z.infer<typeof podcastSchemas.create>;
export type CreateArticleInput = z.infer<typeof articleSchemas.create>;
export type CreateDonationInput = z.infer<typeof donationSchemas.create>;
export type CreateReportInput = z.infer<typeof reportSchemas.create>;
export type PaginationInput = z.infer<typeof paginationSchema>;
export type SearchInput = z.infer<typeof searchSchema>;
