'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const TESTIMONIALS = [
  {
    name: 'Priya Sharma',
    title: 'CEO & Founder',
    company: 'TCS Analytics Division',
    quote: 'TRANSFORMING CAREERS WITH DATA-DRIVEN CLARITY',
    text: "Leveraging Edmarg's AI assessment technology has positioned us for growth alongside the next generation of professionals. By eliminating the guesswork of career choices, we've achieved unprecedented placement rates and student satisfaction.",
    avatar: '👩‍💻',
    initials: 'PS',
  },
  {
    name: 'Arjun Mehta',
    title: 'Head of Design',
    company: 'Flipkart',
    quote: 'DRIVING GROWTH WITH SMART MENTORSHIP',
    text: "Edmarg's mentorship platform connected me with the right design leaders at the right time. Within 3 weeks I had a portfolio that got me hired. The structured roadmap gave me confidence I never had before as a confused engineering student.",
    avatar: '👨‍🎨',
    initials: 'AM',
  },
  {
    name: 'Sneha Patel',
    title: 'Civil Services Officer',
    company: 'Government of India',
    quote: 'FINDING YOUR TRUE CALLING IS POSSIBLE',
    text: "Everyone told me to do MBA. Edmarg helped me realize my true calling was civil services. The assessment was eye-opening, and my mentor had cleared UPSC themselves. Best decision of my life, and it started with one conversation.",
    avatar: '👩‍⚖️',
    initials: 'SP',
  },
];

const TestimonialsSection = () => {
  const [current, setCurrent] = useState(0);
  const next = useCallback(() => setCurrent(p => (p + 1) % TESTIMONIALS.length), []);
  const prev = () => setCurrent(p => (p - 1 + TESTIMONIALS.length) % TESTIMONIALS.length);
  useEffect(() => { const i = setInterval(next, 6000); return () => clearInterval(i); }, [next]);

  return (
    <section id="success-stories" className="section-dark py-24 lg:py-32 overflow-hidden relative">
      {/* Background glow */}
      <div className="absolute top-[20%] left-[10%] w-[400px] h-[400px] rounded-full blur-[150px] opacity-10 bg-[#7C3AED]" />

      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-16">
          <h2 className="text-[2rem] md:text-[2.5rem] font-bold text-white tracking-tight font-sora">
            What the <span className="text-[#A78BFA]">Top Professionals</span><br />say about Edmarg
          </h2>
        </motion.div>

        {/* Testimonial */}
        <div className="relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={current}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="flex flex-col lg:flex-row gap-0 rounded-3xl overflow-hidden"
            >
              {/* Left — Avatar area */}
              <div className="w-full lg:w-[40%] bg-gradient-to-br from-[#1E1B4B] to-[#312E81] p-10 lg:p-14 flex flex-col justify-center items-center relative min-h-[300px]">
                {/* LinkedIn icon */}
                <div className="absolute top-6 left-6 w-10 h-10 rounded-lg bg-[#0077B5] flex items-center justify-center">
                  <span className="text-white font-bold text-sm">in</span>
                </div>
                {/* Large initials */}
                <div className="w-32 h-32 rounded-full bg-white/10 border-2 border-white/20 flex items-center justify-center mb-6">
                  <span className="text-5xl font-bold text-white/30 font-sora">{TESTIMONIALS[current].initials}</span>
                </div>
                {/* Decorative name in background */}
                <p className="text-[4rem] font-extrabold text-white/[0.04] absolute bottom-4 right-4 font-sora leading-none tracking-tight select-none">
                  {TESTIMONIALS[current].name.split(' ')[0]}
                </p>
              </div>

              {/* Right — Content */}
              <div className="w-full lg:w-[60%] bg-white/[0.03] border border-white/5 p-10 lg:p-14 flex flex-col justify-center">
                <div className="w-16 h-1 bg-[#7C3AED] rounded mb-8" />
                <h3 className="text-xl lg:text-2xl font-bold text-white mb-6 tracking-tight font-sora leading-tight">
                  {TESTIMONIALS[current].quote}
                </h3>
                <p className="text-white/50 text-base leading-[1.8] mb-10 font-inter">
                  {TESTIMONIALS[current].text}
                </p>
                <div>
                  <p className="font-bold text-white font-sora text-lg">{TESTIMONIALS[current].name}</p>
                  <p className="text-sm text-white/40 font-inter">
                    {TESTIMONIALS[current].title}, {TESTIMONIALS[current].company}
                  </p>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Navigation Arrows */}
          <div className="flex items-center gap-4 mt-8">
            <button onClick={prev} className="w-12 h-12 rounded-full border border-white/10 bg-white/5 flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 transition-all">
              <ChevronLeft size={20} />
            </button>
            <button onClick={next} className="w-12 h-12 rounded-full border border-white/10 bg-white/5 flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 transition-all">
              <ChevronRight size={20} />
            </button>
            <span className="ml-4 text-sm text-white/30 font-inter">{current + 1} / {TESTIMONIALS.length}</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
