import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, FileText } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Terms of Service — VideoDrop',
  description: 'Terms and conditions governing the lawful use of VideoDrop video processing services.',
};

export default function TermsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12 md:py-20 space-y-10">
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-xs font-semibold text-gray-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Downloader
      </Link>

      <div className="space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-indigo-500/20 bg-indigo-500/10 text-indigo-400 text-xs font-medium">
          <FileText className="h-3.5 w-3.5" /> Legal Terms
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
          Terms of Service
        </h1>
        <p className="text-xs text-gray-400">Last updated: September 2026</p>
      </div>

      <div className="space-y-8 text-sm text-gray-300 leading-relaxed">
        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-white">1. Authorized Use Only</h2>
          <p>
            By using VideoDrop, you certify that you own the copyright, hold a valid license, or
            have explicit authorization from the rights holder to download and retain the media files
            you process through this application.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-white">2. Prohibited Activities</h2>
          <p>You agree not to use VideoDrop for any of the following activities:</p>
          <ul className="list-disc pl-5 space-y-2 text-gray-400">
            <li>Circumventing digital rights management (DRM) or technical protection measures.</li>
            <li>Bypassing paywalls, subscriptions, or authenticated sessions.</li>
            <li>Extracting private, non-public, or restricted content.</li>
            <li>Automated scraping, abuse, or attempts to denial-of-service the infrastructure.</li>
            <li>
              Downloading content in violation of intellectual property laws or applicable local regulations.
            </li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-white">3. Disclaimer of Warranties</h2>
          <p>
            VideoDrop is provided &ldquo;as is&rdquo; without warranties of any kind. We do not guarantee
            uninterrupted availability, support for any specific third-party platform, or file retention.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-white">4. Service Limitations & Rate Limits</h2>
          <p>
            To prevent system overload and ensure fair usage for all users, rate limits and concurrency
            caps are strictly enforced. Repeated attempts to bypass rate limits will result in automated
            IP blocking.
          </p>
        </section>
      </div>
    </div>
  );
}
