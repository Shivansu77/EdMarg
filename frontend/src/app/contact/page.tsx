'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  CalendarClock,
  Clock3,
  Handshake,
  Headphones,
  MessageSquareText,
  Send,
  Sparkles,
  Users,
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const inquiryTypes = [
  'Student support',
  'Mentor application',
  'Booking help',
  'Partnership inquiry',
];

const contactChannels = [
  {
    title: 'Student Support',
    description: 'Questions about assessments, sessions, login issues, or next steps on the platform.',
    icon: Headphones,
    actionLabel: 'support@edmarg.com',
    actionHref: 'mailto:support@edmarg.com?subject=Student%20Support',
    accent: 'from-emerald-100 to-green-100 text-emerald-700',
    meta: 'Average reply within 24 hours',
  },
  {
    title: 'Mentor Applications',
    description: 'Experienced professionals can apply to guide learners through structured sessions.',
    icon: Users,
    actionLabel: 'Start mentor onboarding',
    actionHref: '/signup?role=mentor',
    accent: 'from-sky-100 to-cyan-100 text-sky-700',
    meta: 'Review-led onboarding flow',
  },
  {
    title: 'Partnerships',
    description: 'For schools, communities, and organizations exploring EdMarg workshops or programs.',
    icon: Handshake,
    actionLabel: 'Open partnership inquiry',
    actionHref: 'mailto:support@edmarg.com?subject=Partnership%20Inquiry',
    accent: 'from-amber-100 to-orange-100 text-amber-700',
    meta: 'Best for collaborations and bulk programs',
  },
];

const supportPromises = [
  {
    title: 'Context-aware support',
    description: 'We route questions around bookings, mentors, and assessments to the right team from the start.',
    icon: MessageSquareText,
  },
  {
    title: 'Clear timelines',
    description: 'You will know what happens next, whether that means a response, a walkthrough, or a follow-up.',
    icon: Clock3,
  },
  {
    title: 'Flexible scheduling',
    description: 'Need a conversation instead of an email thread? We can move complex issues into a call.',
    icon: CalendarClock,
  },
];

const selfServeLinks = [
  {
    title: 'Browse mentors',
    description: 'Compare domains, profiles, and session formats before reaching out.',
    href: '/browse-mentors',
  },
  {
    title: 'Take assessment',
    description: 'Start with career clarity first, then ask better questions with real context.',
    href: '/assessment',
  },
  {
    title: 'Read the blog',
    description: 'Explore practical guidance on growth, choices, and professional direction.',
    href: '/blogs',
  },
];

type ContactFormState = {
  name: string;
  email: string;
  role: string;
  subject: string;
  message: string;
};

export default function ContactPage() {
  const [formData, setFormData] = useState<ContactFormState>({
    name: '',
    email: '',
    role: 'student',
    subject: inquiryTypes[0],
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 1400));
    setIsSubmitting(false);
    setIsSuccess(true);
    setFormData({
      name: '',
      email: '',
      role: 'student',
      subject: inquiryTypes[0],
      message: '',
    });
    window.setTimeout(() => setIsSuccess(false), 5000);
  };

  return (
    <div className="min-h-screen bg-linear-to-b from-[#f6fbf9] via-white to-emerald-50/55 text-slate-900">
      <Navbar />

      <main className="relative overflow-hidden pb-24 pt-28 sm:pt-32">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-32 left-[-12rem] h-[32rem] w-[32rem] rounded-full bg-emerald-200/45 blur-[120px]" />
          <div className="absolute right-[-8rem] top-24 h-[28rem] w-[28rem] rounded-full bg-cyan-100/55 blur-[130px]" />
          <div className="absolute bottom-0 left-1/2 h-[30rem] w-[30rem] -translate-x-1/2 rounded-full bg-green-100/45 blur-[150px]" />
        </div>

        <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-col gap-10 px-6 lg:px-8">
          <section className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-stretch">
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45 }}
              className="rounded-[2rem] border border-white/70 bg-white/55 p-8 shadow-[0_18px_60px_rgba(15,23,42,0.07)] ring-1 ring-black/[0.03] backdrop-blur-2xl sm:p-10 lg:p-12"
            >
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white/85 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.24em] text-emerald-700">
                <Sparkles className="h-3.5 w-3.5" />
                Contact EdMarg
              </div>

              <h1 className="mt-6 max-w-3xl text-4xl font-extrabold tracking-tight text-slate-950 sm:text-5xl lg:text-6xl lg:leading-[1.02]">
                Professional support for every step of the career journey.
              </h1>

              <p className="mt-5 max-w-2xl text-base leading-8 text-slate-600 sm:text-lg">
                Reach out for booking help, mentor applications, student guidance, or partnership conversations. We
                keep support clear, fast, and grounded in the same calm product experience learners already trust.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                {inquiryTypes.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setFormData((current) => ({ ...current, subject: item }))}
                    className={`rounded-full px-4 py-2 text-sm font-semibold transition-all ${
                      formData.subject === item
                        ? 'bg-slate-900 text-white shadow-[0_12px_30px_rgba(15,23,42,0.18)]'
                        : 'border border-white/70 bg-white/70 text-slate-600 hover:bg-white hover:text-slate-900'
                    }`}
                  >
                    {item}
                  </button>
                ))}
              </div>

              <div className="mt-10 grid gap-4 sm:grid-cols-3">
                <div className="rounded-2xl border border-white/70 bg-white/70 p-5 backdrop-blur-xl">
                  <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-slate-400">Support SLA</p>
                  <p className="mt-3 text-2xl font-extrabold text-slate-950">&lt;24 hrs</p>
                  <p className="mt-1 text-sm text-slate-500">Typical reply time for inbound requests.</p>
                </div>
                <div className="rounded-2xl border border-white/70 bg-white/70 p-5 backdrop-blur-xl">
                  <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-slate-400">Coverage</p>
                  <p className="mt-3 text-2xl font-extrabold text-slate-950">Students + Mentors</p>
                  <p className="mt-1 text-sm text-slate-500">From onboarding questions to session flow help.</p>
                </div>
                <div className="rounded-2xl border border-white/70 bg-white/70 p-5 backdrop-blur-xl">
                  <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-slate-400">Best For</p>
                  <p className="mt-3 text-2xl font-extrabold text-slate-950">Real decisions</p>
                  <p className="mt-1 text-sm text-slate-500">Not generic forms. Real help for meaningful next steps.</p>
                </div>
              </div>
            </motion.div>

            <motion.aside
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.08 }}
              className="relative overflow-hidden rounded-[2rem] border border-emerald-200/70 bg-linear-to-br from-emerald-900 via-emerald-800 to-teal-900 p-8 text-white shadow-[0_24px_70px_rgba(16,185,129,0.28)] sm:p-10"
            >
              <div className="absolute inset-x-0 top-0 h-44 bg-linear-to-b from-white/10 to-transparent" />
              <div className="absolute -right-16 top-10 h-52 w-52 rounded-full bg-white/12 blur-3xl" />
              <div className="absolute -left-10 bottom-0 h-44 w-44 rounded-full bg-emerald-300/25 blur-3xl" />

              <div className="relative z-10">
                <p className="inline-flex rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.24em] text-emerald-100">
                  Support playbook
                </p>
                <h2 className="mt-6 text-3xl font-extrabold tracking-tight">A faster path from question to action.</h2>
                <p className="mt-4 text-sm leading-7 text-emerald-50/85 sm:text-base">
                  Every request should move you forward. We keep the process short, visible, and practical.
                </p>

                <div className="mt-8 space-y-4">
                  {[
                    {
                      step: '01',
                      title: 'Share context',
                      description: 'Tell us what stage you are in and what decision or blocker you are facing.',
                    },
                    {
                      step: '02',
                      title: 'Get routed correctly',
                      description: 'Product, mentor, booking, or partnership requests go to the right team immediately.',
                    },
                    {
                      step: '03',
                      title: 'Leave with clarity',
                      description: 'You get a direct answer, next steps, or a handoff to the right workflow.',
                    },
                  ].map((item) => (
                    <div key={item.step} className="rounded-2xl border border-white/12 bg-white/10 p-4 backdrop-blur-md">
                      <div className="flex items-start gap-4">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white/12 text-sm font-bold text-white">
                          {item.step}
                        </div>
                        <div>
                          <p className="text-base font-bold text-white">{item.title}</p>
                          <p className="mt-1 text-sm leading-6 text-emerald-50/80">{item.description}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-8 flex items-center justify-between rounded-2xl border border-white/12 bg-white/10 px-5 py-4 backdrop-blur-md">
                  <div>
                    <p className="text-sm font-semibold text-white">Need a direct starting point?</p>
                    <p className="text-sm text-emerald-100/80">Email us and include your use case in the subject.</p>
                  </div>
                  <a
                    href="mailto:support@edmarg.com"
                    className="inline-flex h-11 items-center justify-center rounded-full bg-white px-5 text-sm font-bold text-emerald-900 transition-colors hover:bg-emerald-50"
                  >
                    Email now
                  </a>
                </div>
              </div>
            </motion.aside>
          </section>

          <section className="grid gap-8 lg:grid-cols-[0.92fr_1.08fr]">
            <div className="space-y-6">
              {contactChannels.map((channel, index) => {
                const Icon = channel.icon;
                const isExternal = channel.actionHref.startsWith('mailto:');

                return (
                  <motion.article
                    key={channel.title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.08 * index }}
                    className="rounded-[1.75rem] border border-white/70 bg-white/60 p-6 shadow-[0_16px_45px_rgba(15,23,42,0.05)] ring-1 ring-black/[0.03] backdrop-blur-2xl"
                  >
                    <div className="flex items-start gap-4">
                      <div
                        className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-linear-to-br ${channel.accent}`}
                      >
                        <Icon className="h-6 w-6" />
                      </div>

                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-xl font-extrabold text-slate-950">{channel.title}</h3>
                          <span className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.22em] text-slate-500">
                            {channel.meta}
                          </span>
                        </div>
                        <p className="mt-3 text-sm leading-7 text-slate-600">{channel.description}</p>
                        {isExternal ? (
                          <a
                            href={channel.actionHref}
                            className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-emerald-700 transition-colors hover:text-emerald-800"
                          >
                            {channel.actionLabel}
                            <ArrowRight className="h-4 w-4" />
                          </a>
                        ) : (
                          <Link
                            href={channel.actionHref}
                            className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-emerald-700 transition-colors hover:text-emerald-800"
                          >
                            {channel.actionLabel}
                            <ArrowRight className="h-4 w-4" />
                          </Link>
                        )}
                      </div>
                    </div>
                  </motion.article>
                );
              })}

              <div className="rounded-[1.75rem] border border-emerald-200/70 bg-emerald-50/70 p-6 shadow-[0_10px_30px_rgba(16,185,129,0.08)] backdrop-blur-xl">
                <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-emerald-700">Office hours</p>
                <p className="mt-3 text-2xl font-extrabold tracking-tight text-slate-950">Monday to Saturday, 10 AM to 7 PM IST</p>
                <p className="mt-2 text-sm leading-7 text-slate-600">
                  For urgent platform or session coordination questions, adding precise context in your subject line
                  usually gets you the fastest resolution.
                </p>
              </div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.12 }}
              className="relative overflow-hidden rounded-[2rem] border border-white/75 bg-white/70 p-7 shadow-[0_22px_70px_rgba(15,23,42,0.08)] ring-1 ring-black/[0.03] backdrop-blur-2xl sm:p-10"
            >
              <div className="absolute inset-x-0 top-0 h-28 bg-linear-to-b from-emerald-100/60 to-transparent" />

              <div className="relative z-10">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-emerald-700">Send a message</p>
                    <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-950">Tell us what you need.</h2>
                  </div>
                  <div className="rounded-full border border-white/70 bg-white/80 px-4 py-2 text-sm font-semibold text-slate-500">
                    Best for detailed questions
                  </div>
                </div>

                <div className="mt-8 grid gap-4 md:grid-cols-3">
                  {supportPromises.map((item) => {
                    const Icon = item.icon;

                    return (
                      <div key={item.title} className="rounded-2xl border border-slate-100 bg-slate-50/75 p-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-emerald-700 shadow-sm">
                          <Icon className="h-5 w-5" />
                        </div>
                        <p className="mt-4 text-sm font-bold text-slate-950">{item.title}</p>
                        <p className="mt-2 text-sm leading-6 text-slate-600">{item.description}</p>
                      </div>
                    );
                  })}
                </div>

                <form onSubmit={handleSubmit} className="mt-8 space-y-6">
                  <div className="grid gap-5 md:grid-cols-2">
                    <div>
                      <label htmlFor="name" className="mb-2 block text-sm font-semibold text-slate-700">
                        Full name
                      </label>
                      <input
                        id="name"
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData((current) => ({ ...current, name: e.target.value }))}
                        className="h-14 w-full rounded-2xl border border-slate-200 bg-white/90 px-4 text-slate-950 outline-none transition-all placeholder:text-slate-300 focus:border-emerald-400 focus:ring-4 focus:ring-emerald-500/10"
                        placeholder="Your name"
                      />
                    </div>
                    <div>
                      <label htmlFor="email" className="mb-2 block text-sm font-semibold text-slate-700">
                        Email address
                      </label>
                      <input
                        id="email"
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData((current) => ({ ...current, email: e.target.value }))}
                        className="h-14 w-full rounded-2xl border border-slate-200 bg-white/90 px-4 text-slate-950 outline-none transition-all placeholder:text-slate-300 focus:border-emerald-400 focus:ring-4 focus:ring-emerald-500/10"
                        placeholder="you@example.com"
                      />
                    </div>
                  </div>

                  <div className="grid gap-5 md:grid-cols-[0.75fr_1.25fr]">
                    <div>
                      <label htmlFor="role" className="mb-2 block text-sm font-semibold text-slate-700">
                        I&apos;m a
                      </label>
                      <select
                        id="role"
                        value={formData.role}
                        onChange={(e) => setFormData((current) => ({ ...current, role: e.target.value }))}
                        className="h-14 w-full rounded-2xl border border-slate-200 bg-white/90 px-4 text-slate-950 outline-none transition-all focus:border-emerald-400 focus:ring-4 focus:ring-emerald-500/10"
                      >
                        <option value="student">Student</option>
                        <option value="mentor">Mentor</option>
                        <option value="parent">Parent</option>
                        <option value="institution">Institution / Partner</option>
                      </select>
                    </div>

                    <div>
                      <label htmlFor="subject" className="mb-2 block text-sm font-semibold text-slate-700">
                        Subject
                      </label>
                      <input
                        id="subject"
                        type="text"
                        required
                        value={formData.subject}
                        onChange={(e) => setFormData((current) => ({ ...current, subject: e.target.value }))}
                        className="h-14 w-full rounded-2xl border border-slate-200 bg-white/90 px-4 text-slate-950 outline-none transition-all placeholder:text-slate-300 focus:border-emerald-400 focus:ring-4 focus:ring-emerald-500/10"
                        placeholder="What do you need help with?"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="message" className="mb-2 block text-sm font-semibold text-slate-700">
                      Message
                    </label>
                    <textarea
                      id="message"
                      required
                      rows={6}
                      value={formData.message}
                      onChange={(e) => setFormData((current) => ({ ...current, message: e.target.value }))}
                      className="w-full rounded-[1.5rem] border border-slate-200 bg-white/90 px-4 py-4 text-slate-950 outline-none transition-all placeholder:text-slate-300 focus:border-emerald-400 focus:ring-4 focus:ring-emerald-500/10"
                      placeholder="Share your context, the blocker you are facing, and what outcome would be most helpful."
                    />
                  </div>

                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-sm leading-6 text-slate-500">
                      The more context you add, the faster we can route your request to the right person.
                    </p>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="inline-flex h-14 min-w-[220px] items-center justify-center gap-2 rounded-2xl bg-slate-950 px-6 text-base font-bold text-white shadow-[0_16px_35px_rgba(15,23,42,0.18)] transition-all hover:-translate-y-0.5 hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
                    >
                      {isSubmitting ? (
                        <span className="h-5 w-5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                      ) : (
                        <>
                          Send message
                          <Send className="h-4 w-4" />
                        </>
                      )}
                    </button>
                  </div>

                  {isSuccess && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm font-semibold text-emerald-800"
                    >
                      Thanks for reaching out. We&apos;ve captured your message and will follow up with the right next
                      step shortly.
                    </motion.div>
                  )}
                </form>
              </div>
            </motion.div>
          </section>

          <section className="rounded-[2rem] border border-white/75 bg-white/55 p-8 shadow-[0_18px_55px_rgba(15,23,42,0.06)] ring-1 ring-black/[0.03] backdrop-blur-2xl sm:p-10">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div className="max-w-2xl">
                <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-emerald-700">Self-serve first</p>
                <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-950">Need answers before you hit send?</h2>
                <p className="mt-3 text-sm leading-7 text-slate-600 sm:text-base">
                  If your question is really about choosing a mentor, understanding the product, or getting career
                  clarity, these paths are often faster than opening a support conversation.
                </p>
              </div>

              <a
                href="mailto:support@edmarg.com"
                className="inline-flex items-center gap-2 text-sm font-bold text-emerald-700 transition-colors hover:text-emerald-800"
              >
                support@edmarg.com
                <ArrowRight className="h-4 w-4" />
              </a>
            </div>

            <div className="mt-8 grid gap-4 md:grid-cols-3">
              {selfServeLinks.map((item) => (
                <Link
                  key={item.title}
                  href={item.href}
                  className="group rounded-[1.5rem] border border-slate-200 bg-white/80 p-5 transition-all hover:-translate-y-1 hover:border-emerald-200 hover:shadow-[0_16px_40px_rgba(16,185,129,0.12)]"
                >
                  <p className="text-lg font-extrabold text-slate-950">{item.title}</p>
                  <p className="mt-3 text-sm leading-6 text-slate-600">{item.description}</p>
                  <div className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-emerald-700">
                    Explore
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </div>
                </Link>
              ))}
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
