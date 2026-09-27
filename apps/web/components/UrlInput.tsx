'use client';

import React, { useState } from 'react';
import { Search, Loader2, Clipboard, X } from 'lucide-react';

interface UrlInputProps {
  onAnalyze: (url: string) => void;
  isLoading: boolean;
  disabled?: boolean;
}

export function UrlInput({ onAnalyze, isLoading, disabled }: UrlInputProps) {
  const [url, setUrl] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = url.trim();
    if (trimmed && !isLoading) {
      onAnalyze(trimmed);
    }
  };

  const handlePaste = async () => {
    try {
      if (navigator.clipboard) {
        const text = await navigator.clipboard.readText();
        if (text) {
          setUrl(text.trim());
        }
      }
    } catch {
      // Clipboard read failed / permission denied
    }
  };

  const handleClear = () => {
    setUrl('');
  };

  return (
    <div className="w-full max-w-2xl mx-auto px-4">
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="relative flex flex-col sm:flex-row items-stretch gap-2 p-1.5 rounded-2xl bg-[#11131f]/90 border border-white/[0.08] shadow-2xl shadow-black/80 backdrop-blur-xl focus-within:border-indigo-500/50 focus-within:ring-2 focus-within:ring-indigo-500/20 transition-all duration-300">
          <div className="relative flex-1 flex items-center">
            <Search className="absolute left-4 h-5 w-5 text-gray-500 pointer-events-none" />
            <input
              id="url-input-field"
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Paste video URL here (e.g. YouTube, Vimeo, TikTok)..."
              disabled={isLoading || disabled}
              className="w-full bg-transparent pl-12 pr-16 py-3.5 text-sm sm:text-base text-white placeholder-gray-500 focus:outline-none disabled:opacity-50"
              autoComplete="off"
              spellCheck="false"
              required
            />
            {url ? (
              <button
                type="button"
                onClick={handleClear}
                className="absolute right-3 p-1.5 rounded-md text-gray-400 hover:text-white hover:bg-white/[0.06] transition-colors"
                title="Clear input"
              >
                <X className="h-4 w-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handlePaste}
                className="absolute right-3 hidden sm:flex items-center gap-1 px-2 py-1 rounded text-xs font-medium text-gray-400 hover:text-white hover:bg-white/[0.08] transition-colors"
                title="Paste from clipboard"
              >
                <Clipboard className="h-3.5 w-3.5" />
                Paste
              </button>
            )}
          </div>

          <button
            type="submit"
            disabled={!url.trim() || isLoading || disabled}
            className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 disabled:from-gray-800 disabled:to-gray-800 disabled:text-gray-500 text-white font-semibold px-6 py-3.5 text-sm sm:text-base shadow-lg shadow-indigo-600/25 disabled:shadow-none transition-all duration-200 active:scale-95 cursor-pointer disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Analyzing...</span>
              </>
            ) : (
              <span>Analyze</span>
            )}
          </button>
        </div>

        <p className="text-center text-xs text-gray-400 flex items-center justify-center gap-1.5">
          <span>Supported public sources only</span>
          <span className="text-gray-600">•</span>
          <span>Content you own or have permission to download</span>
        </p>
      </form>
    </div>
  );
}
