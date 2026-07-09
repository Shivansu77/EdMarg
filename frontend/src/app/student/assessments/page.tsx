/* eslint-disable react-hooks/exhaustive-deps, react/no-unescaped-entities */
 
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import ProtectedRoute from '@/components/common/ProtectedRoute';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { apiClient } from '@/utils/api-client';
import { ClipboardCheck, Clock, CheckCircle, ArrowRight, Calendar, Sparkles, Activity, FileText } from 'lucide-react';
import { motion } from 'framer-motion';

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

  return parsedDate.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
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
    <DashboardLayout userName="Assessments">
      <div className="mx-auto max-w-[1200px] w-full pt-4 pb-16 space-y-8">
        
        {/* ── Premium Hero Section ── */}
        <section className="relative overflow-hidden rounded-[32px] bg-white border border-slate-200 shadow-sm p-8 sm:p-10 lg:p-12">
          {/* Decorative Background Elements */}
          <div className="pointer-events-none absolute -left-20 top-0 h-64 w-64 rounded-full bg-emerald-100/40 blur-[80px]" />
          <div className="pointer-events-none absolute -right-20 bottom-0 h-64 w-64 rounded-full bg-cyan-100/40 blur-[80px]" />
          
          <div className="relative z-10 flex flex-col xl:flex-row gap-10 xl:items-end justify-between">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-emerald-700 mb-5">
                <Sparkles size={14} className="text-emerald-500" />
                Your Skill Journey
              </div>
              <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl lg:text-5xl mb-4 leading-tight">
                Assessments
              </h1>
              <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-xl">
                Measure your baseline, track your progress, and unlock personalized mentorship recommendations through targeted evaluations.
              </p>
              {statusLoading && (
                <p className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-slate-500">
                  <Activity size={14} className="animate-pulse" />
                  Syncing progress...
                </p>
              )}
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 shrink-0">
              <div className="rounded-[20px] bg-slate-50 border border-slate-100 p-5 text-center">
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">Total</p>
                <p className="text-3xl font-extrabold text-slate-900">{totalCount}</p>
              </div>
              <div className="rounded-[20px] bg-emerald-50 border border-emerald-100 p-5 text-center">
                <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-600/70 mb-1">Done</p>
                <p className="text-3xl font-extrabold text-emerald-700">{completedCount}</p>
              </div>
              <div className="rounded-[20px] bg-amber-50 border border-amber-100 p-5 text-center">
                <p className="text-[11px] font-bold uppercase tracking-wider text-amber-600/70 mb-1">In Progress</p>
                <p className="text-3xl font-extrabold text-amber-700">{inProgressCount}</p>
              </div>
              <div className="rounded-[20px] bg-slate-50 border border-slate-100 p-5 text-center">
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">To Do</p>
                <p className="text-3xl font-extrabold text-slate-900">{notStartedCount}</p>
              </div>
            </div>
          </div>
        </section>

        {/* ── Spotlight: Career Assessment ── */}
        <section className="group relative overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm transition-all hover:border-emerald-300 hover:shadow-[0_8px_30px_rgba(16,185,129,0.06)]">
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          
          <div className="relative p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-start sm:items-center gap-5 flex-1">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-[20px] bg-emerald-100 text-emerald-600 border border-emerald-200/50 shadow-sm transition-transform duration-300 group-hover:scale-105 group-hover:-rotate-3">
                <Sparkles size={28} />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-900 tracking-tight mb-1.5">Career Baseline Assessment</h2>
                <p className="text-sm text-slate-600 mb-3 max-w-lg">
                  A foundational questionnaire that helps our matching engine pair you with the right mentors and career paths.
                </p>

                {careerAssessmentLoading ? (
                  <div className="animate-pulse h-6 w-48 bg-slate-100 rounded-md" />
                ) : hasCompletedCareerAssessment ? (
                  <div className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-50/80 px-2.5 py-1 text-xs font-bold text-emerald-700 border border-emerald-100">
                    <CheckCircle size={14} />
                    <span>Completed {careerAssessmentDate ? `on ${careerAssessmentDate}` : ''}</span>
                  </div>
                ) : (
                  <div className="inline-flex items-center gap-1.5 rounded-lg bg-slate-50 px-2.5 py-1 text-xs font-bold text-slate-600 border border-slate-200">
                    <ClipboardCheck size={14} />
                    <span>Action required</span>
                  </div>
                )}
              </div>
            </div>

            <button
              onClick={handleOpenCareerAssessment}
              className="w-full md:w-auto shrink-0 inline-flex h-14 items-center justify-center gap-2 rounded-xl bg-slate-900 px-8 text-sm font-bold text-white transition-all shadow-[0_4px_14px_rgba(15,23,42,0.15)] hover:bg-slate-800 hover:-translate-y-0.5 active:scale-95"
            >
              {hasCompletedCareerAssessment ? 'Review Results' : 'Start Assessment'}
              <ArrowRight size={16} />
            </button>
          </div>
        </section>

        {/* ── Main List ── */}
        <div className="space-y-6">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-xl font-bold text-slate-900">Assigned Tasks</h3>
            <span className="text-sm font-semibold text-slate-500 bg-slate-100 px-3 py-1 rounded-full">{assignments.length} assignments</span>
          </div>

          {loading ? (
            <div className="grid gap-4">
              {[1, 2].map((i) => (
                <div key={i} className="rounded-[24px] border border-slate-100 bg-white p-6 sm:p-8 shadow-sm animate-pulse flex flex-col md:flex-row gap-6 justify-between">
                   <div className="flex gap-4 w-full md:w-2/3">
                     <div className="h-14 w-14 rounded-2xl bg-slate-100 shrink-0" />
                     <div className="flex-1 space-y-3 pt-2">
                       <div className="h-5 w-1/3 bg-slate-100 rounded" />
                       <div className="h-4 w-2/3 bg-slate-50 rounded" />
                     </div>
                   </div>
                   <div className="h-12 w-32 bg-slate-100 rounded-xl" />
                </div>
              ))}
            </div>
          ) : assignments.length === 0 ? (
            <div className="rounded-[32px] border-2 border-dashed border-slate-200 bg-slate-50/50 p-16 text-center">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-[24px] bg-white text-slate-300 shadow-sm mb-6 border border-slate-100">
                 <FileText size={32} />
              </div>
              <h2 className="mb-2 text-2xl font-bold tracking-tight text-slate-900">You're all caught up!</h2>
              <p className="text-base text-slate-500 max-w-md mx-auto">
                No specific assignments have been routed to you right now. Mentors will drop assignments here before or after sessions.
              </p>
            </div>
          ) : (
            <div className="grid gap-4">
              {assignments.map((assignment) => {
                const status = getAssignmentStatus(assignment._id);
                const response = responses[assignment._id];
                const assignedDate = formatDate(assignment.createdAt);
                const dueDate = formatDate(assignment.dueDate);
                const completedDate = formatDate(response?.submittedAt);

                return (
                  <motion.article
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    key={assignment._id}
                    className="group rounded-[28px] border border-slate-200 bg-white p-6 sm:p-8 shadow-sm transition-all hover:border-slate-300 hover:shadow-md"
                  >
                    <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
                      
                      <div className="flex flex-col sm:flex-row gap-5 items-start flex-1">
                        <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-[20px] shadow-sm border ${
                          status === 'completed' ? 'bg-emerald-50 border-emerald-100 text-emerald-600' :
                          status === 'in-progress' ? 'bg-amber-50 border-amber-100 text-amber-600' :
                          'bg-slate-50 border-slate-200 text-slate-600'
                        }`}>
                          <ClipboardCheck size={24} />
                        </div>

                        <div className="flex-1">
                          <h2 className="text-xl font-bold tracking-tight text-slate-900 mb-1.5 group-hover:text-black transition-colors">
                            {assignment.template.title}
                          </h2>
                          <p className="mb-4 text-sm leading-relaxed text-slate-600 max-w-2xl">
                            {assignment.template.description}
                          </p>

                          <div className="flex flex-wrap items-center gap-3 text-xs font-semibold text-slate-500 mb-4">
                            <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1 rounded-md border border-slate-100">
                              <FileText size={14} className="text-slate-400" />
                              {assignment.template.questions.length} Questions
                            </div>
                            {assignedDate && (
                              <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1 rounded-md border border-slate-100">
                                <Calendar size={14} className="text-slate-400" />
                                Assigned {assignedDate}
                              </div>
                            )}
                            {dueDate && (
                              <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1 rounded-md border border-slate-100">
                                <Clock size={14} className="text-slate-400" />
                                Due {dueDate}
                              </div>
                            )}
                          </div>

                          {/* Status Badge */}
                          {status === 'completed' && completedDate && (
                            <div className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-50/80 px-2.5 py-1.5 text-xs font-bold text-emerald-700 border border-emerald-100">
                              <CheckCircle size={14} />
                              Completed on {completedDate}
                            </div>
                          )}
                          {status === 'in-progress' && (
                            <div className="inline-flex items-center gap-1.5 rounded-lg bg-amber-50 px-2.5 py-1.5 text-xs font-bold text-amber-700 border border-amber-100">
                              <Clock size={14} />
                              In Progress — Draft saved
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex shrink-0 w-full md:w-auto mt-2 md:mt-0">
                        {status === 'completed' ? (
                          <button
                            onClick={() => handleStartAssessment(assignment._id)}
                            className="w-full md:w-auto inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-6 text-sm font-bold text-slate-700 transition-colors hover:bg-slate-50 hover:border-slate-300 shadow-sm"
                          >
                            View Responses
                          </button>
                        ) : (
                          <button
                            onClick={() => handleStartAssessment(assignment._id)}
                            className="w-full md:w-auto inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-slate-900 px-6 text-sm font-bold text-white transition-all shadow-[0_4px_12px_rgba(15,23,42,0.12)] hover:bg-slate-800 hover:-translate-y-0.5 active:scale-95"
                          >
                            {status === 'in-progress' ? 'Continue' : 'Start Now'}
                            <ArrowRight size={16} />
                          </button>
                        )}
                      </div>
                    </div>
                  </motion.article>
                );
              })}
            </div>
          )}
        </div>
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
