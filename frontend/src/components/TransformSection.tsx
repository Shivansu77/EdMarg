import React from 'react';
import { X, Check } from 'lucide-react';

const BEFORE_LIST = [
  'Endless scrolling through job boards',
  'Anxiety about choosing the wrong major',
  'Listening to conflicting advice from peers',
  'Fear of being stuck in a 9-5 you hate',
];

const AFTER_LIST = [
  'Data-backed clarity on your best-fit career',
  'Direct connection with industry-leading mentors',
  'A structured 5-year roadmap for success',
  'Confidence to pursue your true passion',
];

const TransformSection = () => {
  return (
    <section className="py-20 lg:py-32 overflow-hidden" style={{background: 'linear-gradient(180deg, #ffffff 0%, #f8faff 100%)'}}>
      <div className="max-w-7xl mx-auto px-6 lg:px-8">

        {/* Header */}
        <div className="text-center mb-16 lg:mb-20">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#eef2ff] border border-[#6366f1]/20 mb-6">
            <span className="text-xs font-bold text-[#6366f1] uppercase tracking-widest">The Transformation</span>
          </div>
          <h2 className="text-[2.2rem] md:text-[3.5rem] font-extrabold text-on-surface tracking-tight font-plus-jakarta leading-tight">
            From <span className="animate-gradient-text">Confusion</span> to{' '}
            <span className="gradient-text">Clarity</span>
          </h2>
        </div>

        {/* Split Screen */}
        <div className="flex flex-col lg:flex-row items-stretch gap-0 rounded-3xl overflow-hidden shadow-xl border border-[#6366f1]/10">

          {/* BEFORE — Grey/Dull */}
          <div className="flex-1 p-8 lg:p-12 flex flex-col justify-between relative overflow-hidden"
            style={{background: 'linear-gradient(135deg, #f1f5f9, #e2e8f0)'}}>
            {/* Dull background blobs */}
            <div className="absolute top-0 right-0 w-40 h-40 rounded-full blur-3xl opacity-30" style={{background: '#94a3b8'}} />

            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/60 border border-gray-300 rounded-lg mb-8">
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">😕 Before Edmarg</span>
              </div>
              <h3 className="text-2xl lg:text-3xl font-bold text-gray-600 mb-8 font-plus-jakarta">The Grey Fog of Indecision</h3>
              <ul className="space-y-5">
                {BEFORE_LIST.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-4">
                    <div className="mt-1 w-6 h-6 rounded-full bg-red-100 flex items-center justify-center shrink-0 border border-red-200">
                      <X className="text-red-400 w-3 h-3" strokeWidth={3} />
                    </div>
                    <span className="text-sm lg:text-base text-gray-500 font-medium font-manrope leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="relative z-10 mt-10 pt-6 border-t border-gray-300">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest font-manrope">Feeling: Overwhelmed & Stuck 😔</p>
            </div>
          </div>

          {/* Divider Arrow */}
          <div className="flex items-center justify-center bg-white z-10 px-2 py-4 lg:py-0 lg:px-0 lg:w-16">
            <div className="w-10 h-10 rounded-full flex items-center justify-center shadow-lg border border-[#6366f1]/20"
              style={{background: 'linear-gradient(135deg, #6366f1, #8b5cf6)'}}>
              <span className="text-white text-lg">→</span>
            </div>
          </div>

          {/* AFTER — Vibrant/Colorful */}
          <div className="flex-1 p-8 lg:p-12 flex flex-col justify-between relative overflow-hidden"
            style={{background: 'linear-gradient(135deg, #eef2ff, #f5f3ff)'}}>
            {/* Glow blobs */}
            <div className="absolute top-0 right-0 w-48 h-48 rounded-full blur-3xl opacity-30" style={{background: '#6366f1'}} />
            <div className="absolute bottom-0 left-0 w-32 h-32 rounded-full blur-3xl opacity-20" style={{background: '#10b981'}} />

            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#6366f1]/10 border border-[#6366f1]/30 rounded-lg mb-8">
                <span className="text-[10px] font-bold text-[#6366f1] uppercase tracking-widest">🚀 After Edmarg</span>
              </div>
              <h3 className="text-2xl lg:text-3xl font-bold text-on-surface mb-8 font-plus-jakarta">The Radiant Future</h3>
              <ul className="space-y-5">
                {AFTER_LIST.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-4">
                    <div className="mt-1 w-6 h-6 rounded-full flex items-center justify-center shrink-0"
                      style={{background: 'linear-gradient(135deg, #6366f1, #8b5cf6)'}}>
                      <Check className="text-white w-3 h-3" strokeWidth={3} />
                    </div>
                    <span className="text-sm lg:text-base text-on-surface font-semibold font-manrope leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="relative z-10 mt-10 pt-6 border-t border-[#6366f1]/20">
              <p className="text-xs font-bold text-[#6366f1] uppercase tracking-widest font-manrope">Feeling: Empowered & Focused 🎯</p>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default TransformSection;
