'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Clock, Globe, Film } from 'lucide-react';
import type { VideoMetadata } from '@videodrop/shared';
import { formatDuration } from '@/lib/utils';

interface VideoPreviewProps {
  video: VideoMetadata;
}

export function VideoPreview({ video }: VideoPreviewProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-5 items-start">
      {/* Thumbnail */}
      <div className="relative w-full sm:w-56 aspect-video sm:h-32 rounded-xl overflow-hidden bg-black/40 border border-white/[0.08] shrink-0 group">
        {video.thumbnail ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={video.thumbnail}
            alt={video.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-600">
            <Film className="h-10 w-10 opacity-40" />
          </div>
        )}

        {/* Duration badge */}
        {video.duration > 0 && (
          <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-black/80 backdrop-blur-md text-white text-xs font-mono font-medium flex items-center gap-1 border border-white/[0.1]">
            <Clock className="h-3 w-3 text-indigo-400" />
            {formatDuration(video.duration)}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 space-y-2 w-full">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/[0.05] border border-white/[0.08] text-indigo-300 text-xs font-medium">
          <Globe className="h-3 w-3" />
          {video.source}
        </div>

        <h3 className="text-base sm:text-lg font-semibold text-white leading-snug line-clamp-2">
          {video.title}
        </h3>

        <p className="text-xs text-gray-400">
          Duration: <span className="text-gray-300">{formatDuration(video.duration)}</span>
        </p>
      </div>
    </div>
  );
}
