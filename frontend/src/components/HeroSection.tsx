'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, CheckCircle2, Sparkles } from 'lucide-react';

const HeroSection = () => {
  return (
    <section className="relative flex min-h-screen w-full items-center overflow-hidden bg-surface pb-20 pt-24 lg:pt-32">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-0 top-0 h-72 w-72 rounded-full bg-slate-200/45 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-80 w-80 rounded-full bg-indigo-100/50 blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-7xl px-6 lg:px-12">
        <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="animate-fade-in-up">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-white px-4 py-2 shadow-sm">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="font-manrope text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
                Trusted by 10,000+ learners
              </span>
            </div>

            <h1 className="font-plus-jakarta text-[2.75rem] font-extrabold leading-[1.06] tracking-tight text-on-surface sm:text-[3.5rem] lg:text-[4.3rem]">
              Build Career Clarity
              <span className="block text-primary">With Structure and Expert Guidance</span>
            </h1>

            <p className="font-manrope mt-6 max-w-xl text-base leading-relaxed text-on-surface-variant md:text-lg">
              Move from uncertainty to a clear roadmap using guided assessments and mentorship from professionals in top companies.
            </p>

            <div className="mt-8 flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
              <Link
                href="/assessment"
                className="font-manrope inline-flex w-full items-center justify-center gap-2 rounded-xl bg-on-surface px-7 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-slate-800 sm:w-auto"
              >
                Take Assessment
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/connect"
                className="font-manrope inline-flex w-full items-center justify-center rounded-xl border border-border bg-white px-7 py-3.5 text-sm font-semibold text-on-surface transition-colors hover:bg-surface-dim sm:w-auto"
              >
                Connect with Mentor
              </Link>
            </div>

            <div className="mt-6 flex items-center gap-4">
              <div className="flex -space-x-2">
                {['A', 'B', 'C', 'D'].map(letter => (
                  <div
                    key={letter}
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-white bg-slate-700 text-xs font-semibold text-white"
                  >
                    {letter}
                  </div>
                ))}
              </div>
              <p className="font-manrope text-sm text-on-surface-variant">
                <span className="font-semibold text-on-surface">2,400+</span> active learners this month
              </p>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-xl">
            <div className="relative aspect-[4/5] overflow-hidden rounded-3xl border border-border bg-white shadow-[0_20px_50px_rgba(15,23,42,0.12)]">
              <Image
                src="/hero-student.png"
                alt="Student getting career mentorship"
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 40vw"
                className="object-cover"
                priority
              />
            </div>

            <div className="absolute -bottom-6 left-6 z-10 flex items-center gap-3 rounded-2xl border border-border bg-white px-4 py-3 shadow-lg">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-50">
                <CheckCircle2 className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-plus-jakarta text-sm font-semibold text-on-surface">Career direction identified</p>
                <p className="font-manrope text-xs text-on-surface-variant">Personalized roadmap generated</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
