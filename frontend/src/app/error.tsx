'use client';

import { useEffect } from 'react';
import Link from 'next/link';

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
    <div className="min-h-[80vh] flex flex-col items-center justify-center px-4 bg-gray-50">
      <div className="max-w-md w-full text-center space-y-6">
        <h2 className="text-4xl font-extrabold text-gray-900 tracking-tight">Oops! Something went wrong</h2>
        <p className="text-lg text-gray-600">
          We encountered an unexpected error while loading this page.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8">
          <button
            onClick={() => reset()}
            className="w-full sm:w-auto px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-xl"
          >
            Try again
          </button>
          <Link
            href="/"
            className="w-full sm:w-auto px-6 py-3 bg-white text-gray-900 border border-gray-200 hover:bg-gray-50 font-semibold rounded-xl"
          >
            Go back home
          </Link>
        </div>
      </div>
    </div>
  );
}
