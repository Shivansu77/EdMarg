'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { CheckCircle2, ArrowRight, Sparkles } from 'lucide-react';

const HeroSection = () => {
  return (
    <section className="relative w-full min-h-screen flex items-center pt-24 lg:pt-32 pb-20 overflow-hidden bg-surface">
      {/* Subtle Minimalistic Background Accents */}
      <div className="absolute top-0 right-0 w-[60%] h-[60%] rounded-full blur-[150px] opacity-10 bg-[#6366f1]" />
      <div className="absolute bottom-0 left-0 w-[40%] h-[40%] rounded-full blur-[150px] opacity-10 bg-[#06b6d4]" />

      <div className="max-w-7xl mx-auto px-6 lg:px-12 w-full relative z-10">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-16 lg:gap-8">

          {/* Left: Content */}
          <div className="w-full lg:w-[50%] flex flex-col items-start gap-8 animate-fade-in-up">
            {/* Trust Pill */}
            <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full border border-gray-200 bg-white shadow-sm">
              <Sparkles className="w-4 h-4 text-[#6366f1]" />
              <span className="text-xs font-bold text-gray-700 uppercase tracking-widest font-manrope">
                10,000+ students guided
              </span>
            </div>

            {/* Headline */}
            <h1 className="text-[3rem] leading-[1.1] sm:text-[4rem] lg:text-[4.5rem] font-bold text-gray-900 tracking-tighter font-plus-jakarta">
              Your Path to the <br className="hidden lg:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#6366f1] to-[#8b5cf6]">Right Career</span>
            </h1>

            {/* Subtext */}
            <p className="text-lg text-gray-600 max-w-lg leading-relaxed font-manrope">
              Find clarity and confidence through guided assessments and expert mentorship. We turn your confusion into a structured roadmap for success.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
              <Link
                href="/assessment"
                className="w-full sm:w-auto px-8 py-4 rounded-xl font-semibold text-base text-white flex items-center justify-center gap-2 transition-all duration-300 hover:shadow-lg hover:shadow-[#6366f1]/25 hover:-translate-y-1 bg-[#6366f1] font-manrope"
              >
                Take Assessment <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/connect"
                className="w-full sm:w-auto px-8 py-4 bg-white text-gray-900 border border-gray-200 rounded-xl font-semibold text-base hover:bg-gray-50 transition-all duration-300 text-center shadow-sm font-manrope"
              >
                Connect with Mentor
              </Link>
            </div>

            {/* Social proof */}
            <div className="flex items-center gap-4 mt-4">
              <div className="flex -space-x-3">
                {['#4f46e5','#0ea5e9','#10b981','#f59e0b'].map((c, i) => (
                  <div key={i} className="w-10 h-10 rounded-full border-2 border-white flex items-center justify-center text-white text-sm font-bold shadow-sm" style={{background: c}}>
                    {String.fromCharCode(65 + i)}
                  </div>
                ))}
              </div>
              <p className="text-sm font-medium text-gray-600 font-manrope">
                <span className="font-bold text-gray-900">2,400+</span> joined this month
              </p>
            </div>
          </div>

          {/* Right: Imagery */}
          <div className="w-full lg:w-[45%] relative mt-8 lg:mt-0">
            <div className="relative w-full aspect-[4/5] sm:aspect-square lg:aspect-[4/5] max-w-lg mx-auto rounded-3xl overflow-visible">
              
              <div className="absolute inset-0 rounded-3xl overflow-hidden shadow-2xl shadow-indigo-500/10 border border-white bg-gray-50">
                <Image 
                  src="/hero-student.png" 
                  alt="Confident Student" 
                  fill 
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className="object-cover object-center w-full h-full"
                  priority
                />
              </div>

              {/* Floating Minimal Badge */}
              <div className="absolute bottom-6 -left-6 lg:-left-12 bg-white/95 backdrop-blur-md px-5 py-4 rounded-2xl shadow-xl flex items-center gap-4 border border-gray-100 animate-float z-20">
                <div className="w-12 h-12 rounded-full bg-indigo-50 flex items-center justify-center">
                  <CheckCircle2 size={24} className="text-[#6366f1]" />
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900 font-plus-jakarta">Clarity Found ✨</p>
                  <p className="text-sm text-gray-500 font-manrope">Data Science Path</p>
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
