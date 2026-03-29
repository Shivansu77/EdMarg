import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

const JoinSection = () => {
  return (
    <section className="overflow-hidden bg-white py-20 lg:py-28 border-t border-gray-100">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="relative w-full overflow-hidden rounded-2xl border border-gray-200 bg-gradient-to-br from-blue-50 to-indigo-50 p-10 text-center shadow-lg lg:p-16">
          <div className="relative z-10 mx-auto max-w-3xl">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Still confused about your career?
            </h2>
            <p className="text-lg text-gray-600 mb-8">
              Don&apos;t navigate the complex world of professional choices alone. Get the clarity you deserve today.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6">
              <Link
                href="/assessment"
                className="flex items-center justify-center gap-2 rounded-lg bg-blue-600 hover:bg-blue-700 px-8 py-3 text-base font-semibold text-white transition-colors w-full sm:w-auto"
              >
                Take Assessment <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/browse-mentors"
                className="w-full sm:w-auto rounded-lg border border-gray-300 bg-white hover:bg-gray-50 px-8 py-3 text-base font-semibold text-gray-900 transition-colors"
              >
                Connect with Mentor
              </Link>
            </div>

            <p className="text-sm text-gray-600">
              Free career roadmap with every mentor session
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default JoinSection;
