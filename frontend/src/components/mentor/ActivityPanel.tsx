'use client';

import React from 'react';
import { CheckCircle, MessageCircle, Calendar, ArrowRight } from 'lucide-react';
import { LucideIcon } from 'lucide-react';

interface ActivityItem {
  id: string;
  icon: LucideIcon;
  title: string;
  description: string;
  timestamp: string;
  color: string;
}

interface ActivityPanelProps {
  activities: ActivityItem[];
}

const ActivityPanel = ({ activities }: ActivityPanelProps) => {
  return (
    <div className="rounded-xl bg-white border border-gray-200 p-6 shadow-sm">
      <h2 className="text-lg font-bold text-gray-900 mb-6">Recent Activity</h2>

      <div className="space-y-6">
        {activities.map((activity, index) => {
          const Icon = activity.icon;
          return (
            <div key={activity.id} className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className={`h-10 w-10 rounded-full ${activity.color} flex items-center justify-center text-white flex-shrink-0`}>
                  <Icon size={18} />
                </div>
                {index < activities.length - 1 && (
                  <div className="w-0.5 h-12 bg-gray-200 mt-2" />
                )}
              </div>
              <div className="flex-1 pt-1">
                <p className="font-semibold text-gray-900">{activity.title}</p>
                <p className="text-sm text-gray-600 mt-1">{activity.description}</p>
                <p className="text-xs text-gray-500 mt-2">{activity.timestamp}</p>
              </div>
            </div>
          );
        })}
      </div>

      <button className="w-full mt-6 px-4 py-2 text-sm font-semibold text-purple-600 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors flex items-center justify-center gap-2">
        View Full History
        <ArrowRight size={16} />
      </button>
    </div>
  );
};

export default ActivityPanel;
