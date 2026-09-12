import { useState, useCallback } from 'react';

interface Episode {
  id: string;
  title: string;
  description: string;
  duration: string;
  publishedAt: string;
  episodeNumber: number;
  season?: number;
  audioUrl: string;
  thumbnail?: string;
  isPlaying?: boolean;
  isPlayed?: boolean;
  playedProgress?: number;
  downloadUrl?: string;
}

interface EpisodeListProps {
  podcastTitle: string;
  podcastCover: string;
  episodes: Episode[];
  onPlay?: (episodeId: string) => void;
  onPause?: (episodeId: string) => void;
  onDownload?: (episodeId: string) => void;
  onShare?: (episodeId: string) => void;
  sortBy?: 'newest' | 'oldest' | 'duration';
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
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;
  return new Date(date).toLocaleDateString();
}

function parseDuration(duration: string): number {
  const parts = duration.split(':').map(Number);
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  if (parts.length === 2) return parts[0] * 60 + parts[1];
  return parts[0] || 0;
}

export default function EpisodeList({
  podcastTitle,
  podcastCover,
  episodes,
  onPlay,
  onPause,
  onDownload,
  onShare,
  sortBy = 'newest',
}: EpisodeListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentSort, setCurrentSort] = useState(sortBy);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [playingId, setPlayingId] = useState<string | null>(null);

  const filteredAndSorted = [...episodes]
    .filter((ep) => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        ep.title.toLowerCase().includes(q) ||
        ep.description.toLowerCase().includes(q)
      );
    })
    .sort((a, b) => {
      switch (currentSort) {
        case 'newest':
          return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
        case 'oldest':
          return new Date(a.publishedAt).getTime() - new Date(b.publishedAt).getTime();
        case 'duration':
          return parseDuration(b.duration) - parseDuration(a.duration);
        default:
          return 0;
      }
    });

  const handlePlay = useCallback(
    (ep: Episode) => {
      if (playingId === ep.id) {
        setPlayingId(null);
        onPause?.(ep.id);
      } else {
        setPlayingId(ep.id);
        onPlay?.(ep.id);
      }
    },
    [playingId, onPlay, onPause]
  );

  const toggleExpand = useCallback((id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  }, []);

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex items-start gap-4 mb-6">
        <img
          src={podcastCover}
          alt={podcastTitle}
          className="w-20 h-20 rounded-xl object-cover bg-zinc-800 flex-shrink-0"
          loading="lazy"
        />
        <div className="flex-1 min-w-0">
          <h2 className="text-lg font-bold text-white">{podcastTitle}</h2>
          <p className="text-sm text-zinc-400 mt-1">
            {episodes.length} episode{episodes.length !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      {/* Search and sort */}
      <div className="flex items-center gap-3 mb-6">
        <div className="relative flex-1">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
          <input
            type="text"
            placeholder="Search episodes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-zinc-900 border border-zinc-700 rounded-lg text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          />
        </div>
        <select
          value={currentSort}
          onChange={(e) => setCurrentSort(e.target.value as typeof currentSort)}
          className="px-4 py-2.5 bg-zinc-900 border border-zinc-700 rounded-lg text-sm text-zinc-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
        >
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
          <option value="duration">Duration</option>
        </select>
      </div>

      {/* Play all button */}
      {filteredAndSorted.length > 0 && (
        <button className="flex items-center gap-2 px-5 py-2.5 mb-6 bg-emerald-600 text-white text-sm font-semibold rounded-full hover:bg-emerald-500 transition-colors">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M8 5v14l11-7z" />
          </svg>
          Play All Episodes
        </button>
      )}

      {/* Episodes */}
      <div className="space-y-2">
        {filteredAndSorted.length === 0 ? (
          <div className="flex flex-col items-center py-16 text-zinc-500">
            <svg className="w-12 h-12 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-3.72a.75.75 0 011.28.53v14.88a.75.75 0 01-1.28.53l-4.72-3.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z" />
            </svg>
            <p className="text-sm">No episodes found</p>
          </div>
        ) : (
          filteredAndSorted.map((episode, index) => {
            const isCurrentlyPlaying = playingId === episode.id;
            const isExpanded = expandedId === episode.id;

            return (
              <div
                key={episode.id}
                className={`rounded-xl border transition-all duration-200 ${
                  isCurrentlyPlaying
                    ? 'bg-emerald-900/20 border-emerald-700/50'
                    : 'bg-zinc-900 border-zinc-800 hover:border-zinc-700'
                }`}
              >
                <div
                  className="flex items-center gap-4 p-4 cursor-pointer"
                  onClick={() => toggleExpand(episode.id)}
                >
                  {/* Play button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePlay(episode);
                    }}
                    className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${
                      isCurrentlyPlaying
                        ? 'bg-emerald-500 text-white hover:bg-emerald-400'
                        : episode.isPlayed
                        ? 'bg-zinc-700 text-zinc-300 hover:bg-zinc-600'
                        : 'bg-zinc-800 text-white hover:bg-zinc-700'
                    }`}
                    aria-label={isCurrentlyPlaying ? 'Pause' : `Play episode ${episode.episodeNumber}`}
                  >
                    {isCurrentlyPlaying ? (
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    )}
                  </button>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">
                        {episode.season ? `S${episode.season}` : ''} E{episode.episodeNumber}
                      </span>
                      {episode.isPlayed && (
                        <span className="text-[10px] font-medium text-emerald-500">Played</span>
                      )}
                    </div>
                    <h4 className="text-sm font-medium text-white mt-1 line-clamp-1">
                      {episode.title}
                    </h4>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-zinc-500">{episode.duration}</span>
                      <span className="text-zinc-600">·</span>
                      <span className="text-xs text-zinc-500">{timeAgo(episode.publishedAt)}</span>
                    </div>
                  </div>

                  {/* Progress */}
                  {episode.playedProgress !== undefined && episode.playedProgress > 0 && (
                    <div className="hidden sm:block w-24">
                      <div className="h-1 bg-zinc-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-emerald-500 rounded-full"
                          style={{ width: `${Math.min(episode.playedProgress, 100)}%` }}
                        />
                      </div>
                      <p className="text-[10px] text-zinc-500 mt-1 text-right">
                        {Math.round(episode.playedProgress)}%
                      </p>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center gap-1 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                    {episode.downloadUrl && (
                      <button
                        onClick={() => onDownload?.(episode.id)}
                        className="p-2 rounded-lg hover:bg-zinc-800 text-zinc-500 hover:text-zinc-300 transition-colors"
                        aria-label="Download"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                        </svg>
                      </button>
                    )}
                    <button
                      onClick={() => onShare?.(episode.id)}
                      className="p-2 rounded-lg hover:bg-zinc-800 text-zinc-500 hover:text-zinc-300 transition-colors"
                      aria-label="Share"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Expanded description */}
                {isExpanded && (
                  <div className="px-4 pb-4 pt-0 ml-14">
                    <p className="text-sm text-zinc-400 leading-relaxed">{episode.description}</p>
                    <div className="flex items-center gap-3 mt-3">
                      <button className="text-xs text-emerald-400 hover:text-emerald-300 transition-colors font-medium">
                        Show Transcript
                      </button>
                      <button className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors">
                        Share Episode
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
