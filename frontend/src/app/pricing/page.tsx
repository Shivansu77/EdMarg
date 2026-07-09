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
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

const plans = [
  {
    eyebrow: 'Quick Guidance',
    name: 'Career Clarity Session',
    price: '₹499',
    suffix: '/ session',
    description:
      'A focused 30-minute call to get unstuck, clarify your goals, and map out your next immediate steps.',
    ctaLabel: 'Book session',
    ctaHref: '/browse-mentors',
    accent:
      'border-white/75 bg-white/72 text-slate-900 shadow-[0_18px_55px_rgba(15,23,42,0.07)] ring-1 ring-black/[0.03]',
    badgeClass: 'border-slate-200 bg-slate-100 text-slate-700',
    buttonClass:
      'bg-slate-950 text-white hover:-translate-y-0.5 hover:bg-slate-800 shadow-[0_16px_35px_rgba(15,23,42,0.18)]',
    featureIconClass: 'bg-emerald-100 text-emerald-700',
    features: [
      '30-minute 1-on-1 video call',
      'Career path exploration',
      'Quick resume feedback',
      'Actionable next steps',
    ],
  },
  {
    eyebrow: 'Most Popular',
    name: 'Deep Dive & Review',
    price: '₹999',
    suffix: '/ session',
    description:
      'An in-depth 45-minute session focused on actionable feedback for your portfolio, resume, or interview skills.',
    ctaLabel: 'Book session',
    ctaHref: '/browse-mentors',
    accent:
      'border-emerald-300/50 bg-linear-to-br from-emerald-900 via-emerald-800 to-teal-900 text-white shadow-[0_28px_80px_rgba(16,185,129,0.28)]',
    badgeClass: 'border-white/12 bg-white/10 text-emerald-100',
    buttonClass:
      'bg-white text-emerald-950 hover:-translate-y-0.5 hover:bg-emerald-50 shadow-[0_16px_35px_rgba(0,0,0,0.18)]',
    featureIconClass: 'bg-white/12 text-emerald-100',
    features: [
      '45-minute 1-on-1 video call',
      'In-depth resume & portfolio review',
      'Mock interview practice',
      'Detailed feedback report',
    ],
  },
  {
    eyebrow: 'Comprehensive',
    name: 'Full Mentorship Path',
    price: '₹1499',
    suffix: '/ session',
    description:
      'An intensive 60-minute strategy session with priority access, complete roadmap planning, and ongoing chat support.',
    ctaLabel: 'Book session',
    ctaHref: '/browse-mentors',
    accent:
      'border-slate-700/50 bg-linear-to-br from-slate-900 via-slate-800 to-slate-950 text-white shadow-[0_28px_80px_rgba(15,23,42,0.28)]',
    badgeClass: 'border-white/12 bg-white/10 text-slate-300',
    buttonClass:
      'bg-white text-slate-900 hover:-translate-y-0.5 hover:bg-slate-50 shadow-[0_16px_35px_rgba(0,0,0,0.18)]',
    featureIconClass: 'bg-white/12 text-slate-300',
    features: [
      '60-minute intensive strategy call',
      'End-to-end placement roadmap',
      'Priority chat support for 1 month',
      'Referral guidance & networking',
    ],
  },
];

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-linear-to-b from-[#f6fbf8] via-white to-emerald-50/55 text-slate-900">
      <Navbar />

      <main className="relative overflow-hidden pb-24 pt-28 sm:pt-40">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-24 right-[-10rem] h-[30rem] w-[30rem] rounded-full bg-emerald-200/45 blur-[130px]" />
          <div className="absolute left-[-12rem] top-40 h-[28rem] w-[28rem] rounded-full bg-cyan-100/45 blur-[120px]" />
          <div className="absolute bottom-0 left-1/2 h-[32rem] w-[32rem] -translate-x-1/2 rounded-full bg-green-100/45 blur-[150px]" />
        </div>

        <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-col gap-16 px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white/85 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.24em] text-emerald-700 mb-6 shadow-sm">
              <Sparkles className="h-3.5 w-3.5" />
              Pricing
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight text-slate-950 sm:text-5xl lg:text-6xl mb-6">
              Simple, transparent pricing.
            </h1>
            <p className="text-lg text-slate-600">
              Choose the mentorship plan that fits your career goals. No hidden fees or subscription traps.
            </p>
          </div>


          <section className="grid gap-6 lg:grid-cols-3">
            {plans.map((plan, index) => (
              <motion.article
                key={plan.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.42, delay: 0.06 * index }}
                className={`relative overflow-hidden rounded-[2rem] border p-8 backdrop-blur-2xl sm:p-10 ${plan.accent}`}
              >
                {plan.name === 'Deep Dive & Review' && (
                  <div className="absolute right-6 top-6 rounded-full border border-white/12 bg-white/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.24em] text-emerald-100">
                    Most Popular
                  </div>
                )}

                <div className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[11px] font-bold uppercase tracking-[0.24em] ${plan.badgeClass}`}>
                  <BadgeCheck className="h-3.5 w-3.5" />
                  {plan.eyebrow}
                </div>

                <h2 className="mt-6 text-2xl font-bold tracking-tight">{plan.name}</h2>
                <div className="mt-4 flex items-end gap-2">
                  <span className="text-4xl font-bold tracking-tight">{plan.price}</span>
                  {plan.suffix ? <span className="pb-1 text-sm font-semibold opacity-75">{plan.suffix}</span> : null}
                </div>

                <p className={`mt-5 text-sm leading-7 ${plan.name !== 'Career Clarity Session' ? 'text-emerald-50/82' : 'text-slate-600'}`}>
                  {plan.description}
                </p>

                <ul className="mt-8 space-y-4">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex gap-3">
                      <div className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${plan.featureIconClass}`}>
                        <Check className="h-3.5 w-3.5" />
                      </div>
                      <span className={`text-sm font-semibold leading-6 ${plan.name !== 'Career Clarity Session' ? 'text-white' : 'text-slate-700'}`}>
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


        </div>
      </main>

      <Footer />
    </div>
  );
}
