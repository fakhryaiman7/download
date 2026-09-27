'use client';

import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  Loader2,
  CheckCircle2,
  AlertCircle,
  Download,
  RotateCcw,
  Sparkles,
  Clock,
  FolderCheck,
} from 'lucide-react';
import type { JobStatus } from '@videodrop/shared';
import { formatFileSize } from '@/lib/utils';

interface DownloadProgressProps {
  status: JobStatus;
  progress: number;
  fileName?: string | null;
  fileSize?: number | null;
  downloadUrl?: string | null;
  error?: string | null;
  onReset: () => void;
}

export function DownloadProgress({
  status,
  progress,
  fileName,
  fileSize,
  downloadUrl,
  error,
  onReset,
}: DownloadProgressProps) {
  // Automatically trigger the browser download as soon as completed
  const hasTriggeredRef = useRef(false);

  useEffect(() => {
    if (status === 'completed' && downloadUrl && !hasTriggeredRef.current) {
      hasTriggeredRef.current = true;
      try {
        const a = document.createElement('a');
        a.href = downloadUrl;
        if (fileName) {
          a.setAttribute('download', fileName);
        }
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      } catch (err) {
        console.warn('Auto download trigger error:', err);
      }
    }

    if (status === 'queued' || status === 'downloading') {
      hasTriggeredRef.current = false;
    }
  }, [status, downloadUrl, fileName]);

  const getStatusDetails = () => {
    switch (status) {
      case 'queued':
        return {
          title: 'Queued in line',
          desc: 'Waiting for worker process to allocate resources...',
          icon: <Clock className="h-5 w-5 text-indigo-400 animate-pulse" />,
        };
      case 'analyzing':
        return {
          title: 'Analyzing video streams',
          desc: 'Locating best stream sources...',
          icon: <Loader2 className="h-5 w-5 text-indigo-400 animate-spin" />,
        };
      case 'downloading':
        return {
          title: 'Downloading media',
          desc: `Fetching stream chunks (${progress}%)...`,
          icon: <Loader2 className="h-5 w-5 text-indigo-400 animate-spin" />,
        };
      case 'processing':
        return {
          title: 'Processing file',
          desc: 'Finalizing containers and verifying compatibility...',
          icon: <Sparkles className="h-5 w-5 text-violet-400 animate-spin" />,
        };
      case 'completed':
        return {
          title: 'Your video is ready!',
          desc: 'Downloaded and saved directly to your Downloads folder.',
          icon: <CheckCircle2 className="h-6 w-6 text-emerald-400" />,
        };
      case 'failed':
        return {
          title: 'Download failed',
          desc: error || 'An error occurred during download.',
          icon: <AlertCircle className="h-6 w-6 text-rose-400" />,
        };
      case 'expired':
        return {
          title: 'Download expired',
          desc: 'Temporary download file has expired.',
          icon: <AlertCircle className="h-6 w-6 text-amber-400" />,
        };
      default:
        return {
          title: 'Processing',
          desc: 'Please wait...',
          icon: <Loader2 className="h-5 w-5 text-indigo-400 animate-spin" />,
        };
    }
  };

  const { title, desc, icon } = getStatusDetails();
  const isFinished = status === 'completed';
  const isFailed = status === 'failed' || status === 'expired';

  return (
    <div className="space-y-5">
      {/* Header state */}
      <div className="flex items-center gap-3">
        <div className="p-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08]">
          {icon}
        </div>
        <div>
          <h4 className="text-base font-semibold text-white">{title}</h4>
          <p className="text-xs text-gray-400">{desc}</p>
        </div>
      </div>

      {/* Progress Bar (when active) */}
      {!isFinished && !isFailed && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-mono text-gray-400">
            <span className="capitalize">{status}</span>
            <span className="text-indigo-400 font-semibold">{progress}%</span>
          </div>
          <div className="h-2.5 w-full bg-white/[0.06] rounded-full overflow-hidden p-0.5 border border-white/[0.04]">
            <motion.div
              className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${Math.max(5, progress)}%` }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
            />
          </div>
        </div>
      )}

      {/* Completion View */}
      {isFinished && downloadUrl && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4 pt-2"
        >
          {fileName && (
            <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs space-y-1.5">
              <div className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                <FolderCheck className="h-4 w-4" /> Saved directly to Downloads
              </div>
              <div className="font-mono text-gray-200 truncate">{fileName}</div>
              {fileSize && (
                <div className="text-indigo-300 font-mono">{formatFileSize(fileSize)}</div>
              )}
            </div>
          )}

          <a
            href={downloadUrl}
            download={fileName || 'video.mp4'}
            className="w-full flex items-center justify-center gap-2.5 py-4 px-6 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-base shadow-xl shadow-emerald-600/25 transition-all duration-200 active:scale-[0.98]"
          >
            <Download className="h-5 w-5" />
            <span>Download File Again</span>
          </a>

          <div className="flex items-center justify-between text-xs text-gray-400 pt-1 px-1">
            <span className="text-amber-400/90 flex items-center gap-1">
              <Clock className="h-3 w-3" /> Temporary download — expires automatically.
            </span>
            <button
              onClick={onReset}
              className="text-gray-400 hover:text-white flex items-center gap-1 underline transition-colors cursor-pointer"
            >
              <RotateCcw className="h-3 w-3" /> Download another
            </button>
          </div>
        </motion.div>
      )}

      {/* Failed View */}
      {isFailed && (
        <div className="pt-2">
          <button
            onClick={onReset}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] text-white text-sm font-semibold border border-white/[0.1] transition-all duration-200 active:scale-95 cursor-pointer"
          >
            <RotateCcw className="h-4 w-4" />
            <span>Try Again</span>
          </button>
        </div>
      )}
    </div>
  );
}
