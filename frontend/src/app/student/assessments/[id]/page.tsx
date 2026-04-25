/* eslint-disable react-hooks/exhaustive-deps, @typescript-eslint/no-unused-vars */
 
'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import ProtectedRoute from '@/components/ProtectedRoute';
import { apiClient } from '@/utils/api-client';
import { 
  X,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  Loader2,
  Check,
  CheckCircle2,
  ArrowRight
} from 'lucide-react';

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

function normalizeQuestions(template: Template | null | undefined): Question[] {
  if (!template?.questions) return [];
  const raw = template.questions as unknown;
  if (Array.isArray(raw)) return raw;
  if (typeof raw === 'object' && raw !== null) {
    return Object.values(raw as Record<string, Question>);
  }
  return [];
}

async function loadAssignmentWithQuestions(
  assignmentId: string
): Promise<{ assignment: Assignment | null; error?: string }> {
  const detailRes = await apiClient.get<Assignment>(
    `/api/v1/assessments/assignments/${assignmentId}/student`
  );
  if (!detailRes.success || !detailRes.data) {
    return {
      assignment: null,
      error: detailRes.error || 'Assignment not found or you do not have access.',
    };
  }
  let assignment = detailRes.data;
  let questions = normalizeQuestions(assignment.template);

  if (questions.length === 0 && assignment.template?._id) {
    const tRes = await apiClient.get<Template>(
      `/api/v1/assessments/templates/${assignment.template._id}`
    );
    if (tRes.success && tRes.data) {
      questions = normalizeQuestions(tRes.data);
      assignment = {
        ...assignment,
        template: { ...tRes.data, questions },
      };
    }
  } else {
    assignment = {
      ...assignment,
      template: { ...assignment.template, questions },
    };
  }

  return { assignment };
}

function AssessmentContent() {
  const params = useParams();
  const router = useRouter();
  const assignmentId = params?.id as string;

  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCompleted, setIsCompleted] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  async function loadAssignment() {
    setLoading(true);
    setError(null);
    try {
      const { assignment: loaded, error: loadErr } = await loadAssignmentWithQuestions(assignmentId);
      if (!loaded) {
        setError(loadErr || 'Assignment not found or you do not have access.');
        return;
      }
      setAssignment(loaded);

      const responseRes = await apiClient.get<Response>(
        `/api/v1/assessments/responses/my/${assignmentId}`
      );
      if (responseRes.success && responseRes.data) {
        setAnswers(responseRes.data.answers || {});
        setIsCompleted(responseRes.data.status === 'completed');
      }
    } catch (err) {
      setError('Failed to load assessment');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadAssignment();
  }, [assignmentId]);

  const handleAnswerChange = (questionId: string, value: any) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
    setError(null);
  };

  const handleSaveDraft = async () => {
    setSaving(true);
    try {
      await apiClient.post(`/api/v1/assessments/responses/${assignmentId}`, {
        answers,
        submit: false
      });
    } catch (err) {
      console.error('Failed to save draft', err);
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = async () => {
    if (!assignment) return;

    const q = assignment.template.questions[currentQuestionIndex];
    if (q.required && (!answers[q.id] || (Array.isArray(answers[q.id]) && answers[q.id].length === 0))) {
      setError('Please answer this required question to complete the assessment.');
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      const res = await apiClient.post(`/api/v1/assessments/responses/${assignmentId}`, {
        answers,
        submit: true
      });
      if (res.success) {
        setIsCompleted(true);
        setTimeout(() => {
          router.push('/student/assessments');
        }, 2000);
      }
    } catch (err) {
      setError('Failed to submit assessment');
    } finally {
      setSubmitting(false);
    }
  };

  const nextQuestion = () => {
    if (!assignment) return;
    const q = assignment.template.questions[currentQuestionIndex];
    if (q.required && (!answers[q.id] || (Array.isArray(answers[q.id]) && answers[q.id].length === 0))) {
      setError('Please answer this required question to continue.');
      return;
    }
    setError(null);
    if (currentQuestionIndex < assignment.template.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      if ((currentQuestionIndex + 1) % 3 === 0) handleSaveDraft();
    }
  };

  const prevQuestion = () => {
    setError(null);
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const renderQuestionInput = (question: Question) => {
    const value = answers[question.id];

    switch (question.type) {
      case 'text':
        return (
          <div className="mt-8 w-full">
            <textarea
              value={value || ''}
              onChange={(e) => handleAnswerChange(question.id, e.target.value)}
              disabled={isCompleted}
              className="w-full sm:text-2xl font-medium text-zinc-800 bg-transparent border-b-2 border-zinc-200 focus:border-zinc-900 transition-colors outline-none disabled:opacity-50 disabled:cursor-not-allowed min-h-[100px] resize-none placeholder:text-zinc-300 py-2 leading-tight"
              placeholder="Type your answer here..."
              autoFocus
            />
          </div>
        );

      case 'multipleChoice':
        return (
          <div className="mt-8 space-y-3 w-full">
            {question.options?.map((option, idx) => {
              const isSelected = value === option;
              const letter = String.fromCharCode(65 + idx);
              return (
                <label
                  key={idx}
                  className={`group relative flex items-center p-4 sm:p-5 border rounded-xl cursor-pointer transition-all duration-200 ${
                    isSelected
                      ? 'border-zinc-900 bg-zinc-50 shadow-sm'
                      : 'border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50/50 bg-white'
                  } ${isCompleted ? 'pointer-events-none opacity-70' : ''}`}
                >
                  <div className={`flex items-center justify-center w-8 h-8 rounded border-2 mr-4 transition-colors font-bold text-sm ${isSelected ? 'border-zinc-900 bg-zinc-900 text-white' : 'border-zinc-200 bg-zinc-100 text-zinc-500 group-hover:border-zinc-300'}`}>
                    {letter}
                  </div>
                  <input
                    type="radio"
                    name={question.id}
                    value={option}
                    checked={isSelected}
                    onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                    disabled={isCompleted}
                    className="sr-only"
                  />
                  <span className={`text-base sm:text-lg font-medium ${isSelected ? 'text-zinc-900' : 'text-zinc-700'}`}>{option}</span>
                </label>
              );
            })}
          </div>
        );

      case 'checkbox':
        return (
          <div className="mt-8 space-y-3 w-full">
            {question.options?.map((option, idx) => {
              const checkedValues = Array.isArray(value) ? value : [];
              const isSelected = checkedValues.includes(option);
              const letter = String.fromCharCode(65 + idx);
              return (
                <label
                  key={idx}
                  className={`group relative flex items-center p-4 sm:p-5 border rounded-xl cursor-pointer transition-all duration-200 ${
                    isSelected
                      ? 'border-zinc-900 bg-zinc-50 shadow-sm'
                      : 'border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50/50 bg-white'
                  } ${isCompleted ? 'pointer-events-none opacity-70' : ''}`}
                >
                  <div className={`flex items-center justify-center w-8 h-8 rounded border-2 mr-4 transition-colors font-bold text-sm ${isSelected ? 'border-zinc-900 bg-zinc-900 text-white' : 'border-zinc-200 bg-zinc-100 text-zinc-500 group-hover:border-zinc-300'}`}>
                    {isSelected ? <Check size={16} strokeWidth={3} /> : letter}
                  </div>
                  <input
                    type="checkbox"
                    value={option}
                    checked={isSelected}
                    onChange={(e) => {
                      const newValues = e.target.checked
                        ? [...checkedValues, option]
                        : checkedValues.filter((v: string) => v !== option);
                      handleAnswerChange(question.id, newValues);
                    }}
                    disabled={isCompleted}
                    className="sr-only"
                  />
                  <span className={`text-base sm:text-lg font-medium ${isSelected ? 'text-zinc-900' : 'text-zinc-700'}`}>{option}</span>
                </label>
              );
            })}
          </div>
        );

      case 'rating':
        return (
          <div className="mt-10 w-full">
            <div className="flex flex-wrap gap-2 sm:gap-4 justify-between w-full">
              {[1, 2, 3, 4, 5].map((rating) => {
                const isSelected = value === rating;
                return (
                  <button
                    key={rating}
                    type="button"
                    onClick={() => handleAnswerChange(question.id, rating)}
                    disabled={isCompleted}
                    className={`flex-1 min-w-[50px] h-16 sm:h-24 rounded-xl text-xl sm:text-2xl font-bold transition-all duration-200 border flex flex-col items-center justify-center ${
                      isSelected
                        ? 'bg-zinc-900 text-white border-zinc-900 shadow-md transform -translate-y-1'
                        : 'bg-white text-zinc-600 border-zinc-200 hover:border-zinc-400 hover:bg-zinc-50 hover:-translate-y-1'
                    } ${isCompleted ? 'pointer-events-none opacity-70 cursor-not-allowed' : ''}`}
                  >
                    {rating}
                  </button>
                );
              })}
            </div>
            <div className="flex justify-between w-full mt-4 text-xs font-semibold tracking-wide text-zinc-400 uppercase px-1">
              <span>Poor</span>
              <span>Excellent</span>
            </div>
          </div>
        );

      case 'dropdown':
        return (
          <div className="mt-8 relative w-full">
            <select
              value={value || ''}
              onChange={(e) => handleAnswerChange(question.id, e.target.value)}
              disabled={isCompleted}
              className="w-full px-6 py-5 appearance-none text-xl font-medium text-zinc-800 bg-white border-2 border-zinc-200 rounded-xl focus:border-zinc-900 transition-colors outline-none disabled:opacity-50 disabled:cursor-not-allowed pr-16"
            >
              <option value="" disabled className="text-zinc-400 font-normal">Select your answer...</option>
              {question.options?.map((option, idx) => (
                <option key={idx} value={option}>
                  {option}
                </option>
              ))}
            </select>
            <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-400">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="min-h-[100dvh] bg-white flex flex-col items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-zinc-900 mb-6" />
        <div className="h-1 bg-zinc-100 rounded-full w-48 overflow-hidden">
          <div className="h-full bg-zinc-900 w-1/3 animate-pulse rounded-full" />
        </div>
      </div>
    );
  }

  if (error && !assignment) {
    return (
      <div className="min-h-[100dvh] bg-white flex flex-col items-center justify-center px-6">
        <AlertCircle className="w-12 h-12 text-rose-500 mb-6" />
        <h2 className="text-2xl font-bold text-zinc-900 mb-2 tracking-tight">Unable to load</h2>
        <p className="text-zinc-500 mb-8 max-w-xs text-center">{error}</p>
        <button
          onClick={() => router.push('/student/assessments')}
          className="px-6 py-3 bg-zinc-100 text-zinc-900 font-semibold rounded-full hover:bg-zinc-200 transition-colors"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  if (!assignment) return null;

  if (isCompleted && !submitting) {
    return (
      <div className="min-h-[100dvh] bg-[#fafafa] flex flex-col items-center justify-center px-6">
        <div className="w-24 h-24 bg-zinc-900 rounded-full flex items-center justify-center mb-8 shadow-2xl shadow-zinc-900/20">
          <CheckCircle2 className="w-12 h-12 text-white" />
        </div>
        <h2 className="text-4xl font-bold text-zinc-900 mb-4 tracking-tight">All set!</h2>
        <p className="text-zinc-500 text-lg mb-10 text-center max-w-sm">
          Your answers have been submitted successfully.
        </p>
        <button
          onClick={() => router.push('/student/assessments')}
          className="px-8 py-4 bg-white border border-zinc-200 text-zinc-900 font-semibold rounded-full shadow-sm hover:shadow hover:border-zinc-300 transition-all flex items-center gap-2"
        >
          <ArrowRight size={18} />
          Back to Dashboard
        </button>
      </div>
    );
  }

  const questions = assignment.template.questions;
  const totalQuestions = questions.length;
  const currentQuestion = questions[currentQuestionIndex];
  
  const progressPercent = totalQuestions <= 1 ? 100 : ((currentQuestionIndex) / (totalQuestions - 1)) * 100;
  const isLastQuestion = currentQuestionIndex === totalQuestions - 1;

  return (
    <div className="min-h-[100dvh] bg-white flex flex-col font-sans selection:bg-zinc-200">
      
      {/* Top Navbar */}
      <header className="fixed top-0 left-0 right-0 h-16 sm:h-20 bg-white/95 backdrop-blur-md z-50 flex items-center justify-between px-6 sm:px-10">
        <button
          onClick={() => router.push('/student/assessments')}
          className="flex items-center gap-2 text-zinc-400 hover:text-zinc-900 transition-colors font-medium text-sm group"
        >
          <X size={24} className="group-hover:rotate-90 transition-transform duration-300" />
        </button>

        <div className="absolute left-1/2 -translate-x-1/2 text-sm sm:text-base font-semibold tracking-wide text-zinc-900 hidden sm:block bg-zinc-50 px-4 py-1.5 rounded-full border border-zinc-200 shadow-sm">
          {assignment.template.title}
        </div>

        <button
          onClick={handleSaveDraft}
          disabled={saving || submitting}
          className="text-sm font-medium text-zinc-400 hover:text-zinc-900 transition-colors flex items-center gap-2"
        >
          {saving ? 'Saving...' : 'Save Draft'}
        </button>
      </header>

      {/* Progress Line */}
      <div className="fixed top-16 sm:top-20 left-0 right-0 h-[3px] bg-zinc-100 z-50">
        <div 
          className="h-full bg-zinc-900 transition-all duration-700 ease-out"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Main Focus Area */}
      <main className="flex-1 flex flex-col px-6 sm:px-12 w-full mx-auto relative pt-40 pb-40">
        <div className="w-full max-w-2xl mx-auto flex flex-col items-start animate-in fade-in slide-in-from-bottom-8 duration-700">
          
          <div className="mb-6 flex flex-wrap items-center gap-4">
            <span className="text-zinc-400 font-bold tracking-widest text-sm flex items-center gap-2">
              <span>{currentQuestionIndex + 1}</span>
              <ArrowRight size={14} className="text-zinc-300" /> 
              <span className="text-zinc-300">{totalQuestions}</span>
            </span>
            {currentQuestion.required && (
              <span className="text-[10px] font-bold text-rose-500 tracking-wider uppercase bg-rose-50 px-2 py-0.5 rounded text-rose-600 border border-rose-100">
                Required
              </span>
            )}
          </div>

          <h1 className="text-3xl sm:text-4xl font-semibold text-zinc-900 leading-[1.2] lg:leading-[1.2] tracking-tight">
            {currentQuestion.question}
          </h1>

          {error && (
            <div className="mt-8 p-4 bg-rose-50 text-rose-600 font-medium rounded-xl flex items-center gap-3 border border-rose-100 w-full animate-in fade-in slide-in-from-top-2">
              <AlertCircle size={18} className="shrink-0" />
              {error}
            </div>
          )}

          <div className="mt-4 w-full">
            {renderQuestionInput(currentQuestion)}
          </div>

        </div>
      </main>

      {/* Footer Navigation Area */}
      <div className="fixed bottom-0 left-0 right-0 p-6 sm:p-8 bg-white/95 backdrop-blur-md border-t border-zinc-100 flex justify-center z-40">
        <div className="w-full max-w-2xl mx-auto flex items-center justify-between">
          
          <button
            onClick={prevQuestion}
            disabled={currentQuestionIndex === 0}
            className={`flex items-center justify-center w-12 h-12 sm:w-auto sm:px-6 sm:h-12 rounded-full font-semibold transition-all duration-200 border border-zinc-200 bg-white text-zinc-900 hover:bg-zinc-50 hover:border-zinc-300 ${
              currentQuestionIndex === 0 ? 'opacity-0 pointer-events-none' : 'opacity-100'
            }`}
          >
            <ChevronLeft size={20} className="sm:mr-1" />
            <span className="hidden sm:block">Back</span>
          </button>

          {isLastQuestion ? (
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="flex items-center gap-2 px-8 h-12 sm:h-14 bg-zinc-900 text-white rounded-full font-semibold text-base hover:bg-zinc-800 transition-all focus:ring-4 focus:ring-zinc-900/20 active:scale-[0.98] disabled:opacity-70 disabled:pointer-events-none shadow-lg shadow-zinc-900/20"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Submitting
                </>
              ) : (
                <>
                  Submit
                  <Check size={20} strokeWidth={2.5} />
                </>
              )}
            </button>
          ) : (
            <button
              onClick={nextQuestion}
              className="flex items-center gap-2 px-6 sm:px-8 h-12 sm:h-14 bg-zinc-900 text-white rounded-full font-semibold text-base hover:bg-zinc-800 transition-all focus:ring-4 focus:ring-zinc-900/20 active:scale-[0.98] shadow-lg shadow-zinc-900/20"
            >
              <span className="hidden sm:block">Continue</span>
              <span className="sm:hidden">Next</span>
              <ChevronRight size={20} />
            </button>
          )}

        </div>
      </div>

    </div>
  );
}
export default function AssessmentDetailPage() {
  return (
    <ProtectedRoute requiredRole="student">
      <AssessmentContent />
    </ProtectedRoute>
  );
}
