import Link from 'next/link';
import TransformSection from '@/components/TransformSection';
import TopMentorsSection from '@/components/TopMentorsSection';
import JoinSection from '@/components/JoinSection';
import ResultsSection from '@/components/ResultsSection';
import CareerDomainsSection from '@/components/CareerDomainsSection';
import BlogSection from '@/components/BlogSection';
import CommunityReviewsSection from '@/components/CommunityReviewsSection';
import GetStartedSection from '@/components/GetStartedSection';
import Footer from '@/components/Footer';
import HeroSection from '@/components/HeroSection';

export default function Home() {
  return (
    <div className="min-h-screen bg-[#FDFBF7] text-gray-900 font-sans selection:bg-purple-200">
      {/* Navbar segment */}
      <header className="flex items-center justify-between px-8 py-5 max-w-7xl mx-auto w-full border-b border-transparent">
        <div className="flex items-center gap-12">
          {/* Logo */}
          <Link href="/" className="text-xl font-bold tracking-tight">
            EDMARG
            <span className="text-purple-600">.</span>
          </Link>

          {/* Nav Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
            <Link href="/" className="hover:text-purple-600 transition-colors">Home</Link>
            <Link href="/mentors" className="hover:text-purple-600 transition-colors">Mentors</Link>
            <Link href="/assessment" className="hover:text-purple-600 transition-colors">Assessment</Link>
          </nav>
        </div>

        {/* Auth Buttons */}
        <div className="flex items-center gap-4">
          <Link
            href="/login"
            className="px-5 py-2 text-sm font-semibold border-2 border-gray-900 rounded-full hover:bg-gray-100 transition-colors"
          >
            Log in
          </Link>
          <Link
            href="/signup"
            className="px-5 py-2 text-sm font-semibold bg-gray-900 text-white rounded-full hover:bg-gray-800 transition-colors"
          >
            Sign up
          </Link>
        </div>
      </header>

      <HeroSection />

      <TransformSection />
      <JoinSection />
      <TopMentorsSection />
      <ResultsSection />
      <CareerDomainsSection />
      <BlogSection />
      <CommunityReviewsSection />
      <GetStartedSection />
      <Footer />
    </div>
  );
}
