import { useState, useMemo, useCallback } from 'react';

interface DataPoint {
  label: string;
  value: number;
  secondaryValue?: number;
}

interface ChartCardProps {
  title: string;
  subtitle?: string;
  data: DataPoint[];
  type?: 'line' | 'bar' | 'area';
  color?: string;
  secondaryColor?: string;
  showLegend?: boolean;
  legendItems?: { label: string; color: string }[];
  timeRange?: string;
  onTimeRangeChange?: (range: string) => void;
  totalValue?: number;
  totalLabel?: string;
  trend?: number;
  maxHeight?: number;
  valuePrefix?: string;
  valueSuffix?: string;
}

function formatValue(value: number, prefix: string = '', suffix: string = ''): string {
  let formatted: string;
  if (value >= 1_000_000) formatted = `${(value / 1_000_000).toFixed(1)}M`;
  else if (value >= 1_000) formatted = `${(value / 1_000).toFixed(1)}K`;
  else formatted = value.toLocaleString();
  return `${prefix}${formatted}${suffix}`;
}

export default function ChartCard({
  title,
  subtitle,
  data,
  type = 'line',
  color = '#10b981',
  secondaryColor = '#6366f1',
  showLegend = false,
  legendItems,
  timeRange = '7d',
  onTimeRangeChange,
  totalValue,
  totalLabel,
  trend,
  maxHeight = 200,
  valuePrefix = '',
  valueSuffix = '',
}: ChartCardProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const maxValue = useMemo(() => {
    const values = data.map((d) => Math.max(d.value, d.secondaryValue || 0));
    return Math.max(...values, 1);
  }, [data]);

  const chartPoints = useMemo(() => {
    if (data.length === 0) return { primary: '', secondary: '', area: '' };
    const width = 100;
    const height = maxHeight;
    const step = width / (data.length - 1 || 1);

    const points = data.map((d, i) => ({
      x: i * step,
      y: height - (d.value / maxValue) * height,
    }));

    const secondaryPoints = data.map((d, i) => ({
      x: i * step,
      y: height - ((d.secondaryValue || 0) / maxValue) * height,
    }));

    const primaryPath = points
      .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`)
      .join(' ');

    const secondaryPath = secondaryPoints
      .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`)
      .join(' ');

    const areaPath = `${primaryPath} L ${points[points.length - 1].x} ${height} L ${points[0].x} ${height} Z`;

    return { primary: primaryPath, secondary: secondaryPath, area: areaPath };
  }, [data, maxValue, maxHeight]);

  const timeRanges = [
    { value: '24h', label: '24H' },
    { value: '7d', label: '7D' },
    { value: '30d', label: '30D' },
    { value: '90d', label: '90D' },
    { value: '1y', label: '1Y' },
  ];

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<SVGElement>) => {
      const svg = e.currentTarget;
      const rect = svg.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const index = Math.round((x / 100) * (data.length - 1));
      setHoveredIndex(Math.max(0, Math.min(index, data.length - 1)));
    },
    [data.length]
  );

  return (
    <div className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-6 pb-0">
        <div>
          <h3 className="text-sm font-semibold text-white">{title}</h3>
          {subtitle && <p className="text-xs text-zinc-500 mt-0.5">{subtitle}</p>}
          {totalValue !== undefined && (
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-2xl font-bold text-white">
                {formatValue(totalValue, valuePrefix, valueSuffix)}
              </span>
              {trend !== undefined && (
                <span
                  className={`text-sm font-semibold ${
                    trend >= 0 ? 'text-emerald-400' : 'text-red-400'
                  }`}
                >
                  {trend >= 0 ? '+' : ''}{trend.toFixed(1)}%
                </span>
              )}
            </div>
          )}
        </div>

        {onTimeRangeChange && (
          <div className="flex items-center gap-1 mt-3 sm:mt-0 bg-zinc-800 rounded-lg p-1">
            {timeRanges.map((range) => (
              <button
                key={range.value}
                onClick={() => onTimeRangeChange(range.value)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                  timeRange === range.value
                    ? 'bg-zinc-700 text-white'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                {range.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Chart */}
      <div className="px-6 pt-4 pb-2">
        <svg
          viewBox={`0 0 100 ${maxHeight}`}
          className="w-full"
          style={{ height: maxHeight }}
          onMouseMove={handleMouseMove}
          onMouseLeave={() => setHoveredIndex(null)}
        >
          {/* Grid lines */}
          {[0.25, 0.5, 0.75].map((ratio) => (
            <line
              key={ratio}
              x1="0"
              y1={maxHeight * ratio}
              x2="100"
              y2={maxHeight * ratio}
              stroke="#27272a"
              strokeWidth="0.3"
              strokeDasharray="2,2"
            />
          ))}

          {/* Area */}
          {type === 'area' && (
            <path
              d={chartPoints.area}
              fill={`url(#gradient-${color.replace('#', '')})`}
              opacity="0.3"
            />
          )}

          {/* Secondary line */}
          {chartPoints.secondary && (
            <path
              d={chartPoints.secondary}
              fill="none"
              stroke={secondaryColor}
              strokeWidth="0.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity="0.6"
            />
          )}

          {/* Primary line/bar */}
          {type === 'bar' ? (
            data.map((d, i) => {
              const barWidth = 100 / data.length * 0.6;
              const x = (i / data.length) * 100 + (100 / data.length) * 0.2;
              const barHeight = (d.value / maxValue) * maxHeight;
              return (
                <rect
                  key={i}
                  x={x}
                  y={maxHeight - barHeight}
                  width={barWidth}
                  height={barHeight}
                  fill={hoveredIndex === i ? color : `${color}cc`}
                  rx="1"
                  className="transition-all duration-200"
                />
              );
            })
          ) : (
            <path
              d={chartPoints.primary}
              fill="none"
              stroke={color}
              strokeWidth="1"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {/* Hover dot */}
          {hoveredIndex !== null && type !== 'bar' && (
            <>
              <line
                x1={(hoveredIndex / (data.length - 1 || 1)) * 100}
                y1="0"
                x2={(hoveredIndex / (data.length - 1 || 1)) * 100}
                y2={maxHeight}
                stroke="#52525b"
                strokeWidth="0.3"
                strokeDasharray="2,2"
              />
              <circle
                cx={(hoveredIndex / (data.length - 1 || 1)) * 100}
                cy={maxHeight - (data[hoveredIndex].value / maxValue) * maxHeight}
                r="2"
                fill={color}
                stroke="#09090b"
                strokeWidth="1"
              />
            </>
          )}

          {/* Gradient definition */}
          <defs>
            <linearGradient id={`gradient-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity="0.4" />
              <stop offset="100%" stopColor={color} stopOpacity="0" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Tooltip */}
      {hoveredIndex !== null && (
        <div className="px-6 pb-2">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-zinc-800 rounded-lg text-xs">
            <span className="text-zinc-400">{data[hoveredIndex].label}</span>
            <span className="font-semibold text-white">
              {formatValue(data[hoveredIndex].value, valuePrefix, valueSuffix)}
            </span>
            {data[hoveredIndex].secondaryValue !== undefined && (
              <span className="font-semibold" style={{ color: secondaryColor }}>
                {formatValue(data[hoveredIndex].secondaryValue, valuePrefix, valueSuffix)}
              </span>
            )}
          </div>
        </div>
      )}

      {/* X-axis labels */}
      <div className="flex items-center justify-between px-6 pb-2">
        {data.filter((_, i) => {
          const step = Math.ceil(data.length / 6);
          return i % step === 0 || i === data.length - 1;
        }).map((d) => (
          <span key={d.label} className="text-[10px] text-zinc-500">
            {d.label}
          </span>
        ))}
      </div>

      {/* Legend */}
      {showLegend && legendItems && (
        <div className="flex items-center justify-center gap-4 pb-6">
          {legendItems.map((item) => (
            <div key={item.label} className="flex items-center gap-1.5">
              <div
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-xs text-zinc-400">{item.label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
