'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import ProtectedRoute from '@/components/ProtectedRoute';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { apiClient } from '@/utils/api-client';
import { AlertCircle, CheckCircle2, Loader2, Sparkles, ArrowRight, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Walkthrough from '@/components/assessment/Walkthrough';

type InterestKey = 'logicalProblems' | 'computersTech' | 'helpingPeople' | 'moneyBusiness' | 'creativeWork' | 'machinesTools' | 'outdoorWork' | 'researchLearning';
type SkillKey = 'mathematicsNumerical' | 'communication' | 'problemSolving' | 'creativity' | 'leadership' | 'technicalSkills' | 'timeManagement';

type PersonalityAnswers = {
  workPreference: '' | 'alone' | 'team' | 'both';
  workStyle: '' | 'structured' | 'flexible';
  decisionStyle: '' | 'quick' | 'analytical';
  riskTaking: '' | 'low' | 'medium' | 'high';
  pressureHandling: '' | 'poorly' | 'average' | 'well';
};

type AcademicsAnswers = {
  stream: '' | 'science' | 'commerce' | 'arts';
  favoriteSubjects: string[];
  averageMarks: '' | 'above85' | '70to85' | '50to70' | 'below50';
};

type GoalsAnswers = {
  priority: '' | 'salary' | 'workLifeBalance' | 'passion';
  studyFivePlusYears: '' | 'yes' | 'no' | 'maybe';
  workType: '' | 'desk' | 'field' | 'mixed';
  entrepreneurship: '' | 'yes' | 'no' | 'maybe';
};

type AssessmentAnswers = {
  interests: Record<InterestKey, number>;
  skills: Record<SkillKey, number>;
  personality: PersonalityAnswers;
  academics: AcademicsAnswers;
  goals: GoalsAnswers;
};

type SkillToLearn = {
  skill: string;
  course: string;
};

type CareerRecommendation = {
  rank: number;
  careerId: string;
  careerName: string;
  matchScore: number;
  whyThisFitsYou: string;
  requiredSkills: string[];
  suggestedNextSteps: string[];
  careerRoadmapAfter12th: string[];
  salaryRange: string;
  skillsToLearn: SkillToLearn[];
  collegeSuggestions: string[];
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
  answers: AssessmentAnswers;
  result: AssessmentResult | null;
  createdAt: string;
  updatedAt: string;
};

const DEFAULT_ANSWERS: AssessmentAnswers = {
  interests: {
    logicalProblems: 0, computersTech: 0, helpingPeople: 0, moneyBusiness: 0, creativeWork: 0,
    machinesTools: 0, outdoorWork: 0, researchLearning: 0,
  },
  skills: {
    mathematicsNumerical: 0, communication: 0, problemSolving: 0, creativity: 0, leadership: 0,
    technicalSkills: 0, timeManagement: 0,
  },
  personality: { workPreference: '', workStyle: '', decisionStyle: '', riskTaking: '', pressureHandling: '' },
  academics: { stream: '', favoriteSubjects: [], averageMarks: '' },
  goals: { priority: '', studyFivePlusYears: '', workType: '', entrepreneurship: '' },
};

const FAVORITE_SUBJECT_OPTIONS = [
  'Mathematics', 'Physics', 'Chemistry', 'Biology', 'Economics', 'Business Studies', 'Accountancy',
  'History', 'Political Science', 'English',
];

const TAG_LABELS: Record<string, string> = {
  logic: 'Logic', tech: 'Tech', social: 'Social', business: 'Business', creative: 'Creative',
  practical: 'Practical', research: 'Research', outdoor: 'Outdoor',
};

// ================= QUIZ UI CONSTANTS =================
const QUIZ_SLIDES = [
  // Interests (8)
  { key: 'logicalProblems', cat: 'interests', type: 'rating', question: 'How much do you enjoy solving logic or math problems?', desc: 'Puzzles, riddles, math equations.' },
  { key: 'computersTech', cat: 'interests', type: 'rating', question: 'How much do you enjoy working with technology?', desc: 'Coding, using software, gadgets.' },
  { key: 'helpingPeople', cat: 'interests', type: 'rating', question: 'How much do you enjoy helping or guiding people?', desc: 'Teaching, counseling, healthcare.' },
  { key: 'moneyBusiness', cat: 'interests', type: 'rating', question: 'How much do you enjoy managing money or business?', desc: 'Finance, leadership, trading.' },
  { key: 'creativeWork', cat: 'interests', type: 'rating', question: 'How much do you enjoy creative expression?', desc: 'Design, writing, art, music.' },
  { key: 'machinesTools', cat: 'interests', type: 'rating', question: 'How much do you enjoy working with your hands?', desc: 'Machines, tools, equipment.' },
  { key: 'outdoorWork', cat: 'interests', type: 'rating', question: 'How much do you enjoy working outdoors?', desc: 'Fieldwork, travel-based jobs.' },
  { key: 'researchLearning', cat: 'interests', type: 'rating', question: 'How much do you enjoy researching deeply?', desc: 'Information gathering, analysis.' },

  // Skills (7)
  { key: 'mathematicsNumerical', cat: 'skills', type: 'rating', question: 'Rate your current skill level: Mathematical Ability', desc: 'Working with numbers and data.' },
  { key: 'communication', cat: 'skills', type: 'rating', question: 'Rate your current skill level: Communication', desc: 'Speaking and writing clearly.' },
  { key: 'problemSolving', cat: 'skills', type: 'rating', question: 'Rate your current skill level: Problem-Solving', desc: 'Finding solutions efficiently.' },
  { key: 'creativity', cat: 'skills', type: 'rating', question: 'Rate your current skill level: Creativity', desc: 'Imagination and original ideas.' },
  { key: 'leadership', cat: 'skills', type: 'rating', question: 'Rate your current skill level: Leadership', desc: 'Making decisions and managing teams.' },
  { key: 'technicalSkills', cat: 'skills', type: 'rating', question: 'Rate your current skill level: Technical Skills', desc: 'Computers, specialized software.' },
  { key: 'timeManagement', cat: 'skills', type: 'rating', question: 'Rate your current skill level: Time Management', desc: 'Discipline and meeting deadlines.' },

  // Personality (5)
  { key: 'workPreference', cat: 'personality', type: 'choice', question: 'How do you prefer working?', options: [{val: 'alone', lbl: 'Alone focus'}, {val: 'team', lbl: 'In a team environment'}, {val: 'both', lbl: 'A mix of both'}] },
  { key: 'workStyle', cat: 'personality', type: 'choice', question: 'What type of work environment do you thrive in?', options: [{val: 'structured', lbl: 'Structured and predictable'}, {val: 'flexible', lbl: 'Flexible and dynamic'}] },
  { key: 'decisionStyle', cat: 'personality', type: 'choice', question: 'What is your decision-making style?', options: [{val: 'quick', lbl: 'Quick and instinctive'}, {val: 'analytical', lbl: 'Careful and analytical'}] },
  { key: 'riskTaking', cat: 'personality', type: 'choice', question: 'What is your risk-taking appetite?', options: [{val: 'low', lbl: 'Low (Prefer stability)'}, {val: 'medium', lbl: 'Medium'}, {val: 'high', lbl: 'High (Prefer risk/reward)'}] },
  { key: 'pressureHandling', cat: 'personality', type: 'choice', question: 'How well do you handle pressure and stress?', options: [{val: 'poorly', lbl: 'Poorly'}, {val: 'average', lbl: 'Average'}, {val: 'well', lbl: 'Very well'}] },

  // Academics (3)
  { key: 'stream', cat: 'academics', type: 'choice', question: 'What is your current or intended stream?', options: [{val: 'science', lbl: 'Science'}, {val: 'commerce', lbl: 'Commerce'}, {val: 'arts', lbl: 'Arts/Humanities'}] },
  { key: 'averageMarks', cat: 'academics', type: 'choice', question: 'What are your average academic marks?', options: [{val: 'above85', lbl: 'Above 85%'}, {val: '70to85', lbl: '70% - 85%'}, {val: '50to70', lbl: '50% - 70%'}, {val: 'below50', lbl: 'Below 50%'}] },
  { key: 'favoriteSubjects', cat: 'academics', type: 'multi-select', question: 'Select your favorite subjects', desc: 'Choose up to 3 subjects.', options: FAVORITE_SUBJECT_OPTIONS.map(s => ({val: s, lbl: s})) },

  // Goals (2)
  { key: 'priority', cat: 'goals', type: 'choice', question: 'What matters more to you in your future career?', options: [{val: 'salary', lbl: 'A highly lucrative salary'}, {val: 'workLifeBalance', lbl: 'A stable work-life balance'}, {val: 'passion', lbl: 'Pursuing my passion'}] },
  { key: 'workType', cat: 'goals', type: 'choice', question: 'What type of physical work environment do you prefer?', options: [{val: 'desk', lbl: 'Desk & Office work'}, {val: 'field', lbl: 'Field & Travel work'}, {val: 'mixed', lbl: 'A balanced mix'}] },
];

const RATING_LABELS: Record<number, string> = {
  1: 'Very Low', 2: 'Low', 3: 'Neutral', 4: 'High', 5: 'Very High',
};

// ================= MERGE FUNCTION =================
const safeRating = (value: unknown): number => {
  const n = Number(value);
  return Number.isInteger(n) && n >= 1 && n <= 5 ? n : 0;
};
const mergeWithDefaults = (incoming?: Partial<AssessmentAnswers> | null): AssessmentAnswers => {
  if (!incoming || typeof incoming !== 'object') return DEFAULT_ANSWERS;
  const interests = (incoming.interests || {}) as Partial<Record<InterestKey, unknown>>;
  const skills = (incoming.skills || {}) as Partial<Record<SkillKey, unknown>>;
  const personality = (incoming.personality || {}) as Partial<PersonalityAnswers>;
  const academics = (incoming.academics || {}) as Partial<AcademicsAnswers>;
  const goals = (incoming.goals || {}) as Partial<GoalsAnswers>;
  return {
    interests: {
      logicalProblems: safeRating(interests.logicalProblems),
      computersTech: safeRating(interests.computersTech),
      helpingPeople: safeRating(interests.helpingPeople),
      moneyBusiness: safeRating(interests.moneyBusiness),
      creativeWork: safeRating(interests.creativeWork),
      machinesTools: safeRating(interests.machinesTools),
      outdoorWork: safeRating(interests.outdoorWork),
      researchLearning: safeRating(interests.researchLearning),
    },
    skills: {
      mathematicsNumerical: safeRating(skills.mathematicsNumerical),
      communication: safeRating(skills.communication),
      problemSolving: safeRating(skills.problemSolving),
      creativity: safeRating(skills.creativity),
      leadership: safeRating(skills.leadership),
      technicalSkills: safeRating(skills.technicalSkills),
      timeManagement: safeRating(skills.timeManagement),
    },
    personality: {
      workPreference: ['alone', 'team', 'both'].includes(personality.workPreference as string) ? personality.workPreference as any : '',
      workStyle: ['structured', 'flexible'].includes(personality.workStyle as string) ? personality.workStyle as any : '',
      decisionStyle: ['quick', 'analytical'].includes(personality.decisionStyle as string) ? personality.decisionStyle as any : '',
      riskTaking: ['low', 'medium', 'high'].includes(personality.riskTaking as string) ? personality.riskTaking as any : '',
      pressureHandling: ['poorly', 'average', 'well'].includes(personality.pressureHandling as string) ? personality.pressureHandling as any : '',
    },
    academics: {
      stream: ['science', 'commerce', 'arts'].includes(academics.stream as string) ? academics.stream as any : '',
      favoriteSubjects: Array.isArray(academics.favoriteSubjects) ? academics.favoriteSubjects.filter((s): s is string => typeof s === 'string').slice(0, 3) : [],
      averageMarks: ['above85', '70to85', '50to70', 'below50'].includes(academics.averageMarks as string) ? academics.averageMarks as any : '',
    },
    goals: {
      priority: ['salary', 'workLifeBalance', 'passion'].includes(goals.priority as string) ? goals.priority as any : '',
      workType: ['desk', 'field', 'mixed'].includes(goals.workType as string) ? goals.workType as any : '',
      studyFivePlusYears: '', entrepreneurship: ''
    },
  };
};

function AssessmentContent() {
  const [answers, setAnswers] = useState<AssessmentAnswers>(DEFAULT_ANSWERS);
  const [result, setResult] = useState<AssessmentResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [showWalkthrough, setShowWalkthrough] = useState(false);

  useEffect(() => {
    const loadExistingAssessment = async () => {
      setLoading(true);
      try {
        const response = await apiClient.get<AssessmentSubmission>('/api/v1/users/assessment');
        let hasResult = false;
        
        if (response.success && response.data) {
          setAnswers(mergeWithDefaults(response.data.answers));
          setResult(response.data.result || null);
          if (response.data.result) {
             setCurrentStep(QUIZ_SLIDES.length - 1);
             hasResult = true;
          }
        }
        
        // Show walkthrough if no result exists, even if there's draft data
        if (!hasResult && !localStorage.getItem('hasSeenAssessmentWalkthrough')) {
          setShowWalkthrough(true);
        }
      } catch (fetchError) {
        console.error('Failed to load assessment', fetchError);
        // On error, if no result, still consider showing walkthrough
        if (!localStorage.getItem('hasSeenAssessmentWalkthrough')) {
          setShowWalkthrough(true);
        }
      } finally {
        setLoading(false);
      }
    };
    void loadExistingAssessment();
  }, []);

  const handleWalkthroughComplete = () => {
    localStorage.setItem('hasSeenAssessmentWalkthrough', 'true');
    setShowWalkthrough(false);
  };

  const slide = QUIZ_SLIDES[currentStep];

  const updateAnswer = (val: any) => {
    setError(null);
    setAnswers(prev => ({
      ...prev,
      [slide.cat]: {
        ...prev[slide.cat as keyof AssessmentAnswers],
        [slide.key]: val
      }
    }));

    // Auto advance without triggering stale validation
    if (slide.type !== 'multi-select') {
      setTimeout(() => {
        setCurrentStep((p) => {
          if (p < QUIZ_SLIDES.length - 1) {
            return p + 1;
          }
          return p;
        });
        // If last step, don't auto-submit. Let user click 'Finish' manually.
      }, 350);
    }
  };

  const toggleMultiSelect = (val: string) => {
    setError(null);
    const selected = answers.academics.favoriteSubjects;
    const exists = selected.includes(val);
    if (!exists && selected.length >= 3) return;

    setAnswers(prev => ({
      ...prev, academics: {
        ...prev.academics,
        favoriteSubjects: exists ? selected.filter(s => s !== val) : [...selected, val]
      }
    }));
  };

  const getAnswerValue = () => {
    if (!slide) return undefined;
    const catData = answers[slide.cat as keyof AssessmentAnswers] as any;
    if (!catData) return undefined;
    return catData[slide.key];
  };

  const vBeforeStepNext = () => {
    if (!slide) return null;
    const val = getAnswerValue();
    if (slide.type === 'rating' && (!val || val < 1 || val > 5)) return 'Please select a rating.';
    if (slide.type === 'choice' && !val) return 'Please choose an option.';
    if (slide.type === 'multi-select' && (!val || val.length === 0)) return 'Please select at least one.';
    return null;
  };

  const goNext = () => {
    const err = vBeforeStepNext();
    if (err) { setError(err); return; }
    if (currentStep < QUIZ_SLIDES.length - 1) setCurrentStep((p) => p + 1);
    else handleSubmit();
  };

  const goBack = () => {
    if (currentStep > 0) {
      setCurrentStep((p) => p - 1);
      setError(null);
    } else {
      setResult(null); // allow re-taking from results screen
    }
  };

  const handleSubmit = async () => {
    const err = vBeforeStepNext();
    if (err) { setError(err); return; }
    
    setSubmitting(true);
    setError(null);
    try {
      const response = await apiClient.post<AssessmentSubmission>('/api/v1/users/assessment', { answers });
      if (!response.success || !response.data) throw new Error(response.error || 'Failed to submit');
      
      setAnswers(mergeWithDefaults(response.data.answers));
      setResult(response.data.result || null);
    } catch (err: any) {
      setError(err.message || 'Submission failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout userName="Career Quiz">
        <div className="flex min-h-[70vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
        </div>
      </DashboardLayout>
    );
  }

  // RESULT VIEW
  if (result && currentStep >= QUIZ_SLIDES.length - 1 && !submitting && !error) {
    const recs = result.step4Output?.top3CareerRecommendations || [];
    const dominantTags = result.step3CareerMapping?.dominantTags || [];
    return (
      <DashboardLayout userName="Assessment Results">
        <div className="space-y-6 pb-12 max-w-5xl mx-auto">
          <div className="flex items-center justify-between">
             <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Your Career Roadmap</h1>
             <button onClick={() => { setResult(null); setCurrentStep(0); setShowWalkthrough(true); }} className="px-4 py-2 text-sm font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg">Retake Quiz</button>
          </div>
          
          <div className="rounded-3xl border border-slate-200 bg-linear-to-br from-white via-slate-50 to-emerald-50/50 p-6 shadow-sm sm:p-8">
            <h2 className="text-xl font-bold tracking-tight text-slate-900">Top Traits Identified</h2>
            {dominantTags.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {dominantTags.map((tag) => (
                  <span key={tag} className="rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-bold uppercase tracking-wide text-emerald-700">
                    {TAG_LABELS[tag] || tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="grid gap-6">
            {recs.map((career) => (
              <article key={career.careerId} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm overflow-hidden relative group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-bl-full -z-0 opacity-50 transition-transform group-hover:scale-110"></div>
                <div className="relative z-10">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                        <Sparkles size={12} /> Rank #{career.rank}
                      </span>
                      <h3 className="mt-3 text-3xl font-extrabold text-slate-900 tracking-tight">{career.careerName}</h3>
                    </div>
                    <div className="rounded-xl border border-emerald-100 bg-emerald-50/50 px-5 py-3 text-center">
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Match</p>
                      <p className="text-2xl font-black text-emerald-600">{career.matchScore}%</p>
                    </div>
                  </div>

                  <div className="mt-8 grid gap-6 lg:grid-cols-2">
                    <div>
                      <p className="text-sm font-bold text-slate-900">Why this fits you</p>
                      <p className="mt-2 text-sm text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100">{career.whyThisFitsYou}</p>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900">Salary Expectation</p>
                      <p className="mt-2 text-sm text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100">{career.salaryRange}</p>
                    </div>
                  </div>

                  <div className="mt-8">
                    <p className="text-sm font-bold text-slate-900 mb-3">Professional Requirements</p>
                    <div className="flex flex-wrap gap-2">
                      {career.requiredSkills.map((item) => (
                        <span key={item} className="px-3 py-1.5 bg-slate-100 border border-slate-200 text-sm font-medium text-slate-700 rounded-lg">{item}</span>
                      ))}
                    </div>
                  </div>

                  <div className="mt-8 flex flex-col sm:flex-row gap-4 border-t border-slate-100 pt-6">
                     <Link href="/student/mentors" className="flex-1 inline-flex justify-center items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-6 rounded-xl transition-colors">
                        Find a {career.careerName} Mentor <ArrowRight size={18} />
                     </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // QUIZ VIEW
  if (!slide) {
    return (
      <DashboardLayout userName="Career Discovery">
        <div className="flex min-h-[70vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
        </div>
      </DashboardLayout>
    );
  }

  const val = getAnswerValue();
  const progressPercent = ((currentStep) / QUIZ_SLIDES.length) * 100;

  return (
    <DashboardLayout userName="Career Discovery">
      {showWalkthrough && <Walkthrough onComplete={handleWalkthroughComplete} />}
      <div className="max-w-3xl mx-auto py-8">
        {/* Progress Bar */}
        <div className="mb-12">
          <div className="flex justify-between items-end mb-4">
             <div>
               <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Question {currentStep + 1} of {QUIZ_SLIDES.length}</p>
               <h3 className="text-xl font-bold text-slate-900 capitalize flex items-center gap-2">
                 <Sparkles className="text-emerald-500" size={20}/> {slide.cat}
               </h3>
             </div>
             <p className="text-lg font-black text-emerald-600">{Math.round(progressPercent)}%</p>
          </div>
          <div className="h-4 w-full bg-slate-100 rounded-full overflow-hidden shadow-inner">
            <div className="h-full bg-gradient-to-r from-emerald-400 to-emerald-600 transition-all duration-500 ease-out flex items-center justify-end pr-1.5 shadow-[0_0_10px_rgba(16,185,129,0.5)]" style={{ width: `${Math.max(5, progressPercent)}%` }}>
               <div className="h-2 w-2 bg-white rounded-full opacity-70"></div>
            </div>
          </div>
        </div>

        {/* Card */}
        <div className="bg-white border border-slate-200 shadow-xl shadow-slate-200/40 rounded-3xl overflow-hidden flex flex-col min-h-[400px]">
          
          <div className="p-8 sm:p-12 grow flex flex-col justify-center">
            {error && (
              <div className="mb-8 bg-rose-50 border border-rose-100 text-rose-600 px-4 py-3 rounded-xl text-sm font-bold flex items-center gap-2">
                <AlertCircle size={16} className="shrink-0" /> {error}
              </div>
            )}
            
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 15 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -15 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
                className="w-full max-w-2xl mx-auto relative"
              >
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 leading-tight mb-3">
                  {slide.question}
                </h1>
                {slide.desc && <p className="text-slate-500 font-medium mb-10 text-lg">{slide.desc}</p>}
                {!slide.desc && <div className="mb-10"></div>}

                {/* Rating Type */}
                {slide.type === 'rating' && (
                  <div className="grid grid-cols-5 gap-2 sm:gap-3">
                    {[1, 2, 3, 4, 5].map((rating) => {
                      const isSelected = val === rating;
                      // Dynamic coloring for higher ratings
                      const getActiveColors = (r: number) => {
                        if (r <= 2) return 'border-emerald-400 bg-emerald-50 text-emerald-700';
                        if (r === 3) return 'border-emerald-500 bg-emerald-100 text-emerald-800';
                        return 'border-emerald-600 bg-emerald-600 text-white';
                      };
                      
                      return (
                        <button
                          key={rating}
                          onClick={() => updateAnswer(rating)}
                          className={`flex flex-col items-center justify-center py-4 px-1 sm:p-4 rounded-2xl border-2 transition-all hover:-translate-y-1 hover:shadow-md ${isSelected ? `${getActiveColors(rating)} shadow-sm` : 'border-slate-100 bg-white hover:border-emerald-200 hover:bg-slate-50 text-slate-600'}`}
                        >
                          <span className={`text-xl sm:text-2xl font-black mb-1 sm:mb-2 ${isSelected ? (rating > 3 ? 'text-white' : 'text-emerald-700') : 'text-slate-800'}`}>{rating}</span>
                          <span className={`text-[10px] sm:text-xs font-bold text-center leading-tight ${isSelected && rating > 3 ? 'text-emerald-50' : ''}`}>{RATING_LABELS[rating]}</span>
                        </button>
                      )
                    })}
                  </div>
                )}

                {/* Choice Type */}
                {slide.type === 'choice' && slide.options && (
                  <div className="grid gap-3">
                    {slide.options.map((opt) => {
                      const isSelected = val === opt.val;
                      return (
                        <button
                          key={opt.val}
                          onClick={() => updateAnswer(opt.val)}
                          className={`flex items-center text-left w-full p-5 rounded-2xl border-2 transition-all ${isSelected ? 'border-emerald-500 bg-emerald-50 shadow-sm' : 'border-slate-100 bg-white hover:border-emerald-200 hover:bg-slate-50'}`}
                        >
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mr-4 ${isSelected ? 'border-emerald-500 bg-emerald-500' : 'border-slate-300'}`}>
                             {isSelected && <div className="w-2 h-2 rounded-full bg-white"></div>}
                          </div>
                          <span className={`font-bold text-lg ${isSelected ? 'text-emerald-800' : 'text-slate-700'}`}>{opt.lbl}</span>
                        </button>
                      )
                    })}
                  </div>
                )}

                {/* Multi Select Type */}
                {slide.type === 'multi-select' && slide.options && (
                  <div className="grid sm:grid-cols-2 gap-3">
                    {slide.options.map((opt) => {
                      const isSelected = (val as string[]).includes(opt.val);
                      return (
                        <button
                          key={opt.val}
                          onClick={() => toggleMultiSelect(opt.val)}
                          className={`flex items-center text-left w-full p-4 rounded-2xl border-2 transition-all ${isSelected ? 'border-emerald-500 bg-emerald-50 shadow-sm' : 'border-slate-100 bg-white hover:border-emerald-200 hover:bg-slate-50'}`}
                        >
                          <div className={`w-5 h-5 rounded border-2 flex items-center justify-center mr-4 ${isSelected ? 'border-emerald-500 bg-emerald-500' : 'border-slate-300'}`}>
                             {isSelected && <CheckCircle2 className="text-white relative top-[0.5px]" size={14} strokeWidth={4} />}
                          </div>
                          <span className={`font-bold ${isSelected ? 'text-emerald-800' : 'text-slate-700'}`}>{opt.lbl}</span>
                        </button>
                      )
                    })}
                    {/* Progress note */}
                    <div className="col-span-full mt-2 text-right">
                       <span className="text-sm font-bold text-slate-400">Selected {val.length} / 3</span>
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="bg-slate-50 border-t border-slate-100 p-6 sm:px-12 flex justify-between items-center relative z-10">
            <button
              onClick={goBack}
              disabled={submitting}
              className={`flex items-center font-bold text-slate-500 hover:text-slate-900 transition-colors ${submitting ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <ArrowLeft size={18} className="mr-2" /> {currentStep === 0 ? 'Exit' : 'Previous'}
            </button>
            <button
              onClick={goNext}
              disabled={submitting}
              className="flex items-center bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white font-bold py-3.5 px-8 rounded-xl transition-all shadow-md hover:shadow-[0_8px_20px_rgba(16,185,129,0.3)] hover:-translate-y-0.5 active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-md text-lg"
            >
              {submitting ? (
                 <><Loader2 className="animate-spin mr-2" size={20} /> Processing...</>
              ) : currentStep === QUIZ_SLIDES.length - 1 ? (
                 <><CheckCircle2 className="mr-2" size={20} /> Finish</>
              ) : (
                 <>Next <ArrowRight className="ml-2" size={20} /></>
              )}
            </button>
          </div>

        </div>
      </div>
    </DashboardLayout>
  );
}

export default function StudentAssessmentPage() {
  return (
    <ProtectedRoute requiredRole="student">
      <AssessmentContent />
    </ProtectedRoute>
  );
}
