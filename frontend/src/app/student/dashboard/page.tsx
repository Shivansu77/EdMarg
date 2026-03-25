'use client';

import DashboardLayout from '@/components/dashboard/DashboardLayout';
import Link from 'next/link';
import {
  ArrowRight,
  Calendar,
  Check,
  Circle,
  Clock3,
  Gem,
  Mail,
  Sparkles,
  Zap,
} from 'lucide-react';

const requests = [
  { name: 'Alex Vance', track: 'Product Design', status: 'Pending', dot: 'bg-[#f59e0b]' },
  { name: 'Emily Chen', track: 'Software Engineering', status: 'Accepted', dot: 'bg-[#22c55e]' },
];

const updates = [
  {
    icon: Mail,
    title: 'New message from Sarah',
    text: '"Looking forward to our session today! Please review the..."',
    date: '2 hours ago',
  },
  {
    icon: Circle,
    title: 'Assessment Update',
    text: "Your 'Soft Skills' profile has been updated with new insights.",
    date: 'Yesterday',
  },
  {
    icon: Sparkles,
    title: 'Mentor Match Alert',
    text: 'We found 3 new mentors matching your profile.',
    date: '2 days ago',
  },
];

const history = [
  { title: 'Initial Consulting', subtitle: 'March 12, 2024 with Dr. Michael', badge: 'Completed' },
  { title: 'Resume Workshop', subtitle: 'March 05, 2024 with Jessica K.', badge: 'Completed' },
];

export default function StudentDashboard() {
  return (
    <DashboardLayout userName="Student Dashboard">
      <div className="space-y-6 pb-8">
        <section className="rounded-2xl bg-gradient-to-r from-[#4f46e5] to-[#6d36d8] p-8 shadow-[0_12px_30px_rgba(79,70,229,0.3)]">
          <div className="flex flex-col md:flex-row gap-5 md:items-center md:justify-between">
            <div>
              <h2 className="text-white text-[50px] leading-none tracking-[-0.03em] font-extrabold">Unlock your career path.</h2>
              <p className="text-[#d8d2ff] text-[29px] leading-tight mt-3 max-w-3xl">
                You haven&apos;t completed your baseline career assessment yet. Discover mentors tailored to your unique profile.
              </p>
            </div>
            <Link href="/student/assessment" className="shrink-0 bg-white text-[#4f46e5] px-10 py-4 rounded-full font-bold text-[20px] inline-flex items-center gap-2">
              Start Assessment <ArrowRight size={20} />
            </Link>
          </div>
        </section>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
          <div className="xl:col-span-8 space-y-6">
            <section className="bg-white rounded-2xl border border-[#e7e9f0] p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-3">
                  <p className="text-[13px] font-bold uppercase tracking-[0.16em] text-[#5a53e8] flex items-center gap-2">
                    <Calendar size={15} /> Upcoming Session
                  </p>
                  <h3 className="text-[42px] leading-none tracking-[-0.03em] font-extrabold text-[#303546]">Career Mentorship with Sarah</h3>
                  <p className="text-[#6e768b] text-[23px] flex items-center gap-2">
                    <Clock3 size={15} /> 2:00 PM today • 45 minutes
                  </p>
                  <div className="flex gap-3 pt-1">
                    <button className="px-6 py-2 rounded-full bg-[#5a53e8] text-white text-[18px] font-semibold">Join Meeting</button>
                    <button className="px-6 py-2 rounded-full bg-[#eef1f6] text-[#5c6479] text-[18px] font-semibold">Reschedule</button>
                  </div>
                </div>

                <img
                  src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&q=80"
                  alt="Mentor Sarah"
                  className="h-24 w-24 rounded-2xl object-cover border border-[#e7e9f0]"
                />
              </div>
            </section>

            <section className="bg-white rounded-2xl border border-[#e7e9f0] p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-[37px] leading-none tracking-[-0.03em] font-extrabold text-[#303546]">Career Progress</h3>
                <p className="text-[#5a53e8] text-[22px] font-bold">Level 2 / 5</p>
              </div>
              <div className="h-3 w-full bg-[#e5e8ef] rounded-full overflow-hidden">
                <div className="h-full w-[46%] bg-gradient-to-r from-[#49a6ff] to-[#5745e7] rounded-full" />
              </div>
              <p className="text-[17px] italic text-[#8a92a7]">Next milestone: Professional Portfolio Review</p>
            </section>

            <section className="space-y-3">
              <div className="flex items-center justify-between px-1">
                <h3 className="text-[39px] leading-none tracking-[-0.03em] font-extrabold text-[#303546]">Recent History</h3>
                <button className="text-[#5a53e8] text-[22px] font-bold">View all</button>
              </div>
              <div className="bg-white rounded-2xl border border-[#e7e9f0] overflow-hidden">
                {history.map((item, idx) => (
                  <div key={item.title} className={`p-4 flex items-center justify-between ${idx !== history.length - 1 ? 'border-b border-[#edf0f5]' : ''}`}>
                    <div className="flex items-center gap-3">
                      <div className={`h-11 w-11 rounded-xl ${idx === 0 ? 'bg-[#efe8ff]' : 'bg-[#d9f0ff]'} flex items-center justify-center`}>
                        {idx === 0 ? <Gem size={18} className="text-[#7d49ea]" /> : <Check size={18} className="text-[#2d86c7]" />}
                      </div>
                      <div>
                        <p className="text-[26px] leading-none tracking-[-0.02em] font-bold text-[#303546]">{item.title}</p>
                        <p className="text-[18px] text-[#7a8296] mt-1">{item.subtitle}</p>
                      </div>
                    </div>
                    <span className="rounded-full px-3 py-1 bg-[#dcf8e8] text-[#20965a] text-[13px] font-bold uppercase">{item.badge}</span>
                  </div>
                ))}
              </div>
            </section>
          </div>

          <div className="xl:col-span-4 space-y-6">
            <section className="bg-white rounded-2xl border border-[#e7e9f0] p-5 space-y-4">
              <h3 className="text-[38px] leading-none tracking-[-0.03em] font-extrabold text-[#303546]">Active Requests</h3>
              {requests.map((request) => (
                <div key={request.name} className="flex items-center gap-3">
                  <img
                    src={`https://ui-avatars.com/api/?background=edeff5&color=4b5265&name=${encodeURIComponent(request.name)}`}
                    alt={request.name}
                    className="h-11 w-11 rounded-full border border-[#e7e9f0]"
                  />
                  <div className="flex-1">
                    <p className="text-[24px] leading-none tracking-[-0.02em] font-bold text-[#303546]">{request.name}</p>
                    <p className="text-[18px] text-[#7a8296] mt-1">{request.track}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`h-2.5 w-2.5 rounded-full ${request.dot}`} />
                    <span className={`rounded px-2 py-1 text-[11px] uppercase font-bold ${request.status === 'Pending' ? 'bg-[#fff1dd] text-[#d47f0e]' : 'bg-[#e5f8ec] text-[#23985a]'}`}>
                      {request.status}
                    </span>
                  </div>
                </div>
              ))}
            </section>

            <section className="bg-white rounded-2xl border border-[#e7e9f0] p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-[38px] leading-none tracking-[-0.03em] font-extrabold text-[#303546]">Updates</h3>
                <span className="h-6 min-w-6 px-1 rounded-full bg-[#5a53e8] text-white text-[11px] font-bold inline-flex items-center justify-center">3</span>
              </div>

              {updates.map((update) => (
                <div key={update.title} className="flex items-start gap-3">
                  <div className="h-8 w-8 rounded-full bg-[#eef0f7] text-[#6e75ca] flex items-center justify-center mt-0.5">
                    <update.icon size={14} />
                  </div>
                  <div>
                    <p className="text-[21px] leading-none tracking-[-0.02em] font-bold text-[#303546]">{update.title}</p>
                    <p className="text-[16px] text-[#7a8296] mt-1 leading-snug">{update.text}</p>
                    <p className="text-[14px] font-semibold text-[#5660da] mt-1">{update.date}</p>
                  </div>
                </div>
              ))}

              <button className="w-full text-center text-[20px] font-semibold text-[#5f667a] pt-2">Mark all as read</button>
              <div className="flex justify-end">
                <button className="h-11 w-11 rounded-full bg-[#5a53e8] text-white flex items-center justify-center">
                  <Zap size={18} />
                </button>
              </div>
            </section>

            <section className="bg-[#dfd4ff] rounded-2xl p-5 space-y-2">
              <p className="text-[13px] font-bold uppercase tracking-[0.08em] text-[#6647d8] flex items-center gap-2"><Zap size={13} /> Pro Tip</p>
              <p className="text-[24px] leading-tight tracking-[-0.02em] font-bold text-[#5f42c9]">
                Students who complete 3 sessions in their first month are 4x more likely to secure internships.
              </p>
              <button className="text-[19px] font-bold text-[#5f42c9]">Explore More Mentors</button>
            </section>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
