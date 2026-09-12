import mongoose, { Schema, Document, Model } from "mongoose";
import { z } from "zod";
import { v4 as uuidv4 } from "uuid";

// ---------------------------------------------------------------------------
// Zod Schemas
// ---------------------------------------------------------------------------

export const CreateCommentSchema = z.object({
  videoId: z.string(),
  parentId: z.string().uuid().optional(),
  content: z.string().min(1).max(2000),
  authorId: z.string(),
  authorName: z.string().min(1).max(100),
  authorAvatar: z.string().url().optional(),
});

export const UpdateCommentSchema = z.object({
  content: z.string().min(1).max(2000),
});

export const CommentQuerySchema = z.object({
  videoId: z.string(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  sort: z.enum(["newest", "oldest", "popular", "controversial"]).default("popular"),
  parentId: z.string().uuid().optional(),
});

export const ModerateCommentSchema = z.object({
  action: z.enum(["approve", "reject", "flag", "spam", "hide"]),
  reason: z.string().max(500).optional(),
  moderatorId: z.string(),
});

export const ReportCommentSchema = z.object({
  reason: z.enum([
    "spam",
    "harassment",
    "hate_speech",
    "violence",
    "sexual_content",
    "misinformation",
    "copyright",
    "other",
  ]),
  details: z.string().max(1000).optional(),
  reporterId: z.string(),
});

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type CreateCommentInput = z.infer<typeof CreateCommentSchema>;
export type UpdateCommentInput = z.infer<typeof UpdateCommentSchema>;
export type CommentQueryInput = z.infer<typeof CommentQuerySchema>;
export type ModerateCommentInput = z.infer<typeof ModerateCommentSchema>;
export type ReportCommentInput = z.infer<typeof ReportCommentSchema>;

export type CommentStatus = "visible" | "hidden" | "flagged" | "deleted" | "spam";
export type ModerationAction = "approve" | "reject" | "flag" | "spam" | "hide";

export interface IComment extends Document {
  _id: string;
  commentId: string;
  videoId: string;
  parentId: string | null;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  content: string;
  status: CommentStatus;
  likeCount: number;
  dislikeCount: number;
  replyCount: number;
  isEdited: boolean;
  isPinned: boolean;
  isHearted: boolean;
  moderationStatus: "pending" | "approved" | "rejected" | "auto_approved";
  moderationReason: string | null;
  moderatedBy: string | null;
  moderatedAt: Date | null;
  reports: ICommentReport[];
  createdAt: Date;
  updatedAt: Date;

  incrementLikes(): Promise<IComment>;
  decrementLikes(): Promise<IComment>;
  incrementReplies(): Promise<IComment>;
  decrementReplies(): Promise<IComment>;
  pin(): Promise<IComment>;
  unpin(): Promise<IComment>;
  heart(): Promise<IComment>;
  unheart(): Promise<IComment>;
  hide(): Promise<IComment>;
  restore(): Promise<IComment>;
}

export interface ICommentReport {
  reportId: string;
  reporterId: string;
  reason: string;
  details: string;
  createdAt: Date;
}

export interface ICommentModel extends Model<IComment> {
  findByCommentId(commentId: string): Promise<IComment | null>;
  findByVideoId(videoId: string, options?: CommentQueryInput): Promise<IComment[]>;
  findRootComments(videoId: string, limit?: number): Promise<IComment[]>;
  findReplies(parentId: string, limit?: number): Promise<IComment[]>;
  countByVideo(videoId: string): Promise<number>;
}

export interface CommentListResult {
  comments: IComment[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface CommentStats {
  total: number;
  visible: number;
  hidden: number;
  flagged: number;
  spam: number;
  deleted: number;
  averageLength: number;
  topCommenters: Array<{ authorId: string; authorName: string; count: number }>;
}

// ---------------------------------------------------------------------------
// Mongoose Schema
// ---------------------------------------------------------------------------

const CommentReportSchema = new Schema<ICommentReport>(
  {
    reportId: { type: String, required: true, default: () => uuidv4() },
    reporterId: { type: String, required: true },
    reason: { type: String, required: true },
    details: { type: String, default: "" },
  },
  { _id: false, timestamps: { createdAt: true, updatedAt: false } }
);

const CommentSchema = new Schema<IComment, ICommentModel>(
  {
    commentId: {
      type: String,
      required: true,
      unique: true,
      default: () => uuidv4(),
      index: true,
    },
    videoId: { type: String, required: true, index: true },
    parentId: { type: String, default: null, index: true },
    authorId: { type: String, required: true, index: true },
    authorName: { type: String, required: true },
    authorAvatar: { type: String, default: "" },
    content: { type: String, required: true, maxlength: 2000 },
    status: {
      type: String,
      enum: ["visible", "hidden", "flagged", "deleted", "spam"],
      default: "visible",
    },
    likeCount: { type: Number, default: 0, min: 0 },
    dislikeCount: { type: Number, default: 0, min: 0 },
    replyCount: { type: Number, default: 0, min: 0 },
    isEdited: { type: Boolean, default: false },
    isPinned: { type: Boolean, default: false },
    isHearted: { type: Boolean, default: false },
    moderationStatus: {
      type: String,
      enum: ["pending", "approved", "rejected", "auto_approved"],
      default: "auto_approved",
    },
    moderationReason: { type: String, default: null },
    moderatedBy: { type: String, default: null },
    moderatedAt: { type: Date, default: null },
    reports: [CommentReportSchema],
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

CommentSchema.index({ videoId: 1, createdAt: -1 });
CommentSchema.index({ videoId: 1, parentId: 1, createdAt: -1 });
CommentSchema.index({ videoId: 1, status: 1 });
CommentSchema.index({ videoId: 1, likeCount: -1 });
CommentSchema.index({ authorId: 1, createdAt: -1 });
CommentSchema.index({ moderationStatus: 1, createdAt: 1 });
CommentSchema.index({ status: 1, moderatedAt: 1 });
CommentSchema.index({ reports: 1 });

// ---------------------------------------------------------------------------
// Instance Methods
// ---------------------------------------------------------------------------

CommentSchema.methods.incrementLikes = function () {
  this.likeCount += 1;
  return this.save();
};

CommentSchema.methods.decrementLikes = function () {
  this.likeCount = Math.max(0, this.likeCount - 1);
  return this.save();
};

CommentSchema.methods.incrementReplies = function () {
  this.replyCount += 1;
  return this.save();
};

CommentSchema.methods.decrementReplies = function () {
  this.replyCount = Math.max(0, this.replyCount - 1);
  return this.save();
};

CommentSchema.methods.pin = function () {
  this.isPinned = true;
  return this.save();
};

CommentSchema.methods.unpin = function () {
  this.isPinned = false;
  return this.save();
};

CommentSchema.methods.heart = function () {
  this.isHearted = true;
  return this.save();
};

CommentSchema.methods.unheart = function () {
  this.isHearted = false;
  return this.save();
};

CommentSchema.methods.hide = function () {
  this.status = "hidden";
  return this.save();
};

CommentSchema.methods.restore = function () {
  this.status = "visible";
  return this.save();
};

// ---------------------------------------------------------------------------
// Static Methods
// ---------------------------------------------------------------------------

CommentSchema.statics.findByCommentId = function (commentId: string) {
  return this.findOne({ commentId });
};

CommentSchema.statics.findByVideoId = function (
  videoId: string,
  options?: CommentQueryInput
) {
  const query: Record<string, unknown> = {
    videoId,
    status: { $in: ["visible", "hidden"] },
  };
  if (options?.parentId) {
    query.parentId = options.parentId;
  } else {
    query.parentId = null;
  }

  const sortMap: Record<string, Record<string, 1 | -1>> = {
    newest: { createdAt: -1 },
    oldest: { createdAt: 1 },
    popular: { likeCount: -1 },
    controversial: { dislikeCount: -1 },
  };

  const sort = options?.sort ? sortMap[options.sort] : sortMap.popular;
  const limit = options?.limit ?? 20;

  return this.find(query).sort(sort).limit(limit);
};

CommentSchema.statics.findRootComments = function (
  videoId: string,
  limit = 20
) {
  return this.find({
    videoId,
    parentId: null,
    status: { $in: ["visible", "hidden"] },
  })
    .sort({ isPinned: -1, likeCount: -1 })
    .limit(limit);
};

CommentSchema.statics.findReplies = function (
  parentId: string,
  limit = 10
) {
  return this.find({
    parentId,
    status: { $in: ["visible", "hidden"] },
  })
    .sort({ createdAt: 1 })
    .limit(limit);
};

CommentSchema.statics.countByVideo = function (videoId: string) {
  return this.countDocuments({
    videoId,
    status: { $ne: "deleted" },
  });
};

// ---------------------------------------------------------------------------
// CommentService Class
// ---------------------------------------------------------------------------

export class CommentService {
  private commentModel: ICommentModel;
  private spamPatterns: RegExp[] = [
    /\b(buy|sell|discount|cheap|free money|click here|visit|subscribe now)\b/i,
    /(https?:\/\/[^\s]+){2,}/i,
    /(.{1,5})\1{4,}/i,
    /\b(earn|income|profit|crypto|bitcoin|investment opportunity)\b/i,
  ];

  constructor() {
    this.commentModel =
      (mongoose.models.Comment as ICommentModel) ||
      mongoose.model<IComment, ICommentModel>("Comment", CommentSchema);
  }

  // -- CRUD ------------------------------------------------------------------

  async createComment(input: CreateCommentInput): Promise<IComment> {
    const parsed = CreateCommentSchema.parse(input);

    const moderationStatus = this.checkSpam(parsed.content)
      ? "rejected"
      : "auto_approved";

    const status: CommentStatus =
      moderationStatus === "rejected" ? "spam" : "visible";

    let parentComment: IComment | null = null;
    if (parsed.parentId) {
      parentComment = await this.commentModel.findOne({
        commentId: parsed.parentId,
      });
      if (!parentComment) throw new Error("Parent comment not found");
      if (parentComment.videoId !== parsed.videoId) {
        throw new Error("Parent comment belongs to a different video");
      }
    }

    const comment = new this.commentModel({
      ...parsed,
      moderationStatus,
      status,
    });

    const saved = await comment.save();

    if (parentComment) {
      await parentComment.incrementReplies();
    }

    return saved;
  }

  async getComment(commentId: string): Promise<IComment | null> {
    return this.commentModel.findByCommentId(commentId);
  }

  async updateComment(
    commentId: string,
    input: UpdateCommentInput,
    authorId: string
  ): Promise<IComment | null> {
    const parsed = UpdateCommentSchema.parse(input);
    const comment = await this.commentModel.findByCommentId(commentId);
    if (!comment) return null;
    if (comment.authorId !== authorId) {
      throw new Error("Unauthorized: not the comment author");
    }
    comment.content = parsed.content;
    comment.isEdited = true;
    return comment.save();
  }

  async deleteComment(
    commentId: string,
    requesterId: string,
    isAdmin = false
  ): Promise<boolean> {
    const comment = await this.commentModel.findByCommentId(commentId);
    if (!comment) return false;
    if (comment.authorId !== requesterId && !isAdmin) {
      throw new Error("Unauthorized: not the comment author");
    }

    if (comment.replyCount > 0) {
      comment.status = "deleted";
      comment.content = "[deleted]";
      await comment.save();
    } else {
      await this.commentModel.deleteOne({ commentId });
      if (comment.parentId) {
        const parent = await this.commentModel.findByCommentId(comment.parentId);
        if (parent) await parent.decrementReplies();
      }
    }
    return true;
  }

  // -- Listing & Querying ----------------------------------------------------

  async listComments(query: CommentQueryInput): Promise<CommentListResult> {
    const parsed = CommentQuerySchema.parse(query);

    const filter: Record<string, unknown> = {
      videoId: parsed.videoId,
      status: { $in: ["visible", "hidden"] },
    };
    if (parsed.parentId) {
      filter.parentId = parsed.parentId;
    } else {
      filter.parentId = null;
    }

    const sortMap: Record<string, Record<string, 1 | -1>> = {
      newest: { createdAt: -1 },
      oldest: { createdAt: 1 },
      popular: { likeCount: -1 },
      controversial: { dislikeCount: -1 },
    };

    const total = await this.commentModel.countDocuments(filter);
    const skip = (parsed.page - 1) * parsed.limit;
    const comments = await this.commentModel
      .find(filter)
      .sort(sortMap[parsed.sort])
      .skip(skip)
      .limit(parsed.limit);

    const totalPages = Math.ceil(total / parsed.limit);

    return {
      comments,
      total,
      page: parsed.page,
      limit: parsed.limit,
      totalPages,
      hasNext: parsed.page < totalPages,
      hasPrev: parsed.page > 1,
    };
  }

  async getRootComments(videoId: string, limit = 20) {
    return this.commentModel.findRootComments(videoId, limit);
  }

  async getReplies(commentId: string, limit = 10) {
    return this.commentModel.findReplies(commentId, limit);
  }

  async getCommentThread(videoId: string, commentId: string) {
    const root = await this.commentModel.findByCommentId(commentId);
    if (!root || root.videoId !== videoId) return null;
    const replies = await this.getReplies(commentId, 100);
    return { root, replies };
  }

  // -- Reactions -------------------------------------------------------------

  async likeComment(commentId: string): Promise<IComment | null> {
    const comment = await this.commentModel.findByCommentId(commentId);
    if (!comment) return null;
    await comment.incrementLikes();
    return comment;
  }

  async unlikeComment(commentId: string): Promise<IComment | null> {
    const comment = await this.commentModel.findByCommentId(commentId);
    if (!comment) return null;
    await comment.decrementLikes();
    return comment;
  }

  async dislikeComment(commentId: string): Promise<IComment | null> {
    const comment = await this.commentModel.findByCommentId(commentId);
    if (!comment) return null;
    comment.dislikeCount += 1;
    return comment.save();
  }

  // -- Pinning & Hearting ----------------------------------------------------

  async pinComment(commentId: string): Promise<IComment | null> {
    const comment = await this.commentModel.findByCommentId(commentId);
    if (!comment) return null;
    await comment.pin();
    return comment;
  }

  async unpinComment(commentId: string): Promise<IComment | null> {
    const comment = await this.commentModel.findByCommentId(commentId);
    if (!comment) return null;
    await comment.unpin();
    return comment;
  }

  async heartComment(commentId: string): Promise<IComment | null> {
    const comment = await this.commentModel.findByCommentId(commentId);
    if (!comment) return null;
    await comment.heart();
    return comment;
  }

  async unheartComment(commentId: string): Promise<IComment | null> {
    const comment = await this.commentModel.findByCommentId(commentId);
    if (!comment) return null;
    await comment.unheart();
    return comment;
  }

  // -- Moderation ------------------------------------------------------------

  async moderateComment(
    commentId: string,
    input: ModerateCommentInput
  ): Promise<IComment | null> {
    const parsed = ModerateCommentSchema.parse(input);
    const comment = await this.commentModel.findByCommentId(commentId);
    if (!comment) return null;

    const statusMap: Record<ModerationAction, CommentStatus> = {
      approve: "visible",
      reject: "deleted",
      flag: "flagged",
      spam: "spam",
      hide: "hidden",
    };

    comment.status = statusMap[parsed.action];
    comment.moderationStatus = parsed.action === "approve" ? "approved" : "rejected";
    comment.moderationReason = parsed.reason ?? null;
    comment.moderatedBy = parsed.moderatorId;
    comment.moderatedAt = new Date();

    return comment.save();
  }

  async reportComment(
    commentId: string,
    input: ReportCommentInput
  ): Promise<IComment | null> {
    const parsed = ReportCommentSchema.parse(input);
    const comment = await this.commentModel.findByCommentId(commentId);
    if (!comment) return null;

    const existingReport = comment.reports.find(
      (r) => r.reporterId === parsed.reporterId
    );
    if (existingReport) {
      throw new Error("You have already reported this comment");
    }

    comment.reports.push({
      reportId: uuidv4(),
      reporterId: parsed.reporterId,
      reason: parsed.reason,
      details: parsed.details ?? "",
      createdAt: new Date(),
    });

    if (comment.reports.length >= 3 && comment.status === "visible") {
      comment.status = "flagged";
      comment.moderationStatus = "pending";
    }

    return comment.save();
  }

  async getReportedComments(limit = 50): Promise<IComment[]> {
    return this.commentModel
      .find({ "reports.0": { $exists: true }, status: { $ne: "deleted" } })
      .sort({ "reports.length": -1 })
      .limit(limit);
  }

  async getPendingModeration(limit = 50): Promise<IComment[]> {
    return this.commentModel
      .find({ moderationStatus: "pending" })
      .sort({ createdAt: 1 })
      .limit(limit);
  }

  // -- Stats -----------------------------------------------------------------

  async getVideoCommentStats(videoId: string): Promise<CommentStats> {
    const stats = await this.commentModel.aggregate([
      { $match: { videoId } },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
          totalLength: { $sum: { $strLenCP: "$content" } },
        },
      },
    ]);

    const topCommenters = await this.commentModel.aggregate([
      { $match: { videoId, status: { $ne: "deleted" } } },
      {
        $group: {
          _id: "$authorId",
          authorName: { $first: "$authorName" },
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]);

    const statusMap: Record<string, number> = {};
    let totalLength = 0;
    let total = 0;

    for (const s of stats) {
      statusMap[s._id] = s.count;
      totalLength += s.totalLength;
      total += s.count;
    }

    return {
      total,
      visible: statusMap.visible ?? 0,
      hidden: statusMap.hidden ?? 0,
      flagged: statusMap.flagged ?? 0,
      spam: statusMap.spam ?? 0,
      deleted: statusMap.deleted ?? 0,
      averageLength: total > 0 ? Math.round(totalLength / total) : 0,
      topCommenters: topCommenters.map((c) => ({
        authorId: c._id,
        authorName: c.authorName,
        count: c.count,
      })),
    };
  }

  async countByVideo(videoId: string): Promise<number> {
    return this.commentModel.countByVideo(videoId);
  }

  // -- Spam Detection --------------------------------------------------------

  private checkSpam(content: string): boolean {
    for (const pattern of this.spamPatterns) {
      if (pattern.test(content)) return true;
    }
    const repeatedChars = /(.)\1{10,}/;
    if (repeatedChars.test(content)) return true;
    if (content.length > 0) {
      const capsRatio =
        (content.replace(/[^A-Z]/g, "").length /
          content.replace(/[^a-zA-Z]/g, "").length) || 0;
      if (capsRatio > 0.8 && content.length > 20) return true;
    }
    return false;
  }

  // -- Bulk Operations -------------------------------------------------------

  async bulkDeleteByVideo(videoId: string): Promise<number> {
    const result = await this.commentModel.deleteMany({ videoId });
    return result.deletedCount;
  }

  async bulkDeleteByAuthor(authorId: string): Promise<number> {
    const result = await this.commentModel.deleteMany({ authorId });
    return result.deletedCount;
  }

  async bulkModerate(
    commentIds: string[],
    action: ModerationAction,
    moderatorId: string
  ): Promise<number> {
    let count = 0;
    for (const id of commentIds) {
      try {
        await this.moderateComment(id, {
          action,
          moderatorId,
        });
        count++;
      } catch {
        continue;
      }
    }
    return count;
  }

  async hideAllByVideo(videoId: string): Promise<number> {
    const result = await this.commentModel.updateMany(
      { videoId, status: "visible" },
      { status: "hidden" }
    );
    return result.modifiedCount;
  }

  async restoreAllByVideo(videoId: string): Promise<number> {
    const result = await this.commentModel.updateMany(
      { videoId, status: "hidden" },
      { status: "visible" }
    );
    return result.modifiedCount;
  }
}

export default CommentService;
