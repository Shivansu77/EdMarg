import React from 'react';

const TransformSection = () => {
  return (
    <section className="py-12 md:py-20 px-4 md:px-8 w-full max-w-7xl mx-auto flex flex-col items-center">
      {/* Header */}
      <div className="text-center max-w-3xl mb-8 md:mb-16">
        <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-4 md:mb-6">
          Transforming your potential
        </h2>
        <p className="text-base md:text-xl text-gray-600 leading-relaxed">
          Become the best version of yourself by accessing to the perspectives and life 
          experiences of others who&apos;ve been there, done that.
        </p>
      </div>

      {/* Mockup UI Window */}
      <div className="w-full relative bg-gray-900 rounded-2xl md:rounded-3xl overflow-hidden shadow-2xl mb-10 md:mb-20 border-[6px] md:border-[12px] border-gray-900">
        <div className="bg-white w-full rounded-xl md:rounded-2xl overflow-hidden shadow-inner flex flex-col">
          
          {/* Mockup Header/Tabs */}
          <div className="px-4 md:px-8 py-3 md:py-6 border-b border-gray-100 flex items-center justify-between">
            <div className="flex gap-4 md:gap-8 text-xs md:text-sm font-semibold text-gray-400">
              <span className="text-black border-b-2 border-black pb-1">Mentors</span>
              <span className="hover:text-black cursor-pointer">Group Sessions</span>
              <span className="hover:text-black cursor-pointer">Topics</span>
            </div>
          </div>

          {/* Mockup Controls */}
          <div className="px-4 md:px-8 py-3 md:py-4 flex flex-col md:flex-row items-center justify-between gap-3 md:gap-4 border-b border-gray-50 hidden sm:flex">
            {/* Search Bar Placeholder */}
            <div className="bg-gray-50 rounded-full px-4 py-2 flex items-center w-full md:w-80 border border-gray-200">
              <span className="text-gray-400 mr-2 opacity-50">🔍</span>
              <span className="text-sm text-gray-400">Search by name, company, role</span>
            </div>
            
            <div className="flex items-center gap-4 text-sm font-medium">
              <div className="flex items-center gap-2 bg-yellow-50 text-yellow-800 px-3 py-1 rounded-full text-xs font-bold border border-yellow-200">
                <span>NEW</span>
                <span className="text-gray-600 font-normal ml-1 hidden sm:inline">Display advanced sessions | Commit to long term</span>
              </div>
              <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition">
                <span className="opacity-60">⚙️</span> Filters
              </button>
            </div>
          </div>

          {/* Mockup Grid Area */}
          <div className="flex-1 bg-gray-50 p-3 md:p-8 grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6 overflow-hidden">
            
            {/* Mentor Card 1 */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col opacity-90 hover:opacity-100 hover:shadow-md transition cursor-pointer transform hover:-translate-y-1">
              <div className="h-24 md:h-40 w-full relative overflow-hidden">
                <img src="/mentors/samantha.png" alt="Samantha Aquino" className="w-full h-full object-cover" />
                <div className="absolute top-2 left-2 bg-white text-xs px-2 py-1 rounded-md font-bold text-gray-700 shadow-sm">Top rated</div>
                <div className="absolute bottom-2 left-2 text-[10px] bg-yellow-400 text-yellow-900 font-bold px-2 py-0.5 rounded shadow-sm">⚡ Advance</div>
              </div>
              <div className="p-2 md:p-4 flex flex-col gap-0.5 md:gap-1">
                <div className="font-bold text-[11px] md:text-sm">Samantha Aquino 🇸🇪</div>
                <div className="text-[10px] md:text-xs text-gray-500 line-clamp-1">Senior Product Designer at Epidemic Sound</div>
                <div className="text-[10px] md:text-xs text-gray-400 mt-1 md:mt-2 hidden sm:block">📊 49 sessions (15 reviews)</div>
              </div>
              <div className="mt-auto border-t border-gray-50 p-2 md:p-3 flex justify-between text-[8px] md:text-[10px] text-gray-400 font-medium">
                <div>Experience<br/><span className="text-black font-bold">10 years</span></div>
                <div>Avg. Attendance<br/><span className="text-green-600 font-bold">98%</span></div>
              </div>
            </div>

            {/* Mentor Card 2 */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col opacity-90 hover:opacity-100 hover:shadow-md transition cursor-pointer transform hover:-translate-y-1">
              <div className="h-24 md:h-40 w-full relative overflow-hidden">
                <img src="/mentors/natasha.png" alt="Paula Faina" className="w-full h-full object-cover" />
                <div className="absolute top-2 left-2 bg-white text-xs px-2 py-1 rounded-md font-bold text-gray-700 shadow-sm">Top rated</div>
                <div className="absolute bottom-2 left-2 text-[10px] bg-yellow-400 text-yellow-900 font-bold px-2 py-0.5 rounded shadow-sm">⚡ Advance</div>
              </div>
              <div className="p-2 md:p-4 flex flex-col gap-0.5 md:gap-1">
                <div className="font-bold text-[11px] md:text-sm">Paula Faina 🇬🇧</div>
                <div className="text-[10px] md:text-xs text-gray-500 line-clamp-1">CEO at Faina UK Consulting</div>
                <div className="text-[10px] md:text-xs text-gray-400 mt-1 md:mt-2 hidden sm:block">📊 77 sessions (19 reviews)</div>
              </div>
              <div className="mt-auto border-t border-gray-50 p-2 md:p-3 flex justify-between text-[8px] md:text-[10px] text-gray-400 font-medium">
                <div>Experience<br/><span className="text-black font-bold">22 years</span></div>
                <div>Avg. Attendance<br/><span className="text-green-600 font-bold">100%</span></div>
              </div>
            </div>

            {/* Mentor Card 3 - Featured */}
            <div className="bg-white rounded-xl shadow-[0_0_15px_rgba(0,0,0,0.1)] border-2 border-gray-800 overflow-hidden flex flex-col z-10 relative transform md:scale-105">
              <div className="h-24 md:h-40 w-full relative overflow-hidden">
                <img src="/mentors/annette.png" alt="Maura MacDonald" className="w-full h-full object-cover" />
                <div className="absolute top-2 left-2 bg-white text-xs px-2 py-1 rounded-md font-bold text-gray-700 shadow-sm">Top rated</div>
                <div className="absolute bottom-2 left-2 text-[10px] bg-yellow-400 text-yellow-900 font-bold px-2 py-0.5 rounded shadow-sm">⚡ Advance</div>
              </div>
              <div className="p-2 md:p-4 flex flex-col gap-0.5 md:gap-1">
                <div className="font-bold text-[11px] md:text-sm">Maura MacDonald 🇨🇦</div>
                <div className="text-[10px] md:text-xs text-gray-500 line-clamp-1">Senior Visual Designer at IBM</div>
                <div className="text-[10px] md:text-xs text-gray-400 mt-1 md:mt-2 hidden sm:block">📊 151 sessions (37 reviews)</div>
              </div>
              <div className="mt-auto border-t border-gray-50 p-2 md:p-3 flex justify-between text-[8px] md:text-[10px] text-gray-400 font-medium">
                <div>Experience<br/><span className="text-black font-bold">20 years</span></div>
                <div>Avg. Attendance<br/><span className="text-green-600 font-bold">99%</span></div>
              </div>
            </div>

            {/* Mentor Card 4 */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col opacity-90 hover:opacity-100 hover:shadow-md transition cursor-pointer transform hover:-translate-y-1">
              <div className="h-24 md:h-40 w-full relative overflow-hidden">
                <img src="/mentors/omar.png" alt="Olga Sales" className="w-full h-full object-cover" />
                <div className="absolute top-2 left-2 bg-white text-xs px-2 py-1 rounded-md font-bold text-gray-700 shadow-sm">Top rated</div>
                <div className="absolute bottom-2 left-2 text-[10px] bg-yellow-400 text-yellow-900 font-bold px-2 py-0.5 rounded shadow-sm">⚡ Advance</div>
              </div>
              <div className="p-2 md:p-4 flex flex-col gap-0.5 md:gap-1">
                <div className="font-bold text-[11px] md:text-sm">Olga Sales 🇺🇦</div>
                <div className="text-[10px] md:text-xs text-gray-500 line-clamp-1">Partner at Improve Ventures</div>
                <div className="text-[10px] md:text-xs text-gray-400 mt-1 md:mt-2 hidden sm:block">📊 11 sessions (29 reviews)</div>
              </div>
              <div className="mt-auto border-t border-gray-50 p-2 md:p-3 flex justify-between text-[8px] md:text-[10px] text-gray-400 font-medium">
                <div>Experience<br/><span className="text-black font-bold">23 years</span></div>
                <div>Avg. Attendance<br/><span className="text-green-600 font-bold">100%</span></div>
              </div>
            </div>
            
          </div>
        </div>
      </div>

      {/* Feature Bullet Points */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 text-left mt-4 md:mt-8">
        
        {/* Point 1 */}
        <div className="flex gap-4">
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-pink-100 text-pink-500 font-bold flex items-center justify-center text-sm shadow-sm border border-pink-50">
            1
          </div>
          <div className="flex flex-col gap-2">
            <h3 className="font-bold text-lg leading-snug">
              An open access to the world&apos;s best.
            </h3>
            <p className="text-sm text-gray-500 leading-relaxed">
              From Design to AI, there are thousands of top experts, you can get access for free.
            </p>
          </div>
        </div>

        {/* Point 2 */}
        <div className="flex gap-4">
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-100 text-purple-600 font-bold flex items-center justify-center text-sm shadow-sm border border-purple-50">
            2
          </div>
          <div className="flex flex-col gap-2">
            <h3 className="font-bold text-lg leading-snug">
              Personalized advice to accelerate your success.
            </h3>
            <p className="text-sm text-gray-500 leading-relaxed">
              Book 1:1 mentorship session & get advice, insights to move faster with your work.
            </p>
          </div>
        </div>

        {/* Point 3 */}
        <div className="flex gap-4">
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 text-blue-500 font-bold flex items-center justify-center text-sm shadow-sm border border-blue-50">
            3
          </div>
          <div className="flex flex-col gap-2">
            <h3 className="font-bold text-lg leading-snug">
              Achieve your long term goals, easily.
            </h3>
            <p className="text-sm text-gray-500 leading-relaxed">
              Connect with mentors for recurring sessions and work towards a long-term goal.
            </p>
          </div>
        </div>

      </div>

    </section>
  );
};

export default TransformSection;
