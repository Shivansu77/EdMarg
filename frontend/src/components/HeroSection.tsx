'use client';

import React from 'react';
import Link from 'next/link';
import { CheckCircle2, User2 } from 'lucide-react';

const HeroSection = () => {
  return (
    <section className="relative w-full min-h-[90vh] flex items-center pt-20 lg:pt-0 overflow-hidden bg-surface">
      {/* Background Luminous Depth (Subtle Glows) */}
      <div className="absolute top-[-10%] left-[-5%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-5%] w-[30%] h-[30%] bg-secondary/5 rounded-full blur-[100px]" />

      <div className="max-w-7xl mx-auto px-6 lg:px-8 w-full relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
          
          {/* Left Column: Clarity Content */}
          <div className="w-full lg:w-1/2 flex flex-col items-start gap-8 lg:gap-10">
            {/* Status Pill */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-container/50 backdrop-blur-sm rounded-full">
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span className="text-[11px] lg:text-xs font-bold text-primary uppercase tracking-widest font-manrope">
                10,000+ students already guided
              </span>
            </div>

            {/* Headline */}
            <h1 className="text-[2.5rem] leading-[1.1] sm:text-[3.5rem] lg:text-[4.5rem] font-extrabold text-on-surface tracking-tight font-plus-jakarta">
              Your Path to the <br />
              <span className="bg-gradient-to-r from-primary to-primary-dim bg-clip-text text-transparent">
                Right Career
              </span>
            </h1>

            {/* Subtext */}
            <p className="text-base lg:text-lg text-on-surface-variant max-w-lg leading-relaxed font-manrope">
              Find clarity and confidence through guided assessments and expert mentorship. We turn your confusion into a structured roadmap for success.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center gap-4 lg:gap-8 w-full sm:w-auto">
              <Link 
                href="/assessment"
                className="w-full sm:w-auto px-8 lg:px-10 py-4 lg:py-5 bg-primary text-on-primary rounded-[3rem] font-bold text-base lg:text-lg shadow-ambient hover:shadow-xl transition-all transform hover:-translate-y-1 text-center font-manrope"
              >
                Take Assessment
              </Link>
              <Link 
                href="/connect"
                className="text-base lg:text-lg font-bold text-primary hover:text-primary-dim transition-colors font-manrope"
              >
                Connect with Mentor
              </Link>
            </div>
          </div>

          {/* Right Column: Luminous Card / Visual */}
          <div className="w-full lg:w-1/2 relative mt-12 lg:mt-0">
            {/* Main Visual Container */}
            <div className="relative aspect-[4/5] sm:aspect-square lg:aspect-[4/5] rounded-[2.5rem] lg:rounded-[3rem] overflow-hidden shadow-ambient bg-surface-container-low group">
              <img 
                src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&q=80&w=1200" 
                alt="Student finding clarity"
                className="w-full h-full object-cover grayscale-[0.2] transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-on-surface/40 to-transparent opacity-60" />
            </div>

            {/* Floating Glass Badges - Responsive Positioning */}
            
            {/* Path Badge */}
            <div className="absolute -top-6 -right-4 sm:-right-8 bg-surface-container-highest/60 backdrop-blur-xl border border-white/20 p-4 lg:p-6 rounded-3xl shadow-ambient flex items-center gap-4 animate-float">
              <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-full bg-primary/20 flex items-center justify-center">
                <CheckCircle2 className="text-primary w-5 h-5 lg:w-6 lg:h-6" />
              </div>
              <div>
                <p className="text-xs lg:text-sm font-bold text-on-surface font-plus-jakarta">Path Found</p>
                <p className="text-[10px] lg:text-xs text-on-surface-variant font-manrope">Product Design at Google</p>
              </div>
            </div>

            {/* Mentor Badge */}
            <div className="absolute top-1/2 -left-4 sm:-left-12 bg-white/40 backdrop-blur-xl border border-white/20 p-4 lg:p-6 rounded-3xl shadow-ambient flex items-center gap-4 animate-float-delayed">
              <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-full bg-secondary/10 flex items-center justify-center overflow-hidden">
                <User2 className="text-secondary w-5 h-5 lg:w-6 lg:h-6" />
              </div>
              <div>
                <p className="text-xs lg:text-sm font-bold text-on-surface font-plus-jakarta">Top Mentor</p>
                <div className="flex gap-1 mt-1">
                  {[1,2,3,4,5].map(i => (
                    <div key={i} className="w-1.5 h-1.5 lg:w-2 lg:h-2 rounded-full bg-primary" />
                  ))}
                </div>
              </div>
            </div>

            {/* Result Badge */}
            <div className="absolute -bottom-6 right-10 bg-surface-container-low p-4 lg:p-6 rounded-3xl shadow-ambient border border-white/10 font-plus-jakarta">
              <p className="text-[1.5rem] lg:text-[2rem] font-bold text-primary leading-none">98%</p>
              <p className="text-[10px] lg:text-xs font-bold text-on-surface-variant uppercase tracking-widest mt-1">Confidence Score</p>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default HeroSection;
