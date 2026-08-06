import RecordingPageClient from './RecordingPageClient';

// Session IDs are per-student bookings and not enumerable at build time.
// The page fetches its data client-side, so no params are pre-rendered.
// Recording session IDs are user-specific and not enumerable at build time.
// `output: export` requires at least one param, so we emit a placeholder.
export async function generateStaticParams() {
  return [{ sessionId: 'placeholder' }];
}

export default function RecordingPage() {
  return <RecordingPageClient />;
}
