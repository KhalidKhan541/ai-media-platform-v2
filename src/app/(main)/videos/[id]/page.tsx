"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import VideoPlayer from "@/components/videos/video-player";
import CommentSection from "@/components/videos/comment-section";

const mockVideo = {
  id: "1",
  title: "Building AI Apps with Next.js 14 and OpenAI - Complete Tutorial",
  description:
    "In this comprehensive tutorial, we'll build a full-stack AI application using Next.js 14, OpenAI, and Tailwind CSS. We cover everything from setup to deployment, including server actions, streaming responses, and best practices for AI integration.\n\nTimestamps:\n0:00 - Introduction\n2:15 - Project Setup\n8:30 - OpenAI Integration\n15:45 - Server Actions\n22:00 - Streaming Responses\n28:15 - UI/UX Design\n35:00 - Deployment",
  thumbnail: "https://picsum.photos/seed/viddetail1/1280/720",
  channelName: "Code Academy",
  channelAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=CodeAcademy",
  channelSubscribers: 245000,
  views: 245000,
  likeCount: 12400,
  commentCount: 892,
  publishedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  duration: "24:35",
  tags: ["nextjs", "openai", "tutorial", "ai", "react"],
  aiGenerated: true,
  isSubscribed: false,
  sources: [
    { quality: "1080p", url: "/videos/sample-1080p.mp4" },
    { quality: "720p", url: "/videos/sample-720p.mp4" },
    { quality: "480p", url: "/videos/sample-480p.mp4" },
  ],
};

const mockComments = [
  {
    id: "c1",
    author: "dev_sarah",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah",
    content: "This is exactly what I needed! The server actions section was incredibly helpful.",
    timestamp: new Date(Date.now() - 86400000).toISOString(),
    likes: 45,
    isLiked: false,
    replies: [
      {
        id: "c1r1",
        author: "code_academy",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=CodeAcademy",
        content: "Thanks Sarah! Glad it helped. More server actions content coming soon!",
        timestamp: new Date(Date.now() - 3600000 * 12).toISOString(),
        likes: 12,
        isLiked: true,
      },
    ],
  },
  {
    id: "c2",
    author: "tech_explorer",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=TechExplorer",
    content: "The streaming responses part is game-changing. I've been using regular fetch and didn't realize how much better streaming could be for UX.",
    timestamp: new Date(Date.now() - 86400000 * 2).toISOString(),
    likes: 32,
    isLiked: true,
  },
  {
    id: "c3",
    author: "junior_dev_42",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=JuniorDev",
    content: "Can you do a follow-up video on handling rate limiting and error states with OpenAI? That would be super helpful!",
    timestamp: new Date(Date.now() - 86400000 * 3).toISOString(),
    likes: 28,
    isLiked: false,
    replies: [
      {
        id: "c3r1",
        author: "code_academy",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=CodeAcademy",
        content: "Great suggestion! I'll add that to my list. Stay tuned!",
        timestamp: new Date(Date.now() - 86400000 * 2.5).toISOString(),
        likes: 8,
        isLiked: false,
      },
    ],
  },
  {
    id: "c4",
    author: "ai_enthusiast",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=AIEnthusiast",
    content: "The AI-generated captions are surprisingly accurate. Nice touch adding that feature!",
    timestamp: new Date(Date.now() - 86400000 * 4).toISOString(),
    likes: 19,
    isLiked: false,
  },
];

const relatedVideos = [
  {
    id: "2",
    title: "Tailwind CSS v4 - Everything You Need to Know",
    thumbnail: "https://picsum.photos/seed/rel1/640/360",
    channelName: "Design Dev",
    views: 182000,
    duration: "18:22",
    uploadedAt: new Date(Date.now() - 86400000 * 3).toISOString(),
  },
  {
    id: "3",
    title: "React Server Components - The Future",
    thumbnail: "https://picsum.photos/seed/rel2/640/360",
    channelName: "React Masters",
    views: 314000,
    duration: "32:10",
    uploadedAt: new Date(Date.now() - 86400000 * 5).toISOString(),
  },
  {
    id: "4",
    title: "Docker & Kubernetes for Beginners",
    thumbnail: "https://picsum.photos/seed/rel3/640/360",
    channelName: "DevOps Daily",
    views: 421000,
    duration: "1:45:30",
    uploadedAt: new Date(Date.now() - 86400000 * 7).toISOString(),
  },
  {
    id: "5",
    title: "TypeScript 5.4 Deep Dive",
    thumbnail: "https://picsum.photos/seed/rel4/640/360",
    channelName: "TypeScript Hub",
    views: 156000,
    duration: "22:15",
    uploadedAt: new Date(Date.now() - 86400000 * 10).toISOString(),
  },
  {
    id: "6",
    title: "Building Real-time Chat with WebSockets",
    thumbnail: "https://picsum.photos/seed/rel5/640/360",
    channelName: "Full Stack Dev",
    views: 89000,
    duration: "45:20",
    uploadedAt: new Date(Date.now() - 86400000 * 12).toISOString(),
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

export default function VideoDetailPage() {
  const [video] = useState(mockVideo);
  const [comments, setComments] = useState(mockComments);
  const [liked, setLiked] = useState(false);
  const [disliked, setDisliked] = useState(false);
  const [subscribed, setSubscribed] = useState(video.isSubscribed);
  const [showDescription, setShowDescription] = useState(false);
  const [activeTab, setActiveTab] = useState<"comments" | "ai">("comments");

  const handleLike = useCallback(() => {
    setLiked((prev) => !prev);
    if (disliked) setDisliked(false);
  }, [disliked]);

  const handleDislike = useCallback(() => {
    setDisliked((prev) => !prev);
    if (liked) setLiked(false);
  }, [liked]);

  const handleAddComment = useCallback((content: string) => {
    const newComment = {
      id: `c${Date.now()}`,
      author: "you",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=you",
      content,
      timestamp: new Date().toISOString(),
      likes: 0,
      isLiked: false,
    };
    setComments((prev) => [newComment, ...prev]);
  }, []);

  const handleReply = useCallback((parentId: string, content: string) => {
    setComments((prev) =>
      prev.map((c) =>
        c.id === parentId
          ? {
              ...c,
              replies: [
                ...(c.replies || []),
                {
                  id: `r${Date.now()}`,
                  author: "you",
                  avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=you",
                  content,
                  timestamp: new Date().toISOString(),
                  likes: 0,
                  isLiked: false,
                },
              ],
            }
          : c
      )
    );
  }, []);

  const handleLikeComment = useCallback((commentId: string) => {
    setComments((prev) =>
      prev.map((c) => {
        if (c.id === commentId) {
          return { ...c, likes: c.likes + 1, isLiked: !c.isLiked };
        }
        if (c.replies) {
          return {
            ...c,
            replies: c.replies.map((r) =>
              r.id === commentId
                ? { ...r, likes: r.likes + 1, isLiked: !r.isLiked }
                : r
            ),
          };
        }
        return c;
      })
    );
  }, []);

  return (
    <div className="p-4 lg:p-8">
      <div className="grid lg:grid-cols-[1fr_400px] gap-6 max-w-[1600px] mx-auto">
        {/* Main content */}
        <div className="space-y-4">
          <VideoPlayer
            title={video.title}
            sources={video.sources}
            thumbnail={video.thumbnail}
          />

          {/* Video info */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div className="space-y-2">
                <h1 className="text-xl font-bold text-white leading-tight">
                  {video.title}
                </h1>
                <div className="flex items-center gap-2 text-sm text-zinc-400">
                  <span>{formatNumber(video.views)} views</span>
                  <span>·</span>
                  <span>{timeAgo(video.publishedAt)}</span>
                  {video.aiGenerated && (
                    <>
                      <span>·</span>
                      <span className="badge-ai text-[10px] py-0.5">AI Generated</span>
                    </>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex items-center bg-zinc-900 rounded-xl border border-zinc-800">
                  <button
                    onClick={handleLike}
                    className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-l-xl transition-colors ${
                      liked
                        ? "text-primary bg-primary/10"
                        : "text-zinc-400 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    <svg className="w-5 h-5" fill={liked ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6.633 10.5c.806 0 1.533-.446 2.031-1.08a9.041 9.041 0 012.861-2.4c.723-.384 1.35-.956 1.653-1.715a4.498 4.498 0 00.322-1.672V3.75a.75.75 0 01.75-.75A2.25 2.25 0 0116.5 5.25c0 1.152-.26 2.243-.723 3.218-.266.558.107 1.282.725 1.282h3.126c1.026 0 1.945.694 2.054 1.715.045.422.068.85.068 1.285a11.95 11.95 0 01-2.649 7.521c-.388.482-.987.729-1.605.729H14.23c-.483 0-.964-.078-1.423-.23l-3.114-1.04a4.501 4.501 0 00-1.423-.23H5.904M14.25 9h2.25M5.904 18.75c.083.205.173.405.27.602.197.4-.078.898-.523.898h-.908c-.889 0-1.713-.518-1.972-1.368a12 12 0 01-.521-3.507c0-1.553.295-3.036.831-4.398C3.387 10.69 4.167 10.5 5 10.5h.587" />
                    </svg>
                    {formatNumber(video.likeCount + (liked ? 1 : 0))}
                  </button>
                  <div className="w-px h-6 bg-zinc-800" />
                  <button
                    onClick={handleDislike}
                    className={`px-4 py-2.5 rounded-r-xl transition-colors ${
                      disliked
                        ? "text-red-400 bg-red-400/10"
                        : "text-zinc-400 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    <svg className="w-5 h-5 rotate-180" fill={disliked ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6.633 10.5c.806 0 1.533-.446 2.031-1.08a9.041 9.041 0 012.861-2.4c.723-.384 1.35-.956 1.653-1.715a4.498 4.498 0 00.322-1.672V3.75a.75.75 0 01.75-.75A2.25 2.25 0 0116.5 5.25c0 1.152-.26 2.243-.723 3.218-.266.558.107 1.282.725 1.282h3.126c1.026 0 1.945.694 2.054 1.715.045.422.068.85.068 1.285a11.95 11.95 0 01-2.649 7.521c-.388.482-.987.729-1.605.729H14.23c-.483 0-.964-.078-1.423-.23l-3.114-1.04a4.501 4.501 0 00-1.423-.23H5.904M14.25 9h2.25M5.904 18.75c.083.205.173.405.27.602.197.4-.078.898-.523.898h-.908c-.889 0-1.713-.518-1.972-1.368a12 12 0 01-.521-3.507c0-1.553.295-3.036.831-4.398C3.387 10.69 4.167 10.5 5 10.5h.587" />
                    </svg>
                  </button>
                </div>

                <button className="flex items-center gap-2 px-4 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-sm font-medium text-zinc-400 hover:text-white hover:bg-white/5 transition-colors">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z" />
                  </svg>
                  Share
                </button>

                <button className="flex items-center gap-2 px-4 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-sm font-medium text-zinc-400 hover:text-white hover:bg-white/5 transition-colors">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                  </svg>
                  Download
                </button>
              </div>
            </div>

            {/* Channel info */}
            <div className="flex items-center justify-between py-4 border-y border-zinc-800">
              <Link href="/channels/ch1" className="flex items-center gap-3 group">
                <img
                  src={video.channelAvatar}
                  alt={video.channelName}
                  className="w-12 h-12 rounded-full bg-zinc-800"
                />
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-semibold text-white group-hover:text-primary transition-colors">
                      {video.channelName}
                    </span>
                    <svg className="w-4 h-4 text-zinc-500" fill="currentColor" viewBox="0 0 24 24">
                      <path fillRule="evenodd" clipRule="evenodd" d="M8.603 3.799A4.49 4.49 0 0112 2.25c1.357 0 2.573.6 3.397 1.549a4.49 4.49 0 013.498 1.307 4.491 4.491 0 011.307 3.497A4.49 4.49 0 0121.75 12a4.49 4.49 0 01-1.549 3.397 4.491 4.491 0 01-1.307 3.497 4.491 4.491 0 01-3.497 1.307A4.49 4.49 0 0112 21.75a4.49 4.49 0 01-3.397-1.549 4.49 4.49 0 01-3.498-1.306 4.491 4.491 0 01-1.307-3.498A4.49 4.49 0 012.25 12c0-1.357.6-2.573 1.549-3.397a4.49 4.49 0 011.307-3.497 4.49 4.49 0 013.497-1.307zm7.007 6.387a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z" />
                    </svg>
                  </div>
                  <p className="text-xs text-zinc-500">
                    {formatNumber(video.channelSubscribers)} subscribers
                  </p>
                </div>
              </Link>
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
            </div>

            {/* Description */}
            <div
              className={`card p-4 cursor-pointer ${showDescription ? "" : "max-h-24 overflow-hidden relative"}`}
              onClick={() => setShowDescription(!showDescription)}
            >
              <div className="flex items-center gap-2 text-sm font-medium text-white mb-2">
                <span>{timeAgo(video.publishedAt)}</span>
                <span>·</span>
                <span>{formatNumber(video.views)} views</span>
              </div>
              <p className="text-sm text-zinc-300 whitespace-pre-wrap leading-relaxed">
                {video.description}
              </p>
              {!showDescription && (
                <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-zinc-900 to-transparent" />
              )}
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-2">
              {video.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1.5 text-xs font-medium bg-zinc-800 text-zinc-300 rounded-full border border-zinc-700 hover:bg-zinc-700 transition-colors cursor-pointer"
                >
                  #{tag}
                </span>
              ))}
            </div>

            {/* Tabs: Comments / AI */}
            <div className="flex items-center gap-1 p-1 bg-zinc-900 rounded-xl w-fit">
              <button
                onClick={() => setActiveTab("comments")}
                className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                  activeTab === "comments"
                    ? "bg-white/10 text-white"
                    : "text-zinc-500 hover:text-zinc-300"
                }`}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
                </svg>
                Comments
                <span className="text-[10px] text-zinc-500">({video.commentCount})</span>
              </button>
              <button
                onClick={() => setActiveTab("ai")}
                className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                  activeTab === "ai"
                    ? "bg-violet-500/10 text-violet-400"
                    : "text-zinc-500 hover:text-zinc-300"
                }`}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                </svg>
                AI Summary
              </button>
            </div>

            {/* Content */}
            {activeTab === "comments" ? (
              <CommentSection
                videoId={video.id}
                comments={comments}
                totalComments={video.commentCount}
                onAddComment={handleAddComment}
                onReply={handleReply}
                onLike={handleLikeComment}
              />
            ) : (
              <div className="card p-6 space-y-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-violet-500/20 flex items-center justify-center">
                    <svg className="w-4 h-4 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                    </svg>
                  </div>
                  <h3 className="text-sm font-semibold text-white">AI-Generated Summary</h3>
                </div>
                <div className="text-sm text-zinc-300 leading-relaxed space-y-3">
                  <p>
                    This comprehensive tutorial covers building AI applications with Next.js 14 and OpenAI.
                    The video walks through the entire development process, from initial project setup to
                    production deployment.
                  </p>
                  <p>
                    <strong className="text-white">Key Topics:</strong>
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-zinc-400">
                    <li>Project configuration with Next.js 14 App Router</li>
                    <li>OpenAI API integration with streaming responses</li>
                    <li>Server Actions for form handling</li>
                    <li>UI/UX best practices for AI interfaces</li>
                    <li>Deployment strategies on Vercel</li>
                  </ul>
                  <p>
                    <strong className="text-white">Key Takeaway:</strong> Server Actions combined with streaming
                    provide the best UX for AI-powered applications, reducing latency and improving perceived
                    performance.
                  </p>
                </div>
                <button className="btn-ghost text-xs text-violet-400 hover:text-violet-300">
                  Generate new summary
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar - Related videos */}
        <div className="space-y-4">
          <h3 className="section-title">Related Videos</h3>
          <div className="space-y-3">
            {relatedVideos.map((v) => (
              <Link
                key={v.id}
                href={`/videos/${v.id}`}
                className="flex gap-3 group"
              >
                <div className="relative flex-shrink-0 w-40 aspect-video rounded-lg overflow-hidden bg-zinc-800">
                  <img
                    src={v.thumbnail}
                    alt={v.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                  <span className="absolute bottom-1 right-1 px-1.5 py-0.5 text-[10px] font-medium bg-black/80 text-white rounded">
                    {v.duration}
                  </span>
                </div>
                <div className="flex flex-col min-w-0 py-0.5">
                  <h4 className="text-sm font-medium text-white line-clamp-2 group-hover:text-primary transition-colors">
                    {v.title}
                  </h4>
                  <p className="mt-1 text-xs text-zinc-500">{v.channelName}</p>
                  <p className="text-xs text-zinc-600">
                    {formatNumber(v.views)} views · {timeAgo(v.uploadedAt)}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
