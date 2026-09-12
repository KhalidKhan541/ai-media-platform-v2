'use client';

import { useState } from 'react';

interface Channel {
  id: string;
  name: string;
  avatar: string;
  description: string;
  subscriberCount: number;
  videoCount: number;
  isSubscribed: boolean;
  tier: 'free' | 'pro' | 'enterprise';
  monthlyPrice: number;
  lastVideo: { title: string; thumbnail: string; publishedAt: string };
}

const MOCK_CHANNELS: Channel[] = [
  { id: '1', name: 'AI Artistry Lab', avatar: '/channels/ai-art.jpg', description: 'Exploring the intersection of AI and creative arts.', subscriberCount: 124000, videoCount: 86, isSubscribed: true, tier: 'pro', monthlyPrice: 9.99, lastVideo: { title: 'Creating Photorealistic Landscapes with AI', thumbnail: '/videos/ai-landscape.jpg', publishedAt: '2026-09-10T10:00:00Z' } },
  { id: '2', name: 'SoundWave Studios', avatar: '/channels/soundwave.jpg', description: 'Music production tutorials and AI music experiments.', subscriberCount: 89000, videoCount: 124, isSubscribed: true, tier: 'free', monthlyPrice: 0, lastVideo: { title: 'AI-Generated Beats: From Concept to Track', thumbnail: '/videos/ai-beats.jpg', publishedAt: '2026-09-09T14:00:00Z' } },
  { id: '3', name: 'PixelForge', avatar: '/channels/pixelforge.jpg', description: 'Video editing masterclass and creative workflows.', subscriberCount: 67000, videoCount: 52, isSubscribed: false, tier: 'pro', monthlyPrice: 14.99, lastVideo: { title: 'Cinematic Color Grading in 2026', thumbnail: '/videos/color-grade.jpg', publishedAt: '2026-09-08T09:00:00Z' } },
  { id: '4', name: 'DeepMedia Research', avatar: '/channels/deepmedia.jpg', description: 'Cutting-edge research on media AI and neural networks.', subscriberCount: 45000, videoCount: 38, isSubscribed: false, tier: 'enterprise', monthlyPrice: 29.99, lastVideo: { title: 'Real-Time Video Super-Resolution', thumbnail: '/videos/super-res.jpg', publishedAt: '2026-09-07T16:00:00Z' } },
  { id: '5', name: 'Creator Toolkit', avatar: '/channels/creator-toolkit.jpg', description: 'Tools and strategies for modern content creators.', subscriberCount: 203000, videoCount: 210, isSubscribed: true, tier: 'free', monthlyPrice: 0, lastVideo: { title: 'Top 10 AI Tools for Creators', thumbnail: '/videos/top10-tools.jpg', publishedAt: '2026-09-06T11:00:00Z' } },
  { id: '6', name: 'Neural Beats', avatar: '/channels/neural-beats.jpg', description: 'AI-generated music and audio experiments.', subscriberCount: 31000, videoCount: 28, isSubscribed: false, tier: 'pro', monthlyPrice: 7.99, lastVideo: { title: 'Composing with Neural Networks', thumbnail: '/videos/neural-compose.jpg', publishedAt: '2026-09-05T08:00:00Z' } },
];

function formatSubscribers(count: number): string {
  if (count >= 1_000_000) return `${(count / 1_000_000).toFixed(1)}M`;
  if (count >= 1_000) return `${(count / 1_000).toFixed(1)}K`;
  return count.toString();
}

function timeAgo(date: string): string {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  const weeks = Math.floor(days / 7);
  return `${weeks}w ago`;
}

const TIER_STYLES: Record<string, string> = {
  free: 'bg-zinc-700 text-zinc-300',
  pro: 'bg-gradient-to-r from-pink-500 to-purple-500 text-white',
  enterprise: 'bg-gradient-to-r from-amber-500 to-orange-500 text-white',
};

export default function SubscriptionsPage() {
  const [channels, setChannels] = useState(MOCK_CHANNELS);
  const [tab, setTab] = useState<'all' | 'subscribed' | 'free' | 'paid'>('all');
  const [search, setSearch] = useState('');

  const toggleSubscribe = (id: string) => {
    setChannels(prev => prev.map(c => c.id === id ? { ...c, isSubscribed: !c.isSubscribed } : c));
  };

  const filtered = channels.filter(c => {
    if (search.trim() && !c.name.toLowerCase().includes(search.toLowerCase())) return false;
    switch (tab) {
      case 'subscribed': return c.isSubscribed;
      case 'free': return c.tier === 'free';
      case 'paid': return c.tier !== 'free';
      default: return true;
    }
  });

  const subscribedCount = channels.filter(c => c.isSubscribed).length;
  const totalMonthly = channels.filter(c => c.isSubscribed && c.tier !== 'free').reduce((sum, c) => sum + c.monthlyPrice, 0);

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">Subscriptions</h1>
            <p className="text-zinc-400 mt-1">Manage your channel subscriptions</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl px-5 py-3">
              <p className="text-xs text-zinc-500">Active Subscriptions</p>
              <p className="text-2xl font-bold text-white">{subscribedCount}</p>
            </div>
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl px-5 py-3">
              <p className="text-xs text-zinc-500">Monthly Spend</p>
              <p className="text-2xl font-bold text-pink-400">${totalMonthly.toFixed(2)}</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 mb-6">
          <div className="relative flex-1 max-w-md">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" /></svg>
            <input type="text" placeholder="Search channels..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-10 pr-4 py-2.5 bg-zinc-900 border border-zinc-700 rounded-lg text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-pink-500" />
          </div>
          {(['all', 'subscribed', 'free', 'paid'] as const).map((t) => (
            <button key={t} onClick={() => setTab(t)} className={`px-4 py-2 text-sm font-medium rounded-full transition-all capitalize ${tab === t ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white shadow-lg shadow-pink-500/25' : 'bg-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-700'}`}>
              {t}
            </button>
          ))}
        </div>

        <div className="space-y-4">
          {filtered.map((channel) => (
            <div key={channel.id} className="group flex gap-5 bg-zinc-900 rounded-xl border border-zinc-800 hover:border-zinc-700 p-5 transition-all cursor-pointer">
              <img src={channel.avatar} alt={channel.name} className="w-16 h-16 rounded-full bg-zinc-700 flex-shrink-0" loading="lazy" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3">
                  <h3 className="text-lg font-semibold text-white group-hover:text-pink-400 transition-colors">{channel.name}</h3>
                  <span className={`px-2.5 py-0.5 text-[10px] font-bold uppercase rounded-full ${TIER_STYLES[channel.tier]}`}>{channel.tier}</span>
                  <span className="text-sm text-zinc-500">{formatSubscribers(channel.subscriberCount)} subscribers</span>
                </div>
                <p className="text-sm text-zinc-400 mt-1">{channel.description}</p>
                <div className="flex items-center gap-4 mt-3">
                  <span className="text-xs text-zinc-500">{channel.videoCount} videos</span>
                  {channel.tier !== 'free' && (
                    <span className="text-xs text-pink-400 font-medium">${channel.monthlyPrice}/mo</span>
                  )}
                </div>
                <div className="flex items-center gap-3 mt-3 p-3 bg-zinc-800/50 rounded-lg">
                  <img src={channel.lastVideo.thumbnail} alt={channel.lastVideo.title} className="w-20 h-12 rounded object-cover" loading="lazy" />
                  <div>
                    <p className="text-xs text-zinc-500">Latest</p>
                    <p className="text-sm text-white line-clamp-1">{channel.lastVideo.title}</p>
                    <p className="text-xs text-zinc-500">{timeAgo(channel.lastVideo.publishedAt)}</p>
                  </div>
                </div>
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); toggleSubscribe(channel.id); }}
                className={`self-start px-5 py-2.5 text-sm font-semibold rounded-lg transition-all flex-shrink-0 ${
                  channel.isSubscribed
                    ? 'bg-zinc-800 text-zinc-400 hover:bg-red-900/30 hover:text-red-400 border border-zinc-700'
                    : 'bg-gradient-to-r from-pink-500 to-purple-500 text-white hover:shadow-lg hover:shadow-pink-500/25'
                }`}
              >
                {channel.isSubscribed ? 'Subscribed' : 'Subscribe'}
              </button>
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-zinc-500">
            <svg className="w-16 h-16 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}><path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" /></svg>
            <p className="text-lg font-medium">No channels found</p>
            <p className="text-sm mt-1">Try adjusting your search or filters</p>
          </div>
        )}
      </div>
    </div>
  );
}
