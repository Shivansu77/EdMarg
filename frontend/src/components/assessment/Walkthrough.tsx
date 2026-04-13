import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RabbitMascot, MascotExpression } from './RabbitMascot';
import { ArrowRight, ArrowLeft, X } from 'lucide-react';

interface WalkthroughProps {
  onComplete: () => void;
}

const STEPS = [
  {
    expression: 'happy' as MascotExpression,
    text: "Hey there! Ready to discover your perfect career? I'll be your guide!"
  },
  {
    expression: 'thinking' as MascotExpression,
    text: "First, you'll read each question at the top carefully. Make sure to answer honestly!"
  },
  {
    expression: 'excited' as MascotExpression,
    text: "Tap the big option block that best describes you! Don't overthink it, trust your gut."
  },
  {
    expression: 'pointing' as MascotExpression,
    text: "We'll automatically slide you to the next question to save time. Or use the Next button!"
  },
  {
    expression: 'celebrating' as MascotExpression,
    text: "When you finish all 25 questions, submit to get your roadmap! Let's begin!"
  }
];

export default function Walkthrough({ onComplete }: WalkthroughProps) {
  const [step, setStep] = useState(0);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === 'ArrowRight') {
        if (step < STEPS.length - 1) setStep(s => s + 1);
        else onComplete();
      }
      if (e.key === 'ArrowLeft') {
        if (step > 0) setStep(s => s - 1);
      }
      if (e.key === 'Escape') onComplete();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [step, onComplete]);

  const currentStep = STEPS[step];
  
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Dark Overlay */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
        onClick={onComplete}
      />

      {/* Modal Container */}
      <motion.div 
        initial={{ scale: 0.9, opacity: 0, y: 30 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: -20 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        className="relative z-10 w-full max-w-lg bg-white rounded-[2rem] shadow-2xl p-6 sm:p-10 border border-slate-100"
      >
        <button 
          onClick={onComplete}
          className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
          title="Skip Walkthrough"
        >
          <X size={20} />
        </button>

        <div className="flex flex-col items-center select-none">
          {/* Mascot Container */}
          <div className="mt-4 mb-8">
             <RabbitMascot expression={currentStep.expression} />
          </div>

          {/* Speech Bubble */}
          <div className="relative w-full mb-8">
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-b-[12px] border-b-cyan-50"></div>
            <div className="bg-cyan-50 border border-cyan-100 rounded-2xl p-6 text-center shadow-sm">
                <AnimatePresence mode="wait">
                  <motion.p 
                    key={step}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="text-lg font-semibold text-slate-800 leading-snug"
                  >
                    {currentStep.text}
                  </motion.p>
                </AnimatePresence>
            </div>
          </div>

          {/* Controls & Steps Indicator */}
          <div className="w-full border-t border-slate-100 pt-6 mt-2 flex flex-col sm:flex-row gap-4 items-center justify-between">
            
            <div className="flex items-center gap-2 mb-4 sm:mb-0">
               {STEPS.map((_, i) => (
                 <div 
                   key={i} 
                   className={`h-2.5 rounded-full transition-all duration-300 ${i === step ? 'w-8 bg-emerald-500' : 'w-2.5 bg-slate-200'}`}
                 />
               ))}
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button 
                onClick={onComplete} 
                className="px-4 py-2.5 text-sm font-bold text-slate-500 hover:text-slate-800 transition-colors mr-auto sm:mr-0"
              >
                Skip
              </button>
              
              <button 
                onClick={() => setStep(s => s - 1)}
                disabled={step === 0}
                className={`p-2.5 rounded-xl border border-slate-200 bg-white text-slate-600 transition-colors ${step === 0 ? 'opacity-30 cursor-not-allowed' : 'hover:bg-slate-50 hover:border-slate-300 shadow-sm'}`}
              >
                <ArrowLeft size={18} />
              </button>

              <button 
                onClick={() => {
                  if (step < STEPS.length - 1) setStep(s => s + 1);
                  else onComplete();
                }}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-slate-900 border border-slate-900 hover:bg-emerald-600 hover:border-emerald-600 text-white font-bold transition-colors shadow-md"
              >
                {step === STEPS.length - 1 ? 'Done' : 'Next'} <ArrowRight size={18} />
              </button>
            </div>

          </div>
        </div>
      </motion.div>
    </div>
  );
}
