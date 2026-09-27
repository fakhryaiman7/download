'use client';

import React from 'react';
import type { VideoFormat, VideoContainer } from '@videodrop/shared';
import { Sparkles, Check } from 'lucide-react';

interface QualitySelectorProps {
  formats: VideoFormat[];
  selectedQuality: string;
  onChange: (quality: string) => void;
  format: VideoContainer;
  disabled?: boolean;
}

export function QualitySelector({
  formats,
  selectedQuality,
  onChange,
  format,
  disabled,
}: QualitySelectorProps) {
  if (format === 'mp3') {
    return (
      <div className="space-y-2">
        <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
          Audio Quality
        </label>
        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.08] text-xs text-gray-300 flex items-center justify-between">
          <span>High Fidelity 192kbps MP3</span>
          <span className="px-2 py-0.5 rounded-full bg-violet-500/20 text-violet-300 font-medium text-[11px]">
            Optimal Audio
          </span>
        </div>
      </div>
    );
  }

  // Filter video formats
  const videoFormats = formats.filter((f) => f.type === 'video');

  // If no specific video formats were returned, provide Best as default
  const displayQualities = videoFormats.length > 0 ? videoFormats : [{ id: 'best', quality: 'Best', container: 'mp4', type: 'video' as const }];

  return (
    <div className="space-y-2">
      <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
        Quality
      </label>
      <div className="flex flex-wrap gap-2">
        {displayQualities.map((item) => {
          const isSelected = selectedQuality === item.quality || selectedQuality === item.id;
          const isBest = item.quality === 'Best';

          return (
            <button
              key={item.id}
              type="button"
              disabled={disabled}
              onClick={() => onChange(item.quality)}
              className={`flex items-center gap-1.5 py-2 px-3.5 rounded-xl border text-xs sm:text-sm font-semibold transition-all duration-200 cursor-pointer disabled:cursor-not-allowed ${
                isSelected
                  ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-600/30 scale-102'
                  : 'bg-white/[0.03] border-white/[0.08] text-gray-300 hover:text-white hover:bg-white/[0.08]'
              }`}
            >
              {isBest && <Sparkles className="h-3.5 w-3.5 text-amber-300" />}
              {isSelected && !isBest && <Check className="h-3.5 w-3.5 text-indigo-200" />}
              <span>{item.quality}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
