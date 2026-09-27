'use client';

import React from 'react';
import { Video, Music } from 'lucide-react';
import type { VideoContainer } from '@videodrop/shared';

interface FormatSelectorProps {
  format: VideoContainer;
  onChange: (format: VideoContainer) => void;
  disabled?: boolean;
}

export function FormatSelector({ format, onChange, disabled }: FormatSelectorProps) {
  return (
    <div className="space-y-2">
      <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
        Format
      </label>
      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          disabled={disabled}
          onClick={() => onChange('mp4')}
          className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border text-sm font-medium transition-all duration-200 cursor-pointer disabled:cursor-not-allowed ${
            format === 'mp4'
              ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-lg shadow-indigo-500/10'
              : 'bg-white/[0.03] border-white/[0.08] text-gray-400 hover:text-white hover:bg-white/[0.06]'
          }`}
        >
          <Video className="h-4 w-4 text-indigo-400" />
          <span>MP4 Video</span>
        </button>

        <button
          type="button"
          disabled={disabled}
          onClick={() => onChange('mp3')}
          className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border text-sm font-medium transition-all duration-200 cursor-pointer disabled:cursor-not-allowed ${
            format === 'mp3'
              ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-lg shadow-indigo-500/10'
              : 'bg-white/[0.03] border-white/[0.08] text-gray-400 hover:text-white hover:bg-white/[0.06]'
          }`}
        >
          <Music className="h-4 w-4 text-violet-400" />
          <span>MP3 Audio</span>
        </button>
      </div>
    </div>
  );
}
