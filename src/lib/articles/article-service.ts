import mongoose, { Schema, Document, Model } from "mongoose";
import { z } from "zod";
import { v4 as uuidv4 } from "uuid";

// ---------------------------------------------------------------------------
// Zod Schemas
// ---------------------------------------------------------------------------

export const CreateArticleSchema = z.object({
  title: z.string().min(1).max(500),
  content: z.string().min(1).max(100000),
  summary: z.string().max(1000).optional(),
  channelId: z.string(),
  tags: z.array(z.string().max(50)).max(30).default([]),
  category: z.enum([
    "news",
    "tutorial",
    "opinion",
    "review",
    "analysis",
    "interview",
    "case_study",
    "how_to",
    "listicle",
    "other",
  ]),
  visibility: z.enum(["public", "unlisted", "private"]).default("public"),
  coverImageUrl: z.string().url().optional(),
  allowComments: z.boolean().default(true),
  allowReactions: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
  authorName: z.string().min(1).max(100),
  authorAvatar: z.string().url().optional(),
  readingTimeMinutes: z.number().int().positive().optional(),
});

export const UpdateArticleSchema = CreateArticleSchema.partial().extend({
  status: z.enum(["draft", "published", "archived"]).optional(),
});

export const ArticleQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
  sort: z
    .enum(["newest", "oldest", "popular", "trending", "reading_time"])
    .default("newest"),
  category: z.string().optional(),
  tags: z.array(z.string()).optional(),
  channelId: z.string().optional(),
  visibility: z.enum(["public", "unlisted", "private"]).optional(),
  search: z.string().max(200).optional(),
  featured: z.coerce.boolean().optional(),
});

export const CreateArticleCommentSchema = z.object({
  articleId: z.string(),
  parentId: z.string().uuid().optional(),
  content: z.string().min(1).max(2000),
  authorId: z.string(),
  authorName: z.string().min(1).max(100),
  authorAvatar: z.string().url().optional(),
});

export const ReactionSchema = z.object({
  articleId: z.string(),
  userId: z.string(),
  type: z.enum(["like", "love", "insightful", "funny", "disagree"]),
});

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type CreateArticleInput = z.infer<typeof CreateArticleSchema>;
export type UpdateArticleInput = z.infer<typeof UpdateArticleSchema>;
export type ArticleQueryInput = z.infer<typeof ArticleQuerySchema>;
export type CreateArticleCommentInput = z.infer<typeof CreateArticleCommentSchema>;
export type ReactionInput = z.infer<typeof ReactionSchema>;

export type ArticleStatus = "draft" | "published" | "archived";

export interface IArticleReaction {
  userId: string;
  type: "like" | "love" | "insightful" | "funny" | "disagree";
  createdAt: Date;
}

export interface IArticleComment {
  commentId: string;
  articleId: string;
  parentId: string | null;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  content: string;
  likeCount: number;
  replyCount: number;
  isEdited: boolean;
  isHidden: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IArticle extends Document {
  _id: string;
  articleId: string;
  title: string;
  content: string;
  summary: string;
  channelId: string;
  authorName: string;
  authorAvatar: string;
  tags: string[];
  category: string;
  visibility: "public" | "unlisted" | "private";
  status: ArticleStatus;
  coverImageUrl: string;
  allowComments: boolean;
  allowReactions: boolean;
  isFeatured: boolean;
  viewCount: number;
  readCount: number;
  likeCount: number;
  commentCount: number;
  shareCount: number;
  bookmarkCount: number;
  readingTimeMinutes: number;
  averageReadPercentage: number;
  reactions: IArticleReaction[];
  comments: IArticleComment[];
  publishedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;

  incrementViews(count?: number): Promise<IArticle>;
  incrementReads(percentage?: number): Promise<IArticle>;
  incrementLikes(): Promise<IArticle>;
  decrementLikes(): Promise<IArticle>;
  incrementComments(): Promise<IArticle>;
  decrementComments(): Promise<IArticle>;
  incrementShares(): Promise<IArticle>;
  incrementBookmarks(): Promise<IArticle>;
  decrementBookmarks(): Promise<IArticle>;
}

export interface IArticleModel extends Model<IArticle> {
  findByArticleId(articleId: string): Promise<IArticle | null>;
  findByChannel(channelId: string): Promise<IArticle[]>;
  findFeatured(limit?: number): Promise<IArticle[]>;
  searchByTitle(query: string, limit?: number): Promise<IArticle[]>;
}

export interface ArticleListResult {
  articles: IArticle[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface ArticleStats {
  total: number;
  published: number;
  drafts: number;
  archived: number;
  totalViews: number;
  totalReads: number;
  averageReadingTime: number;
  topCategories: Array<{ category: string; count: number }>;
}

// ---------------------------------------------------------------------------
// Mongoose Schema
// ---------------------------------------------------------------------------

const ArticleReactionSchema = new Schema<IArticleReaction>(
  {
    userId: { type: String, required: true },
    type: {
      type: String,
      enum: ["like", "love", "insightful", "funny", "disagree"],
      required: true,
    },
  },
  { _id: false, timestamps: { createdAt: true, updatedAt: false } }
);

const ArticleCommentSchema = new Schema<IArticleComment>(
  {
    commentId: {
      type: String,
      required: true,
      default: () => uuidv4(),
      unique: true,
    },
    articleId: { type: String, required: true },
    parentId: { type: String, default: null },
    authorId: { type: String, required: true },
    authorName: { type: String, required: true },
    authorAvatar: { type: String, default: "" },
    content: { type: String, required: true, maxlength: 2000 },
    likeCount: { type: Number, default: 0, min: 0 },
    replyCount: { type: Number, default: 0, min: 0 },
    isEdited: { type: Boolean, default: false },
    isHidden: { type: Boolean, default: false },
  },
  { _id: false, timestamps: true }
);

const ArticleSchema = new Schema<IArticle, IArticleModel>(
  {
    articleId: {
      type: String,
      required: true,
      unique: true,
      default: () => uuidv4(),
      index: true,
    },
    title: { type: String, required: true, trim: true, maxlength: 500 },
    content: { type: String, required: true, maxlength: 100000 },
    summary: { type: String, maxlength: 1000, default: "" },
    channelId: { type: String, required: true, index: true },
    authorName: { type: String, required: true },
    authorAvatar: { type: String, default: "" },
    tags: [{ type: String, maxlength: 50 }],
    category: {
      type: String,
      enum: [
        "news",
        "tutorial",
        "opinion",
        "review",
        "analysis",
        "interview",
        "case_study",
        "how_to",
        "listicle",
        "other",
      ],
      default: "other",
    },
    visibility: {
      type: String,
      enum: ["public", "unlisted", "private"],
      default: "public",
    },
    status: {
      type: String,
      enum: ["draft", "published", "archived"],
      default: "draft",
    },
    coverImageUrl: { type: String, default: "" },
    allowComments: { type: Boolean, default: true },
    allowReactions: { type: Boolean, default: true },
    isFeatured: { type: Boolean, default: false },
    viewCount: { type: Number, default: 0, min: 0 },
    readCount: { type: Number, default: 0, min: 0 },
    likeCount: { type: Number, default: 0, min: 0 },
    commentCount: { type: Number, default: 0, min: 0 },
    shareCount: { type: Number, default: 0, min: 0 },
    bookmarkCount: { type: Number, default: 0, min: 0 },
    readingTimeMinutes: { type: Number, default: 1, min: 1 },
    averageReadPercentage: { type: Number, default: 0, min: 0, max: 100 },
    reactions: [ArticleReactionSchema],
    comments: [ArticleCommentSchema],
    publishedAt: { type: Date, default: null },
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

ArticleSchema.index({ title: "text", content: "text", tags: "text", summary: "text" });
ArticleSchema.index({ channelId: 1, createdAt: -1 });
ArticleSchema.index({ category: 1, visibility: 1, status: 1 });
ArticleSchema.index({ viewCount: -1 });
ArticleSchema.index({ likeCount: -1 });
ArticleSchema.index({ publishedAt: -1 });
ArticleSchema.index({ tags: 1 });
ArticleSchema.index({ isFeatured: 1, publishedAt: -1 });
ArticleSchema.index({ readingTimeMinutes: 1 });

// ---------------------------------------------------------------------------
// Instance Methods
// ---------------------------------------------------------------------------

ArticleSchema.methods.incrementViews = function (count = 1) {
  this.viewCount += count;
  return this.save();
};

ArticleSchema.methods.incrementReads = function (percentage = 100) {
  this.readCount += 1;
  const totalReads = this.readCount;
  this.averageReadPercentage =
    (this.averageReadPercentage * (totalReads - 1) + percentage) / totalReads;
  return this.save();
};

ArticleSchema.methods.incrementLikes = function () {
  this.likeCount += 1;
  return this.save();
};

ArticleSchema.methods.decrementLikes = function () {
  this.likeCount = Math.max(0, this.likeCount - 1);
  return this.save();
};

ArticleSchema.methods.incrementComments = function () {
  this.commentCount += 1;
  return this.save();
};

ArticleSchema.methods.decrementComments = function () {
  this.commentCount = Math.max(0, this.commentCount - 1);
  return this.save();
};

ArticleSchema.methods.incrementShares = function () {
  this.shareCount += 1;
  return this.save();
};

ArticleSchema.methods.incrementBookmarks = function () {
  this.bookmarkCount += 1;
  return this.save();
};

ArticleSchema.methods.decrementBookmarks = function () {
  this.bookmarkCount = Math.max(0, this.bookmarkCount - 1);
  return this.save();
};

// ---------------------------------------------------------------------------
// Static Methods
// ---------------------------------------------------------------------------

ArticleSchema.statics.findByArticleId = function (articleId: string) {
  return this.findOne({ articleId });
};

ArticleSchema.statics.findByChannel = function (channelId: string) {
  return this.find({ channelId, status: { $ne: "archived" } }).sort({
    createdAt: -1,
  });
};

ArticleSchema.statics.findFeatured = function (limit = 10) {
  return this.find({
    isFeatured: true,
    status: "published",
    visibility: "public",
  })
    .sort({ publishedAt: -1 })
    .limit(limit);
};

ArticleSchema.statics.searchByTitle = function (query: string, limit = 20) {
  return this.find(
    { $text: { $search: query }, status: "published", visibility: "public" },
    { score: { $meta: "textScore" } }
  )
    .sort({ score: { $meta: "textScore" } })
    .limit(limit);
};

// ---------------------------------------------------------------------------
// ArticleService Class
// ---------------------------------------------------------------------------

export class ArticleService {
  private articleModel: IArticleModel;

  constructor() {
    this.articleModel =
      (mongoose.models.Article as IArticleModel) ||
      mongoose.model<IArticle, IArticleModel>("Article", ArticleSchema);
  }

  // -- CRUD ------------------------------------------------------------------

  async createArticle(input: CreateArticleInput): Promise<IArticle> {
    const parsed = CreateArticleSchema.parse(input);
    const wordCount = parsed.content.split(/\s+/).length;
    const readingTime = parsed.readingTimeMinutes ?? Math.max(1, Math.ceil(wordCount / 200));

    const article = new this.articleModel({
      ...parsed,
      readingTimeMinutes: readingTime,
      summary:
        parsed.summary ??
        parsed.content.substring(0, 200).replace(/<[^>]+>/g, "") + "...",
    });
    return article.save();
  }

  async getArticle(articleId: string): Promise<IArticle | null> {
    return this.articleModel.findByArticleId(articleId);
  }

  async updateArticle(
    articleId: string,
    input: UpdateArticleInput,
    channelId: string
  ): Promise<IArticle | null> {
    const parsed = UpdateArticleSchema.parse(input);
    const article = await this.articleModel.findByArticleId(articleId);
    if (!article) return null;
    if (article.channelId !== channelId) {
      throw new Error("Unauthorized: not the article author");
    }

    if (parsed.content) {
      const wordCount = parsed.content.split(/\s+/).length;
      article.readingTimeMinutes = Math.max(1, Math.ceil(wordCount / 200));
    }

    Object.assign(article, parsed);
    return article.save();
  }

  async deleteArticle(
    articleId: string,
    channelId: string
  ): Promise<boolean> {
    const article = await this.articleModel.findByArticleId(articleId);
    if (!article) return false;
    if (article.channelId !== channelId) {
      throw new Error("Unauthorized: not the article author");
    }
    await this.articleModel.deleteOne({ articleId });
    return true;
  }

  async publishArticle(articleId: string): Promise<IArticle> {
    const article = await this.articleModel.findByArticleId(articleId);
    if (!article) throw new Error("Article not found");
    article.status = "published";
    article.publishedAt = new Date();
    return article.save();
  }

  async archiveArticle(
    articleId: string,
    channelId: string
  ): Promise<IArticle | null> {
    const article = await this.articleModel.findByArticleId(articleId);
    if (!article) return null;
    if (article.channelId !== channelId) {
      throw new Error("Unauthorized: not the article author");
    }
    article.status = "archived";
    return article.save();
  }

  async featureArticle(articleId: string): Promise<IArticle | null> {
    const article = await this.articleModel.findByArticleId(articleId);
    if (!article) return null;
    article.isFeatured = true;
    return article.save();
  }

  async unfeatureArticle(articleId: string): Promise<IArticle | null> {
    const article = await this.articleModel.findByArticleId(articleId);
    if (!article) return null;
    article.isFeatured = false;
    return article.save();
  }

  // -- Comments --------------------------------------------------------------

  async addComment(input: CreateArticleCommentInput): Promise<IArticle | null> {
    const parsed = CreateArticleCommentSchema.parse(input);
    const article = await this.articleModel.findByArticleId(parsed.articleId);
    if (!article) return null;
    if (!article.allowComments) throw new Error("Comments are disabled");

    let parentComment: IArticleComment | undefined;
    if (parsed.parentId) {
      parentComment = article.comments.find(
        (c) => c.commentId === parsed.parentId
      );
      if (!parentComment) throw new Error("Parent comment not found");
    }

    const comment: IArticleComment = {
      commentId: uuidv4(),
      articleId: parsed.articleId,
      parentId: parsed.parentId ?? null,
      authorId: parsed.authorId,
      authorName: parsed.authorName,
      authorAvatar: parsed.authorAvatar ?? "",
      content: parsed.content,
      likeCount: 0,
      replyCount: 0,
      isEdited: false,
      isHidden: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    article.comments.push(comment);
    article.commentCount += 1;

    if (parentComment) {
      parentComment.replyCount += 1;
    }

    await article.save();
    return article;
  }

  async updateComment(
    articleId: string,
    commentId: string,
    content: string,
    authorId: string
  ): Promise<IArticle | null> {
    const article = await this.articleModel.findByArticleId(articleId);
    if (!article) return null;

    const comment = article.comments.find(
      (c) => c.commentId === commentId
    );
    if (!comment) return null;
    if (comment.authorId !== authorId) {
      throw new Error("Unauthorized: not the comment author");
    }

    comment.content = content;
    comment.isEdited = true;
    comment.updatedAt = new Date();
    await article.save();
    return article;
  }

  async deleteComment(
    articleId: string,
    commentId: string,
    requesterId: string,
    isAdmin = false
  ): Promise<IArticle | null> {
    const article = await this.articleModel.findByArticleId(articleId);
    if (!article) return null;

    const comment = article.comments.find(
      (c) => c.commentId === commentId
    );
    if (!comment) return null;
    if (comment.authorId !== requesterId && !isAdmin) {
      throw new Error("Unauthorized: not the comment author");
    }

    if (comment.parentId) {
      const parent = article.comments.find(
        (c) => c.commentId === comment.parentId
      );
      if (parent) parent.replyCount = Math.max(0, parent.replyCount - 1);
    }

    article.comments = article.comments.filter(
      (c) => c.commentId !== commentId
    );
    article.commentCount = Math.max(0, article.commentCount - 1);

    await article.save();
    return article;
  }

  async getComments(
    articleId: string,
    options: {
      page?: number;
      limit?: number;
      sort?: "newest" | "oldest" | "popular";
      parentId?: string;
    } = {}
  ) {
    const article = await this.articleModel.findByArticleId(articleId);
    if (!article) return { comments: [], total: 0 };

    let comments = article.comments.filter((c) => !c.isHidden);

    if (options.parentId) {
      comments = comments.filter((c) => c.parentId === options.parentId);
    } else {
      comments = comments.filter((c) => c.parentId === null);
    }

    const sort = options.sort ?? "popular";
    if (sort === "newest") {
      comments.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    } else if (sort === "oldest") {
      comments.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
    } else {
      comments.sort((a, b) => b.likeCount - a.likeCount);
    }

    const page = options.page ?? 1;
    const limit = options.limit ?? 20;
    const total = comments.length;
    const start = (page - 1) * limit;
    const paginated = comments.slice(start, start + limit);

    return {
      comments: paginated,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      hasNext: page * limit < total,
      hasPrev: page > 1,
    };
  }

  // -- Reactions -------------------------------------------------------------

  async addReaction(
    articleId: string,
    userId: string,
    type: IArticleReaction["type"]
  ): Promise<IArticle | null> {
    const article = await this.articleModel.findByArticleId(articleId);
    if (!article) return null;
    if (!article.allowReactions) throw new Error("Reactions are disabled");

    const existing = article.reactions.find((r) => r.userId === userId);
    if (existing) {
      if (existing.type === type) {
        article.reactions = article.reactions.filter(
          (r) => r.userId !== userId
        );
        if (type === "like") article.likeCount = Math.max(0, article.likeCount - 1);
      } else {
        existing.type = type;
      }
    } else {
      article.reactions.push({ userId, type, createdAt: new Date() });
      if (type === "like") article.likeCount += 1;
    }

    return article.save();
  }

  async removeReaction(
    articleId: string,
    userId: string
  ): Promise<IArticle | null> {
    const article = await this.articleModel.findByArticleId(articleId);
    if (!article) return null;

    const existing = article.reactions.find((r) => r.userId === userId);
    if (existing) {
      if (existing.type === "like") {
        article.likeCount = Math.max(0, article.likeCount - 1);
      }
      article.reactions = article.reactions.filter(
        (r) => r.userId !== userId
      );
      return article.save();
    }
    return article;
  }

  async getUserReaction(
    articleId: string,
    userId: string
  ): Promise<IArticleReaction | null> {
    const article = await this.articleModel.findByArticleId(articleId);
    if (!article) return null;
    return (
      article.reactions.find((r) => r.userId === userId) ?? null
    );
  }

  async getReactionCounts(
    articleId: string
  ): Promise<Record<string, number>> {
    const article = await this.articleModel.findByArticleId(articleId);
    if (!article) return {};

    const counts: Record<string, number> = {};
    for (const r of article.reactions) {
      counts[r.type] = (counts[r.type] ?? 0) + 1;
    }
    return counts;
  }

  // -- Analytics & Tracking --------------------------------------------------

  async recordView(articleId: string): Promise<void> {
    const article = await this.articleModel.findByArticleId(articleId);
    if (article) await article.incrementViews();
  }

  async recordRead(articleId: string, percentage: number): Promise<void> {
    const article = await this.articleModel.findByArticleId(articleId);
    if (article) await article.incrementReads(percentage);
  }

  async recordShare(articleId: string): Promise<void> {
    const article = await this.articleModel.findByArticleId(articleId);
    if (article) await article.incrementShares();
  }

  async bookmarkArticle(articleId: string): Promise<void> {
    const article = await this.articleModel.findByArticleId(articleId);
    if (article) await article.incrementBookmarks();
  }

  async unbookmarkArticle(articleId: string): Promise<void> {
    const article = await this.articleModel.findByArticleId(articleId);
    if (article) await article.decrementBookmarks();
  }

  async getAnalytics(articleId: string) {
    const article = await this.articleModel.findByArticleId(articleId);
    if (!article) throw new Error("Article not found");

    const reactionCounts = await this.getReactionCounts(articleId);
    return {
      views: article.viewCount,
      reads: article.readCount,
      likes: article.likeCount,
      comments: article.commentCount,
      shares: article.shareCount,
      bookmarks: article.bookmarkCount,
      averageReadPercentage: article.averageReadPercentage,
      readingTimeMinutes: article.readingTimeMinutes,
      reactions: reactionCounts,
    };
  }

  // -- Search & Browse -------------------------------------------------------

  async listArticles(query: ArticleQueryInput): Promise<ArticleListResult> {
    const parsed = ArticleQuerySchema.parse(query);
    const filter: Record<string, unknown> = {};

    if (parsed.channelId) filter.channelId = parsed.channelId;
    if (parsed.category) filter.category = parsed.category;
    if (parsed.visibility) filter.visibility = parsed.visibility;
    if (parsed.status) filter.status = parsed.status;
    else filter.status = { $in: ["published", "draft"] };
    if (parsed.tags?.length) filter.tags = { $in: parsed.tags };
    if (parsed.featured !== undefined) filter.isFeatured = parsed.featured;
    if (parsed.search) filter.$text = { $search: parsed.search };

    const sortMap: Record<string, Record<string, 1 | -1>> = {
      newest: { publishedAt: -1 },
      oldest: { publishedAt: 1 },
      popular: { viewCount: -1 },
      trending: { likeCount: -1 },
      reading_time: { readingTimeMinutes: 1 },
    };

    const total = await this.articleModel.countDocuments(filter);
    const skip = (parsed.page - 1) * parsed.limit;
    const articles = await this.articleModel
      .find(filter)
      .sort(sortMap[parsed.sort] ?? sortMap.newest)
      .skip(skip)
      .limit(parsed.limit);

    const totalPages = Math.ceil(total / parsed.limit);

    return {
      articles,
      total,
      page: parsed.page,
      limit: parsed.limit,
      totalPages,
      hasNext: parsed.page < totalPages,
      hasPrev: parsed.page > 1,
    };
  }

  async getChannelArticles(channelId: string) {
    return this.articleModel.findByChannel(channelId);
  }

  async getFeaturedArticles(limit = 10) {
    return this.articleModel.findFeatured(limit);
  }

  async searchArticles(query: string, limit = 20) {
    return this.articleModel.searchByTitle(query, limit);
  }

  // -- Stats -----------------------------------------------------------------

  async getArticleStats(channelId?: string): Promise<ArticleStats> {
    const filter: Record<string, unknown> = {};
    if (channelId) filter.channelId = channelId;

    const statusAgg = await this.articleModel.aggregate([
      { $match: filter },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    const totalAgg = await this.articleModel.aggregate([
      { $match: filter },
      {
        $group: {
          _id: null,
          totalViews: { $sum: "$viewCount" },
          totalReads: { $sum: "$readCount" },
          avgReadingTime: { $avg: "$readingTimeMinutes" },
        },
      },
    ]);

    const categoryAgg = await this.articleModel.aggregate([
      { $match: filter },
      { $group: { _id: "$category", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]);

    const statusMap: Record<string, number> = {};
    for (const s of statusAgg) {
      statusMap[s._id] = s.count;
    }

    return {
      total: statusAgg.reduce((sum, s) => sum + s.count, 0),
      published: statusMap.published ?? 0,
      drafts: statusMap.draft ?? 0,
      archived: statusMap.archived ?? 0,
      totalViews: totalAgg[0]?.totalViews ?? 0,
      totalReads: totalAgg[0]?.totalReads ?? 0,
      averageReadingTime: Math.round(
        totalAgg[0]?.avgReadingTime ?? 0
      ),
      topCategories: categoryAgg.map((c) => ({
        category: c._id,
        count: c.count,
      })),
    };
  }

  // -- Utilities -------------------------------------------------------------

  async countByChannel(channelId: string): Promise<number> {
    return this.articleModel.countDocuments({ channelId });
  }

  async getRecentArticles(limit = 10): Promise<IArticle[]> {
    return this.articleModel
      .find({ status: "published", visibility: "public" })
      .sort({ publishedAt: -1 })
      .limit(limit);
  }

  async incrementCommentCount(articleId: string): Promise<void> {
    const article = await this.articleModel.findByArticleId(articleId);
    if (article) await article.incrementComments();
  }

  async decrementCommentCount(articleId: string): Promise<void> {
    const article = await this.articleModel.findByArticleId(articleId);
    if (article) await article.decrementComments();
  }

  async calculateReadingTime(content: string): Promise<number> {
    const wordCount = content.split(/\s+/).length;
    return Math.max(1, Math.ceil(wordCount / 200));
  }

  async generateSummary(
    articleId: string,
    maxLength = 200
  ): Promise<IArticle | null> {
    const article = await this.articleModel.findByArticleId(articleId);
    if (!article) return null;

    const plainText = article.content
      .replace(/<[^>]+>/g, "")
      .replace(/\n+/g, " ")
      .trim();

    article.summary = plainText.substring(0, maxLength);
    if (plainText.length > maxLength) {
      article.summary += "...";
    }

    return article.save();
  }
}

export default ArticleService;
