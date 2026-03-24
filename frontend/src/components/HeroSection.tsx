'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12, delayChildren: 0.2 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] } },
};

const HeroSection = () => {
  return (
    <section className="relative w-full min-h-screen flex items-center section-dark overflow-hidden">
      {/* Galaxy base and starfield layers */}
      <div className="absolute inset-0 hero-galaxy-bg" />
      <div className="absolute inset-0 hero-stars-layer" />
      <div className="absolute inset-0 hero-stars-layer hero-stars-layer-soft" />

      {/* Background glows */}
      <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] rounded-full blur-[180px] opacity-20 bg-[#7C3AED]" />
      <div className="absolute bottom-[-15%] left-[-10%] w-[500px] h-[500px] rounded-full blur-[150px] opacity-10 bg-[#A78BFA]" />
      {/* Subtle grid */}
      <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />

      <div className="max-w-7xl mx-auto px-6 lg:px-12 w-full relative z-10 pt-32 pb-24">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-16">

          {/* Left — Text */}
          <motion.div className="w-full lg:w-[55%] flex flex-col items-start gap-6" variants={containerVariants} initial="hidden" animate="visible">
            <motion.p variants={itemVariants} className="text-lg text-[#C4B5FD] font-inter italic">
              Built to ensure <span className="font-semibold not-italic text-[#A78BFA]">Clarity</span> for
            </motion.p>

            <motion.h1 variants={itemVariants} className="text-[3.5rem] leading-[1.05] sm:text-[4.5rem] lg:text-[5.5rem] font-extrabold text-white tracking-tight font-sora">
              Confused<br />Students &<br />
              <span className="animate-shimmer-text">Professionals</span>
            </motion.h1>

            <motion.p variants={itemVariants} className="text-lg font-semibold text-white/90 font-inter">
              One Platform | AI Assessments | Expert Mentorship
            </motion.p>

            <motion.p variants={itemVariants} className="text-base text-white/50 max-w-lg leading-relaxed font-inter">
              One system that empowers students with AI-driven career assessments, expert mentorship, and structured career roadmaps to turn confusion into confidence.
            </motion.p>

            <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-center gap-4 mt-2">
              <Link href="/assessment" className="btn-primary w-full sm:w-auto px-8 py-4 text-base flex items-center justify-center gap-2 font-inter">
                Start Assessment <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>
          </motion.div>

          {/* Right — Product Dashboard */}
          <motion.div
            className="w-full lg:w-[42%] relative"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.9, delay: 0.5 }}
          >
            <div className="relative">
              {/* Main Card */}
              <div className="card-dark rounded-3xl p-8 backdrop-blur-sm">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-3 h-3 rounded-full bg-[#10B981]" />
                  <span className="text-sm font-semibold text-white/50 font-inter">AI Career Analysis</span>
                </div>
                <div className="space-y-5">
                  {[
                    { name: 'Data Science', pct: 85, color: '#7C3AED' },
                    { name: 'UX Design', pct: 72, color: '#A78BFA' },
                    { name: 'Product Management', pct: 93, color: '#2DD4BF' },
                  ].map((item) => (
                    <div key={item.name}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-white/40 font-inter">{item.name}</span>
                        <span className="text-xs font-bold font-inter" style={{ color: item.color }}>{item.pct}%</span>
                      </div>
                      <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${item.pct}%`, background: item.color }} />
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-6 flex items-center justify-between pt-5 border-t border-white/5">
                  <span className="text-xs text-white/30 font-inter">Match Score</span>
                  <span className="text-3xl font-bold text-white font-sora">94%</span>
                </div>
              </div>

            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
