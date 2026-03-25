'use client';

import React from 'lucide-react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  badge: string;
  badgeColor?: 'purple' | 'blue' | 'green';
}

const StatCard = ({
  icon: Icon,
  label,
  value,
  badge,
  badgeColor = 'purple',
}: StatCardProps) => {
  const badgeClasses = {
    purple: 'bg-purple-100 text-purple-700',
    blue: 'bg-blue-100 text-blue-700',
    green: 'bg-green-100 text-green-700',
  };

  return (
    <div className="rounded-xl bg-white border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="h-12 w-12 rounded-lg bg-gray-100 flex items-center justify-center text-gray-600">
          <Icon size={24} />
        </div>
        <span className={`text-xs font-semibold px-3 py-1 rounded-full ${badgeClasses[badgeColor]}`}>
          {badge}
        </span>
      </div>
      <p className="text-sm text-gray-600 font-medium mb-2">{label}</p>
      <p className="text-3xl font-bold text-gray-900">{value}</p>
    </div>
  );
};

export default StatCard;
