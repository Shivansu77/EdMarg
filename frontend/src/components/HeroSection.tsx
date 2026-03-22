'use client';

import React, { useState } from 'react';

export default function HeroSection() {
  const [view, setView] = useState<'mentee' | 'mentor'>('mentee');

  // Realistic portrait placeholders from Unsplash
  const portraits = [
    { src: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80', className: 'hidden lg:block top-10 left-0 w-24 object-cover h-32 rounded-xl opacity-30 shadow-sm transition-transform hover:-translate-y-1' },
    { src: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=200&q=80', className: 'hidden md:block top-16 left-[10%] lg:left-[8%] w-28 object-cover h-36 rounded-xl shadow-lg transition-transform hover:-translate-y-1' },
    { src: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&w=200&q=80', className: 'hidden sm:block top-8 left-[20%] lg:left-[17%] w-32 object-cover h-40 rounded-xl shadow-md transition-transform hover:-translate-y-1' },
    
    { src: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=200&q=80', className: 'hidden sm:block bottom-10 left-[5%] lg:left-[2%] w-32 object-cover h-40 rounded-xl shadow-md transition-transform hover:-translate-y-1' },
    { src: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80', className: 'hidden md:block bottom-4 left-[18%] lg:left-[12%] w-28 object-cover h-36 rounded-xl shadow-lg transition-transform hover:-translate-y-1' },

    { src: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80', className: 'hidden sm:block top-8 right-[20%] lg:right-[17%] w-32 object-cover h-40 rounded-xl shadow-md transition-transform hover:-translate-y-1' },
    { src: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=200&q=80', className: 'hidden md:block top-16 right-[10%] lg:right-[8%] w-28 object-cover h-36 rounded-xl shadow-lg transition-transform hover:-translate-y-1' },
    { src: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&w=200&q=80', className: 'hidden lg:block top-10 right-0 w-24 object-cover h-32 rounded-xl opacity-30 shadow-sm transition-transform hover:-translate-y-1' },
    
    { src: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80', className: 'hidden sm:block bottom-10 right-[5%] lg:right-[2%] w-32 object-cover h-40 rounded-xl shadow-md transition-transform hover:-translate-y-1' },
    { src: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80', className: 'hidden md:block bottom-4 right-[18%] lg:right-[12%] w-28 object-cover h-36 rounded-xl shadow-lg transition-transform hover:-translate-y-1' },
  ];

  return (
    <section className="relative w-full overflow-hidden bg-[#FDFBF7] py-16 md:py-24 pt-4">
      {/* Container */}
      <div className="max-w-7xl mx-auto px-6 lg:px-8 relative min-h-[500px] flex flex-col items-center justify-center">
        
        {/* Toggle */}
        <div className="flex items-center gap-8 mb-16 relative z-10 font-semibold text-lg">
          <button
            onClick={() => setView('mentee')}
            className={`pb-2 outline-none transition-colors border-b-[3px] ${
              view === 'mentee' ? 'text-teal-700 border-teal-600' : 'text-gray-400 border-transparent hover:text-gray-600'
            }`}
          >
            Mentee
          </button>
          <button
            onClick={() => setView('mentor')}
            className={`pb-2 outline-none transition-colors border-b-[3px] ${
              view === 'mentor' ? 'text-teal-700 border-teal-600' : 'text-gray-400 border-transparent hover:text-gray-600'
            }`}
          >
            Mentor
          </button>
        </div>

        {/* Portraits Background Layer */}
        <div className="absolute inset-0 pointer-events-none">
          {portraits.map((img, idx) => (
            <img 
              key={idx} 
              src={img.src} 
              alt="Mentor portrait" 
              className={`absolute ${img.className} z-0`}
              loading="lazy"
            />
          ))}
          {/* Gradient Edges to softly fade outer portraits */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#FDFBF7] via-transparent to-[#FDFBF7] pointer-events-none md:via-transparent lg:w-[20%] lg:left-0"></div>
          <div className="absolute inset-0 bg-gradient-to-l from-[#FDFBF7] via-transparent to-[#FDFBF7] pointer-events-none md:via-transparent lg:w-[20%] lg:right-0 ml-auto"></div>
        </div>

        {/* Main Content */}
        <div className="relative z-10 flex flex-col items-center text-center max-w-2xl bg-[#FDFBF7]/80 backdrop-blur-[2px] p-6 rounded-3xl">
          {view === 'mentee' ? (
            <>
              <h1 className="text-4xl md:text-5xl lg:text-[64px] font-extrabold text-[#0B2545] tracking-tight leading-[1.1] mb-6">
                Reach your goals faster with expert mentors
              </h1>
              <p className="text-lg md:text-xl text-[#3A506B] mb-10 max-w-xl">
                Accelerate your professional growth with 1:1 expert guidance of <span className="font-bold text-[#0B2545]">37,238+</span> mentors in our community.
              </p>
              
              {/* Search Bar */}
              <div className="w-full max-w-lg relative bg-white rounded-full shadow-[0px_8px_24px_rgba(0,0,0,0.08)] flex items-center p-2 border border-gray-100 transition-all focus-within:ring-2 focus-within:ring-teal-500 overflow-hidden">
                <div className="pl-4 pr-2 text-teal-600">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                  </svg>
                </div>
                <input 
                  type="text" 
                  placeholder="What do you want to get better at?" 
                  className="w-full py-3 px-2 bg-transparent outline-none text-gray-700 placeholder-gray-400 font-medium text-base"
                />
              </div>
            </>
          ) : (
            <>
              <h1 className="text-4xl md:text-5xl lg:text-[64px] font-extrabold text-[#0B2545] tracking-tight leading-[1.1] mb-6">
                Your next chapter, made possible by mentoring
              </h1>
              <p className="text-lg md:text-xl text-[#3A506B] mb-10 max-w-xl">
                Build confidence as a leader, grow your network, and define your legacy.
              </p>
              <button className="bg-[#FF4A6B] hover:bg-[#E8395B] text-white px-8 py-4 rounded-xl font-bold text-lg shadow-[0px_8px_16px_rgba(255,74,107,0.3)] transition-transform hover:-translate-y-1">
                Become a Mentor
              </button>
            </>
          )}
        </div>

      </div>

      {/* Trusted Logos Section */}
      <div className="mt-16 sm:mt-24 text-center px-4 max-w-6xl mx-auto relative z-10">
        <p className="text-sm md:text-base text-[#3A506B] font-semibold mb-8">
          Proven success with 20,000+ top organizations
        </p>
        
        <div className="flex flex-wrap justify-center items-center gap-x-8 gap-y-6 md:gap-x-12 lg:gap-x-16 grayscale opacity-80">
          {/* Logo placeholders with text stylized identically */}
          <div className="flex items-center gap-2 text-2xl font-bold tracking-tighter text-[#FD5C63]">
            <svg viewBox="0 0 32 32" className="w-8 h-8 fill-current"><path d="M16 2.667C16 2.667 4.14 12.062 4.14 19.467c0 5.6 5.485 10.133 11.86 10.133 6.375 0 11.86-4.533 11.86-10.133C27.86 12.062 16 2.667 16 2.667zM16 26.667a7.2 7.2 0 110-14.4 7.2 7.2 0 010 14.4z"/></svg>
            airbnb
          </div>
          <div className="flex items-center gap-1 text-2xl font-bold tracking-tight text-[#FD297B]">
            tinder
          </div>
          <div className="flex items-center text-2xl font-bold tracking-tighter">
            <span className="text-[#4285F4]">G</span><span className="text-[#EA4335]">o</span><span className="text-[#FBBC05]">o</span><span className="text-[#4285F4]">g</span><span className="text-[#34A853]">l</span><span className="text-[#EA4335]">e</span>
          </div>
          <div className="flex items-center text-2xl font-bold tracking-tighter text-black">
            amazon
          </div>
          <div className="flex items-center gap-1 text-2xl font-bold tracking-tight text-[#9146FF]">
            twitch
          </div>
          <div className="flex items-center text-2xl font-bold tracking-tighter text-[#635BFF]">
            stripe
          </div>
          <div className="flex items-center text-2xl font-bold tracking-tighter text-[#0052FF]">
            coinbase
          </div>
        </div>
      </div>
    </section>
  );
}
