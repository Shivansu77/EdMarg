import React from 'react';
import { motion } from 'framer-motion';

export type MascotExpression = 'happy' | 'thinking' | 'excited' | 'pointing' | 'celebrating';

interface RabbitMascotProps {
  expression: MascotExpression;
  className?: string;
}

export function RabbitMascot({ expression, className = '' }: RabbitMascotProps) {
  const isThinking = expression === 'thinking';
  const isExcited = expression === 'excited';
  const isCelebrating = expression === 'celebrating';
  
  return (
    <motion.div 
      className={`relative w-32 h-32 sm:w-40 sm:h-40 ${className}`}
      animate={{
        y: [0, -6, 0],
        rotate: isThinking ? [0, -3, 0] : isCelebrating ? [0, 5, -5, 0] : 0
      }}
      transition={{ 
        repeat: Infinity, 
        duration: isCelebrating ? 0.6 : 2,
        ease: "easeInOut" 
      }}
    >
      <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-xl overflow-visible">
        {/* Ears */}
        <motion.path 
          d="M30 45 C15 15, 30 5, 40 25 Z" 
          fill="#f8fafc" 
          stroke="#e2e8f0" 
          strokeWidth="2"
          animate={{ rotate: isThinking ? -8 : 0, originX: '40px', originY: '25px' }}
        />
        <motion.path 
          d="M70 45 C85 15, 70 5, 60 25 Z" 
          fill="#f8fafc" 
          stroke="#e2e8f0" 
          strokeWidth="2" 
          animate={{ rotate: isExcited ? 8 : 0, originX: '60px', originY: '25px' }}
        />
        {/* Inner Ears */}
        <path d="M32 38 C22 20, 32 12, 38 25 Z" fill="#fecdd3" />
        <path d="M68 38 C78 20, 68 12, 62 25 Z" fill="#fecdd3" />

        {/* Head */}
        <ellipse cx="50" cy="65" rx="35" ry="28" fill="#ffffff" stroke="#e2e8f0" strokeWidth="2" />

        {/* Eyes */}
        {(isExcited || isCelebrating) ? (
          <>
            <path d="M35 58 Q40 52 45 58" fill="none" stroke="#334155" strokeWidth="3.5" strokeLinecap="round" />
            <path d="M55 58 Q60 52 65 58" fill="none" stroke="#334155" strokeWidth="3.5" strokeLinecap="round" />
          </>
        ) : isThinking ? (
          <>
            <path d="M35 58 Q40 54 45 58" fill="none" stroke="#334155" strokeWidth="3.5" strokeLinecap="round" />
            <circle cx="60" cy="58" r="4.5" fill="#334155" />
          </>
        ) : (
          <>
            <circle cx="40" cy="58" r="4" fill="#334155" />
            <circle cx="60" cy="58" r="4" fill="#334155" />
            {/* Sparkles for happy */}
            {expression === 'happy' && <circle cx="41.5" cy="56.5" r="1.5" fill="#ffffff" />}
            {expression === 'happy' && <circle cx="61.5" cy="56.5" r="1.5" fill="#ffffff" />}
          </>
        )}

        {/* Nose */}
        <polygon points="48,65 52,65 50,68" fill="#f43f5e" />
        
        {/* Mouth */}
        {isThinking ? (
           <path d="M47 74 Q50 74 53 74" fill="none" stroke="#334155" strokeWidth="2.5" strokeLinecap="round" />
        ) : (isExcited || isCelebrating) ? (
           <path d="M45 72 Q50 82 55 72 Z" fill="#f43f5e" />
        ) : (
           <path d="M45 72 Q50 77 55 72" fill="none" stroke="#334155" strokeWidth="2.5" strokeLinecap="round" />
        )}

        {/* Cheeks */}
        <circle cx="32" cy="66" r="4" fill="#fecdd3" opacity="0.7" />
        <circle cx="68" cy="66" r="4" fill="#fecdd3" opacity="0.7" />
        
        {/* Accessories / Actions */}
        {isThinking && (
          <motion.text 
            x="72" y="38" fontSize="22" fill="#64748b" fontWeight="bold"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
          >?</motion.text>
        )}
        {isCelebrating && (
          <g>
            <motion.text x="5" y="45" fontSize="20" animate={{ scale: [1, 1.3, 1], opacity: [0.5, 1, 0.5]}} transition={{repeat: Infinity, duration: 1}}>✨</motion.text>
            <motion.text x="80" y="35" fontSize="20" animate={{ scale: [1, 1.3, 1], opacity: [0.5, 1, 0.5]}} transition={{repeat: Infinity, duration: 1.2}}>🎉</motion.text>
          </g>
        )}
        {expression === 'pointing' && (
          <motion.g animate={{ x: [0, 5, 0] }} transition={{ repeat: Infinity, duration: 1 }}>
            <text x="85" y="75" fontSize="24">👉</text>
          </motion.g>
        )}
      </svg>
    </motion.div>
  );
}
