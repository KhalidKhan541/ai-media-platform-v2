'use client';

import { useState, useMemo } from 'react';

interface Playlist {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  videoCount: number;
  totalDuration: string;
  author: { name: string; avatar: string };
  isPublic: boolean;
  updatedAt: string;
  tags: string[];
  aiCurated: boolean;
}

const MOCK_PLAYLISTS: Playlist[] = [
  { id: '1', title: 'AI Art Masterclass', description: 'Complete tutorials on creating stunning AI-generated artwork.', thumbnail: '/playlists/ai-art.jpg', videoCount: 24, totalDuration: '8h 32m', author: { name: 'Sarah Chen', avatar: '/avatars/sarah.jpg' }, isPublic: true, updatedAt: '2026-09-10T10:00:00Z', tags: ['AI', 'Art', 'Tutorial'], aiCurated: true },
  { id: '2', title: 'Music Production Essentials', description: 'From beat-making to mixing, everything you need to know.', thumbnail: '/playlists/music-prod.jpg', videoCount: 18, totalDuration: '6h 15m', author: { name: 'Marcus Johnson', avatar: '/avatars/marcus.jpg' }, isPublic: true, updatedAt: '2026-09-09T14:00:00Z', tags: ['Music', 'Production'], aiCurated: false },
  { id: '3', title: 'Video Editing Pro', description: 'Advanced techniques for professional video editing.', thumbnail: '/playlists/video-edit.jpg', videoCount: 32, totalDuration: '12h 45m', author: { name: 'Elena Rodriguez', avatar: '/avatars/elena.jpg' }, isPublic: true, updatedAt: '2026-09-08T09:00:00Z', tags: ['Video', 'Editing'], aiCurated: false },
  { id: '4', title: 'Deep Learning for Media', description: 'Understanding neural networks applied to media processing.', thumbnail: '/playlists/deep-learning.jpg', videoCount: 15, totalDuration: '5h 20m', author: { name: 'Dr. Kim Tanaka', avatar: '/avatars/kim.jpg' }, isPublic: false, updatedAt: '2026-09-07T16:00:00Z', tags: ['Deep Learning', 'AI'], aiCurated: true },
  { id: '5', title: 'Creator Monetization Guide', description: 'Strategies to earn from your creative content.', thumbnail: '/playlists/monetize.jpg', videoCount: 12, totalDuration: '4h 10m', author: { name: 'James Park', avatar: '/avatars/james.jpg' }, isPublic: true, updatedAt: '2026-09-06T11:00:00Z', tags: ['Business', 'Creator'], aiCurated: false },
  { id: '6', title: 'Podcast Production', description: 'Launch and grow your podcast with professional techniques.', thumbnail: '/playlists/podcast.jpg', videoCount: 20, totalDuration: '7h 05m', author: { name: 'Dr. Aisha Patel', avatar: '/avatars/aisha.jpg' }, isPublic: true, updatedAt: '2026-09-05T08:00:00Z', tags: ['Podcast', 'Audio'], aiCurated: true },
];

const FILTERS = ['All', 'Public', 'Private', 'AI Curated'] as const;

function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export default function PlaylistsPage() {
  const [filter, setFilter] = useState<'All' | 'Public' | 'Private' | 'AI Curated'>('All');
  const [search, setSearch] = useState('');
  const [view, setView] = useState<'grid' | 'list'>('grid');

  const filtered = useMemo(() => {
    let result = [...MOCK_PLAYLISTS];
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(p => p.title.toLowerCase().includes(q) || p.tags.some(t => t.toLowerCase().includes(q)));
    }
    switch (filter) {
      case 'Public': result = result.filter(p => p.isPublic); break;
      case 'Private': result = result.filter(p => !p.isPublic); break;
      case 'AI Curated': result = result.filter(p => p.aiCurated); break;
    }
    result.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
    return result;
  }, [filter, search]);

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">Playlists</h1>
            <p className="text-zinc-400 mt-1">Curated collections of videos and tutorials</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" /></svg>
              <input type="text" placeholder="Search playlists..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10 pr-4 py-2.5 bg-zinc-900 border border-zinc-700 rounded-lg text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-pink-500 w-64" />
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
          {FILTERS.map((f) => (
            <button key={f} onClick={() => setFilter(f)} className={`px-4 py-2 text-sm font-medium rounded-full transition-all ${filter === f ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white shadow-lg shadow-pink-500/25' : 'bg-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-700'}`}>
              {f}
            </button>
          ))}
          <span className="text-sm text-zinc-500 ml-auto">{filtered.length} playlist{filtered.length !== 1 ? 's' : ''}</span>
        </div>

        {view === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((playlist) => (
              <article key={playlist.id} className="group bg-zinc-900 rounded-xl overflow-hidden border border-zinc-800 hover:border-zinc-700 transition-all hover:shadow-lg hover:shadow-pink-500/5 cursor-pointer">
                <div className="relative aspect-video overflow-hidden">
                  <img src={playlist.thumbnail} alt={playlist.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                  <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between">
                    <div>
                      <span className="text-xs text-zinc-300">{playlist.videoCount} videos</span>
                      <span className="text-zinc-500 mx-1.5">·</span>
                      <span className="text-xs text-zinc-400">{playlist.totalDuration}</span>
                    </div>
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30">
                      <svg className="w-7 h-7 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                    </div>
                  </div>
                  {playlist.aiCurated && (
                    <span className="absolute top-3 right-3 px-2 py-1 text-xs font-medium bg-purple-600 text-white rounded-md flex items-center gap-1">
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" /></svg>
                      AI Curated
                    </span>
                  )}
                </div>
                <div className="p-5">
                  <div className="flex items-center gap-2 mb-2">
                    {playlist.isPublic ? (
                      <span className="flex items-center gap-1 text-[10px] text-green-400"><svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" /></svg>Public</span>
                    ) : (
                      <span className="flex items-center gap-1 text-[10px] text-zinc-500"><svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" /></svg>Private</span>
                    )}
                  </div>
                  <h3 className="text-lg font-semibold text-white line-clamp-1 group-hover:text-pink-400 transition-colors">{playlist.title}</h3>
                  <p className="text-sm text-zinc-400 mt-1.5 line-clamp-2">{playlist.description}</p>
                  <div className="flex items-center gap-3 mt-4">
                    <img src={playlist.author.avatar} alt={playlist.author.name} className="w-6 h-6 rounded-full bg-zinc-700" loading="lazy" />
                    <span className="text-xs text-zinc-400">{playlist.author.name}</span>
                    <span className="text-zinc-600">·</span>
                    <span className="text-xs text-zinc-500">Updated {formatDate(playlist.updatedAt)}</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {playlist.tags.map((tag) => (
                      <span key={tag} className="px-2 py-0.5 text-[10px] font-medium bg-zinc-800 text-zinc-400 rounded-full border border-zinc-700">#{tag}</span>
                    ))}
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((playlist) => (
              <article key={playlist.id} className="group flex gap-4 bg-zinc-900 rounded-xl border border-zinc-800 hover:border-zinc-700 p-4 transition-all cursor-pointer">
                <div className="relative flex-shrink-0 w-56 aspect-video rounded-lg overflow-hidden">
                  <img src={playlist.thumbnail} alt={playlist.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                  <div className="absolute bottom-1 right-1 px-1.5 py-0.5 text-[10px] font-medium bg-black/80 text-white rounded">{playlist.videoCount} videos · {playlist.totalDuration}</div>
                </div>
                <div className="flex flex-col min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-semibold text-white line-clamp-1 group-hover:text-pink-400 transition-colors">{playlist.title}</h3>
                    {playlist.aiCurated && <span className="px-1.5 py-0.5 text-[9px] font-medium bg-purple-600 text-white rounded">AI</span>}
                  </div>
                  <p className="text-sm text-zinc-400 mt-1 line-clamp-1">{playlist.description}</p>
                  <div className="flex items-center gap-3 mt-2">
                    <img src={playlist.author.avatar} alt={playlist.author.name} className="w-5 h-5 rounded-full bg-zinc-700" loading="lazy" />
                    <span className="text-xs text-zinc-400">{playlist.author.name}</span>
                    <span className="text-zinc-600">·</span>
                    <span className="text-xs text-zinc-500">Updated {formatDate(playlist.updatedAt)}</span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}

        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-zinc-500">
            <svg className="w-16 h-16 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}><path strokeLinecap="round" strokeLinejoin="round" d="M3.375 19.5h17.25m-17.25 0a1.125 1.125 0 01-1.125-1.125M3.375 19.5h1.5C5.496 19.5 6 18.996 6 18.375m-3.75 0V5.625m0 12.75v-1.5c0-.621.504-1.125 1.125-1.125m18.375 2.625V5.625m0 12.75c0 .621-.504 1.125-1.125 1.125m1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125m0 3.75h-1.5A1.125 1.125 0 0118 18.375M20.625 4.5H3.375m17.25 0c.621 0 1.125.504 1.125 1.125M20.625 4.5h-1.5C18.504 4.5 18 5.004 18 5.625m3.75 0v1.5c0 .621-.504 1.125-1.125 1.125M3.375 4.5c-.621 0-1.125.504-1.125 1.125M3.375 4.5h1.5C5.496 4.5 6 5.004 6 5.625m-3.75 0v1.5c0 .621.504 1.125 1.125 1.125m0 0h1.5m-1.5 0c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125m1.5-3.75C5.496 8.25 6 7.746 6 7.125v-1.5M4.875 8.25C5.496 8.25 6 8.754 6 9.375v1.5m0-5.25v5.25m0-5.25C6 5.004 6.504 4.5 7.125 4.5h9.75c.621 0 1.125.504 1.125 1.125m1.125 2.625h1.5m-1.5 0A1.125 1.125 0 0118 7.125v-1.5m1.125 2.625c-.621 0-1.125.504-1.125 1.125v1.5m2.625-2.625c.621 0 1.125.504 1.125 1.125v1.5c0 .621-.504 1.125-1.125 1.125M18 5.625v5.25M7.125 12h9.75m-9.75 0A1.125 1.125 0 016 10.875M7.125 12C6.504 12 6 12.504 6 13.125m0-2.25C6 11.496 5.496 12 4.875 12M18 10.875c0 .621-.504 1.125-1.125 1.125M18 10.875c0 .621.504 1.125 1.125 1.125m-2.25 0c.621 0 1.125.504 1.125 1.125m-12 5.25v-5.25m0 5.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125m-12 0v-1.5c0-.621-.504-1.125-1.125-1.125M18 18.375v-5.25m0 5.25v-1.5c0-.621.504-1.125 1.125-1.125M18 13.125v1.5c0 .621.504 1.125 1.125 1.125M18 13.125c0-.621.504-1.125 1.125-1.125M6 13.125v1.5c0 .621-.504 1.125-1.125 1.125M6 13.125C6 12.504 5.496 12 4.875 12m-1.5 0h1.5m-1.5 0c-.621 0-1.125-.504-1.125-1.125v-1.5c0-.621.504-1.125 1.125-1.125m1.5 3.75c-.621 0-1.125-.504-1.125-1.125" /></svg>
            <p className="text-lg font-medium">No playlists found</p>
            <p className="text-sm mt-1">Try adjusting your search or filters</p>
          </div>
        )}
      </div>
    </div>
  );
}
