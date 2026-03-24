'use client';

import React from 'react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { 
  Users, 
  Star, 
  Calendar, 
  Clock, 
  TrendingUp,
  MessageSquare,
  DollarSign
} from 'lucide-react';

const MentorDashboard = () => {
  // Mock data for mentor
  const stats = [
    { label: 'Total Mentees', value: '24', icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Avg Rating', value: '4.9', icon: Star, iconProps: { fill: 'currentColor' }, color: 'text-amber-500', bg: 'bg-amber-50' },
    { label: 'Total Sessions', value: '142', icon: Calendar, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Hours Mentored', value: '210', icon: Clock, color: 'text-purple-600', bg: 'bg-purple-50' },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-8 animate-in fade-in duration-700">
        {/* Header Hero */}
        <div className="relative overflow-hidden rounded-3xl bg-slate-900 p-8 text-white shadow-2xl transition-all hover:shadow-primary/10">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h1 className="text-3xl font-bold font-sora mb-2 tracking-tight">Welcome, Mentor! 👋</h1>
              <p className="text-slate-400 font-inter max-w-lg">
                Your expertise is shaping the future. Check your upcoming sessions and mentee progress today.
              </p>
            </div>
            <div className="flex gap-4">
              <button className="px-6 py-3 bg-white text-slate-900 rounded-xl font-bold font-inter text-sm hover:bg-slate-100 transition-all shadow-lg active:scale-95">
                My Calendar
              </button>
              <button className="px-6 py-3 bg-primary text-white rounded-xl font-bold font-inter text-sm hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 active:scale-95">
                Create Session
              </button>
            </div>
          </div>
          {/* Decorative Elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-[100px] -mr-32 -mt-32" />
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat) => (
            <div key={stat.label} className="bg-white p-6 rounded-2xl border border-border shadow-sm hover:shadow-md transition-all group">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-xl ${stat.bg} ${stat.color} transition-colors group-hover:scale-110 duration-300`}>
                  <stat.icon size={24} {...(stat.iconProps || {})} />
                </div>
                <div className="flex items-center gap-1 text-emerald-500 font-bold text-xs uppercase tracking-wider">
                  <TrendingUp size={14} /> +12%
                </div>
              </div>
              <p className="text-on-surface-variant font-medium text-sm mb-1">{stat.label}</p>
              <h3 className="text-2xl font-bold font-sora text-on-surface">{stat.value}</h3>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Upcoming Sessions */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold font-sora text-on-surface tracking-tight">Today's Sessions</h2>
              <button className="text-primary text-sm font-bold hover:underline">View All</button>
            </div>
            
            <div className="space-y-4">
              {[1, 2].map((i) => (
                <div key={i} className="bg-white p-5 rounded-2xl border border-border shadow-sm flex items-center justify-between hover:border-primary/30 transition-all group">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                      <Users size={20} />
                    </div>
                    <div>
                      <h4 className="font-bold font-sora text-on-surface leading-tight">Student Name {i}</h4>
                      <p className="text-xs font-inter text-on-surface-variant mt-1">Career Goal: Full-Stack Dev</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <p className="font-bold font-inter text-sm text-on-surface">10:00 AM</p>
                      <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest mt-0.5">Confirmed</p>
                    </div>
                    <button className="p-2.5 rounded-xl bg-slate-50 text-slate-400 hover:bg-primary/10 hover:text-primary transition-all">
                      <MessageSquare size={20} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Earnings / Performance */}
          <div className="space-y-6">
            <h2 className="text-xl font-bold font-sora text-on-surface tracking-tight">Monthly Performance</h2>
            <div className="bg-gradient-to-br from-primary to-indigo-600 p-6 rounded-2xl text-white shadow-xl shadow-primary/20">
              <div className="flex items-center justify-between mb-8">
                <div className="p-3 bg-white/20 rounded-xl backdrop-blur-md">
                  <DollarSign size={24} />
                </div>
                <div className="text-[10px] font-bold bg-emerald-500/30 px-2 py-1 rounded-full backdrop-blur-md">
                  PAID OUT
                </div>
              </div>
              <p className="text-white/60 text-sm font-medium mb-1">Total Earnings</p>
              <h3 className="text-3xl font-bold font-sora mb-6">₹12,450.00</h3>
              <div className="h-2 w-full bg-black/10 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-400 rounded-full" style={{ width: '75%' }} />
              </div>
              <p className="text-xs text-white/60 mt-2 font-medium">75% of your target reached</p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default MentorDashboard;