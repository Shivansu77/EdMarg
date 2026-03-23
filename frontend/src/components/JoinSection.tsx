import React from 'react';
import Link from 'next/link';
import { ArrowRight, Sparkles } from 'lucide-react';

const JoinSection = () => {
  return (
    <section className="py-20 lg:py-32 bg-surface">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">

        <div className="relative w-full rounded-3xl p-10 lg:p-20 overflow-hidden text-center"
          style={{background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #06b6d4 100%)'}}>

          {/* Background blobs */}
          <div className="absolute top-[-20%] left-[-10%] w-[40%] h-[40%] rounded-full blur-3xl opacity-30 bg-white" />
          <div className="absolute bottom-[-20%] right-[-10%] w-[40%] h-[40%] rounded-full blur-3xl opacity-20 bg-white" />

          {/* Floating sparkles */}
          <div className="absolute top-8 left-12 opacity-40 animate-float">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div className="absolute bottom-8 right-16 opacity-30 animate-float-delayed">
            <Sparkles className="w-5 h-5 text-white" />
          </div>

          <div className="relative z-10 max-w-3xl mx-auto">
            <p className="text-white/80 text-sm font-bold uppercase tracking-widest mb-4 font-manrope">
              🚀 Start Your Journey Today
            </p>
            <h2 className="text-[2rem] leading-tight sm:text-[2.5rem] lg:text-[3.5rem] font-bold text-white tracking-tight mb-6 font-plus-jakarta">
              Still confused about <br className="hidden sm:block" /> your career?
            </h2>
            <p className="text-base lg:text-lg text-white/85 font-manrope mb-4 max-w-2xl mx-auto">
              Don't navigate the complex world of professional choices alone. Get the clarity you deserve today.
            </p>
            <p className="text-sm font-bold text-white/70 mb-10 font-manrope">
              ⏰ Start your journey today — clarity is one step away
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 lg:gap-6">
              <Link
                href="/assessment"
                className="w-full sm:w-auto px-8 lg:px-10 py-4 bg-white text-[#6366f1] rounded-xl font-bold text-base shadow-lg hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2 font-manrope"
              >
                Take Assessment <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/connect"
                className="w-full sm:w-auto px-8 lg:px-10 py-4 bg-white/10 border-2 border-white/40 text-white rounded-xl font-bold text-base hover:bg-white/20 transition-all duration-300 font-manrope"
              >
                Connect with Mentor
              </Link>
            </div>

            <p className="relative z-10 mt-8 text-sm font-medium text-white/70 font-manrope">
              ✨ Free Career Roadmap with every mentor session
            </p>
          </div>
        </div>

      </div>
    </section>
  );
};

export default JoinSection;
