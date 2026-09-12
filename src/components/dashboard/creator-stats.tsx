import { useState, useMemo } from 'react';

interface StatsData {
  totalViews: number;
  totalSubscribers: number;
  totalVideos: number;
  totalRevenue: number;
  viewsTrend: number;
  subscribersTrend: number;
  revenueTrend: number;
  watchTimeHours: number;
  avgViewDuration: string;
  topContent: {
    id: string;
    title: string;
    thumbnail: string;
    views: number;
    likes: number;
    publishedAt: string;
  }[];
  recentActivity: {
    id: string;
    type: 'upload' | 'comment' | 'milestone' | 'revenue';
    message: string;
    timestamp: string;
  }[];
  demographics: {
    age: { range: string; percentage: number }[];
    gender: { type: string; percentage: number }[];
    topCountries: { country: string; percentage: number; flag: string }[];
  };
}

interface CreatorStatsProps {
  data: StatsData;
  onViewAll?: () => void;
}

function formatNumber(num: number): string {
  if (num >= 1_000_000_000) return `${(num / 1_000_000_000).toFixed(1)}B`;
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
  if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K`;
  return num.toString();
}

function formatCurrency(num: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
  }).format(num);
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
  return `${Math.floor(days / 7)}w ago`;
}

export default function CreatorStats({ data, onViewAll }: CreatorStatsProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'content' | 'audience'>('overview');

  const stats = useMemo(
    () => [
      {
        label: 'Total Views',
        value: formatNumber(data.totalViews),
        trend: data.viewsTrend,
        icon: (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        ),
        color: 'text-blue-400',
        bgColor: 'bg-blue-500/10',
      },
      {
        label: 'Subscribers',
        value: formatNumber(data.totalSubscribers),
        trend: data.subscribersTrend,
        icon: (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
          </svg>
        ),
        color: 'text-purple-400',
        bgColor: 'bg-purple-500/10',
      },
      {
        label: 'Revenue',
        value: formatCurrency(data.totalRevenue),
        trend: data.revenueTrend,
        icon: (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        ),
        color: 'text-emerald-400',
        bgColor: 'bg-emerald-500/10',
      },
      {
        label: 'Watch Time',
        value: `${formatNumber(data.watchTimeHours)}h`,
        trend: 0,
        icon: (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        ),
        color: 'text-yellow-400',
        bgColor: 'bg-yellow-500/10',
      },
    ],
    [data]
  );

  return (
    <div className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-6 pb-0">
        <div>
          <h3 className="text-lg font-bold text-white">Creator Dashboard</h3>
          <p className="text-xs text-zinc-500 mt-0.5">Your channel performance at a glance</p>
        </div>
        {onViewAll && (
          <button
            onClick={onViewAll}
            className="px-4 py-2 text-xs font-medium bg-zinc-800 text-zinc-300 rounded-lg hover:bg-zinc-700 hover:text-white transition-colors"
          >
            View All
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 px-6 pt-4">
        {(['overview', 'content', 'audience'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-medium rounded-lg capitalize transition-colors ${
              activeTab === tab
                ? 'bg-zinc-800 text-white'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="p-6">
        {activeTab === 'overview' && (
          <>
            {/* Stats grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
              {stats.map((stat) => (
                <div key={stat.label} className="p-4 bg-zinc-800/50 rounded-xl">
                  <div className="flex items-center gap-2 mb-2">
                    <div className={`p-1.5 rounded-lg ${stat.bgColor} ${stat.color}`}>
                      {stat.icon}
                    </div>
                    {stat.trend !== 0 && (
                      <span
                        className={`text-[10px] font-bold ${
                          stat.trend >= 0 ? 'text-emerald-400' : 'text-red-400'
                        }`}
                      >
                        {stat.trend >= 0 ? '+' : ''}{stat.trend.toFixed(1)}%
                      </span>
                    )}
                  </div>
                  <p className="text-xl font-bold text-white">{stat.value}</p>
                  <p className="text-xs text-zinc-500 mt-1">{stat.label}</p>
                </div>
              ))}
            </div>

            {/* Quick stats row */}
            <div className="flex items-center gap-6 p-4 bg-zinc-800/30 rounded-xl mb-6">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-400" />
                <span className="text-xs text-zinc-400">Avg. Duration: {data.avgViewDuration}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-blue-400" />
                <span className="text-xs text-zinc-400">Total Videos: {data.totalVideos}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-purple-400" />
                <span className="text-xs text-zinc-400">Engagement: 4.8%</span>
              </div>
            </div>

            {/* Recent activity */}
            <div>
              <h4 className="text-sm font-semibold text-white mb-3">Recent Activity</h4>
              <div className="space-y-2">
                {data.recentActivity.slice(0, 5).map((activity) => {
                  const iconBg =
                    activity.type === 'upload'
                      ? 'bg-blue-500/10 text-blue-400'
                      : activity.type === 'comment'
                      ? 'bg-green-500/10 text-green-400'
                      : activity.type === 'milestone'
                      ? 'bg-yellow-500/10 text-yellow-400'
                      : 'bg-emerald-500/10 text-emerald-400';

                  return (
                    <div
                      key={activity.id}
                      className="flex items-center gap-3 py-2 px-3 rounded-lg hover:bg-zinc-800/50 transition-colors"
                    >
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${iconBg}`}>
                        {activity.type === 'upload' && (
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                          </svg>
                        )}
                        {activity.type === 'comment' && (
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 2.104.859 4.023 2.273 5.48.432.447.74 1.04.586 1.641a4.483 4.483 0 01-.923 1.785A5.969 5.969 0 006 21c1.282 0 2.47-.402 3.445-1.087.81.22 1.668.337 2.555.337z" />
                          </svg>
                        )}
                        {activity.type === 'milestone' && (
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
                          </svg>
                        )}
                        {activity.type === 'revenue' && (
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        )}
                      </div>
                      <p className="text-sm text-zinc-300 flex-1 line-clamp-1">{activity.message}</p>
                      <span className="text-[10px] text-zinc-500 flex-shrink-0">
                        {timeAgo(activity.timestamp)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}

        {activeTab === 'content' && (
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-white mb-3">Top Performing Content</h4>
            {data.topContent.map((content, index) => (
              <div
                key={content.id}
                className="flex items-center gap-4 p-3 rounded-xl hover:bg-zinc-800/50 transition-colors cursor-pointer"
              >
                <span className="text-sm font-bold text-zinc-500 w-6 text-center">#{index + 1}</span>
                <img
                  src={content.thumbnail}
                  alt={content.title}
                  className="w-20 h-12 rounded-lg object-cover bg-zinc-800 flex-shrink-0"
                  loading="lazy"
                />
                <div className="flex-1 min-w-0">
                  <h5 className="text-sm font-medium text-white line-clamp-1">{content.title}</h5>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-xs text-zinc-400">{formatNumber(content.views)} views</span>
                    <span className="text-xs text-zinc-500">·</span>
                    <span className="text-xs text-zinc-400">{formatNumber(content.likes)} likes</span>
                    <span className="text-xs text-zinc-500">·</span>
                    <span className="text-xs text-zinc-500">{timeAgo(content.publishedAt)}</span>
                  </div>
                </div>
                <div className="hidden sm:block">
                  <div className="w-16 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 rounded-full"
                      style={{ width: `${Math.min((content.views / Math.max(...data.topContent.map((c) => c.views), 1)) * 100, 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'audience' && (
          <div className="space-y-6">
            {/* Age demographics */}
            <div>
              <h4 className="text-sm font-semibold text-white mb-3">Age Demographics</h4>
              <div className="space-y-2">
                {data.demographics.age.map((age) => (
                  <div key={age.range} className="flex items-center gap-3">
                    <span className="text-xs text-zinc-400 w-12">{age.range}</span>
                    <div className="flex-1 h-3 bg-zinc-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-500"
                        style={{ width: `${age.percentage}%` }}
                      />
                    </div>
                    <span className="text-xs text-zinc-500 w-10 text-right">{age.percentage}%</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Gender */}
            <div>
              <h4 className="text-sm font-semibold text-white mb-3">Gender</h4>
              <div className="flex items-center gap-4">
                {data.demographics.gender.map((g) => (
                  <div key={g.type} className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-zinc-400 capitalize">{g.type}</span>
                      <span className="text-xs font-medium text-white">{g.percentage}%</span>
                    </div>
                    <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          g.type === 'male' ? 'bg-blue-500' : g.type === 'female' ? 'bg-pink-500' : 'bg-purple-500'
                        }`}
                        style={{ width: `${g.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Top countries */}
            <div>
              <h4 className="text-sm font-semibold text-white mb-3">Top Countries</h4>
              <div className="space-y-2">
                {data.demographics.topCountries.map((country) => (
                  <div
                    key={country.country}
                    className="flex items-center gap-3 py-2 px-3 rounded-lg hover:bg-zinc-800/50 transition-colors"
                  >
                    <span className="text-lg">{country.flag}</span>
                    <span className="text-sm text-zinc-300 flex-1">{country.country}</span>
                    <div className="w-24 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 rounded-full"
                        style={{ width: `${country.percentage}%` }}
                      />
                    </div>
                    <span className="text-xs text-zinc-500 w-10 text-right">{country.percentage}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
