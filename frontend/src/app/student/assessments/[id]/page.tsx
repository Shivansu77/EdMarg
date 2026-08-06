import AssessmentDetailClient from './AssessmentDetailClient';

// Assignment IDs are per-student and not enumerable at build time.
// The page fetches its data client-side, so no params are pre-rendered.
export async function generateStaticParams() {
  return [];
}

export default function AssessmentDetailPage() {
  return <AssessmentDetailClient />;
}
