'use client';

import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { BadgeCheck, Blend, Hand, SearchCheck } from 'lucide-react';

const competencies = [
  {
    title: 'UX Research',
    description:
      'Your ability to synthesize complex qualitative data into actionable insights is in the top 5th percentile of applicants.',
    icon: SearchCheck,
    iconBg: 'bg-[#ebe8ff]',
    iconColor: 'text-[#6b58e7]',
  },
  {
    title: 'Visual Design',
    description:
      'You possess a natural eye for hierarchy and balance, ensuring that information is not just functional, but aesthetically pleasing.',
    icon: Blend,
    iconBg: 'bg-[#f1eaff]',
    iconColor: 'text-[#7347dd]',
  },
  {
    title: 'Interaction Design',
    description:
      'Logic-driven flow creation comes easily to you. You predict user behavior before the first click happens.',
    icon: Hand,
    iconBg: 'bg-[#dff4ff]',
    iconColor: 'text-[#0074a8]',
  },
];

export default function ResultsPage() {
  return (
    <DashboardLayout userName="Analysis Complete">
      <section className="space-y-8">
        <div>
          <p className="text-lg text-[#788091]">We&apos;ve curated your professional identity based on 42 unique markers.</p>
        </div>

        <article className="rounded-[24px] border-[4px] border-[#6254e8] bg-gradient-to-br from-white via-white to-[#f7f4ff] p-10">
          <div className="flex flex-col gap-10 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-[620px]">
              <span className="inline-block rounded-full bg-[#e8deff] px-4 py-1 text-xs font-extrabold tracking-[0.06em] text-[#5e4ce2]">
                MATCH SCORE: 98%
              </span>

              <h2 className="mt-5 text-[58px] leading-[0.95] font-black tracking-[-0.035em] text-[#2f3445]">
                Your Recommended
                <br />
                Path: <span className="text-[#5a4be6]">Product Design</span>
              </h2>

              <p className="mt-6 max-w-[520px] text-[30px] leading-[1.34] text-[#666f80]">
                Your aptitude for empathizing with user pain points combined with a strong structural logic suggests you would
                excel in roles that bridge the gap between human needs and technical constraints. You prioritize clarity,
                flow, and visual harmony.
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-4">
                <button className="rounded-full bg-gradient-to-r from-[#4e44e7] to-[#5b4fe8] px-9 py-4 text-2xl font-bold text-white shadow-[0_12px_30px_rgba(88,73,232,0.35)] transition hover:brightness-105">
                  Find a Mentor in Product Design
                </button>
                <button className="rounded-full bg-[#e6eaef] px-9 py-4 text-2xl font-bold text-[#384050] transition hover:bg-[#dce2eb]">
                  View Full Syllabus
                </button>
              </div>
            </div>

            <div className="mx-auto flex h-[380px] w-[290px] items-center justify-center rounded-[140px] border-[18px] border-[#d8cffd] bg-white lg:mx-0">
              <BadgeCheck size={86} className="text-[#5349e5]" strokeWidth={2.2} />
            </div>
          </div>
        </article>

        <section>
          <h3 className="text-[44px] leading-tight font-black tracking-[-0.03em] text-[#2f3445]">Core Competencies</h3>
          <p className="mt-1 text-2xl text-[#727b8d]">Three pillars identified as your natural strengths.</p>

          <div className="mt-5 grid gap-5 xl:grid-cols-3">
            {competencies.map((item) => (
              <article key={item.title} className="rounded-[24px] bg-white p-8 shadow-[0_8px_30px_rgba(21,28,40,0.05)]">
                <div className={`mb-5 inline-flex h-14 w-14 items-center justify-center rounded-2xl ${item.iconBg}`}>
                  <item.icon size={30} className={item.iconColor} strokeWidth={2.2} />
                </div>
                <h4 className="text-[38px] font-extrabold tracking-[-0.03em] text-[#2f3445]">{item.title}</h4>
                <p className="mt-3 text-[28px] leading-[1.35] text-[#6a7384]">{item.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="grid gap-5 xl:grid-cols-[1.4fr_1fr]">
          <article className="rounded-[24px] bg-white p-8 shadow-[0_8px_30px_rgba(21,28,40,0.05)]">
            <h3 className="text-[44px] leading-tight font-black tracking-[-0.03em] text-[#2f3445]">Why Product Design?</h3>
            <p className="mt-4 text-[30px] leading-[1.35] text-[#667082]">
              Based on your assessment, you demonstrated a high &quot;Holistic Thinking&quot; score. Product Design requires a
              candidate to look at the &apos;Big Picture&apos; while obsessing over the details—a trait you displayed throughout
              the behavioral section of the quiz.
            </p>
            <div className="mt-7 rounded-2xl bg-[#f7f9fc] px-6 py-4 text-[24px] text-[#4a5263]">
              <span className="font-extrabold text-[#5a4be6]">120+ Product Designers</span> are ready to mentor you today.
            </div>
          </article>

          <article className="rounded-[24px] bg-[#0d74a3] p-8 text-white shadow-[0_10px_28px_rgba(6,65,95,0.35)]">
            <h3 className="text-[40px] leading-tight font-black tracking-[-0.03em]">Mentorship Impact</h3>
            <p className="mt-4 text-[28px] leading-[1.35] text-[#dbf1ff]">
              Students who follow their recommended path with a mentor see a <span className="font-extrabold">45% faster</span>{' '}
              job placement rate.
            </p>
            <div className="mt-8 h-2 w-full rounded-full bg-[#5ca9cb]">
              <div className="h-2 w-[75%] rounded-full bg-white" />
            </div>
            <p className="mt-3 text-[20px] font-extrabold tracking-[0.18em] text-[#d7f1ff]">INDUSTRY READINESS: 75%</p>
          </article>
        </section>
      </section>
    </DashboardLayout>
  );
}
