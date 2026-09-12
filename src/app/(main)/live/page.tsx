"use client";

import { useState, useMemo } from "react";
import LiveCard from "@/components/live/live-card";

interface Stream {
  id: string;
  title: string;
  thumbnail: string;
  streamerName: string;
  streamerAvatar: string;
  viewerCount: number;
  category: string;
  tags: string[];
  startedAt: string;
  isLive: boolean;
  duration?: string;
  language?: string;
}

const mockStreams: Stream[] = [
  {
    id: "ls1",
    title: "Building a Full-Stack App LIVE - Next.js + Prisma + Supabase",
    thumbnail: "https://picsum.photos/seed/stream1/640/360",
    streamerName: "Code Academy",
    streamerAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=CodeAcademy",
    viewerCount: 12450,
    category: "Programming",
    tags: ["nextjs", "fullstack", "livecoding"],
    startedAt: new Date(Date.now() - 8640000 * 2).toISOString(),
    isLive: true,
    duration: "2h 15m",
    language: "en",
  },
  {
    id: "ls2",
    title: "AI Art Generation Stream - Creating Stunning Visuals",
    thumbnail: "https://picsum.photos/seed/stream2/640/360",
    streamerName: "Artificial Arts",
    streamerAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=ArtificialArts",
    viewerCount: 8920,
    category: "Art & Design",
    tags: ["ai-art", "midjourney", "creative"],
    startedAt: new Date(Date.now() - 3600000 * 3).toISOString(),
    isLive: true,
    duration: "3h 02m",
    language: "en",
  },
  {
    id: "ls3",
    title: "Weekend Game Dev - Building a Platformer with Unity",
    thumbnail: "https://picsum.photos/seed/stream3/640/360",
    streamerName: "Game Dev Live",
    streamerAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=GameDevLive",
    viewerCount: 5670,
    category: "Gaming",
    tags: ["gamedev", "unity", "indie"],
    startedAt: new Date(Date.now() - 8640000 * 1.5).toISOString(),
    isLive: true,
    duration: "1h 30m",
    language: "en",
  },
  {
    id: "ls4",
    title: "Data Science Workshop - Machine Learning from Scratch",
    thumbnail: "https://picsum.photos/seed/stream4/640/360",
    streamerName: "Data Insights",
    streamerAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=DataInsights",
    viewerCount: 3210,
    category: "Education",
    tags: ["datascience", "ml", "python"],
    startedAt: new Date(Date.now() - 3600000 * 4).toISOString(),
    isLive: true,
    duration: "4h 10m",
    language: "en",
  },
  {
    id: "ls5",
    title: "Music Production Live - Creating a Lo-fi Beat",
    thumbnail: "https://picsum.photos/seed/stream5/640/360",
    streamerName: "Beat Maker",
    streamerAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=BeatMaker",
    viewerCount: 7840,
    category: "Music",
    tags: ["music", "lofi", "production"],
    startedAt: new Date(Date.now() - 8640000 * 0.5).toISOString(),
    isLive: true,
    duration: "45m",
    language: "en",
  },
  {
    id: "ls6",
    title: "UX Design Sprint - Redesigning a SaaS Dashboard",
    thumbnail: "https://picsum.photos/seed/stream6/640/360",
    streamerName: "Design Hub",
    streamerAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=DesignHub",
    viewerCount: 2890,
    category: "Design",
    tags: ["ux", "figma", "saas"],
    startedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    isLive: true,
    duration: "2h 05m",
    language: "en",
  },
  {
    id: "ls7",
    title: "Cooking Stream - Asian Fusion Recipes",
    thumbnail: "https://picsum.photos/seed/stream7/640/360",
    streamerName: "Chef Studio",
    streamerAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=ChefStudio",
    viewerCount: 15600,
    category: "Cooking",
    tags: ["cooking", "asian", "recipes"],
    startedAt: new Date(Date.now() - 8640000 * 1).toISOString(),
    isLive: true,
    duration: "1h 15m",
    language: "en",
  },
  {
    id: "ls8",
    title: "Crypto & Web3 Discussion - Market Analysis",
    thumbnail: "https://picsum.photos/seed/stream8/640/360",
    streamerName: "Crypto Insights",
    streamerAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=CryptoInsights",
    viewerCount: 9340,
    category: "Finance",
    tags: ["crypto", "web3", "trading"],
    startedAt: new Date(Date.now() - 3600000 * 5).toISOString(),
    isLive: true,
    duration: "5h 30m",
    language: "en",
  },
];

const categories = [
  "All",
  "Programming",
  "Art & Design",
  "Gaming",
  "Education",
  "Music",
  "Cooking",
  "Finance",
  "Science",
  "Fitness",
];

export default function LivePage() {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sortBy, setSortBy] = useState<"viewers" | "recent">("viewers");

  const filteredStreams = useMemo(() => {
    let result = [...mockStreams];

    if (selectedCategory !== "All") {
      result = result.filter((s) => s.category === selectedCategory);
    }

    if (sortBy === "viewers") {
      result.sort((a, b) => b.viewerCount - a.viewerCount);
    } else {
      result.sort(
        (a, b) =>
          new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime()
      );
    }

    return result;
  }, [selectedCategory, sortBy]);

  const totalViewers = mockStreams.reduce((sum, s) => sum + s.viewerCount, 0);

  return (
    <div className="p-4 lg:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-white">Live Streams</h1>
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-red-600/10 rounded-full">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
              </span>
              <span className="text-xs font-semibold text-red-400">
                {mockStreams.length} LIVE
              </span>
            </div>
          </div>
          <p className="text-sm text-zinc-400 mt-1">
            {totalViewers.toLocaleString()} viewers watching now
          </p>
        </div>
        <button className="btn-primary">
          <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5m.75-9l3-3 2.148 2.148A12.061 12.061 0 0116.5 7.605" />
          </svg>
          Go Live
        </button>
      </div>

      {/* Featured stream */}
      {mockStreams.length > 0 && (
        <div className="card overflow-hidden bg-gradient-to-r from-red-500/5 via-transparent to-purple-500/5 border-red-500/10">
          <div className="flex flex-col lg:flex-row">
            <div className="relative lg:w-2/3 aspect-video bg-zinc-800">
              <img
                src={mockStreams[0].thumbnail}
                alt={mockStreams[0].title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-20 h-20 rounded-full bg-red-600/80 backdrop-blur-md flex items-center justify-center hover:bg-red-500 transition-colors shadow-2xl cursor-pointer">
                  <svg className="w-10 h-10 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </div>
              </div>
              <div className="absolute top-4 left-4 flex items-center gap-2">
                <span className="badge-live">LIVE</span>
                <span className="px-2 py-1 text-xs font-medium bg-black/60 text-white rounded backdrop-blur-sm">
                  {mockStreams[0].duration}
                </span>
              </div>
              <div className="absolute top-4 right-4 flex items-center gap-1.5 px-2.5 py-1 bg-black/60 rounded backdrop-blur-sm">
                <svg className="w-3.5 h-3.5 text-red-400" fill="currentColor" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="4" />
                </svg>
                <span className="text-sm font-semibold text-white">
                  {mockStreams[0].viewerCount.toLocaleString()}
                </span>
              </div>
            </div>
            <div className="p-6 lg:w-1/3 flex flex-col justify-center">
              <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-2">
                Featured Stream
              </span>
              <h2 className="text-xl font-bold text-white mb-2">
                {mockStreams[0].title}
              </h2>
              <div className="flex items-center gap-3 mb-4">
                <img
                  src={mockStreams[0].streamerAvatar}
                  alt={mockStreams[0].streamerName}
                  className="w-10 h-10 rounded-full bg-zinc-800"
                />
                <div>
                  <p className="text-sm font-medium text-white">
                    {mockStreams[0].streamerName}
                  </p>
                  <p className="text-xs text-zinc-500">
                    {mockStreams[0].category}
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-1.5 mb-4">
                {mockStreams[0].tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-0.5 text-[10px] font-medium bg-zinc-800 text-zinc-300 rounded-full border border-zinc-700"
                  >
                    {tag}
                  </span>
                ))}
              </div>
              <button className="btn-primary w-full">
                Watch Now
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Category filters */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`flex-shrink-0 px-4 py-2 text-sm font-medium rounded-xl transition-all ${
              selectedCategory === cat
                ? "bg-white/10 text-white"
                : "bg-zinc-900 text-zinc-400 hover:text-white hover:bg-zinc-800"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Sort */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-zinc-500">
          {filteredStreams.length} stream{filteredStreams.length !== 1 ? "s" : ""}
          {selectedCategory !== "All" && ` in ${selectedCategory}`}
        </p>
        <div className="flex items-center gap-2">
          <span className="text-xs text-zinc-600">Sort by:</span>
          <button
            onClick={() => setSortBy("viewers")}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
              sortBy === "viewers"
                ? "bg-white/10 text-white"
                : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            Most Viewers
          </button>
          <button
            onClick={() => setSortBy("recent")}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
              sortBy === "recent"
                ? "bg-white/10 text-white"
                : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            Most Recent
          </button>
        </div>
      </div>

      {/* Stream grid */}
      {filteredStreams.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-zinc-500">
          <svg className="w-16 h-16 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.182 15.182a4.5 4.5 0 01-6.364 0M21 12a9 9 0 11-18 0 9 9 0 0118 0zM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75 9.168 9 9.375 9s.375.336.375.75zm-.375 0h.008v.015h-.008V9.75zm5.625 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75zm-.375 0h.008v.015h-.008V9.75z" />
          </svg>
          <p className="text-lg font-medium">No streams found</p>
          <p className="text-sm mt-1">Try a different category or check back later</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 stagger-in">
          {filteredStreams.map((stream) => (
            <LiveCard
              key={stream.id}
              stream={stream}
              onWatch={(id) => console.log("Watch:", id)}
              onFollow={(id) => console.log("Follow:", id)}
            />
          ))}
        </div>
      )}

      {/* Past streams */}
      <div className="mt-12">
        <h2 className="section-title mb-6">Past Streams</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {mockStreams.slice(0, 4).map((stream) => (
            <div key={`past-${stream.id}`} className="group cursor-pointer">
              <div className="relative aspect-video rounded-xl overflow-hidden bg-zinc-800">
                <img
                  src={stream.thumbnail}
                  alt={stream.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 opacity-80"
                  loading="lazy"
                />
                <div className="absolute bottom-2 right-2 px-2 py-1 text-xs font-medium bg-black/80 text-white rounded">
                  3:45:20
                </div>
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center">
                    <svg className="w-7 h-7 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </div>
                </div>
              </div>
              <div className="flex gap-3 mt-3">
                <img
                  src={stream.streamerAvatar}
                  alt={stream.streamerName}
                  className="w-9 h-9 rounded-full bg-zinc-800 flex-shrink-0"
                  loading="lazy"
                />
                <div>
                  <h3 className="text-sm font-medium text-white line-clamp-2 group-hover:text-primary transition-colors">
                    {stream.title}
                  </h3>
                  <p className="mt-1 text-xs text-zinc-400">{stream.streamerName}</p>
                  <p className="text-xs text-zinc-600">
                    {stream.viewerCount.toLocaleString()} views · {stream.category}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
