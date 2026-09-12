import { useState, useCallback } from 'react';

interface Video {
  id: string;
  title: string;
  thumbnail: string;
  channelName: string;
  channelAvatar: string;
  views: number;
  duration: string;
  uploadedAt: string;
  isLive?: boolean;
  tags?: string[];
  aiGenerated?: boolean;
}

interface VideoCardProps {
  video: Video;
  onPlay?: (id: string) => void;
  onLike?: (id: string) => void;
  onShare?: (id: string) => void;
  compact?: boolean;
}

function formatViews(views: number): string {
  if (views >= 1_000_000) return `${(views / 1_000_000).toFixed(1)}M`;
  if (views >= 1_000) return `${(views / 1_000).toFixed(1)}K`;
  return views.toString();
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
  if (weeks < 4) return `${weeks}w ago`;
  return new Date(date).toLocaleDateString();
}

export default function VideoCard({
  video,
  onPlay,
  onLike,
  onShare,
  compact = false,
}: VideoCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);

  const handlePlay = useCallback(() => {
    onPlay?.(video.id);
  }, [onPlay, video.id]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handlePlay();
      }
    },
    [handlePlay]
  );

  if (compact) {
    return (
      <div className="group flex gap-3 cursor-pointer rounded-lg p-2 hover:bg-white/5 transition-colors">
        <div className="relative flex-shrink-0 w-40 aspect-video rounded-lg overflow-hidden bg-zinc-800">
          <img
            src={video.thumbnail}
            alt={video.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
          <span className="absolute bottom-1 right-1 px-1.5 py-0.5 text-xs font-medium bg-black/80 text-white rounded">
            {video.duration}
          </span>
        </div>
        <div className="flex flex-col min-w-0 py-1">
          <h3 className="text-sm font-medium text-white line-clamp-2 group-hover:text-blue-400 transition-colors">
            {video.title}
          </h3>
          <p className="mt-1 text-xs text-zinc-400">{video.channelName}</p>
          <p className="text-xs text-zinc-500">
            {formatViews(video.views)} views · {timeAgo(video.uploadedAt)}
          </p>
        </div>
      </div>
    );
  }

  return (
    <article
      className="group relative flex flex-col cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handlePlay}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
      aria-label={`Play ${video.title}`}
    >
      <div className="relative aspect-video rounded-xl overflow-hidden bg-zinc-800">
        <img
          src={video.thumbnail}
          alt={video.title}
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

        <span className="absolute bottom-2 right-2 px-2 py-1 text-xs font-semibold bg-black/80 text-white rounded-md backdrop-blur-sm">
          {video.duration}
        </span>

        {video.isLive && (
          <span className="absolute top-2 left-2 px-2.5 py-1 text-xs font-bold bg-red-600 text-white rounded-md uppercase tracking-wide animate-pulse">
            Live
          </span>
        )}

        {video.aiGenerated && (
          <span className="absolute top-2 right-2 px-2 py-1 text-xs font-medium bg-violet-600 text-white rounded-md backdrop-blur-sm flex items-center gap-1">
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
            </svg>
            AI
          </span>
        )}

        <div
          className={`absolute inset-0 flex items-center justify-center transition-opacity duration-300 ${
            isHovered ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 hover:bg-white/30 transition-colors">
            <svg className="w-7 h-7 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </div>
      </div>

      <div className="flex gap-3 mt-3 px-1">
        <img
          src={video.channelAvatar}
          alt={video.channelName}
          className="w-9 h-9 rounded-full bg-zinc-700 flex-shrink-0 mt-0.5"
          loading="lazy"
        />
        <div className="flex flex-col min-w-0">
          <h3 className="text-sm font-medium text-white line-clamp-2 group-hover:text-blue-400 transition-colors leading-snug">
            {video.title}
          </h3>
          <p className="mt-1.5 text-xs text-zinc-400 hover:text-zinc-200 transition-colors">
            {video.channelName}
          </p>
          <p className="text-xs text-zinc-500">
            {formatViews(video.views)} views · {timeAgo(video.uploadedAt)}
          </p>
          {video.tags && video.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {video.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-0.5 text-[10px] font-medium bg-zinc-800 text-zinc-300 rounded-full border border-zinc-700 hover:bg-zinc-700 transition-colors"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      <div
        className={`absolute top-1/2 -translate-y-1/2 right-2 flex flex-col gap-1 transition-opacity duration-200 ${
          isHovered ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={(e) => { e.stopPropagation(); onLike?.(video.id); }}
          className="p-2 rounded-full bg-zinc-800/90 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-colors"
          aria-label="Like"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6.633 10.5c.806 0 1.533-.446 2.031-1.08a9.041 9.041 0 012.861-2.4c.723-.384 1.35-.956 1.653-1.715a4.498 4.498 0 00.322-1.672V3.75a.75.75 0 01.75-.75A2.25 2.25 0 0116.5 5.25c0 1.152-.26 2.243-.723 3.218-.266.558.107 1.282.725 1.282h3.126c1.026 0 1.945.694 2.054 1.715.045.422.068.85.068 1.285a11.95 11.95 0 01-2.649 7.521c-.388.482-.987.729-1.605.729H14.23c-.483 0-.964-.078-1.423-.23l-3.114-1.04a4.501 4.501 0 00-1.423-.23H5.904M14.25 9h2.25M5.904 18.75c.083.205.173.405.27.602.197.4-.078.898-.523.898h-.908c-.889 0-1.713-.518-1.972-1.368a12 12 0 01-.521-3.507c0-1.553.295-3.036.831-4.398C3.387 10.69 4.167 10.5 5 10.5h.587" />
          </svg>
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onShare?.(video.id); }}
          className="p-2 rounded-full bg-zinc-800/90 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-colors"
          aria-label="Share"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z" />
          </svg>
        </button>
      </div>
    </article>
  );
}
