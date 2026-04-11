/* eslint-disable react-hooks/exhaustive-deps, react-hooks/set-state-in-effect, @next/next/no-html-link-for-pages, @typescript-eslint/no-unused-vars, @next/next/no-img-element, react/no-unescaped-entities */
'use client';

import React from 'react';
import { Check, Target, Users, Compass, Zap, ArrowRight, MapPin, Milestone, Cpu, GraduationCap, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

const LIFE_FEATURES = [
  { text: 'AI-powered career assessment that maps your strengths', icon: Cpu },
  { text: 'Personalized mentorship from industry experts', icon: Users },
  { text: 'Data-driven career path recommendations', icon: Target },
  { text: 'Structured 5-year career roadmap', icon: Milestone },
];

const VALUE_FEATURES = [
  { icon: Compass, title: 'Personalized Guidance', colorClass: 'bg-indigo-50 text-indigo-600 border-indigo-200', shadowClass: 'shadow-indigo-500/10' },
  { icon: GraduationCap, title: 'Expert Mentorship', colorClass: 'bg-emerald-50 text-emerald-600 border-emerald-200', shadowClass: 'shadow-emerald-500/10' },
  { icon: MapPin, title: 'Career Clarity', colorClass: 'bg-amber-50 text-amber-600 border-amber-200', shadowClass: 'shadow-amber-500/10' },
  { icon: Zap, title: 'Fast Tracking', colorClass: 'bg-rose-50 text-rose-600 border-rose-200', shadowClass: 'shadow-rose-500/10' },
];

const LifeWhySplitSection = () => {
  return (
    <section className="relative overflow-hidden bg-white py-24 lg:py-32">
      {/* Background Decorations */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#f8fafc_1px,transparent_1px),linear-gradient(to_bottom,#f8fafc_1px,transparent_1px)] bg-[size:2rem_2rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-60"></div>
      
      <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid grid-cols-1 items-stretch gap-8 lg:grid-cols-2 lg:gap-12">
          
          {/* Left Card: Why EdMarg */}
          <div className="group relative w-full flex flex-col rounded-3xl border border-zinc-200 bg-white p-8 sm:p-12 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_40px_rgb(0,0,0,0.08)] transition-all duration-300 overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 rounded-full blur-3xl opacity-50 transform translate-x-1/2 -translate-y-1/2 transition-transform duration-700 group-hover:scale-150"></div>
            
            <div className="relative z-10">
              <h2 className="text-3xl lg:text-4xl font-extrabold text-zinc-900 tracking-tight mb-4">
                Why EdMarg?
              </h2>
              <p className="text-lg text-zinc-500 mb-10 max-w-sm">
                Get one integrated platform for career clarity and expert mentorship.
              </p>

              <div className="flex flex-col gap-4 mb-12">
                {LIFE_FEATURES.map((feature, idx) => (
                  <div
                    key={idx}
                    className="group/item flex items-start gap-4 rounded-2xl border border-zinc-100 bg-zinc-50/50 p-4 hover:border-indigo-200 hover:bg-white hover:shadow-sm transition-all duration-300"
                  >
                    <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-50 border border-indigo-100 group-hover/item:bg-indigo-600 transition-colors duration-300">
                      <feature.icon className="h-4 w-4 text-indigo-600 group-hover/item:text-white transition-colors duration-300" />
                    </div>
                    <span className="text-base font-semibold text-zinc-700 leading-snug">{feature.text}</span>
                  </div>
                ))}
              </div>

              <Link
                href="/assessment"
                className="group/btn inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-full bg-zinc-900 px-8 py-4 text-base font-semibold text-white shadow-lg shadow-zinc-900/20 hover:bg-zinc-800 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-zinc-900/30 transition-all duration-300"
              >
                Start with Assessment
                <ArrowRight className="h-5 w-5 group-hover/btn:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>

          {/* Right Card: Our Approach */}
          <div className="w-full flex flex-col rounded-3xl border border-zinc-200 bg-zinc-50/50 p-8 sm:p-12 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
            <h3 className="text-2xl lg:text-3xl font-extrabold text-zinc-900 tracking-tight mb-3 text-center">
              Our Approach
            </h3>
            <p className="text-center text-zinc-500 mb-10 max-w-sm mx-auto">
              Seamless career clarity platform designed for modern student success.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {VALUE_FEATURES.map((feature, idx) => {
                const Icon = feature.icon;
                return (
                  <div
                    key={idx}
                    className="group relative overflow-hidden rounded-2xl border border-zinc-200 bg-white p-6 hover:border-zinc-300 hover:shadow-md transition-all duration-300"
                  >
                    <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-xl border ${feature.colorClass} shadow-sm ${feature.shadowClass}`}>
                      <Icon className="h-6 w-6" strokeWidth={2.5} />
                    </div>
                    <p className="font-bold text-zinc-900 text-lg">
                      {feature.title}
                    </p>
                  </div>
                );
              })}
            </div>

            <div className="mt-8 rounded-2xl border border-indigo-100 bg-indigo-50/50 p-6 flex gap-4 items-start">
              <div className="shrink-0 flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100">
                <CheckCircle2 className="h-5 w-5 text-indigo-600" />
              </div>
              <p className="text-sm font-medium text-indigo-900 leading-relaxed">
                EdMarg combines assessment, mentoring, and roadmap planning in one place so students move faster with total confidence.
              </p>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default LifeWhySplitSection;
