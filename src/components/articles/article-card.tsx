import { useState, useCallback } from 'react';

interface Article {
  id: string;
  title: string;
  excerpt: string;
  cover: string;
  author: string;
  authorAvatar: string;
  publishedAt: string;
  readTime: string;
  category: string;
  tags: string[];
  likes: number;
  comments: number;
  isBookmarked?: boolean;
  isLiked?: boolean;
}

interface ArticleCardProps {
  article: Article;
  onRead?: (id: string) => void;
  onLike?: (id: string) => void;
  onBookmark?: (id: string) => void;
  onShare?: (id: string) => void;
  layout?: 'card' | 'horizontal' | 'featured';
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

function formatCount(num: number): string {
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
  if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K`;
  return num.toString();
}

export default function ArticleCard({
  article,
  onRead,
  onLike,
  onBookmark,
  onShare,
  layout = 'card',
}: ArticleCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [liked, setLiked] = useState(article.isLiked || false);
  const [likeCount, setLikeCount] = useState(article.likes);
  const [bookmarked, setBookmarked] = useState(article.isBookmarked || false);
  const [imgLoaded, setImgLoaded] = useState(false);

  const handleLike = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      setLiked((prev) => {
        setLikeCount((c) => (prev ? c - 1 : c + 1));
        onLike?.(article.id);
        return !prev;
      });
    },
    [article.id, onLike]
  );

  const handleBookmark = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      setBookmarked((prev) => {
        onBookmark?.(article.id);
        return !prev;
      });
    },
    [article.id, onBookmark]
  );

  const handleClick = useCallback(() => {
    onRead?.(article.id);
  }, [article.id, onRead]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handleClick();
      }
    },
    [handleClick]
  );

  if (layout === 'horizontal') {
    return (
      <article
        className="group flex gap-4 p-4 rounded-xl hover:bg-white/5 cursor-pointer transition-colors"
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        role="article"
        tabIndex={0}
      >
        <div className="relative w-32 h-24 sm:w-48 sm:h-32 rounded-lg overflow-hidden bg-zinc-800 flex-shrink-0">
          <img
            src={article.cover}
            alt={article.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
          <span className="absolute top-2 left-2 px-2 py-0.5 text-[10px] font-bold bg-zinc-900/80 text-white rounded backdrop-blur-sm">
            {article.readTime}
          </span>
        </div>
        <div className="flex-1 min-w-0 flex flex-col">
          <span className="text-[10px] font-semibold text-blue-400 uppercase tracking-wider">
            {article.category}
          </span>
          <h3 className="text-base font-semibold text-white group-hover:text-blue-400 transition-colors line-clamp-2 mt-1 leading-snug">
            {article.title}
          </h3>
          <p className="text-sm text-zinc-400 line-clamp-2 mt-1.5 leading-relaxed hidden sm:block">
            {article.excerpt}
          </p>
          <div className="flex items-center gap-2 mt-auto pt-2">
            <img
              src={article.authorAvatar}
              alt={article.author}
              className="w-5 h-5 rounded-full"
              loading="lazy"
            />
            <span className="text-xs text-zinc-400">{article.author}</span>
            <span className="text-zinc-600">·</span>
            <span className="text-xs text-zinc-500">{timeAgo(article.publishedAt)}</span>
          </div>
        </div>
      </article>
    );
  }

  if (layout === 'featured') {
    return (
      <article
        className="group relative rounded-2xl overflow-hidden cursor-pointer"
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        role="article"
        tabIndex={0}
      >
        <div className="relative aspect-[2/1] sm:aspect-[3/1]">
          <img
            src={article.cover}
            alt={article.title}
            className={`w-full h-full object-cover transition-all duration-700 ${
              isHovered ? 'scale-105' : 'scale-100'
            } ${imgLoaded ? 'opacity-100' : 'opacity-0'}`}
            loading="lazy"
            onLoad={() => setImgLoaded(true)}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

          <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8">
            <div className="flex items-center gap-2 mb-3">
              <span className="px-3 py-1 text-xs font-bold bg-blue-600 text-white rounded-full">
                {article.category}
              </span>
              <span className="px-3 py-1 text-xs font-medium bg-black/50 text-zinc-300 rounded-full backdrop-blur-sm">
                {article.readTime} read
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-bold text-white group-hover:text-blue-400 transition-colors leading-tight">
              {article.title}
            </h2>

            <p className="text-sm text-zinc-300 mt-2 line-clamp-2 max-w-2xl leading-relaxed hidden sm:block">
              {article.excerpt}
            </p>

            <div className="flex items-center justify-between mt-4">
              <div className="flex items-center gap-3">
                <img
                  src={article.authorAvatar}
                  alt={article.author}
                  className="w-8 h-8 rounded-full"
                  loading="lazy"
                />
                <div>
                  <p className="text-sm font-medium text-white">{article.author}</p>
                  <p className="text-xs text-zinc-400">{timeAgo(article.publishedAt)}</p>
                </div>
              </div>

              <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                <button
                  onClick={handleLike}
                  className={`p-2 rounded-full transition-colors ${
                    liked ? 'text-blue-400' : 'text-zinc-400 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <svg className="w-5 h-5" fill={liked ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                  </svg>
                </button>
                <button
                  onClick={handleBookmark}
                  className={`p-2 rounded-full transition-colors ${
                    bookmarked ? 'text-yellow-400' : 'text-zinc-400 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <svg className="w-5 h-5" fill={bookmarked ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </article>
    );
  }

  // Default card layout
  return (
    <article
      className="group relative flex flex-col rounded-xl overflow-hidden bg-zinc-900 border border-zinc-800 hover:border-zinc-700 cursor-pointer transition-all duration-300 hover:shadow-xl hover:shadow-black/20"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      role="article"
      tabIndex={0}
    >
      <div className="relative aspect-video overflow-hidden bg-zinc-800">
        <img
          src={article.cover}
          alt={article.title}
          className={`w-full h-full object-cover transition-all duration-500 ${
            isHovered ? 'scale-105' : 'scale-100'
          } ${imgLoaded ? 'opacity-100' : 'opacity-0'}`}
          loading="lazy"
          onLoad={() => setImgLoaded(true)}
        />
        <div className="absolute top-3 left-3 flex items-center gap-2">
          <span className="px-2.5 py-1 text-[10px] font-bold bg-blue-600 text-white rounded-md uppercase tracking-wider">
            {article.category}
          </span>
          <span className="px-2.5 py-1 text-[10px] font-medium bg-black/60 text-white rounded-md backdrop-blur-sm">
            {article.readTime}
          </span>
        </div>

        <div className="absolute top-3 right-3 flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={handleBookmark}
            className={`p-1.5 rounded-full backdrop-blur-sm transition-colors ${
              bookmarked ? 'bg-yellow-500/20 text-yellow-400' : 'bg-black/40 text-white/70 hover:text-white hover:bg-black/60'
            }`}
          >
            <svg className="w-4 h-4" fill={bookmarked ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z" />
            </svg>
          </button>
        </div>
      </div>

      <div className="flex-1 p-4">
        <h3 className="text-base font-semibold text-white group-hover:text-blue-400 transition-colors line-clamp-2 leading-snug">
          {article.title}
        </h3>
        <p className="mt-2 text-sm text-zinc-400 line-clamp-2 leading-relaxed">{article.excerpt}</p>

        {article.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {article.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="px-2 py-0.5 text-[10px] font-medium bg-zinc-800 text-zinc-400 rounded-full"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between mt-4 pt-4 border-t border-zinc-800">
          <div className="flex items-center gap-2">
            <img
              src={article.authorAvatar}
              alt={article.author}
              className="w-6 h-6 rounded-full bg-zinc-700"
              loading="lazy"
            />
            <div>
              <p className="text-xs font-medium text-zinc-300">{article.author}</p>
              <p className="text-[10px] text-zinc-500">{timeAgo(article.publishedAt)}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 text-zinc-500">
            <button
              onClick={handleLike}
              className={`flex items-center gap-1 text-xs transition-colors ${
                liked ? 'text-blue-400' : 'hover:text-zinc-300'
              }`}
            >
              <svg className="w-3.5 h-3.5" fill={liked ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
              </svg>
              <span>{formatCount(likeCount)}</span>
            </button>
            <span className="flex items-center gap-1 text-xs">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 2.104.859 4.023 2.273 5.48.432.447.74 1.04.586 1.641a4.483 4.483 0 01-.923 1.785A5.969 5.969 0 006 21c1.282 0 2.47-.402 3.445-1.087.81.22 1.668.337 2.555.337z" />
              </svg>
              <span>{formatCount(article.comments)}</span>
            </span>
          </div>
        </div>
      </div>
    </article>
  );
}
