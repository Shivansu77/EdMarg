/* eslint-disable react-hooks/exhaustive-deps, react/no-unescaped-entities */
 
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
  _id?: string;
  title?: string;
  description?: string;
  questions?: Question[] | Record<string, Question>;
};

type Assignment = {
  _id: string;
  template?: Template | null;
  dueDate?: string;
  createdAt?: string;
};

type Response = {
  _id: string;
  status: 'pending' | 'completed';
  answers: Record<string, any>;
  submittedAt?: string;
};

type CareerAssessmentSubmission = {
  _id: string;
  createdAt?: string;
  updatedAt?: string;
  result?: unknown;
};

type NormalizedTemplate = {
  _id: string;
  title: string;
  description: string;
  questions: Question[];
};

type NormalizedAssignment = {
  _id: string;
  template: NormalizedTemplate;
  dueDate?: string;
  createdAt?: string;
};

const QUESTION_TYPES: Question['type'][] = ['text', 'multipleChoice', 'checkbox', 'rating', 'dropdown'];
const DEFAULT_TITLE = 'Assessment';
const DEFAULT_DESCRIPTION = 'Complete this assessment to continue your journey.';

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const normalizeQuestionArray = (questions: unknown): Question[] => {
  if (!Array.isArray(questions)) {
    return [];
  }

  return questions
    .filter(isRecord)
    .map((question, index) => {
      const normalizedType = QUESTION_TYPES.includes(question.type as Question['type'])
        ? (question.type as Question['type'])
        : 'text';

      const options = Array.isArray(question.options)
        ? question.options.filter((option): option is string => typeof option === 'string')
        : undefined;

      return {
        id: typeof question.id === 'string' && question.id.trim() ? question.id : `q-${index + 1}`,
        type: normalizedType,
        question: typeof question.question === 'string' ? question.question : '',
        options,
        required: Boolean(question.required),
      };
    });
};

const normalizeQuestions = (questions: Template['questions']): Question[] => {
  if (Array.isArray(questions)) {
    return normalizeQuestionArray(questions);
  }

  if (isRecord(questions)) {
    return normalizeQuestionArray(Object.values(questions));
  }

  return [];
};

const normalizeTemplate = (template: unknown): NormalizedTemplate => {
  if (!isRecord(template)) {
    return {
      _id: '',
      title: DEFAULT_TITLE,
      description: DEFAULT_DESCRIPTION,
      questions: [],
    };
  }

  const parsedTemplate = template as Template;

  return {
    _id: typeof parsedTemplate._id === 'string' ? parsedTemplate._id : '',
    title:
      typeof parsedTemplate.title === 'string' && parsedTemplate.title.trim()
        ? parsedTemplate.title
        : DEFAULT_TITLE,
    description:
      typeof parsedTemplate.description === 'string' && parsedTemplate.description.trim()
        ? parsedTemplate.description
        : DEFAULT_DESCRIPTION,
    questions: normalizeQuestions(parsedTemplate.questions),
  };
};

const extractAssignments = (payload: unknown): Assignment[] => {
  if (Array.isArray(payload)) {
    return payload as Assignment[];
  }

  if (!isRecord(payload)) {
    return [];
  }

  const candidates = [payload.assignments, payload.items, payload.results, payload.data];
  const firstArray = candidates.find(Array.isArray);
  return Array.isArray(firstArray) ? (firstArray as Assignment[]) : [];
};

const normalizeAssignments = (payload: unknown): NormalizedAssignment[] =>
  extractAssignments(payload).reduce<NormalizedAssignment[]>((normalized, assignment) => {
    if (!isRecord(assignment) || typeof assignment._id !== 'string' || !assignment._id) {
      return normalized;
    }

    const nextAssignment: NormalizedAssignment = {
      _id: assignment._id,
      template: normalizeTemplate(assignment.template),
    };

    if (typeof assignment.dueDate === 'string') {
      nextAssignment.dueDate = assignment.dueDate;
    }

    if (typeof assignment.createdAt === 'string') {
      nextAssignment.createdAt = assignment.createdAt;
    }

    normalized.push(nextAssignment);
    return normalized;
  }, []);

const formatDate = (rawDate?: string) => {
  if (!rawDate) {
    return null;
  }

  const parsedDate = new Date(rawDate);
  if (Number.isNaN(parsedDate.getTime())) {
    return null;
  }

  return parsedDate.toLocaleDateString();
};

function StudentAssessmentContent() {
  const [assignments, setAssignments] = useState<NormalizedAssignment[]>([]);
  const [responses, setResponses] = useState<Record<string, Response>>({});
  const [careerAssessment, setCareerAssessment] = useState<CareerAssessmentSubmission | null>(null);
  const [careerAssessmentLoading, setCareerAssessmentLoading] = useState(true);
  const [loading, setLoading] = useState(true);
  const [statusLoading, setStatusLoading] = useState(false);
  const router = useRouter();

  async function loadCareerAssessment() {
    setCareerAssessmentLoading(true);
    try {
      const res = await apiClient.get<CareerAssessmentSubmission | null>('/api/v1/users/assessment');
      if (res.success && res.data) {
        setCareerAssessment(res.data);
      } else {
        setCareerAssessment(null);
      }
    } catch (error) {
      console.error('Error loading career assessment:', error);
      setCareerAssessment(null);
    } finally {
      setCareerAssessmentLoading(false);
    }
  }

  async function loadAssignments() {
    setLoading(true);
    try {
      const res = await apiClient.get<Assignment[] | { assignments?: Assignment[] }>(
        '/api/v1/assessments/assignments/my'
      );

      if (res.success) {
        const assignmentsArray = normalizeAssignments(res.data);
        setAssignments(assignmentsArray);

        // Render list fast, then hydrate response statuses in parallel.
        void loadResponseStatuses(assignmentsArray);
      } else {
        console.error('Failed to load assignments:', res.error);
        setAssignments([]);
        setResponses({});
      }
    } catch (error) {
      console.error('Error loading assignments:', error);
      setAssignments([]);
      setResponses({});
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void Promise.all([loadAssignments(), loadCareerAssessment()]);
  }, []);

  const loadResponseStatuses = async (assignmentsArray: NormalizedAssignment[]) => {
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

  const careerAssessmentDate = formatDate(careerAssessment?.updatedAt || careerAssessment?.createdAt);
  const hasCompletedCareerAssessment = Boolean(careerAssessment);

  const totalCount = assignments.length + 1; // +1 for Career Assessment
  const completedCount = assignments.filter((assignment) => getAssignmentStatus(assignment._id) === 'completed').length + (hasCompletedCareerAssessment ? 1 : 0);
  const inProgressCount = assignments.filter((assignment) => getAssignmentStatus(assignment._id) === 'in-progress').length;
  const notStartedCount = Math.max(totalCount - completedCount - inProgressCount, 0);

  const handleStartAssessment = (assignmentId: string) => {
    router.push(`/student/assessments/${assignmentId}`);
  };

  const handleOpenCareerAssessment = () => {
    router.push('/student/assessment');
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

        <section className="rounded-3xl border border-emerald-200/60 bg-linear-to-br from-emerald-50/50 to-white p-6 shadow-sm transition-all hover:shadow-md hover:border-emerald-200 group">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex-1">
              <div className="mb-3 flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 transition-transform group-hover:scale-105">
                  <Sparkles size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Career Assessment</h2>
                  <p className="text-sm text-slate-600">
                    Discover your best-fit career paths with personalized recommendations.
                  </p>
                </div>
              </div>

              {careerAssessmentLoading ? (
                <p className="text-sm font-medium text-slate-600">Checking your career assessment status...</p>
              ) : hasCompletedCareerAssessment ? (
                <div className="inline-flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-700">
                  <CheckCircle size={16} />
                  <span>{careerAssessmentDate ? `Completed on ${careerAssessmentDate}` : 'Completed'}</span>
                </div>
              ) : (
                <div className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-600">
                  <ClipboardCheck size={16} />
                  <span>Not started yet</span>
                </div>
              )}
            </div>

            <div className="flex shrink-0">
              <button
                onClick={handleOpenCareerAssessment}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 px-6 py-3.5 text-sm font-bold text-white transition-all shadow-md hover:shadow-emerald-500/25 hover:-translate-y-0.5 active:scale-95"
              >
                {hasCompletedCareerAssessment ? 'Review Career Assessment' : 'Start Career Assessment'}
                <ArrowRight size={18} />
              </button>
            </div>
          </div>
        </section>

        {loading ? (
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-slate-600">Loading assessments...</p>
          </section>
        ) : assignments.length === 0 ? (
          <section className="rounded-3xl border-2 border-dashed border-slate-200 bg-slate-50/50 p-16 text-center shadow-sm flex flex-col items-center justify-center min-h-[300px]">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-slate-400 mb-5">
               <ClipboardCheck size={32} />
            </div>
            <h2 className="mb-2 text-xl font-bold text-slate-900">No Assigned Assessments</h2>
            <p className="text-sm font-medium text-slate-500 max-w-sm mx-auto">
              You don't have any specific assessments assigned to you right now. When you do, they will appear here.
            </p>
          </section>
        ) : (
          <div className="grid gap-6">
            {assignments.map((assignment) => {
              const status = getAssignmentStatus(assignment._id);
              const response = responses[assignment._id];
              const assignedDate = formatDate(assignment.createdAt);
              const dueDate = formatDate(assignment.dueDate);
              const completedDate = formatDate(response?.submittedAt);

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
                            {assignedDate ? `Assigned ${assignedDate}` : 'Assigned recently'}
                          </span>
                        </div>
                        {dueDate && (
                          <div className="flex items-center gap-2">
                            <Clock size={16} />
                            <span>
                              Due {dueDate}
                            </span>
                          </div>
                        )}
                      </div>

                      {status === 'completed' && completedDate && (
                        <div className="mt-3 inline-flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-700">
                          <CheckCircle size={16} />
                          <span>
                            Completed on {completedDate}
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
