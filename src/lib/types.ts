export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: "user" | "creator" | "admin";
  createdAt: string;
}

export interface Video {
  id: string;
  title: string;
  description: string;
  thumbnail?: string;
  url: string;
  duration: number;
  views: number;
  likes: number;
  creatorId: string;
  creator: Pick<User, "id" | "name" | "avatar">;
  tags: string[];
  category: string;
  status: "draft" | "processing" | "published" | "archived";
  createdAt: string;
  updatedAt: string;
}

export interface Channel {
  id: string;
  name: string;
  description: string;
  avatar?: string;
  banner?: string;
  subscriberCount: number;
  videoCount: number;
  userId: string;
  createdAt: string;
}

export interface Comment {
  id: string;
  content: string;
  userId: string;
  user: Pick<User, "id" | "name" | "avatar">;
  videoId: string;
  parentId?: string;
  likes: number;
  createdAt: string;
}

export interface Playlist {
  id: string;
  name: string;
  description: string;
  thumbnail?: string;
  videoCount: number;
  userId: string;
  videos: Video[];
  createdAt: string;
}

export type ApiResponse<T> = {
  data: T;
  meta?: { total: number; page: number; pageSize: number; totalPages: number };
};

export type ApiError = { message: string; code: string; status: number };
