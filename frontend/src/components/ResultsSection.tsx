'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Users, MessageSquareText, Compass, Target } from 'lucide-react';

const STATS = [
  { value: 12000, suffix: '+', label: 'Students Guided', icon: Users },
  { value: 8000, suffix: '+', label: 'Mentor Sessions', icon: MessageSquareText },
  { value: 5, suffix: ' days', label: 'Avg Clarity Time', icon: Compass },
  { value: 87, suffix: '%', label: 'Success Rate', icon: Target },
];

const STEPS = [
  {
    icon: <MessageSquareText className="w-6 h-6" />,
    title: 'Take Assessment',
    description: 'Our AI-driven clarity engine analyzes your strengths, interests, and personality to map your ideal path.',
    step: '01',
  },
  {
    icon: <Users className="w-6 h-6" />,
    title: 'Connect with Mentor',
    description: 'Get paired with industry experts who have walked the path you\'re considering.',
    step: '02',
  },
  {
    icon: <Compass className="w-6 h-6" />,
    title: 'Get Career Direction',
    description: 'Receive a personalized 5-year roadmap with actionable steps, resources, and milestones.',
    step: '03',
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
    <div className="group flex flex-col items-center justify-center rounded-2xl border border-emerald-100 bg-white/95 p-6 text-center shadow-[0_8px_24px_rgba(15,23,42,0.05)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_16px_40px_rgba(15,23,42,0.12)]">
      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 transition-colors group-hover:bg-emerald-500 group-hover:text-white">
        <Icon className="h-5 w-5" />
      </div>
      <div className="mb-1 text-3xl font-extrabold text-slate-900">
        {display}{stat.value >= 1000 ? 'k' : ''}{stat.suffix}
      </div>
      <div className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
        {stat.label}
      </div>
    </div>
  );
}

type ResultsSectionProps = {
  hideIntro?: boolean;
};

const ResultsSection = ({ hideIntro = false }: ResultsSectionProps) => {
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
    <section id="how-it-works" ref={sectionRef} className="relative w-full overflow-hidden bg-linear-to-b from-white via-emerald-50/30 to-white py-20 lg:py-28">
      <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
        {/* Stats Grid */}
        <div className="mb-20 grid grid-cols-2 gap-4 lg:mb-24 lg:grid-cols-4 lg:gap-6 animate-fade-up delay-100">
          {STATS.map((stat, idx) => <StatCard key={idx} stat={stat} animate={animate} />)}
        </div>

        {/* Section Header */}
        {!hideIntro && (
          <div className="mx-auto mb-16 max-w-2xl text-center animate-fade-up delay-150">
            <h2 className="text-3xl lg:text-4xl font-extrabold text-slate-900 mb-4 tracking-tight">
              How It Works
            </h2>
            <p className="text-lg text-slate-600">
              A simple three-step journey to finding your career direction.
            </p>
          </div>
        )}

        {/* Steps */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3 lg:gap-8">
          {STEPS.map((step, idx) => (
            <div
              key={idx}
              className="relative flex flex-col items-start rounded-2xl border border-slate-200 bg-white p-8 shadow-[0_8px_24px_rgba(15,23,42,0.06)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_18px_42px_rgba(15,23,42,0.13)]"
            >
              <div className="absolute right-6 top-6 text-4xl font-extrabold text-slate-100">
                {step.step}
              </div>

              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-50 text-cyan-700">
                {step.icon}
              </div>
              <h3 className="mb-3 text-xl font-bold text-slate-900">
                {step.title}
              </h3>
              <p className="text-base leading-relaxed text-slate-600">
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
