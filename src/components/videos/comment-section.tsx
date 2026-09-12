import { useState, useCallback, useRef } from 'react';

interface Comment {
  id: string;
  author: string;
  avatar: string;
  content: string;
  timestamp: string;
  likes: number;
  isLiked?: boolean;
  replies?: Comment[];
}

interface CommentSectionProps {
  videoId: string;
  comments: Comment[];
  totalComments: number;
  onAddComment?: (content: string) => void;
  onReply?: (parentId: string, content: string) => void;
  onLike?: (commentId: string) => void;
  onDelete?: (commentId: string) => void;
}

function timeAgo(date: string): string {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;
  return `${Math.floor(months / 12)}y ago`;
}

function CommentItem({
  comment,
  onReply,
  onLike,
  onDelete,
  depth = 0,
}: {
  comment: Comment;
  onReply?: (parentId: string, content: string) => void;
  onLike?: (commentId: string) => void;
  onDelete?: (commentId: string) => void;
  depth?: number;
}) {
  const [showReplyBox, setShowReplyBox] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [showReplies, setShowReplies] = useState(depth < 1);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmitReply = useCallback(() => {
    if (replyText.trim()) {
      onReply?.(comment.id, replyText.trim());
      setReplyText('');
      setShowReplyBox(false);
      setShowReplies(true);
    }
  }, [replyText, onReply, comment.id]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        handleSubmitReply();
      }
      if (e.key === 'Escape') {
        setShowReplyBox(false);
        setReplyText('');
      }
    },
    [handleSubmitReply]
  );

  return (
    <div className={`${depth > 0 ? 'ml-10 mt-3' : 'mt-4'}`}>
      <div className="flex gap-3">
        <img
          src={comment.avatar}
          alt={comment.author}
          className={`w-${depth > 0 ? 7 : 9} h-${depth > 0 ? 7 : 9} rounded-full bg-zinc-700 flex-shrink-0`}
          loading="lazy"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-zinc-200">@{comment.author}</span>
            <span className="text-xs text-zinc-500">{timeAgo(comment.timestamp)}</span>
            {isCollapsed && (
              <button
                onClick={() => setIsCollapsed(false)}
                className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
              >
                Show comment
              </button>
            )}
          </div>

          {!isCollapsed && (
            <>
              <p className="mt-1 text-sm text-zinc-300 leading-relaxed whitespace-pre-wrap break-words">
                {comment.content}
              </p>

              <div className="flex items-center gap-4 mt-2">
                <button
                  onClick={() => onLike?.(comment.id)}
                  className={`flex items-center gap-1.5 text-xs transition-colors ${
                    comment.isLiked ? 'text-blue-400' : 'text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  <svg className="w-4 h-4" fill={comment.isLiked ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.633 10.5c.806 0 1.533-.446 2.031-1.08a9.041 9.041 0 012.861-2.4c.723-.384 1.35-.956 1.653-1.715a4.498 4.498 0 00.322-1.672V3.75a.75.75 0 01.75-.75A2.25 2.25 0 0116.5 5.25c0 1.152-.26 2.243-.723 3.218-.266.558.107 1.282.725 1.282h3.126c1.026 0 1.945.694 2.054 1.715.045.422.068.85.068 1.285a11.95 11.95 0 01-2.649 7.521c-.388.482-.987.729-1.605.729H14.23c-.483 0-.964-.078-1.423-.23l-3.114-1.04a4.501 4.501 0 00-1.423-.23H5.904M14.25 9h2.25M5.904 18.75c.083.205.173.405.27.602.197.4-.078.898-.523.898h-.908c-.889 0-1.713-.518-1.972-1.368a12 12 0 01-.521-3.507c0-1.553.295-3.036.831-4.398C3.387 10.69 4.167 10.5 5 10.5h.587" />
                  </svg>
                  <span>{comment.likes > 0 ? comment.likes : ''}</span>
                </button>

                <button
                  onClick={() => {
                    setShowReplyBox(!showReplyBox);
                    setTimeout(() => textareaRef.current?.focus(), 0);
                  }}
                  className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
                >
                  Reply
                </button>

                <button
                  onClick={() => setIsCollapsed(true)}
                  className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
                >
                  Collapse
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Reply input */}
      {showReplyBox && (
        <div className="ml-12 mt-3">
          <div className="flex gap-3">
            <div className="w-7 h-7 rounded-full bg-zinc-700 flex-shrink-0 mt-1" />
            <div className="flex-1">
              <textarea
                ref={textareaRef}
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Write a reply..."
                className="w-full px-3 py-2 bg-transparent border-b border-zinc-700 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500 resize-none min-h-[60px]"
                rows={2}
              />
              <div className="flex items-center justify-end gap-2 mt-2">
                <button
                  onClick={() => {
                    setShowReplyBox(false);
                    setReplyText('');
                  }}
                  className="px-3 py-1.5 text-xs font-medium text-zinc-400 hover:text-white rounded-full hover:bg-white/5 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmitReply}
                  disabled={!replyText.trim()}
                  className="px-4 py-1.5 text-xs font-medium bg-blue-600 text-white rounded-full hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Reply
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Replies */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="ml-12">
          {!showReplies ? (
            <button
              onClick={() => setShowReplies(true)}
              className="flex items-center gap-2 mt-2 text-sm font-medium text-blue-400 hover:text-blue-300 transition-colors"
            >
              <div className="w-8 h-px bg-blue-400" />
              Show {comment.replies.length} {comment.replies.length === 1 ? 'reply' : 'replies'}
            </button>
          ) : (
            <>
              <button
                onClick={() => setShowReplies(false)}
                className="text-xs text-zinc-500 hover:text-zinc-300 mt-2 transition-colors"
              >
                Hide replies
              </button>
              {comment.replies.map((reply) => (
                <CommentItem
                  key={reply.id}
                  comment={reply}
                  onReply={onReply}
                  onLike={onLike}
                  onDelete={onDelete}
                  depth={depth + 1}
                />
              ))}
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default function CommentSection({
  videoId,
  comments,
  totalComments,
  onAddComment,
  onReply,
  onLike,
  onDelete,
}: CommentSectionProps) {
  const [commentText, setCommentText] = useState('');
  const [sortBy, setSortBy] = useState<'top' | 'newest'>('top');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = useCallback(() => {
    if (commentText.trim()) {
      onAddComment?.(commentText.trim());
      setCommentText('');
    }
  }, [commentText, onAddComment]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        handleSubmit();
      }
    },
    [handleSubmit]
  );

  const sortedComments = [...comments].sort((a, b) => {
    if (sortBy === 'newest') {
      return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
    }
    return b.likes - a.likes;
  });

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <h3 className="text-lg font-semibold text-white">
          {totalComments.toLocaleString()} Comments
        </h3>
        <div className="flex items-center gap-1 bg-zinc-900 rounded-lg p-1">
          <button
            onClick={() => setSortBy('top')}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
              sortBy === 'top' ? 'bg-zinc-700 text-white' : 'text-zinc-400 hover:text-white'
            }`}
          >
            Top
          </button>
          <button
            onClick={() => setSortBy('newest')}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
              sortBy === 'newest' ? 'bg-zinc-700 text-white' : 'text-zinc-400 hover:text-white'
            }`}
          >
            Newest
          </button>
        </div>
      </div>

      {/* Add comment */}
      <div className="flex gap-3 mb-8">
        <div className="w-10 h-10 rounded-full bg-zinc-700 flex-shrink-0" />
        <div className="flex-1">
          <textarea
            ref={textareaRef}
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Add a comment..."
            className="w-full px-0 py-2 bg-transparent border-b border-zinc-700 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500 resize-none min-h-[40px]"
            rows={commentText ? 3 : 1}
            onFocus={(e) => {
              e.currentTarget.rows = 3;
            }}
          />
          {commentText.trim() && (
            <div className="flex items-center justify-end gap-2 mt-2">
              <button
                onClick={() => {
                  setCommentText('');
                  textareaRef.current?.blur();
                }}
                className="px-4 py-1.5 text-sm font-medium text-zinc-400 hover:text-white rounded-full hover:bg-white/5 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                className="px-5 py-1.5 text-sm font-medium bg-blue-600 text-white rounded-full hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                disabled={!commentText.trim()}
              >
                Comment
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Comment list */}
      <div className="space-y-1">
        {sortedComments.length === 0 ? (
          <div className="flex flex-col items-center py-12 text-zinc-500">
            <svg className="w-12 h-12 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
            </svg>
            <p className="text-sm">No comments yet. Be the first to comment!</p>
          </div>
        ) : (
          sortedComments.map((comment) => (
            <div key={comment.id} className="border-b border-zinc-800 last:border-0">
              <CommentItem
                comment={comment}
                onReply={onReply}
                onLike={onLike}
                onDelete={onDelete}
              />
            </div>
          ))
        )}
      </div>
    </div>
  );
}
