/* eslint-disable react-hooks/exhaustive-deps, react-hooks/set-state-in-effect, @next/next/no-html-link-for-pages, @typescript-eslint/no-unused-vars, @next/next/no-img-element, react/no-unescaped-entities */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import ProtectedRoute from '@/components/ProtectedRoute';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { apiClient } from '@/utils/api-client';
import { ClipboardCheck, Clock, CheckCircle, ArrowRight, Calendar, Sparkles } from 'lucide-react';

type Question = {
  id: string;
  type: 'text' | 'multipleChoice' | 'checkbox' | 'rating' | 'dropdown';
  question: string;
  options?: string[];
  required: boolean;
};

type Template = {
  _id: string;
  title: string;
  description: string;
  questions: Question[];
};

type Assignment = {
  _id: string;
  template: Template;
  dueDate?: string;
  createdAt: string;
};

type Response = {
  _id: string;
  status: 'pending' | 'completed';
  answers: Record<string, any>;
  submittedAt?: string;
};

function StudentAssessmentContent() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [responses, setResponses] = useState<Record<string, Response>>({});
  const [loading, setLoading] = useState(true);
  const [statusLoading, setStatusLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    loadAssignments();
  }, []);

  const loadAssignments = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get<Assignment[]>('/api/v1/assessments/assignments/my');
      
      if (res.success && res.data) {
        const assignmentsArray = Array.isArray(res.data) ? res.data : [];
        setAssignments(assignmentsArray);

        // Render list fast, then hydrate response statuses in parallel.
        void loadResponseStatuses(assignmentsArray);
      } else {
        console.error('Failed to load assignments:', res.error);
      }
    } catch (error) {
      console.error('Error loading assignments:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadResponseStatuses = async (assignmentsArray: Assignment[]) => {
    if (!assignmentsArray.length) {
      setResponses({});
      return;
    }

    setStatusLoading(true);
    try {
      const statusRequests = assignmentsArray.map((assignment) =>
        apiClient.get<Response>(`/api/v1/assessments/responses/my/${assignment._id}`)
      );

      const settled = await Promise.allSettled(statusRequests);
      const nextResponses: Record<string, Response> = {};

      settled.forEach((result, index) => {
        if (result.status !== 'fulfilled') {
          return;
        }

        const payload = result.value;
        if (payload.success && payload.data) {
          nextResponses[assignmentsArray[index]._id] = payload.data;
        }
      });

      setResponses(nextResponses);
    } catch (error) {
      console.error('Error loading response statuses:', error);
    } finally {
      setStatusLoading(false);
    }
  };

  const getAssignmentStatus = (assignmentId: string) => {
    const response = responses[assignmentId];
    if (!response) return 'not-started';
    if (response.status === 'completed') return 'completed';
    return 'in-progress';
  };

  const totalCount = assignments.length;
  const completedCount = assignments.filter((assignment) => getAssignmentStatus(assignment._id) === 'completed').length;
  const inProgressCount = assignments.filter((assignment) => getAssignmentStatus(assignment._id) === 'in-progress').length;
  const notStartedCount = Math.max(totalCount - completedCount - inProgressCount, 0);

  const handleStartAssessment = (assignmentId: string) => {
    router.push(`/student/assessments/${assignmentId}`);
  };

  return (
    <DashboardLayout userName="Student">
      <div className="space-y-6 pb-10">
        <section className="overflow-hidden rounded-3xl border border-slate-200 bg-linear-to-br from-white via-slate-50 to-cyan-50/40 p-6 shadow-sm sm:p-8">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="inline-flex items-center gap-2 rounded-full border border-cyan-200 bg-cyan-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-cyan-700">
                <Sparkles size={12} />
                My Assessments
              </p>
              <h1 className="mt-3 text-3xl font-manrope font-extrabold tracking-tight text-slate-900 sm:text-4xl">
                Complete Your Assessments
              </h1>
              <p className="mt-2 max-w-3xl font-inter text-slate-600">
                Take assessments assigned to you. You can save your progress and complete them anytime.
              </p>
              {statusLoading && (
                <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Syncing progress status...
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Total</p>
                <p className="mt-1 text-2xl font-extrabold text-slate-900">{totalCount}</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Done</p>
                <p className="mt-1 text-2xl font-extrabold text-emerald-700">{completedCount}</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">In Progress</p>
                <p className="mt-1 text-2xl font-extrabold text-amber-700">{inProgressCount}</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Not Started</p>
                <p className="mt-1 text-2xl font-extrabold text-slate-900">{notStartedCount}</p>
              </div>
            </div>
          </div>
        </section>

        {loading ? (
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-slate-600">Loading assessments...</p>
          </section>
        ) : assignments.length === 0 ? (
          <section className="rounded-3xl border border-slate-200 bg-white p-12 text-center shadow-sm">
            <ClipboardCheck size={64} className="mx-auto mb-4 text-slate-300" />
            <h2 className="mb-2 text-xl font-bold text-slate-900">No Assessments Yet</h2>
            <p className="text-slate-600">
              You don't have any assessments assigned. Check back later!
            </p>
          </section>
        ) : (
          <div className="grid gap-6">
            {assignments.map((assignment) => {
              const status = getAssignmentStatus(assignment._id);
              const response = responses[assignment._id];
              
              return (
                <section
                  key={assignment._id}
                  className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-slate-900/5"
                >
                  <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                    <div className="flex-1">
                      <div className="mb-3 flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
                          <ClipboardCheck size={24} />
                        </div>
                        <div>
                          <h2 className="text-xl font-bold text-slate-900">
                            {assignment.template.title}
                          </h2>
                          <p className="text-sm text-slate-600">
                            {assignment.template.questions.length} questions
                          </p>
                        </div>
                      </div>

                      <p className="mb-4 text-slate-700">
                        {assignment.template.description}
                      </p>

                      <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600">
                        <div className="flex items-center gap-2">
                          <Calendar size={16} />
                          <span>
                            Assigned {new Date(assignment.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        {assignment.dueDate && (
                          <div className="flex items-center gap-2">
                            <Clock size={16} />
                            <span>
                              Due {new Date(assignment.dueDate).toLocaleDateString()}
                            </span>
                          </div>
                        )}
                      </div>

                      {status === 'completed' && response?.submittedAt && (
                        <div className="mt-3 inline-flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-700">
                          <CheckCircle size={16} />
                          <span>
                            Completed on {new Date(response.submittedAt).toLocaleDateString()}
                          </span>
                        </div>
                      )}

                      {status === 'in-progress' && (
                        <div className="mt-3 inline-flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-medium text-amber-700">
                          <Clock size={16} />
                          <span>In Progress - Continue where you left off</span>
                        </div>
                      )}

                      {status === 'not-started' && (
                        <div className="mt-3 inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-600">
                          <ClipboardCheck size={16} />
                          <span>Ready to start</span>
                        </div>
                      )}
                    </div>

                    <div className="flex shrink-0 flex-col gap-2">
                      {status === 'completed' ? (
                        <button
                          onClick={() => handleStartAssessment(assignment._id)}
                          className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-100 px-6 py-3 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-200"
                        >
                          View Responses
                        </button>
                      ) : (
                        <button
                          onClick={() => handleStartAssessment(assignment._id)}
                          className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-slate-800"
                        >
                          {status === 'in-progress' ? 'Continue' : 'Start Assessment'}
                          <ArrowRight size={18} />
                        </button>
                      )}
                    </div>
                  </div>
                </section>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

export default function StudentAssessmentPage() {
  return (
    <ProtectedRoute requiredRole="student">
      <StudentAssessmentContent />
    </ProtectedRoute>
  );
}
