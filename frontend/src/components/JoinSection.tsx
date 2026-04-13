import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

const JoinSection = () => {
  return (
    <section className="relative overflow-hidden bg-linear-to-b from-white to-emerald-50/35 py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="relative w-full overflow-hidden rounded-[2.5rem] border border-emerald-400 bg-linear-to-br from-emerald-600 via-emerald-500 to-green-600 p-10 text-center shadow-[0_20px_60px_rgba(16,185,129,0.3)] lg:p-20">
          
          {/* Background Accents for the card */}
          <div className="absolute top-0 right-0 -mt-20 -mr-20 h-64 w-64 rounded-full bg-white/10 blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 -mb-20 -ml-20 h-64 w-64 rounded-full bg-green-300/20 blur-3xl pointer-events-none" />

          <div className="relative z-10 mx-auto max-w-3xl animate-fade-up">
            <h2 className="text-3xl lg:text-5xl font-extrabold text-white mb-6 tracking-tight drop-shadow-sm">
              Still confused about your career?
            </h2>
            <p className="text-lg text-emerald-50 mb-10 max-w-2xl mx-auto font-medium">
              Don&apos;t navigate the complex world of professional choices alone. Get the clarity you deserve today with our AI roadmap and expert mentors.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
              <Link
                href="/assessment"
                className="group flex items-center justify-center gap-2 rounded-full bg-white hover:bg-emerald-50 px-8 py-3.5 text-base font-bold text-emerald-900 transition-all shadow-[0_8px_20px_rgba(0,0,0,0.1)] hover:shadow-[0_12px_25px_rgba(0,0,0,0.15)] w-full sm:w-auto"
              >
                Take Assessment <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                href="/browse-mentors"
                className="w-full sm:w-auto rounded-full border border-emerald-300/50 bg-white/10 hover:bg-white/20 backdrop-blur-sm px-8 py-3.5 text-base font-bold text-white transition-colors"
              >
                Connect with Mentor
              </Link>
            </div>

            <p className="text-sm font-semibold text-emerald-100/80 uppercase tracking-widest">
              Free career roadmap with every mentor session
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default JoinSection;
