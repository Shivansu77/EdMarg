'use client';

import React from 'react';
import Link from 'next/link';
import { CheckCircle2, ArrowRight, Sparkles } from 'lucide-react';

const HeroSection = () => {
  return (
    <section className="relative w-full min-h-screen flex items-center pt-24 lg:pt-32 pb-20 overflow-hidden bg-surface">
      {/* Background Glows */}
      <div className="absolute top-[-10%] left-[-5%] w-[50%] h-[50%] rounded-full blur-[140px] opacity-30" style={{background: 'radial-gradient(circle, #6366f1, transparent)'}} />
      <div className="absolute bottom-[-10%] right-[-5%] w-[40%] h-[40%] rounded-full blur-[120px] opacity-20" style={{background: 'radial-gradient(circle, #8b5cf6, transparent)'}} />
      <div className="absolute top-[40%] right-[20%] w-[20%] h-[20%] rounded-full blur-[80px] opacity-15" style={{background: 'radial-gradient(circle, #06b6d4, transparent)'}} />

      <div className="max-w-7xl mx-auto px-6 lg:px-12 w-full relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-20">

          {/* Left: Content */}
          <div className="w-full lg:w-1/2 flex flex-col items-start gap-8 animate-fade-in-up">
            {/* Trust Pill */}
            <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full border border-[#6366f1]/30 bg-[#eef2ff] shadow-sm">
              <Sparkles className="w-4 h-4 text-[#6366f1]" />
              <span className="text-xs font-bold text-[#6366f1] uppercase tracking-widest font-manrope">
                10,000+ students already guided
              </span>
            </div>

            {/* Headline */}
            <h1 className="text-[3rem] leading-[1.1] sm:text-[4rem] lg:text-[5rem] font-bold text-on-surface tracking-tighter font-plus-jakarta">
              Your Path to the{' '}
              <span className="gradient-text">Right Career</span>
            </h1>

            {/* Subtext */}
            <p className="text-base lg:text-lg text-on-surface-variant max-w-lg leading-relaxed font-manrope">
              Find clarity and confidence through guided assessments and expert mentorship. We turn your <span className="animate-gradient-text">confusion</span> into a structured roadmap for success.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
              <Link
                href="/assessment"
                className="w-full sm:w-auto px-8 py-4 rounded-xl font-semibold text-base text-white flex items-center justify-center gap-2 transition-all duration-300 hover:scale-105 hover:shadow-lg font-manrope animate-pulse-glow"
                style={{background: 'linear-gradient(135deg, #6366f1, #8b5cf6)'}}
              >
                Take Assessment <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/connect"
                className="w-full sm:w-auto px-8 py-4 bg-surface text-on-surface border-2 border-[#6366f1]/30 rounded-xl font-semibold text-base hover:bg-[#eef2ff] hover:border-[#6366f1] transition-all duration-300 text-center font-manrope"
              >
                Connect with Mentor
              </Link>
            </div>

            {/* Social proof */}
            <div className="flex items-center gap-3 mt-2">
              <div className="flex -space-x-2">
                {['#6366f1','#8b5cf6','#06b6d4','#10b981'].map((c, i) => (
                  <div key={i} className="w-8 h-8 rounded-full border-2 border-white flex items-center justify-center text-white text-xs font-bold" style={{background: c}}>
                    {String.fromCharCode(65 + i)}
                  </div>
                ))}
              </div>
              <p className="text-sm text-on-surface-variant font-manrope">
                <span className="font-bold text-on-surface">2,400+</span> students joined this month
              </p>
            </div>
          </div>

          {/* Right: Storytelling Visual */}
          <div className="w-full lg:w-1/2 relative mt-8 lg:mt-0">
            <div className="relative w-full aspect-square max-w-lg mx-auto">

              {/* Main illustration container */}
              <div className="relative w-full h-full rounded-3xl overflow-hidden border border-[#6366f1]/20 glow-card"
                style={{background: 'linear-gradient(135deg, #f8faff 0%, #eef2ff 50%, #f5f3ff 100%)'}}>

                {/* Staircase visual */}
                <div className="absolute inset-0 flex items-end justify-center pb-8 px-8">
                  {/* Stairs */}
                  <div className="relative w-full flex items-end justify-between gap-1">
                    {[20, 35, 50, 65, 80, 95].map((h, i) => (
                      <div key={i} className="flex-1 rounded-t-lg transition-all duration-500"
                        style={{
                          height: `${h * 1.8}px`,
                          background: i < 3
                            ? `rgba(148,163,184,${0.3 + i * 0.1})`
                            : `linear-gradient(180deg, ${i === 3 ? '#a5b4fc' : i === 4 ? '#818cf8' : '#6366f1'}, ${i === 3 ? '#818cf8' : i === 4 ? '#6366f1' : '#4f46e5'})`
                        }}
                      />
                    ))}
                  </div>
                </div>

                {/* Confused student (bottom-left) */}
                <div className="absolute bottom-16 left-8 flex flex-col items-center gap-2 opacity-60">
                  <div className="w-14 h-14 rounded-full bg-gray-300 flex items-center justify-center text-2xl border-2 border-gray-400">
                    😕
                  </div>
                  <span className="text-xs font-semibold text-gray-400 font-manrope">Without Edmarg</span>
                </div>

                {/* Confident student (top-right) */}
                <div className="absolute top-8 right-8 flex flex-col items-center gap-2 animate-float">
                  <div className="w-16 h-16 rounded-full flex items-center justify-center text-2xl border-2 border-[#6366f1] animate-pulse-glow"
                    style={{background: 'linear-gradient(135deg, #eef2ff, #e0e7ff)'}}>
                    🚀
                  </div>
                  <span className="text-xs font-bold text-[#6366f1] font-manrope">With Edmarg</span>
                </div>

                {/* Arrow path */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <svg width="60%" height="40%" viewBox="0 0 200 100" fill="none">
                    <path d="M20 80 Q100 20 180 10" stroke="url(#grad)" strokeWidth="2.5" strokeDasharray="6 4" fill="none"/>
                    <defs>
                      <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#94a3b8" />
                        <stop offset="100%" stopColor="#6366f1" />
                      </linearGradient>
                    </defs>
                  </svg>
                </div>

                {/* Glow overlay on right side */}
                <div className="absolute top-0 right-0 w-1/2 h-full opacity-20 pointer-events-none"
                  style={{background: 'radial-gradient(circle at top right, #6366f1, transparent)'}} />
              </div>

              {/* Floating Badge: Path Found */}
              <div className="absolute -top-4 -right-4 lg:-right-8 bg-white/95 backdrop-blur-md p-4 rounded-2xl shadow-lg flex items-center gap-3 border border-[#6366f1]/20 animate-float">
                <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{background: 'linear-gradient(135deg, #6366f1, #8b5cf6)'}}>
                  <CheckCircle2 size={18} className="text-white" />
                </div>
                <div>
                  <p className="text-sm font-bold text-on-surface font-plus-jakarta">Path Found ✨</p>
                  <p className="text-xs text-on-surface-variant">Data Science</p>
                </div>
              </div>

              {/* Floating Badge: Confused */}
              <div className="absolute bottom-8 -left-4 lg:-left-10 bg-white/95 backdrop-blur-md p-4 rounded-2xl shadow-lg flex items-center gap-3 border border-gray-200 animate-float-delayed">
                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-lg border border-gray-200">
                  😕
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-500 font-plus-jakarta">The Fog</p>
                  <p className="text-xs text-gray-400">What's next?</p>
                </div>
              </div>

              {/* Floating Badge: Success Rate */}
              <div className="absolute -bottom-4 right-8 bg-white/95 backdrop-blur-md px-4 py-3 rounded-2xl shadow-lg border border-[#10b981]/30 animate-float">
                <p className="text-xs font-bold text-[#10b981] uppercase tracking-widest">87% Success Rate 🎯</p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default HeroSection;
