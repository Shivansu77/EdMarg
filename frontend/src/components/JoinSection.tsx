import React from 'react';
import Link from 'next/link';

const JoinSection = () => {
  return (
    <section className="py-20 lg:py-32 bg-surface">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        
        {/* Main CTA Card */}
        <div className="relative w-full bg-gradient-to-br from-primary to-primary-dim rounded-[2.5rem] lg:rounded-[4rem] p-10 lg:p-24 overflow-hidden shadow-ambient text-center">
          
          {/* Subtle Luminous Background Glows */}
          <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-white/10 rounded-full blur-[100px]" />
          <div className="absolute bottom-[-20%] right-[-10%] w-[40%] h-[40%] bg-secondary/10 rounded-full blur-[80px]" />

          <div className="relative z-10 max-w-3xl mx-auto">
            <h2 className="text-[2rem] leading-tight sm:text-[2.5rem] lg:text-[3.5rem] font-extrabold text-on-primary tracking-tight mb-8 font-plus-jakarta">
              Still confused about <br className="hidden sm:block" /> your career?
            </h2>
            
            <p className="text-base lg:text-xl text-on-primary/80 font-manrope mb-12 max-w-2xl mx-auto font-medium">
              Don't navigate the complex world of professional choices alone. Get the clarity you deserve today.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 lg:gap-8 w-full sm:w-auto">
              <Link 
                href="/assessment"
                className="w-full sm:w-auto px-8 lg:px-12 py-4 lg:py-5 bg-white text-primary rounded-[3rem] font-bold text-base lg:text-lg shadow-xl hover:shadow-2xl transition-all transform hover:-translate-y-1 font-manrope"
              >
                Take Career Assessment
              </Link>
              <Link 
                href="/connect"
                className="w-full sm:w-auto px-8 lg:px-12 py-4 lg:py-5 bg-white/10 backdrop-blur-md border border-white/20 text-on-primary rounded-[3rem] font-bold text-base lg:text-lg hover:bg-white/20 transition-all font-manrope"
              >
                Talk to a Mentor
              </Link>
            </div>
          </div>

          {/* Bottom Trust Text */}
          <p className="relative z-10 mt-12 text-[11px] lg:text-xs font-bold text-on-primary/60 uppercase tracking-[0.2em] font-plus-jakarta">
            Free Career Roadmap with every mentor session
          </p>
        </div>

      </div>
    </section>
  );
};

export default JoinSection;
