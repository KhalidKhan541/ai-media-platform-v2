import mongoose, { Schema, Document, Model } from "mongoose";
import { z } from "zod";
import { v4 as uuidv4 } from "uuid";

// ---------------------------------------------------------------------------
// Zod Schemas
// ---------------------------------------------------------------------------

export const CreatePlaylistSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(2000).optional(),
  channelId: z.string(),
  visibility: z.enum(["public", "unlisted", "private"]).default("public"),
  thumbnailUrl: z.string().url().optional(),
  tags: z.array(z.string().max(50)).max(20).default([]),
  isCollaborative: z.boolean().default(false),
  collaboratorIds: z.array(z.string()).max(10).default([]),
});

export const UpdatePlaylistSchema = CreatePlaylistSchema.partial();

export const PlaylistItemSchema = z.object({
  videoId: z.string(),
  position: z.number().int().min(0).optional(),
  note: z.string().max(500).optional(),
  addedBy: z.string(),
});

export const PlaylistQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
  sort: z
    .enum(["newest", "oldest", "popular", "alphabetical", "custom"])
    .default("newest"),
  visibility: z.enum(["public", "unlisted", "private"]).optional(),
  channelId: z.string().optional(),
  search: z.string().max(200).optional(),
  featured: z.coerce.boolean().optional(),
});

export const ReorderPlaylistSchema = z.object({
  videoIds: z.array(z.string()).min(1),
});

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type CreatePlaylistInput = z.infer<typeof CreatePlaylistSchema>;
export type UpdatePlaylistInput = z.infer<typeof UpdatePlaylistSchema>;
export type PlaylistItemInput = z.infer<typeof PlaylistItemSchema>;
export type PlaylistQueryInput = z.infer<typeof PlaylistQuerySchema>;

export interface IPlaylistItem {
  videoId: string;
  position: number;
  note: string;
  addedBy: string;
  addedAt: Date;
}

export interface IPlaylist extends Document {
  _id: string;
  playlistId: string;
  title: string;
  description: string;
  channelId: string;
  visibility: "public" | "unlisted" | "private";
  thumbnailUrl: string;
  tags: string[];
  isCollaborative: boolean;
  collaboratorIds: string[];
  items: IPlaylistItem[];
  itemCount: number;
  totalDurationSeconds: number;
  viewCount: number;
  likeCount: number;
  shareCount: number;
  isFeatured: boolean;
  featuredOrder: number;
  lastItemAddedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;

  incrementViews(count?: number): Promise<IPlaylist>;
  incrementLikes(): Promise<IPlaylist>;
  decrementLikes(): Promise<IPlaylist>;
  incrementShares(): Promise<IPlaylist>;
}

export interface IPlaylistModel extends Model<IPlaylist> {
  findByPlaylistId(playlistId: string): Promise<IPlaylist | null>;
  findByChannel(channelId: string): Promise<IPlaylist[]>;
  findFeatured(limit?: number): Promise<IPlaylist[]>;
  findPublic(limit?: number): Promise<IPlaylist[]>;
}

export interface PlaylistListResult {
  playlists: IPlaylist[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface PlaylistStats {
  total: number;
  public: number;
  unlisted: number;
  private: number;
  collaborative: number;
  featured: number;
  totalItems: number;
  averageItemsPerPlaylist: number;
  mostViewed: IPlaylist | null;
}

// ---------------------------------------------------------------------------
// Mongoose Schema
// ---------------------------------------------------------------------------

const PlaylistItemMongooseSchema = new Schema<IPlaylistItem>(
  {
    videoId: { type: String, required: true, index: true },
    position: { type: Number, required: true },
    note: { type: String, maxlength: 500, default: "" },
    addedBy: { type: String, required: true },
    addedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const PlaylistSchema = new Schema<IPlaylist, IPlaylistModel>(
  {
    playlistId: {
      type: String,
      required: true,
      unique: true,
      default: () => uuidv4(),
      index: true,
    },
    title: { type: String, required: true, trim: true, maxlength: 200 },
    description: { type: String, maxlength: 2000, default: "" },
    channelId: { type: String, required: true, index: true },
    visibility: {
      type: String,
      enum: ["public", "unlisted", "private"],
      default: "public",
    },
    thumbnailUrl: { type: String, default: "" },
    tags: [{ type: String, maxlength: 50 }],
    isCollaborative: { type: Boolean, default: false },
    collaboratorIds: [{ type: String }],
    items: [PlaylistItemMongooseSchema],
    itemCount: { type: Number, default: 0, min: 0 },
    totalDurationSeconds: { type: Number, default: 0, min: 0 },
    viewCount: { type: Number, default: 0, min: 0 },
    likeCount: { type: Number, default: 0, min: 0 },
    shareCount: { type: Number, default: 0, min: 0 },
    isFeatured: { type: Boolean, default: false, index: true },
    featuredOrder: { type: Number, default: 0 },
    lastItemAddedAt: { type: Date, default: null },
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

PlaylistSchema.index({ title: "text", description: "text", tags: "text" });
PlaylistSchema.index({ channelId: 1, createdAt: -1 });
PlaylistSchema.index({ visibility: 1, isFeatured: 1, featuredOrder: 1 });
PlaylistSchema.index({ viewCount: -1 });
PlaylistSchema.index({ likeCount: -1 });
PlaylistSchema.index({ items: 1 });
PlaylistSchema.index({ tags: 1 });
PlaylistSchema.index({ lastItemAddedAt: -1 });

// ---------------------------------------------------------------------------
// Instance Methods
// ---------------------------------------------------------------------------

PlaylistSchema.methods.incrementViews = function (count = 1) {
  this.viewCount += count;
  return this.save();
};

PlaylistSchema.methods.incrementLikes = function () {
  this.likeCount += 1;
  return this.save();
};

PlaylistSchema.methods.decrementLikes = function () {
  this.likeCount = Math.max(0, this.likeCount - 1);
  return this.save();
};

PlaylistSchema.methods.incrementShares = function () {
  this.shareCount += 1;
  return this.save();
};

// ---------------------------------------------------------------------------
// Static Methods
// ---------------------------------------------------------------------------

PlaylistSchema.statics.findByPlaylistId = function (playlistId: string) {
  return this.findOne({ playlistId });
};

PlaylistSchema.statics.findByChannel = function (channelId: string) {
  return this.find({ channelId }).sort({ createdAt: -1 });
};

PlaylistSchema.statics.findFeatured = function (limit = 10) {
  return this.find({
    isFeatured: true,
    visibility: "public",
  })
    .sort({ featuredOrder: 1, viewCount: -1 })
    .limit(limit);
};

PlaylistSchema.statics.findPublic = function (limit = 50) {
  return this.find({ visibility: "public" })
    .sort({ viewCount: -1 })
    .limit(limit);
};

// ---------------------------------------------------------------------------
// PlaylistService Class
// ---------------------------------------------------------------------------

export class PlaylistService {
  private playlistModel: IPlaylistModel;

  constructor() {
    this.playlistModel =
      (mongoose.models.Playlist as IPlaylistModel) ||
      mongoose.model<IPlaylist, IPlaylistModel>("Playlist", PlaylistSchema);
  }

  // -- CRUD ------------------------------------------------------------------

  async createPlaylist(input: CreatePlaylistInput): Promise<IPlaylist> {
    const parsed = CreatePlaylistSchema.parse(input);
    const playlist = new this.playlistModel({
      ...parsed,
      itemCount: 0,
      totalDurationSeconds: 0,
    });
    return playlist.save();
  }

  async getPlaylist(playlistId: string): Promise<IPlaylist | null> {
    return this.playlistModel.findByPlaylistId(playlistId);
  }

  async updatePlaylist(
    playlistId: string,
    input: UpdatePlaylistInput,
    channelId: string
  ): Promise<IPlaylist | null> {
    const parsed = UpdatePlaylistSchema.parse(input);
    const playlist = await this.playlistModel.findByPlaylistId(playlistId);
    if (!playlist) return null;
    if (playlist.channelId !== channelId) {
      throw new Error("Unauthorized: not the playlist owner");
    }
    Object.assign(playlist, parsed);
    return playlist.save();
  }

  async deletePlaylist(
    playlistId: string,
    channelId: string
  ): Promise<boolean> {
    const playlist = await this.playlistModel.findByPlaylistId(playlistId);
    if (!playlist) return false;
    if (playlist.channelId !== channelId) {
      throw new Error("Unauthorized: not the playlist owner");
    }
    await this.playlistModel.deleteOne({ playlistId });
    return true;
  }

  // -- Item Management -------------------------------------------------------

  async addItem(
    playlistId: string,
    item: PlaylistItemInput,
    channelId: string
  ): Promise<IPlaylist> {
    const parsed = PlaylistItemSchema.parse(item);
    const playlist = await this.playlistModel.findByPlaylistId(playlistId);
    if (!playlist) throw new Error("Playlist not found");
    if (playlist.channelId !== channelId && !playlist.isCollaborative) {
      throw new Error("Unauthorized: not the playlist owner or collaborator");
    }

    const exists = playlist.items.some((i) => i.videoId === parsed.videoId);
    if (exists) throw new Error("Video already in playlist");

    const position =
      parsed.position ?? playlist.items.length;

    playlist.items.push({
      videoId: parsed.videoId,
      position,
      note: parsed.note ?? "",
      addedBy: parsed.addedBy,
      addedAt: new Date(),
    });

    playlist.items.sort((a, b) => a.position - b.position);
    playlist.itemCount = playlist.items.length;
    playlist.lastItemAddedAt = new Date();

    return playlist.save();
  }

  async removeItem(
    playlistId: string,
    videoId: string,
    channelId: string
  ): Promise<IPlaylist> {
    const playlist = await this.playlistModel.findByPlaylistId(playlistId);
    if (!playlist) throw new Error("Playlist not found");
    if (playlist.channelId !== channelId && !playlist.isCollaborative) {
      throw new Error("Unauthorized: not the playlist owner or collaborator");
    }

    playlist.items = playlist.items.filter((i) => i.videoId !== videoId);
    playlist.items.forEach((item, idx) => {
      item.position = idx;
    });
    playlist.itemCount = playlist.items.length;

    return playlist.save();
  }

  async reorderItems(
    playlistId: string,
    videoIds: string[],
    channelId: string
  ): Promise<IPlaylist> {
    const parsed = ReorderPlaylistSchema.parse({ videoIds });
    const playlist = await this.playlistModel.findByPlaylistId(playlistId);
    if (!playlist) throw new Error("Playlist not found");
    if (playlist.channelId !== channelId) {
      throw new Error("Unauthorized: not the playlist owner");
    }

    const itemMap = new Map(
      playlist.items.map((i) => [i.videoId, i])
    );

    const reordered = parsed.videoIds
      .map((id, idx) => {
        const item = itemMap.get(id);
        if (!item) return null;
        item.position = idx;
        return item;
      })
      .filter(Boolean) as IPlaylistItem[];

    const remaining = playlist.items.filter(
      (i) => !parsed.videoIds.includes(i.videoId)
    );

    remaining.forEach((item, idx) => {
      item.position = reordered.length + idx;
    });

    playlist.items = [...reordered, ...remaining];
    return playlist.save();
  }

  async moveItem(
    playlistId: string,
    videoId: string,
    newPosition: number,
    channelId: string
  ): Promise<IPlaylist> {
    const playlist = await this.playlistModel.findByPlaylistId(playlistId);
    if (!playlist) throw new Error("Playlist not found");
    if (playlist.channelId !== channelId) {
      throw new Error("Unauthorized: not the playlist owner");
    }

    const itemIndex = playlist.items.findIndex((i) => i.videoId === videoId);
    if (itemIndex === -1) throw new Error("Video not in playlist");

    const [item] = playlist.items.splice(itemIndex, 1);
    const clampedPosition = Math.min(newPosition, playlist.items.length);
    playlist.items.splice(clampedPosition, 0, item);

    playlist.items.forEach((i, idx) => {
      i.position = idx;
    });

    return playlist.save();
  }

  async getItemVideoIds(playlistId: string): Promise<string[]> {
    const playlist = await this.playlistModel.findByPlaylistId(playlistId);
    if (!playlist) return [];
    return playlist.items.map((i) => i.videoId);
  }

  async getNextVideo(
    playlistId: string,
    currentVideoId: string
  ): Promise<string | null> {
    const playlist = await this.playlistModel.findByPlaylistId(playlistId);
    if (!playlist || playlist.items.length === 0) return null;

    const idx = playlist.items.findIndex((i) => i.videoId === currentVideoId);
    if (idx === -1) return playlist.items[0]?.videoId ?? null;

    const nextIdx = (idx + 1) % playlist.items.length;
    return playlist.items[nextIdx]?.videoId ?? null;
  }

  async getPreviousVideo(
    playlistId: string,
    currentVideoId: string
  ): Promise<string | null> {
    const playlist = await this.playlistModel.findByPlaylistId(playlistId);
    if (!playlist || playlist.items.length === 0) return null;

    const idx = playlist.items.findIndex((i) => i.videoId === currentVideoId);
    if (idx === -1) return playlist.items[playlist.items.length - 1]?.videoId ?? null;

    const prevIdx = (idx - 1 + playlist.items.length) % playlist.items.length;
    return playlist.items[prevIdx]?.videoId ?? null;
  }

  async itemExists(
    playlistId: string,
    videoId: string
  ): Promise<boolean> {
    const playlist = await this.playlistModel.findByPlaylistId(playlistId);
    if (!playlist) return false;
    return playlist.items.some((i) => i.videoId === videoId);
  }

  async addToPlaylists(
    playlistIds: string[],
    videoId: string,
    addedBy: string
  ): Promise<{ added: string[]; errors: string[] }> {
    const added: string[] = [];
    const errors: string[] = [];

    for (const pid of playlistIds) {
      try {
        await this.addItem(pid, { videoId, addedBy }, "");
        added.push(pid);
      } catch (err) {
        errors.push(pid);
      }
    }

    return { added, errors };
  }

  // -- Featured Playlists ----------------------------------------------------

  async setFeatured(
    playlistId: string,
    featured: boolean,
    order = 0
  ): Promise<IPlaylist | null> {
    const playlist = await this.playlistModel.findByPlaylistId(playlistId);
    if (!playlist) return null;
    playlist.isFeatured = featured;
    playlist.featuredOrder = order;
    return playlist.save();
  }

  async getFeatured(limit = 10) {
    return this.playlistModel.findFeatured(limit);
  }

  async reorderFeatured(
    playlistOrders: Array<{ playlistId: string; order: number }>
  ): Promise<void> {
    for (const { playlistId, order } of playlistOrders) {
      await this.playlistModel.findOneAndUpdate(
        { playlistId },
        { featuredOrder: order }
      );
    }
  }

  // -- Collaboration ---------------------------------------------------------

  async addCollaborator(
    playlistId: string,
    collaboratorId: string,
    channelId: string
  ): Promise<IPlaylist | null> {
    const playlist = await this.playlistModel.findByPlaylistId(playlistId);
    if (!playlist) return null;
    if (playlist.channelId !== channelId) {
      throw new Error("Unauthorized: not the playlist owner");
    }
    if (!playlist.isCollaborative) {
      throw new Error("Playlist is not collaborative");
    }
    if (playlist.collaboratorIds.includes(collaboratorId)) {
      throw new Error("User is already a collaborator");
    }
    if (playlist.collaboratorIds.length >= 10) {
      throw new Error("Maximum collaborators reached");
    }
    playlist.collaboratorIds.push(collaboratorId);
    return playlist.save();
  }

  async removeCollaborator(
    playlistId: string,
    collaboratorId: string,
    channelId: string
  ): Promise<IPlaylist | null> {
    const playlist = await this.playlistModel.findByPlaylistId(playlistId);
    if (!playlist) return null;
    if (playlist.channelId !== channelId) {
      throw new Error("Unauthorized: not the playlist owner");
    }
    playlist.collaboratorIds = playlist.collaboratorIds.filter(
      (id) => id !== collaboratorId
    );
    return playlist.save();
  }

  // -- Listing & Search ------------------------------------------------------

  async listPlaylists(query: PlaylistQueryInput): Promise<PlaylistListResult> {
    const parsed = PlaylistQuerySchema.parse(query);
    const filter: Record<string, unknown> = {};

    if (parsed.channelId) filter.channelId = parsed.channelId;
    if (parsed.visibility) filter.visibility = parsed.visibility;
    if (parsed.featured !== undefined) filter.isFeatured = parsed.featured;
    if (parsed.search) filter.$text = { $search: parsed.search };

    const sortMap: Record<string, Record<string, 1 | -1>> = {
      newest: { createdAt: -1 },
      oldest: { createdAt: 1 },
      popular: { viewCount: -1 },
      alphabetical: { title: 1 },
      custom: { featuredOrder: 1, viewCount: -1 },
    };

    const total = await this.playlistModel.countDocuments(filter);
    const skip = (parsed.page - 1) * parsed.limit;
    const playlists = await this.playlistModel
      .find(filter)
      .sort(sortMap[parsed.sort] ?? sortMap.newest)
      .skip(skip)
      .limit(parsed.limit);

    const totalPages = Math.ceil(total / parsed.limit);

    return {
      playlists,
      total,
      page: parsed.page,
      limit: parsed.limit,
      totalPages,
      hasNext: parsed.page < totalPages,
      hasPrev: parsed.page > 1,
    };
  }

  async getChannelPlaylists(channelId: string) {
    return this.playlistModel.findByChannel(channelId);
  }

  async getPublicPlaylists(limit = 50) {
    return this.playlistModel.findPublic(limit);
  }

  // -- Analytics & Stats -----------------------------------------------------

  async incrementViews(playlistId: string): Promise<void> {
    const playlist = await this.playlistModel.findByPlaylistId(playlistId);
    if (playlist) await playlist.incrementViews();
  }

  async incrementLikes(playlistId: string): Promise<void> {
    const playlist = await this.playlistModel.findByPlaylistId(playlistId);
    if (playlist) await playlist.incrementLikes();
  }

  async decrementLikes(playlistId: string): Promise<void> {
    const playlist = await this.playlistModel.findByPlaylistId(playlistId);
    if (playlist) await playlist.decrementLikes();
  }

  async getPlaylistStats(channelId?: string): Promise<PlaylistStats> {
    const filter: Record<string, unknown> = {};
    if (channelId) filter.channelId = channelId;

    const playlists = await this.playlistModel.find(filter);
    const visibilityCounts = { public: 0, unlisted: 0, private: 0 };
    let totalItems = 0;
    let collaborative = 0;
    let featured = 0;

    for (const p of playlists) {
      visibilityCounts[p.visibility]++;
      totalItems += p.itemCount;
      if (p.isCollaborative) collaborative++;
      if (p.isFeatured) featured++;
    }

    const sortedByViews = [...playlists].sort(
      (a, b) => b.viewCount - a.viewCount
    );

    return {
      total: playlists.length,
      public: visibilityCounts.public,
      unlisted: visibilityCounts.unlisted,
      private: visibilityCounts.private,
      collaborative,
      featured,
      totalItems,
      averageItemsPerPlaylist:
        playlists.length > 0
          ? Math.round((totalItems / playlists.length) * 10) / 10
          : 0,
      mostViewed: sortedByViews[0] ?? null,
    };
  }

  // -- Utilities -------------------------------------------------------------

  async countByChannel(channelId: string): Promise<number> {
    return this.playlistModel.countDocuments({ channelId });
  }

  async findPlaylistsContainingVideo(videoId: string): Promise<IPlaylist[]> {
    return this.playlistModel.find({
      "items.videoId": videoId,
      visibility: { $in: ["public", "unlisted"] },
    });
  }

  async duplicatePlaylist(
    playlistId: string,
    newChannelId: string,
    newTitle?: string
  ): Promise<IPlaylist> {
    const original = await this.playlistModel.findByPlaylistId(playlistId);
    if (!original) throw new Error("Original playlist not found");

    const newPlaylist = await this.createPlaylist({
      title: newTitle ?? `${original.title} (Copy)`,
      description: original.description,
      channelId: newChannelId,
      visibility: "private",
      tags: original.tags,
    });

    for (const item of original.items) {
      try {
        await this.addItem(
          newPlaylist.playlistId,
          {
            videoId: item.videoId,
            note: item.note,
            addedBy: newChannelId,
          },
          newChannelId
        );
      } catch {
        continue;
      }
    }

    return (await this.playlistModel.findByPlaylistId(
      newPlaylist.playlistId
    ))!;
  }
}

export default PlaylistService;
