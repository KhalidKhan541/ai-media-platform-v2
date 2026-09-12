import { useState, useCallback, useRef, useEffect } from 'react';

interface ChatMessage {
  id: string;
  author: string;
  avatar: string;
  content: string;
  timestamp: string;
  badges?: string[];
  color?: string;
  isSubscriber?: boolean;
  isModerator?: boolean;
  isOwner?: boolean;
}

interface LiveChatProps {
  messages: ChatMessage[];
  isLive: boolean;
  viewerCount: number;
  onSendMessage?: (content: string) => void;
  onSendSuperChat?: (amount: number, message: string) => void;
  onBan?: (userId: string) => void;
  slowMode?: boolean;
  slowModeInterval?: number;
  chatMode?: 'live' | 'slow' | 'subscribers' | 'emote';
}

const BADGE_COLORS: Record<string, string> = {
  moderator: 'bg-blue-600',
  subscriber: 'bg-purple-600',
  vip: 'bg-yellow-500',
  owner: 'bg-red-600',
  verified: 'bg-blue-400',
};

function timeAgo(date: string): string {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m`;
  return `${Math.floor(minutes / 60)}h`;
}

export default function LiveChat({
  messages,
  isLive,
  viewerCount,
  onSendMessage,
  onSendSuperChat,
  onBan,
  slowMode = false,
  slowModeInterval = 30,
  chatMode = 'live',
}: LiveChatProps) {
  const [inputText, setInputText] = useState('');
  const [isAutoScroll, setIsAutoScroll] = useState(true);
  const [showSuperChat, setShowSuperChat] = useState(false);
  const [superChatAmount, setSuperChatAmount] = useState(2);
  const [superChatMessage, setSuperChatMessage] = useState('');
  const [lastSentTime, setLastSentTime] = useState(0);
  const [cooldown, setCooldown] = useState(0);
  const [isChatDisabled, setIsChatDisabled] = useState(false);

  const chatContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isAutoScroll && chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages, isAutoScroll]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleScroll = useCallback(() => {
    const container = chatContainerRef.current;
    if (!container) return;
    const isAtBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 50;
    setIsAutoScroll(isAtBottom);
  }, []);

  const handleSend = useCallback(() => {
    if (!inputText.trim() || isChatDisabled) return;

    if (slowMode && cooldown > 0) return;

    onSendMessage?.(inputText.trim());
    setInputText('');

    if (slowMode) {
      setLastSentTime(Date.now());
      setCooldown(slowModeInterval);
    }
  }, [inputText, isChatDisabled, slowMode, cooldown, slowModeInterval, onSendMessage]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend]
  );

  const handleSendSuperChat = useCallback(() => {
    if (!superChatMessage.trim()) return;
    onSendSuperChat?.(superChatAmount, superChatMessage.trim());
    setSuperChatMessage('');
    setShowSuperChat(false);
  }, [superChatAmount, superChatMessage, onSendSuperChat]);

  const scrollToBottom = useCallback(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: 'smooth',
      });
      setIsAutoScroll(true);
    }
  }, []);

  const messageRate = messages.length > 0 ? messages.length : 0;

  return (
    <div className="flex flex-col h-full bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800">
        <div className="flex items-center gap-3">
          <h3 className="text-sm font-semibold text-white">Live Chat</h3>
          {isLive && (
            <div className="flex items-center gap-1.5">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
              </span>
              <span className="text-xs text-red-400 font-medium">LIVE</span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-3 text-xs text-zinc-400">
          <span className="flex items-center gap-1">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
            </svg>
            {viewerCount.toLocaleString()}
          </span>
          <span>{messageRate} msg/min</span>
        </div>
      </div>

      {/* Chat mode indicator */}
      {chatMode !== 'live' && (
        <div className="px-4 py-2 bg-zinc-800/50 border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <svg className="w-3.5 h-3.5 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
            <span className="text-xs text-yellow-400">
              {chatMode === 'slow' && `Slow mode: ${slowModeInterval}s between messages`}
              {chatMode === 'subscribers' && 'Subscribers only'}
              {chatMode === 'emote' && 'Emote-only mode'}
            </span>
          </div>
        </div>
      )}

      {/* Messages */}
      <div
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto px-3 py-2 space-y-1 scroll-smooth"
        onScroll={handleScroll}
      >
        {!isLive ? (
          <div className="flex flex-col items-center justify-center h-full text-zinc-500">
            <svg className="w-12 h-12 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 9.75L19.5 12m0 0l2.25 2.25M19.5 12l2.25-2.25M19.5 12l-2.25 2.25m-10.5-6l4.72-3.72a.75.75 0 011.28.53v14.88a.75.75 0 01-1.28.53l-4.72-3.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z" />
            </svg>
            <p className="text-sm">Stream is offline</p>
            <p className="text-xs mt-1">Chat will be available when the stream starts</p>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-zinc-500">
            <p className="text-sm">Waiting for messages...</p>
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className="flex items-start gap-2 py-1 px-2 rounded-lg hover:bg-white/5 transition-colors group"
            >
              <img
                src={msg.avatar}
                alt={msg.author}
                className="w-6 h-6 rounded-full flex-shrink-0 mt-0.5"
                loading="lazy"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  {msg.badges?.map((badge) => (
                    <span
                      key={badge}
                      className={`inline-flex items-center px-1 py-0.5 rounded text-[9px] font-bold text-white ${BADGE_COLORS[badge] || 'bg-zinc-600'}`}
                    >
                      {badge.charAt(0).toUpperCase()}
                    </span>
                  ))}
                  <span
                    className="text-xs font-semibold"
                    style={{ color: msg.color || '#ffffff' }}
                  >
                    {msg.author}
                  </span>
                  <span className="text-[10px] text-zinc-600">{timeAgo(msg.timestamp)}</span>
                </div>
                <p className="text-sm text-zinc-300 break-words">{msg.content}</p>
              </div>
              <button
                onClick={() => onBan?.(msg.id)}
                className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-zinc-700 text-zinc-500 hover:text-red-400 transition-all"
                aria-label="Ban user"
              >
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                </svg>
              </button>
            </div>
          ))
        )}
      </div>

      {/* Scroll to bottom */}
      {!isAutoScroll && (
        <button
          onClick={scrollToBottom}
          className="absolute bottom-20 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-zinc-800 text-white text-xs font-medium rounded-full border border-zinc-700 hover:bg-zinc-700 transition-colors shadow-lg z-10"
        >
          ↓ New messages
        </button>
      )}

      {/* Super Chat modal */}
      {showSuperChat && (
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-20">
          <div className="bg-zinc-900 border border-zinc-700 rounded-2xl p-6 w-80 shadow-2xl">
            <h4 className="text-lg font-semibold text-white mb-4">Super Chat</h4>
            <div className="flex gap-2 mb-4">
              {[2, 5, 10, 20, 50, 100].map((amount) => (
                <button
                  key={amount}
                  onClick={() => setSuperChatAmount(amount)}
                  className={`flex-1 py-2 text-sm font-bold rounded-lg border transition-colors ${
                    superChatAmount === amount
                      ? 'bg-yellow-500 border-yellow-400 text-black'
                      : 'bg-zinc-800 border-zinc-700 text-zinc-300 hover:border-zinc-500'
                  }`}
                >
                  ${amount}
                </button>
              ))}
            </div>
            <input
              type="text"
              value={superChatMessage}
              onChange={(e) => setSuperChatMessage(e.target.value)}
              placeholder="Send a message..."
              className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-yellow-500 mb-4"
              maxLength={150}
            />
            <div className="flex gap-2">
              <button
                onClick={() => setShowSuperChat(false)}
                className="flex-1 py-2 text-sm font-medium text-zinc-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSendSuperChat}
                disabled={!superChatMessage.trim()}
                className="flex-1 py-2 text-sm font-bold bg-yellow-500 text-black rounded-lg hover:bg-yellow-400 disabled:opacity-50 transition-colors"
              >
                Send ${superChatAmount}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Input area */}
      <div className="px-3 py-3 border-t border-zinc-800">
        {isLive ? (
          <div className="flex items-center gap-2">
            <div className="flex-1 relative">
              <input
                ref={inputRef}
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={
                  isChatDisabled
                    ? 'Chat is disabled'
                    : slowMode && cooldown > 0
                    ? `Wait ${cooldown}s...`
                    : 'Send a message...'
                }
                disabled={isChatDisabled || (slowMode && cooldown > 0)}
                className="w-full px-4 py-2.5 bg-zinc-800 border border-zinc-700 rounded-full text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                maxLength={500}
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-zinc-600">
                {inputText.length}/500
              </span>
            </div>
            <button
              onClick={() => setShowSuperChat(true)}
              className="p-2.5 rounded-full bg-zinc-800 border border-zinc-700 text-yellow-400 hover:bg-zinc-700 transition-colors"
              aria-label="Super Chat"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 11.25v8.25a1.5 1.5 0 01-1.5 1.5H5.25a1.5 1.5 0 01-1.5-1.5v-8.25M12 4.875A2.625 2.625 0 109.375 7.5H12m0-2.625V7.5m0-2.625A2.625 2.625 0 1114.625 7.5H12m0 0V21m-8.625-9.75h18c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125h-18c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
              </svg>
            </button>
            <button
              onClick={handleSend}
              disabled={!inputText.trim() || isChatDisabled || (slowMode && cooldown > 0)}
              className="px-5 py-2.5 bg-purple-600 text-white text-sm font-semibold rounded-full hover:bg-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Chat
            </button>
          </div>
        ) : (
          <div className="text-center py-2 text-sm text-zinc-500">
            Chat is available during live streams
          </div>
        )}
      </div>
    </div>
  );
}
