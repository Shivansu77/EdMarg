import React from 'react';

const TransformSection = () => {
  return (
    <section className="py-20 px-8 w-full max-w-7xl mx-auto flex flex-col items-center">
      {/* Header */}
      <div className="text-center max-w-3xl mb-16">
        <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-6">
          Transforming your potential
        </h2>
        <p className="text-lg md:text-xl text-gray-600 leading-relaxed">
          Become the best version of yourself by accessing to the perspectives and life 
          experiences of others who&apos;ve been there, done that.
        </p>
      </div>

      {/* Mockup UI Window */}
      <div className="w-full relative bg-gray-900 rounded-3xl overflow-hidden shadow-2xl mb-20 border-[12px] border-gray-900">
        <div className="bg-white w-full rounded-2xl overflow-hidden shadow-inner flex flex-col h-[500px] md:h-[600px]">
          
          {/* Mockup Header/Tabs */}
          <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between">
            <div className="flex gap-8 text-sm font-semibold text-gray-400">
              <span className="text-black border-b-2 border-black pb-1">Mentors</span>
              <span className="hover:text-black cursor-pointer">Group Sessions</span>
              <span className="hover:text-black cursor-pointer">Topics</span>
            </div>
          </div>

          {/* Mockup Controls */}
          <div className="px-8 py-4 flex flex-col md:flex-row items-center justify-between gap-4 border-b border-gray-50">
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
          <div className="flex-1 bg-gray-50 p-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 overflow-hidden">
            
            {/* Mentor Card 1 */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col opacity-90 hover:opacity-100 hover:shadow-md transition cursor-pointer transform hover:-translate-y-1">
              <div className="h-40 bg-gray-200 w-full relative">
                <div className="absolute top-2 left-2 bg-white text-xs px-2 py-1 rounded-md font-bold text-gray-700 shadow-sm">Top rated</div>
                {/* Fallback pattern for image array */}
                <div className="w-full h-full bg-gradient-to-br from-purple-200 to-indigo-300"></div>
                <div className="absolute bottom-2 left-2 text-[10px] bg-yellow-400 text-yellow-900 font-bold px-2 py-0.5 rounded shadow-sm">⚡ Advance</div>
              </div>
              <div className="p-4 flex flex-col gap-1">
                <div className="font-bold text-sm">Samantha Aquino 🇸🇪</div>
                <div className="text-xs text-gray-500">Senior Product Designer at Epidemic Sound</div>
                <div className="text-xs text-gray-400 mt-2">📊 49 sessions (15 reviews)</div>
              </div>
              <div className="mt-auto border-t border-gray-50 p-3 flex justify-between text-[10px] text-gray-400 font-medium">
                <div>Experience<br/><span className="text-black font-bold">10 years</span></div>
                <div>Avg. Attendance<br/><span className="text-green-600 font-bold">98%</span></div>
              </div>
            </div>

            {/* Mentor Card 2 */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col opacity-90 hover:opacity-100 hover:shadow-md transition cursor-pointer transform hover:-translate-y-1">
              <div className="h-40 bg-gray-200 w-full relative">
                <div className="absolute top-2 left-2 bg-white text-xs px-2 py-1 rounded-md font-bold text-gray-700 shadow-sm">Top rated</div>
                <div className="w-full h-full bg-gradient-to-br from-green-200 to-emerald-300"></div>
                <div className="absolute bottom-2 left-2 text-[10px] bg-yellow-400 text-yellow-900 font-bold px-2 py-0.5 rounded shadow-sm">⚡ Advance</div>
              </div>
              <div className="p-4 flex flex-col gap-1">
                <div className="font-bold text-sm">Paula Faina 🇬🇧</div>
                <div className="text-xs text-gray-500">CEO at Faina UK Consulting</div>
                <div className="text-xs text-gray-400 mt-2">📊 77 sessions (19 reviews)</div>
              </div>
              <div className="mt-auto border-t border-gray-50 p-3 flex justify-between text-[10px] text-gray-400 font-medium">
                <div>Experience<br/><span className="text-black font-bold">22 years</span></div>
                <div>Avg. Attendance<br/><span className="text-green-600 font-bold">100%</span></div>
              </div>
            </div>

            {/* Mentor Card 3 */}
            <div className="bg-white rounded-xl shadow-[0_0_15px_rgba(0,0,0,0.1)] border-2 border-gray-800 overflow-hidden flex flex-col z-10 relative transform scale-105">
              {/* Play button overlay to mimic image focus */}
              <div className="absolute inset-0 m-auto w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg pointer-events-none z-20 top-10">
                <div className="w-0 h-0 border-t-8 border-b-8 border-l-[14px] border-t-transparent border-b-transparent border-l-black ml-1"></div>
              </div>
              <div className="h-40 bg-gray-200 w-full relative">
                <div className="absolute top-2 left-2 bg-white text-xs px-2 py-1 rounded-md font-bold text-gray-700 shadow-sm">Top rated</div>
                <div className="w-full h-full bg-gradient-to-br from-orange-200 to-red-300"></div>
                <div className="absolute bottom-2 left-2 text-[10px] bg-yellow-400 text-yellow-900 font-bold px-2 py-0.5 rounded shadow-sm">⚡ Advance</div>
              </div>
              <div className="p-4 flex flex-col gap-1 relative">
                <div className="font-bold text-sm">Maura MacDonald 🇨🇦</div>
                <div className="text-xs text-gray-500">Senior Visual Designer at IBM</div>
                <div className="text-xs text-gray-400 mt-2">📊 151 sessions (37 reviews)</div>
                {/* Custom Cursor SVG */}
                <svg className="absolute bottom-0 right-4 w-10 h-10 transform translate-x-4 translate-y-4" viewBox="0 0 100 100" fill="white" stroke="black" strokeWidth="4">
                  <path d="M20 20 L40 80 L50 60 L70 90 L80 80 L60 50 L80 40 Z" />
                </svg>
              </div>
              <div className="mt-auto border-t border-gray-50 p-3 flex justify-between text-[10px] text-gray-400 font-medium">
                <div>Experience<br/><span className="text-black font-bold">20 years</span></div>
                <div>Avg. Attendance<br/><span className="text-green-600 font-bold">99%</span></div>
              </div>
            </div>

            {/* Mentor Card 4 */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col opacity-90 hover:opacity-100 hover:shadow-md transition cursor-pointer transform hover:-translate-y-1 sm:hidden lg:flex">
              <div className="h-40 bg-gray-200 w-full relative">
                <div className="absolute top-2 left-2 bg-white text-xs px-2 py-1 rounded-md font-bold text-gray-700 shadow-sm">Top rated</div>
                <div className="w-full h-full bg-gradient-to-br from-cyan-200 to-blue-300"></div>
                <div className="absolute bottom-2 left-2 text-[10px] bg-yellow-400 text-yellow-900 font-bold px-2 py-0.5 rounded shadow-sm">⚡ Advance</div>
              </div>
              <div className="p-4 flex flex-col gap-1">
                <div className="font-bold text-sm">Olga Sales 🇺🇦</div>
                <div className="text-xs text-gray-500">Partner at Improve Ventures</div>
                <div className="text-xs text-gray-400 mt-2">📊 11 sessions (29 reviews)</div>
              </div>
              <div className="mt-auto border-t border-gray-50 p-3 flex justify-between text-[10px] text-gray-400 font-medium">
                <div>Experience<br/><span className="text-black font-bold">23 years</span></div>
                <div>Avg. Attendance<br/><span className="text-green-600 font-bold">100%</span></div>
              </div>
            </div>
            
          </div>
        </div>
      </div>

      {/* Feature Bullet Points */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-left mt-8">
        
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
