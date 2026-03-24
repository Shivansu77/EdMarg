'use client';

import React from 'react';

const LOGOS = [
  'NIT Trichy', 'BITS Pilani', 'VIT', 'SRM', 'Manipal', 'IIIT Hyderabad', 'BHU',
  'Delhi University', 'Anna University', 'Amity', 'Christ University', 'LPU', 'GNA', 'Chandigarh University', 'Chitkara',
];

const ClientLogosSection = () => {
  return (
    <section className="py-10 border-t border-b border-white/5 overflow-hidden bg-[#0A0A0A]">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 mb-6">
        <p className="text-center text-lg md:text-3xl font-[900] uppercase tracking-wide font-sora animate-emerald-radiant-text">
          Trusted by students from top institutions
        </p>
      </div>
      <div className="relative w-full overflow-hidden marquee-fade-mask">
        <div className="animate-scroll-logos flex items-center gap-10 whitespace-nowrap w-max">
          {[...LOGOS, ...LOGOS].map((logo, idx) => (
            <React.Fragment key={idx}>
              <span
                className={`inline-block text-lg md:text-xl font-semibold tracking-[0.04em] font-sora select-none text-gray-400 transform-gpu transition-transform duration-300 ease-out hover:scale-125 ${idx % 4 === 0 ? 'opacity-95 scale-105' : 'opacity-75'}`}
              >
                {logo}
              </span>
              <span className="text-gray-500/50 text-base md:text-lg select-none">•</span>
            </React.Fragment>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ClientLogosSection;
