'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Mail, Lock } from 'lucide-react';

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch(`${API_BASE_URL}/api/users/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Login failed');
      }

      setSuccess(`Welcome back, ${result.data?.name || 'User'}!`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-md rounded-xl border border-border bg-surface p-8 shadow-(--shadow-ambient)">
      <div className="mb-8 text-center">
        <h2 className="text-2xl font-bold font-plus-jakarta text-on-surface mb-2">Welcome Back</h2>
        <p className="text-sm font-manrope text-on-surface-variant">
          Enter your credentials to access your account
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-1.5">
          <label className="text-sm font-medium font-manrope text-on-surface block" htmlFor="email">
            Email
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-on-surface-variant">
              <Mail size={16} />
            </div>
            <input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-surface border border-border text-on-surface text-sm rounded-md focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-colors font-manrope placeholder:text-on-surface-variant/50"
              required
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium font-manrope text-on-surface block" htmlFor="password">
              Password
            </label>
            <Link href="/forgot-password" className="text-xs font-medium text-primary hover:underline font-manrope">
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-on-surface-variant">
              <Lock size={16} />
            </div>
            <input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-surface border border-border text-on-surface text-sm rounded-md focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-colors font-manrope placeholder:text-on-surface-variant/50"
              required
            />
          </div>
        </div>

        <button
          type="submit"
          className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-primary text-on-primary font-medium text-sm rounded-md hover:bg-primary/90 transition-colors font-manrope mt-6 disabled:cursor-not-allowed disabled:opacity-70"
          disabled={loading}
        >
          {loading ? 'Signing in...' : 'Sign In'}
          <ArrowRight size={16} />
        </button>

        {error && (
          <p className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-manrope text-rose-700">
            {error}
          </p>
        )}

        {success && (
          <p className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-manrope text-emerald-700">
            {success}
          </p>
        )}
      </form>

      <div className="mt-8 text-center text-sm text-on-surface-variant font-manrope flex items-center justify-center gap-1">
        <span>Don&apos;t have an account?</span>
        <Link href="/signup" className="font-medium text-primary hover:underline">
          Sign up
        </Link>
      </div>
    </div>
  );
}
