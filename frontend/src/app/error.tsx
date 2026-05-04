'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen relative flex flex-col bg-slate-50">
      <Navbar />
      
      <main className="flex-1 flex items-center justify-center relative overflow-hidden py-32">
        {/* Decorative background blobs */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[600px] w-[600px] rounded-full bg-red-100/50 blur-[120px] pointer-events-none" />
        
        <div className="relative z-10 text-center px-6 max-w-2xl mx-auto">
          <div className="mb-8 relative inline-flex justify-center">
            <div className="w-24 h-24 bg-white rounded-3xl shadow-[0_10px_40px_rgba(239,68,68,0.15)] flex items-center justify-center rotate-3">
              <AlertTriangle className="w-12 h-12 text-red-500" />
            </div>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-4 tracking-tight">
            Oops! Something went wrong
          </h1>
          <p className="text-lg text-slate-600 mb-10 max-w-md mx-auto">
            We encountered an unexpected error while loading this page. Our team has been notified.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => reset()}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl transition-colors shadow-lg shadow-slate-900/20"
            >
              <RefreshCw className="w-4 h-4" /> Try again
            </button>
            <Link 
              href="/" 
              className="w-full sm:w-auto px-8 py-3.5 bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold rounded-xl transition-all shadow-sm"
            >
              Go to Homepage
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
