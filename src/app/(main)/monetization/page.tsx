'use client';

import { useState } from 'react';

interface RevenueStream {
  id: string;
  name: string;
  type: 'subscriptions' | 'ads' | 'tips' | 'merch' | 'brand-deals' | 'courses';
  icon: string;
  monthlyRevenue: number;
  totalRevenue: number;
  change: number;
  isActive: boolean;
}

interface BrandDeal {
  id: string;
  brand: string;
  logo: string;
  campaign: string;
  status: 'pending' | 'active' | 'completed' | 'expired';
  budget: number;
  deadline: string;
  deliverables: number;
  completed: number;
}

const REVENUE_STREAMS: RevenueStream[] = [
  { id: '1', name: 'Channel Subscriptions', type: 'subscriptions', icon: 'M16.5 6v.75m0 3v.75m0 3v.75m0 3V18m-9-5.25h5.25M7.5 15h3M3.375 5.25c-.621 0-1.125.504-1.125 1.125v3.026a2.999 2.999 0 010 5.198v3.026c0 .621.504 1.125 1.125 1.125h17.25c.621 0 1.125-.504 1.125-1.125v-3.026a2.999 2.999 0 010-5.198V6.375c0-.621-.504-1.125-1.125-1.125H3.375z', monthlyRevenue: 4250, totalRevenue: 51000, change: 12.5, isActive: true },
  { id: '2', name: 'Ad Revenue', type: 'ads', icon: 'M10.34 15.84c-.688-.06-1.386-.09-2.09-.09H7.5a4.5 4.5 0 110-9h.75c.704 0 1.402-.03 2.09-.09m0 9.18c.253.962.584 1.892.985 2.783.247.55.06 1.21-.463 1.511l-.657.38c-.551.318-1.26.117-1.52-.461a20.845 20.845 0 01-1.44-4.282m3.102.069a18.03 18.03 0 01-.59-4.59c0-1.586.205-3.124.59-4.59m0 9.18a23.848 23.848 0 018.835 2.535M10.34 6.66a23.847 23.847 0 008.835-2.535m0 0A23.74 23.74 0 0018.795 3m.38 1.125a23.91 23.91 0 011.014 5.395m-1.014 8.855c-.118.38-.245.754-.38 1.125m.38-1.125a23.91 23.91 0 001.014-5.395m0-3.46c.495.413.811 1.035.811 1.73 0 .695-.316 1.317-.811 1.73m0-3.46a24.347 24.347 0 010 3.46', monthlyRevenue: 2800, totalRevenue: 33600, change: -3.2, isActive: true },
  { id: '3', name: 'Tips & Donations', type: 'tips', icon: 'M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z', monthlyRevenue: 890, totalRevenue: 10680, change: 28.4, isActive: true },
  { id: '4', name: 'Merchandise', type: 'merch', icon: 'M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z', monthlyRevenue: 1200, totalRevenue: 14400, change: 5.1, isActive: false },
  { id: '5', name: 'Brand Deals', type: 'brand-deals', icon: 'M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0M12 12.75h.008v.008H12v-.008z', monthlyRevenue: 3500, totalRevenue: 42000, change: 8.7, isActive: true },
  { id: '6', name: 'Online Courses', type: 'courses', icon: 'M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5', monthlyRevenue: 1800, totalRevenue: 21600, change: 15.3, isActive: true },
];

const BRAND_DEALS: BrandDeal[] = [
  { id: '1', brand: 'TechVision', logo: '/brands/techvision.png', campaign: 'AI Product Launch Campaign', status: 'active', budget: 5000, deadline: '2026-09-30', deliverables: 4, completed: 2 },
  { id: '2', brand: 'CreativeFlow', logo: '/brands/creativeflow.png', campaign: 'Creator Tools Review Series', status: 'pending', budget: 3000, deadline: '2026-10-15', deliverables: 3, completed: 0 },
  { id: '3', brand: 'NeuralSound', logo: '/brands/neuralsound.png', campaign: 'AI Music Feature Spotlight', status: 'completed', budget: 8000, deadline: '2026-08-20', deliverables: 6, completed: 6 },
  { id: '4', brand: 'PixelPerfect', logo: '/brands/pixelperfect.png', campaign: 'Video Editing Workshop', status: 'expired', budget: 2500, deadline: '2026-07-01', deliverables: 2, completed: 1 },
];

function formatCurrency(n: number): string {
  if (n >= 1000) return `$${(n / 1000).toFixed(1)}K`;
  return `$${n}`;
}

const STATUS_STYLES: Record<string, string> = {
  pending: 'bg-yellow-900/30 text-yellow-400 border-yellow-800',
  active: 'bg-green-900/30 text-green-400 border-green-800',
  completed: 'bg-blue-900/30 text-blue-400 border-blue-800',
  expired: 'bg-zinc-800 text-zinc-500 border-zinc-700',
};

export default function MonetizationPage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'streams' | 'brand-deals'>('overview');

  const totalMonthly = REVENUE_STREAMS.filter(s => s.isActive).reduce((sum, s) => sum + s.monthlyRevenue, 0);
  const totalAllTime = REVENUE_STREAMS.reduce((sum, s) => sum + s.totalRevenue, 0);

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">Monetization</h1>
            <p className="text-zinc-400 mt-1">Track and manage your revenue streams</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl px-5 py-3 text-center">
              <p className="text-xs text-zinc-500">Monthly Revenue</p>
              <p className="text-2xl font-bold text-pink-400">{formatCurrency(totalMonthly)}</p>
            </div>
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl px-5 py-3 text-center">
              <p className="text-xs text-zinc-500">All-Time Revenue</p>
              <p className="text-2xl font-bold text-white">{formatCurrency(totalAllTime)}</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1 mb-6 bg-zinc-900 border border-zinc-800 rounded-lg p-1 w-fit">
          {(['overview', 'streams', 'brand-deals'] as const).map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)} className={`px-5 py-2 text-sm font-medium rounded-md transition-all capitalize ${activeTab === tab ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white' : 'text-zinc-400 hover:text-white'}`}>
              {tab.replace('-', ' ')}
            </button>
          ))}
        </div>

        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {REVENUE_STREAMS.filter(s => s.isActive).map((stream) => (
                <div key={stream.id} className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 hover:border-zinc-700 transition-colors">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-pink-500/20 to-purple-500/20 flex items-center justify-center">
                      <svg className="w-4 h-4 text-pink-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d={stream.icon} /></svg>
                    </div>
                    <span className="text-xs font-medium text-zinc-400">{stream.name}</span>
                  </div>
                  <p className="text-xl font-bold text-white">{formatCurrency(stream.monthlyRevenue)}</p>
                  <div className="flex items-center gap-1 mt-1">
                    <span className={`text-xs font-medium ${stream.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {stream.change >= 0 ? '+' : ''}{stream.change}%
                    </span>
                    <span className="text-xs text-zinc-500">vs last month</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Revenue Breakdown</h3>
              <div className="space-y-4">
                {REVENUE_STREAMS.filter(s => s.isActive).map((stream) => {
                  const pct = totalMonthly > 0 ? (stream.monthlyRevenue / totalMonthly) * 100 : 0;
                  return (
                    <div key={stream.id}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-zinc-300">{stream.name}</span>
                        <span className="text-sm text-zinc-400">{formatCurrency(stream.monthlyRevenue)} ({pct.toFixed(1)}%)</span>
                      </div>
                      <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-pink-500 to-purple-500 rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'streams' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {REVENUE_STREAMS.map((stream) => (
              <div key={stream.id} className={`bg-zinc-900 border rounded-xl p-6 transition-all ${stream.isActive ? 'border-zinc-800 hover:border-zinc-700' : 'border-zinc-800/50 opacity-60'}`}>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-pink-500/20 to-purple-500/20 flex items-center justify-center">
                      <svg className="w-5 h-5 text-pink-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d={stream.icon} /></svg>
                    </div>
                    <div>
                      <h3 className="font-semibold text-white">{stream.name}</h3>
                      <p className="text-xs text-zinc-500 capitalize">{stream.type.replace('-', ' ')}</p>
                    </div>
                  </div>
                  <div className={`w-3 h-3 rounded-full ${stream.isActive ? 'bg-green-500' : 'bg-zinc-600'}`} />
                </div>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-xs text-zinc-500">Monthly</p>
                    <p className="text-lg font-bold text-white">{formatCurrency(stream.monthlyRevenue)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-zinc-500">All-Time</p>
                    <p className="text-lg font-bold text-zinc-300">{formatCurrency(stream.totalRevenue)}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-medium ${stream.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {stream.change >= 0 ? '↑' : '↓'} {Math.abs(stream.change)}% this month
                  </span>
                  <button className="text-xs text-pink-400 hover:text-pink-300 font-medium">Details →</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'brand-deals' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold text-white">Brand Deals</h3>
              <button className="px-4 py-2 text-sm font-semibold bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-lg hover:shadow-lg hover:shadow-pink-500/25 transition-all">+ New Deal</button>
            </div>
            {BRAND_DEALS.map((deal) => (
              <div key={deal.id} className="flex items-center gap-5 bg-zinc-900 rounded-xl border border-zinc-800 p-5 hover:border-zinc-700 transition-all">
                <div className="w-12 h-12 rounded-xl bg-zinc-800 flex items-center justify-center text-lg font-bold text-pink-400 flex-shrink-0">{deal.brand.charAt(0)}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3">
                    <h4 className="font-semibold text-white">{deal.brand}</h4>
                    <span className={`px-2.5 py-0.5 text-[10px] font-bold uppercase rounded-full border ${STATUS_STYLES[deal.status]}`}>{deal.status}</span>
                  </div>
                  <p className="text-sm text-zinc-400 mt-0.5">{deal.campaign}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-lg font-bold text-white">{formatCurrency(deal.budget)}</p>
                  <p className="text-xs text-zinc-500">Due {new Date(deal.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
                </div>
                <div className="flex-shrink-0 w-32">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-zinc-500">{deal.completed}/{deal.deliverables}</span>
                    <span className="text-xs text-zinc-500">{deal.deliverables > 0 ? Math.round((deal.completed / deal.deliverables) * 100) : 0}%</span>
                  </div>
                  <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-pink-500 to-purple-500 rounded-full" style={{ width: `${deal.deliverables > 0 ? (deal.completed / deal.deliverables) * 100 : 0}%` }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
