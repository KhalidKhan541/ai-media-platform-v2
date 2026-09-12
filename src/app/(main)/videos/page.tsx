"use client";

import { useState, useMemo, useCallback } from "react";
import Link from "next/link";
import VideoGrid from "@/components/videos/video-grid";

interface Video {
  id: string;
  title: string;
  thumbnail: string;
  channelName: string;
  channelAvatar: string;
  views: number;
  duration: string;
  uploadedAt: string;
  isLive?: boolean;
  tags?: string[];
  aiGenerated?: boolean;
}

const mockVideos: Video[] = [
  {
    id: "1",
    title: "Building AI Apps with Next.js 14 and OpenAI - Complete Tutorial",
    thumbnail: "https://picsum.photos/seed/video1/640/360",
    channelName: "Code Academy",
    channelAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=CodeAcademy",
    views: 245000,
    duration: "24:35",
    uploadedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    tags: ["nextjs", "openai", "tutorial"],
    aiGenerated: true,
  },
  {
    id: "2",
    title: "Tailwind CSS v4 - Everything You Need to Know",
    thumbnail: "https://picsum.photos/seed/video2/640/360",
    channelName: "Design Dev",
    channelAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=DesignDev",
    views: 182000,
    duration: "18:22",
    uploadedAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    tags: ["tailwind", "css", "frontend"],
  },
  {
    id: "3",
    title: "React Server Components - The Future of Web Development",
    thumbnail: "https://picsum.photos/seed/video3/640/360",
    channelName: "React Masters",
    channelAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=ReactMasters",
    views: 314000,
    duration: "32:10",
    uploadedAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    tags: ["react", "rsc", "nextjs"],
  },
  {
    id: "4",
    title: "Docker & Kubernetes for Beginners - Complete Course",
    thumbnail: "https://picsum.photos/seed/video4/640/360",
    channelName: "DevOps Daily",
    channelAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=DevOpsDaily",
    views: 421000,
    duration: "1:45:30",
    uploadedAt: new Date(Date.now() - 86400000 * 7).toISOString(),
    tags: ["docker", "kubernetes", "devops"],
  },
  {
    id: "5",
    title: "TypeScript 5.4 Deep Dive - New Features Explained",
    thumbnail: "https://picsum.photos/seed/video5/640/360",
    channelName: "TypeScript Hub",
    channelAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=TSHub",
    views: 156000,
    duration: "22:15",
    uploadedAt: new Date(Date.now() - 86400000 * 10).toISOString(),
    tags: ["typescript", "javascript"],
    aiGenerated: true,
  },
  {
    id: "6",
    title: "Building a Real-time Chat App with WebSockets",
    thumbnail: "https://picsum.photos/seed/video6/640/360",
    channelName: "Full Stack Dev",
    channelAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=FullStackDev",
    views: 89000,
    duration: "45:20",
    uploadedAt: new Date(Date.now() - 86400000 * 12).toISOString(),
    tags: ["websockets", "nodejs", "realtime"],
  },
  {
    id: "7",
    title: "CSS Grid vs Flexbox - When to Use Each",
    thumbnail: "https://picsum.photos/seed/video7/640/360",
    channelName: "CSS Wizards",
    channelAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=CSSWizards",
    views: 67000,
    duration: "15:45",
    uploadedAt: new Date(Date.now() - 86400000 * 14).toISOString(),
    tags: ["css", "layout", "frontend"],
  },
  {
    id: "8",
    title: "Git Advanced - Rebase, Cherry-pick, and Interactive Staging",
    thumbnail: "https://picsum.photos/seed/video8/640/360",
    channelName: "Git Pro",
    channelAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=GitPro",
    views: 123000,
    duration: "28:00",
    uploadedAt: new Date(Date.now() - 86400000 * 16).toISOString(),
    tags: ["git", "workflow"],
  },
  {
    id: "9",
    title: "PostgreSQL Performance Optimization - Advanced Tips",
    thumbnail: "https://picsum.photos/seed/video9/640/360",
    channelName: "Database Daily",
    channelAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=DBDaily",
    views: 45000,
    duration: "35:10",
    uploadedAt: new Date(Date.now() - 86400000 * 18).toISOString(),
    tags: ["postgresql", "database", "performance"],
  },
  {
    id: "10",
    title: "The Complete Guide to REST API Design",
    thumbnail: "https://picsum.photos/seed/video10/640/360",
    channelName: "API Academy",
    channelAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=APIAcademy",
    views: 78000,
    duration: "42:30",
    uploadedAt: new Date(Date.now() - 86400000 * 20).toISOString(),
    tags: ["api", "rest", "backend"],
    aiGenerated: true,
  },
  {
    id: "11",
    title: "State Management in 2024 - Redux vs Zustand vs Jotai",
    thumbnail: "https://picsum.photos/seed/video11/640/360",
    channelName: "React Masters",
    channelAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=ReactMasters",
    views: 198000,
    duration: "26:40",
    uploadedAt: new Date(Date.now() - 86400000 * 22).toISOString(),
    tags: ["react", "state-management"],
  },
  {
    id: "12",
    title: "Linux Command Line - From Beginner to Power User",
    thumbnail: "https://picsum.photos/seed/video12/640/360",
    channelName: "Terminal Pro",
    channelAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=TerminalPro",
    views: 267000,
    duration: "58:15",
    uploadedAt: new Date(Date.now() - 86400000 * 25).toISOString(),
    tags: ["linux", "terminal", "devops"],
  },
];

type TabType = "all" | "uploaded" | "ai" | "live";

export default function VideosPage() {
  const [activeTab, setActiveTab] = useState<TabType>("all");

  const tabs = [
    { id: "all" as const, label: "All Videos", count: mockVideos.length },
    { id: "uploaded" as const, label: "Uploaded", count: mockVideos.filter((v) => !v.aiGenerated).length },
    { id: "ai" as const, label: "AI Generated", count: mockVideos.filter((v) => v.aiGenerated).length },
    { id: "live" as const, label: "Live", count: mockVideos.filter((v) => v.isLive).length },
  ];

  const filteredVideos = useMemo(() => {
    switch (activeTab) {
      case "ai":
        return mockVideos.filter((v) => v.aiGenerated);
      case "live":
        return mockVideos.filter((v) => v.isLive);
      case "uploaded":
        return mockVideos.filter((v) => !v.aiGenerated);
      default:
        return mockVideos;
    }
  }, [activeTab]);

  const handleVideoPlay = useCallback((id: string) => {
    window.location.href = `/videos/${id}`;
  }, []);

  return (
    <div className="p-4 lg:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Videos</h1>
          <p className="text-sm text-zinc-400 mt-1">
            Manage and explore your video library.
          </p>
        </div>
        <Link href="/videos/upload" className="btn-primary">
          <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Upload Video
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 p-1 bg-zinc-900 rounded-xl w-fit">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all ${
              activeTab === tab.id
                ? "bg-white/10 text-white"
                : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            {tab.label}
            <span
              className={`px-1.5 py-0.5 text-[10px] font-semibold rounded-full ${
                activeTab === tab.id
                  ? "bg-white/20 text-white"
                  : "bg-zinc-800 text-zinc-500"
              }`}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* AI Tools Banner */}
      <div className="card p-5 bg-gradient-to-r from-violet-500/10 via-transparent to-pink-500/10 border-violet-500/20">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-violet-500/20 flex items-center justify-center flex-shrink-0">
            <svg className="w-6 h-6 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z" />
            </svg>
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-white">AI Video Enhancement</h3>
            <p className="text-xs text-zinc-400 mt-1">
              Automatically enhance video quality, add captions, and generate thumbnails with our AI tools.
            </p>
          </div>
          <button className="btn-secondary text-xs px-4 py-2">
            Try AI Tools
          </button>
        </div>
      </div>

      {/* Video Grid */}
      <VideoGrid
        videos={filteredVideos}
        columns={4}
        onVideoPlay={handleVideoPlay}
      />
    </div>
  );
}
