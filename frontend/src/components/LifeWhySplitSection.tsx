'use client';

import React from 'react';
import { Check, Target, Users, Compass, Zap, ArrowRight } from 'lucide-react';
import Link from 'next/link';

const LIFE_FEATURES = [
  'AI-powered career assessment that maps your strengths',
  'Personalized mentorship from industry experts',
  'Data-driven career path recommendations',
  'Structured 5-year career roadmap',
];

const VALUE_FEATURES = [
  { icon: Target, label: 'Personalized Guidance', color: '#10B981' },
  { icon: Users, label: 'Expert Mentorship', color: '#7C3AED' },
  { icon: Compass, label: 'Career Clarity', color: '#F59E0B' },
  { icon: Zap, label: 'Fast Tracking', color: '#EC4899' },
];

const LifeWhySplitSection = () => {
  return (
    <section className="relative overflow-hidden bg-white py-20 lg:py-28 border-t border-gray-100">
      <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-2 lg:gap-12">
          {/* Left Card */}
          <div className="w-full rounded-2xl border border-gray-200 bg-white p-8">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Why EdMarg?
            </h2>
            <p className="text-lg text-gray-600 mb-8">
              Get one integrated platform for career clarity and mentorship.
            </p>

            <div className="flex max-w-xl flex-col gap-4 mb-8">
              {LIFE_FEATURES.map((feature, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-3 rounded-lg border border-gray-200 bg-gray-50 p-4 hover:bg-gray-100 transition-colors"
                >
                  <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-green-500">
                    <Check className="h-4 w-4 text-white" strokeWidth={3} />
                  </div>
                  <span className="text-base font-medium text-gray-900">{feature}</span>
                </div>
              ))}
            </div>

            <Link
              href="/assessment"
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 hover:bg-blue-700 px-6 py-3 text-base font-semibold text-white transition-colors"
            >
              Start with Assessment
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {/* Right Card */}
          <div className="w-full rounded-2xl border border-gray-200 bg-white p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-2 text-center">
              Our Approach
            </h3>
            <p className="text-center text-gray-600 mb-8">
              Seamless career clarity platform for modern student success
            </p>

            <div className="grid grid-cols-2 gap-4">
              {VALUE_FEATURES.map((feature, idx) => {
                const Icon = feature.icon;

                return (
                  <div
                    key={idx}
                    className="rounded-lg border border-gray-200 bg-gray-50 p-5 hover:bg-gray-100 transition-colors"
                  >
                    <div
                      className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg"
                      style={{
                        backgroundColor: `${feature.color}20`,
                        border: `1px solid ${feature.color}40`,
                      }}
                    >
                      <Icon className="h-5 w-5" style={{ color: feature.color }} />
                    </div>

                    <p className="font-bold text-gray-900" style={{ color: feature.color }}>
                      {feature.label}
                    </p>
                  </div>
                );
              })}
            </div>

            <div className="mt-6 rounded-lg border border-gray-200 bg-blue-50 p-4">
              <p className="text-sm text-gray-700">
                EdMarg combines assessment, mentoring, and roadmap planning in one place so students move faster with confidence.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LifeWhySplitSection;
