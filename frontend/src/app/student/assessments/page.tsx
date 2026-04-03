'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import ProtectedRoute from '@/components/ProtectedRoute';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { apiClient } from '@/utils/api-client';
import { ClipboardCheck, Clock, CheckCircle, ArrowRight, Calendar } from 'lucide-react';

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
  const router = useRouter();

  useEffect(() => {
    loadAssignments();
  }, []);

  const loadAssignments = async () => {
    setLoading(true);
    try {
      console.log('Loading assignments...');
      const res = await apiClient.get<Assignment[]>('/api/v1/assessments/assignments/my');
      console.log('Assignments response:', res);
      
      if (res.success && res.data) {
        const assignmentsArray = Array.isArray(res.data) ? res.data : [];
        console.log('Assignments found:', assignmentsArray.length);
        setAssignments(assignmentsArray);
        
        for (const assignment of assignmentsArray) {
          try {
            const responseRes = await apiClient.get<Response>(`/api/v1/assessments/responses/my/${assignment._id}`);
            console.log(`Response for ${assignment._id}:`, responseRes);
            if (responseRes.success && responseRes.data) {
              setResponses(prev => ({ ...prev, [assignment._id]: responseRes.data! }));
            }
          } catch (err) {
            console.log(`No response yet for assignment ${assignment._id}`);
          }
        }
      } else {
        console.error('Failed to load assignments:', res.error);
      }
    } catch (error) {
      console.error('Error loading assignments:', error);
    } finally {
      setLoading(false);
    }
  };

  const getAssignmentStatus = (assignmentId: string) => {
    const response = responses[assignmentId];
    if (!response) return 'not-started';
    if (response.status === 'completed') return 'completed';
    return 'in-progress';
  };

  const handleStartAssessment = (assignmentId: string) => {
    router.push(`/student/assessments/${assignmentId}`);
  };

  return (
    <DashboardLayout userName="Student">
      <div className="space-y-6 pb-10">
        <section className="rounded-2xl border border-gray-200 bg-white shadow-sm p-6 sm:p-8">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] font-semibold text-gray-500">
                My Assessments
              </p>
              <h1 className="mt-2 text-3xl sm:text-4xl font-manrope font-extrabold tracking-tight text-gray-900">
                Complete Your Assessments
              </h1>
              <p className="mt-2 text-gray-600 font-inter max-w-3xl">
                Take assessments assigned to you. You can save your progress and complete them anytime.
              </p>
            </div>
          </div>
        </section>

        {loading ? (
          <section className="rounded-2xl border border-gray-200 bg-white shadow-sm p-6">
            <p className="text-gray-600">Loading assessments...</p>
          </section>
        ) : assignments.length === 0 ? (
          <section className="rounded-2xl border border-gray-200 bg-white shadow-sm p-12 text-center">
            <ClipboardCheck size={64} className="mx-auto mb-4 text-gray-300" />
            <h2 className="text-xl font-bold text-gray-900 mb-2">No Assessments Yet</h2>
            <p className="text-gray-600">
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
                  className="rounded-2xl border border-gray-200 bg-white shadow-sm p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="h-12 w-12 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
                          <ClipboardCheck size={24} />
                        </div>
                        <div>
                          <h2 className="text-xl font-bold text-gray-900">
                            {assignment.template.title}
                          </h2>
                          <p className="text-sm text-gray-600">
                            {assignment.template.questions.length} questions
                          </p>
                        </div>
                      </div>

                      <p className="text-gray-700 mb-4">
                        {assignment.template.description}
                      </p>

                      <div className="flex items-center gap-4 text-sm text-gray-600">
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
                        <div className="mt-3 flex items-center gap-2 text-sm text-green-700 bg-green-50 px-3 py-2 rounded-lg w-fit">
                          <CheckCircle size={16} />
                          <span>
                            Completed on {new Date(response.submittedAt).toLocaleDateString()}
                          </span>
                        </div>
                      )}

                      {status === 'in-progress' && (
                        <div className="mt-3 flex items-center gap-2 text-sm text-yellow-700 bg-yellow-50 px-3 py-2 rounded-lg w-fit">
                          <Clock size={16} />
                          <span>In Progress - Continue where you left off</span>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col gap-2">
                      {status === 'completed' ? (
                        <button
                          onClick={() => handleStartAssessment(assignment._id)}
                          className="flex items-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-semibold transition-colors"
                        >
                          View Responses
                        </button>
                      ) : (
                        <button
                          onClick={() => handleStartAssessment(assignment._id)}
                          className="flex items-center gap-2 px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-900 font-semibold transition-colors"
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
