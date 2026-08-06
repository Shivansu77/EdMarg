import SessionRecordingPageClient from './SessionRecordingPageClient';

// Session IDs are per-user bookings and not enumerable at build time.
// The page fetches its data client-side, so no params are pre-rendered.
export async function generateStaticParams() {
  return [];
}

export default function SessionRecordingPage() {
  return <SessionRecordingPageClient />;
}
