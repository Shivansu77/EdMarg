import React from 'react';
import { X, Check } from 'lucide-react';

const BEFORE_LIST = [
  "Endless scrolling through job boards",
  "Anxiety about choosing the wrong major",
  "Listening to conflicting advice from peers",
  "Fear of being stuck in a 9-5 you hate",
];

const AFTER_LIST = [
  "Data-backed clarity on your best-fit career",
  "Direct connection with industry-leading mentors",
  "A structured 5-year roadmap for success",
  "Confidence to pursue your true passion",
];

const TransformSection = () => {
  return (
    <section className="py-20 lg:py-32 bg-surface overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        
        {/* Header */}
        <div className="mb-16 lg:mb-24">
          <h2 className="text-[2.2rem] md:text-[3.5rem] font-extrabold text-on-surface tracking-tight font-plus-jakarta leading-tight lg:leading-[1.1]">
            <span className="text-on-surface-variant">The Transformation:</span> <br className="hidden sm:block" />
            From Confusion to Clarity
          </h2>
        </div>

        {/* Comparison Container */}
        <div className="flex flex-col lg:flex-row items-stretch gap-6 lg:gap-0 rounded-[2.5rem] lg:rounded-[4rem] overflow-hidden shadow-ambient">
          
          {/* Before Edmarg */}
          <div className="flex-1 bg-surface-container-low p-8 lg:p-16 flex flex-col justify-between">
            <div>
              <div className="inline-block px-4 py-2 bg-on-surface/5 rounded-full mb-8">
                <span className="text-[11px] lg:text-xs font-bold text-on-surface-variant uppercase tracking-widest font-manrope">Before Edmarg</span>
              </div>
              <h3 className="text-2xl lg:text-3xl font-bold text-on-surface mb-10 font-plus-jakarta">The "Grey Fog" of Indecision</h3>
              <ul className="space-y-6">
                {BEFORE_LIST.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-4">
                    <div className="mt-1 w-5 h-5 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                      <X className="text-red-500 w-3 h-3" strokeWidth={3} />
                    </div>
                    <span className="text-sm lg:text-base text-on-surface-variant font-medium font-manrope leading-relaxed">
                      {item}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="mt-12 pt-8 border-t border-on-surface/5">
              <p className="text-xs lg:text-sm font-bold text-on-surface-variant uppercase tracking-widest font-manrope">Feeling: Overwhelmed & Stuck</p>
            </div>
          </div>

          {/* After Edmarg (The Radiant Path) */}
          <div className="flex-1 bg-surface-container-lowest p-8 lg:p-16 flex flex-col justify-between relative">
            {/* Luminous Glow */}
            <div className="absolute top-0 right-0 w-full h-full bg-primary/5 rounded-full blur-[100px] pointer-events-none" />
            
            <div className="relative z-10">
              <div className="inline-block px-4 py-2 bg-primary/10 rounded-full mb-8">
                <span className="text-[11px] lg:text-xs font-bold text-primary uppercase tracking-widest font-manrope">After Edmarg</span>
              </div>
              <h3 className="text-2xl lg:text-3xl font-bold text-on-surface mb-10 font-plus-jakarta">The Radiant Future</h3>
              <ul className="space-y-6">
                {AFTER_LIST.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-4">
                    <div className="mt-1 w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <Check className="text-primary w-3 h-3" strokeWidth={3} />
                    </div>
                    <span className="text-sm lg:text-base text-on-surface font-semibold font-manrope leading-relaxed">
                      {item}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="relative z-10 mt-12 pt-8 border-t border-primary/10">
              <p className="text-xs lg:text-sm font-bold text-primary uppercase tracking-widest font-manrope">Feeling: Empowered & Focused</p>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};

export default TransformSection;
