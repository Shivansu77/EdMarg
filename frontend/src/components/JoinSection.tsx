'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

const JoinSection = () => (
  <section className="section-dark py-24 lg:py-32 relative overflow-hidden">
    <div className="absolute top-[-20%] left-[20%] w-[500px] h-[500px] rounded-full blur-[150px] opacity-15 bg-[#7C3AED]" />
    <div className="absolute bottom-[-10%] right-[10%] w-[400px] h-[400px] rounded-full blur-[120px] opacity-10 bg-[#2DD4BF]" />

    <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center relative z-10">
      <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-8">
          <Sparkles className="w-4 h-4 text-[#A78BFA]" />
          <span className="text-xs font-semibold text-[#A78BFA] uppercase tracking-widest font-inter">Start Your Journey Today</span>
        </div>
        <h2 className="text-[2.5rem] leading-tight sm:text-[3rem] lg:text-[4rem] font-bold text-white tracking-tight mb-6 font-sora">
          Still confused about<br />your career?
        </h2>
        <p className="text-base lg:text-lg text-white/50 font-inter mb-10 max-w-2xl mx-auto">
          Don&apos;t navigate the complex world of professional choices alone. Get the clarity you deserve with AI + expert mentorship.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/assessment" className="btn-primary w-full sm:w-auto px-10 py-4 text-base flex items-center justify-center gap-2 font-inter">
            Take Assessment <ArrowRight className="w-4 h-4" />
          </Link>
          <Link href="/connect" className="btn-outline-light w-full sm:w-auto px-10 py-4 text-base text-center font-inter">
            Connect with Mentor
          </Link>
        </div>
      </motion.div>
    </div>
  </section>
);

export default JoinSection;
