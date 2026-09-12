'use client';

import { useState, useCallback, useRef } from 'react';

interface UploadFile {
  id: string;
  file: File;
  name: string;
  size: number;
  type: string;
  progress: number;
  status: 'pending' | 'uploading' | 'processing' | 'complete' | 'error';
  preview?: string;
  error?: string;
}

interface UploadForm {
  title: string;
  description: string;
  category: string;
  tags: string;
  visibility: 'public' | 'unlisted' | 'private';
  aiEnhance: boolean;
  autoGenerateThumbnail: boolean;
  schedulePublish: boolean;
  scheduledDate: string;
  scheduledTime: string;
}

const CATEGORIES = ['Technology', 'AI & ML', 'Creative', 'Music', 'Education', 'Entertainment', 'Science', 'Business', 'Gaming', 'Other'];
const MAX_FILE_SIZE = 10 * 1024 * 1024 * 1024;
const ALLOWED_TYPES = ['video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo'];

function formatFileSize(bytes: number): string {
  if (bytes >= 1073741824) return `${(bytes / 1073741824).toFixed(1)} GB`;
  if (bytes >= 1048576) return `${(bytes / 1048576).toFixed(1)} MB`;
  if (bytes >= 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${bytes} B`;
}

function getProgressColor(status: string): string {
  switch (status) {
    case 'uploading': return 'from-pink-500 to-purple-500';
    case 'processing': return 'from-blue-500 to-cyan-500';
    case 'complete': return 'from-green-500 to-emerald-500';
    case 'error': return 'from-red-500 to-rose-500';
    default: return 'from-zinc-600 to-zinc-500';
  }
}

export default function UploadPage() {
  const [files, setFiles] = useState<UploadFile[]>([]);
  const [form, setForm] = useState<UploadForm>({
    title: '', description: '', category: '', tags: '', visibility: 'public',
    aiEnhance: true, autoGenerateThumbnail: true, schedulePublish: false, scheduledDate: '', scheduledTime: '',
  });
  const [dragActive, setDragActive] = useState(false);
  const [uploadStarted, setUploadStarted] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const addFiles = useCallback((newFiles: FileList | File[]) => {
    const ArrayFiles = Array.from(newFiles);
    const valid = ArrayFiles.filter(f => {
      if (!ALLOWED_TYPES.includes(f.type)) return false;
      if (f.size > MAX_FILE_SIZE) return false;
      return true;
    });
    const uploadFiles: UploadFile[] = valid.map(f => ({
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      file: f, name: f.name, size: f.size, type: f.type, progress: 0, status: 'pending',
      preview: f.type.startsWith('video/') ? URL.createObjectURL(f) : undefined,
    }));
    setFiles(prev => [...prev, ...uploadFiles]);
  }, []);

  const handleDrag = useCallback((e: React.DragEvent) => { e.preventDefault(); e.stopPropagation(); if (e.type === 'dragenter' || e.type === 'dragover') setDragActive(true); else if (e.type === 'dragleave') setDragActive(false); }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); e.stopPropagation(); setDragActive(false);
    if (e.dataTransfer.files?.length) addFiles(e.dataTransfer.files);
  }, [addFiles]);

  const removeFile = (id: string) => {
    setFiles(prev => {
      const f = prev.find(x => x.id === id);
      if (f?.preview) URL.revokeObjectURL(f.preview);
      return prev.filter(x => x.id !== id);
    });
  };

  const simulateUpload = () => {
    setUploadStarted(true);
    files.forEach((f, i) => {
      if (f.status !== 'pending') return;
      setTimeout(() => {
        setFiles(prev => prev.map(x => x.id === f.id ? { ...x, status: 'uploading' } : x));
        let progress = 0;
        const interval = setInterval(() => {
          progress += Math.random() * 15 + 5;
          if (progress >= 100) {
            progress = 100;
            clearInterval(interval);
            setFiles(prev => prev.map(x => x.id === f.id ? { ...x, progress: 100, status: 'processing' } : x));
            setTimeout(() => {
              setFiles(prev => prev.map(x => x.id === f.id ? { ...x, status: 'complete' } : x));
            }, 2000 + Math.random() * 2000);
          } else {
            setFiles(prev => prev.map(x => x.id === f.id ? { ...x, progress: Math.min(progress, 99) } : x));
          }
        }, 300);
      }, i * 500);
    });
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">Upload</h1>
          <p className="text-zinc-400 mt-1">Upload and configure your media content</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          <div className="lg:col-span-3 space-y-6">
            <div
              className={`relative border-2 border-dashed rounded-2xl p-12 text-center transition-all cursor-pointer ${
                dragActive ? 'border-pink-500 bg-pink-500/5 shadow-lg shadow-pink-500/10' : 'border-zinc-700 hover:border-zinc-600 bg-zinc-900/50'
              }`}
              onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <input ref={fileInputRef} type="file" multiple accept="video/*" className="hidden" onChange={(e) => e.target.files && addFiles(e.target.files)} />
              <div className="flex flex-col items-center">
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 transition-colors ${dragActive ? 'bg-pink-500/20' : 'bg-zinc-800'}`}>
                  <svg className={`w-8 h-8 transition-colors ${dragActive ? 'text-pink-400' : 'text-zinc-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                  </svg>
                </div>
                <p className="text-lg font-medium text-white mb-1">{dragActive ? 'Drop files here' : 'Drag & drop videos'}</p>
                <p className="text-sm text-zinc-500">or <span className="text-pink-400 hover:text-pink-300">browse files</span></p>
                <p className="text-xs text-zinc-600 mt-3">MP4, WebM, MOV up to 10GB each</p>
              </div>
            </div>

            {files.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-zinc-300">{files.length} file{files.length !== 1 ? 's' : ''}</h3>
                  {!uploadStarted && (
                    <button onClick={simulateUpload} className="px-5 py-2.5 text-sm font-semibold bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-lg hover:shadow-lg hover:shadow-pink-500/25 transition-all">
                      Start Upload
                    </button>
                  )}
                </div>
                {files.map((f) => (
                  <div key={f.id} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex items-center gap-4">
                    <div className="relative w-20 h-12 rounded-lg overflow-hidden bg-zinc-800 flex-shrink-0">
                      {f.preview ? (
                        <video src={f.preview} className="w-full h-full object-cover" muted />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <svg className="w-6 h-6 text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3.375 19.5h17.25m-17.25 0a1.125 1.125 0 01-1.125-1.125M3.375 19.5h1.5C5.496 19.5 6 18.996 6 18.375m-3.75 0V5.625m0 12.75v-1.5c0-.621.504-1.125 1.125-1.125m18.375 2.625V5.625m0 12.75c0 .621-.504 1.125-1.125 1.125m1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125m0 3.75h-1.5A1.125 1.125 0 0118 18.375M20.625 4.5H3.375m17.25 0c.621 0 1.125.504 1.125 1.125M20.625 4.5h-1.5C18.504 4.5 18 5.004 18 5.625m3.75 0v1.5c0 .621-.504 1.125-1.125 1.125M3.375 4.5c-.621 0-1.125.504-1.125 1.125M3.375 4.5h1.5C5.496 4.5 6 5.004 6 5.625m-3.75 0v1.5c0 .621.504 1.125 1.125 1.125m0 0h1.5m-1.5 0c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125m1.5-3.75C5.496 8.25 6 7.746 6 7.125v-1.5M4.875 8.25C5.496 8.25 6 8.754 6 9.375v1.5m0-5.25v5.25m0-5.25C6 5.004 6.504 4.5 7.125 4.5h9.75c.621 0 1.125.504 1.125 1.125m1.125 2.625h1.5m-1.5 0A1.125 1.125 0 0118 7.125v-1.5m1.125 2.625c-.621 0-1.125.504-1.125 1.125v1.5m2.625-2.625c.621 0 1.125.504 1.125 1.125v1.5c0 .621-.504 1.125-1.125 1.125M18 5.625v5.25M7.125 12h9.75m-9.75 0A1.125 1.125 0 016 10.875M7.125 12C6.504 12 6 12.504 6 13.125m0-2.25C6 11.496 5.496 12 4.875 12M18 10.875c0 .621-.504 1.125-1.125 1.125M18 10.875c0 .621.504 1.125 1.125 1.125m-2.25 0c.621 0 1.125.504 1.125 1.125m-12 5.25v-5.25m0 5.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125m-12 0v-1.5c0-.621-.504-1.125-1.125-1.125M18 18.375v-5.25m0 5.25v-1.5c0-.621.504-1.125 1.125-1.125M18 13.125v1.5c0 .621.504 1.125 1.125 1.125M18 13.125c0-.621.504-1.125 1.125-1.125M6 13.125v1.5c0 .621-.504 1.125-1.125 1.125M6 13.125C6 12.504 5.496 12 4.875 12m-1.5 0h1.5m-1.5 0c-.621 0-1.125-.504-1.125-1.125v-1.5c0-.621.504-1.125 1.125-1.125m1.5 3.75c-.621 0-1.125-.504-1.125-1.125" /></svg>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white font-medium truncate">{f.name}</p>
                      <p className="text-xs text-zinc-500 mt-0.5">{formatFileSize(f.size)} · {f.type.split('/')[1].toUpperCase()}</p>
                      <div className="mt-2">
                        <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                          <div className={`h-full bg-gradient-to-r ${getProgressColor(f.status)} rounded-full transition-all duration-300`} style={{ width: `${f.progress}%` }} />
                        </div>
                        <div className="flex items-center justify-between mt-1">
                          <span className={`text-[10px] font-medium capitalize ${f.status === 'complete' ? 'text-green-400' : f.status === 'error' ? 'text-red-400' : 'text-zinc-500'}`}>{f.status}</span>
                          <span className="text-[10px] text-zinc-500">{Math.round(f.progress)}%</span>
                        </div>
                      </div>
                    </div>
                    <button onClick={() => removeFile(f.id)} className="p-1.5 text-zinc-500 hover:text-red-400 transition-colors flex-shrink-0">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="lg:col-span-2">
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 sticky top-8 space-y-5">
              <h3 className="text-lg font-semibold text-white">Video Details</h3>
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1.5">Title</label>
                <input type="text" value={form.title} onChange={(e) => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Enter video title" className="w-full px-4 py-2.5 bg-zinc-800 border border-zinc-700 rounded-lg text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-pink-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1.5">Description</label>
                <textarea rows={4} value={form.description} onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Describe your video..." className="w-full px-4 py-2.5 bg-zinc-800 border border-zinc-700 rounded-lg text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-pink-500 resize-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1.5">Category</label>
                <select value={form.category} onChange={(e) => setForm(f => ({ ...f, category: e.target.value }))} className="w-full px-4 py-2.5 bg-zinc-800 border border-zinc-700 rounded-lg text-sm text-zinc-300 focus:outline-none focus:ring-2 focus:ring-pink-500">
                  <option value="">Select category</option>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1.5">Tags</label>
                <input type="text" value={form.tags} onChange={(e) => setForm(f => ({ ...f, tags: e.target.value }))} placeholder="AI, tutorial, creative" className="w-full px-4 py-2.5 bg-zinc-800 border border-zinc-700 rounded-lg text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-pink-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1.5">Visibility</label>
                <div className="flex gap-2">
                  {(['public', 'unlisted', 'private'] as const).map(v => (
                    <button key={v} onClick={() => setForm(f => ({ ...f, visibility: v }))} className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all capitalize ${form.visibility === v ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white' : 'bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-700'}`}>{v}</button>
                  ))}
                </div>
              </div>
              <div className="space-y-3 pt-2">
                {[
                  { key: 'aiEnhance', label: 'AI Enhancement', desc: 'Auto-enhance video quality' },
                  { key: 'autoGenerateThumbnail', label: 'Auto Thumbnail', desc: 'Generate AI thumbnail' },
                  { key: 'schedulePublish', label: 'Schedule Publish', desc: 'Set a publish date' },
                ].map(opt => (
                  <label key={opt.key} className="flex items-center justify-between p-3 bg-zinc-800/50 rounded-lg cursor-pointer hover:bg-zinc-800 transition-colors">
                    <div>
                      <p className="text-sm font-medium text-white">{opt.label}</p>
                      <p className="text-xs text-zinc-500">{opt.desc}</p>
                    </div>
                    <div className={`relative w-10 h-5 rounded-full transition-colors ${(form as any)[opt.key] ? 'bg-pink-500' : 'bg-zinc-700'}`}>
                      <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${(form as any)[opt.key] ? 'translate-x-5' : 'translate-x-0.5'}`} />
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
