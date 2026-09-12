"use client";

import { useState, useMemo } from "react";
import Link from "next/link";

interface Podcast {
  id: string;
  title: string;
  description: string;
  coverImage: string;
  hostName: string;
  hostAvatar: string;
  episodeCount: number;
  subscriberCount: number;
  latestEpisode: string;
  latestEpisodeDate: string;
  category: string;
  tags: string[];
  isSubscribed: boolean;
}

interface Episode {
  id: string;
  podcastId: string;
  title: string;
  description: string;
  duration: string;
  publishedAt: string;
  downloadCount: number;
  isNew: boolean;
}

const mockPodcasts: Podcast[] = [
  {
    id: "p1",
    title: "Tech Talk Weekly",
    description: "Weekly discussions on the latest in technology, programming, and software development.",
    coverImage: "https://picsum.photos/seed/pod1/400/400",
    hostName: "Sarah Chen",
    hostAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah",
    episodeCount: 156,
    subscriberCount: 45200,
    latestEpisode: "The Future of WebAssembly in 2024",
    latestEpisodeDate: new Date(Date.now() - 86400000 * 1).toISOString(),
    category: "Technology",
    tags: ["tech", "programming", "web"],
    isSubscribed: true,
  },
  {
    id: "p2",
    title: "AI Unlocked",
    description: "Deep dives into artificial intelligence, machine learning, and their real-world applications.",
    coverImage: "https://picsum.photos/seed/pod2/400/400",
    hostName: "Marcus Johnson",
    hostAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Marcus",
    episodeCount: 89,
    subscriberCount: 78400,
    latestEpisode: "GPT-5 and the Next Wave of AI",
    latestEpisodeDate: new Date(Date.now() - 86400000 * 2).toISOString(),
    category: "AI & ML",
    tags: ["ai", "machine-learning", "deep-learning"],
    isSubscribed: false,
  },
  {
    id: "p3",
    title: "Startup Stories",
    description: "Real stories from founders about building, launching, and scaling startups.",
    coverImage: "https://picsum.photos/seed/pod3/400/400",
    hostName: "Elena Rodriguez",
    hostAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Elena",
    episodeCount: 234,
    subscriberCount: 112000,
    latestEpisode: "From Zero to $10M ARR in 18 Months",
    latestEpisodeDate: new Date(Date.now() - 86400000 * 3).toISOString(),
    category: "Business",
    tags: ["startup", "entrepreneurship", "business"],
    isSubscribed: true,
  },
  {
    id: "p4",
    title: "Design Matters",
    description: "Conversations with world-class designers about creativity, process, and the future of design.",
    coverImage: "https://picsum.photos/seed/pod4/400/400",
    hostName: "Alex Kim",
    hostAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=AlexKim",
    episodeCount: 312,
    subscriberCount: 89000,
    latestEpisode: "The Psychology of Color in UI Design",
    latestEpisodeDate: new Date(Date.now() - 86400000 * 4).toISOString(),
    category: "Design",
    tags: ["design", "ux", "ui"],
    isSubscribed: false,
  },
  {
    id: "p5",
    title: "Code & Coffee",
    description: "Casual conversations about programming languages, frameworks, and developer culture.",
    coverImage: "https://picsum.photos/seed/pod5/400/400",
    hostName: "Jordan Patel",
    hostAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Jordan",
    episodeCount: 198,
    subscriberCount: 34500,
    latestEpisode: "Rust vs Go: The Ultimate Showdown",
    latestEpisodeDate: new Date(Date.now() - 86400000 * 5).toISOString(),
    category: "Technology",
    tags: ["programming", "developer", "coding"],
    isSubscribed: false,
  },
  {
    id: "p6",
    title: "The Product Podcast",
    description: "Insights from product managers at top tech companies on building products users love.",
    coverImage: "https://picsum.photos/seed/pod6/400/400",
    hostName: "Lisa Wang",
    hostAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=LisaWang",
    episodeCount: 145,
    subscriberCount: 56700,
    latestEpisode: "Product-Market Fit: Beyond the Buzzword",
    latestEpisodeDate: new Date(Date.now() - 86400000 * 6).toISOString(),
    category: "Business",
    tags: ["product", "pm", "strategy"],
    isSubscribed: true,
  },
];

const mockRecentEpisodes: Episode[] = [
  {
    id: "e1",
    podcastId: "p1",
    title: "The Future of WebAssembly in 2024",
    description: "We explore how WebAssembly is evolving and what it means for web development.",
    duration: "45:20",
    publishedAt: new Date(Date.now() - 86400000).toISOString(),
    downloadCount: 12400,
    isNew: true,
  },
  {
    id: "e2",
    podcastId: "p2",
    title: "GPT-5 and the Next Wave of AI",
    description: "Breaking down what we know about GPT-5 and the implications for AI development.",
    duration: "52:15",
    publishedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    downloadCount: 28900,
    isNew: true,
  },
  {
    id: "e3",
    podcastId: "p3",
    title: "From Zero to $10M ARR in 18 Months",
    description: "A founder shares the journey of scaling their SaaS product to $10M ARR.",
    duration: "38:45",
    publishedAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    downloadCount: 15600,
    isNew: false,
  },
  {
    id: "e4",
    podcastId: "p4",
    title: "The Psychology of Color in UI Design",
    description: "How color choices impact user behavior and conversion rates.",
    duration: "41:30",
    publishedAt: new Date(Date.now() - 86400000 * 4).toISOString(),
    downloadCount: 9800,
    isNew: false,
  },
  {
    id: "e5",
    podcastId: "p5",
    title: "Rust vs Go: The Ultimate Showdown",
    description: "A deep comparison of two of the most popular systems programming languages.",
    duration: "47:10",
    publishedAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    downloadCount: 11200,
    isNew: false,
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
  return `${days}d ago`;
}

type TabType = "discover" | "subscriptions" | "recent";

export default function PodcastsPage() {
  const [activeTab, setActiveTab] = useState<TabType>("discover");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [subscriptions, setSubscriptions] = useState<Set<string>>(
    new Set(mockPodcasts.filter((p) => p.isSubscribed).map((p) => p.id))
  );

  const categories = [
    "All",
    "Technology",
    "AI & ML",
    "Business",
    "Design",
    "Science",
    "Health",
    "Entertainment",
  ];

  const filteredPodcasts = useMemo(() => {
    let result = [...mockPodcasts];

    if (selectedCategory !== "All") {
      result = result.filter((p) => p.category === selectedCategory);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.tags.some((t) => t.includes(q))
      );
    }

    if (activeTab === "subscriptions") {
      result = result.filter((p) => subscriptions.has(p.id));
    }

    return result;
  }, [selectedCategory, searchQuery, activeTab, subscriptions]);

  const toggleSubscription = (id: string) => {
    setSubscriptions((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const tabs = [
    { id: "discover" as const, label: "Discover" },
    { id: "subscriptions" as const, label: "My Subscriptions" },
    { id: "recent" as const, label: "Recent Episodes" },
  ];

  return (
    <div className="p-4 lg:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Podcasts</h1>
          <p className="text-sm text-zinc-400 mt-1">
            Discover and subscribe to your favorite podcasts.
          </p>
        </div>
        <Link href="/podcasts/new" className="btn-primary">
          <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          New Podcast
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 p-1 bg-zinc-900 rounded-xl w-fit">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
              activeTab === tab.id
                ? "bg-white/10 text-white"
                : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab !== "recent" && (
        <>
          {/* Search and filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
              </svg>
              <input
                type="text"
                placeholder="Search podcasts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input-field pl-10"
              />
            </div>
          </div>

          {/* Categories */}
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
        </>
      )}

      {/* Podcast Grid */}
      {activeTab !== "recent" && (
        <div>
          {filteredPodcasts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-zinc-500">
              <svg className="w-16 h-16 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
              </svg>
              <p className="text-lg font-medium">No podcasts found</p>
              <p className="text-sm mt-1">Try adjusting your search or filters</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 stagger-in">
              {filteredPodcasts.map((podcast) => (
                <div key={podcast.id} className="card-hover p-4 group">
                  <div className="flex gap-4">
                    <img
                      src={podcast.coverImage}
                      alt={podcast.title}
                      className="w-20 h-20 rounded-xl bg-zinc-800 flex-shrink-0 object-cover"
                      loading="lazy"
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-semibold text-white line-clamp-1 group-hover:text-primary transition-colors">
                        {podcast.title}
                      </h3>
                      <p className="text-xs text-zinc-500 mt-0.5">{podcast.hostName}</p>
                      <div className="flex items-center gap-2 mt-1 text-[11px] text-zinc-600">
                        <span>{podcast.episodeCount} episodes</span>
                        <span>·</span>
                        <span>{formatNumber(podcast.subscriberCount)} subs</span>
                      </div>
                    </div>
                  </div>

                  <p className="mt-3 text-xs text-zinc-400 line-clamp-2 leading-relaxed">
                    {podcast.description}
                  </p>

                  <div className="mt-3 flex items-center gap-2">
                    <span className="px-2 py-0.5 text-[10px] font-medium bg-zinc-800 text-zinc-400 rounded-full">
                      {podcast.category}
                    </span>
                    {podcast.tags.slice(0, 2).map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-0.5 text-[10px] font-medium bg-zinc-800/50 text-zinc-500 rounded-full"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>

                  <div className="mt-4 flex items-center gap-2">
                    <button
                      onClick={() => toggleSubscription(podcast.id)}
                      className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
                        subscriptions.has(podcast.id)
                          ? "bg-primary/10 text-primary border border-primary/20"
                          : "bg-white/5 text-white hover:bg-white/10 border border-zinc-800"
                      }`}
                    >
                      {subscriptions.has(podcast.id) ? "Subscribed" : "Subscribe"}
                    </button>
                    <button className="px-3 py-2 rounded-lg bg-white/5 text-zinc-400 hover:text-white hover:bg-white/10 border border-zinc-800 transition-colors">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                      </svg>
                    </button>
                  </div>

                  {/* Latest episode */}
                  <div className="mt-3 p-2.5 rounded-lg bg-white/[0.02] border border-zinc-800/50">
                    <p className="text-[10px] text-zinc-600 uppercase tracking-wider mb-1">
                      Latest Episode
                    </p>
                    <p className="text-xs font-medium text-zinc-300 line-clamp-1">
                      {podcast.latestEpisode}
                    </p>
                    <p className="text-[11px] text-zinc-600 mt-0.5">
                      {timeAgo(podcast.latestEpisodeDate)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Recent episodes tab */}
      {activeTab === "recent" && (
        <div className="space-y-3">
          {mockRecentEpisodes.map((episode) => {
            const podcast = mockPodcasts.find((p) => p.id === episode.podcastId);
            return (
              <div
                key={episode.id}
                className="card p-4 hover:bg-white/[0.02] transition-colors"
              >
                <div className="flex gap-4">
                  {podcast && (
                    <img
                      src={podcast.coverImage}
                      alt={podcast.title}
                      className="w-16 h-16 rounded-xl bg-zinc-800 flex-shrink-0 object-cover"
                      loading="lazy"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-xs text-zinc-500 mb-1">
                          {podcast?.title}
                          {episode.isNew && (
                            <span className="ml-2 badge-new text-[9px] py-0 px-1.5">NEW</span>
                          )}
                        </p>
                        <h3 className="text-sm font-semibold text-white line-clamp-1">
                          {episode.title}
                        </h3>
                      </div>
                      <button className="btn-icon flex-shrink-0">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z" />
                        </svg>
                      </button>
                    </div>
                    <p className="mt-1 text-xs text-zinc-400 line-clamp-1">
                      {episode.description}
                    </p>
                    <div className="flex items-center gap-3 mt-2 text-[11px] text-zinc-600">
                      <span>{episode.duration}</span>
                      <span>·</span>
                      <span>{formatNumber(episode.downloadCount)} downloads</span>
                      <span>·</span>
                      <span>{timeAgo(episode.publishedAt)}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
