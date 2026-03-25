'use client';

import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Circle,
  Lightbulb,
  MapPin,
  Star,
  Video,
} from 'lucide-react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';

const days = [
  { label: 'MON', date: '14' },
  { label: 'TUE', date: '15', active: true },
  { label: 'WED', date: '16' },
  { label: 'THU', date: '17' },
  { label: 'FRI', date: '18' },
  { label: 'SAT', date: '19' },
];

const slots = [
  { time: '09:00 AM' },
  { time: '11:30 AM' },
  { time: '03:00 PM', active: true },
  { time: '04:30 PM' },
  { time: '05:00 PM' },
  { time: '07:00 PM', disabled: true },
];

const tags = ['Product Management', 'Career Pivot', 'Interview Prep', 'Portfolio Review'];

export default function BookingPage() {
  return (
    <DashboardLayout userName="Booking">
      <div className="space-y-5">
        <section className="rounded-2xl border border-[#e4e7ee] bg-white p-6">
          <div className="flex items-start justify-between gap-6">
            <div className="flex gap-5">
              <div className="relative h-[130px] w-[130px] overflow-hidden rounded-2xl bg-[#ece7de] p-3">
                <div className="h-full w-full rounded-xl bg-[#f8f5ee] shadow-inner" />
                <span className="absolute bottom-2 right-2 rounded-full bg-[#5a48ea] px-3 py-1 text-[11px] font-bold text-white">
                  TOP RATED
                </span>
              </div>

              <div>
                <h2 className="text-[42px] font-extrabold leading-none tracking-[-0.03em] text-[#2f3445]">Elena Rodriguez</h2>
                <p className="mt-2 flex items-center gap-1.5 text-[26px] font-bold text-[#4f46e5]">
                  <MapPin size={16} /> Senior Product Strategist @ Fintech Global
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full bg-[#ede8ff] px-4 py-1.5 text-[22px] font-semibold text-[#5e4ce6]"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <button className="rounded-full bg-[#5747e8] px-8 py-3 text-[22px] font-bold text-white shadow-[0_8px_18px_rgba(87,71,232,0.28)]">
              Connect with Mentor
            </button>
          </div>

          <div className="mt-6 grid grid-cols-3 border-t border-[#eceef5] pt-4">
            <div>
              <p className="text-[18px] font-semibold uppercase tracking-[0.08em] text-[#8c93a4]">Experience</p>
              <p className="text-[37px] font-bold text-[#2f3445]">12+ Years</p>
            </div>
            <div>
              <p className="text-[18px] font-semibold uppercase tracking-[0.08em] text-[#8c93a4]">Students</p>
              <p className="text-[37px] font-bold text-[#2f3445]">140+</p>
            </div>
            <div>
              <p className="text-[18px] font-semibold uppercase tracking-[0.08em] text-[#8c93a4]">Rating</p>
              <p className="flex items-center gap-1 text-[37px] font-bold text-[#2f3445]">
                4.9 <Star size={18} className="fill-[#f8b400] text-[#f8b400]" />
              </p>
            </div>
          </div>
        </section>

        <div className="grid grid-cols-[2.2fr_1fr] gap-5">
          <section className="rounded-2xl border border-[#e4e7ee] bg-white p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-[38px] font-bold tracking-[-0.02em] text-[#2f3445]">Select a Time Slot</h3>
              <div className="flex gap-2">
                <button className="rounded-lg bg-[#f1f3f7] p-2.5 text-[#646d82]">
                  <ChevronLeft size={20} />
                </button>
                <button className="rounded-lg bg-[#f1f3f7] p-2.5 text-[#646d82]">
                  <ChevronRight size={20} />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-6 gap-3">
              {days.map((day) => (
                <button
                  key={`${day.label}-${day.date}`}
                  className={`rounded-xl py-4 text-center ${
                    day.active ? 'bg-[#5747e8] text-white shadow-lg' : 'bg-[#f3f5f9] text-[#41495d]'
                  }`}
                >
                  <p className="text-[15px] font-semibold">{day.label}</p>
                  <p className="text-[34px] font-bold leading-tight">{day.date}</p>
                </button>
              ))}
            </div>

            <p className="mt-6 flex items-center gap-2 text-[22px] font-semibold text-[#60697e]">
              <Circle size={8} className="fill-[#60697e] text-[#60697e]" /> Available times for Tuesday, June 15
            </p>

            <div className="mt-4 grid grid-cols-3 gap-3">
              {slots.map((slot) => (
                <button
                  key={slot.time}
                  className={`rounded-xl px-4 py-3 text-[31px] font-semibold ${
                    slot.active
                      ? 'bg-[#5747e8] text-white'
                      : slot.disabled
                        ? 'bg-[#f1f3f7] text-[#a7adbd]'
                        : 'bg-[#f1f3f7] text-[#42495b]'
                  }`}
                >
                  {slot.time}
                </button>
              ))}
            </div>
          </section>

          <aside className="space-y-4">
            <section className="rounded-2xl border border-[#d9dde6] bg-[#e7ebf2] p-6">
              <h3 className="text-[38px] font-bold tracking-[-0.02em] text-[#2f3445]">Booking Details</h3>

              <div className="mt-5 space-y-4 border-t border-[#d6dbe6] pt-4">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-white p-2 text-[#5a48ea]">
                    <Calendar size={18} />
                  </div>
                  <div>
                    <p className="text-[15px] font-semibold uppercase text-[#81889a]">Date</p>
                    <p className="text-[31px] font-semibold text-[#313746]">Tuesday, June 15</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-white p-2 text-[#5a48ea]">
                    <Circle size={18} className="fill-[#5a48ea]" />
                  </div>
                  <div>
                    <p className="text-[15px] font-semibold uppercase text-[#81889a]">Time</p>
                    <p className="text-[31px] font-semibold text-[#313746]">03:00 PM (45 min)</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-white p-2 text-[#5a48ea]">
                    <Video size={18} />
                  </div>
                  <div>
                    <p className="text-[15px] font-semibold uppercase text-[#81889a]">Format</p>
                    <p className="text-[31px] font-semibold text-[#313746]">1:1 Video Call</p>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex items-end justify-between">
                <p className="text-[34px] text-[#5f677c]">Session Fee</p>
                <p className="text-[46px] font-extrabold text-[#2f3445]">$45.00</p>
              </div>

              <button className="mt-5 w-full rounded-full bg-[#5747e8] py-3 text-[30px] font-bold text-white">
                Confirm Booking
              </button>
              <p className="mt-3 text-center text-[14px] text-[#7f8798]">
                By confirming, you agree to our mentoring agreement and 24-hour cancellation policy.
              </p>
            </section>

            <section className="rounded-2xl border border-[#b5d4f0] bg-[#d8edff] p-4">
              <p className="flex items-center gap-2 text-[28px] font-bold text-[#0e5785]">
                <Lightbulb size={20} /> Pro Tip
              </p>
              <p className="mt-1 text-[17px] text-[#2d668f]">
                Sharing your LinkedIn profile in the request helps mentors provide more personalized advice.
              </p>
            </section>
          </aside>
        </div>

        <section className="rounded-2xl border border-[#e4e7ee] bg-white p-6">
          <h3 className="text-[38px] font-bold tracking-[-0.02em] text-[#2f3445]">Raise a request</h3>
          <p className="mt-1 text-[24px] text-[#687287]">
            Briefly describe what you&#39;d like to discuss in this session to help Elena prepare.
          </p>
          <textarea
            className="mt-4 h-28 w-full resize-none rounded-xl border border-transparent bg-[#f1f3f7] px-4 py-3 text-[27px] text-[#41495b] outline-none placeholder:text-[#a2a9b9]"
            placeholder="I'd love to get feedback on my portfolio strategy and discuss potential career paths in fintech..."
          />
        </section>
      </div>
    </DashboardLayout>
  );
}
