'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { X, Check, ArrowRight } from 'lucide-react';

const BEFORE = ['Endless scrolling through job boards', 'Anxiety about choosing the wrong major', 'Conflicting advice from peers', 'Fear of being stuck in a career you hate'];
const AFTER = ['Data-backed clarity on your best-fit career', 'Direct connection with industry-leading mentors', 'A structured 5-year roadmap for success', 'Confidence to pursue your true passion'];

const TransformSection = () => (
  <section className="section-dark py-24 lg:py-32 border-t border-white/5">
    <div className="max-w-7xl mx-auto px-6 lg:px-8">
      <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
        <h2 className="text-[2.2rem] md:text-[3rem] font-extrabold text-white tracking-tight font-sora">
          From Confusion to <span className="gradient-text">Clarity</span>
        </h2>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 lg:gap-16 max-w-5xl mx-auto">
        {/* Before Card */}
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          whileHover={{ scale: 1.02 }}
          className="card-dark rounded-2xl p-8 lg:p-10 group"
          style={{ borderTop: '2px solid #EF4444' }}
        >
          <h3 className="text-xl font-bold text-white/30 mb-6 font-sora group-hover:text-red-400/60 transition-colors">😕 Without Edmarg</h3>
          <ul className="space-y-5">
            {BEFORE.map((item, i) => (
              <motion.li key={i} initial={{ opacity: 0, x: -15 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 * i }}
                className="flex items-start gap-4 group/item">
                <motion.div whileHover={{ scale: 1.2, rotate: 90 }} transition={{ type: 'spring', stiffness: 400 }}
                  className="mt-0.5 w-7 h-7 rounded-full bg-red-500/10 flex items-center justify-center shrink-0 border border-red-500/20 group-hover/item:bg-red-500/20 transition-colors">
                  <X className="text-red-400 w-3.5 h-3.5" strokeWidth={3} />
                </motion.div>
                <span className="text-white/40 text-sm font-medium font-inter group-hover/item:text-white/60 transition-colors">{item}</span>
              </motion.li>
            ))}
          </ul>
        </motion.div>

        {/* After Card */}
        <motion.div
          initial={{ opacity: 0, x: 40 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          whileHover={{ scale: 1.02 }}
          className="card-dark rounded-2xl p-8 lg:p-10 group relative overflow-hidden"
          style={{ borderTop: '2px solid #7C3AED' }}
        >
          <div className="absolute top-0 right-0 w-48 h-48 rounded-full blur-[80px] opacity-0 group-hover:opacity-[0.08] bg-[#7C3AED] transition-opacity duration-700" />
          <h3 className="text-xl font-bold text-white mb-6 font-sora group-hover:text-[#A78BFA] transition-colors relative z-10">🚀 With Edmarg</h3>
          <ul className="space-y-5 relative z-10">
            {AFTER.map((item, i) => (
              <motion.li key={i} initial={{ opacity: 0, x: 15 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 * i }}
                className="flex items-start gap-4 group/item">
                <motion.div whileHover={{ scale: 1.2 }} transition={{ type: 'spring', stiffness: 400 }}
                  className="mt-0.5 w-7 h-7 rounded-full bg-gradient-to-r from-[#7C3AED] to-[#A78BFA] flex items-center justify-center shrink-0 group-hover/item:shadow-md group-hover/item:shadow-purple-500/30 transition-shadow">
                  <Check className="text-white w-3.5 h-3.5" strokeWidth={3} />
                </motion.div>
                <span className="text-white/70 text-sm font-semibold font-inter group-hover/item:text-white transition-colors">{item}</span>
              </motion.li>
            ))}
          </ul>
          <motion.div initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.6 }}
            className="mt-8 pt-6 border-t border-white/5 relative z-10">
            <a href="/assessment" className="inline-flex items-center gap-2 text-sm font-semibold text-[#A78BFA] hover:text-white transition-colors font-inter group/cta">
              Start your journey <ArrowRight className="w-4 h-4 group-hover/cta:translate-x-1 transition-transform" />
            </a>
          </motion.div>
        </motion.div>
      </div>
    </div>
  </section>
);

export default TransformSection;
