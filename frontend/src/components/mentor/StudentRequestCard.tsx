'use client';

import React from 'react';

interface StudentRequestCardProps {
  studentName: string;
  program: string;
  tags: string[];
  avatarInitials: string;
  avatarColor: string;
}

const StudentRequestCard = ({
  studentName,
  program,
  tags,
  avatarInitials,
  avatarColor,
}: StudentRequestCardProps) => {
  return (
    <div className="rounded-lg bg-white border border-gray-200 p-4 flex items-center justify-between gap-4 hover:shadow-md transition-shadow">
      <div className="flex items-center gap-4 flex-1 min-w-0">
        <div className={`h-12 w-12 rounded-full ${avatarColor} flex items-center justify-center text-white font-bold text-sm flex-shrink-0`}>
          {avatarInitials}
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-gray-900 truncate">{studentName}</p>
          <p className="text-sm text-gray-600 truncate">Applied for {program}</p>
          <div className="flex gap-2 mt-2 flex-wrap">
            {tags.map((tag) => (
              <span
                key={tag}
                className="text-xs font-semibold px-2 py-1 rounded bg-gray-100 text-gray-700"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 flex-shrink-0">
        <button className="px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
          View Details
        </button>
        <button className="px-3 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
          Reject
        </button>
        <button className="px-3 py-2 text-sm font-medium text-white bg-purple-600 rounded-lg hover:bg-purple-700 transition-colors">
          Accept
        </button>
      </div>
    </div>
  );
};

export default StudentRequestCard;
