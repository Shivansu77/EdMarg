import React from 'react';

const DOMAINS = [
  {
    icon: "⚙️",
    title: "Engineering",
    description: "Design, develop, and maintain infrastructure, software, and mechanical systems",
  },
  {
    icon: "🏥",
    title: "Medical",
    description: "Healthcare professionals providing patient care and medical services",
  },
  {
    icon: "💼",
    title: "Business",
    description: "Management, finance, entrepreneurship, and corporate leadership",
  },
  {
    icon: "🎨",
    title: "Design",
    description: "Creative design including graphic, UX/UI, and product design",
  },
  {
    icon: "🏛️",
    title: "Government Jobs",
    description: "Public sector roles in administration, policy, and civil service",
  },
  {
    icon: "💻",
    title: "IT / Tech",
    description: "Information technology, software development, and tech innovation",
  },
];

const PATHS = [
  { icon: "🔧", title: "Engineering & Technology", desc: "Build innovative solutions through technology" },
  { icon: "🩺", title: "Medical & Healthcare", desc: "Help people live healthier lives" },
  { icon: "📈", title: "Business & Entrepreneurship", desc: "Create wealth and opportunities" },
  { icon: "🎨", title: "Creative & Design", desc: "Express ideas creatively" },
  { icon: "🏛️", title: "Government & Civil Services", desc: "Improve governance and society" },
  { icon: "🔬", title: "Research & Academia", desc: "Discover and advance knowledge" },
  { icon: "🛠️", title: "Skill-based & Vocational", desc: "Master practical trades and skills" },
];

const CareerDomainsSection = () => {
  return (
    <section className="py-20 md:py-24 px-5 md:px-8 w-full bg-[#FAFAFA] relative overflow-hidden">
      <div className="max-w-7xl mx-auto relative z-10">

        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 bg-white text-gray-500 text-xs font-semibold tracking-wide uppercase px-4 py-1.5 rounded-full border border-gray-200 shadow-sm mb-6">
            <svg className="w-4 h-4 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
            Career Explorer
          </div>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-gray-900 mb-5 leading-tight">
            Explore Career Domains
          </h2>
          <p className="text-gray-500 text-lg md:text-xl leading-relaxed">
            Find your passion across diverse fields. Choose a domain and start your journey.
          </p>
        </div>

        {/* Domain Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-16 md:mb-20">
          {DOMAINS.map((domain, idx) => (
            <div
              key={idx}
              className="bg-white rounded-2xl border border-gray-100 p-6 md:p-8 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer group flex flex-col items-start"
            >
              <div className="w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center text-3xl mb-5 group-hover:scale-110 transition-transform duration-300">
                {domain.icon}
              </div>
              <h3 className="font-bold text-xl text-gray-900 tracking-tight mb-2 group-hover:text-blue-600 transition-colors">
                {domain.title}
              </h3>
              <p className="text-sm md:text-base text-gray-500 leading-relaxed font-normal">
                {domain.description}
              </p>
            </div>
          ))}
        </div>

        {/* Career Paths List - Also Minimalistic */}
        <div className="bg-white rounded-3xl border border-gray-200 shadow-xl shadow-gray-100/50 overflow-hidden max-w-5xl mx-auto">
          <div className="px-6 md:px-10 py-6 md:py-8 border-b border-gray-100 bg-gray-50/50">
            <h3 className="font-bold text-xl md:text-2xl tracking-tight text-gray-900">
              All Career Paths
            </h3>
            <p className="text-gray-500 text-sm md:text-base mt-2">Choose a path that aligns with your interests</p>
          </div>
          <div className="divide-y divide-gray-100">
            {PATHS.map((path, idx) => (
              <div
                key={idx}
                className="px-6 md:px-10 py-5 flex items-center gap-5 hover:bg-gray-50 transition-colors cursor-pointer group"
              >
                <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center text-2xl flex-shrink-0 group-hover:bg-white group-hover:shadow-sm transition-all duration-300">
                  {path.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-base text-gray-900 group-hover:text-blue-600 transition-colors truncate">
                    {path.title}
                  </div>
                  <div className="text-sm text-gray-500 truncate mt-0.5">
                    {path.desc}
                  </div>
                </div>
                <div className="w-8 h-8 rounded-full flex items-center justify-center bg-gray-50 text-gray-400 group-hover:bg-blue-50 group-hover:text-blue-600 group-hover:translate-x-1 transition-all flex-shrink-0">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="9 18 15 12 9 6"></polyline>
                  </svg>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
};

export default CareerDomainsSection;
