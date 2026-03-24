import React from 'react';
import Image from 'next/image';
import { Quote, Sparkles, Star } from 'lucide-react';

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
    countryCode: "MX",
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
    countryCode: "SG",
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
    countryCode: "US",
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
    countryCode: "KE",
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
    countryCode: "UK",
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
    countryCode: "CA",
    mentorRole: "Product Manager at Symply",
    stats: "82 sessions (20 reviews)",
    mentorAvatar: "/mentors/samantha.png"
  }
];

const CommunityReviewsSection = () => {
  return (
    <section className="overflow-hidden bg-white py-20 md:py-24">
      <div className="mx-auto w-full max-w-7xl px-5 md:px-8">

        <div className="mb-12 text-center md:mb-14">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-border bg-surface-dim px-4 py-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="font-manrope text-xs font-semibold uppercase tracking-widest text-primary">
              Community Voices
            </span>
          </div>

          <h2 className="font-plus-jakarta text-3xl font-extrabold tracking-tight text-on-surface md:text-[2.8rem]">
            Loved by our community
          </h2>
          <p className="font-manrope mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-on-surface-variant md:text-base">
            Real learner experiences from guided mentorship across product, design, engineering, and more.
          </p>

          <div className="mt-7 flex gap-2.5 overflow-x-auto pb-1 md:flex-wrap md:justify-center md:overflow-visible">
            {CATEGORIES.map((cat, idx) => (
              <button
                key={idx}
                className={`font-manrope shrink-0 rounded-full border px-4 py-2 text-xs font-semibold transition-colors md:text-sm ${
                  idx === 0 
                    ? "border-primary bg-primary text-white" 
                    : "border-border bg-white text-on-surface-variant hover:border-primary/40 hover:bg-surface-dim hover:text-on-surface"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {REVIEWS.map((review, idx) => (
            <div 
              key={idx} 
              className="group flex h-full flex-col overflow-hidden rounded-3xl border border-border bg-white shadow-[0_6px_20px_rgba(15,23,42,0.06)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_14px_36px_rgba(15,23,42,0.12)]"
            >

              <div className="border-b border-border bg-surface-dim p-5">
                <div className="mb-3 flex items-center justify-between">
                  <div className="inline-flex items-center gap-1.5 rounded-full border border-border bg-white px-2.5 py-1">
                    <Quote className="h-3.5 w-3.5 text-primary/70" />
                    <span className="font-manrope text-[11px] font-semibold uppercase tracking-wide text-on-surface-variant">Verified</span>
                  </div>
                  <div className="flex items-center gap-0.5 text-amber-500">
                    <Star className="h-3.5 w-3.5 fill-current" />
                    <Star className="h-3.5 w-3.5 fill-current" />
                    <Star className="h-3.5 w-3.5 fill-current" />
                    <Star className="h-3.5 w-3.5 fill-current" />
                    <Star className="h-3.5 w-3.5 fill-current" />
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                <Image
                  src={review.mentorAvatar} 
                  alt={review.mentorName} 
                  width={56}
                  height={56}
                  className="h-14 w-14 rounded-full object-cover ring-2 ring-white"
                />
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-plus-jakarta text-[15px] font-bold text-on-surface">{review.mentorName}</h3>
                    <span className="rounded-full border border-border bg-white px-2 py-0.5 text-[10px] font-semibold text-on-surface-variant">
                      {review.countryCode}
                    </span>
                  </div>
                  <p className="font-manrope mt-1 text-[13px] leading-snug text-on-surface-variant">{review.mentorRole}</p>
                  <p className="font-manrope mt-2 text-[12px] font-medium text-on-surface-variant">{review.stats}</p>
                </div>
              </div>
              </div>

              <div className="flex flex-1 flex-col p-5">
                <p className="font-manrope flex-1 text-[15px] leading-[1.75] text-on-surface-variant">
                  {review.text}
                </p>

                <div className="mt-6 flex items-center gap-3 border-t border-border pt-4">
                  <Image
                    src={review.reviewerAvatar} 
                    alt={review.reviewerName} 
                    width={40}
                    height={40}
                    className="h-10 w-10 shrink-0 rounded-full object-cover"
                  />
                  <div className="min-w-0">
                    <div className="font-plus-jakarta truncate text-[14px] font-semibold text-on-surface">
                      {review.reviewerName}
                    </div>
                    <div className="font-manrope truncate text-[12px] text-on-surface-variant">
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
