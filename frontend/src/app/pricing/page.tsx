'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  BadgeCheck,
  CalendarCheck,
  Check,
  Crown,
  ShieldCheck,
  Sparkles,
  WalletCards,
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const plans = [
  {
    eyebrow: 'For every learner',
    name: 'Platform Access',
    price: '$0',
    suffix: '/ forever',
    description:
      "Start free with EdMarg's assessment-led flow, mentor discovery, and community-friendly entry points.",
    ctaLabel: 'Get started free',
    ctaHref: '/signup',
    accent:
      'border-white/75 bg-white/72 text-slate-900 shadow-[0_18px_55px_rgba(15,23,42,0.07)] ring-1 ring-black/[0.03]',
    badgeClass: 'border-slate-200 bg-slate-100 text-slate-700',
    buttonClass:
      'bg-slate-950 text-white hover:-translate-y-0.5 hover:bg-slate-800 shadow-[0_16px_35px_rgba(15,23,42,0.18)]',
    featureIconClass: 'bg-emerald-100 text-emerald-700',
    features: [
      'Free AI career assessment',
      'Mentor discovery and profile browsing',
      'Structured roadmap visibility',
      'Access to community-led guidance paths',
      'Standard student support',
    ],
  },
  {
    eyebrow: 'When you need deeper guidance',
    name: 'Private Mentor Sessions',
    price: 'Custom',
    suffix: '',
    description:
      'Book targeted one-on-one conversations with mentors who set rates based on experience, domain, and format.',
    ctaLabel: 'Browse mentors',
    ctaHref: '/browse-mentors',
    accent:
      'border-emerald-300/50 bg-linear-to-br from-emerald-900 via-emerald-800 to-teal-900 text-white shadow-[0_28px_80px_rgba(16,185,129,0.28)]',
    badgeClass: 'border-white/12 bg-white/10 text-emerald-100',
    buttonClass:
      'bg-white text-emerald-950 hover:-translate-y-0.5 hover:bg-emerald-50 shadow-[0_16px_35px_rgba(0,0,0,0.18)]',
    featureIconClass: 'bg-white/12 text-emerald-100',
    features: [
      'Private video sessions with vetted mentors',
      'Resume, portfolio, and interview reviews',
      'Career-switch and roadmap consultations',
      'Priority scheduling on mentor availability',
      'Session recordings and practical takeaways',
    ],
  },
];

const pricingFactors = [
  {
    title: 'Mentor depth',
    description: 'Rates reflect operator experience, seniority, and the specificity of guidance you need.',
    icon: Crown,
  },
  {
    title: 'Session format',
    description: 'Mock interviews, portfolio deep-dives, and strategy calls may differ from a standard guidance session.',
    icon: CalendarCheck,
  },
  {
    title: 'No lock-in',
    description: 'There is no subscription pressure. You pay only when you choose to book a session.',
    icon: WalletCards,
  },
];

const includedAtEveryLevel = [
  'A cleaner path from confusion to decision-making',
  'Transparent mentor profiles and visible expertise',
  'Assessment-driven discovery before spending money',
  'Support that helps you choose the right next action',
];

const trustPoints = [
  {
    title: 'Transparent model',
    description: 'You see the mentor, the offer, and the value before booking. No hidden subscription layers.',
  },
  {
    title: 'Pay for depth, not access',
    description: 'Learners can explore freely and only pay when they want targeted, high-value guidance.',
  },
  {
    title: 'Built for outcomes',
    description: 'Pricing is structured around clarity, execution, and momentum rather than generic advice calls.',
  },
];

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-linear-to-b from-[#f6fbf8] via-white to-emerald-50/55 text-slate-900">
      <Navbar />

      <main className="relative overflow-hidden pb-24 pt-28 sm:pt-32">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-24 right-[-10rem] h-[30rem] w-[30rem] rounded-full bg-emerald-200/45 blur-[130px]" />
          <div className="absolute left-[-12rem] top-40 h-[28rem] w-[28rem] rounded-full bg-cyan-100/45 blur-[120px]" />
          <div className="absolute bottom-0 left-1/2 h-[32rem] w-[32rem] -translate-x-1/2 rounded-full bg-green-100/45 blur-[150px]" />
        </div>

        <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-col gap-10 px-6 lg:px-8">
          <section className="grid gap-8 lg:grid-cols-[1.08fr_0.92fr] lg:items-stretch">
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45 }}
              className="rounded-[2rem] border border-white/75 bg-white/58 p-8 shadow-[0_18px_60px_rgba(15,23,42,0.07)] ring-1 ring-black/[0.03] backdrop-blur-2xl sm:p-10 lg:p-12"
            >
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white/85 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.24em] text-emerald-700">
                <Sparkles className="h-3.5 w-3.5" />
                Pricing
              </div>

              <h1 className="mt-6 max-w-3xl text-4xl font-extrabold tracking-tight text-slate-950 sm:text-5xl lg:text-6xl lg:leading-[1.02]">
                Simple pricing built around clarity, not commitment traps.
              </h1>

              <p className="mt-5 max-w-2xl text-base leading-8 text-slate-600 sm:text-lg">
                Start with free discovery. When you are ready for sharper direction, book a mentor whose expertise and
                rate match the kind of help you actually need.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href="/signup"
                  className="inline-flex h-14 items-center justify-center rounded-2xl bg-emerald-500 px-6 text-sm font-bold text-white shadow-[0_16px_35px_rgba(16,185,129,0.28)] transition-all hover:-translate-y-0.5 hover:bg-emerald-600"
                >
                  Start free
                </Link>
                <Link
                  href="/browse-mentors"
                  className="inline-flex h-14 items-center justify-center rounded-2xl border border-white/70 bg-white/75 px-6 text-sm font-bold text-slate-700 transition-all hover:-translate-y-0.5 hover:bg-white"
                >
                  See mentor options
                </Link>
              </div>

              <div className="mt-10 grid gap-4 sm:grid-cols-3">
                <div className="rounded-2xl border border-white/70 bg-white/75 p-5 backdrop-blur-xl">
                  <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-slate-400">Start free</p>
                  <p className="mt-3 text-2xl font-extrabold text-slate-950">No subscription</p>
                  <p className="mt-1 text-sm text-slate-500">Explore the platform without an upfront payment wall.</p>
                </div>
                <div className="rounded-2xl border border-white/70 bg-white/75 p-5 backdrop-blur-xl">
                  <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-slate-400">Book when ready</p>
                  <p className="mt-3 text-2xl font-extrabold text-slate-950">Pay per need</p>
                  <p className="mt-1 text-sm text-slate-500">Choose the right mentor only when you need deeper help.</p>
                </div>
                <div className="rounded-2xl border border-white/70 bg-white/75 p-5 backdrop-blur-xl">
                  <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-slate-400">Built for trust</p>
                  <p className="mt-3 text-2xl font-extrabold text-slate-950">Clear pricing logic</p>
                  <p className="mt-1 text-sm text-slate-500">Rates reflect mentor depth, format, and practical value.</p>
                </div>
              </div>
            </motion.div>

            <motion.aside
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.08 }}
              className="relative overflow-hidden rounded-[2rem] border border-emerald-300/45 bg-linear-to-br from-emerald-900 via-emerald-800 to-teal-900 p-8 text-white shadow-[0_24px_80px_rgba(16,185,129,0.28)] sm:p-10"
            >
              <div className="absolute inset-x-0 top-0 h-44 bg-linear-to-b from-white/10 to-transparent" />
              <div className="absolute -right-16 top-10 h-56 w-56 rounded-full bg-white/12 blur-3xl" />
              <div className="absolute -left-10 bottom-0 h-48 w-48 rounded-full bg-emerald-300/25 blur-3xl" />

              <div className="relative z-10">
                <p className="inline-flex rounded-full border border-white/12 bg-white/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.24em] text-emerald-100">
                  What you are paying for
                </p>
                <h2 className="mt-6 text-3xl font-extrabold tracking-tight">Targeted guidance with real-world depth.</h2>
                <p className="mt-4 text-sm leading-7 text-emerald-50/85 sm:text-base">
                  EdMarg keeps access wide and paid help specific. That means you can discover for free, then invest in
                  expert time only when the conversation truly matters.
                </p>

                <div className="mt-8 space-y-4">
                  {pricingFactors.map((item) => {
                    const Icon = item.icon;

                    return (
                      <div key={item.title} className="rounded-2xl border border-white/12 bg-white/10 p-4 backdrop-blur-md">
                        <div className="flex gap-4">
                          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white/12 text-white">
                            <Icon className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="text-base font-bold text-white">{item.title}</p>
                            <p className="mt-1 text-sm leading-6 text-emerald-50/80">{item.description}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-8 rounded-2xl border border-white/12 bg-white/10 p-5 backdrop-blur-md">
                  <p className="text-sm font-semibold text-white">Best next step for most learners</p>
                  <p className="mt-2 text-sm leading-6 text-emerald-50/80">
                    Take the assessment first, short-list mentors second, and book a session only when the gap is clear.
                  </p>
                  <Link
                    href="/assessment"
                    className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-white"
                  >
                    Take assessment
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            </motion.aside>
          </section>

          <section className="grid gap-6 lg:grid-cols-2">
            {plans.map((plan, index) => (
              <motion.article
                key={plan.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.42, delay: 0.06 * index }}
                className={`relative overflow-hidden rounded-[2rem] border p-8 backdrop-blur-2xl sm:p-10 ${plan.accent}`}
              >
                {plan.name === 'Private Mentor Sessions' && (
                  <div className="absolute right-6 top-6 rounded-full border border-white/12 bg-white/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.24em] text-emerald-100">
                    Most flexible
                  </div>
                )}

                <div className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[11px] font-bold uppercase tracking-[0.24em] ${plan.badgeClass}`}>
                  <BadgeCheck className="h-3.5 w-3.5" />
                  {plan.eyebrow}
                </div>

                <h2 className="mt-6 text-3xl font-extrabold tracking-tight">{plan.name}</h2>
                <div className="mt-4 flex items-end gap-2">
                  <span className="text-5xl font-extrabold tracking-tight">{plan.price}</span>
                  {plan.suffix ? <span className="pb-1 text-sm font-semibold opacity-75">{plan.suffix}</span> : null}
                </div>

                <p className={`mt-5 text-sm leading-7 ${plan.name === 'Private Mentor Sessions' ? 'text-emerald-50/82' : 'text-slate-600'}`}>
                  {plan.description}
                </p>

                <ul className="mt-8 space-y-4">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex gap-3">
                      <div className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${plan.featureIconClass}`}>
                        <Check className="h-3.5 w-3.5" />
                      </div>
                      <span className={`text-sm font-semibold leading-6 ${plan.name === 'Private Mentor Sessions' ? 'text-white' : 'text-slate-700'}`}>
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>

                <Link
                  href={plan.ctaHref}
                  className={`mt-10 inline-flex h-14 w-full items-center justify-center rounded-2xl text-sm font-bold transition-all ${plan.buttonClass}`}
                >
                  {plan.ctaLabel}
                </Link>
              </motion.article>
            ))}
          </section>

          <section className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr]">
            <div className="rounded-[2rem] border border-white/75 bg-white/62 p-8 shadow-[0_18px_55px_rgba(15,23,42,0.06)] ring-1 ring-black/[0.03] backdrop-blur-2xl sm:p-10">
              <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-emerald-700">Included at every level</p>
              <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-950">You are never paying just to unlock the platform.</h2>
              <p className="mt-4 text-sm leading-7 text-slate-600 sm:text-base">
                The free layer exists so learners can orient themselves first. Paid sessions only enter the picture when
                you want sharper, more personal guidance.
              </p>

              <div className="mt-8 space-y-4">
                {includedAtEveryLevel.map((item) => (
                  <div key={item} className="flex gap-3 rounded-2xl border border-slate-100 bg-slate-50/85 p-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white text-emerald-700 shadow-sm">
                      <ShieldCheck className="h-5 w-5" />
                    </div>
                    <p className="text-sm font-semibold leading-6 text-slate-700">{item}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[2rem] border border-emerald-200/80 bg-linear-to-br from-emerald-50/85 via-white to-green-50/80 p-8 shadow-[0_20px_60px_rgba(16,185,129,0.1)] sm:p-10">
              <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-emerald-700">Why learners trust this model</p>
              <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-950">Clear economics, better decisions.</h2>
              <div className="mt-8 grid gap-4">
                {trustPoints.map((item) => (
                  <article key={item.title} className="rounded-[1.5rem] border border-white/80 bg-white/85 p-5 shadow-sm backdrop-blur-xl">
                    <p className="text-lg font-extrabold text-slate-950">{item.title}</p>
                    <p className="mt-2 text-sm leading-7 text-slate-600">{item.description}</p>
                  </article>
                ))}
              </div>
            </div>
          </section>

          <section className="rounded-[2rem] border border-emerald-300/50 bg-linear-to-br from-emerald-700 via-emerald-600 to-green-600 p-8 text-white shadow-[0_24px_80px_rgba(16,185,129,0.24)] sm:p-10 lg:flex lg:items-center lg:justify-between lg:gap-10">
            <div className="max-w-3xl">
              <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-emerald-100">For mentors</p>
              <h2 className="mt-4 text-3xl font-extrabold tracking-tight sm:text-4xl">
                Want to share your expertise without platform overhead?
              </h2>
              <p className="mt-4 text-sm leading-7 text-emerald-50/85 sm:text-base">
                Join EdMarg as a mentor, set your availability, and guide ambitious learners through sessions that are
                actually outcome-driven.
              </p>
            </div>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row lg:mt-0">
              <Link
                href="/signup?role=mentor"
                className="inline-flex h-14 items-center justify-center rounded-2xl bg-white px-6 text-sm font-bold text-emerald-900 transition-all hover:-translate-y-0.5 hover:bg-emerald-50"
              >
                Apply as mentor
              </Link>
              <Link
                href="/contact"
                className="inline-flex h-14 items-center justify-center rounded-2xl border border-white/20 bg-white/10 px-6 text-sm font-bold text-white transition-all hover:-translate-y-0.5 hover:bg-white/15"
              >
                Talk to us
              </Link>
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
