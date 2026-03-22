import React from 'react';
import Link from 'next/link';

const JoinSection = () => {
  return (
    <section className="py-20 lg:py-32 bg-surface">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        
        {/* Main CTA Card */}
        <div className="relative w-full bg-primary rounded-xl p-10 lg:p-20 overflow-hidden shadow-sm border border-border text-center">
          
          <div className="relative z-10 max-w-3xl mx-auto">
            <h2 className="text-[2rem] leading-tight sm:text-[2.5rem] lg:text-[3.5rem] font-bold text-on-primary tracking-tight mb-6 font-plus-jakarta">
              Still confused about <br className="hidden sm:block" /> your career?
            </h2>
            
            <p className="text-base lg:text-lg text-on-primary/90 font-manrope mb-10 max-w-2xl mx-auto">
              Don't navigate the complex world of professional choices alone. Get the clarity you deserve today.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 lg:gap-6 w-full sm:w-auto">
              <Link 
                href="/assessment"
                className="w-full sm:w-auto px-8 lg:px-10 py-3.5 bg-on-primary text-primary rounded-md font-medium text-base shadow-sm hover:bg-on-primary/90 transition-colors font-manrope"
              >
                Take Career Assessment
              </Link>
              <Link 
                href="/connect"
                className="w-full sm:w-auto px-8 lg:px-10 py-3.5 bg-primary border border-on-primary/30 text-on-primary rounded-md font-medium text-base hover:bg-primary-dim transition-colors font-manrope"
              >
                Talk to a Mentor
              </Link>
            </div>
          </div>

          {/* Bottom Trust Text */}
          <p className="relative z-10 mt-10 text-sm font-medium text-on-primary/80 font-manrope">
            Free Career Roadmap with every mentor session.
          </p>
        </div>

      </div>
    </section>
  );
};

export default JoinSection;
