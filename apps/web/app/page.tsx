'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { VideoMetadata, VideoContainer, JobStatus } from '@videodrop/shared';
import { Hero } from '@/components/Hero';
import { UrlInput } from '@/components/UrlInput';
import { VideoPreview } from '@/components/VideoPreview';
import { QualitySelector } from '@/components/QualitySelector';
import { FormatSelector } from '@/components/FormatSelector';
import { DownloadButton } from '@/components/DownloadButton';
import { DownloadProgress } from '@/components/DownloadProgress';
import { ErrorMessage } from '@/components/ErrorMessage';

export default function HomePage() {
  const [analyzing, setAnalyzing] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Video metadata
  const [currentUrl, setCurrentUrl] = useState('');
  const [video, setVideo] = useState<VideoMetadata | null>(null);

  // Selection
  const [format, setFormat] = useState<VideoContainer>('mp4');
  const [quality, setQuality] = useState<string>('Best');

  // Job progress
  const [jobId, setJobId] = useState<string | null>(null);
  const [jobStatus, setJobStatus] = useState<JobStatus | null>(null);
  const [jobProgress, setJobProgress] = useState(0);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [downloadFileName, setDownloadFileName] = useState<string | null>(null);
  const [downloadFileSize, setDownloadFileSize] = useState<number | null>(null);
  const [jobError, setJobError] = useState<string | null>(null);

  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Clean polling on unmount
  useEffect(() => {
    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, []);

  // Set default quality when video changes
  useEffect(() => {
    if (video) {
      const best = video.formats.find((f) => f.quality === 'Best');
      if (best) {
        setQuality('Best');
      } else if (video.formats.length > 0) {
        setQuality(video.formats[0].quality);
      }
    }
  }, [video]);

  // Handle URL Analysis
  const handleAnalyze = async (url: string) => {
    setError(null);
    setVideo(null);
    setJobId(null);
    setJobStatus(null);
    setCurrentUrl(url);
    setAnalyzing(true);

    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to analyze video URL.');
      }

      setVideo(data.video);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Analysis failed. Please try again.';
      setError(message);
    } finally {
      setAnalyzing(false);
    }
  };

  // Start Download Job
  const handleStartDownload = async () => {
    if (!video || !currentUrl) return;

    // Validate quality availability
    if (format === 'mp4' && quality !== 'Best') {
      const exists = video.formats.some(
        (f) => f.type === 'video' && (f.quality === quality || f.id === quality)
      );
      if (!exists) {
        setError(`${quality} is not available for this video. Please select another quality.`);
        return;
      }
    }

    setError(null);
    setDownloading(true);
    setJobProgress(5);
    setJobStatus('queued');

    try {
      const res = await fetch('/api/download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: currentUrl,
          format,
          quality,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to start download job.');
      }

      setJobId(data.jobId);
      startPolling(data.jobId);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Could not queue download.';
      setError(message);
      setJobStatus(null);
      setDownloading(false);
    }
  };

  // Intelligent Polling with 1.5s interval
  const startPolling = (id: string) => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
    }

    pollIntervalRef.current = setInterval(async () => {
      try {
        const res = await fetch(`/api/download/${id}`);
        const data = await res.json();

        if (!res.ok || !data.success) {
          throw new Error(data.error || 'Failed to poll status.');
        }

        setJobStatus(data.status);
        setJobProgress(data.progress || 0);

        if (data.fileName) setDownloadFileName(data.fileName);
        if (data.fileSize) setDownloadFileSize(data.fileSize);

        if (data.status === 'completed') {
          if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
          setDownloadUrl(data.downloadUrl);
          setDownloading(false);
        } else if (data.status === 'failed' || data.status === 'expired') {
          if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
          setJobError(data.error || 'Download job failed or expired.');
          setDownloading(false);
        }
      } catch (pollErr: unknown) {
        // Tolerant to transient network blips
        console.error('Polling blip:', pollErr);
      }
    }, 1500);
  };

  // Reset Flow
  const handleReset = () => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
    }
    setJobId(null);
    setJobStatus(null);
    setJobProgress(0);
    setDownloadUrl(null);
    setDownloadFileName(null);
    setDownloadFileSize(null);
    setJobError(null);
    setDownloading(false);
  };

  return (
    <div className="flex-1 max-w-5xl mx-auto w-full px-4 pb-20 space-y-8">
      {/* Hero Section */}
      <Hero />

      {/* Main URL Input */}
      <UrlInput
        onAnalyze={handleAnalyze}
        isLoading={analyzing}
        disabled={downloading}
      />

      {/* Error Message */}
      <div className="max-w-2xl mx-auto">
        <ErrorMessage message={error || ''} onDismiss={() => setError(null)} />
      </div>

      {/* Skeleton Loading State */}
      {analyzing && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl mx-auto p-6 rounded-2xl glass-panel space-y-4"
        >
          <div className="flex flex-col sm:flex-row gap-4 items-start animate-pulse">
            <div className="w-full sm:w-56 aspect-video rounded-xl bg-white/[0.05]" />
            <div className="flex-1 space-y-3 w-full">
              <div className="h-4 bg-white/[0.08] rounded w-1/3" />
              <div className="h-6 bg-white/[0.08] rounded w-5/6" />
              <div className="h-3 bg-white/[0.05] rounded w-1/4" />
            </div>
          </div>
          <div className="h-10 bg-white/[0.05] rounded-xl animate-pulse" />
          <div className="h-12 bg-white/[0.08] rounded-xl animate-pulse" />
        </motion.div>
      )}

      {/* Media Card */}
      <AnimatePresence mode="wait">
        {video && !analyzing && (
          <motion.div
            key={video.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="max-w-2xl mx-auto p-5 sm:p-7 rounded-2xl glass-panel space-y-6"
          >
            {/* Video Overview */}
            <VideoPreview video={video} />

            <div className="h-px bg-white/[0.06] w-full" />

            {/* If a download job is active/completed/failed */}
            {jobStatus ? (
              <DownloadProgress
                status={jobStatus}
                progress={jobProgress}
                fileName={downloadFileName}
                fileSize={downloadFileSize}
                downloadUrl={downloadUrl}
                error={jobError}
                onReset={handleReset}
              />
            ) : (
              /* Configuration and Download Action */
              <div className="space-y-5">
                <FormatSelector
                  format={format}
                  onChange={(f) => {
                    setFormat(f);
                    setError(null);
                  }}
                  disabled={downloading}
                />

                <QualitySelector
                  formats={video.formats}
                  selectedQuality={quality}
                  onChange={(q) => {
                    setQuality(q);
                    setError(null);
                  }}
                  format={format}
                  disabled={downloading}
                />

                <DownloadButton
                  onDownload={handleStartDownload}
                  isLoading={downloading}
                  format={format}
                  quality={quality}
                />
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
