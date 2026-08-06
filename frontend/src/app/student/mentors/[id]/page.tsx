import { resolveApiBaseUrl } from '@/utils/api-base';
import StudentMentorDetailClient from './StudentMentorDetailClient';

const API_BASE_URL = resolveApiBaseUrl();

export async function generateStaticParams() {
  try {
    const res = await fetch(`${API_BASE_URL}/api/v1/users/browsementor`);
    if (!res.ok) return [];
    const data = await res.json();
    const mentors = Array.isArray(data?.data) ? data.data : [];
    return mentors.filter((m: { _id?: string }) => m._id).map((m: { _id: string }) => ({ id: m._id }));
  } catch (error) {
    console.error('Failed to generate student mentors static params:', error instanceof Error ? error.message : String(error));
    return [];
  }
}

export default function MentorDetailPage() {
  return <StudentMentorDetailClient />;
}
