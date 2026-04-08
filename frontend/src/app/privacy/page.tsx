import React from 'react';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-6 py-16 lg:py-24">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Privacy Policy</h1>
        <div className="prose prose-lg text-gray-600">
          <p className="mb-4">Last Updated: {new Date().toLocaleDateString()}</p>
          <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">1. Information We Collect</h2>
          <p className="mb-4">We collect information that you provide directly to us, including when you create an account, update your profile, or communicate with us.</p>
          <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">2. How We Use Your Information</h2>
          <p className="mb-4">We use the information we collect to provide, maintain, and improve our services, to process transactions, and to communicate with you.</p>
          <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">3. Information Sharing</h2>
          <p className="mb-4">We do not share your personal information with third parties except as described in this privacy policy or with your consent.</p>
        </div>
      </div>
    </div>
  );
}
