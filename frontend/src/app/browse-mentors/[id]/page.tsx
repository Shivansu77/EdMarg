import { resolveApiBaseUrl } from '@/utils/api-base';
import BrowseMentorDetailClient from './BrowseMentorDetailClient';

const API_BASE_URL = resolveApiBaseUrl();

export async function generateStaticParams() {
  try {
    const res = await fetch(`${API_BASE_URL}/api/v1/users/browsementor`);
    if (!res.ok) return [{ id: 'placeholder' }];
    const data = await res.json();
    const mentors = Array.isArray(data?.data) ? data.data : [];
    const params = mentors.filter((m: any) => m._id).map((m: any) => ({ id: m._id }));
    // `output: export` requires at least one param
    return params.length > 0 ? params : [{ id: 'placeholder' }];
  } catch (error) {
    console.error('Failed to generate browse-mentors static params:', error instanceof Error ? error.message : String(error));
    return [{ id: 'placeholder' }];
  }
}

export default function MentorDetailPage() {
  return <BrowseMentorDetailClient />;
}
