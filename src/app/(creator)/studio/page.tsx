'use client';

import { useState } from 'react';

interface Project {
  id: string;
  title: string;
  type: 'video' | 'podcast' | 'live';
  thumbnail: string;
  lastEdited: string;
  duration: string;
  status: 'editing' | 'rendering' | 'ready';
  progress: number;
}

const MOCK_PROJECTS: Project[] = [
  { id: '1', title: 'AI Art Tutorial Part 3', type: 'video', thumbnail: '/studio/proj1.jpg', lastEdited: '2026-09-12T10:00:00Z', duration: '12:34', status: 'editing', progress: 65 },
  { id: '2', title: 'Creator Q&A Session', type: 'podcast', thumbnail: '/studio/proj2.jpg', lastEdited: '2026-09-11T14:00:00Z', duration: '45:12', status: 'ready', progress: 100 },
  { id: '3', title: 'Neural Network Live Demo', type: 'live', thumbnail: '/studio/proj3.jpg', lastEdited: '2026-09-10T09:00:00Z', duration: '1:23:45', status: 'rendering', progress: 88 },
  { id: '4', title: 'Music Generation Showcase', type: 'video', thumbnail: '/studio/proj4.jpg', lastEdited: '2026-09-09T16:00:00Z', duration: '8:22', status: 'editing', progress: 30 },
];

interface Tool {
  name: string;
  description: string;
  icon: string;
  color: string;
  badge?: string;
}

const AI_TOOLS: Tool[] = [
  { name: 'Auto-Edit', description: 'AI-powered video editing and cuts', icon: 'M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125', color: 'from-pink-500 to-rose-500', badge: 'Pro' },
  { name: 'Voice Clone', description: 'Clone your voice for narration', icon: 'M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z', color: 'from-purple-500 to-violet-500' },
  { name: 'Style Transfer', description: 'Apply artistic styles to video', icon: 'M4.098 19.902a3.75 3.75 0 005.304 0l6.401-6.402M6.75 21A3.75 3.75 0 013 17.25V4.125C3 3.504 3.504 3 4.125 3h5.25c.621 0 1.125.504 1.125 1.125v4.072M6.75 21a3.75 3.75 0 003.75-3.75V8.197M6.75 21h13.125c.621 0 1.125-.504 1.125-1.125v-5.25c0-.621-.504-1.125-1.125-1.125h-4.072M10.5 8.197l2.88-2.88c.438-.439 1.15-.439 1.59 0l3.712 3.713c.44.44.44 1.152 0 1.59l-2.879 2.88M6.75 17.25h.008v.008H6.75v-.008z', color: 'from-blue-500 to-cyan-500' },
  { name: 'Thumbnail AI', description: 'Generate click-worthy thumbnails', icon: 'M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v13.5A1.5 1.5 0 003.75 21z', color: 'from-emerald-500 to-teal-500' },
  { name: 'Auto-Caption', description: 'Automatic subtitles and captions', icon: 'M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.076-4.076a1.526 1.526 0 011.037-.443 48.282 48.282 0 005.68-.494c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z', color: 'from-amber-500 to-orange-500' },
  { name: 'Music Sync', description: 'Auto-sync music to video cuts', icon: 'M9 9l10.5-3m0 6.553v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 11-.99-3.467l2.31-.66a2.25 2.25 0 001.632-2.163zm0 0V2.25L9 5.25v10.303m0 0v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 01-.99-3.467l2.31-.66A2.25 2.25 0 009 15.553z', color: 'from-violet-500 to-purple-500', badge: 'New' },
  { name: 'Smart Render', description: 'Optimize export settings with AI', icon: 'M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z', color: 'from-pink-500 to-purple-500' },
];

function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

const STATUS_STYLES: Record<string, string> = {
  editing: 'bg-zinc-800 text-zinc-300',
  rendering: 'bg-blue-900/30 text-blue-400',
  ready: 'bg-green-900/30 text-green-400',
};

const TYPE_ICONS: Record<string, string> = {
  video: 'M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z',
  podcast: 'M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z',
  live: 'M3.375 19.5h17.25m-17.25 0a1.125 1.125 0 01-1.125-1.125M3.375 19.5h7.5c.621 0 1.125-.504 1.125-1.125m-9.75 0V5.625m0 12.75v-1.5c0-.621.504-1.125 1.125-1.125m18.375 2.625V5.625m0 12.75c0 .621-.504 1.125-1.125 1.125m1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125m0 3.75h-1.5A1.125 1.125 0 0118 18.375M20.625 4.5H3.375m17.25 0c.621 0 1.125.504 1.125 1.125M20.625 4.5h-1.5C18.504 4.5 18 5.004 18 5.625m3.75 0v1.5c0 .621-.504 1.125-1.125 1.125M3.375 4.5c-.621 0-1.125.504-1.125 1.125M3.375 4.5h1.5C5.496 4.5 6 5.004 6 5.625m-3.75 0v1.5c0 .621.504 1.125 1.125 1.125m0 0h1.5m-1.5 0c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125m1.5-3.75C5.496 8.25 6 7.746 6 7.125v-1.5M4.875 8.25C5.496 8.25 6 8.754 6 9.375v1.5m0-5.25v5.25m0-5.25C6 5.004 6.504 4.5 7.125 4.5h9.75c.621 0 1.125.504 1.125 1.125m1.125 2.625h1.5m-1.5 0A1.125 1.125 0 0118 7.125v-1.5m1.125 2.625c-.621 0-1.125.504-1.125 1.125v1.5m2.625-2.625c.621 0 1.125.504 1.125 1.125v1.5c0 .621-.504 1.125-1.125 1.125M18 5.625v5.25M7.125 12h9.75m-9.75 0A1.125 1.125 0 016 10.875M7.125 12C6.504 12 6 12.504 6 13.125m0-2.25C6 11.496 5.496 12 4.875 12M18 10.875c0 .621-.504 1.125-1.125 1.125M18 10.875c0 .621.504 1.125 1.125 1.125m-2.25 0c.621 0 1.125.504 1.125 1.125m-12 5.25v-5.25m0 5.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125m-12 0v-1.5c0-.621-.504-1.125-1.125-1.125M18 18.375v-5.25m0 5.25v-1.5c0-.621.504-1.125 1.125-1.125M18 13.125v1.5c0 .621.504 1.125 1.125 1.125M18 13.125c0-.621.504-1.125 1.125-1.125M6 13.125v1.5c0 .621-.504 1.125-1.125 1.125M6 13.125C6 12.504 5.496 12 4.875 12m-1.5 0h1.5m-1.5 0c-.621 0-1.125-.504-1.125-1.125v-1.5c0-.621.504-1.125 1.125-1.125m1.5 3.75c-.621 0-1.125-.504-1.125-1.125',
};

export default function CreatorStudioPage() {
  const [activeTab, setActiveTab] = useState<'projects' | 'tools'>('projects');

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Studio</h1>
          <p className="text-zinc-400 mt-1">Your creative workspace and AI tools</p>
        </div>
        <button className="px-5 py-2.5 text-sm font-semibold bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-lg hover:shadow-lg hover:shadow-pink-500/25 transition-all">
          + New Project
        </button>
      </div>

      <div className="flex items-center gap-1 bg-zinc-900 border border-zinc-800 rounded-lg p-1 w-fit">
        {(['projects', 'tools'] as const).map((tab) => (
          <button key={tab} onClick={() => setActiveTab(tab)} className={`px-5 py-2 text-sm font-medium rounded-md transition-all capitalize ${activeTab === tab ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white' : 'text-zinc-400 hover:text-white'}`}>
            {tab}
          </button>
        ))}
      </div>

      {activeTab === 'projects' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {MOCK_PROJECTS.map((project) => (
            <div key={project.id} className="group bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden hover:border-zinc-700 transition-all cursor-pointer">
              <div className="relative aspect-video overflow-hidden">
                <img src={project.thumbnail} alt={project.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <div className="absolute top-2 left-2 flex items-center gap-1.5">
                  <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d={TYPE_ICONS[project.type]} /></svg>
                  <span className="text-xs text-white capitalize">{project.type}</span>
                </div>
                <span className="absolute top-2 right-2 px-2 py-0.5 text-[10px] font-medium bg-black/60 text-white rounded backdrop-blur-sm">{project.duration}</span>
              </div>
              <div className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-semibold text-white line-clamp-1 group-hover:text-pink-400 transition-colors">{project.title}</h3>
                  <span className={`px-2 py-0.5 text-[10px] font-medium rounded-full ${STATUS_STYLES[project.status]}`}>{project.status}</span>
                </div>
                <div className="mt-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-zinc-500">Progress</span>
                    <span className="text-xs text-zinc-400">{project.progress}%</span>
                  </div>
                  <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full transition-all duration-500 ${project.status === 'ready' ? 'bg-green-500' : project.status === 'rendering' ? 'bg-blue-500 animate-pulse' : 'bg-gradient-to-r from-pink-500 to-purple-500'}`} style={{ width: `${project.progress}%` }} />
                  </div>
                </div>
                <p className="text-xs text-zinc-500 mt-2">Last edited {formatDate(project.lastEdited)}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'tools' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {AI_TOOLS.map((tool) => (
            <div key={tool.name} className="group bg-zinc-900 border border-zinc-800 rounded-xl p-6 hover:border-zinc-700 transition-all cursor-pointer hover:shadow-lg hover:shadow-pink-500/5">
              <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${tool.color} bg-opacity-20 flex items-center justify-center`}>
                  <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d={tool.icon} /></svg>
                </div>
                {tool.badge && (
                  <span className="px-2.5 py-0.5 text-[10px] font-bold bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-full">{tool.badge}</span>
                )}
              </div>
              <h3 className="text-base font-semibold text-white group-hover:text-pink-400 transition-colors">{tool.name}</h3>
              <p className="text-sm text-zinc-400 mt-1">{tool.description}</p>
              <button className="mt-4 px-4 py-2 text-xs font-semibold bg-zinc-800 text-zinc-300 rounded-lg hover:bg-zinc-700 hover:text-white transition-all border border-zinc-700">
                Launch Tool →
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
