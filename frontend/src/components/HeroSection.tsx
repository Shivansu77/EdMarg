'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
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
    }, 4000);

    return () => window.clearInterval(intervalId);
  }, []);

  const currentSlide = heroSlides[activeSlide];

  return (
    <section className="relative w-full overflow-hidden bg-linear-to-br from-emerald-50 via-green-50 to-cyan-50 pt-24 pb-16 lg:pt-36 lg:pb-24">
      {/* Rich layered background accents */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-32 right-1/3 h-[28rem] w-[28rem] rounded-full bg-emerald-300/40 blur-3xl" />
        <div className="absolute -bottom-16 left-1/4 h-96 w-96 rounded-full bg-cyan-200/45 blur-3xl" />
        <div className="absolute top-1/3 right-0 h-80 w-80 rounded-full bg-green-200/35 blur-3xl" />
        <div className="absolute inset-x-0 bottom-0 h-32 bg-linear-to-t from-white to-transparent" />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-7xl px-6 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          {/* Left Content */}
          <div className="animate-fade-up">
            {/* Badge */}
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white/85 px-4 py-2 shadow-[0_8px_30px_rgba(16,185,129,0.14)] backdrop-blur-sm">
              <Sparkles className="h-4 w-4 text-emerald-500" />
              <span className="text-[11px] font-medium text-slate-700 uppercase tracking-[0.18em]">
                Trusted by 10,000+ learners
              </span>
            </div>

            {/* Heading */}
            <h1 className="text-4xl lg:text-[4.25rem] font-semibold text-slate-900 leading-[1.02] mb-6 tracking-[-0.04em]">
              Stop Guessing.
              <span className="block mt-2 bg-linear-to-r from-emerald-500 via-green-500 to-cyan-600 bg-clip-text text-transparent font-medium">
                Start Building Your Career Map.
              </span>
            </h1>

            {/* Description */}
            <p className="max-w-xl text-[1.05rem] font-normal leading-8 text-slate-600 mb-8">
              Move from uncertainty to a clear roadmap with guided assessments and mentorship from professionals working in top companies.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <Link
                href="/assessment"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-linear-to-r from-emerald-400 to-green-500 px-7 py-3.5 text-sm font-semibold text-slate-900 shadow-[0_12px_30px_rgba(16,185,129,0.24)] transition-all duration-200 hover:from-emerald-500 hover:to-green-600"
              >
                Take Assessment
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/browse-mentors"
                className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white/90 px-7 py-3.5 text-sm font-medium text-slate-900 transition-colors duration-200 hover:border-slate-400 hover:bg-white"
              >
                Connect with Mentor
              </Link>
            </div>

            {/* Social Proof */}
            <div className="flex items-center gap-4">
              <div className="flex -space-x-2">
                {['A', 'B', 'C', 'D'].map((letter) => (
                  <div
                    key={letter}
                    className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-white bg-linear-to-br from-slate-700 to-slate-900 text-xs font-semibold text-white"
                  >
                    {letter}
                  </div>
                ))}
              </div>
              <p className="text-sm text-slate-600">
                <span className="font-semibold text-slate-900">2,400+</span> active learners this month
              </p>
            </div>
          </div>

          {/* Right Image */}
          <div className="relative mx-auto w-full max-w-lg animate-fade-up delay-150">
            <div className="relative aspect-square overflow-hidden rounded-3xl border border-emerald-100 bg-white shadow-[0_30px_70px_rgba(15,23,42,0.16)]">
              {heroSlides.map((slide, index) => (
                <Image
                  key={slide.src}
                  src={slide.src}
                  alt={slide.alt}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 40vw"
                  className={`object-cover object-top transition-opacity duration-700 ${
                    index === activeSlide ? 'opacity-100' : 'opacity-0'
                  }`}
                  priority={index === 0}
                />
              ))}
              <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-slate-900/25 via-transparent to-transparent" />
              <div className="absolute bottom-5 left-5 flex gap-2">
                {heroSlides.map((slide, index) => (
                  <button
                    key={slide.src}
                    type="button"
                    onClick={() => setActiveSlide(index)}
                    aria-label={`Show hero image ${index + 1}`}
                    className={`h-2.5 rounded-full transition-all ${
                      index === activeSlide ? 'w-8 bg-white' : 'w-2.5 bg-white/55'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Floating Card */}
            <div className="absolute -bottom-7 left-6 right-6 sm:left-auto sm:right-0 sm:w-80 flex items-center gap-3 rounded-2xl border border-emerald-100 bg-white/95 px-4 py-4 shadow-[0_16px_38px_rgba(5,150,105,0.2)] backdrop-blur-sm">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-50 shrink-0">
                <CheckCircle2 className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900">{currentSlide.title}</p>
                <p className="text-xs font-normal text-slate-600">{currentSlide.description}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
