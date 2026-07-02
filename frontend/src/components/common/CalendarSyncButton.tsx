'use client';

import { useState } from 'react';
import {
  CalendarPlus,
  ChevronDown,
  Download,
  ExternalLink,
} from 'lucide-react';
import {
  type CalendarEventData,
  getGoogleCalendarUrl,
  getOutlookCalendarUrl,
  downloadIcsFile,
} from '@/utils/calendar-sync';

interface CalendarSyncButtonProps {
  booking: {
    _id: string;
    date: string;
    startTime: string;
    endTime?: string;
    sessionDuration?: number;
    mentor?: { name?: string };
    student?: { name?: string };
    joinUrl?: string;
    notes?: string;
  };
  /** Which side is using this: determines "with Mentor" vs "with Student" label */
  userRole?: 'student' | 'mentor';
  /** Compact = icon-only trigger, default = small pill button */
  compact?: boolean;
}

export default function CalendarSyncButton({
  booking,
  userRole = 'student',
  compact = false,
}: CalendarSyncButtonProps) {
  const [open, setOpen] = useState(false);

  const otherPartyName =
    userRole === 'student'
      ? booking.mentor?.name || 'Mentor'
      : booking.student?.name || 'Student';

  const event: CalendarEventData = {
    title: `EdMarg Session with ${otherPartyName}`,
    description: [
      `Mentorship session on EdMarg`,
      booking.notes ? `Notes: ${booking.notes}` : '',
      booking.joinUrl ? `Join: ${booking.joinUrl}` : '',
    ]
      .filter(Boolean)
      .join('\n'),
    date: booking.date,
    startTime: booking.startTime,
    endTime: booking.endTime,
    sessionDuration: booking.sessionDuration || 45,
    location: booking.joinUrl || 'Online (EdMarg)',
  };

  const googleUrl = getGoogleCalendarUrl(event);
  const outlookUrl = getOutlookCalendarUrl(event);

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mr-1">
        Add to:
      </span>
      {/* Google Calendar */}
      <a
        href={googleUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="group relative inline-flex items-center gap-1.5 rounded-lg border border-white/40 bg-white/30 backdrop-blur-md px-2.5 py-1.5 text-[11px] font-bold text-slate-600 transition-all hover:bg-white/60 hover:text-emerald-700 hover:shadow-sm hover:border-white/60"
        title="Add to Google Calendar"
      >
        <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none">
          <rect x="3" y="4" width="18" height="18" rx="2" stroke="#4285F4" strokeWidth="2" />
          <path d="M3 9h18" stroke="#4285F4" strokeWidth="2" />
          <circle cx="8" cy="14" r="1.5" fill="#EA4335" />
          <circle cx="12" cy="14" r="1.5" fill="#FBBC04" />
          <circle cx="16" cy="14" r="1.5" fill="#34A853" />
        </svg>
        Google
      </a>

      {/* Outlook */}
      <a
        href={outlookUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="group relative inline-flex items-center gap-1.5 rounded-lg border border-white/40 bg-white/30 backdrop-blur-md px-2.5 py-1.5 text-[11px] font-bold text-slate-600 transition-all hover:bg-white/60 hover:text-blue-700 hover:shadow-sm hover:border-white/60"
        title="Add to Outlook"
      >
        <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none">
          <rect x="3" y="4" width="18" height="18" rx="2" stroke="#0078D4" strokeWidth="2" />
          <path d="M3 9h18" stroke="#0078D4" strokeWidth="2" />
          <rect x="7" y="12" width="4" height="3" rx="0.5" fill="#0078D4" />
          <rect x="13" y="12" width="4" height="3" rx="0.5" fill="#0078D4" opacity="0.5" />
        </svg>
        Outlook
      </a>

      {/* Download .ics */}
      <button
        type="button"
        onClick={() => downloadIcsFile(event)}
        className="group relative inline-flex items-center gap-1.5 rounded-lg border border-white/40 bg-white/30 backdrop-blur-md px-2.5 py-1.5 text-[11px] font-bold text-slate-600 transition-all hover:bg-white/60 hover:text-violet-700 hover:shadow-sm hover:border-white/60"
        title="Download .ics file (Apple Calendar, etc.)"
      >
        <Download className="h-3.5 w-3.5 text-violet-500 group-hover:text-violet-700 transition-colors" />
        .ics
      </button>
    </div>
  );
}
