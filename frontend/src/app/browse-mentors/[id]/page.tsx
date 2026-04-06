'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import MentorDetailClient from '@/app/student/mentors/[id]/MentorDetailClient';
import { ArrowLeft, UserX } from 'lucide-react';
import Link from 'next/link';

const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/api\/v1\/?$/, "");


export default function MentorDetailPage() {
  const params = useParams();
  const id = params?.id as string;
  const [mentor, setMentor] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    async function fetchMentor() {
      try {
        setLoading(true);
        
        // Try the specific mentor endpoint first
        let res = await fetch(`${API_BASE_URL}/api/v1/users/mentor/${id}`);
        
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.data) {
            setMentor(data.data);
            setLoading(false);
            return;
          }
        }
        
        // Fallback: fetch all mentors and find the one
        res = await fetch(`${API_BASE_URL}/api/v1/users/browsementor`);
        
        if (!res.ok) {
          setError(true);
          return;
        }
        
        const data = await res.json();
        const mentors = Array.isArray(data?.data) ? data.data : [];
        const foundMentor = mentors.find((m: any) => m._id === id);
        
        if (foundMentor) {
          setMentor(foundMentor);
        } else {
          setError(true);
        }
      } catch (err) {
        console.error('Error fetching mentor:', err);
        setError(true);
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      fetchMentor();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block relative">
            <div className="w-12 h-12 border-4 border-gray-200 rounded-full"></div>
            <div className="w-12 h-12 border-4 border-black rounded-full border-t-transparent animate-spin absolute top-0 left-0"></div>
          </div>
          <p className="mt-4 text-sm font-bold text-gray-600 uppercase tracking-widest">Loading mentor...</p>
        </div>
      </div>
    );
  }

  if (error || !mentor) {
    return (
      <div className="min-h-screen bg-linear-to-br from-slate-50 to-slate-100 flex items-center justify-center px-6">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-red-50 mb-6">
            <UserX className="w-10 h-10 text-red-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-3">Mentor Not Found</h1>
          <p className="text-gray-600 mb-8 max-w-md mx-auto">
            The mentor you're looking for doesn't exist or may have been removed.
          </p>
          <Link href="/browse-mentors">
            <button className="inline-flex items-center gap-2 bg-black hover:bg-gray-800 text-white font-bold px-6 py-3 rounded-xl transition-all shadow-md hover:shadow-lg">
              <ArrowLeft size={20} />
              Back to Mentors
            </button>
          </Link>
        </div>
      </div>
    );
  }
  
  return <MentorDetailClient mentor={mentor} />;
}
