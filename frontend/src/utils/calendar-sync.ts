/**
 * Generates "Add to Calendar" URLs for Google Calendar and Outlook
 * from EdMarg booking data.
 */

export interface CalendarEventData {
  title: string;
  description?: string;
  date: string;          // ISO date string or parseable date
  startTime: string;     // e.g. "10:00 AM", "14:30"
  endTime?: string;      // e.g. "10:45 AM", "15:15"
  location?: string;     // e.g. Zoom link or "Online"
  sessionDuration?: number; // fallback minutes if endTime missing
}

/**
 * Parse a time string like "10:00 AM", "2:30 PM", or "14:30"
 * into hours and minutes (24h format).
 */
function parseTime(timeStr: string): { hours: number; minutes: number } {
  const cleaned = timeStr.trim().toUpperCase();

  // Try 12-hour format first: "10:00 AM", "2:30 PM"
  const match12 = cleaned.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/);
  if (match12) {
    let hours = parseInt(match12[1], 10);
    const minutes = parseInt(match12[2], 10);
    const period = match12[3];
    if (period === 'PM' && hours !== 12) hours += 12;
    if (period === 'AM' && hours === 12) hours = 0;
    return { hours, minutes };
  }

  // Try 24-hour format: "14:30"
  const match24 = cleaned.match(/^(\d{1,2}):(\d{2})$/);
  if (match24) {
    return { hours: parseInt(match24[1], 10), minutes: parseInt(match24[2], 10) };
  }

  return { hours: 9, minutes: 0 }; // safe fallback
}

/**
 * Format a Date as "YYYYMMDDTHHmmss" for calendar URLs.
 */
function toCalendarFormat(date: Date): string {
  const pad = (n: number) => n.toString().padStart(2, '0');
  return (
    `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}T` +
    `${pad(date.getHours())}${pad(date.getMinutes())}00`
  );
}

function buildDates(event: CalendarEventData) {
  const bookingDate = new Date(event.date);
  const start = parseTime(event.startTime);

  const startDate = new Date(bookingDate);
  startDate.setHours(start.hours, start.minutes, 0, 0);

  let endDate: Date;
  if (event.endTime) {
    const end = parseTime(event.endTime);
    endDate = new Date(bookingDate);
    endDate.setHours(end.hours, end.minutes, 0, 0);
  } else {
    endDate = new Date(startDate.getTime() + (event.sessionDuration || 45) * 60 * 1000);
  }

  return { startDate, endDate };
}

/**
 * Generate a Google Calendar "Add Event" URL.
 */
export function getGoogleCalendarUrl(event: CalendarEventData): string {
  const { startDate, endDate } = buildDates(event);

  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: event.title,
    dates: `${toCalendarFormat(startDate)}/${toCalendarFormat(endDate)}`,
    details: event.description || `EdMarg mentorship session`,
    location: event.location || 'Online (EdMarg)',
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

/**
 * Generate an Outlook Web "Add Event" URL.
 */
export function getOutlookCalendarUrl(event: CalendarEventData): string {
  const { startDate, endDate } = buildDates(event);

  const params = new URLSearchParams({
    path: '/calendar/action/compose',
    rru: 'addevent',
    subject: event.title,
    startdt: startDate.toISOString(),
    enddt: endDate.toISOString(),
    body: event.description || `EdMarg mentorship session`,
    location: event.location || 'Online (EdMarg)',
  });

  return `https://outlook.live.com/calendar/0/deeplink/compose?${params.toString()}`;
}

/**
 * Generate a downloadable .ics file content (works with Apple Calendar, etc.)
 */
export function generateIcsContent(event: CalendarEventData): string {
  const { startDate, endDate } = buildDates(event);

  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//EdMarg//Booking//EN',
    'BEGIN:VEVENT',
    `DTSTART:${toCalendarFormat(startDate)}`,
    `DTEND:${toCalendarFormat(endDate)}`,
    `SUMMARY:${event.title}`,
    `DESCRIPTION:${(event.description || 'EdMarg mentorship session').replace(/\n/g, '\\n')}`,
    `LOCATION:${event.location || 'Online (EdMarg)'}`,
    `STATUS:CONFIRMED`,
    'END:VEVENT',
    'END:VCALENDAR',
  ];

  return lines.join('\r\n');
}

/**
 * Trigger download of an .ics file from the browser.
 */
export function downloadIcsFile(event: CalendarEventData): void {
  const content = generateIcsContent(event);
  const blob = new Blob([content], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `edmarg-session.ics`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
