import { randomUUID } from 'crypto';

export type ChannelStatus = 'active' | 'inactive' | 'suspended' | 'pending_review';
export type SubscriptionTier = 'free' | 'basic' | 'premium' | 'vip';
export type NotificationPreference = 'all' | 'uploads_only' | 'live_only' | 'none';

export interface Channel {
  id: string;
  ownerId: string;
  name: string;
  handle: string;
  description: string;
  avatarUrl: string;
  bannerUrl: string;
  category: string;
  tags: string[];
  language: string;
  country: string;
  status: ChannelStatus;
  verified: boolean;
  subscriberCount: number;
  totalViews: number;
  totalVideos: number;
  joinedAt: string;
  updatedAt: string;
  socialLinks: Record<string, string>;
  settings: ChannelSettings;
  branding: ChannelBranding;
}

export interface ChannelSettings {
  defaultPrivacy: 'public' | 'unlisted' | 'private';
  allowComments: boolean;
  moderateComments: boolean;
  showSubscriberCount: boolean;
  showViewCount: boolean;
  allowEmbedding: boolean;
  notifySubscribers: boolean;
  uploadSchedule: string | null;
  autoPublish: boolean;
  defaultLanguage: string;
  contentDirection: string[];
}

export interface ChannelBranding {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  fontFamily: string;
  logoWatermark: boolean;
  introTemplate: string | null;
  outroTemplate: string | null;
  lowerThirdStyle: string | null;
}

export interface Subscription {
  id: string;
  subscriberId: string;
  channelId: string;
  tier: SubscriptionTier;
  status: 'active' | 'paused' | 'cancelled' | 'expired';
  subscribedAt: string;
  expiresAt: string | null;
  notificationPreference: NotificationPreference;
  autoRenew: boolean;
  paymentId: string | null;
  monthlyPrice: number;
}

export interface ChannelAnalytics {
  channelId: string;
  period: { start: string; end: string };
  subscribers: {
    total: number;
    gained: number;
    lost: number;
    net: number;
    byTier: Record<SubscriptionTier, number>;
  };
  views: {
    total: number;
    unique: number;
    averageWatchTime: number;
    watchTimeHours: number;
    byDevice: Record<string, number>;
    byCountry: Record<string, number>;
    bySource: Record<string, number>;
  };
  engagement: {
    likes: number;
    comments: number;
    shares: number;
    clickThroughRate: number;
    averageViewPercentage: number;
    returnViewerRate: number;
  };
  revenue: {
    estimated: number;
    cpm: number;
    rpm: number;
    adRevenue: number;
    membershipRevenue: number;
    superChatRevenue: number;
    sponsorshipRevenue: number;
    merchandiseRevenue: number;
  };
  content: {
    uploaded: number;
    published: number;
    scheduled: number;
    drafts: number;
    averageProductionTime: number;
  };
  growth: {
    subscriberGrowthRate: number;
    viewGrowthRate: number;
    engagementGrowthRate: number;
    projectedSubscribers30d: number;
    projectedViews30d: number;
  };
}

export interface Video {
  id: string;
  channelId: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  duration: number;
  views: number;
  likes: number;
  comments: number;
  shares: number;
  publishedAt: string;
  status: 'draft' | 'processing' | 'private' | 'unlisted' | 'public' | 'scheduled';
  scheduledAt: string | null;
  tags: string[];
  category: string;
  language: string;
  visibility: 'public' | 'unlisted' | 'private';
  ageRestricted: boolean;
  madeForKids: boolean;
  embeddingAllowed: boolean;
  thumbnailVariants: string[];
  captions: Array<{ language: string; url: string }>;
  chapters: Array<{ title: string; startTime: number }>;
  endScreen: EndScreenConfig | null;
  cards: VideoCard[];
  statistics: VideoStatistics;
}

export interface EndScreenConfig {
  type: 'video' | 'playlist' | 'subscribe' | 'channel' | 'link';
  elements: Array<{
    type: string;
    videoId?: string;
    playlistId?: string;
    channelId?: string;
    url?: string;
    position: { x: number; y: number };
    size: { width: number; height: number };
  }>;
  startTime: number;
  endTime: number;
}

export interface VideoCard {
  type: 'video' | 'playlist' | 'channel' | 'link';
  title: string;
  targetUrl: string;
  startTime: number;
  teaserText: string;
  position: { x: number; y: number };
}

export interface VideoStatistics {
  viewCount: number;
  likeCount: number;
  dislikeCount: number;
  commentCount: number;
  favoriteCount: number;
  shareCount: number;
  averageViewDuration: number;
  averageViewPercentage: number;
  impressionCount: number;
  clickThroughRate: number;
  subscriberGainFromVideo: number;
  watchTimeMinutes: number;
}

export interface Playlist {
  id: string;
  channelId: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  videoIds: string[];
  totalViews: number;
  totalDuration: number;
  createdAt: string;
  updatedAt: string;
  privacy: 'public' | 'unlisted' | 'private';
  defaultLanguage: string;
}

export interface ChannelCollaboration {
  id: string;
  channelId: string;
  partnerChannelId: string;
  type: 'guest_appearance' | 'collab_video' | 'cross_promotion' | 'shoutout';
  status: 'proposed' | 'accepted' | 'in_progress' | 'completed' | 'declined';
  proposedAt: string;
  completedAt: string | null;
  videoIds: string[];
  terms: string;
  revenueSplit: number;
}

export interface ChannelNotification {
  id: string;
  channelId: string;
  type: 'subscriber_milestone' | 'video_published' | 'live_stream_started' | 'comment_highlight' | 'revenue_milestone' | 'collaboration_request' | 'policy_update' | 'analytics_alert';
  title: string;
  message: string;
  data: Record<string, unknown>;
  read: boolean;
  createdAt: string;
}

export interface Comment {
  id: string;
  videoId: string;
  channelId: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  text: string;
  likeCount: number;
  replyCount: number;
  publishedAt: string;
  updatedAt: string;
  isPinned: boolean;
  isHearted: boolean;
  isPublished: boolean;
  parentId: string | null;
  replies: Comment[];
  sentiment: 'positive' | 'neutral' | 'negative';
  toxicityScore: number;
}

function generateId(): string {
  return `ch_${Date.now()}_${randomUUID().slice(0, 8)}`;
}

function generateShortId(): string {
  return randomUUID().slice(0, 12);
}

const DEFAULT_SETTINGS: ChannelSettings = {
  defaultPrivacy: 'public',
  allowComments: true,
  moderateComments: false,
  showSubscriberCount: true,
  showViewCount: true,
  allowEmbedding: true,
  notifySubscribers: true,
  uploadSchedule: null,
  autoPublish: false,
  defaultLanguage: 'en',
  contentDirection: [],
};

const DEFAULT_BRANDING: ChannelBranding = {
  primaryColor: '#FF0000',
  secondaryColor: '#282828',
  accentColor: '#FFFFFF',
  fontFamily: 'Roboto',
  logoWatermark: false,
  introTemplate: null,
  outroTemplate: null,
  lowerThirdStyle: null,
};

const channels = new Map<string, Channel>();
const channelSubscriptions = new Map<string, Subscription[]>();
const videoStore = new Map<string, Video>();
const playlistStore = new Map<string, Playlist>();
const commentStore = new Map<string, Comment>();
const notificationStore = new Map<string, ChannelNotification[]>();
const collaborationStore = new Map<string, ChannelCollaboration[]>();
const analyticsStore = new Map<string, ChannelAnalytics>();

export const channelService = {
  async createChannel(
    ownerId: string,
    name: string,
    handle: string,
    options?: Partial<Pick<Channel, 'description' | 'category' | 'tags' | 'language' | 'country'>>,
  ): Promise<Channel> {
    const existingHandle = Array.from(channels.values()).find((c) => c.handle === handle);
    if (existingHandle) {
      throw new Error(`Handle "${handle}" is already taken`);
    }

    const channel: Channel = {
      id: generateId(),
      ownerId,
      name,
      handle: handle.replace(/[^a-zA-Z0-9_-]/g, ''),
      description: options?.description ?? '',
      avatarUrl: `/api/channels/${generateShortId()}/avatar`,
      bannerUrl: `/api/channels/${generateShortId()}/banner`,
      category: options?.category ?? 'general',
      tags: options?.tags ?? [],
      language: options?.language ?? 'en',
      country: options?.country ?? 'US',
      status: 'active',
      verified: false,
      subscriberCount: 0,
      totalViews: 0,
      totalVideos: 0,
      joinedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      socialLinks: {},
      settings: { ...DEFAULT_SETTINGS },
      branding: { ...DEFAULT_BRANDING },
    };

    channels.set(channel.id, channel);
    channelSubscriptions.set(channel.id, []);
    notificationStore.set(channel.id, []);
    collaborationStore.set(channel.id, []);

    return channel;
  },

  async getById(id: string): Promise<Channel | null> {
    return channels.get(id) ?? null;
  },

  async getByHandle(handle: string): Promise<Channel | null> {
    return Array.from(channels.values()).find((c) => c.handle === handle) ?? null;
  },

  async getByOwner(ownerId: string): Promise<Channel[]> {
    return Array.from(channels.values()).filter((c) => c.ownerId === ownerId);
  },

  async search(query: string, options?: { category?: string; limit?: number }): Promise<Channel[]> {
    const lower = query.toLowerCase();
    let results = Array.from(channels.values()).filter(
      (c) =>
        c.status === 'active' &&
        (c.name.toLowerCase().includes(lower) ||
          c.handle.toLowerCase().includes(lower) ||
          c.description.toLowerCase().includes(lower) ||
          c.tags.some((t) => t.toLowerCase().includes(lower))),
    );

    if (options?.category) {
      results = results.filter((c) => c.category === options.category);
    }

    results.sort((a, b) => b.subscriberCount - a.subscriberCount);
    return results.slice(0, options?.limit ?? 20);
  },

  async update(
    id: string,
    updates: Partial<Pick<Channel, 'name' | 'description' | 'category' | 'tags' | 'language' | 'country' | 'socialLinks' | 'settings' | 'branding'>>,
  ): Promise<Channel | null> {
    const channel = channels.get(id);
    if (!channel) return null;

    const updated = {
      ...channel,
      ...updates,
      settings: updates.settings ? { ...channel.settings, ...updates.settings } : channel.settings,
      branding: updates.branding ? { ...channel.branding, ...updates.branding } : channel.branding,
      updatedAt: new Date().toISOString(),
    };

    channels.set(id, updated);
    return updated;
  },

  async delete(id: string): Promise<boolean> {
    const deleted = channels.delete(id);
    if (deleted) {
      channelSubscriptions.delete(id);
      notificationStore.delete(id);
      collaborationStore.delete(id);
      for (const [vid, video] of videoStore) {
        if (video.channelId === id) videoStore.delete(vid);
      }
      for (const [pid, playlist] of playlistStore) {
        if (playlist.channelId === id) playlistStore.delete(pid);
      }
    }
    return deleted;
  },

  async suspend(id: string, reason: string): Promise<Channel | null> {
    const channel = channels.get(id);
    if (!channel) return null;
    channel.status = 'suspended';
    channel.updatedAt = new Date().toISOString();
    await this.addNotification(id, {
      type: 'policy_update',
      title: 'Channel Suspended',
      message: reason,
      data: { reason },
    });
    return channel;
  },

  async reactivate(id: string): Promise<Channel | null> {
    const channel = channels.get(id);
    if (!channel) return null;
    channel.status = 'active';
    channel.updatedAt = new Date().toISOString();
    return channel;
  },

  async subscribe(
    subscriberId: string,
    channelId: string,
    tier: SubscriptionTier = 'free',
    options?: { paymentId?: string; monthlyPrice?: number },
  ): Promise<Subscription> {
    const channel = channels.get(channelId);
    if (!channel) throw new Error('Channel not found');

    const existing = channelSubscriptions.get(channelId)?.find(
      (s) => s.subscriberId === subscriberId && s.status === 'active',
    );
    if (existing) throw new Error('Already subscribed');

    const subscription: Subscription = {
      id: generateId(),
      subscriberId,
      channelId,
      tier,
      status: 'active',
      subscribedAt: new Date().toISOString(),
      expiresAt: tier !== 'free' ? addMonths(new Date(), 1).toISOString() : null,
      notificationPreference: 'all',
      autoRenew: tier !== 'free',
      paymentId: options?.paymentId ?? null,
      monthlyPrice: options?.monthlyPrice ?? 0,
    };

    const subs = channelSubscriptions.get(channelId) ?? [];
    subs.push(subscription);
    channelSubscriptions.set(channelId, subs);
    channel.subscriberCount += 1;

    await this.addNotification(channelId, {
      type: 'subscriber_milestone',
      title: 'New Subscriber',
      message: `User ${subscriberId} subscribed to ${tier} tier`,
      data: { subscriberId, tier },
    });

    return subscription;
  },

  async unsubscribe(subscriberId: string, channelId: string): Promise<boolean> {
    const subs = channelSubscriptions.get(channelId);
    if (!subs) return false;

    const sub = subs.find((s) => s.subscriberId === subscriberId && s.status === 'active');
    if (!sub) return false;

    sub.status = 'cancelled';
    const channel = channels.get(channelId);
    if (channel && channel.subscriberCount > 0) {
      channel.subscriberCount -= 1;
    }
    return true;
  },

  async getSubscribers(channelId: string, options?: { tier?: SubscriptionTier; limit?: number }): Promise<Subscription[]> {
    const subs = channelSubscriptions.get(channelId) ?? [];
    let filtered = subs.filter((s) => s.status === 'active');
    if (options?.tier) {
      filtered = filtered.filter((s) => s.tier === options.tier);
    }
    return filtered.slice(0, options?.limit ?? 100);
  },

  async getSubscriptionCount(channelId: string, tier?: SubscriptionTier): Promise<number> {
    const subs = channelSubscriptions.get(channelId) ?? [];
    return subs.filter(
      (s) => s.status === 'active' && (tier ? s.tier === tier : true),
    ).length;
  },

  async updateSubscriptionTier(
    subscriberId: string,
    channelId: string,
    newTier: SubscriptionTier,
  ): Promise<Subscription | null> {
    const subs = channelSubscriptions.get(channelId);
    if (!subs) return null;
    const sub = subs.find((s) => s.subscriberId === subscriberId && s.status === 'active');
    if (!sub) return null;
    sub.tier = newTier;
    sub.expiresAt = newTier !== 'free' ? addMonths(new Date(), 1).toISOString() : null;
    return sub;
  },

  async addVideo(channelId: string, videoData: Omit<Video, 'id' | 'channelId' | 'views' | 'likes' | 'comments' | 'shares' | 'statistics'>): Promise<Video> {
    const channel = channels.get(channelId);
    if (!channel) throw new Error('Channel not found');

    const video: Video = {
      id: generateId(),
      channelId,
      ...videoData,
      views: 0,
      likes: 0,
      comments: 0,
      shares: 0,
      statistics: {
        viewCount: 0,
        likeCount: 0,
        dislikeCount: 0,
        commentCount: 0,
        favoriteCount: 0,
        shareCount: 0,
        averageViewDuration: 0,
        averageViewPercentage: 0,
        impressionCount: 0,
        clickThroughRate: 0,
        subscriberGainFromVideo: 0,
        watchTimeMinutes: 0,
      },
    };

    videoStore.set(video.id, video);
    channel.totalVideos += 1;

    if (video.status === 'public') {
      await this.addNotification(channelId, {
        type: 'video_published',
        title: 'Video Published',
        message: `"${video.title}" is now live`,
        data: { videoId: video.id, title: video.title },
      });
    }

    return video;
  },

  async getVideo(videoId: string): Promise<Video | null> {
    return videoStore.get(videoId) ?? null;
  },

  async getChannelVideos(
    channelId: string,
    options?: { status?: Video['status']; limit?: number; offset?: number },
  ): Promise<Video[]> {
    let vids = Array.from(videoStore.values()).filter((v) => v.channelId === channelId);
    if (options?.status) {
      vids = vids.filter((v) => v.status === options.status);
    }
    vids.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
    return vids.slice(options?.offset ?? 0, (options?.offset ?? 0) + (options?.limit ?? 20));
  },

  async updateVideo(videoId: string, updates: Partial<Pick<Video, 'title' | 'description' | 'tags' | 'thumbnailUrl' | 'visibility' | 'status' | 'scheduledAt' | 'chapters' | 'endScreen' | 'cards'>>): Promise<Video | null> {
    const video = videoStore.get(videoId);
    if (!video) return null;
    Object.assign(video, updates);
    return video;
  },

  async deleteVideo(videoId: string): Promise<boolean> {
    return videoStore.delete(videoId);
  },

  async recordVideoView(videoId: string, watchTimeSeconds: number): Promise<void> {
    const video = videoStore.get(videoId);
    if (!video) return;
    video.views += 1;
    video.statistics.viewCount += 1;
    video.statistics.watchTimeMinutes += watchTimeSeconds / 60;
    video.statistics.averageViewDuration =
      video.statistics.watchTimeMinutes * 60 / Math.max(video.statistics.viewCount, 1);
    const channel = channels.get(video.channelId);
    if (channel) channel.totalViews += 1;
  },

  async likeVideo(videoId: string): Promise<void> {
    const video = videoStore.get(videoId);
    if (!video) return;
    video.likes += 1;
    video.statistics.likeCount += 1;
  },

  async createPlaylist(
    channelId: string,
    title: string,
    description: string,
    privacy: Playlist['privacy'] = 'public',
  ): Promise<Playlist> {
    const playlist: Playlist = {
      id: generateId(),
      channelId,
      title,
      description,
      thumbnailUrl: '',
      videoIds: [],
      totalViews: 0,
      totalDuration: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      privacy,
      defaultLanguage: 'en',
    };
    playlistStore.set(playlist.id, playlist);
    return playlist;
  },

  async addToPlaylist(playlistId: string, videoId: string): Promise<boolean> {
    const playlist = playlistStore.get(playlistId);
    if (!playlist) return false;
    if (playlist.videoIds.includes(videoId)) return false;
    playlist.videoIds.push(videoId);
    playlist.updatedAt = new Date().toISOString();
    const video = videoStore.get(videoId);
    if (video) {
      playlist.totalDuration += video.duration;
      playlist.thumbnailUrl = playlist.thumbnailUrl || video.thumbnailUrl;
    }
    return true;
  },

  async removeFromPlaylist(playlistId: string, videoId: string): Promise<boolean> {
    const playlist = playlistStore.get(playlistId);
    if (!playlist) return false;
    const idx = playlist.videoIds.indexOf(videoId);
    if (idx === -1) return false;
    playlist.videoIds.splice(idx, 1);
    playlist.updatedAt = new Date().toISOString();
    const video = videoStore.get(videoId);
    if (video) playlist.totalDuration -= video.duration;
    return true;
  },

  async getPlaylists(channelId: string): Promise<Playlist[]> {
    return Array.from(playlistStore.values()).filter((p) => p.channelId === channelId);
  },

  async addComment(
    videoId: string,
    channelId: string,
    authorId: string,
    authorName: string,
    authorAvatar: string,
    text: string,
    parentId?: string,
  ): Promise<Comment> {
    const comment: Comment = {
      id: generateId(),
      videoId,
      channelId,
      authorId,
      authorName,
      authorAvatar,
      text,
      likeCount: 0,
      replyCount: 0,
      publishedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isPinned: false,
      isHearted: false,
      isPublished: true,
      parentId: parentId ?? null,
      replies: [],
      sentiment: 'neutral',
      toxicityScore: 0,
    };

    if (parentId) {
      const parent = commentStore.get(parentId);
      if (parent) {
        parent.replyCount += 1;
        parent.replies.push(comment);
      }
    } else {
      commentStore.set(comment.id, comment);
    }

    const video = videoStore.get(videoId);
    if (video) {
      video.comments += 1;
      video.statistics.commentCount += 1;
    }

    return comment;
  },

  async getVideoComments(videoId: string, options?: { limit?: number; sortBy?: 'newest' | 'popular' }): Promise<Comment[]> {
    let comments = Array.from(commentStore.values()).filter(
      (c) => c.videoId === videoId && c.parentId === null && c.isPublished,
    );
    if (options?.sortBy === 'popular') {
      comments.sort((a, b) => b.likeCount - a.likeCount);
    } else {
      comments.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
    }
    return comments.slice(0, options?.limit ?? 50);
  },

  async pinComment(commentId: string): Promise<boolean> {
    const comment = commentStore.get(commentId);
    if (!comment) return false;
    const prevPinned = Array.from(commentStore.values()).find(
      (c) => c.videoId === comment.videoId && c.isPinned,
    );
    if (prevPinned) prevPinned.isPinned = false;
    comment.isPinned = true;
    return true;
  },

  async heartComment(commentId: string): Promise<boolean> {
    const comment = commentStore.get(commentId);
    if (!comment) return false;
    comment.isHearted = !comment.isHearted;
    return true;
  },

  async deleteComment(commentId: string): Promise<boolean> {
    return commentStore.delete(commentId);
  },

  async addNotification(channelId: string, data: Omit<ChannelNotification, 'id' | 'channelId' | 'read' | 'createdAt'>): Promise<ChannelNotification> {
    const notif: ChannelNotification = {
      id: generateId(),
      channelId,
      ...data,
      read: false,
      createdAt: new Date().toISOString(),
    };
    const notifs = notificationStore.get(channelId) ?? [];
    notifs.unshift(notif);
    if (notifs.length > 100) notifs.pop();
    notificationStore.set(channelId, notifs);
    return notif;
  },

  async getNotifications(channelId: string, options?: { unreadOnly?: boolean; limit?: number }): Promise<ChannelNotification[]> {
    const notifs = notificationStore.get(channelId) ?? [];
    let filtered = notifs;
    if (options?.unreadOnly) {
      filtered = notifs.filter((n) => !n.read);
    }
    return filtered.slice(0, options?.limit ?? 50);
  },

  async markNotificationRead(notificationId: string, channelId: string): Promise<boolean> {
    const notifs = notificationStore.get(channelId) ?? [];
    const notif = notifs.find((n) => n.id === notificationId);
    if (!notif) return false;
    notif.read = true;
    return true;
  },

  async markAllNotificationsRead(channelId: string): Promise<void> {
    const notifs = notificationStore.get(channelId) ?? [];
    for (const notif of notifs) notif.read = true;
  },

  async getUnreadCount(channelId: string): Promise<number> {
    const notifs = notificationStore.get(channelId) ?? [];
    return notifs.filter((n) => !n.read).length;
  },

  async proposeCollaboration(
    channelId: string,
    partnerChannelId: string,
    type: ChannelCollaboration['type'],
    terms: string,
    revenueSplit: number = 50,
  ): Promise<ChannelCollaboration> {
    const collab: ChannelCollaboration = {
      id: generateId(),
      channelId,
      partnerChannelId,
      type,
      status: 'proposed',
      proposedAt: new Date().toISOString(),
      completedAt: null,
      videoIds: [],
      terms,
      revenueSplit,
    };

    const collabs = collaborationStore.get(channelId) ?? [];
    collabs.push(collab);
    collaborationStore.set(channelId, collabs);

    await this.addNotification(channelId, {
      type: 'collaboration_request',
      title: 'Collaboration Proposed',
      message: `Proposed ${type.replace(/_/g, ' ')} with channel ${partnerChannelId}`,
      data: { collaborationId: collab.id, partnerChannelId, type },
    });

    return collab;
  },

  async respondToCollaboration(
    collaborationId: string,
    channelId: string,
    accept: boolean,
  ): Promise<ChannelCollaboration | null> {
    const collabs = collaborationStore.get(channelId) ?? [];
    const collab = collabs.find((c) => c.id === collaborationId);
    if (!collab) return null;
    collab.status = accept ? 'accepted' : 'declined';
    return collab;
  },

  async getCollaborations(channelId: string): Promise<ChannelCollaboration[]> {
    return collaborationStore.get(channelId) ?? [];
  },

  async getChannelAnalytics(channelId: string, period: { start: string; end: string }): Promise<ChannelAnalytics> {
    const cached = analyticsStore.get(`${channelId}:${period.start}:${period.end}`);
    if (cached) return cached;

    const channel = channels.get(channelId);
    const subs = channelSubscriptions.get(channelId) ?? [];
    const vids = Array.from(videoStore.values()).filter((v) => v.channelId === channelId);

    const activeSubs = subs.filter((s) => s.status === 'active');
    const tierBreakdown = { free: 0, basic: 0, premium: 0, vip: 0 } as Record<SubscriptionTier, number>;
    for (const s of activeSubs) tierBreakdown[s.tier] += 1;

    const totalViews = vids.reduce((acc, v) => acc + v.views, 0);
    const totalWatchTime = vids.reduce((acc, v) => acc + v.statistics.watchTimeMinutes, 0);
    const totalLikes = vids.reduce((acc, v) => acc + v.likes, 0);
    const totalComments = vids.reduce((acc, v) => acc + v.comments, 0);

    const analytics: ChannelAnalytics = {
      channelId,
      period,
      subscribers: {
        total: activeSubs.length,
        gained: Math.floor(activeSubs.length * 0.05),
        lost: Math.floor(activeSubs.length * 0.02),
        net: Math.floor(activeSubs.length * 0.03),
        byTier: tierBreakdown,
      },
      views: {
        total: totalViews,
        unique: Math.floor(totalViews * 0.7),
        averageWatchTime: totalWatchTime / Math.max(vids.length, 1),
        watchTimeHours: totalWatchTime / 60,
        byDevice: { mobile: 60, desktop: 30, tablet: 7, tv: 3 },
        byCountry: { US: 35, UK: 12, Canada: 8, Australia: 6, Other: 39 },
        bySource: { search: 30, suggested: 35, browse: 15, external: 10, direct: 10 },
      },
      engagement: {
        likes: totalLikes,
        comments: totalComments,
        shares: Math.floor(totalLikes * 0.3),
        clickThroughRate: 4.5 + Math.random() * 3,
        averageViewPercentage: 40 + Math.random() * 25,
        returnViewerRate: 25 + Math.random() * 20,
      },
      revenue: {
        estimated: totalViews * 0.003 + activeSubs.length * 4.99,
        cpm: 3 + Math.random() * 8,
        rpm: 2 + Math.random() * 5,
        adRevenue: totalViews * 0.003,
        membershipRevenue: activeSubs.filter((s) => s.tier !== 'free').length * 4.99,
        superChatRevenue: 0,
        sponsorshipRevenue: 0,
        merchandiseRevenue: 0,
      },
      content: {
        uploaded: vids.length,
        published: vids.filter((v) => v.status === 'public').length,
        scheduled: vids.filter((v) => v.status === 'scheduled').length,
        drafts: vids.filter((v) => v.status === 'draft').length,
        averageProductionTime: 48,
      },
      growth: {
        subscriberGrowthRate: 3.2,
        viewGrowthRate: 8.5,
        engagementGrowthRate: 1.8,
        projectedSubscribers30d: Math.floor(activeSubs.length * 1.03),
        projectedViews30d: Math.floor(totalViews * 1.08),
      },
    };

    analyticsStore.set(`${channelId}:${period.start}:${period.end}`, analytics);
    return analytics;
  },

  async getTopChannels(options?: { category?: string; limit?: number; sortBy?: 'subscribers' | 'views' | 'growth' }): Promise<Channel[]> {
    let channelsList = Array.from(channels.values()).filter((c) => c.status === 'active');
    if (options?.category) {
      channelsList = channelsList.filter((c) => c.category === options.category);
    }
    const sortKey = options?.sortBy ?? 'subscribers';
    if (sortKey === 'subscribers') {
      channelsList.sort((a, b) => b.subscriberCount - a.subscriberCount);
    } else if (sortKey === 'views') {
      channelsList.sort((a, b) => b.totalViews - a.totalViews);
    }
    return channelsList.slice(0, options?.limit ?? 20);
  },

  async getTrendingChannels(period: 'day' | 'week' | 'month' = 'week', limit: number = 10): Promise<Channel[]> {
    const channelsList = Array.from(channels.values()).filter((c) => c.status === 'active');
    return channelsList
      .sort((a, b) => {
        const growthA = a.subscriberCount * 0.1 + a.totalViews * 0.001;
        const growthB = b.subscriberCount * 0.1 + b.totalViews * 0.001;
        return growthB - growthA;
      })
      .slice(0, limit);
  },

  async getChannelSuggestions(channelId: string, limit: number = 5): Promise<Channel[]> {
    const channel = channels.get(channelId);
    if (!channel) return [];
    return Array.from(channels.values())
      .filter((c) => c.id !== channelId && c.status === 'active' && c.category === channel.category)
      .sort((a, b) => b.subscriberCount - a.subscriberCount)
      .slice(0, limit);
  },

  _reset(): void {
    channels.clear();
    channelSubscriptions.clear();
    videoStore.clear();
    playlistStore.clear();
    commentStore.clear();
    notificationStore.clear();
    collaborationStore.clear();
    analyticsStore.clear();
  },
};

function addMonths(date: Date, months: number): Date {
  const result = new Date(date);
  result.setMonth(result.getMonth() + months);
  return result;
}
