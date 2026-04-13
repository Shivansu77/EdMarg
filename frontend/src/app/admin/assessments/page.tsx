/* eslint-disable react-hooks/exhaustive-deps, react-hooks/set-state-in-effect, @next/next/no-html-link-for-pages, @typescript-eslint/no-unused-vars, @next/next/no-img-element, react/no-unescaped-entities */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useEffect, useState } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { apiClient } from '@/utils/api-client';
import { FileText, Users, Send, Plus, Edit, Trash2, Eye, X } from 'lucide-react';

type QuestionType = 'text' | 'multipleChoice' | 'checkbox' | 'rating' | 'dropdown';

type Question = {
  id: string;
  type: QuestionType;
  question: string;
  options?: string[];
  required: boolean;
};

type Template = {
  _id: string;
  title: string;
  description: string;
  questions: Question[];
  isActive: boolean;
  createdAt: string;
};

type Assignment = {
  _id: string;
  template: Template;
  assignedTo: { _id: string; name: string; email: string }[];
  dueDate?: string;
  isActive: boolean;
  createdAt: string;
};

type Student = {
  _id: string;
  name: string;
  email: string;
};

type Response = {
  _id: string;
  student: { name: string; email: string };
  assignment: { _id: string; template: { title: string } };
  answers: Record<string, any>;
  status: string;
  submittedAt?: string;
};

const MAX_STUDENTS_PAGE_SIZE = 50;

const extractStudents = (payload: unknown): Student[] => {
  if (Array.isArray(payload)) return payload as Student[];
  if (payload && typeof payload === 'object' && Array.isArray((payload as any).users)) {
    return (payload as any).users;
  }
  return [];
};

function AdminAssessmentsContent() {
  const [activeTab, setActiveTab] = useState<'templates' | 'assignments' | 'responses'>('templates');
  const [templates, setTemplates] = useState<Template[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [responses, setResponses] = useState<Response[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [showAssignmentModal, setShowAssignmentModal] = useState(false);
  const [showResponseModal, setShowResponseModal] = useState(false);
  const [selectedResponse, setSelectedResponse] = useState<Response | null>(null);
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);

  const [templateForm, setTemplateForm] = useState({
    title: '',
    description: '',
    questions: [] as Question[]
  });

  const [assignmentForm, setAssignmentForm] = useState({
    templateId: '',
    studentIds: [] as string[],
    dueDate: '',
    assignToAll: false,
    sendEmail: false
  });

  const [currentQuestion, setCurrentQuestion] = useState<Question>({
    id: '',
    type: 'text',
    question: '',
    options: [],
    required: false
  });

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      if (activeTab === 'templates') {
        const res = await apiClient.get<Template[]>('/api/v1/assessments/templates');
        if (res.success) setTemplates(res.data || []);
      } else if (activeTab === 'assignments') {
        const res = await apiClient.get<Assignment[]>('/api/v1/assessments/assignments');
        if (res.success) setAssignments(res.data || []);
      } else if (activeTab === 'responses') {
        const res = await apiClient.get<Response[]>('/api/v1/assessments/responses');
        if (res.success) setResponses(res.data || []);
      }
    } catch (error: any) {
      console.error('Error loading data:', error);
      setError('Error loading data: ' + (error.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const loadStudents = async () => {
    try {
      const collected: Student[] = [];
      const seen = new Set<string>();

      let page = 1;
      let pages = 1;

      do {
        const res = await apiClient.get('/api/v1/admin/users', {
          params: { role: 'student', page, limit: MAX_STUDENTS_PAGE_SIZE }
        });

        if (!res.success) throw new Error(res.error);

        const list = extractStudents(res.data);

        list.forEach((s) => {
          if (!s?._id || seen.has(s._id)) return;
          seen.add(s._id);
          collected.push(s);
        });

        pages = Number(res.pages) || 1;
        page++;

      } while (page <= pages);

      setStudents(collected);

    } catch (err: any) {
      console.error('Error loading students:', err);
      // Don't show error to user since this happens on assignment modal open only
      setStudents([]);
    }
  };

  const handleCreateTemplate = async () => {
    // Auto-add any pending question in the inputs
    const updatedForm = { ...templateForm };
    if (currentQuestion.question) {
      updatedForm.questions = [
        ...updatedForm.questions,
        { ...currentQuestion, id: currentQuestion.id || `q${Date.now()}` }
      ];
      setTemplateForm(updatedForm);
      setCurrentQuestion({ id: '', type: 'text', question: '', options: [], required: false });
    }

    if (!updatedForm.title || updatedForm.questions.length === 0) {
      alert('Please provide a title and at least one question');
      return;
    }

    try {
      console.log('Creating template:', updatedForm);
      const res = await apiClient.post('/api/v1/assessments/templates', updatedForm);
      console.log('Create template response:', res);
      if (res.success) {
        alert('Template created successfully!');
        setShowTemplateModal(false);
        resetTemplateForm();
        loadData();
      } else {
        alert('Failed to create template: ' + (res.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error creating template:', error);
      alert('Error creating template: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  };

  const handleUpdateTemplate = async () => {
    if (!editingTemplate) return;

    // Auto-add any pending question in the inputs
    const updatedForm = { ...templateForm };
    if (currentQuestion.question) {
      updatedForm.questions = [
        ...updatedForm.questions,
        { ...currentQuestion, id: currentQuestion.id || `q${Date.now()}` }
      ];
      setTemplateForm(updatedForm);
      setCurrentQuestion({ id: '', type: 'text', question: '', options: [], required: false });
    }

    if (!updatedForm.title || updatedForm.questions.length === 0) {
      alert('Please provide a title and at least one question');
      return;
    }

    try {
      const res = await apiClient.put(`/api/v1/assessments/templates/${editingTemplate._id}`, updatedForm);
      if (res.success) {
        setShowTemplateModal(false);
        setEditingTemplate(null);
        resetTemplateForm();
        loadData();
      }
    } catch (error) {
      console.error('Error updating template:', error);
    }
  };

  const handleDeleteTemplate = async (id: string) => {
    if (!confirm('Are you sure you want to delete this template?')) return;

    try {
      const res = await apiClient.delete(`/api/v1/assessments/templates/${id}`);
      if (res.success) loadData();
    } catch (error) {
      console.error('Error deleting template:', error);
    }
  };

  const handleCreateAssignment = async () => {
    if (!assignmentForm.templateId) {
      alert('Please select a template');
      return;
    }

    if (!assignmentForm.assignToAll && assignmentForm.studentIds.length === 0) {
      alert('Please select at least one student or choose "Assign to All"');
      return;
    }

    try {
      const payload: any = {
        templateId: assignmentForm.templateId,
        sendEmail: assignmentForm.sendEmail
      };

      if (assignmentForm.assignToAll) {
        payload.studentIds = students.map(s => s._id);
      } else {
        payload.studentIds = assignmentForm.studentIds;
      }

      if (assignmentForm.dueDate) {
        payload.dueDate = new Date(assignmentForm.dueDate).toISOString();
      }

      console.log('Creating assignment with payload:', payload);
      console.log('Student IDs:', payload.studentIds);

      if (!payload.studentIds || payload.studentIds.length === 0) {
        alert('No students selected. Please select at least one student.');
        return;
      }

      const res = await apiClient.post('/api/v1/assessments/assignments', payload);
      console.log('Assignment creation response:', res);
      
      if (res.success) {
        alert(`Assignment created successfully for ${payload.studentIds.length} student(s)!${assignmentForm.sendEmail ? ' Email notifications sent.' : ''}`);
        setShowAssignmentModal(false);
        resetAssignmentForm();
        loadData();
      } else {
        alert('Failed to create assignment: ' + (res.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error creating assignment:', error);
      alert('Error creating assignment: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  };

  const handleDeleteAssignment = async (id: string) => {
    if (!confirm('Are you sure you want to delete this assignment?')) return;

    try {
      const res = await apiClient.delete(`/api/v1/assessments/assignments/${id}`);
      if (res.success) loadData();
    } catch (error) {
      console.error('Error deleting assignment:', error);
    }
  };

  const addQuestion = () => {
    if (!currentQuestion.question) {
      alert('Please enter a question');
      return;
    }

    const newQuestion = {
      ...currentQuestion,
      id: currentQuestion.id || `q${Date.now()}`
    };

    setTemplateForm({
      ...templateForm,
      questions: [...templateForm.questions, newQuestion]
    });

    setCurrentQuestion({
      id: '',
      type: 'text',
      question: '',
      options: [],
      required: false
    });
  };

  const removeQuestion = (id: string) => {
    setTemplateForm({
      ...templateForm,
      questions: templateForm.questions.filter(q => q.id !== id)
    });
  };

  const resetTemplateForm = () => {
    setTemplateForm({ title: '', description: '', questions: [] });
    setCurrentQuestion({ id: '', type: 'text', question: '', options: [], required: false });
  };

  const resetAssignmentForm = () => {
    setAssignmentForm({ templateId: '', studentIds: [], dueDate: '', assignToAll: false, sendEmail: false });
  };

  const openEditTemplate = (template: Template) => {
    setEditingTemplate(template);
    setTemplateForm({
      title: template.title,
      description: template.description,
      questions: template.questions
    });
    setShowTemplateModal(true);
  };

  const openAssignmentModal = async () => {
    await loadStudents();
    setShowAssignmentModal(true);
  };

  const viewResponse = (response: Response) => {
    setSelectedResponse(response);
    setShowResponseModal(true);
  };

  return (
    <DashboardLayout userName="Admin">
      <div className="space-y-6 pb-10">
        <section className="rounded-2xl border border-gray-200 bg-white shadow-sm p-6 sm:p-8">
          <h1 className="text-3xl sm:text-4xl font-manrope font-extrabold tracking-tight text-gray-900">
            Assessment Management
          </h1>
          <p className="mt-2 text-gray-600">Create templates, assign to students, and view responses</p>
        </section>

        <div className="flex gap-2 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('templates')}
            className={`px-6 py-3 font-semibold transition-colors ${
              activeTab === 'templates'
                ? 'border-b-2 border-black text-black'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <FileText className="inline mr-2" size={18} />
            Templates
          </button>
          <button
            onClick={() => setActiveTab('assignments')}
            className={`px-6 py-3 font-semibold transition-colors ${
              activeTab === 'assignments'
                ? 'border-b-2 border-black text-black'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Send className="inline mr-2" size={18} />
            Assignments
          </button>
          <button
            onClick={() => setActiveTab('responses')}
            className={`px-6 py-3 font-semibold transition-colors ${
              activeTab === 'responses'
                ? 'border-b-2 border-black text-black'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Users className="inline mr-2" size={18} />
            Responses
          </button>
        </div>

        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-4">
            <p className="text-red-700 font-semibold">{error}</p>
            <button
              onClick={() => { setError(null); loadData(); }}
              className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
            >
              Try Again
            </button>
          </div>
        )}

        {activeTab === 'templates' && (
          <section className="rounded-2xl border border-gray-200 bg-white shadow-sm p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Assessment Templates</h2>
              <button
                onClick={() => setShowTemplateModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-900"
              >
                <Plus size={18} />
                Create Template
              </button>
            </div>

            {loading ? (
              <p>Loading...</p>
            ) : templates.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <FileText size={48} className="mx-auto mb-4 opacity-50" />
                <p>No templates yet. Create your first assessment template!</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {templates.map((template) => (
                  <div key={template._id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="text-lg font-bold">{template.title}</h3>
                        <p className="text-sm text-gray-600 mt-1">{template.description}</p>
                        <p className="text-xs text-gray-500 mt-2">
                          {template.questions.length} questions • Created {new Date(template.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => openEditTemplate(template)}
                          className="p-2 text-gray-600 hover:text-black"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() => handleDeleteTemplate(template._id)}
                          className="p-2 text-red-600 hover:text-red-800"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {activeTab === 'assignments' && (
          <section className="rounded-2xl border border-gray-200 bg-white shadow-sm p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Assignments</h2>
              <button
                onClick={openAssignmentModal}
                className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-900"
              >
                <Plus size={18} />
                Create Assignment
              </button>
            </div>

            {loading ? (
              <p>Loading...</p>
            ) : assignments.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <Send size={48} className="mx-auto mb-4 opacity-50" />
                <p>No assignments yet. Assign an assessment to students!</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {assignments.map((assignment) => (
                  <div key={assignment._id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="text-lg font-bold">{assignment.template?.title || 'Template Deleted'}</h3>
                        <p className="text-sm text-gray-600 mt-1">
                          Assigned to {assignment.assignedTo.length} student{assignment.assignedTo.length !== 1 ? 's' : ''}
                        </p>
                        {assignment.dueDate && (
                          <p className="text-xs text-gray-500 mt-1">
                            Due: {new Date(assignment.dueDate).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                      <button
                        onClick={() => handleDeleteAssignment(assignment._id)}
                        className="p-2 text-red-600 hover:text-red-800"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {activeTab === 'responses' && (
          <section className="rounded-2xl border border-gray-200 bg-white shadow-sm p-6">
            <h2 className="text-2xl font-bold mb-6">Student Responses</h2>

            {loading ? (
              <p>Loading...</p>
            ) : responses.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <Users size={48} className="mx-auto mb-4 opacity-50" />
                <p>No responses yet. Responses will appear here once students submit assessments.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4">Student</th>
                      <th className="text-left py-3 px-4">Assessment</th>
                      <th className="text-left py-3 px-4">Status</th>
                      <th className="text-left py-3 px-4">Submitted</th>
                      <th className="text-left py-3 px-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {responses.map((response) => (
                      <tr key={response._id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <div className="font-semibold">{response.student.name}</div>
                          <div className="text-sm text-gray-600">{response.student.email}</div>
                        </td>
                        <td className="py-3 px-4">{response.assignment?.template?.title || 'Template Deleted'}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded text-xs font-semibold ${
                            response.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {response.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-sm">
                          {response.submittedAt ? new Date(response.submittedAt).toLocaleString() : '—'}
                        </td>
                        <td className="py-3 px-4">
                          <button
                            onClick={() => viewResponse(response)}
                            className="flex items-center gap-1 text-black hover:underline"
                          >
                            <Eye size={16} />
                            View
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        )}

        {showTemplateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">
                  {editingTemplate ? 'Edit Template' : 'Create Template'}
                </h2>
                <button onClick={() => { setShowTemplateModal(false); setEditingTemplate(null); resetTemplateForm(); }}>
                  <X size={24} />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold mb-2">Title</label>
                  <input
                    type="text"
                    value={templateForm.title}
                    onChange={(e) => setTemplateForm({ ...templateForm, title: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    placeholder="e.g., Student Interest Assessment"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">Description</label>
                  <textarea
                    value={templateForm.description}
                    onChange={(e) => setTemplateForm({ ...templateForm, description: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    rows={3}
                    placeholder="Brief description of this assessment"
                  />
                </div>

                <div className="border-t pt-4">
                  <h3 className="text-lg font-bold mb-4">Questions ({templateForm.questions.length})</h3>
                  
                  {templateForm.questions.map((q, idx) => (
                    <div key={q.id} className="mb-4 p-4 bg-gray-50 rounded-lg">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <p className="font-semibold">{idx + 1}. {q.question}</p>
                          <p className="text-sm text-gray-600">Type: {q.type} {q.required && '(Required)'}</p>
                          {q.options && q.options.length > 0 && (
                            <p className="text-xs text-gray-500 mt-1">Options: {q.options.join(', ')}</p>
                          )}
                        </div>
                        <button onClick={() => removeQuestion(q.id)} className="text-red-600">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}

                  <div className="border border-gray-300 rounded-lg p-4 space-y-3">
                    <h4 className="font-semibold">Add Question</h4>
                    
                    <div>
                      <label className="block text-sm mb-1">Question</label>
                      <input
                        type="text"
                        value={currentQuestion.question}
                        onChange={(e) => setCurrentQuestion({ ...currentQuestion, question: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded"
                        placeholder="Enter your question"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm mb-1">Type</label>
                        <select
                          value={currentQuestion.type}
                          onChange={(e) => setCurrentQuestion({ ...currentQuestion, type: e.target.value as QuestionType })}
                          className="w-full px-3 py-2 border border-gray-300 rounded"
                        >
                          <option value="text">Text</option>
                          <option value="multipleChoice">Multiple Choice</option>
                          <option value="checkbox">Checkbox</option>
                          <option value="rating">Rating</option>
                          <option value="dropdown">Dropdown</option>
                        </select>
                      </div>

                      <div className="flex items-end">
                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={currentQuestion.required}
                            onChange={(e) => setCurrentQuestion({ ...currentQuestion, required: e.target.checked })}
                          />
                          <span className="text-sm">Required</span>
                        </label>
                      </div>
                    </div>

                    {['multipleChoice', 'checkbox', 'dropdown'].includes(currentQuestion.type) && (
                      <div>
                        <label className="block text-sm mb-1">Options</label>
                        <div className="space-y-2">
                          {currentQuestion.options?.map((option, idx) => (
                            <div key={idx} className="flex gap-2">
                              <input
                                type="text"
                                value={option}
                                onChange={(e) => {
                                  const newOptions = [...(currentQuestion.options || [])];
                                  newOptions[idx] = e.target.value;
                                  setCurrentQuestion({ ...currentQuestion, options: newOptions });
                                }}
                                className="flex-1 px-3 py-2 border border-gray-300 rounded"
                                placeholder={`Option ${idx + 1}`}
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  const newOptions = currentQuestion.options?.filter((_, i) => i !== idx) || [];
                                  setCurrentQuestion({ ...currentQuestion, options: newOptions });
                                }}
                                className="px-3 py-2 text-red-600 hover:bg-red-50 rounded"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          ))}
                          <button
                            type="button"
                            onClick={() => {
                              setCurrentQuestion({
                                ...currentQuestion,
                                options: [...(currentQuestion.options || []), '']
                              });
                            }}
                            className="w-full py-2 border border-gray-300 rounded hover:bg-gray-50 text-sm"
                          >
                            + Add Option
                          </button>
                        </div>
                      </div>
                    )}

                    <button
                      onClick={addQuestion}
                      className="w-full py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
                    >
                      Add Question
                    </button>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={editingTemplate ? handleUpdateTemplate : handleCreateTemplate}
                    className="flex-1 py-3 bg-black text-white rounded-lg hover:bg-gray-900 font-semibold"
                  >
                    {editingTemplate ? 'Update Template' : 'Create Template'}
                  </button>
                  <button
                    onClick={() => { setShowTemplateModal(false); setEditingTemplate(null); resetTemplateForm(); }}
                    className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {showAssignmentModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Create Assignment</h2>
                <button onClick={() => { setShowAssignmentModal(false); resetAssignmentForm(); }}>
                  <X size={24} />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold mb-2">Select Template</label>
                  <select
                    value={assignmentForm.templateId}
                    onChange={(e) => setAssignmentForm({ ...assignmentForm, templateId: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="">Choose a template...</option>
                    {templates.map((t) => (
                      <option key={t._id} value={t._id}>{t.title}</option>
                    ))}
                  </select>
                </div>

                <div className="border border-gray-300 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="assignToAll"
                        checked={assignmentForm.assignToAll}
                        onChange={(e) => setAssignmentForm({ ...assignmentForm, assignToAll: e.target.checked, studentIds: [] })}
                        className="w-4 h-4 text-blue-600"
                      />
                      <label htmlFor="assignToAll" className="text-sm font-semibold">
                        Assign to All Students
                      </label>
                    </div>
                    <span className="text-sm font-semibold text-blue-600">
                      {assignmentForm.assignToAll ? students.length : assignmentForm.studentIds.length} selected
                    </span>
                  </div>

                  {!assignmentForm.assignToAll && students.length > 0 && (
                    <>
                      <label className="block text-sm font-semibold mb-2">Or Select Specific Students</label>
                      <div className="border border-gray-300 rounded-lg p-4 max-h-60 overflow-y-auto">
                        {students.map((student) => (
                          <label key={student._id} className="flex items-center gap-2 py-2 hover:bg-gray-50 px-2 rounded cursor-pointer">
                            <input
                              type="checkbox"
                              checked={assignmentForm.studentIds.includes(student._id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setAssignmentForm({
                                    ...assignmentForm,
                                    studentIds: [...assignmentForm.studentIds, student._id]
                                  });
                                } else {
                                  setAssignmentForm({
                                    ...assignmentForm,
                                    studentIds: assignmentForm.studentIds.filter(id => id !== student._id)
                                  });
                                }
                              }}
                              className="w-4 h-4 text-blue-600"
                            />
                            <span className="text-sm">{student.name} ({student.email})</span>
                          </label>
                        ))}
                      </div>
                    </>
                  )}

                  {!assignmentForm.assignToAll && students.length === 0 && (
                    <p className="text-sm text-gray-500">No students available</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">Due Date (Optional)</label>
                  <input
                    type="datetime-local"
                    value={assignmentForm.dueDate}
                    onChange={(e) => setAssignmentForm({ ...assignmentForm, dueDate: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Leave empty to allow students to complete anytime
                  </p>
                </div>

                <div className="border border-gray-300 rounded-lg p-4">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="sendEmail"
                      checked={assignmentForm.sendEmail}
                      onChange={(e) => setAssignmentForm({ ...assignmentForm, sendEmail: e.target.checked })}
                      className="w-4 h-4 text-blue-600"
                    />
                    <label htmlFor="sendEmail" className="text-sm font-semibold">
                      Send Email Notification to Students
                    </label>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Students will receive an email with a link to the assessment
                  </p>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={handleCreateAssignment}
                    className="flex-1 py-3 bg-black text-white rounded-lg hover:bg-gray-900 font-semibold"
                  >
                    Create Assignment
                  </button>
                  <button
                    onClick={() => { setShowAssignmentModal(false); resetAssignmentForm(); }}
                    className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {showResponseModal && selectedResponse && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Response Details</h2>
                <button onClick={() => { setShowResponseModal(false); setSelectedResponse(null); }}>
                  <X size={24} />
                </button>
              </div>

              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Student</p>
                  <p className="font-semibold">{selectedResponse.student.name}</p>
                  <p className="text-sm text-gray-600">{selectedResponse.student.email}</p>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Assessment</p>
                  <p className="font-semibold">{selectedResponse.assignment?.template?.title || 'Template Deleted'}</p>
                </div>

                <div>
                  <h3 className="font-bold mb-3">Answers</h3>
                  {Object.entries(selectedResponse.answers).map(([key, value]) => (
                    <div key={key} className="mb-4 p-4 border border-gray-200 rounded-lg">
                      <p className="text-sm font-semibold text-gray-700 mb-2">{key}</p>
                      <p className="text-gray-900">
                        {Array.isArray(value) ? value.join(', ') : String(value)}
                      </p>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => { setShowResponseModal(false); setSelectedResponse(null); }}
                  className="w-full py-3 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

export default function AdminAssessments() {
  return (
    <ProtectedRoute requiredRole="admin">
      <AdminAssessmentsContent />
    </ProtectedRoute>
  );
}
