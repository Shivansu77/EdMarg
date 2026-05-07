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
    <section className="relative w-full overflow-hidden bg-slate-50 pt-16 pb-12 lg:pt-28 lg:pb-24">
      {/* Rich layered background accents */}
      <div className="pointer-events-none absolute inset-0 z-0">
        <div className="absolute -top-64 -right-32 h-[40rem] w-[40rem] rounded-full bg-emerald-200/20 blur-[120px]" />
        <div className="absolute top-1/2 -left-64 h-[50rem] w-[50rem] rounded-full bg-cyan-100/20 blur-[140px]" />
        <div className="absolute bottom-0 inset-x-0 h-32 bg-linear-to-t from-slate-50 to-transparent" />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-7xl px-6 lg:px-8">
        <div className="grid items-center gap-20 lg:grid-cols-2">
          {/* Left Content */}
          <div className="animate-fade-up">
            {/* Badge */}
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50/50 backdrop-blur-md px-3 py-1.5 shadow-sm">
              <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/20">
                <Sparkles className="h-2.5 w-2.5 text-white" />
              </div>
              <span className="text-[10px] font-semibold text-emerald-700 uppercase tracking-wider">
                Your Career Roadmap Starts Here
              </span>
            </div>

            {/* Heading */}
            <h1 className="text-4xl lg:text-[4.5rem] font-bold text-slate-900 leading-[1.05] mb-6 tracking-tight">
              Stop Guessing. <br />
              <span className="text-emerald-600">Start Building.</span>
            </h1>

            {/* Description */}
            <p className="max-w-lg text-lg leading-relaxed text-slate-500 mb-8">
              Transform your career from uncertainty to clarity with world-class assessments and direct mentorship from industry leaders.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 mb-10">
              <Link
                href="/assessment"
                className="group relative inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-8 text-sm font-semibold text-white shadow-lg shadow-emerald-500/20 transition-all duration-200 hover:bg-emerald-700 hover:-translate-y-0.5 active:scale-95"
              >
                Take Assessment
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                href="/browse-mentors"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white/80 backdrop-blur-xl px-8 text-sm font-semibold text-slate-700 shadow-sm transition-all duration-200 hover:bg-white hover:shadow hover:-translate-y-0.5 active:scale-95"
              >
                Connect with Mentor
              </Link>
            </div>

            {/* Social Proof */}
            <div className="flex items-center gap-4 p-1">
              <div className="flex -space-x-2">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="h-10 w-10 rounded-full border-2 border-slate-50 bg-slate-200 shadow-sm overflow-hidden"
                  >
                    <div className="h-full w-full bg-linear-to-br from-emerald-100 to-emerald-200" />
                  </div>
                ))}
                <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-slate-50 bg-slate-900 text-[10px] font-semibold text-white shadow-sm">
                  +10k
                </div>
              </div>
              <div className="h-8 w-px bg-slate-200" />
              <p className="text-xs text-slate-500 leading-tight">
                <span className="font-semibold text-slate-800">Trusted by thousands</span> <br />
                of ambitious learners worldwide
              </p>
            </div>
          </div>

          {/* Right Image */}
          <div className="relative mx-auto w-full max-w-md animate-fade-up delay-150">
            <div className="relative aspect-[4/5] overflow-hidden rounded-3xl border border-slate-200/60 bg-white/40 backdrop-blur-xl shadow-2xl shadow-slate-200/50 ring-1 ring-black/[0.03]">
              {heroSlides.map((slide, index) => (
                <AppImage
                  key={slide.src}
                  src={slide.src}
                  alt={slide.alt}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 40vw"
                  className={`object-cover object-top transition-all duration-1000 ease-out ${
                    index === activeSlide ? 'opacity-100 scale-100' : 'opacity-0 scale-110'
                  }`}
                  priority={index === 0}
                />
              ))}
              <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-slate-950/40 via-transparent to-transparent" />
              
              {/* Pagination */}
              <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-3 p-2 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10">
                {heroSlides.map((_, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => setActiveSlide(index)}
                    aria-label={`Show hero image ${index + 1}`}
                    className={`h-2 rounded-full transition-all duration-500 ${
                      index === activeSlide ? 'w-10 bg-white' : 'w-2 bg-white/40 hover:bg-white/60'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Floating Glass Card */}
            <div className="absolute -bottom-6 -left-4 sm:-left-8 max-w-[240px] sm:max-w-[260px] animate-float">
              <div className="flex items-center gap-3 rounded-2xl border border-white/80 bg-white/80 backdrop-blur-xl p-4 shadow-xl shadow-slate-200/50 ring-1 ring-black/[0.03]">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500 text-white shadow-md shadow-emerald-500/20">
                  <CheckCircle2 className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-[9px] font-semibold uppercase tracking-wider text-emerald-600 mb-0.5">Verified Step</p>
                  <p className="text-xs font-semibold text-slate-900 leading-tight">{currentSlide.title}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
