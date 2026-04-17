import type { Metadata } from 'next';
import { Providers } from '@/context/Providers';
import { NetworkStatusLoader } from '@/components/NetworkStatusLoader';
import { SITE_URL } from '@/utils/site-url';
import './globals.css';

export const metadata: Metadata = {
  title: 'Edmarg — AI-Powered Career Mentorship Platform',
  description: 'Find clarity and confidence through AI-driven assessments and expert mentorship. Your guide to the right career path. Connect with industry experts 1:1, get actionable feedback, and accelerate your career.',
  metadataBase: new URL(SITE_URL),
  keywords: 'career mentorship, AI career guidance, career assessment, mentor platform, career clarity, professional guidance, 1:1 mentor video calls',
  authors: [{ name: 'Edmarg' }],
  creator: 'Edmarg',
  publisher: 'Edmarg',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: SITE_URL,
    title: 'Edmarg — Career Mentorship & AI Guidance',
    description: 'Find clarity and confidence through AI-driven assessments and expert mentorship.',
    siteName: 'Edmarg',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Edmarg — AI Career Guidance',
    description: 'Find clarity and confidence through AI-driven assessments and expert mentorship.',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      suppressHydrationWarning
      className="h-full antialiased"
    >
      <body className="flex min-h-full flex-col bg-surface font-manrope text-on-surface">
        <Providers>{children}<NetworkStatusLoader /></Providers>
      </body>
    </html>
  );
}
