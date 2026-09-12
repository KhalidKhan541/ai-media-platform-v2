import { useState, useCallback } from 'react';

interface Channel {
  id: string;
  name: string;
  handle: string;
  avatar: string;
  banner: string;
  description: string;
  subscriberCount: number;
  videoCount: number;
  totalViews: number;
  joinedAt: string;
  links?: { label: string; url: string }[];
  badges?: string[];
  isSubscribed?: boolean;
  isVerified?: boolean;
}

interface ChannelHeaderProps {
  channel: Channel;
  onSubscribe?: (channelId: string) => void;
  onShare?: (channelId: string) => void;
}

function formatNumber(num: number): string {
  if (num >= 1_000_000_000) return `${(num / 1_000_000_000).toFixed(1)}B`;
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
  if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K`;
  return num.toString();
}

function timeAgo(date: string): string {
  const d = new Date(date);
  return d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

export default function ChannelHeader({ channel, onSubscribe, onShare }: ChannelHeaderProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [showFullDesc, setShowFullDesc] = useState(false);
  const [subscribed, setSubscribed] = useState(channel.isSubscribed || false);
  const [subscriberCount, setSubscriberCount] = useState(channel.subscriberCount);

  const handleSubscribe = useCallback(() => {
    setSubscribed((prev) => {
      const next = !prev;
      setSubscriberCount((c) => next ? c + 1 : c - 1);
      onSubscribe?.(channel.id);
      return next;
    });
  }, [channel.id, onSubscribe]);

  return (
    <div className="w-full">
      {/* Banner */}
      <div
        className="relative w-full h-32 sm:h-48 md:h-64 overflow-hidden rounded-b-2xl"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <img
          src={channel.banner}
          alt={`${channel.name} banner`}
          className={`w-full h-full object-cover transition-transform duration-700 ${
            isHovered ? 'scale-105' : 'scale-100'
          }`}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
      </div>

      {/* Info */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4 -mt-10 sm:-mt-14 relative z-10">
          {/* Avatar */}
          <div className="relative group">
            <img
              src={channel.avatar}
              alt={channel.name}
              className="w-24 h-24 sm:w-32 sm:h-32 rounded-full border-4 border-zinc-900 bg-zinc-800 object-cover shadow-2xl"
              loading="lazy"
            />
            {channel.isVerified && (
              <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-blue-500 rounded-full flex items-center justify-center border-2 border-zinc-900">
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />
                </svg>
              </div>
            )}
          </div>

          {/* Channel name and stats */}
          <div className="flex-1 min-w-0 pb-3">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-bold text-white truncate">{channel.name}</h1>
              {channel.badges?.map((badge) => (
                <span
                  key={badge}
                  className="px-2 py-0.5 text-[10px] font-bold bg-zinc-700 text-zinc-300 rounded-full uppercase"
                >
                  {badge}
                </span>
              ))}
            </div>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <span className="text-sm text-zinc-400">@{channel.handle}</span>
              <span className="text-zinc-600">·</span>
              <span className="text-sm text-zinc-400">
                {formatNumber(subscriberCount)} subscribers
              </span>
              <span className="text-zinc-600">·</span>
              <span className="text-sm text-zinc-400">
                {channel.videoCount.toLocaleString()} videos
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 pb-3">
            <button
              onClick={handleSubscribe}
              className={`px-6 py-2.5 text-sm font-semibold rounded-full transition-all duration-200 ${
                subscribed
                  ? 'bg-zinc-800 text-zinc-300 border border-zinc-600 hover:bg-zinc-700'
                  : 'bg-white text-black hover:bg-zinc-200'
              }`}
            >
              {subscribed ? 'Subscribed' : 'Subscribe'}
            </button>
            <button
              onClick={() => onShare?.(channel.id)}
              className="p-2.5 rounded-full bg-zinc-800 border border-zinc-700 text-zinc-300 hover:bg-zinc-700 hover:text-white transition-colors"
              aria-label="Share channel"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z" />
              </svg>
            </button>
          </div>
        </div>

        {/* Description */}
        <div className="mt-6 pb-6 border-b border-zinc-800">
          <div className={`relative ${!showFullDesc ? 'max-h-16 overflow-hidden' : ''}`}>
            <p className="text-sm text-zinc-300 leading-relaxed whitespace-pre-wrap">
              {channel.description}
            </p>
            {!showFullDesc && channel.description.length > 200 && (
              <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-zinc-950 to-transparent" />
            )}
          </div>
          {channel.description.length > 200 && (
            <button
              onClick={() => setShowFullDesc(!showFullDesc)}
              className="text-sm text-zinc-400 hover:text-white mt-2 transition-colors font-medium"
            >
              {showFullDesc ? 'Show less' : '...more'}
            </button>
          )}

          {/* Links */}
          {channel.links && channel.links.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4">
              {channel.links.map((link) => (
                <a
                  key={link.url}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-zinc-800 text-zinc-300 rounded-full hover:bg-zinc-700 hover:text-white transition-colors border border-zinc-700"
                >
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
                  </svg>
                  {link.label}
                </a>
              ))}
            </div>
          )}

          {/* Stats */}
          <div className="flex items-center gap-4 mt-4 text-xs text-zinc-500">
            <span>{channel.totalViews.toLocaleString()} total views</span>
            <span>Joined {timeAgo(channel.joinedAt)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
