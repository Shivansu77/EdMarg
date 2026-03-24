'use client';

import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight, Star, Users, Award } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';

const MENTORS = [
  { name: 'Dr. Aris V.', role: 'Senior Product Designer', company: 'Google', rating: 4.9, students: 340, successRate: 94, image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=400', tags: ['UX Design', 'Career Growth'] },
  { name: 'Sarah Chen', role: 'Software Architect', company: 'Stripe', rating: 5.0, students: 210, successRate: 98, image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=400', tags: ['System Design', 'Fintech'] },
  { name: 'Marcus Thorne', role: 'Strategy Lead', company: 'McKinsey', rating: 4.8, students: 480, successRate: 91, image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400', tags: ['Consulting', 'Leadership'] },
];

const TopMentorsSection = () => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const scroll = (d: 'left' | 'right') => scrollRef.current?.scrollBy({ left: d === 'left' ? -350 : 350, behavior: 'smooth' });

  return (
    <section id="mentors" className="section-dark py-24 lg:py-32 border-t border-white/5">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-14">
          <div>
            <h2 className="text-[2.5rem] md:text-[3.5rem] font-bold text-white tracking-tight mb-4 font-sora">Learn from the Best</h2>
            <p className="text-lg text-white/50 font-inter">Get direct access to mentors from top companies.</p>
          </div>
          <div className="hidden md:flex items-center gap-2">
            <button onClick={() => scroll('left')} className="w-12 h-12 rounded-full border border-white/10 bg-white/5 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition-all"><ChevronLeft size={20} /></button>
            <button onClick={() => scroll('right')} className="w-12 h-12 rounded-full border border-white/10 bg-white/5 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition-all"><ChevronRight size={20} /></button>
          </div>
        </motion.div>

        <div ref={scrollRef} className="flex overflow-x-auto lg:grid lg:grid-cols-3 gap-6 lg:gap-8 pb-4 snap-x hide-scrollbar">
          {MENTORS.map((m, idx) => (
            <motion.div key={idx} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: idx * 0.12 }}
              whileHover={{ scale: 1.03, y: -6 }}
              className="min-w-[85vw] sm:min-w-[340px] lg:min-w-0 snap-center group card-dark rounded-[2rem] overflow-hidden flex flex-col">
              <div className="relative w-full aspect-[4/3] overflow-hidden bg-white/5">
                <Image src={m.image} alt={m.name} fill sizes="(max-width: 1024px) 100vw, 33vw" className="object-cover transition-transform duration-700 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0B0F19] via-transparent to-transparent" />
                <div className="absolute top-4 right-4 flex items-center gap-1.5 px-3 py-1.5 bg-black/50 backdrop-blur-sm rounded-full border border-white/10">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" /><span className="text-sm font-bold text-white">{m.rating}</span>
                </div>
              </div>
              <div className="p-6 md:p-8 flex flex-col flex-grow">
                <div className="flex flex-wrap gap-2 mb-4">
                  {m.tags.map(t => (<span key={t} className="px-3 py-1 bg-[#7C3AED]/10 text-[#A78BFA] text-xs font-semibold rounded-lg border border-[#7C3AED]/20 font-inter">{t}</span>))}
                </div>
                <h3 className="text-2xl font-bold text-white font-sora mb-1">{m.name}</h3>
                <p className="text-white/50 font-inter mb-6">{m.role} <span className="text-white/20">•</span> <span className="font-semibold text-[#A78BFA]">{m.company}</span></p>
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div><div className="flex items-center gap-2 text-white"><Users className="w-4 h-4 text-[#7C3AED]" /><span className="font-bold">{m.students}+</span></div><span className="text-xs text-white/30 font-inter">Students</span></div>
                  <div><div className="flex items-center gap-2 text-white"><Award className="w-4 h-4 text-[#10B981]" /><span className="font-bold">{m.successRate}%</span></div><span className="text-xs text-white/30 font-inter">Success</span></div>
                </div>
                <Link href="/connect" className="mt-auto w-full py-3 rounded-full font-semibold text-sm text-[#A78BFA] bg-[#7C3AED]/10 border border-[#7C3AED]/20 text-center transition-all hover:bg-[#7C3AED]/20 hover:border-[#7C3AED]/40 font-inter">View Profile</Link>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TopMentorsSection;
