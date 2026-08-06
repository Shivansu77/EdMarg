import AssessmentDetailClient from './AssessmentDetailClient';

// Assignment IDs are per-student and not enumerable at build time.
// The page fetches its data client-side, so no params are pre-rendered.
// Assessment IDs are user-specific and not enumerable at build time.
// `output: export` requires at least one param, so we emit a placeholder.
export async function generateStaticParams() {
  return [{ id: 'placeholder' }];
}

export default function AssessmentDetailPage() {
  return <AssessmentDetailClient />;
}
