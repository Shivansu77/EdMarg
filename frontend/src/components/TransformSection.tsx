import React from 'react';
import { ArrowRight, Check, X } from 'lucide-react';

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
    <section className="overflow-hidden bg-surface py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">

        {/* Header */}
        <div className="mb-14 text-center lg:mb-16">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-border bg-surface-dim px-4 py-2">
            <span className="font-manrope text-xs font-semibold uppercase tracking-widest text-primary">The Transformation</span>
          </div>
          <h2 className="font-plus-jakarta text-[2.1rem] font-extrabold leading-tight tracking-tight text-on-surface md:text-[3rem]">
            From Confusion to Clarity
          </h2>
        </div>

        {/* Split Screen */}
        <div className="flex flex-col items-stretch gap-0 overflow-hidden rounded-3xl border border-border bg-white shadow-[0_16px_40px_rgba(15,23,42,0.08)] lg:flex-row">

          {/* BEFORE — Grey/Dull */}
          <div className="relative flex flex-1 flex-col justify-between overflow-hidden bg-slate-50 p-8 lg:p-10">

            <div className="relative z-10">
              <div className="mb-7 inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white/80 px-3 py-1.5">
                <span className="font-manrope text-[10px] font-semibold uppercase tracking-widest text-slate-500">Before Edmarg</span>
              </div>
              <h3 className="font-plus-jakarta mb-7 text-2xl font-bold text-slate-700 lg:text-3xl">Unclear Direction</h3>
              <ul className="space-y-5">
                {BEFORE_LIST.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-4">
                    <div className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-slate-300 bg-slate-200">
                      <X className="h-3 w-3 text-slate-500" strokeWidth={3} />
                    </div>
                    <span className="font-manrope text-sm font-medium leading-relaxed text-slate-600 lg:text-base">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="relative z-10 mt-8 border-t border-slate-300 pt-5">
              <p className="font-manrope text-xs font-semibold uppercase tracking-widest text-slate-500">Feeling: overwhelmed and stuck</p>
            </div>
          </div>

          {/* Divider Arrow */}
          <div className="z-10 flex items-center justify-center bg-white px-2 py-4 lg:w-16 lg:px-0 lg:py-0">
            <div className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-surface-dim shadow-sm">
              <ArrowRight className="h-5 w-5 text-primary" />
            </div>
          </div>

          {/* AFTER — Vibrant/Colorful */}
          <div className="relative flex flex-1 flex-col justify-between overflow-hidden bg-indigo-50/45 p-8 lg:p-10">

            <div className="relative z-10">
              <div className="mb-7 inline-flex items-center gap-2 rounded-lg border border-indigo-200 bg-white/80 px-3 py-1.5">
                <span className="font-manrope text-[10px] font-semibold uppercase tracking-widest text-primary">After Edmarg</span>
              </div>
              <h3 className="font-plus-jakarta mb-7 text-2xl font-bold text-on-surface lg:text-3xl">Clear Career Plan</h3>
              <ul className="space-y-5">
                {AFTER_LIST.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-4">
                    <div className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary">
                      <Check className="h-3 w-3 text-white" strokeWidth={3} />
                    </div>
                    <span className="font-manrope text-sm font-semibold leading-relaxed text-on-surface lg:text-base">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="relative z-10 mt-8 border-t border-indigo-200 pt-5">
              <p className="font-manrope text-xs font-semibold uppercase tracking-widest text-primary">Feeling: empowered and focused</p>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default TransformSection;
