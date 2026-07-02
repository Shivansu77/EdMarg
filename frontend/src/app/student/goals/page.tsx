'use client';

import React, { useEffect, useState } from 'react';
import ProtectedRoute from '@/components/common/ProtectedRoute';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { apiClient } from '@/utils/api-client';
import {
  Target,
  Plus,
  Trash2,
  Loader2,
  Calendar,
  CheckCircle2,
  Circle,
  Clock,
  Activity,
  X,
  Sparkles,
  MoreVertical,
  Edit2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// --- Types ---
type Milestone = {
  _id: string;
  title: string;
  completed: boolean;
  completedAt?: string;
};

type Goal = {
  _id: string;
  title: string;
  description: string;
  category: 'career' | 'technical' | 'academic' | 'personal';
  status: 'active' | 'completed' | 'paused';
  targetDate?: string;
  progress: number;
  milestones: Milestone[];
  createdAt: string;
};

type GoalProgress = {
  totalGoals: number;
  activeCount: number;
  completedCount: number;
  avgProgress: number;
};

export default function StudentGoalsPage() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [progressData, setProgressData] = useState<GoalProgress | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // New Goal Form State
  const [newGoal, setNewGoal] = useState({
    title: '',
    description: '',
    category: 'technical',
    targetDate: '',
    milestones: [{ title: '' }]
  });

  // Fetch Data
  const fetchData = async () => {
    try {
      setLoading(true);
      const [goalsRes, progressRes] = await Promise.all([
        apiClient.get<{ data: Goal[] }>('/api/v1/goals'),
        apiClient.get<GoalProgress>('/api/v1/goals/progress')
      ]);

      if (goalsRes.success && goalsRes.data) {
        setGoals(goalsRes.data.data || goalsRes.data || []);
      }
      
      if (progressRes.success && progressRes.data) {
        setProgressData(progressRes.data);
      }
    } catch (error) {
      console.error('Failed to load goals:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Handlers
  const handleAddMilestone = () => {
    setNewGoal(prev => ({
      ...prev,
      milestones: [...prev.milestones, { title: '' }]
    }));
  };

  const handleMilestoneChange = (index: number, value: string) => {
    const updated = [...newGoal.milestones];
    updated[index].title = value;
    setNewGoal(prev => ({ ...prev, milestones: updated }));
  };

  const handleRemoveMilestone = (index: number) => {
    if (newGoal.milestones.length <= 1) return;
    const updated = newGoal.milestones.filter((_, i) => i !== index);
    setNewGoal(prev => ({ ...prev, milestones: updated }));
  };

  const handleCreateGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGoal.title.trim() || !newGoal.targetDate) return;

    try {
      setIsSubmitting(true);
      const payload = {
        ...newGoal,
        milestones: newGoal.milestones.filter(m => m.title.trim() !== '')
      };

      const res = await apiClient.post('/api/v1/goals', payload);
      
      if (res.success) {
        setIsModalOpen(false);
        setNewGoal({
          title: '',
          description: '',
          category: 'technical',
          targetDate: '',
          milestones: [{ title: '' }]
        });
        fetchData(); // Refresh list and stats
      }
    } catch (error) {
      console.error('Failed to create goal:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteGoal = async (id: string) => {
    if (!confirm('Are you sure you want to delete this goal?')) return;
    
    try {
      // Optimistic update
      setGoals(prev => prev.filter(g => g._id !== id));
      await apiClient.delete(`/api/v1/goals/${id}`);
      fetchData(); // Refresh stats
    } catch (error) {
      console.error('Failed to delete goal:', error);
      fetchData(); // Revert on failure
    }
  };

  const toggleMilestone = async (goal: Goal, milestoneId: string) => {
    try {
      // Find the milestone and toggle it
      const updatedMilestones = goal.milestones.map(m => {
        if (m._id === milestoneId) {
          return { ...m, completed: !m.completed };
        }
        return m;
      });

      // Optimistically update local state
      setGoals(prev => prev.map(g => {
        if (g._id === goal._id) {
          // Recalculate progress optimistically
          const completedCount = updatedMilestones.filter(m => m.completed).length;
          const total = updatedMilestones.length;
          const newProgress = total > 0 ? Math.round((completedCount / total) * 100) : 0;
          
          return { 
            ...g, 
            milestones: updatedMilestones,
            progress: newProgress,
            status: newProgress === 100 ? 'completed' : 'active'
          };
        }
        return g;
      }));

      // Send update to backend
      await apiClient.put(`/api/v1/goals/${goal._id}`, {
        milestones: updatedMilestones
      });
      
      // Refresh to ensure stats are perfectly synced
      fetchData();

    } catch (error) {
      console.error('Failed to update milestone:', error);
      fetchData(); // Revert on failure
    }
  };

  if (loading && goals.length === 0) {
    return (
      <DashboardLayout userName="Goals">
        <div className="flex flex-col items-center justify-center min-h-[70vh]">
          <Loader2 className="h-10 w-10 animate-spin text-slate-300 mb-4" />
          <p className="text-sm font-semibold text-slate-500">Loading your goals...</p>
        </div>
      </DashboardLayout>
    );
  }

  const activeGoals = goals.filter(g => g.status !== 'completed');
  const completedGoals = goals.filter(g => g.status === 'completed');

  return (
    <DashboardLayout userName="Goals">
      <div className="min-h-screen bg-slate-50/50 pb-20 pt-6">
        <div className="mx-auto max-w-[1200px] w-full px-4 lg:px-8 space-y-8">
          
          {/* ── Premium Hero Section ── */}
          <section className="relative overflow-hidden rounded-[32px] bg-white border border-slate-200 shadow-sm p-8 sm:p-10">
            {/* Decorative Background */}
            <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-emerald-100/40 blur-[80px]" />
            <div className="pointer-events-none absolute -left-20 -bottom-20 h-64 w-64 rounded-full bg-cyan-100/40 blur-[80px]" />

            <div className="relative z-10 flex flex-col lg:flex-row gap-8 lg:items-end justify-between">
              <div className="max-w-2xl">
                <span className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-slate-600 mb-5">
                  <Target size={14} className="text-slate-400" />
                  Goal Tracking
                </span>
                <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl mb-4 leading-tight">
                  Your Master Plan
                </h1>
                <p className="text-base sm:text-lg leading-relaxed text-slate-600">
                  Set ambitious targets, break them down into actionable milestones, and track your progress to stay ahead.
                </p>
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="mt-8 inline-flex h-14 items-center justify-center gap-2 rounded-xl bg-slate-900 px-8 text-sm font-bold text-white shadow-[0_4px_14px_rgba(15,23,42,0.15)] transition-all hover:bg-slate-800 hover:-translate-y-0.5 active:scale-95"
                >
                  <Plus size={18} />
                  Create New Goal
                </button>
              </div>

              {/* Quick Stats Grid */}
              <div className="grid grid-cols-2 gap-3 shrink-0 sm:min-w-[320px]">
                <div className="rounded-[20px] bg-slate-50 border border-slate-100 p-5 text-center">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">Active Goals</p>
                  <p className="text-3xl font-extrabold text-slate-900">{progressData?.activeCount || 0}</p>
                </div>
                <div className="rounded-[20px] bg-slate-50 border border-slate-100 p-5 text-center">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">Avg Progress</p>
                  <div className="flex items-center justify-center gap-1.5">
                    <Activity size={20} className="text-emerald-500" />
                    <p className="text-3xl font-extrabold text-slate-900">{progressData?.avgProgress || 0}%</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* ── Active Goals Grid ── */}
          <div className="space-y-6">
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Current Focus</h2>
            
            {activeGoals.length === 0 ? (
              <div className="rounded-[32px] border-2 border-dashed border-slate-200 bg-slate-50/50 p-12 text-center flex flex-col items-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-sm border border-slate-100 mb-4">
                  <Target size={28} className="text-slate-300" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-1">No active goals</h3>
                <p className="text-slate-500 mb-6 max-w-sm">You haven&apos;t set any goals yet. Start tracking your progress today.</p>
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-white border border-slate-200 px-6 text-sm font-bold text-slate-700 shadow-sm transition-colors hover:bg-slate-50 hover:border-slate-300"
                >
                  <Plus size={16} /> Add First Goal
                </button>
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <AnimatePresence>
                  {activeGoals.map((goal) => (
                    <motion.div
                      layout
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      key={goal._id}
                      className="flex flex-col rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md hover:border-slate-300"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <span className="inline-flex items-center rounded-md bg-slate-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-500 border border-slate-100">
                          {goal.category}
                        </span>
                        <button 
                          onClick={() => handleDeleteGoal(goal._id)}
                          className="text-slate-300 hover:text-red-500 transition-colors p-1"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>

                      <h3 className="text-xl font-bold text-slate-900 mb-2 leading-tight">{goal.title}</h3>
                      <p className="text-sm text-slate-500 line-clamp-2 mb-6 flex-1">
                        {goal.description || 'No description provided.'}
                      </p>

                      {/* Progress Bar */}
                      <div className="mb-6">
                        <div className="flex items-center justify-between text-xs font-bold mb-2">
                          <span className="text-slate-700">Progress</span>
                          <span className="text-emerald-600">{goal.progress}%</span>
                        </div>
                        <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                          <div 
                            className="h-full bg-emerald-500 rounded-full transition-all duration-500 ease-out"
                            style={{ width: `${goal.progress}%` }}
                          />
                        </div>
                      </div>

                      {/* Milestones */}
                      <div className="space-y-3 pt-4 border-t border-slate-100">
                        {goal.milestones.map((milestone) => (
                          <div 
                            key={milestone._id}
                            className="flex items-start gap-3 cursor-pointer group"
                            onClick={() => toggleMilestone(goal, milestone._id)}
                          >
                            <div className="mt-0.5 shrink-0 text-slate-300 group-hover:text-emerald-500 transition-colors">
                              {milestone.completed ? (
                                <CheckCircle2 size={18} className="text-emerald-500" />
                              ) : (
                                <Circle size={18} />
                              )}
                            </div>
                            <p className={`text-sm font-medium transition-colors ${milestone.completed ? 'text-slate-400 line-through' : 'text-slate-700 group-hover:text-slate-900'}`}>
                              {milestone.title}
                            </p>
                          </div>
                        ))}
                      </div>

                      {goal.targetDate && (
                        <div className="mt-6 flex items-center gap-1.5 text-xs font-semibold text-amber-600 bg-amber-50 rounded-lg p-2.5 border border-amber-100/50">
                          <Calendar size={14} />
                          Target: {new Date(goal.targetDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </div>
                      )}
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>

          {/* ── Completed Goals Grid ── */}
          {completedGoals.length > 0 && (
            <div className="space-y-6 pt-10">
              <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Accomplishments</h2>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 opacity-75 hover:opacity-100 transition-opacity">
                {completedGoals.map((goal) => (
                  <div key={goal._id} className="rounded-[28px] border border-emerald-100 bg-emerald-50/30 p-6">
                    <div className="flex items-center gap-2 text-emerald-600 mb-3">
                      <Sparkles size={18} />
                      <span className="text-xs font-bold uppercase tracking-wider">Completed</span>
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 mb-2">{goal.title}</h3>
                    <p className="text-sm text-slate-500 mb-4">{goal.milestones.length} milestones achieved</p>
                    <button 
                      onClick={() => handleDeleteGoal(goal._id)}
                      className="text-xs font-bold text-slate-400 hover:text-red-500 transition-colors"
                    >
                      Delete record
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>

      {/* ── Create Goal Modal ── */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
              onClick={() => !isSubmitting && setIsModalOpen(false)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg bg-white rounded-[32px] shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="flex items-center justify-between px-8 py-6 border-b border-slate-100 bg-slate-50/50">
                <div>
                  <h2 className="text-2xl font-extrabold text-slate-900">New Goal</h2>
                  <p className="text-sm text-slate-500">Define your target and milestones.</p>
                </div>
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="h-10 w-10 flex items-center justify-center rounded-full bg-white border border-slate-200 text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="overflow-y-auto p-8 custom-scrollbar">
                <form id="create-goal-form" onSubmit={handleCreateGoal} className="space-y-6">
                  
                  <div>
                    <label className="block text-sm font-bold text-slate-900 mb-2">Goal Title</label>
                    <input 
                      required
                      type="text"
                      placeholder="e.g. Master System Design"
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-900 focus:ring-1 focus:ring-slate-900 outline-none transition-all"
                      value={newGoal.title}
                      onChange={e => setNewGoal({...newGoal, title: e.target.value})}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-900 mb-2">Description <span className="text-slate-400 font-normal">(Optional)</span></label>
                    <textarea 
                      rows={3}
                      placeholder="Why is this important?"
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-900 focus:ring-1 focus:ring-slate-900 outline-none transition-all resize-none"
                      value={newGoal.description}
                      onChange={e => setNewGoal({...newGoal, description: e.target.value})}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-slate-900 mb-2">Category</label>
                      <select 
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:border-slate-900 focus:ring-1 focus:ring-slate-900 outline-none transition-all"
                        value={newGoal.category}
                        onChange={e => setNewGoal({...newGoal, category: e.target.value as any})}
                      >
                        <option value="technical">Technical</option>
                        <option value="career">Career</option>
                        <option value="academic">Academic</option>
                        <option value="personal">Personal</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-900 mb-2">Target Date</label>
                      <input 
                        required
                        type="date"
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:border-slate-900 focus:ring-1 focus:ring-slate-900 outline-none transition-all"
                        value={newGoal.targetDate}
                        onChange={e => setNewGoal({...newGoal, targetDate: e.target.value})}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm font-bold text-slate-900">Milestones</label>
                    </div>
                    <div className="space-y-3">
                      {newGoal.milestones.map((milestone, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <div className="flex-1 relative">
                            <input 
                              required
                              type="text"
                              placeholder={`Milestone ${index + 1}`}
                              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all"
                              value={milestone.title}
                              onChange={e => handleMilestoneChange(index, e.target.value)}
                            />
                          </div>
                          <button 
                            type="button"
                            onClick={() => handleRemoveMilestone(index)}
                            disabled={newGoal.milestones.length <= 1}
                            className="shrink-0 h-10 w-10 flex items-center justify-center rounded-xl border border-slate-200 text-slate-400 hover:text-red-500 hover:border-red-200 hover:bg-red-50 disabled:opacity-50 transition-colors"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      ))}
                    </div>
                    <button 
                      type="button"
                      onClick={handleAddMilestone}
                      className="mt-3 inline-flex items-center gap-1.5 text-sm font-bold text-emerald-600 hover:text-emerald-700"
                    >
                      <Plus size={16} /> Add Milestone
                    </button>
                  </div>

                </form>
              </div>

              <div className="border-t border-slate-100 bg-slate-50/50 px-8 py-5 flex items-center justify-end gap-3">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-6 py-3 rounded-xl font-bold text-sm text-slate-600 hover:bg-slate-200/50 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  form="create-goal-form"
                  disabled={isSubmitting}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-8 py-3 text-sm font-bold text-white shadow-sm transition-all hover:bg-slate-800 hover:-translate-y-0.5 active:scale-95 disabled:opacity-70 disabled:pointer-events-none"
                >
                  {isSubmitting && <Loader2 size={16} className="animate-spin" />}
                  Create Goal
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </DashboardLayout>
  );
}
