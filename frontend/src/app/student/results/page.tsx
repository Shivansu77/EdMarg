'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import ProtectedRoute from '@/components/ProtectedRoute';
import { apiClient } from '@/utils/api-client';
import {
  AlertCircle,
  ArrowRight,
  BadgeCheck,
  ClipboardCheck,
  Loader2,
  Sparkles,
  Target,
  TrendingUp,
} from 'lucide-react';

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
    ? new Date(careerSubmission.result.generatedAt).toLocaleDateString()
    : null;

  const hasCareerResult = Boolean(topRecommendation);
  const matchScore = typeof topRecommendation?.matchScore === 'number' ? `${Math.round(topRecommendation.matchScore)}%` : '—';
  const signalsAnalyzed = Object.keys(tagScores).length;
  const nextSteps = topRecommendation?.suggestedNextSteps?.slice(0, 3) || [];

  if (loading) {
    return (
      <DashboardLayout userName="Assessment Results">
        <div className="flex min-h-[60vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-slate-500" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout userName="Assessment Results">
      <div className="space-y-8 pb-12">
        <section className="overflow-hidden rounded-3xl border border-white/60 bg-white/40 backdrop-blur-xl p-6 shadow-[0_8px_32px_rgba(0,0,0,0.04)] sm:p-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <span className="inline-flex items-center rounded-full border border-cyan-200/60 bg-cyan-50/60 backdrop-blur-sm px-3 py-1 text-xs font-semibold uppercase tracking-wide text-cyan-700">
                <Sparkles size={14} className="mr-2" />
                Assessment Results
              </span>
              <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">Your Career Fit Summary</h1>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-600 sm:text-base">
                Results are generated from your Career Assessment plus completion progress of assigned assessments.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:min-w-90">
              <div className="rounded-2xl border border-white/60 bg-white/50 backdrop-blur-lg px-4 py-3 shadow-[0_4px_24px_rgba(0,0,0,0.03)]">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Match Score</p>
                <p className="mt-1 text-2xl font-extrabold text-slate-900">{matchScore}</p>
              </div>
              <div className="rounded-2xl border border-white/60 bg-white/50 backdrop-blur-lg px-4 py-3 shadow-[0_4px_24px_rgba(0,0,0,0.03)]">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Signals Analyzed</p>
                <p className="mt-1 text-2xl font-extrabold text-slate-900">{signalsAnalyzed}</p>
              </div>
            </div>
          </div>
        </section>

        {error && (
          <section className="rounded-2xl border border-rose-200/60 bg-rose-50/60 backdrop-blur-md p-4 text-rose-700 shadow-sm">
            <div className="flex items-start gap-3">
              <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
              <p className="text-sm font-medium">{error}</p>
            </div>
          </section>
        )}

        <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-white/60 bg-white/40 backdrop-blur-xl p-6 shadow-[0_8px_32px_rgba(0,0,0,0.04)]">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Career Assessment</p>
            <p className="mt-2 text-lg font-bold text-slate-900">{hasCareerResult ? 'Completed' : 'Not Completed'}</p>
            <p className="mt-1 text-sm text-slate-600">{generatedAt ? `Updated on ${generatedAt}` : 'Take assessment to unlock recommendations.'}</p>
          </div>
          <div className="rounded-2xl border border-white/60 bg-white/40 backdrop-blur-xl p-6 shadow-[0_8px_32px_rgba(0,0,0,0.04)]">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Assigned Assessments</p>
            <p className="mt-2 text-lg font-bold text-slate-900">
              {completedAssignedCount}/{assignmentTotal} Completed
            </p>
            <p className="mt-1 text-sm text-slate-600">Track all assigned tests in your assessments workspace.</p>
          </div>
          <div className="rounded-2xl border border-white/60 bg-white/40 backdrop-blur-xl p-6 shadow-[0_8px_32px_rgba(0,0,0,0.04)]">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Recommended Path</p>
            <p className="mt-2 text-lg font-bold text-slate-900">{topRecommendation?.careerName || 'Not available yet'}</p>
            <p className="mt-1 text-sm text-slate-600">{topRecommendation?.salaryRange || 'Complete Career Assessment to view your recommendation.'}</p>
          </div>
        </section>

        {!hasCareerResult ? (
          <section className="rounded-3xl border border-white/60 bg-white/40 backdrop-blur-xl p-8 text-center shadow-[0_8px_32px_rgba(0,0,0,0.04)]">
            <ClipboardCheck size={48} className="mx-auto text-slate-300" />
            <h2 className="mt-4 text-2xl font-bold text-slate-900">No Career Result Yet</h2>
            <p className="mt-2 text-slate-600">Complete your Career Assessment and assigned assessments to see your detailed result summary here.</p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Link href="/student/assessment" className="inline-flex items-center rounded-xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white hover:bg-slate-800">
                Start Career Assessment
              </Link>
              <Link href="/student/assessments" className="inline-flex items-center rounded-xl border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-900 hover:bg-slate-50">
                View Assigned Assessments
              </Link>
            </div>
          </section>
        ) : (
          <>
            <section className="rounded-3xl border border-white/60 bg-white/40 backdrop-blur-xl p-8 shadow-[0_8px_32px_rgba(0,0,0,0.04)]">
              <div className="mb-6 flex items-center gap-3">
                <BadgeCheck className="h-6 w-6 text-slate-900" />
                <h2 className="text-2xl font-extrabold tracking-tight text-slate-900">
                  Your Recommended Path: {topRecommendation.careerName}
                </h2>
              </div>
              <p className="text-base leading-relaxed text-slate-700">{topRecommendation.whyThisFitsYou}</p>

              <div className="mt-6 flex flex-wrap gap-3">
                <Link href="/student/mentors" className="inline-flex items-center rounded-xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white hover:bg-slate-800">
                  Find a Mentor
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
                <Link href="/student/assessment" className="inline-flex items-center rounded-xl border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-900 hover:bg-slate-50">
                  Review Career Assessment
                </Link>
              </div>
            </section>

            <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <div className="rounded-3xl border border-white/60 bg-white/40 backdrop-blur-xl p-8 shadow-[0_8px_32px_rgba(0,0,0,0.04)]">
                <div className="mb-4 flex items-start gap-3">
                  <Target className="mt-1 h-6 w-6 shrink-0 text-slate-900" />
                  <h3 className="text-2xl font-extrabold tracking-tight text-slate-900">Top Recommendations</h3>
                </div>
                <div className="space-y-3">
                  {recommendations.map((item) => (
                    <div key={`${item.careerId}-${item.rank}`} className="rounded-xl border border-white/50 bg-white/40 backdrop-blur-md px-4 py-3 shadow-[0_4px_16px_rgba(0,0,0,0.02)]">
                      <p className="font-semibold text-slate-900">
                        #{item.rank} {item.careerName}
                      </p>
                      <p className="text-sm text-slate-600">Match score: {Math.round(item.matchScore)}%</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-3xl border border-slate-700/50 bg-slate-900/80 backdrop-blur-xl p-8 text-white shadow-[0_8px_32px_rgba(0,0,0,0.1)]">
                <div className="mb-4 flex items-start gap-3">
                  <TrendingUp className="mt-1 h-6 w-6 shrink-0 text-cyan-300" />
                  <h3 className="text-2xl font-extrabold tracking-tight">Next Steps</h3>
                </div>
                <div className="space-y-3">
                  {nextSteps.length ? (
                    nextSteps.map((step, index) => (
                      <div key={`${step}-${index}`} className="rounded-xl border border-slate-700 bg-slate-800/60 px-4 py-3 text-sm text-slate-100">
                        {index + 1}. {step}
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-slate-300">No next steps generated yet.</p>
                  )}
                </div>
                {dominantTags.length > 0 && (
                  <p className="mt-4 text-xs font-semibold uppercase tracking-widest text-slate-300">
                    Dominant Tags: {dominantTags.join(', ')}
                  </p>
                )}
              </div>
            </section>
          </>
        )}
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
