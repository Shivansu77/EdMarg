'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Check, Compass, Target, Users, Zap } from 'lucide-react';

const LIFE_FEATURES = [
  'AI-powered career assessment that maps your strengths',
  'Personalized mentorship from industry experts',
  'Data-driven career path recommendations',
  'Structured 5-year career roadmap',
];

const VALUE_FEATURES = [
  { icon: Target, label: 'Personalized\nGuidance', color: '#10B981', desc: 'Tailored paths' },
  { icon: Users, label: 'Expert\nMentorship', color: '#7C3AED', desc: 'Professionals' },
  { icon: Compass, label: 'Career\nClarity', color: '#F59E0B', desc: 'Clear roadmap' },
  { icon: Zap, label: 'Fast\nTracking', color: '#EC4899', desc: 'Accelerated' },
];

const LifeWhySplitSection = () => {
  return (
    <section className="relative overflow-hidden border-y border-border bg-linear-to-b from-surface via-surface-dim/55 to-surface py-20 lg:py-24">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-20 top-10 h-64 w-64 rounded-full bg-indigo-200/55 blur-3xl" />
        <div className="absolute -right-24 bottom-10 h-72 w-72 rounded-full bg-cyan-100/70 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-7xl px-6 lg:px-12">
        <div className="grid grid-cols-1 items-start gap-10 lg:grid-cols-2 lg:gap-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="w-full rounded-3xl border border-border bg-white p-7 shadow-[0_12px_28px_rgba(15,23,42,0.08)] md:p-8"
          >
            <h2 className="font-plus-jakarta mb-4 text-[2rem] font-extrabold leading-[1.08] tracking-tight text-on-surface md:text-[2.8rem]">
              Life powered by:
              <span className="block text-primary">Edmarg</span>
            </h2>
            <p className="font-manrope mb-7 text-base leading-relaxed text-on-surface-variant">
              Why settle for confusion and guesswork?<br />
              Get one integrated platform for career clarity.
            </p>

            <div className="mb-7 inline-flex items-center rounded-full border border-border bg-surface-dim p-1">
              <span className="font-manrope rounded-full px-5 py-2.5 text-sm font-medium text-on-surface-variant">Current Life</span>
              <span className="font-manrope rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-indigo-500/30">Edmarg</span>
            </div>

            <div className="flex max-w-xl flex-col gap-3.5">
              {LIFE_FEATURES.map((feature, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.08 * idx }}
                  className="flex items-start gap-3.5 rounded-2xl border border-border bg-surface-dim p-4 transition-all duration-300 hover:border-primary/35 hover:bg-surface-container"
                >
                  <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-500">
                    <Check className="h-4 w-4 text-white" strokeWidth={3} />
                  </div>
                  <span className="font-manrope text-[15px] font-medium leading-relaxed text-on-surface">{feature}</span>
                </motion.div>
              ))}
            </div>

            <button className="font-manrope mt-7 inline-flex items-center gap-2 rounded-xl bg-on-surface px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-slate-800">
              Start with Assessment
              <ArrowRight className="h-4 w-4" />
            </button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="w-full rounded-3xl border border-border bg-white p-7 shadow-[0_12px_28px_rgba(15,23,42,0.08)] md:p-8"
          >
            <div className="mb-7 space-y-2 text-center md:mb-8">
              <h2 className="font-plus-jakarta bg-linear-to-r from-primary via-indigo-400 to-cyan-500 bg-clip-text text-3xl font-extrabold text-transparent md:text-4xl">
                Why EdMarg?
              </h2>
              <p className="font-manrope mx-auto max-w-xl text-base font-medium text-on-surface-variant">
                Seamless Career Clarity Platform for Modern Student Success
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {VALUE_FEATURES.map((feature, idx) => {
                const Icon = feature.icon;

                return (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.1 + idx * 0.06 }}
                    className="rounded-2xl border border-border bg-surface-dim p-5 shadow-[0_6px_16px_rgba(15,23,42,0.06)]"
                  >
                    <div
                      className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl"
                      style={{
                        backgroundColor: `${feature.color}20`,
                        border: `1px solid ${feature.color}60`,
                      }}
                    >
                      <Icon className="h-5 w-5" style={{ color: feature.color }} strokeWidth={2.5} />
                    </div>

                    <p className="font-plus-jakarta whitespace-pre-line text-lg font-bold leading-tight" style={{ color: feature.color }}>
                      {feature.label}
                    </p>
                    <p className="font-manrope mt-2 text-sm font-medium text-on-surface-variant">{feature.desc}</p>
                  </motion.div>
                );
              })}
            </div>

            <div className="mt-6 rounded-xl border border-primary/20 bg-surface-container p-4">
              <p className="font-manrope text-sm leading-relaxed text-on-surface">
                EdMarg combines assessment, mentoring, and roadmap planning in one place so students move faster with confidence.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default LifeWhySplitSection;