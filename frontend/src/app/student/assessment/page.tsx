'use client';

import { type ComponentType, useMemo, useState } from 'react';
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

export default function StudentAssessmentPage() {
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
      <div className="max-w-5xl space-y-7 pb-8">
        <section className="space-y-4">
          <p className="text-[13px] font-bold uppercase tracking-[0.08em] text-[#5a53e8]">Career Exploration Quiz</p>
          <div className="flex items-end justify-between gap-4">
            <h2 className="text-[48px] leading-none tracking-[-0.03em] font-extrabold text-[#2f3445]">
              Step {currentStep + 1} <span className="text-[#8b93a7]">of {questions.length}</span>
            </h2>
            <p className="text-[32px] font-extrabold text-[#5a53e8]">{progress}%</p>
          </div>

          <div className="h-2.5 rounded-full bg-[#e2e6ee] overflow-hidden">
            <div className="h-full rounded-full bg-[#5a53e8] transition-all duration-300" style={{ width: `${progress}%` }} />
          </div>
          <p className="text-[14px] font-semibold text-[#7f889e]">{completionText}</p>
        </section>

        <section className="space-y-4">
          <h3 className="text-[56px] leading-tight tracking-[-0.03em] font-extrabold text-[#343a45]">{currentQuestion.title}</h3>
          <p className="text-[35px] leading-snug text-[#6d7383] max-w-4xl">{currentQuestion.subtitle}</p>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 pt-3">
            {currentQuestion.options.map((option) => {
              const isSelected = selectedOption === option.id;
              const Icon = option.icon;

              return (
                <button
                  type="button"
                  key={option.id}
                  onClick={() => onSelect(option.id)}
                  className={`rounded-2xl border p-6 text-left transition-all duration-200 bg-white ${
                    isSelected
                      ? 'border-[#5a53e8] shadow-[0_10px_30px_rgba(90,83,232,0.14)]'
                      : 'border-[#eceff5] hover:border-[#d8def0]'
                  }`}
                >
                  <span className={`inline-flex h-12 w-12 items-center justify-center rounded-xl ${option.color}`}>
                    <Icon className="h-6 w-6" />
                  </span>
                  <p className="mt-5 text-[38px] leading-none tracking-[-0.02em] font-extrabold text-[#323844]">{option.title}</p>
                  <p className="mt-3 text-[29px] leading-snug text-[#646c7d]">{option.description}</p>
                </button>
              );
            })}
          </div>
        </section>

        <section className="pt-6 flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={onPrevious}
            disabled={currentStep === 0}
            className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-[#edf1f7] text-[#9aa3b7] text-[24px] font-semibold disabled:opacity-80"
          >
            <ArrowLeft className="h-5 w-5" /> Previous
          </button>

          <button
            type="button"
            onClick={onNext}
            disabled={!selectedOption || currentStep === questions.length - 1}
            className="inline-flex items-center gap-2 px-10 py-4 rounded-full bg-[#5a53e8] text-white text-[24px] font-semibold disabled:opacity-50"
          >
            Next Question <ArrowRight className="h-5 w-5" />
          </button>
        </section>

        <footer className="pt-10 flex items-center justify-between text-[14px] text-[#8d93a5]">
          <div className="flex items-center gap-6">
            <button type="button" className="hover:text-[#5a53e8]">Need Help?</button>
            <button type="button" className="hover:text-[#5a53e8]">Save for Later</button>
          </div>
          <p>Session automatically saved at 14:02 PM</p>
        </footer>
      </div>
    </DashboardLayout>
  );
}
