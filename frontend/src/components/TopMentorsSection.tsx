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
    image: "https://i.pravatar.cc/300?u=natasha",
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
    image: "https://i.pravatar.cc/300?u=omar",
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
    image: "https://i.pravatar.cc/300?u=annette",
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
    image: "https://i.pravatar.cc/300?u=ney",
    tags: [
      { type: "asap_dark", label: "⚡" }, 
      { type: "advance", label: "Advance" }
    ]
  }
];

const TopMentorsSection = () => {
  return (
    <section className="py-24 px-8 w-full max-w-7xl mx-auto">
      {/* Header Row */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-8">
        <div className="max-w-2xl">
          <h2 className="text-4xl md:text-5xl font-extrabold text-[#0B1B3D] tracking-tight mb-4 text-black">
            Discover the world&apos;s top mentors
          </h2>
          <p className="text-gray-500 text-lg leading-relaxed">
            Connect with top-rated experts in design, engineering, products, and more. 
            Level up your career with personalized 1-on-1 guidance.
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <button className="px-6 py-2.5 text-sm font-bold text-gray-800 bg-white border border-gray-200 rounded-full hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm">
            Explore all
          </button>
          <div className="flex gap-2">
            <button className="w-10 h-10 flex items-center justify-center border border-gray-200 rounded-full text-gray-400 hover:text-gray-800 hover:bg-gray-50 transition-all shadow-sm">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
            </button>
            <button className="w-10 h-10 flex items-center justify-center border border-gray-200 rounded-full text-gray-400 hover:text-gray-800 hover:bg-gray-50 transition-all shadow-sm">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mentors Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {MOCK_MENTORS.map((mentor) => (
          <div 
            key={mentor.id} 
            className="group bg-white rounded-[2rem] border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_50px_rgba(0,0,0,0.1)] transition-all duration-500 flex flex-col cursor-pointer ring-1 ring-black/5 hover:ring-purple-500/20 overflow-hidden"
          >
            {/* Image Container with Hover Action */}
            <div className="relative w-full aspect-[4/4.5] overflow-hidden">
              <img 
                src={mentor.image} 
                alt={mentor.name}
                className="w-full h-full object-cover grayscale-[20%] group-hover:grayscale-0 group-hover:scale-110 transition-all duration-700 ease-out"
              />
              
              {/* Overlay Gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity"></div>

              {/* Action Button - Shows on Hover */}
              <div className="absolute inset-0 flex items-center justify-center translate-y-8 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-300">
                <button className="bg-white text-black font-bold px-6 py-2.5 rounded-full shadow-xl hover:bg-purple-600 hover:text-white transition-all transform hover:scale-105">
                  Book Session
                </button>
              </div>

              {/* Status Tags Overlay */}
              <div className="absolute bottom-4 left-4 right-4 flex gap-2">
                {mentor.tags.map((tag, idx) => {
                  if (tag.type === 'asap') {
                    return (
                      <div key={idx} className="flex items-center gap-1.5 bg-black/80 backdrop-blur-md text-green-400 text-[10px] font-bold px-3 py-1.5 rounded-xl border border-white/10 shadow-lg">
                        <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse shadow-[0_0_8px_rgba(74,222,128,0.5)]"></div>
                        {tag.label}
                      </div>
                    );
                  }
                  if (tag.type === 'asap_dark') {
                     return (
                      <div key={idx} className="flex items-center justify-center w-8 h-8 bg-black/80 backdrop-blur-md text-yellow-400 rounded-xl border border-white/10 shadow-lg">
                         <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>
                      </div>
                    );
                  }
                  if (tag.type === 'advance') {
                    return (
                      <div key={idx} className="flex items-center gap-1.5 bg-yellow-400 text-yellow-950 text-[10px] font-bold px-3 py-1.5 rounded-xl shadow-lg border border-yellow-200/50">
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
            <div className="p-6 flex flex-col flex-1 relative bg-white">
              <div className="mb-4">
                <h3 className="font-extrabold text-[#0B1B3D] text-lg mb-1 flex items-center justify-between">
                  <span className="truncate group-hover:text-purple-700 transition-colors">{mentor.name}</span>
                  <span className="group-hover:scale-125 transition-transform duration-300">{mentor.flag}</span>
                </h3>
  
                <div className="flex items-start text-sm text-gray-500 leading-tight min-h-[40px]">
                   <span className="line-clamp-2">
                    <span className="font-bold text-gray-800">{mentor.role}</span>
                    <span className="mx-1">•</span>
                    <span className="text-gray-400 italic">{mentor.company}</span>
                  </span>
                </div>
              </div>
              
              <div className="flex items-center gap-4 text-xs font-bold text-gray-400 mb-6">
                <div className="flex items-center gap-1.5 bg-gray-50 px-2.5 py-1 rounded-lg border border-gray-100 group-hover:bg-purple-50 group-hover:border-purple-100 transition-colors">
                  <svg className="w-3.5 h-3.5 text-purple-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
                  <span className="text-gray-700">{mentor.sessions} sessions</span>
                </div>
                <div className="flex items-center gap-1.5">
                   <div className="flex -space-x-1">
                      {[1,2,3,4,5].map(i => (
                        <svg key={i} className="w-3 h-3 text-yellow-400 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>
                      ))}
                   </div>
                   <span className="text-gray-400 font-medium">({mentor.reviews})</span>
                </div>
              </div>

              {/* Stats Footer Box */}
              <div className="bg-gray-50 group-hover:bg-purple-50 rounded-2xl p-4 mt-auto flex justify-between items-center transition-all border border-transparent group-hover:border-purple-100/50">
                <div>
                  <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">Experience</div>
                  <div className="text-[#0B1B3D] font-extrabold text-sm tracking-tight">{mentor.experience}</div>
                </div>
                <div className="h-4 w-[1px] bg-gray-200 group-hover:bg-purple-200"></div>
                <div className="text-right">
                  <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">Attendance</div>
                  <div className="text-[#0B1B3D] font-extrabold text-sm tracking-tight">{mentor.attendance}</div>
                </div>
              </div>

            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default TopMentorsSection;
