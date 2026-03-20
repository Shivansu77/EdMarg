import React from 'react';

const MOCK_MENTORS = [
  {
    id: 1,
    name: "Natasha Bagdona",
    flag: "🇬🇧",
    role: "Senior UX / UI Designer",
    company: "Freelance",
    sessions: 120,
    reviews: 8,
    experience: "10 years",
    attendance: "100%",
    image: "/mentors/natasha.png",
    tags: [{ type: "asap", label: "Available ASAP" }]
  },
  {
    id: 2,
    name: "OMAR ELNABALAWY",
    flag: "🇸🇦",
    role: "Senior Product Designer",
    company: "Master Works | Riyadh",
    sessions: 126,
    reviews: 0,
    experience: "7 years",
    attendance: "100%",
    image: "/mentors/omar.png",
    tags: [{ type: "asap", label: "Available ASAP" }]
  },
  {
    id: 3,
    name: "Annette Hartman",
    flag: "🇺🇸",
    role: "Art Director and UI/UX & Visual Design Specialist",
    company: "Omaha Victor...",
    sessions: 104,
    reviews: 9,
    experience: "19 years",
    attendance: "99%",
    image: "/mentors/annette.png",
    tags: [
      { type: "asap_dark", label: "⚡" }, 
      { type: "advance", label: "Advance" }
    ]
  },
  {
    id: 4,
    name: "Ney Batista",
    flag: "🇸🇬",
    role: "Product Manager, Program Manager, Project Manager",
    company: "at...",
    sessions: 77,
    reviews: 1,
    experience: "14 years",
    attendance: "100%",
    image: "/mentors/ney.png",
    tags: [
      { type: "asap_dark", label: "⚡" }, 
      { type: "advance", label: "Advance" }
    ]
  }
];

const TopMentorsSection = () => {
  return (
    <section className="py-24 px-8 w-full bg-[#FDFBF7] relative overflow-hidden">
      {/* Decorative background blobs */}
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply opacity-30 blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-yellow-200 rounded-full mix-blend-multiply opacity-30 blur-3xl pointer-events-none"></div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header Row */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-8">
          <div className="max-w-2xl">
            <h2 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-5 leading-[1.1]">
              Discover the world&apos;s{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-500">
                top mentors
              </span>
            </h2>
            <p className="text-gray-600 text-lg md:text-xl leading-relaxed">
              Connect with top-rated experts in design, engineering, products, and more. 
              Level up your career with personalized 1-on-1 guidance.
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <button className="px-7 py-3 text-sm font-bold text-gray-900 bg-white border-2 border-gray-900 rounded-full hover:bg-gray-900 hover:text-white transition-all shadow-[3px_3px_0px_rgba(17,24,39,1)] hover:shadow-[1px_1px_0px_rgba(17,24,39,1)] hover:translate-x-[2px] hover:translate-y-[2px]">
              Explore all
            </button>
            <div className="flex gap-2">
              <button className="w-11 h-11 flex items-center justify-center border-2 border-gray-900 rounded-full text-gray-900 bg-white hover:bg-[#6B46FF] hover:text-white hover:border-[#6B46FF] transition-all shadow-[3px_3px_0px_rgba(17,24,39,1)] hover:shadow-[1px_1px_0px_rgba(17,24,39,1)] hover:translate-x-[2px] hover:translate-y-[2px]">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
              </button>
              <button className="w-11 h-11 flex items-center justify-center border-2 border-gray-900 rounded-full text-gray-900 bg-white hover:bg-[#6B46FF] hover:text-white hover:border-[#6B46FF] transition-all shadow-[3px_3px_0px_rgba(17,24,39,1)] hover:shadow-[1px_1px_0px_rgba(17,24,39,1)] hover:translate-x-[2px] hover:translate-y-[2px]">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
              </button>
            </div>
          </div>
        </div>

        {/* Mentors Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-7">
          {MOCK_MENTORS.map((mentor) => (
            <div 
              key={mentor.id} 
              className="group bg-white rounded-2xl border-2 border-gray-900 shadow-[5px_5px_0px_rgba(17,24,39,1)] hover:shadow-[2px_2px_0px_rgba(17,24,39,1)] hover:translate-x-[3px] hover:translate-y-[3px] transition-all duration-300 flex flex-col cursor-pointer overflow-hidden"
            >
              {/* Image Container with Hover Action */}
              <div className="relative w-full aspect-[4/4.5] overflow-hidden border-b-2 border-gray-900">
                <img 
                  src={mentor.image} 
                  alt={mentor.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                />
                
                {/* Overlay Gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-70 group-hover:opacity-40 transition-opacity"></div>

                {/* Action Button - Shows on Hover */}
                <div className="absolute inset-0 flex items-center justify-center translate-y-8 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-300">
                  <button className="bg-[#6B46FF] text-white font-bold px-7 py-3 rounded-full border-2 border-gray-900 shadow-[3px_3px_0px_rgba(17,24,39,1)] hover:bg-[#5835ea] transition-all transform hover:scale-105">
                    Book Session
                  </button>
                </div>

                {/* Status Tags Overlay */}
                <div className="absolute bottom-3 left-3 right-3 flex gap-2">
                  {mentor.tags.map((tag, idx) => {
                    if (tag.type === 'asap') {
                      return (
                        <div key={idx} className="flex items-center gap-1.5 bg-[#4ADE80] text-gray-900 text-[10px] font-bold px-3 py-1.5 rounded-full border-2 border-gray-900 shadow-[2px_2px_0px_rgba(17,24,39,1)]">
                          <div className="w-1.5 h-1.5 bg-gray-900 rounded-full animate-pulse"></div>
                          {tag.label}
                        </div>
                      );
                    }
                    if (tag.type === 'asap_dark') {
                       return (
                        <div key={idx} className="flex items-center justify-center w-9 h-9 bg-[#FFD147] text-gray-900 rounded-full border-2 border-gray-900 shadow-[2px_2px_0px_rgba(17,24,39,1)]">
                           <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>
                        </div>
                      );
                    }
                    if (tag.type === 'advance') {
                      return (
                        <div key={idx} className="flex items-center gap-1.5 bg-[#FFD147] text-gray-900 text-[10px] font-bold px-3 py-1.5 rounded-full border-2 border-gray-900 shadow-[2px_2px_0px_rgba(17,24,39,1)]">
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                          {tag.label}
                        </div>
                      );
                    }
                    return null;
                  })}
                </div>
              </div>

              {/* Content Body */}
              <div className="p-5 flex flex-col flex-1 relative bg-white">
                <div className="mb-3">
                  <h3 className="font-extrabold text-gray-900 text-lg mb-1 flex items-center justify-between tracking-tight">
                    <span className="truncate group-hover:text-[#6B46FF] transition-colors">{mentor.name}</span>
                    <span className="group-hover:scale-125 transition-transform duration-300 ml-2">{mentor.flag}</span>
                  </h3>
    
                  <div className="flex items-start text-sm text-gray-500 leading-tight min-h-[40px]">
                     <span className="line-clamp-2">
                      <span className="font-bold text-gray-900">{mentor.role}</span>
                      <span className="mx-1.5 text-gray-300">•</span>
                      <span className="text-gray-500">{mentor.company}</span>
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 text-xs font-bold text-gray-400 mb-5">
                  <div className="flex items-center gap-1.5 bg-purple-50 px-3 py-1.5 rounded-full border-2 border-purple-200">
                    <svg className="w-3.5 h-3.5 text-[#6B46FF]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
                    <span className="text-gray-900">{mentor.sessions}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                     <div className="flex -space-x-0.5">
                        {[1,2,3,4,5].map(i => (
                          <svg key={i} className="w-3.5 h-3.5 text-[#FFD147] fill-current drop-shadow-sm" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>
                        ))}
                     </div>
                     <span className="text-gray-500 font-bold">({mentor.reviews})</span>
                  </div>
                </div>

                {/* Stats Footer Box */}
                <div className="bg-[#FDFBF7] rounded-xl p-4 mt-auto flex justify-between items-center border-2 border-gray-200 group-hover:border-[#6B46FF] group-hover:bg-purple-50 transition-all">
                  <div>
                    <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-0.5">Experience</div>
                    <div className="text-gray-900 font-extrabold text-sm tracking-tight">{mentor.experience}</div>
                  </div>
                  <div className="h-8 w-[2px] bg-gray-200 group-hover:bg-[#6B46FF] transition-colors rounded-full"></div>
                  <div className="text-right">
                    <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-0.5">Attendance</div>
                    <div className="text-gray-900 font-extrabold text-sm tracking-tight">{mentor.attendance}</div>
                  </div>
                </div>

              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TopMentorsSection;
