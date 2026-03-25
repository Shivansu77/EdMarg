'use client';

import { type ComponentType, useMemo, useState } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import {
  ArrowLeft,
  ArrowRight,
  BriefcaseBusiness,
  Building2,
  Network,
  Telescope,
  Users,
} from 'lucide-react';

type Option = {
  id: string;
  title: string;
  description: string;
  icon: ComponentType<{ className?: string }>;
  color: string;
};

type Question = {
  id: number;
  title: string;
  subtitle: string;
  options: Option[];
};

const questions: Question[] = [
  {
    id: 1,
    title: 'Which environment do you thrive in most?',
    subtitle: 'Think about where you feel most energized and productive during a typical workday.',
    options: [
      {
        id: 'collaborative',
        title: 'Collaborative Hub',
        description: 'Dynamic team settings with frequent brainstorming and constant interaction.',
        icon: Network,
        color: 'bg-[#efe9ff] text-[#5a4fe5]',
      },
      {
        id: 'solitary',
        title: 'Solitary Focus',
        description: 'Quiet, deep-work zones where you can dive into complex problems without interruption.',
        icon: Users,
        color: 'bg-[#efe9ff] text-[#6f4ce0]',
      },
      {
        id: 'field',
        title: 'Field Exploration',
        description: 'On-the-go environments, meeting new people, and exploring physical locations.',
        icon: Telescope,
        color: 'bg-[#e2f1ff] text-[#1975b8]',
      },
      {
        id: 'hybrid',
        title: 'Flexible Hybrid',
        description: "The freedom to choose between home and office based on the day's tasks.",
        icon: Building2,
        color: 'bg-[#eff2f5] text-[#66707d]',
      },
    ],
  },
  {
    id: 2,
    title: 'How do you prefer to solve problems?',
    subtitle: 'Pick the style that feels most natural when you face a challenge.',
    options: [
      {
        id: 'frameworks',
        title: 'Structured Frameworks',
        description: 'Use clear methods, checklists, and proven systems to deliver outcomes.',
        icon: BriefcaseBusiness,
        color: 'bg-[#efe9ff] text-[#5a4fe5]',
      },
      {
        id: 'creative',
        title: 'Creative Experiments',
        description: 'Explore bold ideas, test quickly, and refine through iteration.',
        icon: Network,
        color: 'bg-[#efe9ff] text-[#6f4ce0]',
      },
      {
        id: 'data',
        title: 'Data-Led Decisions',
        description: 'Rely on evidence, metrics, and patterns before committing to a direction.',
        icon: Building2,
        color: 'bg-[#e2f1ff] text-[#1975b8]',
      },
      {
        id: 'people',
        title: 'People-Centered',
        description: 'Talk to stakeholders first, then design solutions around human needs.',
        icon: Users,
        color: 'bg-[#eff2f5] text-[#66707d]',
      },
    ],
  },
];

function StudentAssessmentContent() {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});

  const currentQuestion = questions[currentStep];
  const selectedOption = answers[currentQuestion.id];
  const progress = Math.round(((currentStep + 1) / questions.length) * 100);

  const completionText = useMemo(() => {
    const answered = Object.keys(answers).length;
    return `${answered}/${questions.length} answered`;
  }, [answers]);

  const onSelect = (optionId: string) => {
    setAnswers((prev) => ({ ...prev, [currentQuestion.id]: optionId }));
  };

  const onNext = () => {
    if (!selectedOption) return;
    if (currentStep < questions.length - 1) {
      setCurrentStep((step) => step + 1);
    }
  };

  const onPrevious = () => {
    setCurrentStep((step) => Math.max(0, step - 1));
  };

  return (
    <DashboardLayout userName="Assessment">
      <div className="max-w-4xl mx-auto pb-12">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-2">Career Assessment</p>
              <h1 className="text-3xl font-bold text-gray-900">Question {currentStep + 1} of {questions.length}</h1>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold text-blue-600">{progress}%</p>
              <p className="text-sm text-gray-600 mt-1">{completionText}</p>
            </div>
          </div>
          <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
            <div className="h-full bg-blue-600 transition-all duration-300" style={{ width: `${progress}%` }} />
          </div>
        </div>

        {/* Question */}
        <div className="mb-10">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{currentQuestion.title}</h2>
          <p className="text-gray-600 text-base">{currentQuestion.subtitle}</p>
        </div>

        {/* Options Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
          {currentQuestion.options.map((option) => {
            const isSelected = selectedOption === option.id;
            const Icon = option.icon;

            return (
              <button
                type="button"
                key={option.id}
                onClick={() => onSelect(option.id)}
                className={`p-5 rounded-lg border-2 text-left transition-all duration-200 ${
                  isSelected
                    ? 'border-blue-600 bg-blue-50 shadow-md'
                    : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
                }`}
              >
                <div className={`inline-flex h-10 w-10 items-center justify-center rounded-lg mb-3 ${
                  isSelected ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'
                }`}>
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="font-semibold text-gray-900 text-base mb-1">{option.title}</h3>
                <p className="text-sm text-gray-600">{option.description}</p>
              </button>
            );
          })}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={onPrevious}
            disabled={currentStep === 0}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ArrowLeft className="h-4 w-4" /> Previous
          </button>

          <button
            type="button"
            onClick={onNext}
            disabled={!selectedOption || currentStep === questions.length - 1}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {currentStep === questions.length - 1 ? 'Complete' : 'Next'} <ArrowRight className="h-4 w-4" />
          </button>
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
