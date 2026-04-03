'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, CheckCircle2, Sparkles } from 'lucide-react';

const HeroSection = () => {
  return (
    <section className="relative w-full overflow-hidden bg-white pt-20 pb-16 lg:pt-32 lg:pb-24">
      {/* Subtle background gradient */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-0 right-1/4 h-96 w-96 rounded-full bg-blue-50 blur-3xl opacity-40" />
        <div className="absolute bottom-0 left-1/4 h-80 w-80 rounded-full bg-indigo-50 blur-3xl opacity-30" />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-7xl px-6 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          {/* Left Content */}
          <div>
            {/* Badge */}
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-gray-200 bg-gray-50 px-4 py-2">
              <Sparkles className="h-4 w-4 text-black" />
              <span className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
                Trusted by 10,000+ learners
              </span>
            </div>

            {/* Heading */}
            <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 leading-tight mb-6">
              Build Career Clarity
              <span className="block text-black mt-2">With Expert Guidance</span>
            </h1>

            {/* Description */}
            <p className="text-lg text-gray-600 leading-relaxed mb-8 max-w-lg">
              Move from uncertainty to a clear roadmap using guided assessments and mentorship from professionals in top companies.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <Link
                href="/assessment"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-black hover:bg-gray-800 text-white font-semibold rounded-lg transition-colors duration-200"
              >
                Take Assessment
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/browse-mentors"
                className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 hover:border-gray-400 text-gray-900 font-semibold rounded-lg transition-colors duration-200 bg-white hover:bg-gray-50"
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
                    className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-white bg-linear-to-br from-gray-700 to-black text-xs font-semibold text-white"
                  >
                    {letter}
                  </div>
                ))}
              </div>
              <p className="text-sm text-gray-600">
                <span className="font-semibold text-gray-900">2,400+</span> active learners this month
              </p>
            </div>
          </div>

          {/* Right Image */}
          <div className="relative mx-auto w-full max-w-lg">
            <div className="relative aspect-square overflow-hidden rounded-2xl border border-gray-200 bg-gray-100 shadow-lg">
              <Image
                src="/hero-student.png"
                alt="Student getting career mentorship"
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 40vw"
                className="object-cover"
                priority
              />
            </div>

            {/* Floating Card */}
            <div className="absolute -bottom-6 left-6 right-6 sm:left-auto sm:right-0 sm:w-80 flex items-center gap-3 rounded-xl border border-gray-200 bg-white px-4 py-4 shadow-lg">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 shrink-0">
                <CheckCircle2 className="h-5 w-5 text-black" />
              </div>
              <div>
                <p className="font-semibold text-gray-900 text-sm">Career direction identified</p>
                <p className="text-xs text-gray-600">Personalized roadmap generated</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
