import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Search } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen relative flex flex-col bg-slate-50">
      <Navbar />
      
      <main className="flex-1 flex items-center justify-center relative overflow-hidden py-32">
        {/* Decorative background blobs */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[600px] w-[600px] rounded-full bg-emerald-200/40 blur-[120px] pointer-events-none" />
        
        <div className="relative z-10 text-center px-6 max-w-2xl mx-auto">
          <div className="mb-8 relative inline-block">
            <span className="text-[12rem] font-extrabold text-slate-900/5 leading-none select-none">404</span>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-24 h-24 bg-white rounded-full shadow-[0_10px_40px_rgba(16,185,129,0.2)] flex items-center justify-center">
                <Search className="w-10 h-10 text-emerald-500" />
              </div>
            </div>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-4 tracking-tight">
            Page not found
          </h1>
          <p className="text-lg text-slate-600 mb-10 max-w-md mx-auto">
            Sorry, we couldn't find the page you're looking for. It might have been moved or doesn't exist.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link 
              href="/" 
              className="w-full sm:w-auto px-8 py-3.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl transition-colors shadow-lg shadow-slate-900/20"
            >
              Go to Homepage
            </Link>
            <Link 
              href="/browse-mentors" 
              className="w-full sm:w-auto px-8 py-3.5 bg-white border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50 text-slate-700 font-semibold rounded-xl transition-all shadow-sm"
            >
              Browse Mentors
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
