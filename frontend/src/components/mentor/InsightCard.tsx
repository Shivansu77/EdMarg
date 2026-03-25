'use client';

import React from 'react';
import { Sparkles } from 'lucide-react';

const InsightCard = () => {
  return (
    <div className="rounded-xl bg-gradient-to-br from-purple-600 to-purple-800 p-6 text-white shadow-lg">
      <div className="flex items-start gap-3 mb-4">
        <Sparkles size={24} className="flex-shrink-0" />
        <h2 className="text-lg font-bold">Curator Insight</h2>
      </div>

      <p className="text-sm leading-relaxed mb-6">
        Your engagement rate is 15% higher this week. Students are responding well to your feedback speed.
      </p>

      <div className="pt-4 border-t border-white/20">
        <p className="text-xs font-semibold uppercase tracking-widest text-white/80 mb-2">
          Weekly Mentor Score
        </p>
        <p className="text-3xl font-bold">9.8</p>
      </div>
    </div>
  );
};

export default InsightCard;
