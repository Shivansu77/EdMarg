import React from 'react';
import LoginForm from '@/components/LoginForm';
import Link from 'next/link';

export const metadata = {
  title: 'Sign In - Edmarg',
  description: 'Sign in to your Edmarg account',
};

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-surface relative overflow-hidden">
      {/* Background Subtle Splashes */}
      <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[50%] bg-surface-dim rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-surface-dim rounded-full blur-[100px] pointer-events-none" />

      {/* Brand logo/name */}
      <Link href="/" className="absolute top-8 left-8 text-2xl font-bold font-plus-jakarta text-on-surface flex items-center gap-2 z-10">
        Edmarg
      </Link>

      {/* Main Content */}
      <div className="w-full relative z-10 flex flex-col items-center">
        <LoginForm />
      </div>
    </div>
  );
}
