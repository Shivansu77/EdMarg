'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, CheckCircle2, Sparkles } from 'lucide-react';

const HeroSection = () => {
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
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                Trusted by 10,000+ learners
              </span>
            </div>

            {/* Heading */}
            <h1 className="text-4xl lg:text-6xl font-extrabold text-slate-900 leading-[1.05] mb-6 tracking-tight">
              Stop Guessing.
              <span className="block mt-2 bg-linear-to-r from-emerald-500 via-green-500 to-cyan-600 bg-clip-text text-transparent">
                Start Building Your Career Map.
              </span>
            </h1>

            {/* Description */}
            <p className="text-lg text-slate-600 leading-relaxed mb-8 max-w-xl">
              Move from uncertainty to a clear roadmap with guided assessments and mentorship from professionals working in top companies.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <Link
                href="/assessment"
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-linear-to-r from-emerald-400 to-green-500 hover:from-emerald-500 hover:to-green-600 text-slate-900 font-bold rounded-full transition-all duration-200 shadow-[0_12px_30px_rgba(16,185,129,0.35)]"
              >
                Take Assessment
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/browse-mentors"
                className="inline-flex items-center justify-center px-7 py-3.5 border border-slate-300 hover:border-slate-400 text-slate-900 font-bold rounded-full transition-colors duration-200 bg-white/90 hover:bg-white"
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
                <span className="font-bold text-slate-900">2,400+</span> active learners this month
              </p>
            </div>
          </div>

          {/* Right Image */}
          <div className="relative mx-auto w-full max-w-lg animate-fade-up delay-150">
            <div className="relative aspect-square overflow-hidden rounded-3xl border border-emerald-100 bg-white shadow-[0_30px_70px_rgba(15,23,42,0.16)]">
              <Image
                src="/hero-student.png"
                alt="Student getting career mentorship"
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 40vw"
                className="object-cover object-top"
                priority
              />
              <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-slate-900/25 via-transparent to-transparent" />
            </div>

            {/* Floating Card */}
            <div className="absolute -bottom-7 left-6 right-6 sm:left-auto sm:right-0 sm:w-80 flex items-center gap-3 rounded-2xl border border-emerald-100 bg-white/95 px-4 py-4 shadow-[0_16px_38px_rgba(5,150,105,0.2)] backdrop-blur-sm">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-50 shrink-0">
                <CheckCircle2 className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <p className="font-bold text-slate-900 text-sm">Career direction identified</p>
                <p className="text-xs text-slate-600">Personalized roadmap generated</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
