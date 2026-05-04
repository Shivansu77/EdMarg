'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Minus } from 'lucide-react';

const faqs = [
  {
    question: "How does the mentor matching process work?",
    answer: "We use an AI-driven algorithm alongside your profile preferences to suggest the best-fit mentors. You can also manually browse our mentor marketplace and filter by domain, price, and expertise."
  },
  {
    question: "Are the mentorship sessions free or paid?",
    answer: "Both! We have mentors offering free community sessions as well as premium experts who charge for their time. You can filter mentors based on your budget."
  },
  {
    question: "What happens if I miss a scheduled session?",
    answer: "We understand that life happens. You can reschedule a session up to 24 hours in advance without any penalty. Missed sessions without prior notice may be subject to our cancellation policy."
  },
  {
    question: "How is the career assessment test structured?",
    answer: "Our career assessment is a comprehensive, multi-dimensional test that evaluates your skills, personality traits, and professional interests to provide a tailored career roadmap."
  },
  {
    question: "Can I become a mentor if I have industry experience?",
    answer: "Absolutely! We are always looking for experienced professionals to join our community. You can apply through the 'Become a Mentor' page, and our team will review your application."
  }
];

const FAQItem = ({ faq, isOpen, toggleOpen }: { faq: any; isOpen: boolean; toggleOpen: () => void }) => {
  return (
    <div className="mb-4">
      <button
        onClick={toggleOpen}
        className={`w-full flex items-center justify-between text-left p-6 rounded-2xl transition-all duration-300 ${
          isOpen
            ? 'bg-white/60 border-emerald-200 shadow-[0_8px_30px_rgba(16,185,129,0.1)]'
            : 'bg-white/30 hover:bg-white/50 border-white/40 hover:border-emerald-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)]'
        } border backdrop-blur-xl`}
      >
        <span className={`text-base sm:text-lg font-semibold transition-colors duration-300 ${isOpen ? 'text-emerald-900' : 'text-slate-800'}`}>
          {faq.question}
        </span>
        <div
          className={`flex-shrink-0 ml-4 h-10 w-10 flex items-center justify-center rounded-full transition-colors duration-300 ${
            isOpen ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100/50 text-slate-500'
          }`}
        >
          {isOpen ? <Minus className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
        </div>
      </button>
      
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="p-6 pt-2 text-slate-600 leading-relaxed text-sm sm:text-base">
              {faq.answer}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const FAQSection = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="relative overflow-hidden py-32 bg-slate-50">
      {/* Decorative blurry blobs for glassmorphism effect */}
      <div className="absolute top-0 left-1/4 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-200/30 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 h-[600px] w-[600px] translate-x-1/3 translate-y-1/3 rounded-full bg-cyan-100/40 blur-[140px] pointer-events-none" />
      
      <div className="relative z-10 mx-auto max-w-6xl px-6 lg:px-8">
        <div className="text-center mb-20">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50/80 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-700 mb-6">
            Frequently Asked Questions
          </div>
          <h2 className="text-4xl font-extrabold tracking-tight text-slate-950 sm:text-5xl md:text-6xl mb-8 leading-[1.1]">
            We've got <span className="text-emerald-600">answers</span>
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto font-medium">
            Everything you need to know about EdMarg's mentorship ecosystem, career assessments, and professional growth journey.
          </p>
        </div>

        <div className="max-w-4xl mx-auto space-y-4">
          {faqs.map((faq, index) => (
            <FAQItem
              key={index}
              faq={faq}
              isOpen={openIndex === index}
              toggleOpen={() => setOpenIndex(openIndex === index ? null : index)}
            />
          ))}
        </div>

        <div className="mt-20 text-center">
          <div className="inline-flex flex-col items-center gap-6 rounded-[2.5rem] border border-white/60 bg-white/40 backdrop-blur-2xl p-10 shadow-xl shadow-slate-200/50 ring-1 ring-black/[0.03]">
            <p className="text-slate-600 font-medium">Still have questions? We're here to help.</p>
            <button className="inline-flex h-14 items-center justify-center gap-3 rounded-2xl bg-slate-950 px-10 text-base font-bold text-white shadow-xl shadow-slate-950/20 transition-all hover:bg-slate-800 hover:-translate-y-0.5 active:scale-95">
              Contact Support
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FAQSection;
