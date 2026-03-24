'use client';

import React, { useEffect, useRef, useState } from 'react';
import { TrendingUp, Check, MessageSquareText, Users, Map } from 'lucide-react';
import { motion, useInView } from 'framer-motion';

const FEATURES = [
  'AI-powered career assessment that maps your strengths',
  'Personalized mentorship from industry experts',
  'Data-driven career path recommendations',
  'Structured 5-year career roadmap',
];

const STEPS = [
  { icon: <MessageSquareText className="w-7 h-7" />, title: 'Take Assessment', description: 'Our AI clarity engine analyzes your strengths, interests, and personality to map your ideal path.', step: '01', color: '#7C3AED', bg: 'rgba(124,58,237,0.15)' },
  { icon: <Users className="w-7 h-7" />, title: 'Connect with Mentor', description: 'Get paired with industry experts who have walked the path you\'re considering.', step: '02', color: '#A78BFA', bg: 'rgba(167,139,250,0.15)' },
  { icon: <Map className="w-7 h-7" />, title: 'Get Career Direction', description: 'Receive a personalized 5-year roadmap with actionable steps and milestones.', step: '03', color: '#10B981', bg: 'rgba(16,185,129,0.15)' },
];

const STATS = [
  { value: 12000, suffix: '+', label: 'Students Guided', color: '#7C3AED' },
  { value: 8000, suffix: '+', label: 'Mentor Sessions', color: '#A78BFA' },
  { value: 5, suffix: ' days', label: 'Avg Clarity Time', color: '#2DD4BF' },
  { value: 87, suffix: '%', label: 'Success Rate', color: '#10B981' },
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
    <motion.div initial={{ opacity: 0, scale: 0.8 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} className="text-center">
      <div className="text-[2.5rem] lg:text-[3rem] font-extrabold font-sora tracking-tight leading-none mb-1" style={{ color: stat.color }}>
        {display}{stat.suffix}
      </div>
      <div className="text-sm font-medium text-gray-600 font-inter">{stat.label}</div>
    </motion.div>
  );
}

type ResultsSectionProps = {
  hideIntro?: boolean;
};

const ResultsSection = ({ hideIntro = false }: ResultsSectionProps) => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [animate, setAnimate] = useState(false);
  const isInView = useInView(sectionRef, { once: true, margin: '-100px' });
  useEffect(() => { if (isInView) setAnimate(true); }, [isInView]);

  return (
    <>
      {!hideIntro && (
        <section className="section-dark py-24 lg:py-32 border-t border-white/5">
          <div className="max-w-7xl mx-auto px-6 lg:px-12">
            <div className="flex flex-col lg:flex-row items-start justify-between gap-16">
              <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="w-full lg:w-[45%]">
                <h2 className="text-[2.5rem] md:text-[3.5rem] font-bold text-white tracking-tight leading-[1.1] mb-6 font-sora">
                  Life powered by:<br /><span className="text-[#A78BFA]">Edmarg</span>
                </h2>
                <p className="text-white/50 text-base leading-relaxed font-inter mb-8">
                  Why settle for confusion and guesswork?<br/>Get One Integrated Platform for career clarity.
                </p>
                <div className="inline-flex items-center bg-white/5 rounded-full p-1 border border-white/10">
                  <span className="px-5 py-2.5 rounded-full text-sm font-medium text-white/40 font-inter">Current Life</span>
                  <span className="px-5 py-2.5 rounded-full bg-[#7C3AED] text-white text-sm font-semibold font-inter shadow-md shadow-purple-500/20">Edmarg</span>
                </div>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }} className="w-full lg:w-[50%] flex flex-col gap-4">
                {FEATURES.map((feature, idx) => (
                  <motion.div key={idx} initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 * idx }}
                    className="flex items-start gap-4 p-5 rounded-2xl bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.06] hover:border-[#7C3AED]/30 transition-all duration-400 cursor-pointer group">
                    <div className="check-icon mt-0.5 group-hover:scale-110 transition-transform">
                      <Check className="w-4 h-4 text-white" strokeWidth={3} />
                    </div>
                    <span className="text-white/70 text-[15px] font-medium font-inter leading-relaxed group-hover:text-white transition-colors">{feature}</span>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </div>
        </section>
      )}

      {/* ====== How It Works Steps ====== */}
      <section id="how-it-works" className="section-dark py-24 lg:py-32 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center max-w-2xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-6">
              <TrendingUp className="w-4 h-4 text-[#A78BFA]" />
              <span className="text-xs font-semibold text-[#A78BFA] uppercase tracking-widest">How It Works</span>
            </div>
            <h2 className="text-[2.2rem] md:text-[3rem] font-extrabold text-white tracking-tight mb-4 font-sora">
              Your Journey to <span className="gradient-text">Career Clarity</span>
            </h2>
            <p className="text-base lg:text-lg text-white/50 font-inter">A simple three-step journey to your career North Star.</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            {STEPS.map((step, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ type: 'spring', stiffness: 100, damping: 15, delay: idx * 0.2 }}
                whileHover={{ scale: 1.04, y: -8 }}
                className="relative card-dark rounded-2xl p-8 lg:p-10 flex flex-col items-start group overflow-hidden"
                style={{ borderTop: `2px solid ${step.color}` }}
              >
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"
                  style={{ background: `radial-gradient(circle at 30% 30%, ${step.color}15, transparent 70%)` }} />

                <div className="absolute top-4 right-6 text-[3rem] font-extrabold opacity-[0.05] font-sora text-white group-hover:opacity-[0.12] transition-opacity">{step.step}</div>

                <motion.div
                  whileHover={{ scale: 1.15, rotate: 5 }}
                  transition={{ type: 'spring', stiffness: 400 }}
                  className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6 relative z-10 transition-shadow duration-300"
                  style={{ background: step.bg, color: step.color }}
                >
                  {step.icon}
                </motion.div>

                <h3 className="font-bold text-white text-xl mb-3 tracking-tight font-sora relative z-10 group-hover:text-[#A78BFA] transition-colors duration-300">{step.title}</h3>
                <p className="text-white/50 text-base leading-relaxed font-inter relative z-10">{step.description}</p>

                <div className="mt-6 flex items-center gap-2 text-sm font-semibold opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300 relative z-10"
                  style={{ color: step.color }}>
                  Learn more →
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ====== Stats ====== */}
      <section ref={sectionRef} className="relative py-8 lg:py-10 border-t border-gray-200 bg-gradient-to-br from-white via-gray-50 to-gray-100">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
            {STATS.map((stat, idx) => <StatCard key={idx} stat={stat} animate={animate} />)}
          </div>
        </div>
      </section>
    </>
  );
};

export default ResultsSection;
