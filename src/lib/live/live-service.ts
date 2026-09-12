import mongoose, { Schema, Document, Model } from "mongoose";
import { z } from "zod";
import { v4 as uuidv4 } from "uuid";

// ---------------------------------------------------------------------------
// Zod Schemas
// ---------------------------------------------------------------------------

export const CreateLiveStreamSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(5000).optional(),
  channelId: z.string(),
  category: z.enum([
    "gaming",
    "music",
    "talk_show",
    "education",
    "sports",
    "news",
    "creative",
    "tech",
    "other",
  ]),
  tags: z.array(z.string().max(50)).max(20).default([]),
  thumbnailUrl: z.string().url().optional(),
  isScheduled: z.boolean().default(false),
  scheduledStartAt: z.date().optional(),
  enableChat: z.boolean().default(true),
  enableDonations: z.boolean().default(true),
  isPrivate: z.boolean().default(false),
  maxViewers: z.number().int().positive().optional(),
});

export const UpdateLiveStreamSchema = CreateLiveStreamSchema.partial().extend({
  status: z
    .enum(["scheduled", "preparing", "live", "ending", "ended", "failed"])
    .optional(),
});

export const ChatMessageSchema = z.object({
  streamId: z.string(),
  authorId: z.string(),
  authorName: z.string().min(1).max(100),
  authorAvatar: z.string().url().optional(),
  content: z.string().min(1).max(500),
  isSubscriber: z.boolean().default(false),
  isModerator: z.boolean().default(false),
  isOwner: z.boolean().default(false),
});

export const DonationSchema = z.object({
  streamId: z.string(),
  donorId: z.string(),
  donorName: z.string().min(1).max(100),
  amount: z.number().positive(),
  currency: z.string().length(3).default("USD"),
  message: z.string().max(500).optional(),
  isAnonymous: z.boolean().default(false),
});

export const StreamQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
  sort: z.enum(["newest", "popular", "scheduled", "category"]).default("popular"),
  category: z.string().optional(),
  status: z
    .enum(["scheduled", "live", "ended"])
    .optional(),
  channelId: z.string().optional(),
  tags: z.array(z.string()).optional(),
});

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type CreateLiveStreamInput = z.infer<typeof CreateLiveStreamSchema>;
export type UpdateLiveStreamInput = z.infer<typeof UpdateLiveStreamSchema>;
export type ChatMessageInput = z.infer<typeof ChatMessageSchema>;
export type DonationInput = z.infer<typeof DonationSchema>;
export type StreamQueryInput = z.infer<typeof StreamQuerySchema>;

export type StreamStatus =
  | "scheduled"
  | "preparing"
  | "live"
  | "ending"
  | "ended"
  | "failed";

export interface IChatMessage {
  messageId: string;
  streamId: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  content: string;
  type: "message" | "subscriber" | "moderator" | "system" | "donation";
  isSubscriber: boolean;
  isModerator: boolean;
  isOwner: boolean;
  isDeleted: boolean;
  isPinned: boolean;
  createdAt: Date;
}

export interface IDonation {
  donationId: string;
  streamId: string;
  donorId: string;
  donorName: string;
  amount: number;
  currency: string;
  message: string;
  isAnonymous: boolean;
  isProcessed: boolean;
  createdAt: Date;
}

export interface IStreamMetrics {
  peakViewers: number;
  totalUniqueViewers: number;
  averageWatchTimeSeconds: number;
  chatMessagesCount: number;
  donationsTotal: number;
  donationsCount: number;
  likesCount: number;
  streamDurationSeconds: number;
  engagementRate: number;
}

export interface ILiveStream extends Document {
  _id: string;
  streamId: string;
  title: string;
  description: string;
  channelId: string;
  category: string;
  tags: string[];
  thumbnailUrl: string;
  status: StreamStatus;
  streamKey: string;
  ingestUrl: string;
  playbackUrl: string;
  hlsUrl: string;
  dashUrl: string;
  isScheduled: boolean;
  scheduledStartAt: Date | null;
  startedAt: Date | null;
  endedAt: Date | null;
  enableChat: boolean;
  enableDonations: boolean;
  isPrivate: boolean;
  maxViewers: number | null;
  currentViewers: number;
  peakViewers: number;
  totalUniqueViewers: number;
  chatMessages: IChatMessage[];
  donations: IDonation[];
  metrics: IStreamMetrics;
  isRecordingEnabled: boolean;
  recordingUrl: string | null;
  createdAt: Date;
  updatedAt: Date;

  incrementViewers(): Promise<ILiveStream>;
  decrementViewers(): Promise<ILiveStream>;
  addChatMessage(message: IChatMessage): Promise<ILiveStream>;
  addDonation(donation: IDonation): Promise<ILiveStream>;
  start(): Promise<ILiveStream>;
  end(): Promise<ILiveStream>;
}

export interface ILiveStreamModel extends Model<ILiveStream> {
  findByStreamId(streamId: string): Promise<ILiveStream | null>;
  findLive(limit?: number): Promise<ILiveStream[]>;
  findScheduled(limit?: number): Promise<ILiveStream[]>;
  findByChannel(channelId: string): Promise<ILiveStream[]>;
}

export interface StreamListResult {
  streams: ILiveStream[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

// ---------------------------------------------------------------------------
// Mongoose Schema
// ---------------------------------------------------------------------------

const ChatMessageMongooseSchema = new Schema<IChatMessage>(
  {
    messageId: { type: String, required: true, default: () => uuidv4() },
    streamId: { type: String, required: true },
    authorId: { type: String, required: true },
    authorName: { type: String, required: true },
    authorAvatar: { type: String, default: "" },
    content: { type: String, required: true, maxlength: 500 },
    type: {
      type: String,
      enum: ["message", "subscriber", "moderator", "system", "donation"],
      default: "message",
    },
    isSubscriber: { type: Boolean, default: false },
    isModerator: { type: Boolean, default: false },
    isOwner: { type: Boolean, default: false },
    isDeleted: { type: Boolean, default: false },
    isPinned: { type: Boolean, default: false },
  },
  { _id: false, timestamps: { createdAt: true, updatedAt: false } }
);

const DonationMongooseSchema = new Schema<IDonation>(
  {
    donationId: { type: String, required: true, default: () => uuidv4() },
    streamId: { type: String, required: true },
    donorId: { type: String, required: true },
    donorName: { type: String, required: true },
    amount: { type: Number, required: true, min: 0.01 },
    currency: { type: String, required: true, length: 3 },
    message: { type: String, maxlength: 500, default: "" },
    isAnonymous: { type: Boolean, default: false },
    isProcessed: { type: Boolean, default: false },
  },
  { _id: false, timestamps: { createdAt: true, updatedAt: false } }
);

const StreamMetricsSchema = new Schema<IStreamMetrics>(
  {
    peakViewers: { type: Number, default: 0 },
    totalUniqueViewers: { type: Number, default: 0 },
    averageWatchTimeSeconds: { type: Number, default: 0 },
    chatMessagesCount: { type: Number, default: 0 },
    donationsTotal: { type: Number, default: 0 },
    donationsCount: { type: Number, default: 0 },
    likesCount: { type: Number, default: 0 },
    streamDurationSeconds: { type: Number, default: 0 },
    engagementRate: { type: Number, default: 0 },
  },
  { _id: false }
);

const LiveStreamSchema = new Schema<ILiveStream, ILiveStreamModel>(
  {
    streamId: {
      type: String,
      required: true,
      unique: true,
      default: () => uuidv4(),
      index: true,
    },
    title: { type: String, required: true, trim: true, maxlength: 200 },
    description: { type: String, maxlength: 5000, default: "" },
    channelId: { type: String, required: true, index: true },
    category: {
      type: String,
      enum: [
        "gaming",
        "music",
        "talk_show",
        "education",
        "sports",
        "news",
        "creative",
        "tech",
        "other",
      ],
      default: "other",
    },
    tags: [{ type: String, maxlength: 50 }],
    thumbnailUrl: { type: String, default: "" },
    status: {
      type: String,
      enum: ["scheduled", "preparing", "live", "ending", "ended", "failed"],
      default: "scheduled",
      index: true,
    },
    streamKey: {
      type: String,
      required: true,
      unique: true,
      default: () => uuidv4().replace(/-/g, ""),
    },
    ingestUrl: { type: String, default: "" },
    playbackUrl: { type: String, default: "" },
    hlsUrl: { type: String, default: "" },
    dashUrl: { type: String, default: "" },
    isScheduled: { type: Boolean, default: false },
    scheduledStartAt: { type: Date, default: null },
    startedAt: { type: Date, default: null },
    endedAt: { type: Date, default: null },
    enableChat: { type: Boolean, default: true },
    enableDonations: { type: Boolean, default: true },
    isPrivate: { type: Boolean, default: false },
    maxViewers: { type: Number, default: null },
    currentViewers: { type: Number, default: 0, min: 0 },
    peakViewers: { type: Number, default: 0, min: 0 },
    totalUniqueViewers: { type: Number, default: 0, min: 0 },
    chatMessages: [ChatMessageMongooseSchema],
    donations: [DonationMongooseSchema],
    metrics: { type: StreamMetricsSchema, default: () => ({}) },
    isRecordingEnabled: { type: Boolean, default: true },
    recordingUrl: { type: String, default: null },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ---------------------------------------------------------------------------
// Indexes
// ---------------------------------------------------------------------------

LiveStreamSchema.index({ channelId: 1, status: 1 });
LiveStreamSchema.index({ category: 1, status: 1 });
LiveStreamSchema.index({ status: 1, currentViewers: -1 });
LiveStreamSchema.index({ scheduledStartAt: 1 });
LiveStreamSchema.index({ tags: 1 });
LiveStreamSchema.index({ "chatMessages.createdAt": -1 });
LiveStreamSchema.index({ "donations.amount": -1 });

// ---------------------------------------------------------------------------
// Instance Methods
// ---------------------------------------------------------------------------

LiveStreamSchema.methods.incrementViewers = function () {
  this.currentViewers += 1;
  if (this.currentViewers > this.peakViewers) {
    this.peakViewers = this.currentViewers;
  }
  return this.save();
};

LiveStreamSchema.methods.decrementViewers = function () {
  this.currentViewers = Math.max(0, this.currentViewers - 1);
  return this.save();
};

LiveStreamSchema.methods.addChatMessage = function (message: IChatMessage) {
  this.chatMessages.push(message);
  this.metrics.chatMessagesCount += 1;
  if (this.chatMessages.length > 500) {
    this.chatMessages = this.chatMessages.slice(-500);
  }
  return this.save();
};

LiveStreamSchema.methods.addDonation = function (donation: IDonation) {
  this.donations.push(donation);
  this.metrics.donationsCount += 1;
  this.metrics.donationsTotal += donation.amount;
  return this.save();
};

LiveStreamSchema.methods.start = function () {
  this.status = "live";
  this.startedAt = new Date();
  this.currentViewers = 0;
  this.peakViewers = 0;
  return this.save();
};

LiveStreamSchema.methods.end = function () {
  this.status = "ended";
  this.endedAt = new Date();
  this.currentViewers = 0;
  if (this.startedAt) {
    this.metrics.streamDurationSeconds = Math.floor(
      (this.endedAt.getTime() - this.startedAt.getTime()) / 1000
    );
  }
  return this.save();
};

// ---------------------------------------------------------------------------
// Static Methods
// ---------------------------------------------------------------------------

LiveStreamSchema.statics.findByStreamId = function (streamId: string) {
  return this.findOne({ streamId });
};

LiveStreamSchema.statics.findLive = function (limit = 50) {
  return this.find({ status: "live", isPrivate: false })
    .sort({ currentViewers: -1 })
    .limit(limit);
};

LiveStreamSchema.statics.findScheduled = function (limit = 50) {
  return this.find({
    status: "scheduled",
    isScheduled: true,
    isPrivate: false,
    scheduledStartAt: { $gte: new Date() },
  })
    .sort({ scheduledStartAt: 1 })
    .limit(limit);
};

LiveStreamSchema.statics.findByChannel = function (channelId: string) {
  return this.find({ channelId }).sort({ createdAt: -1 });
};

// ---------------------------------------------------------------------------
// LiveService Class
// ---------------------------------------------------------------------------

export class LiveService {
  private streamModel: ILiveStreamModel;
  private activeConnections: Map<string, Set<string>> = new Map();
  private readonly MAX_CHAT_HISTORY = 500;
  private readonly BANNED_WORDS = [
    "spam",
    "hack",
    "scam",
    "phishing",
  ];

  constructor() {
    this.streamModel =
      (mongoose.models.LiveStream as ILiveStreamModel) ||
      mongoose.model<ILiveStream, ILiveStreamModel>(
        "LiveStream",
        LiveStreamSchema
      );
  }

  // -- CRUD ------------------------------------------------------------------

  async createStream(input: CreateLiveStreamInput): Promise<ILiveStream> {
    const parsed = CreateLiveStreamSchema.parse(input);
    const stream = new this.streamModel({
      ...parsed,
      ingestUrl: `rtmp://live.example.com/live/${uuidv4()}`,
      playbackUrl: `https://stream.example.com/live/${uuidv4()}.m3u8`,
      hlsUrl: `https://stream.example.com/live/${uuidv4()}/playlist.m3u8`,
      dashUrl: `https://stream.example.com/live/${uuidv4()}/manifest.mpd`,
    });
    return stream.save();
  }

  async getStream(streamId: string): Promise<ILiveStream | null> {
    return this.streamModel.findByStreamId(streamId);
  }

  async updateStream(
    streamId: string,
    input: UpdateLiveStreamInput,
    channelId: string
  ): Promise<ILiveStream | null> {
    const parsed = UpdateLiveStreamSchema.parse(input);
    const stream = await this.streamModel.findByStreamId(streamId);
    if (!stream) return null;
    if (stream.channelId !== channelId) {
      throw new Error("Unauthorized: not the stream owner");
    }
    Object.assign(stream, parsed);
    return stream.save();
  }

  async deleteStream(
    streamId: string,
    channelId: string
  ): Promise<boolean> {
    const stream = await this.streamModel.findByStreamId(streamId);
    if (!stream) return false;
    if (stream.channelId !== channelId) {
      throw new Error("Unauthorized: not the stream owner");
    }
    if (stream.status === "live") {
      throw new Error("Cannot delete a live stream");
    }
    await this.streamModel.deleteOne({ streamId });
    return true;
  }

  // -- Lifecycle -------------------------------------------------------------

  async startStream(streamId: string): Promise<ILiveStream> {
    const stream = await this.streamModel.findByStreamId(streamId);
    if (!stream) throw new Error("Stream not found");
    if (stream.status !== "scheduled" && stream.status !== "preparing") {
      throw new Error("Stream cannot be started from current status");
    }
    await stream.start();
    this.activeConnections.set(streamId, new Set());
    return stream;
  }

  async endStream(streamId: string, channelId: string): Promise<ILiveStream> {
    const stream = await this.streamModel.findByStreamId(streamId);
    if (!stream) throw new Error("Stream not found");
    if (stream.channelId !== channelId) {
      throw new Error("Unauthorized: not the stream owner");
    }
    if (stream.status !== "live") {
      throw new Error("Stream is not live");
    }
    await stream.end();
    this.activeConnections.delete(streamId);

    const chatSystemMessage: IChatMessage = {
      messageId: uuidv4(),
      streamId,
      authorId: "system",
      authorName: "System",
      authorAvatar: "",
      content: "Stream has ended. Thanks for watching!",
      type: "system",
      isSubscriber: false,
      isModerator: false,
      isOwner: false,
      isDeleted: false,
      isPinned: false,
      createdAt: new Date(),
    };
    await stream.addChatMessage(chatSystemMessage);

    return stream;
  }

  async prepareStream(streamId: string): Promise<ILiveStream> {
    const stream = await this.streamModel.findByStreamId(streamId);
    if (!stream) throw new Error("Stream not found");
    stream.status = "preparing";
    return stream.save();
  }

  async getUpcomingStreams(limit = 20): Promise<ILiveStream[]> {
    return this.streamModel.findScheduled(limit);
  }

  async getLiveStreams(limit = 50): Promise<ILiveStream[]> {
    return this.streamModel.findLive(limit);
  }

  // -- Chat ------------------------------------------------------------------

  async sendChatMessage(
    input: ChatMessageInput
  ): Promise<IChatMessage | null> {
    const parsed = ChatMessageSchema.parse(input);
    const stream = await this.streamModel.findByStreamId(parsed.streamId);
    if (!stream) return null;
    if (!stream.enableChat) throw new Error("Chat is disabled for this stream");
    if (stream.status !== "live") throw new Error("Stream is not live");

    const filteredContent = this.filterChatContent(parsed.content);
    if (!filteredContent) return null;

    const message: IChatMessage = {
      messageId: uuidv4(),
      streamId: parsed.streamId,
      authorId: parsed.authorId,
      authorName: parsed.authorName,
      authorAvatar: parsed.authorAvatar ?? "",
      content: filteredContent,
      type: parsed.isOwner
        ? "moderator"
        : parsed.isModerator
          ? "moderator"
          : parsed.isSubscriber
            ? "subscriber"
            : "message",
      isSubscriber: parsed.isSubscriber,
      isModerator: parsed.isModerator,
      isOwner: parsed.isOwner,
      isDeleted: false,
      isPinned: false,
      createdAt: new Date(),
    };

    await stream.addChatMessage(message);
    return message;
  }

  async getChatMessages(
    streamId: string,
    limit = 100,
    before?: Date
  ): Promise<IChatMessage[]> {
    const stream = await this.streamModel.findByStreamId(streamId);
    if (!stream) return [];

    let messages = stream.chatMessages.filter((m) => !m.isDeleted);
    if (before) {
      messages = messages.filter(
        (m) => m.createdAt < before
      );
    }
    return messages.slice(-limit);
  }

  async deleteChatMessage(
    streamId: string,
    messageId: string,
    moderatorId: string
  ): Promise<boolean> {
    const stream = await this.streamModel.findByStreamId(streamId);
    if (!stream) return false;

    const message = stream.chatMessages.find(
      (m) => m.messageId === messageId
    );
    if (!message) return false;

    message.isDeleted = true;
    message.content = "[message deleted]";
    await stream.save();
    return true;
  }

  async pinChatMessage(
    streamId: string,
    messageId: string
  ): Promise<boolean> {
    const stream = await this.streamModel.findByStreamId(streamId);
    if (!stream) return false;

    stream.chatMessages.forEach((m) => {
      m.isPinned = m.messageId === messageId;
    });
    await stream.save();
    return true;
  }

  async sendSystemMessage(
    streamId: string,
    content: string
  ): Promise<IChatMessage | null> {
    const stream = await this.streamModel.findByStreamId(streamId);
    if (!stream) return null;

    const message: IChatMessage = {
      messageId: uuidv4(),
      streamId,
      authorId: "system",
      authorName: "System",
      authorAvatar: "",
      content,
      type: "system",
      isSubscriber: false,
      isModerator: false,
      isOwner: false,
      isDeleted: false,
      isPinned: false,
      createdAt: new Date(),
    };

    await stream.addChatMessage(message);
    return message;
  }

  private filterChatContent(content: string): string | null {
    let filtered = content.trim();
    if (filtered.length === 0) return null;

    for (const word of this.BANNED_WORDS) {
      const regex = new RegExp(`\\b${word}\\b`, "gi");
      filtered = filtered.replace(regex, "*".repeat(word.length));
    }

    if (filtered.length > 500) {
      filtered = filtered.substring(0, 500);
    }

    return filtered;
  }

  // -- Donations -------------------------------------------------------------

  async processDonation(input: DonationInput): Promise<IDonation | null> {
    const parsed = DonationSchema.parse(input);
    const stream = await this.streamModel.findByStreamId(parsed.streamId);
    if (!stream) return null;
    if (!stream.enableDonations) throw new Error("Donations are disabled");
    if (stream.status !== "live") throw new Error("Stream is not live");

    const donation: IDonation = {
      donationId: uuidv4(),
      streamId: parsed.streamId,
      donorId: parsed.donorId,
      donorName: parsed.isAnonymous ? "Anonymous" : parsed.donorName,
      amount: parsed.amount,
      currency: parsed.currency,
      message: parsed.message ?? "",
      isAnonymous: parsed.isAnonymous,
      isProcessed: false,
      createdAt: new Date(),
    };

    await stream.addDonation(donation);

    if (stream.enableChat) {
      const donorMsg: IChatMessage = {
        messageId: uuidv4(),
        streamId: parsed.streamId,
        authorId: parsed.donorId,
        authorName: parsed.isAnonymous ? "Anonymous" : parsed.donorName,
        authorAvatar: "",
        content: `donated $${parsed.amount.toFixed(2)}${parsed.message ? `: ${parsed.message}` : ""}`,
        type: "donation",
        isSubscriber: false,
        isModerator: false,
        isOwner: false,
        isDeleted: false,
        isPinned: false,
        createdAt: new Date(),
      };
      await stream.addChatMessage(donorMsg);
    }

    return donation;
  }

  async getDonations(
    streamId: string,
    limit = 50,
    minAmount?: number
  ): Promise<IDonation[]> {
    const stream = await this.streamModel.findByStreamId(streamId);
    if (!stream) return [];

    let donations = stream.donations;
    if (minAmount) {
      donations = donations.filter((d) => d.amount >= minAmount);
    }
    return donations.slice(-limit);
  }

  async getTotalDonations(streamId: string): Promise<number> {
    const stream = await this.streamModel.findByStreamId(streamId);
    if (!stream) return 0;
    return stream.metrics.donationsTotal;
  }

  async markDonationProcessed(
    streamId: string,
    donationId: string
  ): Promise<boolean> {
    const stream = await this.streamModel.findByStreamId(streamId);
    if (!stream) return false;

    const donation = stream.donations.find(
      (d) => d.donationId === donationId
    );
    if (!donation) return false;

    donation.isProcessed = true;
    await stream.save();
    return true;
  }

  async getTopDonors(
    streamId: string,
    limit = 10
  ): Promise<Array<{ donorId: string; donorName: string; total: number; count: number }>> {
    const stream = await this.streamModel.findByStreamId(streamId);
    if (!stream) return [];

    const donorMap = new Map<
      string,
      { donorName: string; total: number; count: number }
    >();

    for (const d of stream.donations) {
      const existing = donorMap.get(d.donorId);
      if (existing) {
        existing.total += d.amount;
        existing.count += 1;
      } else {
        donorMap.set(d.donorId, {
          donorName: d.donorName,
          total: d.amount,
          count: 1,
        });
      }
    }

    return Array.from(donorMap.entries())
      .map(([donorId, data]) => ({ donorId, ...data }))
      .sort((a, b) => b.total - a.total)
      .slice(0, limit);
  }

  // -- Viewers & Connections -------------------------------------------------

  async addViewer(streamId: string, viewerId: string): Promise<number> {
    const stream = await this.streamModel.findByStreamId(streamId);
    if (!stream) return 0;

    let connections = this.activeConnections.get(streamId);
    if (!connections) {
      connections = new Set();
      this.activeConnections.set(streamId, connections);
    }
    connections.add(viewerId);

    await stream.incrementViewers();
    return stream.currentViewers;
  }

  async removeViewer(streamId: string, viewerId: string): Promise<number> {
    const stream = await this.streamModel.findByStreamId(streamId);
    if (!stream) return 0;

    const connections = this.activeConnections.get(streamId);
    if (connections) {
      connections.delete(viewerId);
    }

    await stream.decrementViewers();
    return stream.currentViewers;
  }

  async getViewerCount(streamId: string): Promise<number> {
    const connections = this.activeConnections.get(streamId);
    return connections?.size ?? 0;
  }

  // -- Search & Browse -------------------------------------------------------

  async listStreams(query: StreamQueryInput): Promise<StreamListResult> {
    const parsed = StreamQuerySchema.parse(query);
    const filter: Record<string, unknown> = { isPrivate: false };

    if (parsed.channelId) filter.channelId = parsed.channelId;
    if (parsed.category) filter.category = parsed.category;
    if (parsed.status) {
      filter.status = parsed.status;
    } else {
      filter.status = { $in: ["live", "scheduled"] };
    }
    if (parsed.tags?.length) filter.tags = { $in: parsed.tags };

    const sortMap: Record<string, Record<string, 1 | -1>> = {
      newest: { createdAt: -1 },
      popular: { currentViewers: -1 },
      scheduled: { scheduledStartAt: 1 },
      category: { category: 1, currentViewers: -1 },
    };

    const total = await this.streamModel.countDocuments(filter);
    const skip = (parsed.page - 1) * parsed.limit;
    const streams = await this.streamModel
      .find(filter)
      .sort(sortMap[parsed.sort] ?? sortMap.popular)
      .skip(skip)
      .limit(parsed.limit);

    const totalPages = Math.ceil(total / parsed.limit);

    return {
      streams,
      total,
      page: parsed.page,
      limit: parsed.limit,
      totalPages,
      hasNext: parsed.page < totalPages,
      hasPrev: parsed.page > 1,
    };
  }

  async getChannelStreams(channelId: string) {
    return this.streamModel.findByChannel(channelId);
  }

  // -- Metrics & Analytics ---------------------------------------------------

  async getStreamMetrics(streamId: string): Promise<IStreamMetrics | null> {
    const stream = await this.streamModel.findByStreamId(streamId);
    if (!stream) return null;
    return stream.metrics;
  }

  async recordLike(streamId: string): Promise<void> {
    const stream = await this.streamModel.findByStreamId(streamId);
    if (stream) {
      stream.metrics.likesCount += 1;
      await stream.save();
    }
  }

  async getChannelLiveStats(channelId: string) {
    const streams = await this.streamModel.find({ channelId });
    const totalStreams = streams.length;
    const liveStreams = streams.filter((s) => s.status === "live").length;
    const totalViewers = streams.reduce(
      (sum, s) => sum + s.peakViewers,
      0
    );
    const totalDonations = streams.reduce(
      (sum, s) => sum + s.metrics.donationsTotal,
      0
    );
    const totalChatMessages = streams.reduce(
      (sum, s) => sum + s.metrics.chatMessagesCount,
      0
    );

    return {
      totalStreams,
      liveStreams,
      totalPeakViewers: totalViewers,
      totalDonations,
      totalChatMessages,
      averageViewersPerStream:
        totalStreams > 0 ? Math.round(totalViewers / totalStreams) : 0,
    };
  }

  // -- Recording -------------------------------------------------------------

  async enableRecording(streamId: string): Promise<ILiveStream | null> {
    const stream = await this.streamModel.findByStreamId(streamId);
    if (!stream) return null;
    stream.isRecordingEnabled = true;
    return stream.save();
  }

  async setRecordingUrl(
    streamId: string,
    url: string
  ): Promise<ILiveStream | null> {
    const stream = await this.streamModel.findByStreamId(streamId);
    if (!stream) return null;
    stream.recordingUrl = url;
    return stream.save();
  }

  // -- Utilities -------------------------------------------------------------

  async countByChannel(channelId: string): Promise<number> {
    return this.streamModel.countDocuments({ channelId });
  }

  async countByStatus(status: StreamStatus): Promise<number> {
    return this.streamModel.countDocuments({ status });
  }

  async getRecentStreams(limit = 10): Promise<ILiveStream[]> {
    return this.streamModel
      .find({ status: "ended" })
      .sort({ endedAt: -1 })
      .limit(limit);
  }
}

export default LiveService;
