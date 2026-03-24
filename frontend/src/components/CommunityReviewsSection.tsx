'use client';

import React from 'react';
import { motion } from 'framer-motion';

const CATEGORIES = ["Product", "Engineering", "Design", "Marketing", "Data Science", "Product Research"];

const REVIEWS = [
  { text: "Great chat with Jocelyn! She helped me rethink about metrics (product, UX/UI business) when working on a project. I liked that she had articles & resources ready to share.", reviewerName: "Délcio Pechiço", reviewerRole: "UX/UI Designer, MoBerries", mentorName: "Jocelyn Esquivel", flag: "🇲🇽", mentorRole: "UX Lead at Coppel", stats: "278 sessions (67 reviews)" },
  { text: "Kieran is very knowledgeable, informative and super helpful Product Manager who has great ideas! Thank you Kieran for your advice and dedication to mentoring aspiring PMs!", reviewerName: "Hnin Azali", reviewerRole: "STAR Intern, SAP", mentorName: "Kieran Yi Moon", flag: "🇸🇬", mentorRole: "Product Manager at Meta", stats: "189 sessions (10 reviews)" },
  { text: "The conversation with Josh completely blew me out of the water. Josh is an amazing mentor and even offered to do some resume and portfolio reviews with me.", reviewerName: "Sarah George-Ashiru", reviewerRole: "Product Manager, Watche Technologies Inc.", mentorName: "Josh S", flag: "🇺🇸", mentorRole: "Head of Product at Amazon, HBS, Harvard", stats: "118 sessions (23 reviews)" },
  { text: "Charles has been an invaluable resource for my journey as a product designer transitioning into product management. He creates a comfortable and open environment for discussions.", reviewerName: "Junaid Ally", reviewerRole: "Product designer, Luno", mentorName: "Charles Kithika", flag: "🇰🇪", mentorRole: "Senior PM Manager at Microsoft", stats: "190 sessions (59 reviews)" },
  { text: "I scheduled a call with Caroline to help clarify my next career steps. She guided me through her career path and provided me with great career advice. One of the best mentors.", reviewerName: "Julia Gruszczyńska", reviewerRole: "Digital Media Executive, University of Warwick", mentorName: "Caroline Parnell", flag: "🇬🇧", mentorRole: "Head of Product at Bridebook", stats: "42 sessions (14 reviews)" },
  { text: "Just completed my first session with Sharon. She shared her experience working as a product manager with different teams. Definitely recommend her to anyone!", reviewerName: "Esther Lin", reviewerRole: "student of UI/UX design, Springboard", mentorName: "Sharon Ikechi", flag: "🇨🇦", mentorRole: "Product Manager at Symply", stats: "82 sessions (20 reviews)" },
];

const CommunityReviewsSection = () => {
  return (
    <section className="py-20 md:py-24 px-5 md:px-8 w-full relative bg-[#F5F3FF]/30">
      <div className="max-w-7xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="text-center w-full mb-12">
          <h2 className="text-3xl md:text-[40px] font-bold text-[#1A1A2E] mb-8 tracking-tight font-sora">Loved by our community</h2>
          <div className="flex flex-wrap justify-center gap-3">
            {CATEGORIES.map((cat, idx) => (
              <button key={idx} className={`px-5 py-2 rounded-full text-[15px] transition-all border font-inter ${
                idx === 0 ? "bg-[#1A1A2E] text-white border-[#1A1A2E] font-medium" : "bg-white text-[#6B7280] border-gray-200 hover:border-gray-300 font-normal hover:bg-gray-50"
              }`}>{cat}</button>
            ))}
          </div>
        </motion.div>

        <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
          {REVIEWS.map((review, idx) => (
            <motion.div key={idx} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: idx * 0.08 }}
              className="break-inside-avoid glass-card rounded-2xl overflow-hidden flex flex-col">
              <div className="bg-[#F9FAFB] p-6 border-b border-gray-100 flex items-start gap-4">
                <div className="w-14 h-14 rounded-full bg-[#EDE9FE] flex items-center justify-center text-lg font-bold text-[#7C3AED] flex-shrink-0 border border-[#7C3AED]/15">
                  {review.mentorName.charAt(0)}
                </div>
                <div className="flex flex-col gap-1.5">
                  <div className="font-semibold text-[15px] text-[#1A1A2E] flex items-center gap-1.5 font-sora">{review.mentorName} <span className="text-sm">{review.flag}</span></div>
                  <div className="text-[13px] text-[#6B7280] leading-snug">{review.mentorRole}</div>
                  <div className="text-[12px] text-[#9CA3AF] font-medium">{review.stats}</div>
                </div>
              </div>
              <div className="p-6 flex flex-col flex-1">
                <p className="text-[#4B5563] text-[15px] leading-[1.6] mb-8 flex-1 font-normal font-inter">{review.text}</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-sm font-bold text-[#1A1A2E]">{review.reviewerName.charAt(0)}</div>
                  <div>
                    <div className="text-[14px] text-[#1A1A2E] font-inter font-medium">{review.reviewerName}</div>
                    <div className="text-[13px] text-[#9CA3AF] line-clamp-1 font-inter">{review.reviewerRole}</div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CommunityReviewsSection;
