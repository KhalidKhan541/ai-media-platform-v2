import { useState, useMemo } from 'react';

interface EarningsData {
  totalEarnings: number;
  monthlyEarnings: number;
  pendingPayout: number;
  revenueStreams: {
    id: string;
    name: string;
    amount: number;
    percentage: number;
    icon: string;
    color: string;
    trend: number;
  }[];
  payoutHistory: {
    id: string;
    date: string;
    amount: number;
    status: 'completed' | 'pending' | 'processing';
  }[];
  currency: string;
}

interface EarningsCardProps {
  data: EarningsData;
  onWithdraw?: () => void;
  onSeeAll?: () => void;
}

function formatCurrency(amount: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(amount);
}

function formatTrend(trend: number): { text: string; isPositive: boolean } {
  const isPositive = trend >= 0;
  return {
    text: `${isPositive ? '+' : ''}${trend.toFixed(1)}%`,
    isPositive,
  };
}

export default function EarningsCard({ data, onWithdraw, onSeeAll }: EarningsCardProps) {
  const [showPayouts, setShowPayouts] = useState(false);

  const trend = useMemo(() => formatTrend(
    data.payoutHistory.length >= 2
      ? ((data.payoutHistory[data.payoutHistory.length - 1]?.amount || 0) -
          (data.payoutHistory[data.payoutHistory.length - 2]?.amount || 0)) /
          Math.max(data.payoutHistory[data.payoutHistory.length - 2]?.amount || 1, 1) * 100
      : 0
  ), [data.payoutHistory]);

  return (
    <div className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
      {/* Main earnings */}
      <div className="p-6 sm:p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-sm font-medium text-zinc-400">Total Earnings</p>
            <div className="flex items-baseline gap-3 mt-1">
              <h2 className="text-3xl sm:text-4xl font-bold text-white">
                {formatCurrency(data.totalEarnings, data.currency)}
              </h2>
              <span
                className={`text-sm font-semibold ${
                  trend.isPositive ? 'text-emerald-400' : 'text-red-400'
                }`}
              >
                {trend.text}
              </span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-600/10 flex items-center justify-center">
            <svg className="w-6 h-6 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>

        {/* Quick stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <div className="p-4 bg-zinc-800/50 rounded-xl">
            <p className="text-xs text-zinc-500 uppercase tracking-wider">This Month</p>
            <p className="text-xl font-bold text-white mt-1">
              {formatCurrency(data.monthlyEarnings, data.currency)}
            </p>
          </div>
          <div className="p-4 bg-zinc-800/50 rounded-xl">
            <p className="text-xs text-zinc-500 uppercase tracking-wider">Pending Payout</p>
            <p className="text-xl font-bold text-yellow-400 mt-1">
              {formatCurrency(data.pendingPayout, data.currency)}
            </p>
          </div>
          <div className="p-4 bg-zinc-800/50 rounded-xl col-span-2 sm:col-span-1">
            <p className="text-xs text-zinc-500 uppercase tracking-wider">Next Payout</p>
            <p className="text-xl font-bold text-white mt-1">
              {new Date(Date.now() + 7 * 86400000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </p>
          </div>
        </div>

        {/* Withdraw button */}
        {data.pendingPayout > 0 && (
          <button
            onClick={onWithdraw}
            className="w-full mt-6 py-3 bg-emerald-600 text-white text-sm font-semibold rounded-xl hover:bg-emerald-500 transition-colors"
          >
            Withdraw {formatCurrency(data.pendingPayout, data.currency)}
          </button>
        )}
      </div>

      {/* Revenue streams */}
      <div className="border-t border-zinc-800 px-6 sm:px-8 py-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-white">Revenue Streams</h3>
          {onSeeAll && (
            <button
              onClick={onSeeAll}
              className="text-xs text-zinc-400 hover:text-white transition-colors"
            >
              View Details
            </button>
          )}
        </div>

        <div className="space-y-3">
          {data.revenueStreams.map((stream) => {
            const streamTrend = formatTrend(stream.trend);
            return (
              <div key={stream.id} className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: `${stream.color}20` }}
                >
                  <span className="text-lg">{stream.icon}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-zinc-200">{stream.name}</span>
                    <span className="text-sm font-semibold text-white">
                      {formatCurrency(stream.amount, data.currency)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-1.5">
                    <div className="flex-1 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${stream.percentage}%`,
                          backgroundColor: stream.color,
                        }}
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-zinc-500">{stream.percentage}%</span>
                      <span
                        className={`text-[10px] font-medium ${
                          streamTrend.isPositive ? 'text-emerald-400' : 'text-red-400'
                        }`}
                      >
                        {streamTrend.text}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Payout history */}
      <div className="border-t border-zinc-800 px-6 sm:px-8 py-6">
        <button
          onClick={() => setShowPayouts(!showPayouts)}
          className="flex items-center justify-between w-full"
        >
          <h3 className="text-sm font-semibold text-white">Recent Payouts</h3>
          <svg
            className={`w-4 h-4 text-zinc-400 transition-transform ${showPayouts ? 'rotate-180' : ''}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
          </svg>
        </button>

        {showPayouts && (
          <div className="mt-4 space-y-2">
            {data.payoutHistory.map((payout) => (
              <div
                key={payout.id}
                className="flex items-center justify-between py-3 border-b border-zinc-800 last:border-0"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      payout.status === 'completed'
                        ? 'bg-emerald-400'
                        : payout.status === 'pending'
                        ? 'bg-yellow-400'
                        : 'bg-blue-400'
                    }`}
                  />
                  <div>
                    <p className="text-sm text-zinc-300">
                      {new Date(payout.date).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </p>
                    <p className="text-[10px] text-zinc-500 capitalize">{payout.status}</p>
                  </div>
                </div>
                <span className="text-sm font-semibold text-white">
                  {formatCurrency(payout.amount, data.currency)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
