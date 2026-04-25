/* eslint-disable react/no-unescaped-entities */
import Link from 'next/link';
import { ArrowLeft, UserX } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center px-6">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-red-50 mb-6">
          <UserX className="w-10 h-10 text-red-600" />
        </div>
        <h1 className="text-4xl font-bold text-gray-900 mb-3">Mentor Not Found</h1>
        <p className="text-gray-600 mb-8 max-w-md mx-auto">
          The mentor you're looking for doesn't exist or may have been removed.
        </p>
        <Link href="/student/mentors">
          <button className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 py-3 rounded-xl transition-all shadow-md hover:shadow-lg">
            <ArrowLeft size={20} />
            Back to Mentors
          </button>
        </Link>
      </div>
    </div>
  );
}
