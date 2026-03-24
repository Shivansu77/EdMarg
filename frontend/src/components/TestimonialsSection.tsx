import React from 'react';
import { Play, Quote } from 'lucide-react';

const TESTIMONIALS = [
  {
    name: 'Priya Sharma',
    outcome: 'Got into Data Science at TCS',
    story: 'I was completely lost after 12th. Edmarg\'s assessment showed me Data Science was my path. Within 5 days I had a clear roadmap.',
    highlight: 'Within 5 days I had a clear roadmap.',
    initial: 'PS',
  },
  {
    name: 'Arjun Mehta',
    outcome: 'Landed UX role at a startup',
    story: 'My mentor at Edmarg helped me build a portfolio in 3 weeks. I went from confused engineering student to confident designer.',
    highlight: 'From confused student to confident designer.',
    initial: 'AM',
  },
  {
    name: 'Sneha Patel',
    outcome: 'Cleared UPSC Prelims',
    story: 'Everyone told me to do MBA. Edmarg helped me realize my true calling was civil services. Best decision of my life.',
    highlight: 'Edmarg helped me realize my true calling.',
    initial: 'SP',
  },
];

const TestimonialsSection = () => {
  return (
    <section id="success-stories" className="overflow-hidden bg-white py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">

        {/* Header */}
        <div className="mb-14 text-center">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-border bg-surface-dim px-4 py-2">
            <span className="font-manrope text-xs font-semibold uppercase tracking-widest text-primary">Real Stories</span>
          </div>
          <h2 className="font-plus-jakarta text-[2.1rem] font-extrabold tracking-tight text-on-surface md:text-[2.9rem]">
            Students Who Found Their Path
          </h2>
        </div>

        <div className="mb-10 grid grid-cols-1 gap-5 lg:grid-cols-3">
          {TESTIMONIALS.map((t, idx) => (
            <div key={idx} className="flex flex-col gap-5 rounded-3xl border border-border bg-white p-7 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg">
              <Quote className="h-7 w-7 text-primary/30" />
              <p className="font-manrope text-base leading-relaxed text-on-surface-variant">
                {t.story.replace(t.highlight, '')}
                <span className="font-semibold text-on-surface">{t.highlight}</span>
              </p>
              <div className="mt-auto flex items-center gap-3 border-t border-border pt-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-full border border-border bg-surface-dim">
                  <span className="font-manrope text-xs font-semibold text-on-surface">{t.initial}</span>
                </div>
                <div>
                  <p className="font-plus-jakarta font-semibold text-on-surface">{t.name}</p>
                  <p className="font-manrope text-xs text-on-surface-variant">{t.outcome}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Video Testimonial Placeholder */}
        <div className="group relative flex min-h-75 cursor-pointer items-center justify-center overflow-hidden rounded-3xl border border-border bg-linear-to-br from-slate-950 via-slate-900 to-slate-950 px-6 py-10 text-center transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl md:min-h-80">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute -left-12 top-8 h-48 w-48 rounded-full bg-indigo-500/25 blur-3xl" />
            <div className="absolute -right-10 bottom-6 h-52 w-52 rounded-full bg-cyan-400/15 blur-3xl" />
          </div>

          <div className="relative z-10 flex max-w-2xl flex-col items-center gap-4">
            <div className="flex h-20 w-20 items-center justify-center rounded-full border border-white/30 bg-white/10 backdrop-blur-sm transition-transform duration-300 group-hover:scale-105">
              <Play className="ml-1 h-8 w-8 fill-white text-white" />
            </div>

            <p className="font-plus-jakarta text-xl font-bold tracking-tight text-white md:text-2xl">
              Watch Student Stories
            </p>

            <p className="font-manrope max-w-xl text-sm leading-relaxed text-white/80 md:text-base">
              See how learners improved their career direction through guided assessments and mentor-led action plans.
            </p>

            <span className="font-manrope mt-1 inline-flex items-center rounded-full border border-white/25 bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-white/90">
              Play Testimonials
            </span>
          </div>
        </div>

      </div>
    </section>
  );
};

export default TestimonialsSection;
