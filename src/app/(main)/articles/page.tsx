'use client';

import { useState, useMemo } from 'react';

interface Article {
  id: string;
  title: string;
  excerpt: string;
  coverImage: string;
  author: { name: string; avatar: string };
  category: string;
  readTime: number;
  publishedAt: string;
  tags: string[];
  aiGenerated: boolean;
  likes: number;
  comments: number;
}

const CATEGORIES = ['All', 'Technology', 'AI & ML', 'Creative', 'Business', 'Science', 'Culture'];
const SORT_OPTIONS = ['recent', 'popular', 'trending'] as const;

const MOCK_ARTICLES: Article[] = [
  { id: '1', title: 'The Future of AI-Generated Music', excerpt: 'How artificial intelligence is reshaping the music industry from composition to distribution.', coverImage: '/articles/ai-music.jpg', author: { name: 'Sarah Chen', avatar: '/avatars/sarah.jpg' }, category: 'AI & ML', readTime: 8, publishedAt: '2026-09-10T10:00:00Z', tags: ['AI', 'Music', 'Creative'], aiGenerated: true, likes: 342, comments: 28 },
  { id: '2', title: 'Building Scalable Media Pipelines', excerpt: 'Architecture patterns for handling millions of media uploads per day.', coverImage: '/articles/pipeline.jpg', author: { name: 'Marcus Johnson', avatar: '/avatars/marcus.jpg' }, category: 'Technology', readTime: 12, publishedAt: '2026-09-09T14:00:00Z', tags: ['Architecture', 'Scalability'], aiGenerated: false, likes: 256, comments: 19 },
  { id: '3', title: 'Content Monetization in 2026', excerpt: 'New revenue streams emerging for digital content creators in the AI era.', coverImage: '/articles/monetize.jpg', author: { name: 'Elena Rodriguez', avatar: '/avatars/elena.jpg' }, category: 'Business', readTime: 6, publishedAt: '2026-09-08T09:00:00Z', tags: ['Monetization', 'Creator Economy'], aiGenerated: false, likes: 189, comments: 34 },
  { id: '4', title: 'Neural Style Transfer for Video', excerpt: 'Real-time artistic style application using advanced neural networks.', coverImage: '/articles/style-transfer.jpg', author: { name: 'Dr. Kim Tanaka', avatar: '/avatars/kim.jpg' }, category: 'AI & ML', readTime: 15, publishedAt: '2026-09-07T16:00:00Z', tags: ['Neural Networks', 'Video', 'AI'], aiGenerated: true, likes: 478, comments: 42 },
  { id: '5', title: 'The Rise of Interactive Media', excerpt: 'How choose-your-own-adventure content is transforming storytelling.', coverImage: '/articles/interactive.jpg', author: { name: 'James Park', avatar: '/avatars/james.jpg' }, category: 'Creative', readTime: 7, publishedAt: '2026-09-06T11:00:00Z', tags: ['Interactive', 'Storytelling'], aiGenerated: false, likes: 167, comments: 15 },
  { id: '6', title: 'Quantum Computing Meets Media', excerpt: 'Exploring potential applications of quantum algorithms in media processing.', coverImage: '/articles/quantum.jpg', author: { name: 'Dr. Aisha Patel', avatar: '/avatars/aisha.jpg' }, category: 'Science', readTime: 18, publishedAt: '2026-09-05T08:00:00Z', tags: ['Quantum', 'Computing', 'Future'], aiGenerated: true, likes: 301, comments: 22 },
];

function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatCount(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return n.toString();
}

export default function ArticlesPage() {
  const [category, setCategory] = useState('All');
  const [sort, setSort] = useState<'recent' | 'popular' | 'trending'>('recent');
  const [search, setSearch] = useState('');
  const [view, setView] = useState<'grid' | 'list'>('grid');

  const filtered = useMemo(() => {
    let result = [...MOCK_ARTICLES];
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(a => a.title.toLowerCase().includes(q) || a.tags.some(t => t.toLowerCase().includes(q)));
    }
    if (category !== 'All') result = result.filter(a => a.category === category);
    switch (sort) {
      case 'popular': result.sort((a, b) => b.likes - a.likes); break;
      case 'trending': result.sort((a, b) => b.comments - a.comments); break;
      default: result.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
    }
    return result;
  }, [category, sort, search]);

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">
              Articles
            </h1>
            <p className="text-zinc-400 mt-1">Discover insights from creators and AI researchers</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
              </svg>
              <input
                type="text"
                placeholder="Search articles..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 pr-4 py-2.5 bg-zinc-900 border border-zinc-700 rounded-lg text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent w-64"
              />
            </div>
            <div className="flex bg-zinc-900 border border-zinc-700 rounded-lg p-1">
              <button onClick={() => setView('grid')} className={`p-2 rounded-md transition-colors ${view === 'grid' ? 'bg-zinc-700 text-white' : 'text-zinc-500 hover:text-zinc-300'}`} aria-label="Grid view">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" /></svg>
              </button>
              <button onClick={() => setView('list')} className={`p-2 rounded-md transition-colors ${view === 'list' ? 'bg-zinc-700 text-white' : 'text-zinc-500 hover:text-zinc-300'}`} aria-label="List view">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 5.25h16.5m-16.5 4.5h16.5m-16.5 4.5h16.5m-16.5 4.5h16.5" /></svg>
              </button>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 mb-6">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-4 py-2 text-sm font-medium rounded-full transition-all ${
                category === cat
                  ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white shadow-lg shadow-pink-500/25'
                  : 'bg-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-700'
              }`}
            >
              {cat}
            </button>
          ))}
          <div className="ml-auto">
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as typeof sort)}
              className="px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-sm text-zinc-300 focus:outline-none focus:ring-2 focus:ring-pink-500"
            >
              <option value="recent">Most Recent</option>
              <option value="popular">Most Popular</option>
              <option value="trending">Trending</option>
            </select>
          </div>
        </div>

        <p className="text-sm text-zinc-500 mb-6">{filtered.length} article{filtered.length !== 1 ? 's' : ''}</p>

        {view === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((article) => (
              <article key={article.id} className="group bg-zinc-900 rounded-xl overflow-hidden border border-zinc-800 hover:border-zinc-700 transition-all hover:shadow-lg hover:shadow-pink-500/5 cursor-pointer">
                <div className="relative aspect-video overflow-hidden">
                  <img src={article.coverImage} alt={article.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  <span className="absolute top-3 left-3 px-2.5 py-1 text-xs font-medium bg-zinc-900/80 text-zinc-200 rounded-md backdrop-blur-sm">{article.category}</span>
                  {article.aiGenerated && (
                    <span className="absolute top-3 right-3 px-2 py-1 text-xs font-medium bg-purple-600 text-white rounded-md flex items-center gap-1">
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" /></svg>
                      AI
                    </span>
                  )}
                  <span className="absolute bottom-3 right-3 px-2 py-1 text-xs font-medium bg-black/60 text-white rounded-md backdrop-blur-sm">{article.readTime} min read</span>
                </div>
                <div className="p-5">
                  <h3 className="text-lg font-semibold text-white line-clamp-2 group-hover:text-pink-400 transition-colors">{article.title}</h3>
                  <p className="text-sm text-zinc-400 mt-2 line-clamp-2">{article.excerpt}</p>
                  <div className="flex items-center gap-3 mt-4">
                    <img src={article.author.avatar} alt={article.author.name} className="w-7 h-7 rounded-full bg-zinc-700" loading="lazy" />
                    <span className="text-xs text-zinc-400">{article.author.name}</span>
                    <span className="text-zinc-600">·</span>
                    <span className="text-xs text-zinc-500">{formatDate(article.publishedAt)}</span>
                  </div>
                  <div className="flex items-center gap-4 mt-4 pt-4 border-t border-zinc-800">
                    <span className="flex items-center gap-1.5 text-xs text-zinc-500">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" /></svg>
                      {formatCount(article.likes)}
                    </span>
                    <span className="flex items-center gap-1.5 text-xs text-zinc-500">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 2.104.859 4.023 2.273 5.48.432.447.74 1.04.586 1.641a4.483 4.483 0 01-.923 1.785A5.969 5.969 0 006 21c1.282 0 2.47-.402 3.445-1.087.81.22 1.668.337 2.555.337z" /></svg>
                      {formatCount(article.comments)}
                    </span>
                    <div className="flex-1" />
                    <div className="flex gap-1.5">
                      {article.tags.slice(0, 2).map((tag) => (
                        <span key={tag} className="px-2 py-0.5 text-[10px] font-medium bg-zinc-800 text-zinc-400 rounded-full border border-zinc-700">#{tag}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((article) => (
              <article key={article.id} className="group flex gap-5 bg-zinc-900 rounded-xl border border-zinc-800 hover:border-zinc-700 p-4 transition-all hover:shadow-lg hover:shadow-pink-500/5 cursor-pointer">
                <div className="relative flex-shrink-0 w-48 aspect-video rounded-lg overflow-hidden">
                  <img src={article.coverImage} alt={article.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                  <span className="absolute bottom-1 right-1 px-1.5 py-0.5 text-[10px] font-medium bg-black/80 text-white rounded">{article.readTime}m</span>
                </div>
                <div className="flex flex-col min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2 py-0.5 text-[10px] font-medium bg-zinc-800 text-zinc-300 rounded-full">{article.category}</span>
                    {article.aiGenerated && <span className="px-2 py-0.5 text-[10px] font-medium bg-purple-600 text-white rounded-full">AI</span>}
                  </div>
                  <h3 className="text-base font-semibold text-white line-clamp-1 group-hover:text-pink-400 transition-colors">{article.title}</h3>
                  <p className="text-sm text-zinc-400 mt-1 line-clamp-2">{article.excerpt}</p>
                  <div className="flex items-center gap-3 mt-2">
                    <img src={article.author.avatar} alt={article.author.name} className="w-5 h-5 rounded-full bg-zinc-700" loading="lazy" />
                    <span className="text-xs text-zinc-400">{article.author.name}</span>
                    <span className="text-zinc-600">·</span>
                    <span className="text-xs text-zinc-500">{formatDate(article.publishedAt)}</span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}

        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-zinc-500">
            <svg className="w-16 h-16 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" /></svg>
            <p className="text-lg font-medium">No articles found</p>
            <p className="text-sm mt-1">Try adjusting your search or filters</p>
          </div>
        )}
      </div>
    </div>
  );
}
