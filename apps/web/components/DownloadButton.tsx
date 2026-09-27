'use client';

import React from 'react';
import { ArrowDownToLine, Loader2 } from 'lucide-react';
import type { VideoContainer } from '@videodrop/shared';

interface DownloadButtonProps {
  onDownload: () => void;
  isLoading: boolean;
  format: VideoContainer;
  quality: string;
  disabled?: boolean;
}

export function DownloadButton({
  onDownload,
  isLoading,
  format,
  quality,
  disabled,
}: DownloadButtonProps) {
  const label =
    format === 'mp3' ? 'Download MP3 Audio' : `Download ${quality} MP4`;

  return (
    <button
      type="button"
      onClick={onDownload}
      disabled={isLoading || disabled}
      className="w-full flex items-center justify-center gap-2.5 py-3.5 px-6 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 hover:from-indigo-500 hover:to-violet-500 disabled:from-gray-800 disabled:to-gray-800 disabled:text-gray-500 text-white font-semibold text-sm sm:text-base shadow-xl shadow-indigo-600/30 disabled:shadow-none transition-all duration-200 active:scale-[0.98] cursor-pointer disabled:cursor-not-allowed"
    >
      {isLoading ? (
        <>
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>Starting Download...</span>
        </>
      ) : (
        <>
          <ArrowDownToLine className="h-5 w-5" />
          <span>{label}</span>
        </>
      )}
    </button>
  );
}
