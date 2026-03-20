import React from 'react';
import { 
  Settings, HeartPulse, Briefcase, Palette, Landmark, Laptop, Cpu, 
  Activity, TrendingUp, PenTool, Shield, Microscope, Hammer, ChevronRight, Compass
} from 'lucide-react';

const DOMAINS = [
  {
    icon: <Settings className="w-7 h-7" />,
    title: "Engineering",
    description: "Design, develop, and maintain infrastructure, software, and mechanical systems",
    color: "bg-blue-50 text-blue-600",
  },
  {
    icon: <HeartPulse className="w-7 h-7" />,
    title: "Medical",
    description: "Healthcare professionals providing patient care and medical services",
    color: "bg-rose-50 text-rose-600",
  },
  {
    icon: <Briefcase className="w-7 h-7" />,
    title: "Business",
    description: "Management, finance, entrepreneurship, and corporate leadership",
    color: "bg-amber-50 text-amber-600",
  },
  {
    icon: <Palette className="w-7 h-7" />,
    title: "Design",
    description: "Creative design including graphic, UX/UI, and product design",
    color: "bg-purple-50 text-purple-600",
  },
  {
    icon: <Landmark className="w-7 h-7" />,
    title: "Government Jobs",
    description: "Public sector roles in administration, policy, and civil service",
    color: "bg-emerald-50 text-emerald-600",
  },
  {
    icon: <Laptop className="w-7 h-7" />,
    title: "IT / Tech",
    description: "Information technology, software development, and tech innovation",
    color: "bg-cyan-50 text-cyan-600",
  },
];

const PATHS = [
  { icon: <Cpu className="w-6 h-6" />, title: "Engineering & Technology", desc: "Build innovative solutions through technology", color: "text-blue-600 group-hover:bg-blue-600" },
  { icon: <Activity className="w-6 h-6" />, title: "Medical & Healthcare", desc: "Help people live healthier lives", color: "text-rose-600 group-hover:bg-rose-600" },
  { icon: <TrendingUp className="w-6 h-6" />, title: "Business & Entrepreneurship", desc: "Create wealth and opportunities", color: "text-amber-600 group-hover:bg-amber-600" },
  { icon: <PenTool className="w-6 h-6" />, title: "Creative & Design", desc: "Express ideas creatively", color: "text-purple-600 group-hover:bg-purple-600" },
  { icon: <Shield className="w-6 h-6" />, title: "Government & Civil Services", desc: "Improve governance and society", color: "text-emerald-600 group-hover:bg-emerald-600" },
  { icon: <Microscope className="w-6 h-6" />, title: "Research & Academia", desc: "Discover and advance knowledge", color: "text-indigo-600 group-hover:bg-indigo-600" },
  { icon: <Hammer className="w-6 h-6" />, title: "Skill-based & Vocational", desc: "Master practical trades and skills", color: "text-orange-600 group-hover:bg-orange-600" },
];

const CareerDomainsSection = () => {
  return (
    <section className="py-20 md:py-28 px-5 md:px-8 w-full bg-[#FAFAFA] relative overflow-hidden">
      <div className="max-w-7xl mx-auto relative z-10">

        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 bg-white text-gray-600 text-[13px] font-semibold tracking-wider uppercase px-4 py-1.5 rounded-full border border-gray-200 shadow-sm mb-6">
            <Compass className="w-4 h-4 text-gray-400" />
            Career Explorer
          </div>
          <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-gray-900 mb-5 leading-tight">
            Explore Career Domains
          </h2>
          <p className="text-gray-500 text-lg md:text-xl leading-relaxed max-w-2xl mx-auto">
            Find your passion across diverse fields. Choose a domain and start your journey.
          </p>
        </div>

        {/* Domain Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-20 md:mb-24">
          {DOMAINS.map((domain, idx) => (
            <div
              key={idx}
              className="bg-white rounded-2xl border border-gray-100 p-6 md:p-8 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer group flex flex-col items-start"
            >
              <div className={`w-14 h-14 rounded-2xl ${domain.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 ring-4 ring-white shadow-sm`}>
                {domain.icon}
              </div>
              <h3 className="font-bold text-xl text-gray-900 tracking-tight mb-2 group-hover:text-blue-600 transition-colors">
                {domain.title}
              </h3>
              <p className="text-[15px] text-gray-500 leading-relaxed font-normal">
                {domain.description}
              </p>
            </div>
          ))}
        </div>

        {/* Career Paths List */}
        <div className="bg-white rounded-3xl border border-gray-200 shadow-xl shadow-gray-200/40 overflow-hidden max-w-5xl mx-auto">
          <div className="px-6 md:px-10 py-6 md:py-8 border-b border-gray-100 bg-gray-50/80">
            <h3 className="font-bold text-xl md:text-2xl tracking-tight text-gray-900">
              All Career Paths
            </h3>
            <p className="text-gray-500 text-[15px] mt-2">Choose a path that aligns with your interests</p>
          </div>
          <div className="divide-y divide-gray-100">
            {PATHS.map((path, idx) => (
              <div
                key={idx}
                className="px-6 md:px-10 py-5 flex items-center gap-5 hover:bg-gray-50 transition-colors cursor-pointer group"
              >
                <div className={`w-12 h-12 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center flex-shrink-0 group-hover:shadow-md transition-all duration-300 ${path.color.split(' ')[0]} group-hover:text-white ${path.color.split(' ')[1]}`}>
                  {path.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-[16px] text-gray-900 group-hover:text-gray-900 transition-colors truncate">
                    {path.title}
                  </div>
                  <div className="text-[14px] text-gray-500 truncate mt-0.5">
                    {path.desc}
                  </div>
                </div>
                <div className="w-8 h-8 rounded-full flex items-center justify-center bg-white border border-gray-200 text-gray-400 group-hover:bg-white group-hover:border-gray-300 group-hover:text-gray-900 group-hover:translate-x-1 transition-all flex-shrink-0 shadow-sm">
                  <ChevronRight className="w-4 h-4" />
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
