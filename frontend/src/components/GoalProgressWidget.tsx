'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { apiClient } from '@/utils/api-client';
import { Target, CheckCircle2, CircleDashed, ArrowRight, Loader2, Calendar } from 'lucide-react';

interface GoalProgress {
  totalGoals: number;
  activeCount: number;
  completedCount: number;
  pausedCount: number;
  avgProgress: number;
  nextMilestone: { goalTitle: string; milestone: string } | null;
  nearestDeadline: { goalTitle: string; date: string } | null;
}

export default function GoalProgressWidget() {
  const [data, setData] = useState<GoalProgress | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProgress = async () => {
      try {
        const res = await apiClient.get<GoalProgress>('/api/v1/goals/progress');
        if (res.success && res.data) {
          setData(res.data);
        }
      } catch (err) {
        console.error('Failed to load goal progress', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProgress();
  }, []);

  if (loading) {
    return (
      <div className="rounded-[2rem] border border-white/60 bg-white/40 backdrop-blur-xl p-6 shadow-sm flex items-center justify-center min-h-[200px]">
        <Loader2 className="h-6 w-6 animate-spin text-emerald-500" />
      </div>
    );
  }

  if (!data || data.activeCount === 0) {
    return (
      <div className="rounded-[2rem] border border-white/60 bg-white/40 backdrop-blur-xl p-6 shadow-[0_8px_32px_rgba(0,0,0,0.04)]">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-green-500 text-white shadow-md shadow-emerald-500/20">
            <Target className="h-5 w-5" />
          </div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Your Goals</h2>
        </div>
        
        <div className="rounded-2xl border border-dashed border-emerald-200 bg-emerald-50/50 p-6 text-center">
          <CircleDashed className="h-8 w-8 text-emerald-300 mx-auto mb-2" />
          <p className="text-sm font-bold text-slate-900">No active goals</p>
          <p className="text-xs text-slate-500 mt-1 mb-4">Set a learning or career goal to start tracking progress.</p>
          <Link
            href="/student/goals"
            className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-4 py-2 text-xs font-bold text-white transition-colors hover:bg-slate-800"
          >
            Create Goal <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      </div>
    );
  }

  // Calculate SVG arc for progress ring
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (data.avgProgress / 100) * circumference;

  return (
    <div className="rounded-[2rem] border border-white/60 bg-white/40 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.04)] overflow-hidden">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-green-500 text-white shadow-md shadow-emerald-500/20">
              <Target className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Goals Progress</h2>
              <p className="text-xs font-medium text-slate-500">{data.activeCount} active goals</p>
            </div>
          </div>
          <Link
            href="/student/goals"
            className="h-8 w-8 flex items-center justify-center rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900 transition-colors"
          >
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="flex items-center gap-6 mb-6">
          <div className="relative h-24 w-24 shrink-0">
            {/* Background ring */}
            <svg className="h-full w-full -rotate-90" viewBox="0 0 80 80">
              <circle
                className="text-slate-100"
                strokeWidth="6"
                stroke="currentColor"
                fill="transparent"
                r={radius}
                cx="40"
                cy="40"
              />
              {/* Progress ring */}
              <circle
                className="text-emerald-500 drop-shadow-[0_0_8px_rgba(16,185,129,0.3)] transition-all duration-1000 ease-out"
                strokeWidth="6"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                stroke="currentColor"
                fill="transparent"
                r={radius}
                cx="40"
                cy="40"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-extrabold text-slate-900 tracking-tight">{data.avgProgress}%</span>
            </div>
          </div>

          <div className="flex-1 space-y-4">
            {data.nextMilestone ? (
              <div className="rounded-xl bg-white/60 border border-slate-100 p-3 shadow-sm">
                <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 mb-1">Up Next</p>
                <p className="text-xs font-bold text-slate-900 line-clamp-1">{data.nextMilestone.milestone}</p>
                <p className="text-[11px] text-slate-500 truncate mt-0.5">from {data.nextMilestone.goalTitle}</p>
              </div>
            ) : (
              <div className="rounded-xl bg-white/60 border border-slate-100 p-3 shadow-sm flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                <p className="text-xs font-bold text-slate-700">All milestones completed!</p>
              </div>
            )}
          </div>
        </div>

        {data.nearestDeadline && (
          <div className="flex items-center gap-3 rounded-xl bg-slate-50 border border-slate-100 p-3 mt-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white shadow-sm border border-slate-100 text-amber-500 shrink-0">
              <Calendar className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-bold text-slate-900 truncate">
                Deadline: {new Date(data.nearestDeadline.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
              </p>
              <p className="text-[10px] text-slate-500 truncate">{data.nearestDeadline.goalTitle}</p>
            </div>
          </div>
        )}
      </div>
      
      <div className="bg-slate-50 border-t border-slate-100 px-6 py-3 flex items-center justify-between">
        <div className="text-xs text-slate-500 font-medium">
          <span className="font-bold text-slate-900">{data.completedCount}</span> completed
        </div>
        <Link href="/student/goals" className="text-xs font-bold text-emerald-600 hover:text-emerald-700">
          Update Progress
        </Link>
      </div>
    </div>
  );
}
