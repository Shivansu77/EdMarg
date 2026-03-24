'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Check, Zap, Users, Target, Compass, Lightbulb } from 'lucide-react';

const LIFE_FEATURES = [
  'AI-powered career assessment that maps your strengths',
  'Personalized mentorship from industry experts',
  'Data-driven career path recommendations',
  'Structured 5-year career roadmap',
];

const ORBIT_FEATURES = [
  { icon: Target, label: 'Personalized\nGuidance', color: '#10B981', desc: 'Tailored paths' },
  { icon: Users, label: 'Expert\nMentorship', color: '#7C3AED', desc: 'Professionals' },
  { icon: Compass, label: 'Career\nClarity', color: '#F59E0B', desc: 'Clear roadmap' },
  { icon: Zap, label: 'Fast\nTracking', color: '#EC4899', desc: 'Accelerated' },
  { icon: Lightbulb, label: 'Smart\nAssessment', color: '#06B6D4', desc: 'AI insights' },
];

const LifeWhySplitSection = () => {
  return (
    <section className="section-dark py-20 lg:py-24 border-t border-white/5 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-28 xl:gap-36 2xl:gap-44 items-start">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="w-full"
          >
            <h2 className="text-[2.3rem] md:text-[3.2rem] font-bold text-white tracking-tight leading-[1.1] mb-6 font-sora">
              Life powered by:<br />
              <span className="text-[#A78BFA]">Edmarg</span>
            </h2>
            <p className="text-white/50 text-base leading-relaxed font-inter mb-8">
              Why settle for confusion and guesswork?<br />
              Get one integrated platform for career clarity.
            </p>

            <div className="inline-flex items-center bg-white/5 rounded-full p-1 border border-white/10 mb-8">
              <span className="px-5 py-2.5 rounded-full text-sm font-medium text-white/40 font-inter">Current Life</span>
              <span className="px-5 py-2.5 rounded-full bg-[#7C3AED] text-white text-sm font-semibold font-inter shadow-md shadow-purple-500/20">Edmarg</span>
            </div>

            <div className="flex flex-col gap-4 max-w-xl">
              {LIFE_FEATURES.map((feature, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.08 * idx }}
                  className="flex items-start gap-4 p-5 rounded-2xl bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.06] hover:border-[#7C3AED]/30 transition-all duration-300"
                >
                  <div className="check-icon mt-0.5">
                    <Check className="w-4 h-4 text-white" strokeWidth={3} />
                  </div>
                  <span className="text-white/70 text-[15px] font-medium font-inter leading-relaxed">{feature}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="w-full"
          >
            <div className="text-center mb-8 md:mb-10 space-y-2">
              <h2 className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-white via-purple-200 to-white bg-clip-text text-transparent">
                Why EdMarg?
              </h2>
              <p className="text-base text-white/60 max-w-xl mx-auto font-medium">
                Seamless Career Clarity Platform for Modern Student Success
              </p>
            </div>

            <div className="flex justify-center items-center relative w-full mt-1 md:mt-2" style={{ perspective: '1200px' }}>
              <div className="relative w-full max-w-[560px] aspect-square flex items-center justify-center">
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="relative w-20 h-20 flex items-center justify-center">
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-500/30 to-cyan-400/15 rounded-full blur-2xl" />
                    <div className="absolute inset-0 border border-purple-500/30 rounded-full" />
                    <div className="w-2 h-2 bg-purple-400 rounded-full shadow-lg shadow-purple-500/40" />
                  </div>
                </div>

                <svg className="absolute w-full h-full" viewBox="0 0 500 500" style={{ opacity: 0.28 }}>
                  <circle cx="250" cy="250" r="145" fill="none" stroke="rgba(168, 139, 250, 0.15)" strokeWidth="1" strokeDasharray="5,5" />
                </svg>

                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 45, repeat: Infinity, ease: 'linear' }}
                  style={{ position: 'absolute', width: '100%', height: '100%' }}
                >
                  {ORBIT_FEATURES.map((feature, idx) => {
                    const Icon = feature.icon;
                    const angle = (idx / ORBIT_FEATURES.length) * Math.PI * 2;
                    const radius = 185;
                    const x = Number((Math.cos(angle) * radius).toFixed(3));
                    const y = Number((Math.sin(angle) * radius).toFixed(3));

                    return (
                      <div
                        key={idx}
                        className="absolute"
                        style={{
                          width: '138px',
                          height: '138px',
                          left: '50%',
                          top: '50%',
                          marginLeft: '-69px',
                          marginTop: '-69px',
                          transform: `translateX(${x}px) translateY(${y}px)`,
                          zIndex: Math.floor(Math.cos(angle) * 10) + 10,
                        }}
                      >
                        <motion.div
                          className="group cursor-pointer w-full h-full"
                          animate={{ rotate: -360 }}
                          transition={{ duration: 45, repeat: Infinity, ease: 'linear' }}
                        >
                          <motion.div
                            className="relative w-full h-full rounded-2xl overflow-hidden flex flex-col items-center justify-center text-center p-4 space-y-2.5 backdrop-blur-xl"
                            style={{
                              background: 'linear-gradient(135deg, rgba(15,23,42,0.9), rgba(15,23,42,0.7))',
                              border: `2px solid ${feature.color}`,
                              boxShadow: `0 0 24px ${feature.color}35, inset 0 1px 0 rgba(255,255,255,0.1)`,
                            }}
                            whileHover={{
                              scale: 1.06,
                              boxShadow: `0 0 40px ${feature.color}60, 0 8px 24px rgba(0,0,0,0.3)`,
                            }}
                          >
                            <div
                              className="flex items-center justify-center rounded-lg p-2.5"
                              style={{
                                backgroundColor: `${feature.color}15`,
                                border: `1px solid ${feature.color}70`,
                              }}
                            >
                              <Icon className="w-5 h-5" style={{ color: feature.color }} strokeWidth={2.5} />
                            </div>
                            <p className="text-sm font-extrabold leading-tight whitespace-pre-line" style={{ color: feature.color }}>
                              {feature.label}
                            </p>
                            <p className="text-[10px] text-white/60 font-medium">{feature.desc}</p>
                          </motion.div>
                        </motion.div>
                      </div>
                    );
                  })}
                </motion.div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default LifeWhySplitSection;