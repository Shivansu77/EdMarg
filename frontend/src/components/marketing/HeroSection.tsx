'use client';

import React from 'react';
import Link from 'next/link';
import AppImage from '@/components/AppImage';
import { ArrowRight, CheckCircle2, Sparkles } from 'lucide-react';

const heroSlides = [
  {
    src: '/hero-student.png',
    alt: 'Student getting career mentorship',
    title: 'Career direction identified',
    description: 'Personalized roadmap generated',
  },
  {
    src: '/mentors/samantha.png',
    alt: 'Mentor helping a learner plan next career steps',
    title: 'Mentor guidance unlocked',
    description: 'Real advice from working professionals',
  },
  {
    src: '/mentors/omar.png',
    alt: 'Career mentor sharing practical feedback',
    title: 'Confidence built step by step',
    description: 'Clear next actions for the right role',
  },
];

const HeroSection = () => {
  const [activeSlide, setActiveSlide] = React.useState(0);

  React.useEffect(() => {
    const intervalId = window.setInterval(() => {
      setActiveSlide((current) => (current + 1) % heroSlides.length);
    }, 5000);

    return () => window.clearInterval(intervalId);
  }, []);

  const currentSlide = heroSlides[activeSlide];

  return (
    <section className="relative w-full bg-white pt-20 pb-16 lg:pt-32 lg:pb-24 border-b border-slate-100">
      <div className="relative z-10 mx-auto w-full max-w-7xl px-6 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-8">
          {/* Left Content */}
          <div className="animate-fade-up max-w-2xl">
            {/* Badge */}
            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-slate-50 px-3 py-1 border border-slate-100">
              <span className="text-[11px] font-semibold text-slate-600 uppercase tracking-widest">
                Professional Career Guidance
              </span>
            </div>

            {/* Heading */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 leading-[1.1] mb-6 tracking-tight">
              Stop Guessing. <br />
              <span className="text-emerald-600">Start Building.</span>
            </h1>

            {/* Description */}
            <p className="max-w-lg text-lg leading-relaxed text-slate-500 mb-10">
              Transform your career from uncertainty to clarity with expert-led assessments and direct mentorship from industry leaders.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 mb-12">
              <Link
                href="/assessment"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-emerald-600 px-8 text-sm font-semibold text-white transition-all hover:bg-emerald-700 active:scale-95"
              >
                Take Assessment
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/browse-mentors"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-8 text-sm font-semibold text-slate-700 transition-all hover:bg-slate-50 active:scale-95"
              >
                Connect with Mentor
              </Link>
            </div>

            {/* Social Proof */}
            <div className="flex items-center gap-4">
              <div className="flex -space-x-2">
                {['/hero-student.png', '/mentors/samantha.png', '/mentors/omar.png'].map((src, i) => (
                  <div
                    key={i}
                    className="h-8 w-8 rounded-full border-2 border-white bg-slate-100 overflow-hidden relative"
                  >
                    <AppImage
                      src={src}
                      alt="Learner"
                      fill
                      sizes="32px"
                      className="object-cover object-top"
                    />
                  </div>
                ))}
              </div>
              <p className="text-sm text-slate-500">
                <span className="font-semibold text-slate-900">10,000+</span> ambitious learners
              </p>
            </div>
          </div>

          {/* Right Image */}
          <div className="relative mx-auto w-full max-w-[400px] animate-fade-up delay-150 mt-8 lg:mt-0">
            <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-slate-50 shadow-xl border border-slate-100">
              {heroSlides.map((slide, index) => (
                <AppImage
                  key={slide.src}
                  src={slide.src}
                  alt={slide.alt}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 40vw"
                  className={`object-cover object-top transition-all duration-700 ease-in-out ${
                    index === activeSlide ? 'opacity-100 scale-100' : 'opacity-0 scale-105'
                  }`}
                  priority={index === 0}
                />
              ))}
              
              {/* Clean Pagination */}
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
                {heroSlides.map((_, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => setActiveSlide(index)}
                    aria-label={`Show hero image ${index + 1}`}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      index === activeSlide ? 'w-6 bg-white shadow-sm' : 'w-1.5 bg-white/50 hover:bg-white/80'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
