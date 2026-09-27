'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowDownToLine, Menu, X, Sparkles } from 'lucide-react';

interface HeaderProps {
  onPasteFocus?: () => void;
}

export function Header({ onPasteFocus }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handlePasteClick = () => {
    if (onPasteFocus) {
      onPasteFocus();
    } else {
      const input = document.getElementById('url-input-field');
      if (input) {
        input.scrollIntoView({ behavior: 'smooth', block: 'center' });
        input.focus();
      }
    }
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/[0.06] bg-[#090a0f]/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 shadow-lg shadow-indigo-500/25 group-hover:scale-105 transition-transform duration-200">
            <ArrowDownToLine className="h-5 w-5 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-bold tracking-tight text-white group-hover:text-indigo-300 transition-colors">
              VIDEODROP
            </span>
          </div>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-400">
          <Link href="/" className="hover:text-white transition-colors">
            Home
          </Link>
          <Link href="/about" className="hover:text-white transition-colors">
            About
          </Link>
          <Link href="/privacy" className="hover:text-white transition-colors">
            Privacy
          </Link>
          <Link href="/terms" className="hover:text-white transition-colors">
            Terms
          </Link>
        </nav>

        {/* Action Button */}
        <div className="hidden md:flex items-center gap-4">
          <button
            onClick={handlePasteClick}
            className="flex items-center gap-2 rounded-lg bg-white/[0.06] hover:bg-white/[0.1] px-4 py-2 text-xs font-semibold text-white border border-white/[0.1] transition-all duration-200 active:scale-95"
          >
            <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
            Paste URL
          </button>
        </div>

        {/* Mobile menu toggle */}
        <div className="flex md:hidden">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="rounded-lg p-2 text-gray-400 hover:text-white focus:outline-none"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-white/[0.08] bg-[#0c0e17] px-4 py-4 space-y-3">
          <Link
            href="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-sm font-medium text-gray-300 hover:text-white py-1"
          >
            Home
          </Link>
          <Link
            href="/about"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-sm font-medium text-gray-300 hover:text-white py-1"
          >
            About
          </Link>
          <Link
            href="/privacy"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-sm font-medium text-gray-300 hover:text-white py-1"
          >
            Privacy
          </Link>
          <Link
            href="/terms"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-sm font-medium text-gray-300 hover:text-white py-1"
          >
            Terms
          </Link>
          <div className="pt-2">
            <button
              onClick={handlePasteClick}
              className="w-full flex items-center justify-center gap-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 py-2.5 text-xs font-semibold text-white shadow-lg shadow-indigo-600/30"
            >
              <Sparkles className="h-3.5 w-3.5" />
              Paste URL
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
