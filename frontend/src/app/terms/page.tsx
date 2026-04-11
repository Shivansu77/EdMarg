/* eslint-disable react-hooks/exhaustive-deps, react-hooks/set-state-in-effect, @next/next/no-html-link-for-pages, @typescript-eslint/no-unused-vars, @next/next/no-img-element, react/no-unescaped-entities */
import React from 'react';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-6 py-16 lg:py-24">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Terms of Service</h1>
        <div className="prose prose-lg text-gray-600">
          <p className="mb-4">Last Updated: {new Date().toLocaleDateString()}</p>
          <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">1. Acceptance of Terms</h2>
          <p className="mb-4">By accessing and using EdMarg, you accept and agree to be bound by the terms and provision of this agreement.</p>
          <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">2. Use License</h2>
          <p className="mb-4">Permission is granted to temporarily download one copy of the materials (information or software) on EdMarg's website for personal, non-commercial transitory viewing only.</p>
          <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">3. Disclaimer</h2>
          <p className="mb-4">The materials on EdMarg's website are provided on an 'as is' basis. EdMarg makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.</p>
        </div>
      </div>
    </div>
  );
}
