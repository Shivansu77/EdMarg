'use client';

import React from 'react';
import Link from 'next/link';
import { CheckCircle2, User2 } from 'lucide-react';

const HeroSection = () => {
  return (
    <section className="relative w-full min-h-screen flex items-center pt-24 lg:pt-32 pb-20 overflow-hidden bg-surface">
      {/* Background Luminous Depth (Subtle Glows) */}
      <div className="absolute top-[-10%] left-[-5%] w-[40%] h-[40%] bg-surface-dim rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-5%] w-[30%] h-[30%] bg-surface-dim rounded-full blur-[100px]" />

      <div className="max-w-7xl mx-auto px-6 lg:px-12 w-full relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-24">
          
          {/* Left Column: Clarity Content */}
          <div className="w-full lg:w-1/2 flex flex-col items-start gap-10 lg:gap-12">
            {/* Status Pill */}
            <div className="inline-flex items-center gap-3 px-4 py-2 border border-border bg-surface rounded-full shadow-sm">
              <div className="w-2 h-2 rounded-full bg-primary" />
              <span className="text-[11px] lg:text-xs font-semibold text-on-surface uppercase tracking-widest font-manrope">
                10,000+ students already guided
              </span>
            </div>

            {/* Headline */}
            <h1 className="text-[3rem] leading-[1.1] sm:text-[4rem] lg:text-[5rem] font-bold text-on-surface tracking-tighter font-plus-jakarta">
              Your Path to the <br />
              <span className="text-on-surface-variant font-medium">
                Right Career
              </span>
            </h1>

            {/* Subtext */}
            <p className="text-base lg:text-lg text-on-surface-variant max-w-lg leading-relaxed font-manrope">
              Find clarity and confidence through guided assessments and expert mentorship. We turn your confusion into a structured roadmap for success.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center gap-4 lg:gap-6 w-full sm:w-auto">
              <Link 
                href="/assessment"
                className="w-full sm:w-auto px-8 py-3.5 bg-primary text-on-primary rounded-md font-medium text-base shadow-sm hover:bg-primary/90 transition-colors text-center font-manrope"
              >
                Take Assessment
              </Link>
              <Link 
                href="/connect"
                className="w-full sm:w-auto px-8 py-3.5 bg-surface text-on-surface border border-border rounded-md font-medium text-base hover:bg-surface-dim transition-colors text-center font-manrope"
              >
                Connect with Mentor
              </Link>
            </div>
          </div>

          {/* Right Column: Luminous Card / Visual */}
          <div className="w-full lg:w-1/2 relative mt-16 lg:mt-0">
            {/* Main Visual Container */}
            <div className="relative aspect-[4/5] sm:aspect-square lg:aspect-[4/5] rounded-xl overflow-hidden shadow-sm border border-border bg-surface group">
              <img 
                src="/student_in_uncertainty.png" 
                alt="Student in uncertainty"
                className="w-full h-full object-cover grayscale opacity-90 transition-transform duration-700 group-hover:scale-105"
              />
              {/* Overlay Gradient for depth */}
              <div className="absolute inset-0 bg-gradient-to-t from-surface/80 via-transparent to-transparent" />
            </div>

            {/* Floating Badges */}
            
            {/* Path Found Badge (Top Right) */}
            <div className="absolute -top-6 -right-4 lg:-right-8 bg-surface/90 backdrop-blur-md p-4 lg:p-5 rounded-lg shadow-sm flex items-center gap-4 border border-border animate-float">
              <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-full bg-surface-dim flex items-center justify-center border border-border">
                <div className="w-6 h-6 lg:w-8 lg:h-8 rounded-full bg-primary flex items-center justify-center text-on-primary">
                  <CheckCircle2 size={16} />
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-on-surface font-plus-jakarta">Path Found</p>
                <p className="text-xs text-on-surface-variant mt-0.5">Data Science</p>
              </div>
            </div>

            {/* The Fog Badge (Bottom Left) */}
            <div className="absolute bottom-8 -left-4 lg:-left-12 bg-surface/90 backdrop-blur-md p-4 lg:p-5 rounded-lg shadow-sm flex items-center gap-4 border border-border animate-float-delayed">
              <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-full bg-surface-dim flex items-center justify-center border border-border">
                <div className="w-6 h-6 lg:w-8 lg:h-8 rounded-full bg-surface-container-highest flex items-center justify-center text-on-surface font-medium">
                  ?
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-on-surface font-plus-jakarta">The Fog</p>
                <p className="text-xs text-on-surface-variant font-manrope mt-0.5">What's next?</p>
              </div>
            </div>

          </div>

        </div>
      </div>
    </section>
  );
};

export default HeroSection;
