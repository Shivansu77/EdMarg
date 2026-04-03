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
    <div className="flex flex-col items-center justify-center rounded-xl border border-gray-200 bg-white p-6 text-center hover:shadow-lg transition-shadow">
      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100 text-black">
        <Icon className="h-5 w-5" />
      </div>
      <div className="mb-1 text-3xl font-bold text-gray-900">
        {display}{stat.value >= 1000 ? 'k' : ''}{stat.suffix}
      </div>
      <div className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
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
    <section id="how-it-works" ref={sectionRef} className="relative w-full overflow-hidden bg-white py-20 lg:py-28">
      <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
        {/* Stats Grid */}
        <div className="mb-20 grid grid-cols-2 gap-4 lg:mb-24 lg:grid-cols-4 lg:gap-6">
          {STATS.map((stat, idx) => <StatCard key={idx} stat={stat} animate={animate} />)}
        </div>

        {/* Section Header */}
        {!hideIntro && (
          <div className="mx-auto mb-16 max-w-2xl text-center">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-lg text-gray-600">
              A simple three-step journey to finding your career direction.
            </p>
          </div>
        )}

        {/* Steps */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3 lg:gap-8">
          {STEPS.map((step, idx) => (
            <div
              key={idx}
              className="relative flex flex-col items-start rounded-xl border border-gray-200 bg-white p-8 hover:shadow-lg transition-shadow"
            >
              <div className="absolute right-6 top-6 text-4xl font-bold text-gray-100">
                {step.step}
              </div>

              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-gray-100 text-black">
                {step.icon}
              </div>
              <h3 className="mb-3 text-xl font-bold text-gray-900">
                {step.title}
              </h3>
              <p className="text-base leading-relaxed text-gray-600">
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
