'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Zap, Users, Target, Compass, Lightbulb } from 'lucide-react';

const WhyEdMargSection = () => {
  const features = [
    { icon: Target, label: 'Personalized\nGuidance', color: '#10B981', desc: 'Tailored paths' },
    { icon: Users, label: 'Expert\nMentorship', color: '#7C3AED', desc: 'Professionals' },
    { icon: Compass, label: 'Career\nClarity', color: '#F59E0B', desc: 'Clear roadmap' },
    { icon: Zap, label: 'Fast\nTracking', color: '#EC4899', desc: 'Accelerated' },
    { icon: Lightbulb, label: 'Smart\nAssessment', color: '#06B6D4', desc: 'AI insights' },
  ];
  return (
    <section className="relative w-full py-24 overflow-hidden section-dark border-t border-white/5">
      {/* Animated Background */}
      <div className="absolute inset-0 opacity-15 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl" />
        <div className="absolute top-1/3 right-1/4 w-72 h-72 bg-purple-400/10 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-12 w-full relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-0 space-y-3"
        >
          <h2 className="text-5xl md:text-6xl font-extrabold bg-gradient-to-r from-white via-purple-200 to-white bg-clip-text text-transparent">
            Why EdMarg?
          </h2>
          <p className="text-lg text-white/60 max-w-2xl mx-auto font-medium">
            Seamless Career Clarity Platform for Modern Student Success
          </p>
        </motion.div>

        {/* Orbital Container */}
        <div className="flex justify-center items-center relative w-full -mt-10 md:-mt-14" style={{ perspective: '1200px' }}>
          <div className="relative w-full max-w-6xl aspect-square flex items-center justify-center">
            
            {/* Central Orb */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="relative w-28 h-28 flex items-center justify-center">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/30 to-cyan-400/15 rounded-full blur-2xl" />
                <div className="absolute inset-0 border-2 border-purple-500/30 rounded-full" />
                <div className="w-2.5 h-2.5 bg-purple-400 rounded-full shadow-lg shadow-purple-500/40" />
              </div>
            </div>

            {/* Orbit Rings */}
            <svg className="absolute w-full h-full" viewBox="0 0 500 500" style={{ opacity: 0.3 }}>
              <circle cx="250" cy="250" r="165" fill="none" stroke="rgba(168, 139, 250, 0.15)" strokeWidth="1" strokeDasharray="5,5" />
            </svg>

            {/* Revolving Container */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{
                duration: 50,
                repeat: Infinity,
                ease: 'linear',
              }}
              style={{
                position: 'absolute',
                width: '100%',
                height: '100%',
              }}
            >
              {/* Revolving Boxes */}
              {features.map((feature, idx) => {
                const Icon = feature.icon;
                const totalBoxes = features.length;
                const angle = (idx / totalBoxes) * Math.PI * 2;
                const radius = 260;
                const x = Number((Math.cos(angle) * radius).toFixed(3));
                const y = Number((Math.sin(angle) * radius).toFixed(3));

                return (
                  <div
                    key={idx}
                    className="absolute"
                    style={{
                      width: '180px',
                      height: '180px',
                      left: '50%',
                      top: '50%',
                      marginLeft: '-90px',
                      marginTop: '-90px',
                      transform: `translateX(${x}px) translateY(${y}px)`,
                      zIndex: Math.floor(Math.cos(angle) * 10) + 10,
                    }}
                  >
                    <motion.div
                      className="group cursor-pointer w-full h-full"
                      animate={{ rotate: -360 }}
                      transition={{
                        duration: 50,
                        repeat: Infinity,
                        ease: 'linear',
                      }}
                      whileHover={{ scale: 1.08 }}
                    >
                      <motion.div
                        className="relative w-full h-full rounded-2xl overflow-hidden flex flex-col items-center justify-center text-center p-6 space-y-4 backdrop-blur-xl"
                        style={{
                          background: `linear-gradient(135deg, rgba(15,23,42,0.9), rgba(15,23,42,0.7))`,
                          border: `2.5px solid ${feature.color}`,
                          boxShadow: `0 0 30px ${feature.color}40, inset 0 1px 0px rgba(255,255,255,0.1)`,
                        }}
                        whileHover={{
                          boxShadow: `0 0 50px ${feature.color}60, inset 0 1px 0px rgba(255,255,255,0.15), 0 8px 24px rgba(0,0,0,0.3)`,
                        }}
                      >
                        {/* Icon Container */}
                        <motion.div
                          className="flex items-center justify-center rounded-xl p-3.5"
                          style={{
                            backgroundColor: `${feature.color}15`,
                            border: `1.5px solid ${feature.color}70`,
                            boxShadow: `0 0 20px ${feature.color}30`,
                          }}
                          whileHover={{ scale: 1.15, rotate: 5 }}
                        >
                          <Icon className="w-8 h-8" style={{ color: feature.color }} strokeWidth={2.5} />
                        </motion.div>

                        {/* Label - Main Text */}
                        <p className="text-base font-extrabold leading-tight whitespace-pre-line" style={{ color: feature.color }}>
                          {feature.label}
                        </p>

                        {/* Description - Subtext */}
                        <p className="text-xs text-white/60 font-medium">
                          {feature.desc}
                        </p>
                      </motion.div>
                    </motion.div>
                  </div>
                );
              })}
            </motion.div>
          </div>
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="text-center -mt-10 md:-mt-14"
        >
          <p className="text-white/70 text-lg font-medium mb-6">
            Ready to start your career journey?
          </p>
          <motion.button
            className="px-10 py-3.5 text-base font-semibold rounded-lg bg-gradient-to-r from-purple-600 to-violet-600 text-white shadow-lg shadow-purple-500/30"
            whileHover={{
              scale: 1.05,
              boxShadow: '0 24px 60px rgba(139, 92, 246, 0.5)',
            }}
            whileTap={{ scale: 0.98 }}
          >
            Discover Your Path Today
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
};

export default WhyEdMargSection;
