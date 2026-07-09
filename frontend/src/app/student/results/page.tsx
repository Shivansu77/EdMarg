'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import ProtectedRoute from '@/components/common/ProtectedRoute';
import { apiClient } from '@/utils/api-client';
import {
  AlertCircle,
  ArrowRight,
  BadgeCheck,
  CheckCircle,
  ClipboardCheck,
  Loader2,
  Sparkles,
  Target,
  TrendingUp,
  Award,
  Zap,
  Briefcase
} from 'lucide-react';
import { motion } from 'framer-motion';

type CareerRecommendation = {
  rank: number;
  careerId: string;
  careerName: string;
  matchScore: number;
  whyThisFitsYou: string;
  requiredSkills?: string[];
  suggestedNextSteps?: string[];
  salaryRange?: string;
};

type AssessmentResult = {
  assessmentVersion: string;
  generatedAt: string;
  step2TagScores?: Record<string, number>;
  step3CareerMapping?: {
    dominantTags?: string[];
  };
  step4Output?: {
    top3CareerRecommendations?: CareerRecommendation[];
  };
};

type AssessmentSubmission = {
  _id: string;
  result?: AssessmentResult | null;
  createdAt?: string;
  updatedAt?: string;
};

type Assignment = {
  _id: string;
  template?: {
    title?: string;
  };
};

type AssignmentResponse = {
  _id: string;
  status: 'pending' | 'completed';
};

const extractAssignments = (payload: unknown): Assignment[] => {
  if (Array.isArray(payload)) {
    return payload as Assignment[];
  }

  if (!payload || typeof payload !== 'object') {
    return [];
  }

  const data = payload as { assignments?: unknown; items?: unknown; results?: unknown; data?: unknown };
  const candidates = [data.assignments, data.items, data.results, data.data];
  const firstArray = candidates.find(Array.isArray);
  return Array.isArray(firstArray) ? (firstArray as Assignment[]) : [];
};

function ResultsContent() {
  const [careerSubmission, setCareerSubmission] = useState<AssessmentSubmission | null>(null);
  const [assignmentTotal, setAssignmentTotal] = useState(0);
  const [completedAssignedCount, setCompletedAssignedCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadResults = async () => {
      setLoading(true);
      setError(null);

      try {
        const [careerRes, assignmentsRes] = await Promise.all([
          apiClient.get<AssessmentSubmission | null>('/api/v1/users/assessment'),
          apiClient.get<Assignment[] | { assignments?: Assignment[] }>('/api/v1/assessments/assignments/my'),
        ]);

        if (careerRes.success && careerRes.data) {
          setCareerSubmission(careerRes.data);
        } else {
          setCareerSubmission(null);
        }

        const assignments = assignmentsRes.success ? extractAssignments(assignmentsRes.data) : [];
        setAssignmentTotal(assignments.length);

        if (!assignments.length) {
          setCompletedAssignedCount(0);
        } else {
          const settled = await Promise.allSettled(
            assignments.map((assignment) =>
              apiClient.get<AssignmentResponse>(`/api/v1/assessments/responses/my/${assignment._id}`)
            )
          );

          let completed = 0;
          settled.forEach((result) => {
            if (result.status !== 'fulfilled') return;
            const payload = result.value;
            if (payload.success && payload.data?.status === 'completed') {
              completed += 1;
            }
          });

          setCompletedAssignedCount(completed);
        }
      } catch (fetchError) {
        console.error('Failed to load results:', fetchError);
        setError('Unable to load your results right now. Please refresh and try again.');
      } finally {
        setLoading(false);
      }
    };

    void loadResults();
  }, []);

  const recommendations = useMemo(
    () => careerSubmission?.result?.step4Output?.top3CareerRecommendations || [],
    [careerSubmission]
  );
  const topRecommendation = recommendations[0];
  const dominantTags = careerSubmission?.result?.step3CareerMapping?.dominantTags || [];
  const tagScores = careerSubmission?.result?.step2TagScores || {};
  const generatedAt = careerSubmission?.result?.generatedAt
    ? new Date(careerSubmission.result.generatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric'})
    : null;

  const hasCareerResult = Boolean(topRecommendation);
  const matchScore = typeof topRecommendation?.matchScore === 'number' ? `${Math.round(topRecommendation.matchScore)}%` : '—';
  const signalsAnalyzed = Object.keys(tagScores).length;
  const nextSteps = topRecommendation?.suggestedNextSteps?.slice(0, 3) || [];

  if (loading) {
    return (
      <DashboardLayout userName="Results">
        <div className="flex flex-col items-center justify-center min-h-[70vh]">
          <Loader2 className="h-10 w-10 animate-spin text-slate-300 mb-4" />
          <p className="text-sm font-semibold text-slate-500">Compiling your assessment results...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout userName="Results">
      <div className="min-h-screen bg-slate-50/50 pb-20 pt-6">
        <div className="mx-auto max-w-[1200px] w-full px-4 lg:px-8 space-y-8">
          
          {/* ── Premium Hero Section ── */}
          <section className="relative overflow-hidden rounded-[32px] bg-white border border-slate-200 shadow-sm p-8 sm:p-10">
            {/* Decorative Orbs */}
            <div className="pointer-events-none absolute -left-20 top-0 h-64 w-64 rounded-full bg-cyan-100/40 blur-[80px]" />
            <div className="pointer-events-none absolute -right-20 bottom-0 h-64 w-64 rounded-full bg-emerald-100/40 blur-[80px]" />

            <div className="relative z-10 flex flex-col lg:flex-row gap-8 lg:items-end justify-between">
              <div className="max-w-2xl">
                <span className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-slate-600 mb-5">
                  <Award size={14} className="text-slate-400" />
                  Assessment Results
                </span>
                <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl lg:text-5xl mb-4 leading-tight">
                  Your Career Fit
                </h1>
                <p className="text-base sm:text-lg leading-relaxed text-slate-600">
                  We&apos;ve analyzed your career assessment and assigned task progress to build a comprehensive picture of your ideal trajectory.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 shrink-0 sm:min-w-[320px]">
                <div className="rounded-[20px] bg-slate-50 border border-slate-100 p-5 text-center">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">Match Score</p>
                  <p className="text-3xl font-extrabold text-slate-900">{matchScore}</p>
                </div>
                <div className="rounded-[20px] bg-slate-50 border border-slate-100 p-5 text-center">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">Signals</p>
                  <p className="text-3xl font-extrabold text-slate-900">{signalsAnalyzed}</p>
                </div>
              </div>
            </div>
          </section>

          {error && (
            <section className="rounded-2xl border border-rose-200 bg-rose-50 p-5 text-rose-700 shadow-sm flex items-start gap-3">
              <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-rose-500" />
              <p className="text-sm font-semibold">{error}</p>
            </section>
          )}

          {/* ── Status Grid ── */}
          <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Career Assessment</p>
              <div className="mt-4 flex items-center gap-3">
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${hasCareerResult ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-slate-50 text-slate-400 border border-slate-100'}`}>
                  {hasCareerResult ? <CheckCircle className="h-5 w-5" /> : <ClipboardCheck className="h-5 w-5" />}
                </div>
                <div>
                  <p className="text-lg font-bold text-slate-900">{hasCareerResult ? 'Completed' : 'Not Started'}</p>
                  <p className="text-xs font-medium text-slate-500 mt-0.5">
                    {generatedAt ? `Updated on ${generatedAt}` : 'Required for results'}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Assigned Tasks</p>
              <div className="mt-4 flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 border border-blue-100">
                  <Target className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-lg font-bold text-slate-900">{completedAssignedCount} of {assignmentTotal}</p>
                  <p className="text-xs font-medium text-slate-500 mt-0.5">Tests completed</p>
                </div>
              </div>
            </div>

            <div className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Top Path</p>
              <div className="mt-4 flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-600 border border-amber-100">
                  <Briefcase className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-lg font-bold text-slate-900 line-clamp-1">{topRecommendation?.careerName || 'Pending'}</p>
                  <p className="text-xs font-medium text-slate-500 mt-0.5 line-clamp-1">
                    {topRecommendation?.salaryRange || 'Complete setup to view'}
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* ── Main Results Content ── */}
          {!hasCareerResult ? (
            <motion.section 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-[32px] border-2 border-dashed border-slate-200 bg-slate-50/50 p-12 text-center"
            >
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-white text-slate-300 shadow-sm border border-slate-100 mb-6">
                <ClipboardCheck size={36} />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 mb-2">No Results Available Yet</h2>
              <p className="text-slate-500 max-w-md mx-auto mb-8">
                Complete your Career Assessment and any assigned mentor tasks to generate your personalized career fit summary.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Link href="/student/assessment" className="inline-flex h-12 items-center justify-center rounded-xl bg-slate-900 px-8 text-sm font-bold text-white shadow-sm transition-all hover:bg-slate-800 hover:-translate-y-0.5 active:scale-95">
                  Start Career Assessment
                </Link>
                <Link href="/student/assessments" className="inline-flex h-12 items-center justify-center rounded-xl border border-slate-200 bg-white px-8 text-sm font-bold text-slate-700 shadow-sm transition-all hover:bg-slate-50 hover:border-slate-300">
                  View Tasks
                </Link>
              </div>
            </motion.section>
          ) : (
            <div className="space-y-8">
              
              {/* Highlight Recommendation */}
              <motion.section 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative overflow-hidden rounded-[32px] border border-slate-200 bg-white p-8 sm:p-10 shadow-sm"
              >
                <div className="mb-6 flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100">
                    <BadgeCheck className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">Primary Recommendation</p>
                    <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
                      {topRecommendation.careerName}
                    </h2>
                  </div>
                </div>
                
                <p className="text-base sm:text-lg leading-relaxed text-slate-600 bg-slate-50 p-6 rounded-2xl border border-slate-100">
                  &quot;{topRecommendation.whyThisFitsYou}&quot;
                </p>

                <div className="mt-8 flex flex-wrap gap-4 pt-8 border-t border-slate-100">
                  <Link href="/student/mentors" className="group inline-flex h-14 items-center justify-center gap-2 rounded-xl bg-slate-900 px-8 text-sm font-bold text-white shadow-[0_4px_14px_rgba(15,23,42,0.15)] transition-all hover:bg-slate-800 hover:-translate-y-0.5 active:scale-95">
                    Find a Mentor
                    <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
                  </Link>
                  <Link href="/student/assessment" className="inline-flex h-14 items-center justify-center rounded-xl border border-slate-200 bg-white px-8 text-sm font-bold text-slate-700 shadow-sm transition-all hover:bg-slate-50 hover:border-slate-300">
                    Review Responses
                  </Link>
                </div>
              </motion.section>

              <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_400px]">
                
                {/* Secondary Recommendations */}
                <section className="rounded-[32px] border border-slate-200 bg-white p-8 shadow-sm">
                  <div className="mb-8 flex items-center justify-between">
                    <div>
                      <h3 className="text-2xl font-extrabold tracking-tight text-slate-900">Alternative Paths</h3>
                      <p className="text-sm text-slate-500 mt-1">Other high-matching trajectories</p>
                    </div>
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-50 text-slate-400 border border-slate-100">
                      <Target className="h-6 w-6" />
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    {recommendations.slice(1).map((item) => (
                      <div key={`${item.careerId}-${item.rank}`} className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50 p-5 hover:border-slate-200 transition-colors">
                        <div className="flex items-center gap-4">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-slate-900 font-black shadow-sm border border-slate-200">
                            {item.rank}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 text-lg">{item.careerName}</p>
                            {item.salaryRange && <p className="text-sm font-medium text-slate-500">{item.salaryRange}</p>}
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-black text-slate-900">{Math.round(item.matchScore)}%</p>
                          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Match</p>
                        </div>
                      </div>
                    ))}
                    {recommendations.length <= 1 && (
                      <p className="text-slate-500 text-sm text-center py-6">No alternative paths generated yet.</p>
                    )}
                  </div>
                </section>

                {/* Next Steps & Dominant Traits */}
                <section className="rounded-[32px] bg-slate-900 p-8 text-white shadow-xl">
                  <div className="mb-8 flex items-center justify-between">
                    <div>
                      <h3 className="text-2xl font-extrabold tracking-tight text-white">Action Plan</h3>
                      <p className="text-sm text-slate-400 mt-1">Suggested next steps</p>
                    </div>
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-800 text-cyan-400 border border-slate-700">
                      <Zap className="h-6 w-6" />
                    </div>
                  </div>
                  
                  <div className="space-y-3 mb-10">
                    {nextSteps.length ? (
                      nextSteps.map((step, index) => (
                        <div key={`${step}-${index}`} className="flex gap-4 rounded-2xl border border-slate-800 bg-slate-800/50 p-4">
                          <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-700 text-xs font-bold text-white">
                            {index + 1}
                          </div>
                          <p className="text-sm leading-relaxed text-slate-200 pt-0.5">
                            {step}
                          </p>
                        </div>
                      ))
                    ) : (
                      <div className="rounded-2xl border border-slate-800 border-dashed p-6 text-center text-slate-400 text-sm">
                        No next steps generated yet.
                      </div>
                    )}
                  </div>

                  {dominantTags.length > 0 && (
                    <div className="pt-8 border-t border-slate-800">
                      <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-4">
                        Dominant Traits Identified
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {dominantTags.map(tag => (
                          <span key={tag} className="inline-flex px-3 py-1.5 rounded-lg bg-slate-800 text-xs font-bold text-slate-300 border border-slate-700">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </section>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

export default function ResultsPage() {
  return (
    <ProtectedRoute requiredRole="student">
      <ResultsContent />
    </ProtectedRoute>
  );
}
