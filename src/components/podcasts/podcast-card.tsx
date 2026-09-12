import { useState, useCallback } from 'react';

interface Podcast {
  id: string;
  title: string;
  cover: string;
  author: string;
  authorAvatar: string;
  description: string;
  episodeCount: number;
  category: string;
  tags: string[];
  rating: number;
  isSubscribed?: boolean;
  latestEpisode?: {
    title: string;
    duration: string;
    publishedAt: string;
  };
}

interface PodcastCardProps {
  podcast: Podcast;
  onPlay?: (id: string) => void;
  onSubscribe?: (id: string) => void;
  layout?: 'card' | 'list' | 'featured';
}

function formatRating(rating: number): string {
  return rating.toFixed(1);
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

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          className={`w-3 h-3 ${
            star <= rating ? 'text-yellow-400' : star - 0.5 <= rating ? 'text-yellow-400/50' : 'text-zinc-600'
          }`}
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ))}
    </div>
  );
}

export default function PodcastCard({ podcast, onPlay, onSubscribe, layout = 'card' }: PodcastCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  const handlePlay = useCallback(() => {
    onPlay?.(podcast.id);
  }, [onPlay, podcast.id]);

  const handleSubscribe = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onSubscribe?.(podcast.id);
    },
    [onSubscribe, podcast.id]
  );

  if (layout === 'list') {
    return (
      <div
        className="group flex items-center gap-4 p-3 rounded-xl hover:bg-white/5 cursor-pointer transition-colors"
        onClick={handlePlay}
      >
        <img
          src={podcast.cover}
          alt={podcast.title}
          className="w-16 h-16 rounded-xl object-cover bg-zinc-800 flex-shrink-0"
          loading="lazy"
        />
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-white group-hover:text-emerald-400 transition-colors line-clamp-1">
            {podcast.title}
          </h3>
          <p className="text-xs text-zinc-400 mt-0.5">{podcast.author}</p>
          <p className="text-xs text-zinc-500 mt-0.5">{podcast.episodeCount} episodes</p>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          <div className="text-right hidden sm:block">
            <p className="text-xs text-zinc-400">Latest</p>
            <p className="text-xs text-zinc-500">{podcast.latestEpisode?.title}</p>
          </div>
          <button
            onClick={handlePlay}
            className="p-2.5 rounded-full bg-emerald-600 text-white hover:bg-emerald-500 transition-colors"
            aria-label={`Play ${podcast.title}`}
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          </button>
        </div>
      </div>
    );
  }

  if (layout === 'featured') {
    return (
      <article
        className="group relative rounded-2xl overflow-hidden bg-gradient-to-br from-zinc-900 to-zinc-800 border border-zinc-700/50 cursor-pointer"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={handlePlay}
      >
        <div className="flex flex-col md:flex-row">
          <div className="relative w-full md:w-64 aspect-square md:aspect-auto flex-shrink-0">
            <img
              src={podcast.cover}
              alt={podcast.title}
              className={`w-full h-full object-cover transition-transform duration-500 ${
                isHovered ? 'scale-105' : 'scale-100'
              }`}
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-transparent to-zinc-900/80 hidden md:block" />
          </div>

          <div className="flex-1 p-6 md:p-8">
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-1 text-[10px] font-bold bg-emerald-600 text-white rounded-full uppercase tracking-wider">
                Featured
              </span>
              <span className="px-2.5 py-1 text-[10px] font-medium bg-zinc-700 text-zinc-300 rounded-full">
                {podcast.category}
              </span>
            </div>

            <h2 className="text-xl font-bold text-white group-hover:text-emerald-400 transition-colors">
              {podcast.title}
            </h2>

            <div className="flex items-center gap-2 mt-2">
              <img
                src={podcast.authorAvatar}
                alt={podcast.author}
                className="w-5 h-5 rounded-full"
                loading="lazy"
              />
              <span className="text-sm text-zinc-400">{podcast.author}</span>
            </div>

            <p className="mt-3 text-sm text-zinc-400 line-clamp-2 leading-relaxed">
              {podcast.description}
            </p>

            <div className="flex items-center gap-4 mt-4">
              <div className="flex items-center gap-1.5">
                <StarRating rating={podcast.rating} />
                <span className="text-xs text-zinc-400">{formatRating(podcast.rating)}</span>
              </div>
              <span className="text-xs text-zinc-500">·</span>
              <span className="text-xs text-zinc-400">{podcast.episodeCount} episodes</span>
            </div>

            {podcast.latestEpisode && (
              <div className="mt-4 p-3 bg-zinc-800/50 rounded-xl">
                <p className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">Latest Episode</p>
                <p className="text-sm font-medium text-white mt-1">{podcast.latestEpisode.title}</p>
                <p className="text-xs text-zinc-500 mt-1">
                  {podcast.latestEpisode.duration} · {timeAgo(podcast.latestEpisode.publishedAt)}
                </p>
              </div>
            )}

            <div className="flex items-center gap-3 mt-5">
              <button className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white text-sm font-semibold rounded-full hover:bg-emerald-500 transition-colors">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
                Play Latest
              </button>
              <button
                onClick={handleSubscribe}
                className={`px-5 py-2.5 text-sm font-semibold rounded-full border transition-colors ${
                  podcast.isSubscribed
                    ? 'bg-emerald-600/10 border-emerald-500 text-emerald-400'
                    : 'border-zinc-600 text-zinc-300 hover:border-zinc-500 hover:text-white'
                }`}
              >
                {podcast.isSubscribed ? 'Subscribed' : 'Subscribe'}
              </button>
            </div>
          </div>
        </div>
      </article>
    );
  }

  return (
    <article
      className="group relative flex flex-col rounded-xl overflow-hidden bg-zinc-900 border border-zinc-800 hover:border-zinc-700 cursor-pointer transition-all duration-300 hover:shadow-xl hover:shadow-black/20"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handlePlay}
    >
      <div className="relative aspect-square overflow-hidden">
        <img
          src={podcast.cover}
          alt={podcast.title}
          className={`w-full h-full object-cover transition-transform duration-500 ${
            isHovered ? 'scale-110' : 'scale-100'
          }`}
          loading="lazy"
        />
        <div
          className={`absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent transition-opacity duration-300 ${
            isHovered ? 'opacity-100' : 'opacity-0'
          }`}
        />

        <div
          className={`absolute inset-0 flex items-center justify-center transition-opacity duration-300 ${
            isHovered ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <div className="w-14 h-14 rounded-full bg-emerald-600 flex items-center justify-center hover:bg-emerald-500 transition-colors shadow-2xl">
            <svg className="w-7 h-7 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </div>

        <span className="absolute top-3 right-3 px-2 py-1 text-[10px] font-medium bg-zinc-900/80 text-zinc-300 rounded-md backdrop-blur-sm">
          {podcast.episodeCount} eps
        </span>

        {podcast.isSubscribed && (
          <span className="absolute top-3 left-3 px-2 py-1 text-[10px] font-bold bg-emerald-600 text-white rounded-md">
            Subscribed
          </span>
        )}
      </div>

      <div className="flex-1 p-4">
        <h3 className="text-sm font-semibold text-white group-hover:text-emerald-400 transition-colors line-clamp-2 leading-snug">
          {podcast.title}
        </h3>

        <div className="flex items-center gap-2 mt-2">
          <img
            src={podcast.authorAvatar}
            alt={podcast.author}
            className="w-5 h-5 rounded-full bg-zinc-700 flex-shrink-0"
            loading="lazy"
          />
          <span className="text-xs text-zinc-400 truncate">{podcast.author}</span>
        </div>

        <p className="mt-2 text-xs text-zinc-500 line-clamp-2 leading-relaxed">{podcast.description}</p>

        <div className="flex items-center justify-between mt-3">
          <div className="flex items-center gap-1.5">
            <StarRating rating={podcast.rating} />
            <span className="text-[10px] text-zinc-500">{formatRating(podcast.rating)}</span>
          </div>
          <span className="text-[10px] text-zinc-500 bg-zinc-800 px-2 py-0.5 rounded-full">
            {podcast.category}
          </span>
        </div>

        {podcast.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-3">
            {podcast.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="px-2 py-0.5 text-[10px] font-medium bg-zinc-800 text-zinc-400 rounded-full"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="px-4 pb-4">
        <button
          onClick={handleSubscribe}
          className={`w-full py-2.5 text-xs font-semibold rounded-lg border transition-colors ${
            podcast.isSubscribed
              ? 'bg-emerald-600/10 border-emerald-500 text-emerald-400 hover:bg-emerald-600/20'
              : 'border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white'
          }`}
        >
          {podcast.isSubscribed ? 'Subscribed ✓' : 'Subscribe'}
        </button>
      </div>
    </article>
  );
}
