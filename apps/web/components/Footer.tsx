import React from 'react';
import Link from 'next/link';
import { ArrowDownToLine } from 'lucide-react';

export function Footer() {
  return (
    <footer className="mt-auto border-t border-white/[0.06] bg-[#07080c] py-12 px-4 sm:px-6">
      <div className="mx-auto max-w-6xl flex flex-col md:flex-row items-center justify-between gap-6">
        {/* Brand */}
        <div className="flex flex-col items-center md:items-start gap-2">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-600">
              <ArrowDownToLine className="h-4 w-4 text-white" />
            </div>
            <span className="text-base font-bold tracking-tight text-white">VIDEODROP</span>
          </Link>
          <p className="text-xs text-gray-400 text-center md:text-left">
            Download supported public videos in the quality you choose.
          </p>
        </div>

        {/* Links */}
        <nav className="flex items-center gap-6 text-xs text-gray-400">
          <Link href="/about" className="hover:text-white transition-colors">
            About
          </Link>
          <Link href="/privacy" className="hover:text-white transition-colors">
            Privacy Policy
          </Link>
          <Link href="/terms" className="hover:text-white transition-colors">
            Terms of Service
          </Link>
        </nav>

        {/* Copyright */}
        <div className="text-xs text-gray-400">
          © 2026 VideoDrop. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
