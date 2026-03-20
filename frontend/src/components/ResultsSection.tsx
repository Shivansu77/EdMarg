import React from 'react';

const STATS = [
  {
    value: "10,000+",
    label: "Mentoring Sessions",
    description: "1-on-1 sessions completed across all disciplines",
    color: "bg-[#6B46FF]",
    textColor: "text-white",
    borderColor: "border-gray-900",
  },
  {
    value: "95%",
    label: "Satisfaction Rate",
    description: "Mentees rate their sessions 4.5 stars or higher",
    color: "bg-[#FFD147]",
    textColor: "text-gray-900",
    borderColor: "border-gray-900",
  },
  {
    value: "500+",
    label: "Expert Mentors",
    description: "Vetted professionals from top companies worldwide",
    color: "bg-[#4ADE80]",
    textColor: "text-gray-900",
    borderColor: "border-gray-900",
  },
  {
    value: "50+",
    label: "Countries",
    description: "A truly global community of learners and leaders",
    color: "bg-white",
    textColor: "text-gray-900",
    borderColor: "border-gray-900",
  },
];

const FEATURES = [
  {
    icon: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
        <polyline points="22 4 12 14.01 9 11.01" />
      </svg>
    ),
    title: "Personalized Matching",
    description: "AI-powered mentor matching based on your goals, industry, and learning style.",
  },
  {
    icon: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
    ),
    title: "Flexible Scheduling",
    description: "Book sessions that fit your calendar. Mentors across every timezone.",
  },
  {
    icon: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
    title: "Community Access",
    description: "Join exclusive group sessions, workshops, and networking events.",
  },
];

const ResultsSection = () => {
  return (
    <section className="py-16 md:py-24 px-5 md:px-8 w-full relative overflow-hidden">
      <div className="max-w-7xl mx-auto relative z-10">

        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 md:mb-20">
          <div className="inline-flex items-center gap-2 bg-purple-50 text-[#6B46FF] text-sm font-bold px-4 py-2 rounded-full border-2 border-[#6B46FF] shadow-[3px_3px_0px_rgba(107,70,255,0.3)] mb-6">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M13 2L3 14h9l-1 10 10-12h-9l1-10z"/></svg>
            Why EdMarg
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-6xl font-extrabold tracking-tight mb-4 md:mb-6 leading-[1.1]">
            A platform that delivers{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-500">
              results
            </span>
          </h2>
          <p className="text-gray-600 text-base md:text-xl leading-relaxed">
            Real impact, real numbers. Our mentors have helped thousands
            of professionals achieve their career goals.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-12 md:mb-20">
          {STATS.map((stat, idx) => (
            <div
              key={idx}
              className={`${stat.color} ${stat.textColor} rounded-2xl border-2 ${stat.borderColor} p-5 md:p-8 shadow-[4px_4px_0px_rgba(17,24,39,1)] md:shadow-[5px_5px_0px_rgba(17,24,39,1)] hover:shadow-[2px_2px_0px_rgba(17,24,39,1)] hover:translate-x-[3px] hover:translate-y-[3px] transition-all duration-300 cursor-default`}
            >
              <div className="text-2xl sm:text-3xl md:text-5xl font-extrabold tracking-tight mb-1 md:mb-2">
                {stat.value}
              </div>
              <div className="text-sm md:text-lg font-bold mb-1 md:mb-2 opacity-90">
                {stat.label}
              </div>
              <p className={`text-xs md:text-sm leading-relaxed hidden sm:block ${stat.color === 'bg-white' ? 'text-gray-500' : 'opacity-75'}`}>
                {stat.description}
              </p>
            </div>
          ))}
        </div>

        {/* Features Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-8">
          {FEATURES.map((feature, idx) => (
            <div
              key={idx}
              className="group bg-white rounded-2xl border-2 border-gray-200 p-6 md:p-8 hover:border-gray-900 hover:shadow-[5px_5px_0px_rgba(17,24,39,1)] transition-all duration-300"
            >
              {/* Icon */}
              <div className="w-14 h-14 rounded-xl bg-purple-50 border-2 border-purple-200 flex items-center justify-center text-[#6B46FF] mb-6 group-hover:bg-[#6B46FF] group-hover:text-white group-hover:border-[#6B46FF] transition-all duration-300 shadow-[3px_3px_0px_rgba(107,70,255,0.15)] group-hover:shadow-[3px_3px_0px_rgba(17,24,39,1)]">
                {feature.icon}
              </div>

              <h3 className="font-extrabold text-gray-900 text-xl mb-3 tracking-tight group-hover:text-[#6B46FF] transition-colors">
                {feature.title}
              </h3>
              <p className="text-gray-500 text-sm leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};

export default ResultsSection;
