import type { Metadata } from 'next';
import './globals.css';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

export const metadata: Metadata = {
  title: 'Video Downloader — Download Videos in Your Preferred Quality',
  description: 'Download supported videos in the quality and format you choose.',
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  openGraph: {
    title: 'Video Downloader — Download Videos in Your Preferred Quality',
    description: 'Download supported videos in the quality and format you choose.',
    type: 'website',
    url: '/',
    siteName: 'VideoDrop',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Video Downloader — Download Videos in Your Preferred Quality',
    description: 'Download supported videos in the quality and format you choose.',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased min-h-screen flex flex-col bg-[#090a0f] text-gray-100 selection:bg-indigo-500/30 selection:text-indigo-200">
        <Header />
        <main className="flex-1 flex flex-col">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
