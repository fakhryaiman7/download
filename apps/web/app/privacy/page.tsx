import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, Shield } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Privacy Policy — VideoDrop',
  description: 'VideoDrop Privacy Policy: We do not log sensitive personal data, track accounts, or retain downloaded files.',
};

export default function PrivacyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12 md:py-20 space-y-10">
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-xs font-semibold text-gray-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Downloader
      </Link>

      <div className="space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-emerald-500/20 bg-emerald-500/10 text-emerald-400 text-xs font-medium">
          <Shield className="h-3.5 w-3.5" /> Privacy First
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
          Privacy Policy
        </h1>
        <p className="text-xs text-gray-400">Last updated: September 2026</p>
      </div>

      <div className="space-y-8 text-sm text-gray-300 leading-relaxed">
        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-white">1. Ephemeral Media Storage</h2>
          <p>
            VideoDrop does not permanently host or archive video files. Media downloaded via the worker
            service is stored in temporary scratch directories (/tmp) strictly for the duration of the
            configured Time-To-Live (30 minutes) and is permanently deleted by automated cleanup
            workers immediately thereafter.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-white">2. Logging and Data Collection</h2>
          <p>
            We respect your privacy. VideoDrop does not collect names, email addresses, cookies, or user
            accounts. Server logs only record operational metrics (such as timestamps, rate limit counters,
            and aggregate error rates) necessary to defend against abuse and DDoS attacks. We explicitly
            redact sensitive headers, authorization tokens, and credentials in our logging layer.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-white">3. Third-Party Services</h2>
          <p>
            When you request metadata or media files from public video platforms, requests are forwarded
            directly to those platforms public endpoints to fetch stream manifests. Please refer to
            the individual privacy policies of respective hosting platforms for information on their data
            handling practices.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-white">4. No DRM or Private Content Extraction</h2>
          <p>
            We do not log into user accounts or bypass private content controls. The service strictly
            processes publicly accessible links provided by the end user.
          </p>
        </section>
      </div>
    </div>
  );
}
