import React from 'react';
import Link from 'next/link';
import { ArrowRight, Sparkles } from 'lucide-react';

const JoinSection = () => {
  return (
    <section className="overflow-hidden bg-white py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">

        <div className="relative w-full overflow-hidden rounded-3xl border border-border bg-surface p-10 text-center shadow-[0_14px_40px_rgba(15,23,42,0.08)] lg:p-16">

          <div className="pointer-events-none absolute -left-16 top-0 h-48 w-48 rounded-full bg-slate-200/40 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-16 right-0 h-52 w-52 rounded-full bg-indigo-100/55 blur-3xl" />

          <div className="absolute left-10 top-8 opacity-60">
            <Sparkles className="h-5 w-5 text-primary" />
          </div>

          <div className="relative z-10 mx-auto max-w-3xl">
            <p className="font-manrope mb-4 text-sm font-semibold uppercase tracking-widest text-primary">
              Start your journey today
            </p>
            <h2 className="font-plus-jakarta mb-5 text-[2rem] font-extrabold leading-tight tracking-tight text-on-surface sm:text-[2.5rem] lg:text-[3.1rem]">
              Still confused about <br className="hidden sm:block" /> your career?
            </h2>
            <p className="font-manrope mx-auto mb-4 max-w-2xl text-base text-on-surface-variant lg:text-lg">
              Don&apos;t navigate the complex world of professional choices alone. Get the clarity you deserve today.
            </p>
            <p className="font-manrope mb-10 text-sm font-medium text-on-surface-variant">
              Clarity is one step away.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 lg:gap-6">
              <Link
                href="/assessment"
                className="font-manrope flex w-full items-center justify-center gap-2 rounded-xl bg-on-surface px-8 py-3.5 text-base font-semibold text-white transition-colors hover:bg-slate-800 sm:w-auto"
              >
                Take Assessment <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/connect"
                className="font-manrope w-full rounded-xl border border-border bg-white px-8 py-3.5 text-base font-semibold text-on-surface transition-colors hover:bg-surface-dim sm:w-auto"
              >
                Connect with Mentor
              </Link>
            </div>

            <p className="font-manrope relative z-10 mt-8 text-sm font-medium text-on-surface-variant">
              Free career roadmap with every mentor session
            </p>
          </div>
        </div>

      </div>
    </section>
  );
};

export default JoinSection;
