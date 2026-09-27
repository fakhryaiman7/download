'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Video, Zap } from 'lucide-react';

export function Hero() {
  return (
    <section className="relative pt-12 pb-6 md:pt-20 md:pb-10 text-center px-4">
      {/* Subtle background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-600/10 blur-[120px] rounded-full pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="max-w-3xl mx-auto space-y-4"
      >
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-indigo-500/20 bg-indigo-500/10 text-indigo-400 text-xs font-medium tracking-wide uppercase">
          <Zap className="h-3 w-3" /> Fast & Clean Media Processing
        </div>

        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-white leading-tight">
          Download Videos.{' '}
          <span className="bg-gradient-to-r from-indigo-400 via-violet-300 to-purple-400 bg-clip-text text-transparent">
            Your Way.
          </span>
        </h1>

        <p className="text-base sm:text-lg text-gray-400 max-w-xl mx-auto">
          Paste a supported video link, choose the quality, and download.
        </p>

        {/* Badges */}
        <div className="flex flex-wrap items-center justify-center gap-4 pt-2 text-xs text-gray-400">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
            No DRM Circumvention
          </span>
          <span className="text-gray-600">•</span>
          <span className="flex items-center gap-1.5">
            <Video className="h-4 w-4 text-indigo-400" />
            Original Quality Preserved
          </span>
        </div>
      </motion.div>
    </section>
  );
}
