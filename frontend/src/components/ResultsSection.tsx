'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Compass, MessageSquareText, Target, TrendingUp, Users } from 'lucide-react';

const STATS = [
  { value: 12000, suffix: '+', label: 'Students Guided', icon: Users },
  { value: 8000, suffix: '+', label: 'Mentor Sessions', icon: MessageSquareText },
  { value: 5, suffix: ' days', label: 'Avg Clarity Time', icon: Compass },
  { value: 87, suffix: '%', label: 'Success Rate', icon: Target },
];

const STEPS = [
  {
    icon: <MessageSquareText className="w-7 h-7" />,
    title: 'Take Assessment',
    description: 'Our AI-driven clarity engine analyzes your strengths, interests, and personality to map your ideal path.',
    step: '01',
    color: 'text-primary',
    bg: 'bg-indigo-50',
  },
  {
    icon: <Users className="w-7 h-7" />,
    title: 'Connect with Mentor',
    description: 'Get paired with industry experts who have walked the path you\'re considering.',
    step: '02',
    color: 'text-primary',
    bg: 'bg-indigo-50',
  },
  {
    icon: <Compass className="w-7 h-7" />,
    title: 'Get Career Direction',
    description: 'Receive a personalized 5-year roadmap with actionable steps, resources, and milestones.',
    step: '03',
    color: 'text-primary',
    bg: 'bg-indigo-50',
  },
];

function useCountUp(target: number, duration = 2000, start = false) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!start) return;

    let rafId = 0;
    let startTime: number | null = null;

    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const nextValue = Math.floor(progress * target);
      setCount(nextValue >= target ? target : nextValue);
      if (progress < 1) {
        rafId = requestAnimationFrame(step);
      }
    };

    rafId = requestAnimationFrame(step);

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [target, duration, start]);

  return count;
}

function StatCard({ stat, animate }: { stat: typeof STATS[0]; animate: boolean }) {
  const count = useCountUp(stat.value, 2000, animate);
  const display = stat.value >= 1000 ? `${Math.floor(count / 1000)}` : count;
  const Icon = stat.icon;

  return (
    <div className="animate-count-up flex flex-col items-center justify-center rounded-2xl border border-border bg-white p-6 text-center shadow-[0_6px_18px_rgba(15,23,42,0.05)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_12px_28px_rgba(15,23,42,0.1)] lg:p-7">
      <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-indigo-50 text-primary">
        <Icon className="h-5 w-5" />
      </div>
      <div className="font-plus-jakarta mb-1 text-[2rem] font-extrabold leading-none tracking-tight text-on-surface lg:text-[2.4rem]">
        {display}{stat.value >= 1000 ? 'k' : ''}{stat.suffix}
      </div>
      <div className="font-manrope text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
        {stat.label}
      </div>
    </div>
  );
}

const ResultsSection = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [animate, setAnimate] = useState(false);
  const hasAnimatedRef = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimatedRef.current) {
          hasAnimatedRef.current = true;
          setAnimate(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );

    if (sectionRef.current) observer.observe(sectionRef.current);

    return () => observer.disconnect();
  }, []);

  return (
    <section id="how-it-works" ref={sectionRef} className="relative w-full overflow-hidden bg-white py-20 lg:py-28">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-0 top-0 h-72 w-72 rounded-full bg-slate-200/40 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-80 w-80 rounded-full bg-indigo-100/50 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-7xl px-6 lg:px-8">

        {/* Stats Grid */}
        <div className="mb-20 grid grid-cols-2 gap-4 lg:mb-24 lg:grid-cols-4 lg:gap-5">
          {STATS.map((stat, idx) => <StatCard key={idx} stat={stat} animate={animate} />)}
        </div>

        {/* Section Header */}
        <div className="mx-auto mb-14 max-w-2xl text-center lg:mb-16">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-border bg-surface-dim px-4 py-2">
            <TrendingUp className="h-4 w-4 text-primary" />
            <span className="font-manrope text-xs font-semibold uppercase tracking-widest text-primary">How It Works</span>
          </div>
          <h2 className="font-plus-jakarta mb-4 text-[2.1rem] font-extrabold tracking-tight text-on-surface md:text-[2.9rem]">
            Your Journey to Career Clarity
          </h2>
          <p className="font-manrope text-base text-on-surface-variant lg:text-lg">
            A simple three-step journey to finding your career North Star.
          </p>
        </div>

        {/* Steps */}
        <div className="relative grid grid-cols-1 gap-5 md:grid-cols-3 lg:gap-6">
          <div className="pointer-events-none absolute left-[16.5%] right-[16.5%] top-6 hidden h-px bg-linear-to-r from-transparent via-indigo-200 to-transparent md:block" />

          {STEPS.map((step, idx) => (
            <div
              key={idx}
              className="relative z-10 flex flex-col items-start rounded-2xl border border-border bg-white p-7 shadow-[0_8px_24px_rgba(15,23,42,0.06)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_14px_34px_rgba(15,23,42,0.12)] lg:p-8"
            >
              {/* Step number */}
              <div className="font-plus-jakarta absolute right-5 top-4 text-[2.5rem] font-extrabold text-slate-200">{step.step}</div>

              <div className={`mb-5 flex h-12 w-12 items-center justify-center rounded-2xl ${step.bg} ${step.color}`}>
                {step.icon}
              </div>
              <h3 className="font-plus-jakarta mb-3 text-xl font-bold tracking-tight text-on-surface">
                {step.title}
              </h3>
              <p className="font-manrope text-base leading-relaxed text-on-surface-variant">
                {step.description}
              </p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};

export default ResultsSection;
