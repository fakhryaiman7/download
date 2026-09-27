import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, Shield, Server, Cpu, CheckCircle } from 'lucide-react';

export const metadata: Metadata = {
  title: 'About VideoDrop — Architecture & Mission',
  description: 'Learn about VideoDrop architecture, supported sources, and authorized download policy.',
};

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12 md:py-20 space-y-12">
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-xs font-semibold text-gray-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Downloader
      </Link>

      <div className="space-y-4">
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
          About VideoDrop
        </h1>
        <p className="text-base text-gray-400 leading-relaxed max-w-2xl">
          VideoDrop is a fast, modern media utility designed for content creators, archivists, and
          educators who need to download videos they own or have authorized rights to preserve.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-2xl glass-panel space-y-3">
          <div className="p-2.5 w-fit rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <Server className="h-5 w-5" />
          </div>
          <h2 className="text-lg font-semibold text-white">Decoupled Worker Architecture</h2>
          <p className="text-xs text-gray-400 leading-relaxed">
            The frontend runs on modern serverless edge architecture, delegating CPU-intensive
            media extraction to isolated background workers with full stream isolation.
          </p>
        </div>

        <div className="p-6 rounded-2xl glass-panel space-y-3">
          <div className="p-2.5 w-fit rounded-xl bg-violet-500/10 text-violet-400 border border-violet-500/20">
            <Cpu className="h-5 w-5" />
          </div>
          <h2 className="text-lg font-semibold text-white">Lossless Extraction</h2>
          <p className="text-xs text-gray-400 leading-relaxed">
            Where possible, streams are merged using stream-copy without wasteful re-encoding,
            preserving the pristine fidelity of the original uploaded resolution.
          </p>
        </div>

        <div className="p-6 rounded-2xl glass-panel space-y-3">
          <div className="p-2.5 w-fit rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Shield className="h-5 w-5" />
          </div>
          <h2 className="text-lg font-semibold text-white">Ephemeral Privacy</h2>
          <p className="text-xs text-gray-400 leading-relaxed">
            Downloaded media files are strictly ephemeral and are automatically wiped from worker
            storage after the configurable expiration window.
          </p>
        </div>
      </div>

      <div className="p-8 rounded-2xl glass-panel space-y-4">
        <h2 className="text-xl font-bold text-white">Responsible Usage Policy</h2>
        <ul className="space-y-3 text-sm text-gray-300">
          <li className="flex items-start gap-3">
            <CheckCircle className="h-5 w-5 text-indigo-400 shrink-0 mt-0.5" />
            <span>VideoDrop only interfaces with publicly accessible video endpoints.</span>
          </li>
          <li className="flex items-start gap-3">
            <CheckCircle className="h-5 w-5 text-indigo-400 shrink-0 mt-0.5" />
            <span>
              We do not circumvent Digital Rights Management (DRM), paywalls, private credentials, or platform access controls.
            </span>
          </li>
          <li className="flex items-start gap-3">
            <CheckCircle className="h-5 w-5 text-indigo-400 shrink-0 mt-0.5" />
            <span>
              Users are solely responsible for ensuring they possess rights or licenses to extract their respective media.
            </span>
          </li>
        </ul>
      </div>
    </div>
  );
}
