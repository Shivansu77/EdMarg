import type { Metadata } from 'next';
import HeroSection from '@/components/marketing/HeroSection';
import LifeWhySplitSection from '@/components/marketing/LifeWhySplitSection';
import ResultsSection from '@/components/marketing/ResultsSection';
import TransformSection from '@/components/marketing/TransformSection';
import TopMentorsSection from '@/components/marketing/TopMentorsSection';
import TestimonialsSection from '@/components/marketing/TestimonialsSection';
import FAQSection from '@/components/marketing/FAQSection';
import JoinSection from '@/components/marketing/JoinSection';
import Footer from '@/components/layout/Footer';
import Navbar from '@/components/layout/Navbar';
import FloatingCTA from '@/components/layout/FloatingCTA';
import { SITE_URL } from '@/utils/site-url';

export const metadata: Metadata = {
  alternates: {
    canonical: '/',
  },
  openGraph: {
    url: SITE_URL,
  },
};

export default function Home() {
  return (
    <div className="min-h-screen relative">
      <Navbar />
      <main>
        {/* DARK: Hero */}
        <HeroSection />
        {/* STATS + How It Works */}
        <ResultsSection hideIntro />
        {/* DARK: 50/50 split (Life powered by Edmarg + Why EdMarg orbit) */}
        <LifeWhySplitSection />
        {/* LIGHT: Before vs After */}
        <TransformSection />
        {/* LIGHT: Mentors */}
        <TopMentorsSection />
        {/* DARK: Testimonials */}
        <TestimonialsSection />
        {/* LIGHT: FAQs */}
        <FAQSection />
        {/* DARK: Final CTA */}
        <JoinSection />
      </main>
      <Footer />
      <FloatingCTA />
    </div>
  );
}
