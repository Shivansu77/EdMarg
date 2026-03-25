'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
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
  const router = useRouter();

  useEffect(() => {
    const user = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    
    if (user && token) {
      try {
        const userData = JSON.parse(user);
        if (userData.role === 'student') {
          router.replace('/student/dashboard');
        } else if (userData.role === 'mentor') {
          router.replace('/mentor/dashboard');
        } else if (userData.role === 'admin') {
          router.replace('/admin/dashboard');
        }
      } catch (e) {
        // Continue showing landing page if parsing fails
      }
    }
  }, [router]);

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
