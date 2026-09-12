import { useState, useCallback } from 'react';

interface Stream {
  id: string;
  title: string;
  thumbnail: string;
  streamerName: string;
  streamerAvatar: string;
  viewerCount: number;
  category: string;
  tags: string[];
  startedAt: string;
  isLive: boolean;
  duration?: string;
  language?: string;
}

interface LiveCardProps {
  stream: Stream;
  onWatch?: (id: string) => void;
  onFollow?: (id: string) => void;
  compact?: boolean;
}

function formatViewers(count: number): string {
  if (count >= 1_000_000) return `${(count / 1_000_000).toFixed(1)}M`;
  if (count >= 1_000) return `${(count / 1_000).toFixed(1)}K`;
  return count.toString();
}

function getUptime(startedAt: string): string {
  const diff = Date.now() - new Date(startedAt).getTime();
  const hours = Math.floor(diff / 3600000);
  const minutes = Math.floor((diff % 3600000) / 60000);
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

export default function LiveCard({ stream, onWatch, onFollow, compact = false }: LiveCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);

  const handleWatch = useCallback(() => {
    onWatch?.(stream.id);
  }, [onWatch, stream.id]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handleWatch();
      }
    },
    [handleWatch]
  );

  if (compact) {
    return (
      <div
        className="group flex gap-3 cursor-pointer rounded-lg p-2 hover:bg-white/5 transition-colors"
        onClick={handleWatch}
        onKeyDown={handleKeyDown}
        role="button"
        tabIndex={0}
      >
        <div className="relative flex-shrink-0 w-40 aspect-video rounded-lg overflow-hidden bg-zinc-800">
          <img
            src={stream.thumbnail}
            alt={stream.title}
            className="w-full h-full object-cover"
            loading="lazy"
          />
          {stream.isLive && (
            <span className="absolute top-1 left-1 px-1.5 py-0.5 text-[10px] font-bold bg-red-600 text-white rounded uppercase">
              Live
            </span>
          )}
          <span className="absolute bottom-1 right-1 px-1.5 py-0.5 text-[10px] font-medium bg-black/80 text-white rounded flex items-center gap-1">
            <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="4" />
            </svg>
            {formatViewers(stream.viewerCount)}
          </span>
        </div>
        <div className="flex flex-col min-w-0 py-1">
          <h3 className="text-sm font-medium text-white line-clamp-2 group-hover:text-purple-400 transition-colors">
            {stream.title}
          </h3>
          <p className="mt-1 text-xs text-zinc-400">{stream.streamerName}</p>
          <p className="text-xs text-zinc-500">{stream.category}</p>
        </div>
      </div>
    );
  }

  return (
    <article
      className="group relative flex flex-col cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleWatch}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
      aria-label={`Watch ${stream.streamerName} streaming ${stream.title}`}
    >
      <div className="relative aspect-video rounded-xl overflow-hidden bg-zinc-800">
        <img
          src={stream.thumbnail}
          alt={stream.title}
          className={`w-full h-full object-cover transition-all duration-500 ${
            isHovered ? 'scale-105' : 'scale-100'
          } ${imgLoaded ? 'opacity-100' : 'opacity-0'}`}
          loading="lazy"
          onLoad={() => setImgLoaded(true)}
        />

        <div
          className={`absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent transition-opacity duration-300 ${
            isHovered ? 'opacity-100' : 'opacity-0'
          }`}
        />

        {/* Live badge */}
        {stream.isLive && (
          <div className="absolute top-3 left-3 flex items-center gap-2">
            <span className="px-2.5 py-1 text-xs font-bold bg-red-600 text-white rounded-md uppercase tracking-wider animate-pulse">
              Live
            </span>
            {stream.duration && (
              <span className="px-2 py-1 text-xs font-medium bg-black/60 text-white rounded-md backdrop-blur-sm">
                {stream.duration}
              </span>
            )}
          </div>
        )}

        {/* Viewer count */}
        <div className="absolute top-3 right-3 flex items-center gap-1.5 px-2 py-1 bg-black/60 rounded-md backdrop-blur-sm">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
          </span>
          <span className="text-xs font-semibold text-white">
            {formatViewers(stream.viewerCount)} watching
          </span>
        </div>

        {/* Hover play */}
        <div
          className={`absolute inset-0 flex items-center justify-center transition-opacity duration-300 ${
            isHovered ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <div className="w-16 h-16 rounded-full bg-purple-600/80 backdrop-blur-md flex items-center justify-center hover:bg-purple-500 transition-colors shadow-2xl">
            <svg className="w-8 h-8 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </div>

        {/* Category badge */}
        <div className="absolute bottom-3 left-3">
          <span className="px-2.5 py-1 text-xs font-medium bg-zinc-900/80 text-zinc-200 rounded-md backdrop-blur-sm">
            {stream.category}
          </span>
        </div>
      </div>

      <div className="flex gap-3 mt-3 px-1">
        <img
          src={stream.streamerAvatar}
          alt={stream.streamerName}
          className="w-10 h-10 rounded-full bg-zinc-700 flex-shrink-0"
          loading="lazy"
        />
        <div className="flex flex-col min-w-0 flex-1">
          <h3 className="text-sm font-semibold text-white line-clamp-2 group-hover:text-purple-400 transition-colors leading-snug">
            {stream.title}
          </h3>
          <p className="mt-1.5 text-sm text-zinc-400 hover:text-zinc-200 transition-colors">
            {stream.streamerName}
          </p>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs text-zinc-500">{stream.category}</span>
            {stream.language && (
              <>
                <span className="text-zinc-600">·</span>
                <span className="text-xs text-zinc-500 uppercase">{stream.language}</span>
              </>
            )}
          </div>
          {stream.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {stream.tags.slice(0, 4).map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-0.5 text-[10px] font-medium bg-zinc-800 text-zinc-300 rounded-full border border-zinc-700 hover:bg-zinc-700 transition-colors"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {onFollow && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onFollow(stream.id);
            }}
            className="px-4 py-2 text-xs font-semibold bg-purple-600 text-white rounded-lg hover:bg-purple-500 transition-colors self-start flex-shrink-0"
          >
            Follow
          </button>
        )}
      </div>
    </article>
  );
}
