'use client';

import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { 
  Sparkles, 
  ArrowRight, 
  Target, 
  BookOpen, 
  Calendar,
  CheckCircle2,
  Clock
} from 'lucide-react';
import Link from 'next/link';

const StudentDashboard = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Mock data for immediate visual impact
  const mockInsights = [
    { title: 'Top Recommendation', value: 'UI/UX Designer', icon: Target, color: 'text-primary', bg: 'bg-primary/10' },
    { title: 'Profile Match', value: '88%', icon: Sparkles, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { title: 'Core Interests', value: 'Design, Tech', icon: BookOpen, color: 'text-amber-600', bg: 'bg-amber-50' },
  ];

  const upcomingSessions = [
    { mentor: 'Alex Rivers', topic: 'Portfolio Review', date: 'Tomorrow, 2:00 PM', status: 'Confirmed' },
    { mentor: 'Sarah Chen', topic: 'Career Pathing', date: 'Wed, 26th Mar', status: 'Pending' },
  ];

  return (
    <DashboardLayout userName={user?.name || "Student"}>
      <div className="space-y-10 pb-10">
        {/* WELCOME SECTION */}
        <section className="relative overflow-hidden rounded-3xl p-10 bg-slate-900 text-white shadow-2xl">
          <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-primary/30 to-transparent pointer-events-none" />
          <div className="relative z-10 max-w-2xl">
            <h1 className="text-4xl font-bold font-sora mb-4 leading-tight">
              Welcome back, <span className="text-primary-dim text-white">Shivansu!</span> 👋
            </h1>
            <p className="text-lg text-slate-300 font-inter mb-8">
              "The best way to predict your future is to create it." Ready to explore your career recommendations today?
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/assessment" className="btn-primary px-8 py-3.5 flex items-center gap-2">
                Continue Assessment
                <ArrowRight size={18} />
              </Link>
              <button className="px-8 py-3.5 bg-white/10 hover:bg-white/20 border border-white/20 rounded-full transition-all backdrop-blur-md">
                Browse Mentors
              </button>
            </div>
          </div>
          
          {/* Floating Assessment Score Card */}
          <div className="absolute top-10 right-10 hidden xl:flex flex-col items-center justify-center w-40 h-40 rounded-full bg-white/5 border border-white/10 backdrop-blur-xl animate-pulse-glow">
             <span className="text-xs uppercase tracking-widest text-primary font-bold">Clarity Score</span>
             <span className="text-4xl font-black font-sora">74%</span>
          </div>
        </section>

        {/* INSIGHTS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {mockInsights.map((insight, idx) => (
            <div key={idx} className="card-light p-6 group">
              <div className={`w-12 h-12 rounded-2xl ${insight.bg} flex items-center justify-center mb-4 transition-transform group-hover:scale-110`}>
                <insight.icon size={24} className={insight.color} />
              </div>
              <h3 className="text-slate-500 text-sm font-medium mb-1 font-inter">{insight.title}</h3>
              <p className="text-xl font-bold text-on-surface font-sora">{insight.value}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* MAIN COLUMN */}
          <div className="lg:col-span-2 space-y-10">
            {/* RECOMMENDED PATH */}
            <section className="bg-white rounded-3xl p-8 border border-border shadow-sm">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold font-sora text-on-surface">Recommended Career Path</h2>
                <button className="text-primary text-sm font-semibold hover:underline">View Roadmap</button>
              </div>
              
              <div className="relative p-1 bg-surface-dim rounded-2xl mb-8">
                <div className="flex items-center gap-4 bg-white p-6 rounded-xl border border-border">
                  <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center flex-shrink-0">
                    <Target className="text-primary" size={32} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold font-sora mb-1">Product Designer</h3>
                    <p className="text-slate-500 text-sm font-inter">Hybrid focus on User Experience and Product Strategy</p>
                  </div>
                  <div className="ml-auto text-center px-6 py-2 bg-emerald-50 rounded-full">
                    <span className="block text-[10px] uppercase tracking-wider font-bold text-emerald-600">Match Accuracy</span>
                    <span className="text-emerald-700 font-bold">High</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <p className="text-[14px] text-slate-600 font-inter font-medium mb-4">Why this fits your profile:</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                   {[
                     'High aptitude for visual systems',
                     'Empathetic approach to problem solving',
                     'Interest in Tech and Human Behavior',
                     'Strong communication skills observed'
                   ].map((point, i) => (
                     <div key={i} className="flex items-center gap-2 text-sm text-on-surface-variant bg-surface-dim px-4 py-2.5 rounded-lg border border-border/50">
                        <CheckCircle2 size={16} className="text-primary" />
                        {point}
                     </div>
                   ))}
                </div>
              </div>
            </section>
          </div>

          {/* SIDEBAR COLUMN */}
          <div className="space-y-8">
             {/* UPCOMING SESSIONS */}
             <section className="bg-white rounded-3xl p-6 border border-border shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-bold font-sora">Upcoming Sessions</h3>
                  <Calendar size={18} className="text-slate-400" />
                </div>
                <div className="space-y-4">
                   {upcomingSessions.map((session, i) => (
                     <div key={i} className="group p-4 rounded-2xl bg-surface-dim border border-transparent hover:border-primary/20 hover:bg-white transition-all">
                        <div className="flex justify-between items-start mb-2 font-inter">
                           <span className="text-sm font-bold text-on-surface">{session.mentor}</span>
                           <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                             session.status === 'Confirmed' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                           }`}>{session.status}</span>
                        </div>
                        <p className="text-xs text-slate-500 mb-2">{session.topic}</p>
                        <div className="flex items-center gap-2 text-[10px] text-primary font-bold">
                           <Clock size={12} />
                           {session.date}
                        </div>
                     </div>
                   ))}
                </div>
                <button className="w-full mt-6 py-3 rounded-xl border border-dashed border-border text-on-surface-variant hover:text-primary hover:border-primary/50 transition-all font-inter text-sm font-medium">
                  + Book New Session
                </button>
             </section>

             {/* PROFILE COMPLETION */}
             <div className="bg-primary/5 rounded-3xl p-6 border border-primary/10">
                <h3 className="font-bold text-sm text-primary mb-4 font-sora">Profile Completion</h3>
                <div className="h-2 w-full bg-white rounded-full overflow-hidden mb-3">
                   <div className="h-full bg-primary w-[74%] rounded-full shadow-lg shadow-primary/30" />
                </div>
                <p className="text-xs text-slate-600 font-inter mb-4">Complete your assessment to unlock peer comparisons.</p>
                <button className="text-xs font-bold text-primary hover:underline">Complete Now →</button>
             </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default StudentDashboard;