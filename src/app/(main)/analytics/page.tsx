'use client';

import { useState, useMemo } from 'react';

interface Metric {
  label: string;
  value: string;
  change: number;
  icon: string;
  color: string;
}

interface VideoStat {
  id: string;
  title: string;
  thumbnail: string;
  views: number;
  watchTime: number;
  likes: number;
  comments: number;
  shares: number;
  ctr: number;
  publishedAt: string;
  trend: 'up' | 'down' | 'stable';
}

const METRICS: Metric[] = [
  { label: 'Total Views', value: '2.4M', change: 18.2, icon: 'M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z', color: 'from-pink-500 to-rose-500' },
  { label: 'Watch Time', value: '18.7K hrs', change: 12.5, icon: 'M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z', color: 'from-purple-500 to-violet-500' },
  { label: 'Subscribers', value: '84.2K', change: 5.8, icon: 'M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z', color: 'from-blue-500 to-cyan-500' },
  { label: 'Revenue', value: '$12.4K', change: -2.1, icon: 'M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z', color: 'from-emerald-500 to-teal-500' },
  { label: 'Engagement', value: '8.4%', change: 1.3, icon: 'M15.042 21.672L13.684 16.6m0 0l-2.51 2.225.569-9.47 5.227 7.917-3.286-.672zM12 2.25V4.5m5.834.166l-1.591 1.591M20.25 10.5H18M7.757 14.743l-1.59 1.59M6 10.5H3.75m4.007-4.243l-1.59-1.59', color: 'from-amber-500 to-orange-500' },
  { label: 'AI Score', value: '94', change: 3.0, icon: 'M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z', color: 'from-violet-500 to-purple-500' },
];

const TOP_VIDEOS: VideoStat[] = [
  { id: '1', title: 'AI Art Masterclass: From Zero to Pro', thumbnail: '/analytics/vid1.jpg', views: 342000, watchTime: 12400, likes: 18200, comments: 1420, shares: 3800, ctr: 12.4, publishedAt: '2026-08-15T10:00:00Z', trend: 'up' },
  { id: '2', title: 'The Future of AI Music Production', thumbnail: '/analytics/vid2.jpg', views: 218000, watchTime: 8900, likes: 12100, comments: 890, shares: 2100, ctr: 9.8, publishedAt: '2026-08-22T14:00:00Z', trend: 'up' },
  { id: '3', title: 'Real-Time Neural Style Transfer', thumbnail: '/analytics/vid3.jpg', views: 156000, watchTime: 6200, likes: 8900, comments: 654, shares: 1800, ctr: 11.2, publishedAt: '2026-09-01T09:00:00Z', trend: 'stable' },
  { id: '4', title: 'Building AI Tools for Creators', thumbnail: '/analytics/vid4.jpg', views: 98000, watchTime: 4100, likes: 5600, comments: 420, shares: 980, ctr: 7.6, publishedAt: '2026-09-05T16:00:00Z', trend: 'down' },
  { id: '5', title: 'Podcast Editing with AI', thumbnail: '/analytics/vid5.jpg', views: 67000, watchTime: 2800, likes: 3200, comments: 280, shares: 640, ctr: 8.9, publishedAt: '2026-09-08T11:00:00Z', trend: 'up' },
];

const TIME_RANGES = ['7 days', '30 days', '90 days', '12 months'] as const;

function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toString();
}

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState('30 days');
  const [hoveredMetric, setHoveredMetric] = useState<string | null>(null);

  const sortedVideos = useMemo(() => [...TOP_VIDEOS].sort((a, b) => b.views - a.views), []);

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">Analytics</h1>
            <p className="text-zinc-400 mt-1">Insights into your content performance</p>
          </div>
          <select value={timeRange} onChange={(e) => setTimeRange(e.target.value)} className="px-4 py-2.5 bg-zinc-900 border border-zinc-700 rounded-lg text-sm text-zinc-300 focus:outline-none focus:ring-2 focus:ring-pink-500">
            {TIME_RANGES.map((tr) => <option key={tr} value={tr}>{tr}</option>)}
          </select>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          {METRICS.map((metric) => (
            <div
              key={metric.label}
              className={`bg-zinc-900 border border-zinc-800 rounded-xl p-5 transition-all cursor-pointer hover:border-zinc-700 ${hoveredMetric === metric.label ? 'scale-[1.02] shadow-lg shadow-pink-500/5' : ''}`}
              onMouseEnter={() => setHoveredMetric(metric.label)}
              onMouseLeave={() => setHoveredMetric(null)}
            >
              <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${metric.color} bg-opacity-20 flex items-center justify-center mb-3`}>
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d={metric.icon} /></svg>
              </div>
              <p className="text-xs text-zinc-500 mb-1">{metric.label}</p>
              <p className="text-xl font-bold text-white">{metric.value}</p>
              <span className={`text-xs font-medium ${metric.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {metric.change >= 0 ? '+' : ''}{metric.change}%
              </span>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2 bg-zinc-900 border border-zinc-800 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Views Trend</h3>
            <div className="h-48 flex items-end gap-1">
              {[65, 72, 48, 85, 92, 78, 95, 88, 76, 102, 98, 110, 95, 82, 115, 105, 88, 120, 112, 98, 130, 125, 108, 140, 135, 118, 145, 142, 128, 155].map((v, i) => (
                <div key={i} className="flex-1 bg-gradient-to-t from-pink-500 to-purple-500 rounded-t opacity-80 hover:opacity-100 transition-all cursor-pointer" style={{ height: `${(v / 160) * 100}%` }} title={`Day ${i + 1}: ${v}K views`} />
              ))}
            </div>
            <div className="flex justify-between mt-2 text-xs text-zinc-500">
              <span>30 days ago</span>
              <span>Today</span>
            </div>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Traffic Sources</h3>
            <div className="space-y-4">
              {[
                { source: 'Search', pct: 38, color: 'from-pink-500 to-rose-500' },
                { source: 'Suggested', pct: 28, color: 'from-purple-500 to-violet-500' },
                { source: 'Browse', pct: 18, color: 'from-blue-500 to-cyan-500' },
                { source: 'External', pct: 10, color: 'from-emerald-500 to-teal-500' },
                { source: 'Direct', pct: 6, color: 'from-amber-500 to-orange-500' },
              ].map((item) => (
                <div key={item.source}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-zinc-300">{item.source}</span>
                    <span className="text-sm font-medium text-white">{item.pct}%</span>
                  </div>
                  <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                    <div className={`h-full bg-gradient-to-r ${item.color} rounded-full transition-all duration-700`} style={{ width: `${item.pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
          <div className="p-6 border-b border-zinc-800">
            <h3 className="text-lg font-semibold text-white">Top Performing Videos</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-zinc-800">
                  <th className="text-left px-6 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider">Video</th>
                  <th className="text-right px-4 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider">Views</th>
                  <th className="text-right px-4 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider">Watch Time</th>
                  <th className="text-right px-4 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider">Likes</th>
                  <th className="text-right px-4 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider">Comments</th>
                  <th className="text-right px-4 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider">CTR</th>
                  <th className="text-center px-4 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider">Trend</th>
                </tr>
              </thead>
              <tbody>
                {sortedVideos.map((video, idx) => (
                  <tr key={video.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <span className="text-sm text-zinc-500 font-mono w-6">{idx + 1}</span>
                        <img src={video.thumbnail} alt={video.title} className="w-16 h-10 rounded object-cover" loading="lazy" />
                        <span className="text-sm text-white font-medium line-clamp-1">{video.title}</span>
                      </div>
                    </td>
                    <td className="text-right px-4 py-4 text-sm text-white font-medium">{formatNumber(video.views)}</td>
                    <td className="text-right px-4 py-4 text-sm text-zinc-400">{formatNumber(video.watchTime)} hrs</td>
                    <td className="text-right px-4 py-4 text-sm text-zinc-400">{formatNumber(video.likes)}</td>
                    <td className="text-right px-4 py-4 text-sm text-zinc-400">{formatNumber(video.comments)}</td>
                    <td className="text-right px-4 py-4 text-sm text-zinc-400">{video.ctr}%</td>
                    <td className="text-center px-4 py-4">
                      <span className={`inline-flex items-center gap-1 text-xs font-medium ${video.trend === 'up' ? 'text-green-400' : video.trend === 'down' ? 'text-red-400' : 'text-zinc-500'}`}>
                        {video.trend === 'up' ? '↑' : video.trend === 'down' ? '↓' : '→'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
