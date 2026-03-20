import React from 'react';

const CATEGORIES = [
  "Product",
  "Engineering",
  "Design",
  "Marketing",
  "Data Science",
  "Product Research"
];

const REVIEWS = [
  {
    text: "Great chat with Jocelyn! She helped me rethink about metrics (product, UX/UI business) when working on a project. I liked that she had articles & resources ready to share. The fact that she showed openness for future conversations is also amazing.",
    reviewerName: "Délcio Pechiço",
    reviewerRole: "UX/UI Designer, MoBerries",
    reviewerAvatar: "https://i.pravatar.cc/150?u=delcio",
    mentorName: "Jocelyn Esquivel",
    flag: "🇲🇽",
    mentorRole: "UX Lead at Coppel",
    stats: "278 sessions (67 reviews)",
    mentorAvatar: "/mentors/samantha.png"
  },
  {
    text: "Kieran is very knowledgeable, informative and super helpful Product Manager who has great ideas! Thank you Kieran for your advice, dedication to mentoring aspiring PMs and willingness to share your knowledge & experiences!!",
    reviewerName: "Hnin Azali",
    reviewerRole: "STAR Intern, SAP",
    reviewerAvatar: "https://i.pravatar.cc/150?u=hnin",
    mentorName: "Kieran Yi Moon",
    flag: "🇸🇬",
    mentorRole: "Product Manager at Meta",
    stats: "189 sessions (10 reviews)",
    mentorAvatar: "/mentors/omar.png"
  },
  {
    text: "The conversation with Josh completely blew me out of the water. Josh is an amazing mentor and even offered to do some resume and portfolio reviews with me. I can't wait to book another session with him. You rock, Josh!",
    reviewerName: "Sarah George-Ashiru",
    reviewerRole: "Product Manager, Watche Technologies Inc.",
    reviewerAvatar: "https://i.pravatar.cc/150?u=sarah",
    mentorName: "Josh S",
    flag: "🇺🇸",
    mentorRole: "Head of Product at Amazon, HBS, Harvard",
    stats: "118 sessions (23 reviews)",
    mentorAvatar: "/mentors/natasha.png"
  },
  {
    text: "Charles has been an invaluable resource for my journey as a product designer transitioning into product management. He's provided tailored guidance that has helped me in my current role. Charles creates a comfortable and open environment for discussions, making each session productive and enjoyable.",
    reviewerName: "Junaid Ally",
    reviewerRole: "Product designer, Luno",
    reviewerAvatar: "https://i.pravatar.cc/150?u=junaid",
    mentorName: "Charles Kithika",
    flag: "🇰🇪",
    mentorRole: "Senior PM Manager at Microsoft",
    stats: "190 sessions (59 reviews)",
    mentorAvatar: "/mentors/omar.png"
  },
  {
    text: "I scheduled a call with Caroline to help clarify my next career steps. She guided me through her career path, provided me with great career advice and insight into the product industry. She is one of the best mentors I had a chance to talk to on this platform. Thank you for your help and time Caroline.",
    reviewerName: "Julia Gruszczyńska",
    reviewerRole: "Digital Media Executive, University of Warwick",
    reviewerAvatar: "https://i.pravatar.cc/150?u=julia",
    mentorName: "Caroline Parnell",
    flag: "🇬🇧",
    mentorRole: "Head of Product at Bridebook",
    stats: "42 sessions (14 reviews)",
    mentorAvatar: "/mentors/annette.png"
  },
  {
    text: "Just completed my first session with Sharon. She shared her experience working as a product manager with different teams. Definitely recommend her to anyone else who wants to know more about the role of product manager or how to work well with a PM!",
    reviewerName: "Esther Lin",
    reviewerRole: "student of UI/UX design, Springboard",
    reviewerAvatar: "https://i.pravatar.cc/150?u=esther",
    mentorName: "Sharon Ikechi",
    flag: "🇨🇦",
    mentorRole: "Product Manager at Symply",
    stats: "82 sessions (20 reviews)",
    mentorAvatar: "/mentors/samantha.png"
  }
];

const CommunityReviewsSection = () => {
  return (
    <section className="py-20 md:py-24 px-5 md:px-8 w-full bg-white relative">
      <div className="max-w-7xl mx-auto">

        {/* Section Header */}
        <div className="text-center w-full mb-12">
          <h2 className="text-3xl md:text-[40px] font-bold text-[#111827] mb-8 tracking-tight">
            Loved by our community
          </h2>
          
          {/* Categories / Tabs */}
          <div className="flex flex-wrap justify-center gap-3">
            {CATEGORIES.map((cat, idx) => (
              <button
                key={idx}
                className={`px-5 py-2 rounded-full text-[15px] transition-colors border ${
                  idx === 0 
                    ? "bg-[#111827] text-white border-[#111827] font-medium" 
                    : "bg-white text-gray-700 border-gray-200 hover:border-gray-300 font-normal hover:bg-gray-50"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Masonry Grid */}
        <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
          {REVIEWS.map((review, idx) => (
            <div 
              key={idx} 
              className="break-inside-avoid bg-white rounded-2xl border border-gray-200 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] overflow-hidden flex flex-col transform hover:-translate-y-1 transition-transform duration-300"
            >
              
              {/* Top Half: Mentor Details */}
              <div className="bg-[#F8FAFC] p-6 border-b border-gray-100 flex items-start gap-4">
                <img 
                  src={review.mentorAvatar} 
                  alt={review.mentorName} 
                  className="w-14 h-14 rounded-full object-cover flex-shrink-0"
                />
                <div className="flex flex-col gap-1.5">
                  <div className="font-semibold text-[15px] text-gray-900 flex items-center gap-1.5">
                    {review.mentorName} <span className="text-sm">{review.flag}</span>
                  </div>
                  <div className="flex items-start gap-2 text-[13px] text-gray-600">
                    <svg className="w-4 h-4 mt-0.5 text-gray-400 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
                    <span className="leading-snug">{review.mentorRole}</span>
                  </div>
                  <div className="flex items-center gap-2 text-[12px] text-gray-500 font-medium">
                    <svg className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                    <span>{review.stats}</span>
                  </div>
                </div>
              </div>

              {/* Bottom Half: Review & Mentee Details */}
              <div className="p-6 flex flex-col flex-1">
                <p className="text-gray-800 text-[15px] leading-[1.6] mb-8 flex-1 font-normal">
                  {review.text}
                </p>

                <div className="flex items-center gap-3">
                  <img 
                    src={review.reviewerAvatar} 
                    alt={review.reviewerName} 
                    className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                  />
                  <div>
                    <div className="text-[14px] text-gray-700">
                      {review.reviewerName}
                    </div>
                    <div className="text-[13px] text-[#9CA3AF] line-clamp-1">
                      {review.reviewerRole}
                    </div>
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

export default CommunityReviewsSection;
