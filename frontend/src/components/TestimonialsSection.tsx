import React from 'react';
import { Quote } from 'lucide-react';

const TESTIMONIALS = [
  {
    name: 'Priya Sharma',
    outcome: 'Got into Data Science at TCS',
    story: 'I was completely lost after 12th. EdMarg\'s assessment showed me Data Science was my path. Within 5 days I had a clear roadmap.',
    highlight: 'Within 5 days I had a clear roadmap.',
    initial: 'PS',
  },
  {
    name: 'Arjun Mehta',
    outcome: 'Landed UX role at a startup',
    story: 'My mentor at EdMarg helped me build a portfolio in 3 weeks. I went from confused engineering student to confident designer.',
    highlight: 'From confused student to confident designer.',
    initial: 'AM',
  },
  {
    name: 'Sneha Patel',
    outcome: 'Cleared UPSC Prelims',
    story: 'Everyone told me to do MBA. EdMarg helped me realize my true calling was civil services. Best decision of my life.',
    highlight: 'EdMarg helped me realize my true calling.',
    initial: 'SP',
  },
];

const TestimonialsSection = () => {
  return (
    <section id="success-stories" className="overflow-hidden bg-white py-20 lg:py-28 border-t border-gray-100">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        {/* Header */}
        <div className="mb-16 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            Success Stories
          </h2>
          <p className="text-lg text-gray-600">
            Real students who found their career path with EdMarg
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 mb-12">
          {TESTIMONIALS.map((t, idx) => (
            <div key={idx} className="flex flex-col gap-4 rounded-xl border border-gray-200 bg-white p-6 hover:shadow-lg transition-shadow">
              <Quote className="h-6 w-6 text-gray-300" />
              <p className="text-base leading-relaxed text-gray-700">
                {t.story.replace(t.highlight, '')}
                <span className="font-semibold text-gray-900">{t.highlight}</span>
              </p>
              <div className="mt-auto flex items-center gap-3 border-t border-gray-200 pt-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-600 font-semibold text-sm">
                  {t.initial}
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{t.name}</p>
                  <p className="text-xs text-gray-600">{t.outcome}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Video CTA */}
        <div className="relative flex min-h-64 cursor-pointer items-center justify-center overflow-hidden rounded-2xl border border-gray-200 bg-gray-900 px-6 py-12 text-center transition-all hover:shadow-lg">
          <div className="relative z-10 flex max-w-2xl flex-col items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full border border-white/30 bg-white/10 backdrop-blur-sm">
              <svg className="w-6 h-6 fill-white" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>

            <p className="text-xl lg:text-2xl font-bold text-white">
              Watch Student Stories
            </p>

            <p className="text-sm lg:text-base leading-relaxed text-gray-300">
              See how learners improved their career direction through guided assessments and mentor-led action plans.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
