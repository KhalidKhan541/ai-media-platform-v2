import { useState, useCallback, useRef } from 'react';

interface TimelineClip {
  id: string;
  name: string;
  startTime: number;
  duration: number;
  thumbnail: string;
  type: 'video' | 'audio' | 'image' | 'text' | 'effect';
  color: string;
}

interface VideoEditorProps {
  videoUrl: string;
  thumbnail: string;
  duration: number;
  clips: TimelineClip[];
  onClipUpdate?: (clipId: string, updates: Partial<TimelineClip>) => void;
  onClipDelete?: (clipId: string) => void;
  onExport?: (settings: ExportSettings) => void;
}

interface ExportSettings {
  resolution: string;
  format: string;
  quality: string;
  fps: number;
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export default function VideoEditor({
  videoUrl,
  thumbnail,
  duration,
  clips,
  onClipUpdate,
  onClipDelete,
  onExport,
}: VideoEditorProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [selectedClip, setSelectedClip] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportSettings, setExportSettings] = useState<ExportSettings>({
    resolution: '1080p',
    format: 'mp4',
    quality: 'high',
    fps: 30,
  });
  const [activePanel, setActivePanel] = useState<'clips' | 'effects' | 'text' | 'audio'>('clips');
  const [isDragging, setIsDragging] = useState(false);

  const timelineRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  const handleTimelineClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const rect = e.currentTarget.getBoundingClientRect();
      const percent = (e.clientX - rect.left) / rect.width;
      setCurrentTime(percent * duration);
    },
    [duration]
  );

  const handlePlayPause = useCallback(() => {
    setIsPlaying((prev) => !prev);
  }, []);

  const handleClipDrag = useCallback(
    (clipId: string, e: React.MouseEvent) => {
      setIsDragging(true);
      setSelectedClip(clipId);

      const startX = e.clientX;
      const clip = clips.find((c) => c.id === clipId);
      if (!clip) return;

      const handleMouseMove = (moveE: MouseEvent) => {
        const delta = (moveE.clientX - startX) / (zoom * 10);
        const newStart = Math.max(0, Math.min(duration - clip.duration, clip.startTime + delta));
        onClipUpdate?.(clipId, { startTime: newStart });
      };

      const handleMouseUp = () => {
        setIsDragging(false);
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };

      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    },
    [clips, zoom, duration, onClipUpdate]
  );

  const timelineWidth = duration * 50 * zoom;

  return (
    <div className="w-full bg-zinc-950 rounded-2xl overflow-hidden border border-zinc-800">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-3 bg-zinc-900 border-b border-zinc-800">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <button className="p-2 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
              </svg>
            </button>
            <button className="p-2 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
              </svg>
            </button>
            <div className="w-px h-6 bg-zinc-700 mx-1" />
            <button className="p-2 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182" />
              </svg>
            </button>
            <button className="p-2 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
              </svg>
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-zinc-800 rounded-lg px-3 py-1.5">
            <svg className="w-4 h-4 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" />
            </svg>
            <input
              type="range"
              min={0.5}
              max={3}
              step={0.25}
              value={zoom}
              onChange={(e) => setZoom(parseFloat(e.target.value))}
              className="w-20 h-1 accent-violet-500"
            />
            <span className="text-xs text-zinc-400 w-8">{zoom}x</span>
          </div>

          <button
            onClick={() => setShowExportModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-violet-600 text-white text-sm font-semibold rounded-lg hover:bg-violet-500 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
            </svg>
            Export
          </button>
        </div>
      </div>

      {/* Main content area */}
      <div className="flex flex-col lg:flex-row">
        {/* Preview */}
        <div className="flex-1 p-4">
          <div className="relative aspect-video bg-black rounded-xl overflow-hidden">
            <video
              ref={videoRef}
              src={videoUrl}
              poster={thumbnail}
              className="w-full h-full object-contain"
            />

            {/* Overlay controls */}
            <div className="absolute inset-0 flex items-center justify-center">
              <button
                onClick={handlePlayPause}
                className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center hover:bg-white/30 transition-colors"
              >
                {isPlaying ? (
                  <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
                  </svg>
                ) : (
                  <svg className="w-8 h-8 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                )}
              </button>
            </div>

            {/* Time display */}
            <div className="absolute bottom-3 left-3 px-3 py-1 bg-black/60 rounded-lg backdrop-blur-sm">
              <span className="text-xs font-mono text-white">
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>
            </div>
          </div>

          {/* Playback controls */}
          <div className="flex items-center justify-center gap-4 mt-4">
            <button className="p-2 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182" />
              </svg>
            </button>
            <button className="p-2 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19 12H5m7-7l-7 7 7 7" />
              </svg>
            </button>
            <button
              onClick={handlePlayPause}
              className="w-12 h-12 rounded-full bg-white flex items-center justify-center hover:bg-zinc-200 transition-colors"
            >
              {isPlaying ? (
                <svg className="w-6 h-6 text-black" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
                </svg>
              ) : (
                <svg className="w-6 h-6 text-black ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              )}
            </button>
            <button className="p-2 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M5 12h14m-7-7l7 7-7 7" />
              </svg>
            </button>
            <button className="p-2 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
              </svg>
            </button>
          </div>
        </div>

        {/* Side panel */}
        <div className="w-full lg:w-72 border-t lg:border-t-0 lg:border-l border-zinc-800">
          <div className="flex border-b border-zinc-800">
            {(['clips', 'effects', 'text', 'audio'] as const).map((panel) => (
              <button
                key={panel}
                onClick={() => setActivePanel(panel)}
                className={`flex-1 py-3 text-xs font-medium capitalize transition-colors ${
                  activePanel === panel
                    ? 'text-white border-b-2 border-violet-500'
                    : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                {panel}
              </button>
            ))}
          </div>

          <div className="p-4 max-h-64 overflow-y-auto">
            {activePanel === 'clips' && (
              <div className="space-y-2">
                {clips.map((clip) => (
                  <div
                    key={clip.id}
                    onClick={() => setSelectedClip(clip.id)}
                    className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors ${
                      selectedClip === clip.id ? 'bg-zinc-800 border border-violet-500/50' : 'hover:bg-zinc-800/50'
                    }`}
                  >
                    <div
                      className="w-10 h-10 rounded-md flex items-center justify-center text-xs font-bold text-white"
                      style={{ backgroundColor: clip.color }}
                    >
                      {clip.type === 'video' ? 'V' : clip.type === 'audio' ? 'A' : clip.type === 'text' ? 'T' : 'E'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-zinc-200 truncate">{clip.name}</p>
                      <p className="text-[10px] text-zinc-500">{formatTime(clip.duration)}</p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onClipDelete?.(clip.id);
                      }}
                      className="p-1 rounded hover:bg-zinc-700 text-zinc-500 hover:text-red-400 transition-colors"
                    >
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}

            {activePanel === 'effects' && (
              <div className="grid grid-cols-3 gap-2">
                {['Blur', 'Sepia', 'B&W', 'Vintage', 'Neon', 'Glitch'].map((effect) => (
                  <button
                    key={effect}
                    className="p-3 bg-zinc-800 rounded-lg text-xs text-zinc-300 hover:bg-zinc-700 hover:text-white transition-colors"
                  >
                    {effect}
                  </button>
                ))}
              </div>
            )}

            {activePanel === 'text' && (
              <div className="space-y-3">
                {['Title', 'Subtitle', 'Lower Third', 'Caption'].map((textType) => (
                  <button
                    key={textType}
                    className="w-full p-3 bg-zinc-800 rounded-lg text-xs text-zinc-300 hover:bg-zinc-700 hover:text-white transition-colors text-left"
                  >
                    + Add {textType}
                  </button>
                ))}
              </div>
            )}

            {activePanel === 'audio' && (
              <div className="space-y-3">
                <div className="p-3 bg-zinc-800 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-zinc-300">Volume</span>
                    <span className="text-xs text-zinc-500">80%</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    defaultValue={80}
                    className="w-full h-1 accent-violet-500 mt-2"
                  />
                </div>
                <div className="p-3 bg-zinc-800 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-zinc-300">Fade In</span>
                    <span className="text-xs text-zinc-500">0.5s</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={5}
                    step={0.1}
                    defaultValue={0.5}
                    className="w-full h-1 accent-violet-500 mt-2"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="border-t border-zinc-800 bg-zinc-900/50">
        {/* Time ruler */}
        <div className="px-4 py-2 border-b border-zinc-800">
          <div className="flex items-center justify-between">
            {Array.from({ length: Math.ceil(duration / 10) + 1 }).map((_, i) => (
              <span key={i} className="text-[10px] text-zinc-600 font-mono">
                {formatTime(i * 10)}
              </span>
            ))}
          </div>
        </div>

        {/* Timeline track */}
        <div
          ref={timelineRef}
          className="relative h-24 overflow-x-auto cursor-crosshair"
          onClick={handleTimelineClick}
        >
          <div className="relative h-full" style={{ width: timelineWidth }}>
            {/* Playhead */}
            <div
              className="absolute top-0 bottom-0 w-0.5 bg-white z-20"
              style={{ left: (currentTime / duration) * timelineWidth }}
            >
              <div className="absolute -top-1 -left-1.5 w-3.5 h-3.5 bg-white rounded-sm rotate-45" />
            </div>

            {/* Clips */}
            {clips.map((clip) => {
              const left = (clip.startTime / duration) * timelineWidth;
              const width = (clip.duration / duration) * timelineWidth;

              return (
                <div
                  key={clip.id}
                  className={`absolute top-2 bottom-2 rounded-lg cursor-grab active:cursor-grabbing border-2 transition-colors ${
                    selectedClip === clip.id ? 'border-white' : 'border-transparent hover:border-zinc-500'
                  }`}
                  style={{
                    left,
                    width: Math.max(width, 20),
                    backgroundColor: clip.color,
                  }}
                  onMouseDown={(e) => handleClipDrag(clip.id, e)}
                >
                  <div className="px-2 py-1 h-full flex items-center">
                    <span className="text-[10px] font-medium text-white/90 truncate">{clip.name}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Export modal */}
      {showExportModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-zinc-900 border border-zinc-700 rounded-2xl p-6 w-96 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-white">Export Video</h3>
              <button
                onClick={() => setShowExportModal(false)}
                className="p-1 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1.5">Resolution</label>
                <select
                  value={exportSettings.resolution}
                  onChange={(e) => setExportSettings({ ...exportSettings, resolution: e.target.value })}
                  className="w-full px-4 py-2.5 bg-zinc-800 border border-zinc-700 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
                >
                  <option value="4K">4K (3840x2160)</option>
                  <option value="1080p">1080p (1920x1080)</option>
                  <option value="720p">720p (1280x720)</option>
                  <option value="480p">480p (854x480)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1.5">Format</label>
                <select
                  value={exportSettings.format}
                  onChange={(e) => setExportSettings({ ...exportSettings, format: e.target.value })}
                  className="w-full px-4 py-2.5 bg-zinc-800 border border-zinc-700 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
                >
                  <option value="mp4">MP4</option>
                  <option value="webm">WebM</option>
                  <option value="mov">MOV</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1.5">Quality</label>
                <div className="flex gap-2">
                  {['low', 'medium', 'high', 'ultra'].map((q) => (
                    <button
                      key={q}
                      onClick={() => setExportSettings({ ...exportSettings, quality: q })}
                      className={`flex-1 py-2 text-xs font-medium rounded-lg border transition-colors capitalize ${
                        exportSettings.quality === q
                          ? 'bg-violet-600 border-violet-500 text-white'
                          : 'bg-zinc-800 border-zinc-700 text-zinc-300 hover:border-zinc-500'
                      }`}
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1.5">Frame Rate</label>
                <select
                  value={exportSettings.fps}
                  onChange={(e) => setExportSettings({ ...exportSettings, fps: parseInt(e.target.value) })}
                  className="w-full px-4 py-2.5 bg-zinc-800 border border-zinc-700 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
                >
                  <option value={24}>24 FPS</option>
                  <option value={30}>30 FPS</option>
                  <option value={60}>60 FPS</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowExportModal(false)}
                className="flex-1 py-2.5 text-sm font-medium text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onExport?.(exportSettings);
                  setShowExportModal(false);
                }}
                className="flex-1 py-2.5 text-sm font-semibold bg-violet-600 text-white rounded-lg hover:bg-violet-500 transition-colors"
              >
                Export
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
