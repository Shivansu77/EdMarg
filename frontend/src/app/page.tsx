import type { Metadata } from 'next';
import HeroSection from '@/components/HeroSection';
import LifeWhySplitSection from '@/components/LifeWhySplitSection';
import ResultsSection from '@/components/ResultsSection';
import TransformSection from '@/components/TransformSection';
import TopMentorsSection from '@/components/TopMentorsSection';
import TestimonialsSection from '@/components/TestimonialsSection';
import FAQSection from '@/components/FAQSection';
import JoinSection from '@/components/JoinSection';
import Footer from '@/components/Footer';
import Navbar from '@/components/Navbar';
import FloatingCTA from '@/components/FloatingCTA';
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
