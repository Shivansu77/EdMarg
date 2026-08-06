import RecordingPageClient from './RecordingPageClient';

// Session IDs are per-student bookings and not enumerable at build time.
// The page fetches its data client-side, so no params are pre-rendered.
export async function generateStaticParams() {
  return [];
}

export default function RecordingPage() {
  return <RecordingPageClient />;
}
