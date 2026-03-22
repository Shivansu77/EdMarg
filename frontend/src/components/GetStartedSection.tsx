import React from 'react';

const AVATARS = [
  { src: "https://i.pravatar.cc/150?u=1", size: 48, top: "5%", left: "5%", classes: "flex" },
  { src: "/mentors/samantha.png", size: 56, top: "25%", left: "2%", classes: "hidden sm:flex" },
  { src: "/mentors/natasha.png", size: 64, top: "65%", left: "2%", classes: "flex" },
  { src: "/mentors/omar.png", size: 48, top: "25%", left: "22%", classes: "hidden lg:flex" },
  { src: "https://i.pravatar.cc/150?u=2", size: 48, top: "15%", left: "75%", classes: "hidden lg:flex" },
  { src: "/mentors/annette.png", size: 72, top: "35%", left: "85%", classes: "hidden sm:flex" },
  { src: "https://i.pravatar.cc/150?u=3", size: 56, top: "70%", left: "85%", classes: "flex" },
  { src: "https://i.pravatar.cc/150?u=4", size: 48, top: "80%", left: "65%", classes: "hidden md:flex" },
  { src: "https://i.pravatar.cc/150?u=5", size: 40, top: "8%", left: "85%", classes: "flex" },
];

const SHAPES = [
  // Dot grid 1
  { top: "20%", left: "40%", width: "80px", height: "80px", isPattern: true },
  // Dot grid 2
  { top: "60%", left: "25%", width: "60px", height: "60px", isPattern: true },
];

const GetStartedSection = () => {
  return (
    <section className="relative w-full py-32 md:py-40 overflow-hidden bg-[#FAFAFA] min-h-[500px] flex items-center justify-center border-t border-b border-gray-100">
      
      {/* Subtle Dot Patterns */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-[0.03]">
        <svg fill="currentColor" width="100%" height="100%">
          <defs>
            <pattern id="minimal-dots" x="0" y="0" width="16" height="16" patternUnits="userSpaceOnUse">
              <circle cx="2" cy="2" r="1.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#minimal-dots)" />
        </svg>
      </div>

      {/* Minimalist Floating Avatars */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        {AVATARS.map((avatar, idx) => (
          <div
            key={`avatar-${idx}`}
            className={`absolute rounded-full ring-4 ring-white shadow-sm bg-gray-50 overflow-hidden hover:scale-105 transition-transform duration-300 pointer-events-auto cursor-pointer items-center justify-center opacity-80 hover:opacity-100 ${avatar.classes}`}
            style={{ 
              top: avatar.top, 
              left: avatar.left, 
              width: `${avatar.size}px`, 
              height: `${avatar.size}px`
            }}
          >
            <img src={avatar.src} alt="Mentor Avatar" className="w-full h-full object-cover" />
          </div>
        ))}
      </div>

      {/* Center Content */}
      <div className="relative z-10 max-w-2xl mx-auto px-5 text-center flex flex-col items-center">
        
        <div className="px-4 py-1.5 rounded-full border border-gray-200 bg-white text-gray-500 text-xs font-semibold tracking-wide uppercase mb-8 shadow-sm">
          No credit card required
        </div>

        <h2 className="text-4xl md:text-5xl lg:text-5xl font-bold text-gray-900 tracking-tight mb-5 leading-tight">
          Get started for free in 1 minute
        </h2>
        
        <p className="text-gray-500 text-base md:text-lg mb-12 max-w-xl leading-relaxed">
          We want to help you build an epic career with expert mentors.
          From junior to leadership, we are here to grow with you.
        </p>

        {/* Clean Email Form - Always inline (never collapse on mobile) */}
        <form className="w-full max-w-lg flex flex-row items-stretch p-1.5 bg-white rounded-full border border-gray-200 shadow-xl shadow-gray-100/50 relative transform hover:-translate-y-0.5 transition-transform duration-300">
          <div className="flex-1 flex items-center px-3 sm:px-4 py-2 min-w-0">
            <svg className="w-5 h-5 text-gray-400 mr-2 sm:mr-3 flex-shrink-0 hidden xs:block" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="4" width="20" height="16" rx="2" ry="2"/>
              <path d="m2 4 10 8 10-8"/>
            </svg>
            <input
              type="email"
              placeholder="Enter your email"
              className="w-full bg-transparent border-none outline-none text-gray-800 placeholder-gray-400 text-sm sm:text-base min-w-0 truncate"
              required
            />
          </div>
          <button
            type="submit"
            className="w-auto font-semibold text-white px-5 sm:px-8 py-3 rounded-full bg-gray-900 hover:bg-black transition-colors flex items-center justify-center gap-1.5 sm:gap-2 whitespace-nowrap text-sm sm:text-base flex-shrink-0"
          >
            <span className="hidden xs:inline">Join free now</span>
            <span className="inline xs:hidden">Join</span>
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </button>
        </form>
        
        <p className="text-gray-400 text-xs mt-6 flex items-center gap-1.5">
          <svg className="w-4 h-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>
          Your information is secure.
        </p>

      </div>
    </section>
  );
};

export default GetStartedSection;
