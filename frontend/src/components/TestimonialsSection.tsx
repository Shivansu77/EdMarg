import React from 'react';
import { Quote, Star, Play, ArrowRight, CheckCircle2 } from 'lucide-react';
import Image from 'next/image';

const TESTIMONIALS = [
  {
    name: 'Priya Sharma',
    outcome: 'Got into Data Science at TCS',
    role: 'Recent Graduate',
    story: "I was completely lost after 12th. EdMarg's assessment showed me Data Science was my path. Within 5 days I had a clear roadmap.",
    highlight: 'Within 5 days I had a clear roadmap.',
    initial: 'PS',
    avatarBg: 'bg-indigo-100/80',
    avatarText: 'text-indigo-600',
  },
  {
    name: 'Arjun Mehta',
    outcome: 'Landed UX role at a startup',
    role: 'Engineering Student',
    story: "My mentor at EdMarg helped me build a portfolio in 3 weeks. I went from a confused engineering student to a confident designer.",
    highlight: 'confused engineering student to a confident designer.',
    initial: 'AM',
    avatarBg: 'bg-emerald-100/80',
    avatarText: 'text-emerald-700',
  },
  {
    name: 'Sneha Patel',
    outcome: 'Cleared UPSC Prelims',
    role: 'Aspiring Civil Servant',
    story: 'Everyone told me to do my MBA. EdMarg helped me realize my true calling was civil services. Best decision of my life.',
    highlight: 'Best decision of my life.',
    initial: 'SP',
    avatarBg: 'bg-rose-100/80',
    avatarText: 'text-rose-600',
  },
];

const TestimonialsSection = () => {
  return (
    <section id="success-stories" className="relative overflow-hidden bg-zinc-50/50 py-24 lg:py-32">
      {/* Background decorations */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-zinc-200 to-transparent"></div>
      <div className="absolute -left-40 top-40 w-96 h-96 bg-indigo-50 rounded-full blur-3xl opacity-50 mix-blend-multiply"></div>
      <div className="absolute right-0 top-1/2 w-96 h-96 bg-blue-50 rounded-full blur-3xl opacity-50 mix-blend-multiply"></div>

      <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
        
        {/* Header */}
        <div className="mb-16 md:mb-24 flex flex-col items-center text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-zinc-200 shadow-sm mb-6">
            <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
            <span className="text-xs font-semibold text-zinc-700 uppercase tracking-widest">Success Stories</span>
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-zinc-900 tracking-tight leading-tight mb-6 max-w-2xl">
            Real students who found their career path with EdMarg.
          </h2>
          <p className="text-lg md:text-xl text-zinc-500 max-w-2xl leading-relaxed">
            Don't just take our word for it. See how learners improved their career direction through guided assessments and mentor-led action plans.
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 mb-16">
          {TESTIMONIALS.map((t, idx) => (
            <div 
              key={idx} 
              className="group relative flex flex-col rounded-3xl border border-zinc-200/80 bg-white p-8 shadow-sm hover:shadow-xl hover:shadow-indigo-500/5 hover:-translate-y-1 transition-all duration-300"
            >
              {/* Stars */}
              <div className="flex items-center gap-1 mb-6">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                ))}
              </div>

              {/* Quote text */}
              <div className="flex-1 relative">
                <Quote className="absolute -top-2 -left-3 h-8 w-8 text-indigo-50 opacity-50 transform -scale-x-100" />
                <p className="relative z-10 text-base lg:text-lg leading-relaxed text-zinc-600 font-medium">
                  "{t.story.replace(t.highlight, '')}
                  <span className="text-zinc-900 font-bold bg-indigo-50/50 rounded">{t.highlight}</span>"
                </p>
              </div>

              {/* Author Footer */}
              <div className="mt-8 flex items-center gap-4 pt-6 border-t border-zinc-100">
                <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${t.avatarBg} ${t.avatarText} font-bold tracking-wide ring-4 ring-white shadow-sm`}>
                  {t.initial}
                </div>
                <div className="flex flex-col">
                  <p className="font-bold text-zinc-900 flex items-center gap-1.5">
                    {t.name}
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  </p>
                  <p className="text-xs font-semibold text-indigo-600 mt-0.5">{t.outcome}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Deep CTA / Video Prompt */}
        <div className="relative overflow-hidden rounded-3xl bg-zinc-900 px-6 py-16 sm:px-12 sm:py-20 lg:p-24 shadow-2xl group">
          {/* Background effects for the dark card */}
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 mix-blend-overlay"></div>
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-indigo-500 rounded-full blur-3xl opacity-20 group-hover:bg-indigo-400 transition-colors duration-700"></div>
          <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-blue-500 rounded-full blur-3xl opacity-20 group-hover:bg-blue-400 transition-colors duration-700"></div>

          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-10 md:gap-16 max-w-5xl mx-auto">
            <div className="flex-1 text-center md:text-left">
              <h3 className="text-3xl sm:text-4xl font-bold text-white tracking-tight leading-tight mb-4">
                Watch Student Stories
              </h3>
              <p className="text-lg text-zinc-400 max-w-lg mx-auto md:mx-0">
                Dive deeper into our video library and see real transformations from confused students to confident professionals.
              </p>
            </div>
            
            <div className="shrink-0">
              <button className="group/btn relative inline-flex items-center justify-center gap-3 rounded-full bg-white px-8 py-4 text-base font-semibold text-zinc-900 transition-all hover:bg-zinc-50 hover:scale-105 active:scale-95 shadow-[0_0_40px_rgba(255,255,255,0.1)] hover:shadow-[0_0_60px_rgba(255,255,255,0.2)]">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-900/10 text-zinc-900 transition-transform group-hover/btn:bg-zinc-900 group-hover/btn:text-white">
                  <Play className="h-4 w-4 ml-0.5 fill-current" />
                </div>
                Play the video
              </button>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};

export default TestimonialsSection;
