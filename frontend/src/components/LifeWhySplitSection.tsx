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
  { icon: Compass, title: 'Personalized Guidance', colorClass: 'bg-emerald-50 text-emerald-600 border-emerald-200', shadowClass: 'shadow-emerald-500/10' },
  { icon: GraduationCap, title: 'Expert Mentorship', colorClass: 'bg-emerald-50 text-emerald-600 border-emerald-200', shadowClass: 'shadow-emerald-500/10' },
  { icon: MapPin, title: 'Career Clarity', colorClass: 'bg-green-50 text-green-600 border-green-200', shadowClass: 'shadow-green-500/10' },
  { icon: Zap, title: 'Fast Tracking', colorClass: 'bg-teal-50 text-teal-600 border-teal-200', shadowClass: 'shadow-teal-500/10' },
];

const LifeWhySplitSection = () => {
  return (
    <section className="relative overflow-hidden bg-linear-to-br from-white via-emerald-50/50 to-green-50/40 py-24 lg:py-32">
      {/* Background Decorations */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ecfdf5_1px,transparent_1px),linear-gradient(to_bottom,#ecfdf5_1px,transparent_1px)] bg-size-[2rem_2rem] mask-[radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-60"></div>
      
      <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid grid-cols-1 items-stretch gap-8 lg:grid-cols-2 lg:gap-12">
          
          {/* Left Card: Why EdMarg */}
          <div className="group relative w-full flex flex-col rounded-3xl border border-emerald-200 bg-white p-8 sm:p-12 shadow-[0_8px_30px_rgba(16,185,129,0.08)] hover:shadow-[0_8px_40px_rgba(16,185,129,0.14)] transition-all duration-300 overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-100 rounded-full blur-3xl opacity-60 transform translate-x-1/2 -translate-y-1/2 transition-transform duration-700 group-hover:scale-150"></div>
            
            <div className="relative z-10">
              <h2 className="text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight mb-4">
                Why EdMarg?
              </h2>
              <p className="text-lg text-slate-600 mb-10 max-w-sm">
                Get one integrated platform for career clarity and expert mentorship.
              </p>

              <div className="flex flex-col gap-4 mb-12">
                {LIFE_FEATURES.map((feature, idx) => (
                  <div
                    key={idx}
                    className="group/item flex items-start gap-4 rounded-2xl border border-emerald-100 bg-emerald-50/35 p-4 hover:border-emerald-300 hover:bg-white hover:shadow-sm transition-all duration-300"
                  >
                    <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-50 border border-emerald-200 group-hover/item:bg-emerald-600 transition-colors duration-300">
                      <feature.icon className="h-4 w-4 text-emerald-600 group-hover/item:text-white transition-colors duration-300" />
                    </div>
                    <span className="text-base font-semibold text-slate-700 leading-snug">{feature.text}</span>
                  </div>
                ))}
              </div>

              <Link
                href="/assessment"
                className="group/btn inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-full bg-linear-to-r from-emerald-500 to-green-500 px-8 py-4 text-base font-semibold text-white shadow-lg shadow-emerald-500/25 hover:from-emerald-600 hover:to-green-600 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-emerald-500/35 transition-all duration-300"
              >
                Start with Assessment
                <ArrowRight className="h-5 w-5 group-hover/btn:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>

          {/* Right Card: Our Approach */}
          <div className="w-full flex flex-col rounded-3xl border border-emerald-200 bg-linear-to-br from-white to-emerald-50/35 p-8 sm:p-12 shadow-[0_8px_30px_rgba(16,185,129,0.08)]">
            <h3 className="text-2xl lg:text-3xl font-extrabold text-slate-900 tracking-tight mb-3 text-center">
              Our Approach
            </h3>
            <p className="text-center text-slate-600 mb-10 max-w-sm mx-auto">
              Seamless career clarity platform designed for modern student success.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {VALUE_FEATURES.map((feature, idx) => {
                const Icon = feature.icon;
                return (
                  <div
                    key={idx}
                    className="group relative overflow-hidden rounded-2xl border border-emerald-200 bg-white p-6 hover:border-emerald-300 hover:shadow-md transition-all duration-300"
                  >
                    <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-xl border ${feature.colorClass} shadow-sm ${feature.shadowClass}`}>
                      <Icon className="h-6 w-6" strokeWidth={2.5} />
                    </div>
                    <p className="font-bold text-slate-900 text-lg">
                      {feature.title}
                    </p>
                  </div>
                );
              })}
            </div>

            <div className="mt-8 rounded-2xl border border-emerald-200 bg-emerald-50/60 p-6 flex gap-4 items-start">
              <div className="shrink-0 flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100">
                <CheckCircle2 className="h-5 w-5 text-emerald-600" />
              </div>
              <p className="text-sm font-medium text-emerald-900 leading-relaxed">
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
