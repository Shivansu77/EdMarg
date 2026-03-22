import React from 'react';
import { MessageSquareText, Users, Map } from 'lucide-react';

const STATS = [
  { value: "12k+", label: "STUDENTS GUIDED" },
  { value: "8k+", label: "MENTORS LOGGED ON" },
  { value: "5d", label: "AVG PLACEMENT TIME" },
  { value: "87%", label: "SUCCESS RATE" },
];

const STEPS = [
  {
    icon: <MessageSquareText className="w-6 h-6 lg:w-7 lg:h-7" strokeWidth={2.5} />,
    title: "1. Take Assessment",
    description: "Our AI-driven clarity engine analyzes your strengths, interests, and personality.",
  },
  {
    icon: <Users className="w-6 h-6 lg:w-7 lg:h-7" strokeWidth={2.5} />,
    title: "2. Connect with Mentor",
    description: "Get paired with industry experts who have walked the path you're considering.",
  },
  {
    icon: <Map className="w-6 h-6 lg:w-7 lg:h-7" strokeWidth={2.5} />,
    title: "3. Career Direction",
    description: "Receive a personalized 5-year roadmap with actionable steps and resources.",
  },
];

const ResultsSection = () => {
  return (
    <section id="how-it-works" className="py-20 lg:py-32 w-full relative bg-surface overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10 w-full">

        {/* 4 Stat Pills */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-24 lg:mb-32">
          {STATS.map((stat, idx) => (
            <div
              key={idx}
              className="bg-surface-container-lowest shadow-ambient px-6 py-8 lg:px-10 lg:py-10 rounded-[2.5rem] lg:rounded-[3rem] flex flex-col items-center justify-center"
            >
              <div className="text-[2rem] lg:text-[2.5rem] font-bold text-primary font-plus-jakarta tracking-tight leading-none mb-2 text-center">
                {stat.value}
              </div>
              <div className="text-[10px] lg:text-xs font-bold text-on-surface-variant uppercase tracking-widest text-center">
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* How Edmarg Works Header */}
        <div className="text-center max-w-2xl mx-auto mb-16 lg:mb-20">
          <h2 className="text-[2.2rem] md:text-[3rem] font-extrabold text-on-surface tracking-tight mb-4 font-plus-jakarta">
            How Edmarg Works
          </h2>
          <p className="text-base lg:text-lg text-on-surface-variant font-manrope">
            A simple three-step journey to finding your career North Star.
          </p>
        </div>

        {/* 3 Steps */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 relative">
          {STEPS.map((step, idx) => (
            <div
              key={idx}
              className="bg-surface-container-lowest shadow-ambient rounded-[2rem] lg:rounded-[2.5rem] p-8 lg:p-10 flex flex-col items-start relative z-10"
            >
              <div className="w-14 h-14 lg:w-16 lg:h-16 rounded-2xl lg:rounded-3xl bg-primary-container text-primary flex items-center justify-center mb-8">
                {step.icon}
              </div>
              <h3 className="font-bold text-on-surface text-lg lg:text-xl mb-3 tracking-tight font-plus-jakarta">
                {step.title}
              </h3>
              <p className="text-on-surface-variant text-base leading-relaxed font-manrope">
                {step.description}
              </p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};

export default ResultsSection;
