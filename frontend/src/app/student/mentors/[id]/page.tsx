'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft, Loader2, RefreshCw, UserX } from 'lucide-react';

import ProtectedRoute from '@/components/ProtectedRoute';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import MentorDetailClient, { type Mentor } from './MentorDetailClient';
import { resolveApiBaseUrl } from '@/utils/api-base';

const API_BASE_URL = resolveApiBaseUrl();

function StudentMentorShell({
  title = 'Mentor Profile',
  children,
}: {
  title?: string;
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute requiredRole="student">
      <DashboardLayout userName={title}>
        <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(236,253,245,0.92),_rgba(248,250,252,0.9)_34%,_#ffffff_72%)] pb-16">
          {children}
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}

export default function MentorDetailPage() {
  const params = useParams();
  const id = params?.id as string;
  const [mentor, setMentor] = useState<Mentor | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const fetchMentor = async () => {
      try {
        setLoading(true);
        setErrorMessage(null);

        let response = await fetch(`${API_BASE_URL}/api/v1/users/mentor/${id}`);

        if (response.ok) {
          const data = await response.json();
          if (data.success && data.data) {
            setMentor(data.data);
            return;
          }
        }

        response = await fetch(`${API_BASE_URL}/api/v1/users/browsementor`);

        if (!response.ok) {
          throw new Error('We could not load mentor details right now.');
        }

        const data = await response.json();
        const mentors = Array.isArray(data?.data) ? data.data : [];
        const foundMentor = mentors.find((item: Mentor) => item._id === id);

        if (foundMentor) {
          setMentor(foundMentor);
          return;
        }

        throw new Error('This mentor profile could not be found.');
      } catch (error) {
        console.error('Error fetching mentor:', error);
        setErrorMessage(error instanceof Error ? error.message : 'Something went wrong while loading the mentor.');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      void fetchMentor();
    }
  }, [id]);

  if (loading) {
    return (
      <StudentMentorShell>
        <div className="rounded-[32px] border border-white/75 bg-white/72 p-10 text-center shadow-[0_20px_60px_rgba(15,23,42,0.07)] backdrop-blur-2xl">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-emerald-100 bg-emerald-50 text-emerald-700">
            <Loader2 className="h-7 w-7 animate-spin" />
          </div>
          <h1 className="mt-6 text-2xl font-extrabold tracking-tight text-slate-950">Loading mentor profile</h1>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-slate-500 sm:text-base">
            We&apos;re pulling together the mentor&apos;s background, reviews, and booking details so the page feels complete
            when it opens.
          </p>
        </div>
      </StudentMentorShell>
    );
  }

  if (errorMessage || !mentor) {
    return (
      <StudentMentorShell>
        <div className="rounded-[32px] border border-red-200 bg-white/78 p-10 shadow-[0_20px_60px_rgba(15,23,42,0.07)] backdrop-blur-2xl">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-start gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-red-50 text-red-600 ring-1 ring-red-100">
                <UserX className="h-6 w-6" />
              </div>
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-red-500">Profile unavailable</p>
                <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-950">Mentor not found</h1>
                <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600 sm:text-base">
                  {errorMessage || 'The mentor profile you requested may have been removed or is temporarily unavailable.'}
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                href="/student/mentors"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 text-sm font-bold text-white transition-colors hover:bg-slate-800"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to mentors
              </Link>
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 text-sm font-bold text-slate-700 transition-colors hover:border-slate-300 hover:bg-slate-50"
              >
                <RefreshCw className="h-4 w-4" />
                Retry
              </button>
            </div>
          </div>
        </div>
      </StudentMentorShell>
    );
  }

  return (
    <StudentMentorShell title="Mentor Profile">
      <MentorDetailClient mentor={mentor} variant="student" />
    </StudentMentorShell>
  );
}
