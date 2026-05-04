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
    <section className="relative w-full overflow-hidden bg-slate-50 pt-24 pb-20 lg:pt-40 lg:pb-32">
      {/* Rich layered background accents */}
      <div className="pointer-events-none absolute inset-0 z-0">
        <div className="absolute -top-64 -right-32 h-[50rem] w-[50rem] rounded-full bg-emerald-200/20 blur-[140px]" />
        <div className="absolute top-1/2 -left-64 h-[60rem] w-[60rem] rounded-full bg-cyan-100/30 blur-[160px]" />
        <div className="absolute bottom-0 inset-x-0 h-40 bg-linear-to-t from-slate-50 to-transparent" />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-7xl px-6 lg:px-8">
        <div className="grid items-center gap-20 lg:grid-cols-2">
          {/* Left Content */}
          <div className="animate-fade-up">
            {/* Badge */}
            <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white/60 backdrop-blur-xl px-4 py-2 shadow-sm ring-1 ring-black/[0.03]">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 shadow-lg shadow-emerald-500/20">
                <Sparkles className="h-3 w-3 text-white" />
              </div>
              <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-[0.24em]">
                Your Career Roadmap Starts Here
              </span>
            </div>

            {/* Heading */}
            <h1 className="text-5xl lg:text-[5.5rem] font-extrabold text-slate-950 leading-[0.95] mb-8 tracking-[-0.05em]">
              Stop Guessing. <br />
              <span className="text-emerald-600">Start Building.</span>
            </h1>

            {/* Description */}
            <p className="max-w-xl text-xl font-medium leading-relaxed text-slate-600 mb-10">
              Transform your career from uncertainty to clarity with world-class assessments and direct mentorship from industry leaders.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-5 mb-12">
              <Link
                href="/assessment"
                className="group relative inline-flex h-16 items-center justify-center gap-3 rounded-2xl bg-emerald-500 px-10 text-base font-bold text-white shadow-2xl shadow-emerald-500/30 transition-all duration-300 hover:bg-emerald-600 hover:-translate-y-1 active:scale-95"
              >
                Take Assessment
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                href="/browse-mentors"
                className="inline-flex h-16 items-center justify-center gap-3 rounded-2xl border border-white/60 bg-white/60 backdrop-blur-xl px-10 text-base font-bold text-slate-700 shadow-sm transition-all duration-300 hover:bg-white hover:shadow-lg hover:-translate-y-1 active:scale-95"
              >
                Connect with Mentor
              </Link>
            </div>

            {/* Social Proof */}
            <div className="flex items-center gap-6 p-1">
              <div className="flex -space-x-3">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="h-12 w-12 rounded-2xl border-4 border-slate-50 bg-slate-200 shadow-sm overflow-hidden"
                  >
                    <div className="h-full w-full bg-linear-to-br from-emerald-100 to-emerald-200" />
                  </div>
                ))}
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl border-4 border-slate-50 bg-slate-950 text-xs font-bold text-white shadow-sm">
                  +10k
                </div>
              </div>
              <div className="h-10 w-px bg-slate-200" />
              <p className="text-sm font-bold text-slate-600">
                <span className="text-slate-950">Trusted by thousands</span> <br />
                of ambitious learners worldwide
              </p>
            </div>
          </div>

          {/* Right Image */}
          <div className="relative mx-auto w-full max-w-xl animate-fade-up delay-150">
            <div className="relative aspect-[4/5] overflow-hidden rounded-[3.5rem] border border-white/60 bg-white/40 backdrop-blur-xl shadow-[0_40px_100px_rgba(0,0,0,0.08)] ring-1 ring-black/[0.03]">
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
            <div className="absolute -bottom-10 -left-6 sm:-left-12 max-w-[280px] sm:max-w-xs animate-float">
              <div className="flex items-center gap-4 rounded-3xl border border-white/60 bg-white/60 backdrop-blur-2xl p-5 shadow-2xl shadow-slate-950/10 ring-1 ring-black/[0.03]">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-500 text-white shadow-lg shadow-emerald-500/30">
                  <CheckCircle2 className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-600 mb-0.5">Verified Step</p>
                  <p className="text-sm font-extrabold text-slate-950 leading-tight">{currentSlide.title}</p>
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
