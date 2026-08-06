import SessionRecordingPageClient from './SessionRecordingPageClient';

// Session IDs are per-user bookings and not enumerable at build time.
// `output: export` requires at least one param, so we emit a placeholder
// shell; the real recording is resolved client-side from the URL.
export async function generateStaticParams() {
  return [{ id: 'placeholder' }];
}

export default function SessionRecordingPage() {
  return <SessionRecordingPageClient />;
}
