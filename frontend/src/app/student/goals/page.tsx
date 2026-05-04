'use client';

import React, { useEffect, useState } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { apiClient } from '@/utils/api-client';
import { Target, Plus, CheckCircle2, CircleDashed, Loader2, ArrowRight, Play, Check } from 'lucide-react';
import Link from 'next/link';

interface Milestone {
  _id?: string;
  title: string;
  completed: boolean;
  completedAt?: string;
}

interface Goal {
  _id: string;
  title: string;
  description: string;
  category: string;
  status: 'active' | 'completed' | 'paused';
  progress: number;
  targetDate?: string;
  milestones: Milestone[];
  linkedSessions: any[];
}

function GoalsContent() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // New goal form state
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newCategory, setNewCategory] = useState('technical');
  const [newMilestones, setNewMilestones] = useState([{ title: '' }]);

  const fetchGoals = async () => {
    try {
      const res = await apiClient.get<Goal[]>('/api/v1/goals');
      if (res.success && res.data) setGoals(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGoals();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    setIsSubmitting(true);
    try {
      const milestones = newMilestones.filter(m => m.title.trim()).map(m => ({ title: m.title.trim() }));
      const res = await apiClient.post('/api/v1/goals', {
        title: newTitle,
        description: newDesc,
        category: newCategory,
        milestones,
      });

      if (res.success) {
        setShowModal(false);
        setNewTitle('');
        setNewDesc('');
        setNewMilestones([{ title: '' }]);
        await fetchGoals();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleMilestone = async (goalId: string, milestoneIndex: number) => {
    const goal = goals.find(g => g._id === goalId);
    if (!goal) return;

    const newMilestonesList = [...goal.milestones];
    newMilestonesList[milestoneIndex].completed = !newMilestonesList[milestoneIndex].completed;

    setGoals(goals.map(g => g._id === goalId ? { ...g, milestones: newMilestonesList } : g));

    try {
      await apiClient.put(`/api/v1/goals/${goalId}`, {
        milestones: newMilestonesList
      });
      fetchGoals(); // refresh to get auto-calculated progress
    } catch (err) {
      console.error(err);
      fetchGoals(); // revert on fail
    }
  };

  const activeGoals = goals.filter(g => g.status === 'active');
  const completedGoals = goals.filter(g => g.status === 'completed');

  if (loading) {
    return (
      <DashboardLayout userName="Goals">
        <div className="flex min-h-[80vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout userName="Your Goals">
      <div className="min-h-screen pb-16">
        
        {/* Header */}
        <div className="relative overflow-hidden border-b border-white/60 bg-white/40 backdrop-blur-3xl px-6 pb-12 pt-10 sm:px-12">
          <div className="absolute top-0 right-0 h-[30rem] w-[30rem] rounded-full bg-emerald-200/20 blur-[100px] pointer-events-none" />
          <div className="relative z-10 w-full max-w-5xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50/80 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-700 mb-6">
                Outcome Tracker
              </div>
              <h1 className="text-4xl font-extrabold tracking-tight text-slate-950 sm:text-5xl">
                Your Learning Goals
              </h1>
              <p className="mt-4 max-w-xl text-lg text-slate-600 font-medium">
                Set clear objectives, track your progress, and link mentor sessions to your personal growth.
              </p>
            </div>
            
            <button
              onClick={() => setShowModal(true)}
              className="inline-flex h-14 items-center justify-center gap-2 rounded-2xl bg-emerald-500 px-8 text-base font-bold text-white shadow-xl shadow-emerald-500/25 transition-all hover:bg-emerald-600 hover:-translate-y-0.5 active:scale-95 shrink-0"
            >
              <Plus className="h-5 w-5" /> Create New Goal
            </button>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-6 py-10 space-y-12">
          
          {goals.length === 0 ? (
            <div className="rounded-[2.5rem] border border-dashed border-slate-300 bg-white/50 backdrop-blur-xl p-16 text-center shadow-sm">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-emerald-50 text-emerald-500 mb-6 shadow-inner">
                <Target className="h-10 w-10" />
              </div>
              <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">No goals set yet</h2>
              <p className="mt-3 text-slate-500 max-w-md mx-auto text-base">
                Start tracking your learning journey by setting your first goal. Break it down into milestones to make it achievable.
              </p>
              <button
                onClick={() => setShowModal(true)}
                className="mt-8 inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-slate-900 px-6 text-sm font-bold text-white transition-all hover:bg-slate-800"
              >
                Create your first goal
              </button>
            </div>
          ) : (
            <>
              {/* Active Goals Grid */}
              <div className="space-y-6">
                <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
                  Active Goals
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-600">
                    {activeGoals.length}
                  </span>
                </h2>
                
                {activeGoals.length === 0 ? (
                  <p className="text-slate-500 italic">No active goals currently.</p>
                ) : (
                  <div className="grid gap-6 md:grid-cols-2">
                    {activeGoals.map(goal => (
                      <div key={goal._id} className="rounded-[2rem] border border-white/60 bg-white/40 backdrop-blur-xl p-8 shadow-[0_8px_32px_rgba(0,0,0,0.04)] hover:shadow-lg transition-all">
                        <div className="flex justify-between items-start mb-6">
                          <div>
                            <span className="inline-block px-2.5 py-1 rounded-md bg-slate-100 text-slate-600 text-[10px] font-bold uppercase tracking-wider mb-3">
                              {goal.category}
                            </span>
                            <h3 className="text-xl font-extrabold text-slate-900 line-clamp-1">{goal.title}</h3>
                            {goal.description && <p className="text-sm text-slate-500 mt-2 line-clamp-2">{goal.description}</p>}
                          </div>
                          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 font-extrabold text-sm border border-emerald-100 shrink-0">
                            {goal.progress}%
                          </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden mb-8">
                          <div
                            className="h-full bg-emerald-500 rounded-full transition-all duration-1000"
                            style={{ width: `${goal.progress}%` }}
                          />
                        </div>

                        {/* Milestones */}
                        <div className="space-y-3">
                          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Milestones</h4>
                          {goal.milestones.map((m, i) => (
                            <div key={i} className="flex items-start gap-3 group">
                              <button
                                onClick={() => toggleMilestone(goal._id, i)}
                                className={`mt-0.5 shrink-0 flex h-5 w-5 items-center justify-center rounded-full border transition-colors ${
                                  m.completed
                                    ? 'bg-emerald-500 border-emerald-500 text-white'
                                    : 'border-slate-300 text-transparent hover:border-emerald-400'
                                }`}
                              >
                                <Check className="h-3 w-3" />
                              </button>
                              <span className={`text-sm font-medium transition-colors ${m.completed ? 'text-slate-400 line-through' : 'text-slate-700'}`}>
                                {m.title}
                              </span>
                            </div>
                          ))}
                        </div>

                        {goal.linkedSessions?.length > 0 && (
                          <div className="mt-8 pt-6 border-t border-slate-100">
                            <p className="text-xs font-bold text-slate-500 mb-2">Linked Sessions</p>
                            <div className="flex flex-wrap gap-2">
                              {goal.linkedSessions.map((session, i) => (
                                <Link
                                  key={i}
                                  href="/student/history"
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-100 text-xs font-semibold text-slate-700 hover:bg-slate-100"
                                >
                                  <Play className="h-3 w-3 text-emerald-500" /> Session {new Date(session.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                </Link>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Completed Goals */}
              {completedGoals.length > 0 && (
                <div className="space-y-6 pt-10 border-t border-slate-200">
                  <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
                    Completed Achievements
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 text-xs font-bold text-emerald-700">
                      {completedGoals.length}
                    </span>
                  </h2>
                  <div className="grid gap-4 md:grid-cols-3">
                    {completedGoals.map(goal => (
                      <div key={goal._id} className="rounded-2xl border border-slate-200 bg-white p-5 flex items-start gap-4 opacity-70 hover:opacity-100 transition-opacity">
                        <div className="mt-1 shrink-0 bg-emerald-100 text-emerald-600 rounded-full p-1.5">
                          <CheckCircle2 className="h-5 w-5" />
                        </div>
                        <div>
                          <h3 className="font-bold text-slate-900 line-clamp-1">{goal.title}</h3>
                          <p className="text-xs text-slate-500 mt-1">{goal.milestones.length} milestones reached</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

        </div>
      </div>

      {/* Create Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-[2rem] bg-white p-8 shadow-2xl overflow-hidden relative">
            <h2 className="text-2xl font-extrabold text-slate-900 mb-6">Create New Goal</h2>
            
            <form onSubmit={handleCreate} className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">Goal Title</label>
                <input
                  required
                  type="text"
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  placeholder="e.g. Master React fundamentals"
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition-all focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">Category</label>
                <select
                  value={newCategory}
                  onChange={e => setNewCategory(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition-all focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                >
                  <option value="technical">Technical Skill</option>
                  <option value="career">Career / Job Hunt</option>
                  <option value="academic">Academic</option>
                  <option value="personal">Personal Growth</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">Milestones (Optional)</label>
                <p className="text-xs text-slate-500 mb-3">Break your goal down into actionable steps.</p>
                <div className="space-y-3">
                  {newMilestones.map((m, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <div className="h-6 w-6 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center text-xs font-bold shrink-0">{i + 1}</div>
                      <input
                        type="text"
                        value={m.title}
                        onChange={e => {
                          const arr = [...newMilestones];
                          arr[i].title = e.target.value;
                          setNewMilestones(arr);
                        }}
                        placeholder="e.g. Complete basic tutorial"
                        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-emerald-500"
                      />
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => setNewMilestones([...newMilestones, { title: '' }])}
                  className="mt-3 text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
                >
                  <Plus className="h-3 w-3" /> Add milestone
                </button>
              </div>

              <div className="flex gap-3 pt-6 border-t border-slate-100 mt-8">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 rounded-xl border border-slate-200 py-3 text-sm font-bold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 rounded-xl bg-emerald-500 py-3 text-sm font-bold text-white hover:bg-emerald-600 disabled:opacity-50"
                >
                  {isSubmitting ? 'Creating...' : 'Create Goal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </DashboardLayout>
  );
}

export default function GoalsPage() {
  return (
    <ProtectedRoute requiredRole="student">
      <GoalsContent />
    </ProtectedRoute>
  );
}
