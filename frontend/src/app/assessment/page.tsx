'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, CheckCircle, Lightbulb } from 'lucide-react';
import { motion } from 'framer-motion';

const AssessmentPage = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [showResults, setShowResults] = useState(false);

  const questions = [
    {
      id: 0,
      question: 'What are your strongest subjects?',
      options: ['Math & Physics', 'Science & Biology', 'History & Economics', 'Arts & Literature'],
      paths: ['Engineering', 'Medical', 'Commerce', 'Arts'],
    },
    {
      id: 1,
      question: 'What excites you about your future?',
      options: ['Building & Technology', 'Helping People', 'Business & Finance', 'Social Impact'],
      paths: ['Engineering', 'Medical', 'Commerce', 'Arts'],
    },
    {
      id: 2,
      question: 'How do you want to spend your career?',
      options: ['Creative Problem-Solving', 'Direct Service', 'Strategy & Management', 'Research & Analysis'],
      paths: ['Engineering', 'Medical', 'Commerce', 'Arts'],
    },
    {
      id: 3,
      question: 'What matters most post board exams?',
      options: ['High paying job', 'Job Security', 'Flexible hours', 'Social recognition'],
      paths: ['Engineering', 'Medical', 'Commerce', 'Arts'],
    },
    {
      id: 4,
      question: 'Your ideal work environment?',
      options: ['Labs & Innovation', 'Hospitals & Clinics', 'Corporate Offices', 'NGOs & Academia'],
      paths: ['Engineering', 'Medical', 'Commerce', 'Arts'],
    },
  ];

  const pathDetails: Record<string, any> = {
    'Engineering': {
      description: 'Perfect for builders and problem-solvers',
      colleges: ['IIT Delhi', 'NIT Trichy', 'BITS Pilani', 'VIT', 'IIIT Hyderabad'],
      opportunities: ['Software Development', 'Civil Engineering', 'Mechanical Innovation', 'Startups'],
      avg_salary: '₹8-15 LPA',
      career_timeline: 'B.Tech (4 yrs) → Placements / Higher Studies',
    },
    'Medical': {
      description: 'Ideal for those who want to make direct impact',
      colleges: ['AIIMS Delhi', 'CMC Vellore', 'Christian Medical College', 'JIPMER'],
      opportunities: ['Doctor', 'Surgeon', 'Researcher', 'Public Health'],
      avg_salary: '₹5-20 LPA',
      career_timeline: 'MBBS (5.5 yrs) → Specialization / Practice',
    },
    'Commerce': {
      description: 'Best for future business leaders & financial minds',
      colleges: ['Delhi University', 'Mumbai University', 'Christ University', 'Symbiosis'],
      opportunities: ['CA', 'MBA', 'Finance', 'Entrepreneurship'],
      avg_salary: '₹4-25 LPA',
      career_timeline: 'B.Com (3 yrs) → CA/MBA / Corporate roles',
    },
    'Arts': {
      description: 'Perfect for critical thinkers & change makers',
      colleges: ['JNU', 'Delhi University', 'Amity', 'Miranda House'],
      opportunities: ['IAS/IPS', 'Journalism', 'NGO Leadership', 'Research'],
      avg_salary: '₹3-18 LPA',
      career_timeline: 'B.A (3 yrs) → Civil Service / Specialization',
    },
  };

  const pathScores: Record<string, number> = {
    'Engineering': 0,
    'Medical': 0,
    'Commerce': 0,
    'Arts': 0,
  };

  // Calculate scores based on answers
  Object.entries(answers).forEach(([qIdx, answerIdx]) => {
    const path = questions[parseInt(qIdx)].paths[answerIdx];
    if (path in pathScores) {
      pathScores[path]++;
    }
  });

  const topPath = Object.entries(pathScores)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)
    .map(([path, score]) => ({
      path,
      match: Math.min(99, 40 + score * 12),
      ...pathDetails[path],
    }));

  const handleAnswer = (optionIdx: number) => {
    const newAnswers = { ...answers, [currentStep]: optionIdx };
    setAnswers(newAnswers);

    if (currentStep < questions.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      setShowResults(true);
    }
  };

  const handleReset = () => {
    setCurrentStep(0);
    setAnswers({});
    setShowResults(false);
  };

  return (
    <main className="relative w-full min-h-screen flex items-center section-dark overflow-hidden pt-24 pb-16">
      {/* Galaxy background */}
      <div className="absolute inset-0 hero-galaxy-bg" />
      <div className="absolute inset-0 hero-stars-layer" />
      <div className="absolute inset-0 hero-stars-layer hero-stars-layer-soft" />

      <div className="max-w-3xl mx-auto px-6 lg:px-12 w-full relative z-10">
        {!showResults ? (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
            {/* Header */}
            <div className="text-center space-y-3">
              <p className="text-sm font-semibold text-[#A78BFA] uppercase tracking-wider">12th Pass Guidance</p>
              <h1 className="text-4xl md:text-5xl font-extrabold text-white font-sora">
                Find Your Future Path
              </h1>
              <p className="text-white/60 text-lg">Answer 5 questions to discover the right stream & career guidance for your journey ahead</p>
            </div>

            {/* Progress Bar */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-white/70">Question {currentStep + 1} of {questions.length}</span>
                <span className="text-sm font-semibold text-[#A78BFA]">{Math.round(((currentStep + 1) / questions.length) * 100)}%</span>
              </div>
              <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-linear-to-r from-[#7C3AED] to-[#A78BFA]"
                  initial={{ width: 0 }}
                  animate={{ width: `${((currentStep + 1) / questions.length) * 100}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            </div>

            {/* Question Card */}
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="card-dark p-8 md:p-10 space-y-6 rounded-2xl"
            >
              <h2 className="text-2xl md:text-3xl font-bold text-white font-sora">
                {questions[currentStep].question}
              </h2>

              <div className="space-y-3">
                {questions[currentStep].options.map((option, idx) => (
                  <motion.button
                    key={idx}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleAnswer(idx)}
                    className={`w-full p-4 rounded-xl font-inter font-medium text-left transition-all duration-300 ${
                      answers[currentStep] === idx
                        ? 'bg-linear-to-r from-[#7C3AED] to-[#A78BFA] text-white border border-transparent'
                        : 'bg-white/5 text-white/70 border border-white/10 hover:bg-white/10 hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        answers[currentStep] === idx
                          ? 'border-white bg-white/20'
                          : 'border-white/30'
                      }`}>
                        {answers[currentStep] === idx && <div className="w-2 h-2 rounded-full bg-white" />}
                      </div>
                      {option}
                    </div>
                  </motion.button>
                ))}
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
                  disabled={currentStep === 0}
                  className="flex-1 px-6 py-3 rounded-lg border border-white/20 text-white font-inter font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/5 transition-colors"
                >
                  Previous
                </button>
                <button
                  onClick={() => handleAnswer(answers[currentStep] ?? 0)}
                  disabled={answers[currentStep] === undefined}
                  className="flex-1 px-6 py-3 rounded-lg bg-linear-to-r from-[#7C3AED] to-[#A78BFA] text-white font-inter font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-purple-500/30 transition-all"
                >
                  {currentStep === questions.length - 1 ? 'Get Results' : 'Next'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        ) : (
          /* Results Screen */
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-8">
            <div className="text-center space-y-3">
              <div className="flex justify-center mb-4">
                <CheckCircle className="w-16 h-16 text-[#10B981]" />
              </div>
              <h1 className="text-4xl md:text-5xl font-extrabold text-white font-sora">
                Your Career Roadmap
              </h1>
              <p className="text-white/60 text-lg">Personalized guidance for your next steps after 12th</p>
            </div>

            {/* Path Recommendations */}
            <div className="space-y-5">
              {topPath.map((item, idx) => (
                <motion.div
                  key={item.path}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.15 }}
                  className="card-dark p-6 md:p-8 rounded-xl space-y-4 border-l-4 border-[#A78BFA]"
                >
                  {/* Header */}
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-2xl font-bold text-white font-sora mb-1">{item.path}</h3>
                      <p className="text-white/70 flex items-center gap-2"><Lightbulb className="w-4 h-4" /> {item.description}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-3xl font-bold text-[#10B981]">{item.match}%</p>
                      <p className="text-xs text-white/50">Match</p>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-linear-to-r from-[#10B981] to-[#A78BFA]"
                      initial={{ width: 0 }}
                      animate={{ width: `${item.match}%` }}
                      transition={{ delay: 0.3 + idx * 0.15, duration: 0.8 }}
                    />
                  </div>

                  {/* Details Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                    <div>
                      <p className="text-xs text-white/50 uppercase tracking-wider mb-2">Top Colleges</p>
                      <div className="space-y-1">
                        {item.colleges.slice(0, 3).map((col: string) => (
                          <p key={col} className="text-sm text-white/80">✓ {col}</p>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-white/50 uppercase tracking-wider mb-2">Career Options</p>
                      <div className="space-y-1">
                        {item.opportunities.slice(0, 3).map((opp: string) => (
                          <p key={opp} className="text-sm text-white/80">→ {opp}</p>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Timeline & Salary */}
                  <div className="border-t border-white/10 pt-4 grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-white/50 uppercase tracking-wider">Journey Timeline</p>
                      <p className="text-sm text-white font-semibold mt-1">{item.career_timeline}</p>
                    </div>
                    <div>
                      <p className="text-xs text-white/50 uppercase tracking-wider">Average Salary</p>
                      <p className="text-sm text-[#10B981] font-semibold mt-1">{item.avg_salary}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Guidance Section */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }} className="space-y-4">
              <div className="bg-linear-to-r from-[#7C3AED]/20 to-[#A78BFA]/20 border border-[#A78BFA]/30 p-6 rounded-xl">
                <h3 className="text-lg font-bold text-white mb-2">Next Steps</h3>
                <ul className="space-y-2 text-white/80">
                  <li>✓ Connect with mentors who've chosen these paths</li>
                  <li>✓ Get personalized college & entrance exam guidance</li>
                  <li>✓ Learn from students in your top-matched stream</li>
                  <li>✓ Plan your preparation strategy with experts</li>
                </ul>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href="/signup"
                  className="flex-1 btn-primary px-8 py-4 text-base text-center font-inter flex items-center justify-center gap-2 rounded-lg"
                >
                  Connect with Mentors <ArrowRight className="w-4 h-4" />
                </Link>
                <button
                  onClick={handleReset}
                  className="flex-1 px-8 py-4 rounded-lg border border-white/20 text-white font-inter font-medium hover:bg-white/5 transition-colors"
                >
                  Retake Assessment
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </div>
    </main>
  );
};

export default AssessmentPage;
