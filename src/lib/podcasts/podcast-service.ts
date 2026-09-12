import mongoose, { Schema, Document, Model } from "mongoose";
import { z } from "zod";
import { v4 as uuidv4 } from "uuid";

// ---------------------------------------------------------------------------
// Zod Schemas
// ---------------------------------------------------------------------------

export const CreatePodcastSchema = z.object({
  title: z.string().min(1).max(300),
  description: z.string().max(5000).optional(),
  channelId: z.string(),
  category: z.enum([
    "business",
    "comedy",
    "education",
    "fiction",
    "government",
    "health",
    "history",
    "kids",
    "music",
    "news",
    "religion",
    "science",
    "sports",
    "tech",
    "true_crime",
    "other",
  ]),
  tags: z.array(z.string().max(50)).max(20).default([]),
  language: z.string().min(2).max(10).default("en"),
  author: z.string().max(100).optional(),
  website: z.string().url().optional(),
  email: z.string().email().optional(),
  copyright: z.string().max(200).optional(),
  explicit: z.boolean().default(false),
  coverImageUrl: z.string().url().optional(),
  coverImageUrls: z
    .object({
      small: z.string().url().optional(),
      medium: z.string().url().optional(),
      large: z.string().url().optional(),
    })
    .optional(),
});

export const UpdatePodcastSchema = CreatePodcastSchema.partial();

export const CreateEpisodeSchema = z.object({
  podcastId: z.string(),
  title: z.string().min(1).max(300),
  description: z.string().max(10000).optional(),
  audioUrl: z.string().url(),
  durationSeconds: z.number().int().positive(),
  season: z.number().int().positive().optional(),
  episodeNumber: z.number().int().positive(),
  episodeType: z
    .enum(["full", "trailer", "bonus"])
    .default("full"),
  publicationDate: z.date().optional(),
  transcript: z.string().max(100000).optional(),
  showNotes: z.string().max(10000).optional(),
});

export const UpdateEpisodeSchema = CreateEpisodeSchema.partial().extend({
  podcastId: z.string().optional(),
});

export const PodcastQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
  sort: z
    .enum(["newest", "oldest", "popular", "alphabetical"])
    .default("newest"),
  category: z.string().optional(),
  language: z.string().optional(),
  tags: z.array(z.string()).optional(),
  search: z.string().max(200).optional(),
  channelId: z.string().optional(),
});

export const SubscribeSchema = z.object({
  podcastId: z.string(),
  userId: z.string(),
});

export const ReviewSchema = z.object({
  podcastId: z.string(),
  userId: z.string(),
  userName: z.string().min(1).max(100),
  rating: z.number().int().min(1).max(5),
  title: z.string().max(200).optional(),
  content: z.string().max(2000).optional(),
});

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type CreatePodcastInput = z.infer<typeof CreatePodcastSchema>;
export type UpdatePodcastInput = z.infer<typeof UpdatePodcastSchema>;
export type CreateEpisodeInput = z.infer<typeof CreateEpisodeSchema>;
export type UpdateEpisodeInput = z.infer<typeof UpdateEpisodeSchema>;
export type PodcastQueryInput = z.infer<typeof PodcastQuerySchema>;
export type SubscribeInput = z.infer<typeof SubscribeSchema>;
export type ReviewInput = z.infer<typeof ReviewSchema>;

export type PodcastStatus = "draft" | "published" | "paused" | "archived";
export type EpisodeStatus = "draft" | "published" | "archived";

export interface IPodcastReview {
  reviewId: string;
  userId: string;
  userName: string;
  rating: number;
  title: string;
  content: string;
  isEdited: boolean;
  helpfulCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface IPodcast extends Document {
  _id: string;
  podcastId: string;
  title: string;
  description: string;
  channelId: string;
  category: string;
  tags: string[];
  language: string;
  author: string;
  website: string;
  email: string;
  copyright: string;
  explicit: boolean;
  status: PodcastStatus;
  coverImageUrl: string;
  coverImageUrls: { small: string; medium: string; large: string };
  feedUrl: string;
  subscriberCount: number;
  episodeCount: number;
  totalPlayCount: number;
  averageRating: number;
  reviewCount: number;
  reviews: IPodcastReview[];
  isSubscribed?: boolean;
  createdAt: Date;
  updatedAt: Date;

  incrementSubscribers(): Promise<IPodcast>;
  decrementSubscribers(): Promise<IPodcast>;
  incrementPlays(count?: number): Promise<IPodcast>;
  recalculateRating(): Promise<IPodcast>;
}

export interface IPodcastEpisode extends Document {
  _id: string;
  episodeId: string;
  podcastId: string;
  title: string;
  description: string;
  audioUrl: string;
  durationSeconds: number;
  season: number | null;
  episodeNumber: number;
  episodeType: "full" | "trailer" | "bonus";
  status: EpisodeStatus;
  publicationDate: Date;
  playCount: number;
  downloadCount: number;
  likeCount: number;
  transcript: string;
  showNotes: string;
  isAIGenerated: boolean;
  createdAt: Date;
  updatedAt: Date;

  incrementPlays(count?: number): Promise<IPodcastEpisode>;
  incrementDownloads(count?: number): Promise<IPodcastEpisode>;
  incrementLikes(): Promise<IPodcastEpisode>;
  decrementLikes(): Promise<IPodcastEpisode>;
}

export interface ISubscription {
  subscriptionId: string;
  podcastId: string;
  userId: string;
  createdAt: Date;
  isAutoDownload: boolean;
}

export interface IPodcastModel extends Model<IPodcast> {
  findByPodcastId(podcastId: string): Promise<IPodcast | null>;
  findByChannel(channelId: string): Promise<IPodcast[]>;
  findPopular(limit?: number): Promise<IPodcast[]>;
}

export interface IEpisodeModel extends Model<IPodcastEpisode> {
  findByEpisodeId(episodeId: string): Promise<IPodcastEpisode | null>;
  findByPodcastId(podcastId: string): Promise<IPodcastEpisode[]>;
  findLatest(podcastId: string, limit?: number): Promise<IPodcastEpisode[]>;
}

export interface PodcastListResult {
  podcasts: IPodcast[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface EpisodeListResult {
  episodes: IPodcastEpisode[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface PodcastStats {
  totalPodcasts: number;
  published: number;
  totalEpisodes: number;
  totalSubscribers: number;
  totalPlays: number;
  averageRating: number;
  topCategories: Array<{ category: string; count: number }>;
}

// ---------------------------------------------------------------------------
// Mongoose Schema
// ---------------------------------------------------------------------------

const PodcastReviewSchema = new Schema<IPodcastReview>(
  {
    reviewId: { type: String, required: true, default: () => uuidv4() },
    userId: { type: String, required: true },
    userName: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    title: { type: String, maxlength: 200, default: "" },
    content: { type: String, maxlength: 2000, default: "" },
    isEdited: { type: Boolean, default: false },
    helpfulCount: { type: Number, default: 0 },
  },
  { _id: false, timestamps: true }
);

const PodcastSchema = new Schema<IPodcast, IPodcastModel>(
  {
    podcastId: {
      type: String,
      required: true,
      unique: true,
      default: () => uuidv4(),
      index: true,
    },
    title: { type: String, required: true, trim: true, maxlength: 300 },
    description: { type: String, maxlength: 5000, default: "" },
    channelId: { type: String, required: true, index: true },
    category: {
      type: String,
      enum: [
        "business",
        "comedy",
        "education",
        "fiction",
        "government",
        "health",
        "history",
        "kids",
        "music",
        "news",
        "religion",
        "science",
        "sports",
        "tech",
        "true_crime",
        "other",
      ],
      default: "other",
    },
    tags: [{ type: String, maxlength: 50 }],
    language: { type: String, minlength: 2, maxlength: 10, default: "en" },
    author: { type: String, maxlength: 100, default: "" },
    website: { type: String, default: "" },
    email: { type: String, default: "" },
    copyright: { type: String, maxlength: 200, default: "" },
    explicit: { type: Boolean, default: false },
    status: {
      type: String,
      enum: ["draft", "published", "paused", "archived"],
      default: "draft",
    },
    coverImageUrl: { type: String, default: "" },
    coverImageUrls: {
      small: { type: String, default: "" },
      medium: { type: String, default: "" },
      large: { type: String, default: "" },
    },
    feedUrl: { type: String, default: "" },
    subscriberCount: { type: Number, default: 0, min: 0 },
    episodeCount: { type: Number, default: 0, min: 0 },
    totalPlayCount: { type: Number, default: 0, min: 0 },
    averageRating: { type: Number, default: 0, min: 0, max: 5 },
    reviewCount: { type: Number, default: 0, min: 0 },
    reviews: [PodcastReviewSchema],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

const EpisodeSchema = new Schema<IPodcastEpisode, IEpisodeModel>(
  {
    episodeId: {
      type: String,
      required: true,
      unique: true,
      default: () => uuidv4(),
      index: true,
    },
    podcastId: { type: String, required: true, index: true },
    title: { type: String, required: true, trim: true, maxlength: 300 },
    description: { type: String, maxlength: 10000, default: "" },
    audioUrl: { type: String, required: true },
    durationSeconds: { type: Number, required: true, min: 0 },
    season: { type: Number, default: null },
    episodeNumber: { type: Number, required: true },
    episodeType: {
      type: String,
      enum: ["full", "trailer", "bonus"],
      default: "full",
    },
    status: {
      type: String,
      enum: ["draft", "published", "archived"],
      default: "draft",
    },
    publicationDate: { type: Date, default: Date.now },
    playCount: { type: Number, default: 0, min: 0 },
    downloadCount: { type: Number, default: 0, min: 0 },
    likeCount: { type: Number, default: 0, min: 0 },
    transcript: { type: String, maxlength: 100000, default: "" },
    showNotes: { type: String, maxlength: 10000, default: "" },
    isAIGenerated: { type: Boolean, default: false },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

const SubscriptionSchema = new Schema<ISubscription>(
  {
    subscriptionId: {
      type: String,
      required: true,
      unique: true,
      default: () => uuidv4(),
    },
    podcastId: { type: String, required: true, index: true },
    userId: { type: String, required: true, index: true },
    isAutoDownload: { type: Boolean, default: false },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

// ---------------------------------------------------------------------------
// Indexes
// ---------------------------------------------------------------------------

PodcastSchema.index({ title: "text", description: "text", tags: "text" });
PodcastSchema.index({ category: 1, status: 1 });
PodcastSchema.index({ subscriberCount: -1 });
PodcastSchema.index({ averageRating: -1 });
PodcastSchema.index({ language: 1 });
PodcastSchema.index({ tags: 1 });

EpisodeSchema.index({ podcastId: 1, episodeNumber: -1 });
EpisodeSchema.index({ podcastId: 1, publicationDate: -1 });
EpisodeSchema.index({ podcastId: 1, season: 1, episodeNumber: 1 });
EpisodeSchema.index({ status: 1, publicationDate: -1 });

SubscriptionSchema.index({ podcastId: 1, userId: 1 }, { unique: true });
SubscriptionSchema.index({ userId: 1, createdAt: -1 });

// ---------------------------------------------------------------------------
// Instance Methods
// ---------------------------------------------------------------------------

PodcastSchema.methods.incrementSubscribers = function () {
  this.subscriberCount += 1;
  return this.save();
};

PodcastSchema.methods.decrementSubscribers = function () {
  this.subscriberCount = Math.max(0, this.subscriberCount - 1);
  return this.save();
};

PodcastSchema.methods.incrementPlays = function (count = 1) {
  this.totalPlayCount += count;
  return this.save();
};

PodcastSchema.methods.recalculateRating = function () {
  if (this.reviews.length === 0) {
    this.averageRating = 0;
    return this.save();
  }
  const total = this.reviews.reduce((sum, r) => sum + r.rating, 0);
  this.averageRating = Math.round((total / this.reviews.length) * 10) / 10;
  this.reviewCount = this.reviews.length;
  return this.save();
};

EpisodeSchema.methods.incrementPlays = function (count = 1) {
  this.playCount += count;
  return this.save();
};

EpisodeSchema.methods.incrementDownloads = function (count = 1) {
  this.downloadCount += count;
  return this.save();
};

EpisodeSchema.methods.incrementLikes = function () {
  this.likeCount += 1;
  return this.save();
};

EpisodeSchema.methods.decrementLikes = function () {
  this.likeCount = Math.max(0, this.likeCount - 1);
  return this.save();
};

// ---------------------------------------------------------------------------
// Static Methods
// ---------------------------------------------------------------------------

PodcastSchema.statics.findByPodcastId = function (podcastId: string) {
  return this.findOne({ podcastId });
};

PodcastSchema.statics.findByChannel = function (channelId: string) {
  return this.find({ channelId }).sort({ createdAt: -1 });
};

PodcastSchema.statics.findPopular = function (limit = 20) {
  return this.find({ status: "published" })
    .sort({ subscriberCount: -1 })
    .limit(limit);
};

EpisodeSchema.statics.findByEpisodeId = function (episodeId: string) {
  return this.findOne({ episodeId });
};

EpisodeSchema.statics.findByPodcastId = function (podcastId: string) {
  return this.find({ podcastId, status: { $ne: "archived" } }).sort({
    season: -1,
    episodeNumber: -1,
  });
};

EpisodeSchema.statics.findLatest = function (
  podcastId: string,
  limit = 10
) {
  return this.find({ podcastId, status: "published" })
    .sort({ publicationDate: -1 })
    .limit(limit);
};

// ---------------------------------------------------------------------------
// PodcastService Class
// ---------------------------------------------------------------------------

export class PodcastService {
  private podcastModel: IPodcastModel;
  private episodeModel: IEpisodeModel;
  private subscriptionModel: Model<ISubscription>;

  constructor() {
    this.podcastModel =
      (mongoose.models.Podcast as IPodcastModel) ||
      mongoose.model<IPodcast, IPodcastModel>("Podcast", PodcastSchema);

    this.episodeModel =
      (mongoose.models.PodcastEpisode as IEpisodeModel) ||
      mongoose.model<IPodcastEpisode, IEpisodeModel>(
        "PodcastEpisode",
        EpisodeSchema
      );

    if (!mongoose.models.Subscription) {
      this.subscriptionModel = mongoose.model<ISubscription>(
        "Subscription",
        SubscriptionSchema
      );
    } else {
      this.subscriptionModel = mongoose.model<ISubscription>("Subscription");
    }
  }

  // -- Podcast CRUD ----------------------------------------------------------

  async createPodcast(input: CreatePodcastInput): Promise<IPodcast> {
    const parsed = CreatePodcastSchema.parse(input);
    const podcast = new this.podcastModel({
      ...parsed,
      feedUrl: `https://podcast.example.com/feed/${uuidv4()}`,
    });
    return podcast.save();
  }

  async getPodcast(podcastId: string): Promise<IPodcast | null> {
    return this.podcastModel.findByPodcastId(podcastId);
  }

  async updatePodcast(
    podcastId: string,
    input: UpdatePodcastInput,
    channelId: string
  ): Promise<IPodcast | null> {
    const parsed = UpdatePodcastSchema.parse(input);
    const podcast = await this.podcastModel.findByPodcastId(podcastId);
    if (!podcast) return null;
    if (podcast.channelId !== channelId) {
      throw new Error("Unauthorized: not the podcast owner");
    }
    Object.assign(podcast, parsed);
    return podcast.save();
  }

  async deletePodcast(
    podcastId: string,
    channelId: string
  ): Promise<boolean> {
    const podcast = await this.podcastModel.findByPodcastId(podcastId);
    if (!podcast) return false;
    if (podcast.channelId !== channelId) {
      throw new Error("Unauthorized: not the podcast owner");
    }
    await this.episodeModel.deleteMany({ podcastId });
    await this.subscriptionModel.deleteMany({ podcastId });
    await this.podcastModel.deleteOne({ podcastId });
    return true;
  }

  async publishPodcast(podcastId: string): Promise<IPodcast> {
    const podcast = await this.podcastModel.findByPodcastId(podcastId);
    if (!podcast) throw new Error("Podcast not found");
    podcast.status = "published";
    return podcast.save();
  }

  async pausePodcast(podcastId: string): Promise<IPodcast> {
    const podcast = await this.podcastModel.findByPodcastId(podcastId);
    if (!podcast) throw new Error("Podcast not found");
    podcast.status = "paused";
    return podcast.save();
  }

  // -- Episode CRUD ----------------------------------------------------------

  async createEpisode(input: CreateEpisodeInput): Promise<IPodcastEpisode> {
    const parsed = CreateEpisodeSchema.parse(input);
    const episode = new this.episodeModel(parsed);
    const saved = await episode.save();

    await this.podcastModel.findOneAndUpdate(
      { podcastId: parsed.podcastId },
      { $inc: { episodeCount: 1 } }
    );

    return saved;
  }

  async getEpisode(episodeId: string): Promise<IPodcastEpisode | null> {
    return this.episodeModel.findByEpisodeId(episodeId);
  }

  async updateEpisode(
    episodeId: string,
    input: UpdateEpisodeInput,
    channelId: string
  ): Promise<IPodcastEpisode | null> {
    const parsed = UpdateEpisodeSchema.parse(input);
    const episode = await this.episodeModel.findByEpisodeId(episodeId);
    if (!episode) return null;

    const podcast = await this.podcastModel.findByPodcastId(
      parsed.podcastId ?? episode.podcastId
    );
    if (!podcast || podcast.channelId !== channelId) {
      throw new Error("Unauthorized: not the podcast owner");
    }

    Object.assign(episode, parsed);
    return episode.save();
  }

  async deleteEpisode(
    episodeId: string,
    channelId: string
  ): Promise<boolean> {
    const episode = await this.episodeModel.findByEpisodeId(episodeId);
    if (!episode) return false;

    const podcast = await this.podcastModel.findByPodcastId(
      episode.podcastId
    );
    if (!podcast || podcast.channelId !== channelId) {
      throw new Error("Unauthorized: not the podcast owner");
    }

    await this.episodeModel.deleteOne({ episodeId });
    await this.podcastModel.findOneAndUpdate(
      { podcastId: episode.podcastId },
      { $inc: { episodeCount: -1 } }
    );
    return true;
  }

  async getPodcastEpisodes(
    podcastId: string
  ): Promise<IPodcastEpisode[]> {
    return this.episodeModel.findByPodcastId(podcastId);
  }

  async getLatestEpisodes(
    podcastId: string,
    limit = 10
  ): Promise<IPodcastEpisode[]> {
    return this.episodeModel.findLatest(podcastId, limit);
  }

  async getSeasonEpisodes(
    podcastId: string,
    season: number
  ): Promise<IPodcastEpisode[]> {
    return this.episodeModel
      .find({ podcastId, season, status: "published" })
      .sort({ episodeNumber: 1 });
  }

  async listEpisodes(
    podcastId: string,
    options: {
      page?: number;
      limit?: number;
      sort?: "newest" | "oldest" | "popular";
      season?: number;
    } = {}
  ): Promise<EpisodeListResult> {
    const page = options.page ?? 1;
    const limit = options.limit ?? 20;
    const sort = options.sort ?? "newest";

    const filter: Record<string, unknown> = {
      podcastId,
      status: { $ne: "archived" },
    };
    if (options.season) filter.season = options.season;

    const sortMap: Record<string, Record<string, 1 | -1>> = {
      newest: { publicationDate: -1 },
      oldest: { publicationDate: 1 },
      popular: { playCount: -1 },
    };

    const total = await this.episodeModel.countDocuments(filter);
    const skip = (page - 1) * limit;
    const episodes = await this.episodeModel
      .find(filter)
      .sort(sortMap[sort])
      .skip(skip)
      .limit(limit);

    const totalPages = Math.ceil(total / limit);

    return {
      episodes,
      total,
      page,
      limit,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    };
  }

  // -- Subscriptions ---------------------------------------------------------

  async subscribe(input: SubscribeInput): Promise<ISubscription> {
    const parsed = SubscribeSchema.parse(input);
    const existing = await this.subscriptionModel.findOne({
      podcastId: parsed.podcastId,
      userId: parsed.userId,
    });
    if (existing) throw new Error("Already subscribed");

    const subscription = new this.subscriptionModel({
      subscriptionId: uuidv4(),
      podcastId: parsed.podcastId,
      userId: parsed.userId,
    });

    await this.podcastModel.findOneAndUpdate(
      { podcastId: parsed.podcastId },
      { $inc: { subscriberCount: 1 } }
    );

    return subscription.save();
  }

  async unsubscribe(podcastId: string, userId: string): Promise<boolean> {
    const result = await this.subscriptionModel.deleteOne({
      podcastId,
      userId,
    });
    if (result.deletedCount > 0) {
      await this.podcastModel.findOneAndUpdate(
        { podcastId },
        { $inc: { subscriberCount: -1 } }
      );
      return true;
    }
    return false;
  }

  async isSubscribed(podcastId: string, userId: string): Promise<boolean> {
    const sub = await this.subscriptionModel.findOne({ podcastId, userId });
    return !!sub;
  }

  async getUserSubscriptions(
    userId: string,
    limit = 50
  ): Promise<ISubscription[]> {
    return this.subscriptionModel
      .find({ userId })
      .sort({ createdAt: -1 })
      .limit(limit);
  }

  async getSubscriberCount(podcastId: string): Promise<number> {
    return this.subscriptionModel.countDocuments({ podcastId });
  }

  // -- Reviews ---------------------------------------------------------------

  async addReview(input: ReviewInput): Promise<IPodcast> {
    const parsed = ReviewSchema.parse(input);
    const podcast = await this.podcastModel.findByPodcastId(parsed.podcastId);
    if (!podcast) throw new Error("Podcast not found");

    const existingReview = podcast.reviews.find(
      (r) => r.userId === parsed.userId
    );
    if (existingReview) {
      throw new Error("You have already reviewed this podcast");
    }

    podcast.reviews.push({
      reviewId: uuidv4(),
      userId: parsed.userId,
      userName: parsed.userName,
      rating: parsed.rating,
      title: parsed.title ?? "",
      content: parsed.content ?? "",
      isEdited: false,
      helpfulCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await podcast.recalculateRating();
    return podcast;
  }

  async updateReview(
    podcastId: string,
    userId: string,
    rating: number,
    title?: string,
    content?: string
  ): Promise<IPodcast> {
    const podcast = await this.podcastModel.findByPodcastId(podcastId);
    if (!podcast) throw new Error("Podcast not found");

    const review = podcast.reviews.find((r) => r.userId === userId);
    if (!review) throw new Error("Review not found");

    review.rating = rating;
    if (title !== undefined) review.title = title;
    if (content !== undefined) review.content = content;
    review.isEdited = true;
    review.updatedAt = new Date();

    await podcast.recalculateRating();
    return podcast;
  }

  async deleteReview(podcastId: string, userId: string): Promise<IPodcast> {
    const podcast = await this.podcastModel.findByPodcastId(podcastId);
    if (!podcast) throw new Error("Podcast not found");

    podcast.reviews = podcast.reviews.filter((r) => r.userId !== userId);
    await podcast.recalculateRating();
    return podcast;
  }

  async markReviewHelpful(podcastId: string, reviewId: string): Promise<IPodcast> {
    const podcast = await this.podcastModel.findByPodcastId(podcastId);
    if (!podcast) throw new Error("Podcast not found");

    const review = podcast.reviews.find((r) => r.reviewId === reviewId);
    if (!review) throw new Error("Review not found");

    review.helpfulCount += 1;
    return podcast.save();
  }

  // -- Playback Analytics ----------------------------------------------------

  async recordPlay(podcastId: string): Promise<void> {
    await this.podcastModel.findOneAndUpdate(
      { podcastId },
      { $inc: { totalPlayCount: 1 } }
    );
  }

  async recordEpisodePlay(episodeId: string): Promise<void> {
    const episode = await this.episodeModel.findByEpisodeId(episodeId);
    if (episode) {
      await episode.incrementPlays();
      await this.podcastModel.findOneAndUpdate(
        { podcastId: episode.podcastId },
        { $inc: { totalPlayCount: 1 } }
      );
    }
  }

  async recordDownload(episodeId: string): Promise<void> {
    const episode = await this.episodeModel.findByEpisodeId(episodeId);
    if (episode) {
      await episode.incrementDownloads();
    }
  }

  // -- Search & Browse -------------------------------------------------------

  async listPodcasts(query: PodcastQueryInput): Promise<PodcastListResult> {
    const parsed = PodcastQuerySchema.parse(query);
    const filter: Record<string, unknown> = { status: "published" };

    if (parsed.channelId) filter.channelId = parsed.channelId;
    if (parsed.category) filter.category = parsed.category;
    if (parsed.language) filter.language = parsed.language;
    if (parsed.tags?.length) filter.tags = { $in: parsed.tags };
    if (parsed.search) filter.$text = { $search: parsed.search };

    const sortMap: Record<string, Record<string, 1 | -1>> = {
      newest: { createdAt: -1 },
      oldest: { createdAt: 1 },
      popular: { subscriberCount: -1 },
      alphabetical: { title: 1 },
    };

    const total = await this.podcastModel.countDocuments(filter);
    const skip = (parsed.page - 1) * parsed.limit;
    const podcasts = await this.podcastModel
      .find(filter)
      .sort(sortMap[parsed.sort] ?? sortMap.newest)
      .skip(skip)
      .limit(parsed.limit);

    const totalPages = Math.ceil(total / parsed.limit);

    return {
      podcasts,
      total,
      page: parsed.page,
      limit: parsed.limit,
      totalPages,
      hasNext: parsed.page < totalPages,
      hasPrev: parsed.page > 1,
    };
  }

  async getPopularPodcasts(limit = 20) {
    return this.podcastModel.findPopular(limit);
  }

  async getChannelPodcasts(channelId: string) {
    return this.podcastModel.findByChannel(channelId);
  }

  // -- Stats -----------------------------------------------------------------

  async getPodcastStats(): Promise<PodcastStats> {
    const totalPodcasts = await this.podcastModel.countDocuments();
    const published = await this.podcastModel.countDocuments({
      status: "published",
    });
    const totalEpisodes = await this.episodeModel.countDocuments();
    const totalSubscriptions = await this.subscriptionModel.countDocuments();

    const playAgg = await this.podcastModel.aggregate([
      {
        $group: {
          _id: null,
          totalPlays: { $sum: "$totalPlayCount" },
          avgRating: { $avg: "$averageRating" },
        },
      },
    ]);

    const categoryAgg = await this.podcastModel.aggregate([
      { $group: { _id: "$category", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]);

    return {
      totalPodcasts,
      published,
      totalEpisodes,
      totalSubscribers: totalSubscriptions,
      totalPlays: playAgg[0]?.totalPlays ?? 0,
      averageRating: Math.round((playAgg[0]?.avgRating ?? 0) * 10) / 10,
      topCategories: categoryAgg.map((c) => ({
        category: c._id,
        count: c.count,
      })),
    };
  }

  // -- Utilities -------------------------------------------------------------

  async countByChannel(channelId: string): Promise<number> {
    return this.podcastModel.countDocuments({ channelId });
  }

  async generateTranscript(
    episodeId: string,
    transcript: string
  ): Promise<IPodcastEpisode | null> {
    const episode = await this.episodeModel.findByEpisodeId(episodeId);
    if (!episode) return null;
    episode.transcript = transcript;
    episode.isAIGenerated = true;
    return episode.save();
  }

  async generateShowNotes(
    episodeId: string,
    showNotes: string
  ): Promise<IPodcastEpisode | null> {
    const episode = await this.episodeModel.findByEpisodeId(episodeId);
    if (!episode) return null;
    episode.showNotes = showNotes;
    return episode.save();
  }
}

export default PodcastService;
