import React from 'react';
import Link from 'next/link';

const JoinSection = () => {
  return (
    <section className="py-20 px-8 w-full max-w-7xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Student/Mentee CTA Card */}
        <div className="bg-gradient-to-br from-purple-50 to-indigo-50 border border-purple-100 rounded-3xl p-10 md:p-14 flex flex-col items-start shadow-sm transition-shadow hover:shadow-md relative overflow-hidden group">
          {/* Decorative background circle */}
          <div className="absolute -right-20 -top-20 w-64 h-64 bg-purple-200 rounded-full mix-blend-multiply opacity-50 blur-3xl group-hover:bg-purple-300 transition-colors duration-500"></div>
          
          <div className="relative z-10 w-full">
            <h3 className="text-3xl font-extrabold text-gray-900 mb-4 tracking-tight">
              Ready to accelerate your career?
            </h3>
            <p className="text-gray-600 mb-8 text-lg leading-relaxed max-w-md">
              Book a 1-on-1 session with a world-class mentor. Get personalized guidance, resume reviews, 
              and mock interviews to land your dream job faster.
            </p>
            <div className="mt-auto pt-4">
              <Link
                href="/mentors"
                className="inline-flex items-center gap-2 px-8 py-4 bg-[#6B46FF] text-white font-semibold rounded-full hover:bg-[#5835ea] transition-all transform hover:-translate-y-1 shadow-[0_8px_16px_rgba(107,70,255,0.25)]"
              >
                Find a Mentor
                <span className="text-xl leading-none">&rarr;</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Expert/Mentor CTA Card */}
        <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-100 rounded-3xl p-10 md:p-14 flex flex-col items-start shadow-sm transition-shadow hover:shadow-md relative overflow-hidden group">
          {/* Decorative background circle */}
          <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-emerald-200 rounded-full mix-blend-multiply opacity-50 blur-3xl group-hover:bg-emerald-300 transition-colors duration-500"></div>
          
          <div className="relative z-10 w-full">
            <h3 className="text-3xl font-extrabold text-gray-900 mb-4 tracking-tight">
              Share your expertise.
            </h3>
            <p className="text-gray-600 mb-8 text-lg leading-relaxed max-w-md">
              Become a mentor and help the next generation of talent succeed. Build your personal brand,
              give back to the community, and gain fresh perspectives.
            </p>
            <div className="mt-auto pt-4">
              <Link
                href="/apply-mentor"
                className="inline-flex items-center gap-2 px-8 py-4 bg-gray-900 text-white font-semibold rounded-full hover:bg-black transition-all transform hover:-translate-y-1 shadow-[0_8px_16px_rgba(0,0,0,0.15)]"
              >
                Become a Mentor
                <span className="text-xl leading-none">&rarr;</span>
              </Link>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};

export default JoinSection;
