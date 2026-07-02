'use client';

import React from 'react';

const LOGOS = [
  'NIT Trichy', 'BITS Pilani', 'VIT', 'SRM', 'Manipal', 'IIIT Hyderabad', 'BHU',
  'Delhi University', 'Anna University', 'Amity', 'Christ University', 'LPU', 'GNA', 'Chandigarh University', 'Chitkara',
];

const ClientLogosSection = () => {
  return (
    <section className="relative overflow-hidden border-y border-border bg-linear-to-b from-white via-slate-50/60 to-white py-12 md:py-14">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-0 top-0 h-40 w-40 rounded-full bg-indigo-100/60 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-44 w-44 rounded-full bg-cyan-100/50 blur-3xl" />
      </div>

      <div className="relative mx-auto mb-8 max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <span className="font-manrope inline-flex items-center rounded-full border border-border bg-surface-dim px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-on-surface-variant">
            Community Trust Signal
          </span>
          <h2 className="font-plus-jakarta mt-4 text-[1.45rem] font-extrabold tracking-tight text-on-surface md:text-[2rem]">
            Trusted by students from top institutions
          </h2>
          <p className="font-manrope mx-auto mt-2 max-w-2xl text-sm leading-relaxed text-on-surface-variant md:text-base">
            Learners across leading campuses use Edmarg to gain clarity, mentorship, and actionable career direction.
          </p>
        </div>
      </div>

      <div className="relative w-full overflow-hidden marquee-fade-mask">
        <div className="animate-scroll-logos animate-scroll-logos-hover-pause flex w-max items-center gap-4 whitespace-nowrap py-2">
          {[...LOGOS, ...LOGOS].map((logo, idx) => (
            <React.Fragment key={idx}>
              <span
                className={`font-plus-jakarta inline-flex select-none items-center rounded-full border border-border bg-white px-5 py-2 text-sm font-semibold tracking-[0.02em] text-on-surface shadow-[0_2px_10px_rgba(15,23,42,0.05)] transition-all duration-300 ease-out hover:-translate-y-0.5 hover:border-primary/30 hover:bg-surface-dim hover:text-primary md:text-base ${idx % 4 === 0 ? 'opacity-100' : 'opacity-90'}`}
              >
                {logo}
              </span>
              <span className="select-none text-slate-300">•</span>
            </React.Fragment>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ClientLogosSection;
