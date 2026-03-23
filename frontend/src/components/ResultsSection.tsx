'use client';

import React, { useEffect, useRef, useState } from 'react';
import { MessageSquareText, Users, Map, TrendingUp } from 'lucide-react';

const STATS = [
  { value: 12000, suffix: '+', label: 'Students Guided', icon: '🎓', color: '#6366f1' },
  { value: 8000, suffix: '+', label: 'Mentor Sessions', icon: '🤝', color: '#8b5cf6' },
  { value: 5, suffix: ' days', label: 'Avg Clarity Time', icon: '⚡', color: '#06b6d4' },
  { value: 87, suffix: '%', label: 'Success Rate', icon: '🎯', color: '#10b981' },
];

const STEPS = [
  {
    icon: <MessageSquareText className="w-7 h-7" />,
    title: 'Take Assessment',
    description: 'Our AI-driven clarity engine analyzes your strengths, interests, and personality to map your ideal path.',
    step: '01',
    color: '#6366f1',
    bg: '#eef2ff',
  },
  {
    icon: <Users className="w-7 h-7" />,
    title: 'Connect with Mentor',
    description: 'Get paired with industry experts who have walked the path you\'re considering.',
    step: '02',
    color: '#8b5cf6',
    bg: '#f5f3ff',
  },
  {
    icon: <Map className="w-7 h-7" />,
    title: 'Get Career Direction',
    description: 'Receive a personalized 5-year roadmap with actionable steps, resources, and milestones.',
    step: '03',
    color: '#10b981',
    bg: '#ecfdf5',
  },
];

function useCountUp(target: number, duration = 2000, start = false) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!start) return;
    let startTime: number | null = null;
    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      setCount(Math.floor(progress * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target, duration, start]);
  return count;
}

function StatCard({ stat, animate }: { stat: typeof STATS[0]; animate: boolean }) {
  const count = useCountUp(stat.value, 2000, animate);
  const display = stat.value >= 1000 ? `${(count / 1000).toFixed(count >= stat.value ? 0 : 1)}k` : count;
  return (
    <div className="glow-card rounded-2xl p-6 lg:p-8 flex flex-col items-center justify-center bg-white transition-all duration-300 hover:scale-105 animate-count-up">
      <div className="text-3xl mb-3">{stat.icon}</div>
      <div className="text-[2.2rem] lg:text-[2.8rem] font-extrabold font-plus-jakarta tracking-tight leading-none mb-2"
        style={{color: stat.color}}>
        {display}{stat.suffix}
      </div>
      <div className="text-xs font-bold text-on-surface-variant uppercase tracking-widest text-center font-manrope">
        {stat.label}
      </div>
    </div>
  );
}

const ResultsSection = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setAnimate(true); },
      { threshold: 0.3 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section id="how-it-works" ref={sectionRef} className="py-20 lg:py-32 w-full relative overflow-hidden"
      style={{background: 'linear-gradient(180deg, #ffffff 0%, #f8faff 50%, #ffffff 100%)'}}>

      {/* Background decoration */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[60%] h-[1px] opacity-30"
        style={{background: 'linear-gradient(90deg, transparent, #6366f1, transparent)'}} />

      <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-24 lg:mb-32">
          {STATS.map((stat, idx) => <StatCard key={idx} stat={stat} animate={animate} />)}
        </div>

        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16 lg:mb-20">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#eef2ff] border border-[#6366f1]/20 mb-6">
            <TrendingUp className="w-4 h-4 text-[#6366f1]" />
            <span className="text-xs font-bold text-[#6366f1] uppercase tracking-widest">How It Works</span>
          </div>
          <h2 className="text-[2.2rem] md:text-[3rem] font-extrabold text-on-surface tracking-tight mb-4 font-plus-jakarta">
            Your Journey to <span className="gradient-text">Career Clarity</span>
          </h2>
          <p className="text-base lg:text-lg text-on-surface-variant font-manrope">
            A simple three-step journey to finding your career North Star.
          </p>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 relative">
          {/* Connecting line */}
          <div className="hidden md:block absolute top-12 left-[20%] right-[20%] h-[2px] z-0"
            style={{background: 'linear-gradient(90deg, #6366f1, #8b5cf6, #10b981)'}} />

          {STEPS.map((step, idx) => (
            <div key={idx} className="relative z-10 rounded-2xl p-8 lg:p-10 flex flex-col items-start bg-white glow-card transition-all duration-300 hover:scale-105 hover:-translate-y-1"
              style={{borderTop: `3px solid ${step.color}`}}>
              {/* Step number */}
              <div className="absolute top-4 right-6 text-[3rem] font-extrabold opacity-10 font-plus-jakarta"
                style={{color: step.color}}>{step.step}</div>

              <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-transform duration-300 hover:scale-110"
                style={{background: step.bg, color: step.color}}>
                {step.icon}
              </div>
              <h3 className="font-bold text-on-surface text-xl mb-3 tracking-tight font-plus-jakarta">
                {step.title}
              </h3>
              <p className="text-on-surface-variant text-base leading-relaxed font-manrope">
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
