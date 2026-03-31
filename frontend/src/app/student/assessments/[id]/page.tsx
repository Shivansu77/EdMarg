'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import ProtectedRoute from '@/components/ProtectedRoute';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { apiClient } from '@/utils/api-client';
import { ArrowLeft, ArrowRight, Save, CheckCircle } from 'lucide-react';

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
};

function TakeAssessmentContent() {
  const params = useParams();
  const router = useRouter();
  const assignmentId = params.id as string;

  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadAssignment();
  }, [assignmentId]);

  const loadAssignment = async () => {
    setLoading(true);
    try {
      const assignmentRes = await apiClient.get<Assignment>(`/api/assessments/assignments/my`);
      if (assignmentRes.success && assignmentRes.data) {
        const foundAssignment = (assignmentRes.data as any).find((a: Assignment) => a._id === assignmentId);
        if (foundAssignment) {
          setAssignment(foundAssignment);
          
          const responseRes = await apiClient.get<any>(`/api/assessments/responses/my/${assignmentId}`);
          if (responseRes.success && responseRes.data?.answers) {
            setAnswers(responseRes.data.answers);
          }
        }
      }
    } catch (error) {
      console.error('Error loading assignment:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerChange = (questionId: string, value: any) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  const handleSaveProgress = async () => {
    setSaving(true);
    try {
      await apiClient.post(`/api/assessments/responses/${assignmentId}`, {
        answers,
        submit: false
      });
      alert('Progress saved successfully!');
    } catch (error) {
      console.error('Error saving progress:', error);
      alert('Failed to save progress');
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = async () => {
    if (!assignment) return;

    const requiredQuestions = assignment.template.questions.filter(q => q.required);
    const unanswered = requiredQuestions.filter(q => !answers[q.id] || (Array.isArray(answers[q.id]) && answers[q.id].length === 0));

    if (unanswered.length > 0) {
      alert(`Please answer all required questions. ${unanswered.length} required question(s) remaining.`);
      return;
    }

    if (!confirm('Are you sure you want to submit? You cannot change your answers after submission.')) {
      return;
    }

    setSubmitting(true);
    try {
      const res = await apiClient.post(`/api/assessments/responses/${assignmentId}`, {
        answers,
        submit: true
      });
      
      if (res.success) {
        alert('Assessment submitted successfully!');
        router.push('/student/assessments');
      } else {
        alert('Failed to submit assessment: ' + (res.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error submitting assessment:', error);
      alert('Failed to submit assessment');
    } finally {
      setSubmitting(false);
    }
  };

  const renderQuestion = (question: Question) => {
    const answer = answers[question.id];

    switch (question.type) {
      case 'text':
        return (
          <textarea
            value={answer || ''}
            onChange={(e) => handleAnswerChange(question.id, e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows={4}
            placeholder="Type your answer here..."
          />
        );

      case 'multipleChoice':
        return (
          <div className="space-y-3">
            {question.options?.map((option, idx) => (
              <label
                key={idx}
                className={`flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  answer === option
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <input
                  type="radio"
                  name={question.id}
                  value={option}
                  checked={answer === option}
                  onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                  className="w-5 h-5 text-blue-600"
                />
                <span className="text-gray-900 font-medium">{option}</span>
              </label>
            ))}
          </div>
        );

      case 'checkbox':
        return (
          <div className="space-y-3">
            {question.options?.map((option, idx) => (
              <label
                key={idx}
                className={`flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  Array.isArray(answer) && answer.includes(option)
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <input
                  type="checkbox"
                  value={option}
                  checked={Array.isArray(answer) && answer.includes(option)}
                  onChange={(e) => {
                    const currentAnswers = Array.isArray(answer) ? answer : [];
                    if (e.target.checked) {
                      handleAnswerChange(question.id, [...currentAnswers, option]);
                    } else {
                      handleAnswerChange(question.id, currentAnswers.filter(a => a !== option));
                    }
                  }}
                  className="w-5 h-5 text-blue-600 rounded"
                />
                <span className="text-gray-900 font-medium">{option}</span>
              </label>
            ))}
          </div>
        );

      case 'rating':
        return (
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((rating) => (
              <button
                key={rating}
                type="button"
                onClick={() => handleAnswerChange(question.id, rating)}
                className={`w-12 h-12 rounded-lg font-bold transition-all ${
                  answer === rating
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {rating}
              </button>
            ))}
          </div>
        );

      case 'dropdown':
        return (
          <select
            value={answer || ''}
            onChange={(e) => handleAnswerChange(question.id, e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Select an option...</option>
            {question.options?.map((option, idx) => (
              <option key={idx} value={option}>
                {option}
              </option>
            ))}
          </select>
        );

      default:
        return null;
    }
  };

  if (loading) {
    return (
      <DashboardLayout userName="Student">
        <div className="flex items-center justify-center min-h-[400px]">
          <p className="text-gray-600">Loading assessment...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (!assignment) {
    return (
      <DashboardLayout userName="Student">
        <div className="text-center py-12">
          <p className="text-gray-600 mb-4">Assessment not found</p>
          <button
            onClick={() => router.push('/student/assessments')}
            className="px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-900"
          >
            Back to Assessments
          </button>
        </div>
      </DashboardLayout>
    );
  }

  const currentQuestion = assignment.template.questions[currentStep];
  const progress = Math.round(((currentStep + 1) / assignment.template.questions.length) * 100);
  const answeredCount = Object.keys(answers).filter(key => {
    const val = answers[key];
    return val !== undefined && val !== '' && !(Array.isArray(val) && val.length === 0);
  }).length;

  return (
    <DashboardLayout userName="Student">
      <div className="max-w-4xl mx-auto pb-12">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-2">
                {assignment.template.title}
              </p>
              <h1 className="text-3xl font-bold text-gray-900">
                Question {currentStep + 1} of {assignment.template.questions.length}
              </h1>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold text-blue-600">{progress}%</p>
              <p className="text-sm text-gray-600 mt-1">
                {answeredCount}/{assignment.template.questions.length} answered
              </p>
            </div>
          </div>
          <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-600 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8 mb-6">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {currentQuestion.question}
              {currentQuestion.required && <span className="text-red-500 ml-1">*</span>}
            </h2>
            <p className="text-sm text-gray-500">
              {currentQuestion.required ? 'Required' : 'Optional'}
            </p>
          </div>

          {renderQuestion(currentQuestion)}
        </div>

        <div className="flex items-center justify-between gap-4">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => router.push('/student/assessments')}
              className="flex items-center gap-2 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-semibold"
            >
              <ArrowLeft size={18} />
              Exit
            </button>
            
            {currentStep > 0 && (
              <button
                type="button"
                onClick={() => setCurrentStep(prev => prev - 1)}
                className="flex items-center gap-2 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-semibold"
              >
                Previous
              </button>
            )}
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleSaveProgress}
              disabled={saving}
              className="flex items-center gap-2 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-semibold disabled:opacity-50"
            >
              <Save size={18} />
              {saving ? 'Saving...' : 'Save Progress'}
            </button>

            {currentStep < assignment.template.questions.length - 1 ? (
              <button
                type="button"
                onClick={() => setCurrentStep(prev => prev + 1)}
                className="flex items-center gap-2 px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-900 font-semibold"
              >
                Next
                <ArrowRight size={18} />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={submitting}
                className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold disabled:opacity-50"
              >
                <CheckCircle size={18} />
                {submitting ? 'Submitting...' : 'Submit Assessment'}
              </button>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default function TakeAssessmentPage() {
  return (
    <ProtectedRoute requiredRole="student">
      <TakeAssessmentContent />
    </ProtectedRoute>
  );
}
