import React from 'react';
import { Quote, Play } from 'lucide-react';

const TESTIMONIALS = [
  {
    name: 'Priya Sharma',
    outcome: 'Got into Data Science at TCS',
    story: 'I was completely lost after 12th. Edmarg\'s assessment showed me Data Science was my path. Within 5 days I had a clear roadmap.',
    highlight: 'Within 5 days I had a clear roadmap.',
    avatar: '👩‍💻',
    color: '#6366f1',
  },
  {
    name: 'Arjun Mehta',
    outcome: 'Landed UX role at a startup',
    story: 'My mentor at Edmarg helped me build a portfolio in 3 weeks. I went from confused engineering student to confident designer.',
    highlight: 'From confused student to confident designer.',
    avatar: '👨‍🎨',
    color: '#8b5cf6',
  },
  {
    name: 'Sneha Patel',
    outcome: 'Cleared UPSC Prelims',
    story: 'Everyone told me to do MBA. Edmarg helped me realize my true calling was civil services. Best decision of my life.',
    highlight: 'Edmarg helped me realize my true calling.',
    avatar: '👩‍⚖️',
    color: '#10b981',
  },
];

const TestimonialsSection = () => {
  return (
    <section id="success-stories" className="py-20 lg:py-32 overflow-hidden"
      style={{background: 'linear-gradient(180deg, #f8faff 0%, #ffffff 100%)'}}>
      <div className="max-w-7xl mx-auto px-6 lg:px-8">

        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#eef2ff] border border-[#6366f1]/20 mb-6">
            <span className="text-xs font-bold text-[#6366f1] uppercase tracking-widest">Real Stories</span>
          </div>
          <h2 className="text-[2.2rem] md:text-[3rem] font-extrabold text-on-surface tracking-tight font-plus-jakarta">
            Students Who Found Their <span className="gradient-text">Path</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
          {TESTIMONIALS.map((t, idx) => (
            <div key={idx} className="bg-white rounded-3xl p-8 glow-card transition-all duration-300 hover:scale-105 hover:-translate-y-1 flex flex-col gap-5">
              <Quote className="w-8 h-8 opacity-20" style={{color: t.color}} />
              <p className="text-on-surface-variant font-manrope text-base leading-relaxed">
                {t.story.replace(t.highlight, '')}
                <span className="font-bold" style={{color: t.color}}>{t.highlight}</span>
              </p>
              <div className="mt-auto pt-5 border-t border-gray-100 flex items-center gap-4">
                <div className="w-12 h-12 rounded-full flex items-center justify-center text-2xl border-2"
                  style={{borderColor: `${t.color}40`, background: `${t.color}10`}}>
                  {t.avatar}
                </div>
                <div>
                  <p className="font-bold text-on-surface font-plus-jakarta">{t.name}</p>
                  <p className="text-xs font-semibold font-manrope" style={{color: t.color}}>{t.outcome}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Video Testimonial Placeholder */}
        <div className="relative rounded-3xl overflow-hidden flex items-center justify-center cursor-pointer group transition-all duration-300 hover:scale-[1.01]"
          style={{
            height: '280px',
            background: 'linear-gradient(135deg, #1e1b4b, #312e81, #4c1d95)',
          }}>
          <div className="absolute inset-0 opacity-10"
            style={{backgroundImage: 'radial-gradient(circle at 30% 50%, #6366f1, transparent), radial-gradient(circle at 70% 50%, #8b5cf6, transparent)'}} />
          <div className="relative z-10 flex flex-col items-center gap-4">
            <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border-2 border-white/40 group-hover:scale-110 transition-transform duration-300">
              <Play className="w-8 h-8 text-white fill-white ml-1" />
            </div>
            <p className="text-white font-bold text-lg font-plus-jakarta">Watch Student Stories</p>
            <p className="text-white/60 text-sm font-manrope">See how Edmarg changed their lives</p>
          </div>
        </div>

      </div>
    </section>
  );
};

export default TestimonialsSection;
