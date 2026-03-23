import HeroSection from '@/components/HeroSection';
import ResultsSection from '@/components/ResultsSection';
import TransformSection from '@/components/TransformSection';
import TopMentorsSection from '@/components/TopMentorsSection';
import JoinSection from '@/components/JoinSection';
import Footer from '@/components/Footer';
import Navbar from '@/components/Navbar';
import BlogSection from '@/components/BlogSection';

export default function Home() {
  return (
    <div className="min-h-screen bg-surface selection:bg-primary-container">
      <Navbar />

      <main className="pt-24 lg:pt-0">
        <HeroSection />
        <ResultsSection />
        <TransformSection />
        <TopMentorsSection />
        <BlogSection />
        <JoinSection />
      </main>

      <Footer />
    </div>
  );
}
