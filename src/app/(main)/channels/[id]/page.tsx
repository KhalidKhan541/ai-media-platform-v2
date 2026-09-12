"use client";

import { useState, useMemo } from "react";
import Link from "next/link";

const mockChannel = {
  id: "ch1",
  name: "Code Academy",
  slug: "code-academy",
  description:
    "Empowering developers with high-quality tutorials, courses, and insights on web development, AI, and modern programming practices. New videos every week!",
  avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=CodeAcademy",
  coverImage: "https://picsum.photos/seed/channelcover/1200/400",
  subscriberCount: 245000,
  totalViews: 12400000,
  videoCount: 342,
  isVerified: true,
  isPartner: true,
  joinedDate: "2019-03-15",
  location: "San Francisco, CA",
  website: "https://codeacademy.dev",
  socialLinks: {
    twitter: "https://twitter.com/codeacademy",
    github: "https://github.com/codeacademy",
  },
};

const mockVideos = [
  {
    id: "1",
    title: "Building AI Apps with Next.js 14 and OpenAI - Complete Tutorial",
    thumbnail: "https://picsum.photos/seed/chvid1/640/360",
    views: 245000,
    duration: "24:35",
    publishedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    aiGenerated: true,
  },
  {
    id: "2",
    title: "Tailwind CSS v4 - Everything You Need to Know",
    thumbnail: "https://picsum.photos/seed/chvid2/640/360",
    views: 182000,
    duration: "18:22",
    publishedAt: new Date(Date.now() - 86400000 * 5).toISOString(),
  },
  {
    id: "3",
    title: "React Server Components - The Future of Web Development",
    thumbnail: "https://picsum.photos/seed/chvid3/640/360",
    views: 314000,
    duration: "32:10",
    publishedAt: new Date(Date.now() - 86400000 * 8).toISOString(),
  },
  {
    id: "4",
    title: "TypeScript 5.4 Deep Dive - New Features Explained",
    thumbnail: "https://picsum.photos/seed/chvid4/640/360",
    views: 156000,
    duration: "22:15",
    publishedAt: new Date(Date.now() - 86400000 * 12).toISOString(),
    aiGenerated: true,
  },
  {
    id: "5",
    title: "Docker & Kubernetes for Beginners - Complete Course",
    thumbnail: "https://picsum.photos/seed/chvid5/640/360",
    views: 421000,
    duration: "1:45:30",
    publishedAt: new Date(Date.now() - 86400000 * 15).toISOString(),
  },
  {
    id: "6",
    title: "Building Real-time Chat App with WebSockets",
    thumbnail: "https://picsum.photos/seed/chvid6/640/360",
    views: 89000,
    duration: "45:20",
    publishedAt: new Date(Date.now() - 86400000 * 20).toISOString(),
  },
  {
    id: "7",
    title: "CSS Grid vs Flexbox - Complete Guide",
    thumbnail: "https://picsum.photos/seed/chvid7/640/360",
    views: 67000,
    duration: "15:45",
    publishedAt: new Date(Date.now() - 86400000 * 25).toISOString(),
  },
  {
    id: "8",
    title: "Git Advanced - Rebase, Cherry-pick & Interactive Staging",
    thumbnail: "https://picsum.photos/seed/chvid8/640/360",
    views: 123000,
    duration: "28:00",
    publishedAt: new Date(Date.now() - 86400000 * 30).toISOString(),
  },
  {
    id: "9",
    title: "PostgreSQL Performance Optimization Tips",
    thumbnail: "https://picsum.photos/seed/chvid9/640/360",
    views: 45000,
    duration: "35:10",
    publishedAt: new Date(Date.now() - 86400000 * 35).toISOString(),
  },
  {
    id: "10",
    title: "REST API Design - The Complete Guide",
    thumbnail: "https://picsum.photos/seed/chvid10/640/360",
    views: 78000,
    duration: "42:30",
    publishedAt: new Date(Date.now() - 86400000 * 40).toISOString(),
  },
];

const mockPlaylists = [
  {
    id: "pl1",
    title: "Next.js Complete Course",
    thumbnail: "https://picsum.photos/seed/pl1/640/360",
    videoCount: 24,
    views: 890000,
  },
  {
    id: "pl2",
    title: "React Hooks Masterclass",
    thumbnail: "https://picsum.photos/seed/pl2/640/360",
    videoCount: 18,
    views: 567000,
  },
  {
    id: "pl3",
    title: "TypeScript for Beginners",
    thumbnail: "https://picsum.photos/seed/pl3/640/360",
    videoCount: 12,
    views: 345000,
  },
  {
    id: "pl4",
    title: "DevOps Fundamentals",
    thumbnail: "https://picsum.photos/seed/pl4/640/360",
    videoCount: 15,
    views: 234000,
  },
];

function formatNumber(num: number): string {
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
  if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K`;
  return num.toString();
}

function timeAgo(date: string): string {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days} days ago`;
  const months = Math.floor(days / 30);
  return `${months} months ago`;
}

type ChannelTab = "videos" | "playlists" | "about";

export default function ChannelPage() {
  const [channel] = useState(mockChannel);
  const [activeTab, setActiveTab] = useState<ChannelTab>("videos");
  const [subscribed, setSubscribed] = useState(false);
  const [sortBy, setSortBy] = useState<"newest" | "popular">("newest");

  const sortedVideos = useMemo(() => {
    const videos = [...mockVideos];
    if (sortBy === "popular") {
      videos.sort((a, b) => b.views - a.views);
    } else {
      videos.sort(
        (a, b) =>
          new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
      );
    }
    return videos;
  }, [sortBy]);

  const tabs = [
    { id: "videos" as const, label: "Videos" },
    { id: "playlists" as const, label: "Playlists" },
    { id: "about" as const, label: "About" },
  ];

  return (
    <div className="min-h-screen">
      {/* Cover image */}
      <div className="relative h-48 sm:h-64 lg:h-80 bg-zinc-900 overflow-hidden">
        <img
          src={channel.coverImage}
          alt={channel.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent" />
      </div>

      {/* Channel header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative -mt-16 sm:-mt-20 pb-6 border-b border-zinc-800">
          <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4">
            <img
              src={channel.avatar}
              alt={channel.name}
              className="w-24 h-24 sm:w-32 sm:h-32 rounded-full border-4 border-zinc-950 bg-zinc-800"
            />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-bold text-white">
                  {channel.name}
                </h1>
                {channel.isVerified && (
                  <svg className="w-5 h-5 text-zinc-500" fill="currentColor" viewBox="0 0 24 24">
                    <path fillRule="evenodd" clipRule="evenodd" d="M8.603 3.799A4.49 4.49 0 0112 2.25c1.357 0 2.573.6 3.397 1.549a4.49 4.49 0 013.498 1.307 4.491 4.491 0 011.307 3.497A4.49 4.49 0 0121.75 12a4.49 4.49 0 01-1.549 3.397 4.491 4.491 0 01-1.307 3.497 4.491 4.491 0 01-3.497 1.307A4.49 4.49 0 0112 21.75a4.49 4.49 0 01-3.397-1.549 4.49 4.49 0 01-3.498-1.306 4.491 4.491 0 01-1.307-3.498A4.49 4.49 0 012.25 12c0-1.357.6-2.573 1.549-3.397a4.49 4.49 0 011.307-3.497 4.49 4.49 0 013.497-1.307zm7.007 6.387a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z" />
                  </svg>
                )}
                {channel.isPartner && (
                  <span className="px-2 py-0.5 text-[10px] font-bold bg-purple-600/20 text-purple-400 rounded-full border border-purple-600/20">
                    PARTNER
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3 mt-2 text-sm text-zinc-400">
                <span>@{channel.slug}</span>
                <span>·</span>
                <span>{formatNumber(channel.subscriberCount)} subscribers</span>
                <span>·</span>
                <span>{channel.videoCount} videos</span>
              </div>
              <p className="mt-2 text-sm text-zinc-500 line-clamp-2 max-w-2xl">
                {channel.description}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setSubscribed(!subscribed)}
                className={`px-6 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  subscribed
                    ? "bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
                    : "bg-white text-black hover:bg-zinc-200"
                }`}
              >
                {subscribed ? "Subscribed" : "Subscribe"}
              </button>
              <button className="btn-icon">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 12.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 18.75a.75.75 0 110-1.5.75.75 0 010 1.5z" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Tabs and content */}
        <div className="py-6 space-y-6">
          <div className="flex items-center gap-1 p-1 bg-zinc-900 rounded-xl w-fit">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-5 py-2 text-sm font-medium rounded-lg transition-all ${
                  activeTab === tab.id
                    ? "bg-white/10 text-white"
                    : "text-zinc-500 hover:text-zinc-300"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Videos tab */}
          {activeTab === "videos" && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="section-title">
                  Videos
                  <span className="text-sm font-normal text-zinc-500 ml-2">
                    ({mockVideos.length})
                  </span>
                </h2>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setSortBy("newest")}
                    className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                      sortBy === "newest"
                        ? "bg-white/10 text-white"
                        : "text-zinc-500 hover:text-zinc-300"
                    }`}
                  >
                    Newest
                  </button>
                  <button
                    onClick={() => setSortBy("popular")}
                    className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                      sortBy === "popular"
                        ? "bg-white/10 text-white"
                        : "text-zinc-500 hover:text-zinc-300"
                    }`}
                  >
                    Popular
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 stagger-in">
                {sortedVideos.map((video) => (
                  <Link
                    key={video.id}
                    href={`/videos/${video.id}`}
                    className="group"
                  >
                    <div className="relative aspect-video rounded-xl overflow-hidden bg-zinc-800">
                      <img
                        src={video.thumbnail}
                        alt={video.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                      <span className="absolute bottom-2 right-2 px-2 py-1 text-xs font-medium bg-black/80 text-white rounded">
                        {video.duration}
                      </span>
                      {video.aiGenerated && (
                        <span className="absolute top-2 right-2 badge-ai text-[10px] py-0.5">
                          AI
                        </span>
                      )}
                    </div>
                    <div className="mt-2 px-1">
                      <h3 className="text-sm font-medium text-white line-clamp-2 group-hover:text-primary transition-colors">
                        {video.title}
                      </h3>
                      <div className="flex items-center gap-2 mt-1 text-xs text-zinc-500">
                        <span>{formatNumber(video.views)} views</span>
                        <span>·</span>
                        <span>{timeAgo(video.publishedAt)}</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Playlists tab */}
          {activeTab === "playlists" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 stagger-in">
              {mockPlaylists.map((playlist) => (
                <div key={playlist.id} className="group cursor-pointer">
                  <div className="relative aspect-video rounded-xl overflow-hidden bg-zinc-800">
                    <img
                      src={playlist.thumbnail}
                      alt={playlist.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <svg className="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 to-transparent">
                      <div className="flex items-center gap-1 text-xs text-zinc-300">
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3.375 19.5h17.25m-17.25 0a1.125 1.125 0 01-1.125-1.125M3.375 19.5h1.5C5.496 19.5 6 18.996 6 18.375m-3.75 0V5.625m0 12.75v-1.5c0-.621.504-1.125 1.125-1.125m18.375 2.625V5.625m0 12.75c0 .621-.504 1.125-1.125 1.125m1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125m0 3.75h-1.5A1.125 1.125 0 0118 18.375M20.625 4.5H3.375m17.25 0c.621 0 1.125.504 1.125 1.125M20.625 4.5h-1.5C18.504 4.5 18 5.004 18 5.625m3.75 0v1.5c0 .621-.504 1.125-1.125 1.125M3.375 4.5c-.621 0-1.125.504-1.125 1.125M3.375 4.5h1.5C5.496 4.5 6 5.004 6 5.625m-3.75 0v1.5c0 .621.504 1.125 1.125 1.125m0 0h1.5m-1.5 0c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125m1.5-3.75C5.496 8.25 6 7.746 6 7.125v-1.5M4.875 8.25C5.496 8.25 6 8.754 6 9.375v1.5m0-5.25v5.25m0-5.25C6 5.004 6.504 4.5 7.125 4.5h9.75c.621 0 1.125.504 1.125 1.125m1.125 2.625h1.5m-1.5 0A1.125 1.125 0 0118 7.125v-1.5m1.125 2.625c-.621 0-1.125.504-1.125 1.125v1.5m2.625-2.625c.621 0 1.125.504 1.125 1.125v1.5c0 .621-.504 1.125-1.125 1.125M18 5.625v5.25M7.125 12h9.75m-9.75 0A1.125 1.125 0 016 10.875M7.125 12C6.504 12 6 12.504 6 13.125m0-2.25C6 11.496 5.496 12 4.875 12M18 10.875c0 .621-.504 1.125-1.125 1.125M18 10.875c0 .621.504 1.125 1.125 1.125m-2.25 0c.621 0 1.125.504 1.125 1.125m-12 5.25v-5.25m0 5.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125m-12 0v-1.5c0-.621-.504-1.125-1.125-1.125M18 18.375v-5.25m0 5.25v-1.5c0-.621.504-1.125 1.125-1.125M18 13.125v1.5c0 .621.504 1.125 1.125 1.125M18 13.125c0-.621.504-1.125 1.125-1.125M6 13.125v1.5c0 .621-.504 1.125-1.125 1.125M6 13.125C6 12.504 5.496 12 4.875 12m-1.5 0h1.5m-1.5 0c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125M19.125 12h1.5m0 0c.621 0 1.125.504 1.125 1.125v1.5c0 .621-.504 1.125-1.125 1.125m-17.25 0h1.5m14.25 0h1.5" />
                        </svg>
                        <span>{playlist.videoCount} videos</span>
                      </div>
                    </div>
                  </div>
                  <div className="mt-2 px-1">
                    <h3 className="text-sm font-medium text-white group-hover:text-primary transition-colors">
                      {playlist.title}
                    </h3>
                    <p className="text-xs text-zinc-500 mt-0.5">
                      {formatNumber(playlist.views)} views
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* About tab */}
          {activeTab === "about" && (
            <div className="max-w-2xl space-y-8">
              <div>
                <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-3">
                  Description
                </h3>
                <p className="text-sm text-zinc-300 leading-relaxed whitespace-pre-wrap">
                  {channel.description}
                </p>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-3">
                  Stats
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-3 text-zinc-300">
                    <svg className="w-4 h-4 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                    </svg>
                    <span>Joined {new Date(channel.joinedDate).toLocaleDateString("en-US", { month: "long", year: "numeric" })}</span>
                  </div>
                  <div className="flex items-center gap-3 text-zinc-300">
                    <svg className="w-4 h-4 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                    </svg>
                    <span>{channel.location}</span>
                  </div>
                  <div className="flex items-center gap-3 text-zinc-300">
                    <svg className="w-4 h-4 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
                    </svg>
                    <a href={channel.website} className="text-primary hover:text-primary/80 transition-colors">
                      {channel.website}
                    </a>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-3">
                  Links
                </h3>
                <div className="flex items-center gap-3">
                  {channel.socialLinks.twitter && (
                    <a
                      href={channel.socialLinks.twitter}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 rounded-xl bg-zinc-800 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-zinc-700 transition-colors"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                      </svg>
                    </a>
                  )}
                  {channel.socialLinks.github && (
                    <a
                      href={channel.socialLinks.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 rounded-xl bg-zinc-800 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-zinc-700 transition-colors"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path
                          fillRule="evenodd"
                          clipRule="evenodd"
                          d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                        />
                      </svg>
                    </a>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
