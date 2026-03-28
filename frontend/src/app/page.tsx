import HeroSection from '@/components/HeroSection';
import LifeWhySplitSection from '@/components/LifeWhySplitSection';
import ResultsSection from '@/components/ResultsSection';
import TransformSection from '@/components/TransformSection';
import TopMentorsSection from '@/components/TopMentorsSection';
import TestimonialsSection from '@/components/TestimonialsSection';
import JoinSection from '@/components/JoinSection';
import Footer from '@/components/Footer';
import Navbar from '@/components/Navbar';
import FloatingCTA from '@/components/FloatingCTA';

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
        {/* DARK: Final CTA */}
        <JoinSection />
      </main>
      <Footer />
      <FloatingCTA />
    </div>
  );
}
