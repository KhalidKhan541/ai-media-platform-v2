'use client';

import { useState } from 'react';

interface Transaction {
  id: string;
  type: 'subscription' | 'ad-revenue' | 'tip' | 'brand-deal' | 'course-sale' | 'payout';
  description: string;
  amount: number;
  date: string;
  status: 'completed' | 'pending' | 'processing';
}

interface PayoutMethod {
  id: string;
  type: 'bank' | 'paypal' | 'crypto';
  label: string;
  detail: string;
  isDefault: boolean;
}

const TRANSACTIONS: Transaction[] = [
  { id: '1', type: 'subscription', description: 'Channel subscription - Pro tier', amount: 9.99, date: '2026-09-12T10:00:00Z', status: 'completed' },
  { id: '2', type: 'ad-revenue', description: 'Ad revenue - AI Art Masterclass', amount: 124.50, date: '2026-09-11T14:00:00Z', status: 'completed' },
  { id: '3', type: 'tip', description: 'Fan tip from @creativeuser', amount: 25.00, date: '2026-09-11T09:00:00Z', status: 'completed' },
  { id: '4', type: 'brand-deal', description: 'TechVision campaign payment', amount: 2500.00, date: '2026-09-10T16:00:00Z', status: 'pending' },
  { id: '5', type: 'subscription', description: 'Channel subscription - Pro tier', amount: 9.99, date: '2026-09-10T10:00:00Z', status: 'completed' },
  { id: '6', type: 'course-sale', description: 'AI Art Masterclass enrollment', amount: 49.99, date: '2026-09-09T11:00:00Z', status: 'completed' },
  { id: '7', type: 'ad-revenue', description: 'Ad revenue - Music Production Series', amount: 87.30, date: '2026-09-09T08:00:00Z', status: 'completed' },
  { id: '8', type: 'payout', description: 'Monthly payout to bank account', amount: -3200.00, date: '2026-09-01T00:00:00Z', status: 'completed' },
  { id: '9', type: 'subscription', description: 'Channel subscription - Enterprise tier', amount: 29.99, date: '2026-08-30T10:00:00Z', status: 'completed' },
  { id: '10', type: 'tip', description: 'Fan tip from @musiclover', amount: 10.00, date: '2026-08-29T14:00:00Z', status: 'completed' },
];

const PAYOUT_METHODS: PayoutMethod[] = [
  { id: '1', type: 'bank', label: 'Bank Transfer', detail: 'Chase ••••4892', isDefault: true },
  { id: '2', type: 'paypal', label: 'PayPal', detail: 'creator@email.com', isDefault: false },
  { id: '3', type: 'crypto', label: 'USDC Wallet', detail: '0x1234...5678', isDefault: false },
];

const EARNING_STATS = [
  { label: 'This Month', value: '$4,250', sub: '+8.3% vs last month', color: 'from-pink-500 to-rose-500' },
  { label: 'Last Month', value: '$3,925', sub: 'Aug 2026', color: 'from-purple-500 to-violet-500' },
  { label: 'All Time', value: '$51,200', sub: 'Since Jan 2026', color: 'from-blue-500 to-cyan-500' },
  { label: 'Pending', value: '$2,510', sub: '2 pending payments', color: 'from-amber-500 to-orange-500' },
];

function formatCurrency(n: number): string {
  const abs = Math.abs(n);
  if (abs >= 1000) return `${n < 0 ? '-' : ''}$${(abs / 1000).toFixed(1)}K`;
  return `${n < 0 ? '-' : ''}$${abs.toFixed(2)}`;
}

function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

const TYPE_STYLES: Record<string, { icon: string; color: string }> = {
  subscription: { icon: 'M16.5 6v.75m0 3v.75m0 3v.75m0 3V18m-9-5.25h5.25M7.5 15h3M3.375 5.25c-.621 0-1.125.504-1.125 1.125v3.026a2.999 2.999 0 010 5.198v3.026c0 .621.504 1.125 1.125 1.125h17.25c.621 0 1.125-.504 1.125-1.125v-3.026a2.999 2.999 0 010-5.198V6.375c0-.621-.504-1.125-1.125-1.125H3.375z', color: 'text-pink-400' },
  'ad-revenue': { icon: 'M10.34 15.84c-.688-.06-1.386-.09-2.09-.09H7.5a4.5 4.5 0 110-9h.75c.704 0 1.402-.03 2.09-.09m0 9.18c.253.962.584 1.892.985 2.783.247.55.06 1.21-.463 1.511l-.657.38c-.551.318-1.26.117-1.52-.461a20.845 20.845 0 01-1.44-4.282m3.102.069a18.03 18.03 0 01-.59-4.59c0-1.586.205-3.124.59-4.59m0 9.18a23.848 23.848 0 018.835 2.535M10.34 6.66a23.847 23.847 0 008.835-2.535m0 0A23.74 23.74 0 0018.795 3m.38 1.125a23.91 23.91 0 011.014 5.395m-1.014 8.855c-.118.38-.245.754-.38 1.125m.38-1.125a23.91 23.91 0 001.014-5.395m0-3.46c.495.413.811 1.035.811 1.73 0 .695-.316 1.317-.811 1.73m0-3.46a24.347 24.347 0 010 3.46', color: 'text-purple-400' },
  tip: { icon: 'M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z', color: 'text-rose-400' },
  'brand-deal': { icon: 'M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0M12 12.75h.008v.008H12v-.008z', color: 'text-emerald-400' },
  'course-sale': { icon: 'M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5', color: 'text-blue-400' },
  payout: { icon: 'M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z', color: 'text-amber-400' },
};

export default function EarningsPage() {
  const [tab, setTab] = useState<'overview' | 'transactions' | 'payouts'>('overview');
  const [txFilter, setTxFilter] = useState<string>('all');

  const filtered = txFilter === 'all' ? TRANSACTIONS : TRANSACTIONS.filter(t => t.type === txFilter);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Earnings</h1>
          <p className="text-zinc-400 mt-1">Track your revenue and manage payouts</p>
        </div>
        <button className="px-5 py-2.5 text-sm font-semibold bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-lg hover:shadow-lg hover:shadow-pink-500/25 transition-all">
          Request Payout
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {EARNING_STATS.map((stat) => (
          <div key={stat.label} className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
            <p className="text-xs text-zinc-500 mb-1">{stat.label}</p>
            <p className="text-2xl font-bold text-white">{stat.value}</p>
            <p className="text-xs text-zinc-500 mt-1">{stat.sub}</p>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-1 bg-zinc-900 border border-zinc-800 rounded-lg p-1 w-fit">
        {(['overview', 'transactions', 'payouts'] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)} className={`px-5 py-2 text-sm font-medium rounded-md transition-all capitalize ${tab === t ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white' : 'text-zinc-400 hover:text-white'}`}>
            {t}
          </button>
        ))}
      </div>

      {tab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Revenue by Source</h3>
            <div className="space-y-4">
              {[
                { name: 'Subscriptions', amount: 4250, pct: 35 },
                { name: 'Ad Revenue', amount: 2800, pct: 23 },
                { name: 'Brand Deals', amount: 3500, pct: 29 },
                { name: 'Tips & Donations', amount: 890, pct: 7 },
                { name: 'Courses', amount: 1800, pct: 15 },
              ].map((source) => (
                <div key={source.name}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-zinc-300">{source.name}</span>
                    <span className="text-sm font-medium text-white">${source.amount.toLocaleString()}</span>
                  </div>
                  <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-pink-500 to-purple-500 rounded-full transition-all duration-700" style={{ width: `${source.pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Payout Methods</h3>
            <div className="space-y-3">
              {PAYOUT_METHODS.map((method) => (
                <div key={method.id} className="flex items-center gap-4 p-4 bg-zinc-800/50 rounded-lg">
                  <div className="w-10 h-10 rounded-lg bg-zinc-800 flex items-center justify-center">
                    {method.type === 'bank' && <svg className="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0012 9.75c-2.551 0-5.056.2-7.5.582V21M3 21h18M12 6.75h.008v.008H12V6.75z" /></svg>}
                    {method.type === 'paypal' && <svg className="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                    {method.type === 'crypto' && <svg className="w-5 h-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 0v3.75m-16.5-3.75v3.75m16.5 0v3.75C20.25 16.153 16.556 18 12 18s-8.25-1.847-8.25-4.125v-3.75m16.5 0c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125" /></svg>}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-white">{method.label}</p>
                      {method.isDefault && <span className="px-2 py-0.5 text-[10px] font-bold bg-pink-500/20 text-pink-400 rounded-full">Default</span>}
                    </div>
                    <p className="text-xs text-zinc-500">{method.detail}</p>
                  </div>
                  <button className="text-xs text-zinc-500 hover:text-white transition-colors">Edit</button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {tab === 'transactions' && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            {['all', 'subscription', 'ad-revenue', 'tip', 'brand-deal', 'course-sale', 'payout'].map((f) => (
              <button key={f} onClick={() => setTxFilter(f)} className={`px-3 py-1.5 text-xs font-medium rounded-full transition-all capitalize ${txFilter === f ? 'bg-pink-500/20 text-pink-400 border border-pink-500/30' : 'bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-700'}`}>
                {f.replace('-', ' ')}
              </button>
            ))}
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-zinc-800">
                  <th className="text-left px-6 py-3 text-xs font-medium text-zinc-500 uppercase">Type</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 uppercase">Description</th>
                  <th className="text-right px-4 py-3 text-xs font-medium text-zinc-500 uppercase">Amount</th>
                  <th className="text-right px-4 py-3 text-xs font-medium text-zinc-500 uppercase">Date</th>
                  <th className="text-center px-4 py-3 text-xs font-medium text-zinc-500 uppercase">Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((tx) => (
                  <tr key={tx.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <svg className={`w-5 h-5 ${TYPE_STYLES[tx.type]?.color || 'text-zinc-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d={TYPE_STYLES[tx.type]?.icon || ''} /></svg>
                        <span className="text-sm text-zinc-300 capitalize">{tx.type.replace('-', ' ')}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-sm text-white">{tx.description}</td>
                    <td className={`text-right px-4 py-4 text-sm font-medium ${tx.amount >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {tx.amount >= 0 ? '+' : ''}{formatCurrency(tx.amount)}
                    </td>
                    <td className="text-right px-4 py-4 text-sm text-zinc-500">{formatDate(tx.date)}</td>
                    <td className="text-center px-4 py-4">
                      <span className={`px-2.5 py-0.5 text-[10px] font-bold rounded-full ${tx.status === 'completed' ? 'bg-green-900/30 text-green-400' : tx.status === 'pending' ? 'bg-yellow-900/30 text-yellow-400' : 'bg-blue-900/30 text-blue-400'}`}>{tx.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === 'payouts' && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Payout History</h3>
          <div className="space-y-3">
            {[
              { date: 'Sep 1, 2026', amount: '$3,200.00', method: 'Chase ••••4892', status: 'completed' },
              { date: 'Aug 1, 2026', amount: '$2,850.00', method: 'Chase ••••4892', status: 'completed' },
              { date: 'Jul 1, 2026', amount: '$2,100.00', method: 'Chase ••••4892', status: 'completed' },
              { date: 'Jun 1, 2026', amount: '$1,650.00', method: 'PayPal', status: 'completed' },
              { date: 'May 1, 2026', amount: '$980.00', method: 'PayPal', status: 'completed' },
            ].map((payout, i) => (
              <div key={i} className="flex items-center justify-between p-4 bg-zinc-800/50 rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-green-900/20 flex items-center justify-center">
                    <svg className="w-5 h-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">{payout.amount}</p>
                    <p className="text-xs text-zinc-500">{payout.method}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-zinc-400">{payout.date}</p>
                  <p className="text-xs text-green-400 capitalize">{payout.status}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
