"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Lock, Mail, Phone, User } from 'lucide-react';

export default function SignupPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/users/login`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          password,
          phoneNumber,
        }),
      });

      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Signup failed');
      }

      setSuccess(`Welcome, ${result.data?.name || name}! Your account was created.`);
      setName('');
      setEmail('');
      setPhoneNumber('');
      setPassword('');
      setConfirmPassword('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to create account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-surface relative overflow-hidden">
      {/* Background Subtle Splashes */}
      <div className="absolute top-[10%] left-[-10%] w-[50%] h-[50%] bg-surface-dim rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[40%] h-[40%] bg-surface-dim rounded-full blur-[100px] pointer-events-none" />

      {/* Brand logo/name */}
      <Link href="/" className="absolute top-8 left-8 text-2xl font-bold font-plus-jakarta text-on-surface flex items-center gap-2 z-10">
        Edmarg
      </Link>

      {/* Main Content */}
      <div className="w-full relative z-10 flex flex-col items-center mt-12 mb-12">
        <div className="mx-auto w-full max-w-md rounded-xl border border-border bg-surface p-8 shadow-(--shadow-ambient)">
          <div className="mb-8 text-center">
            <h2 className="text-2xl font-bold font-plus-jakarta text-on-surface mb-2">Create Account</h2>
            <p className="text-sm font-manrope text-on-surface-variant">
              Start your Edmarg journey in less than a minute
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium font-manrope text-on-surface block" htmlFor="name">
                Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-on-surface-variant">
                  <User size={16} />
                </div>
                <input
                  id="name"
                  type="text"
                  placeholder="Your full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-surface border border-border text-on-surface text-sm rounded-md focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-colors font-manrope placeholder:text-on-surface-variant/50"
                  required
                />
              </div>
            </div>

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
              <label className="text-sm font-medium font-manrope text-on-surface block" htmlFor="phoneNumber">
                Phone Number (optional)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-on-surface-variant">
                  <Phone size={16} />
                </div>
                <input
                  id="phoneNumber"
                  type="tel"
                  placeholder="+91 98765 43210"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-surface border border-border text-on-surface text-sm rounded-md focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-colors font-manrope placeholder:text-on-surface-variant/50"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium font-manrope text-on-surface block" htmlFor="password">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-on-surface-variant">
                  <Lock size={16} />
                </div>
                <input
                  id="password"
                  type="password"
                  placeholder="Minimum 8 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-surface border border-border text-on-surface text-sm rounded-md focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-colors font-manrope placeholder:text-on-surface-variant/50"
                  minLength={8}
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium font-manrope text-on-surface block" htmlFor="confirmPassword">
                Confirm Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-on-surface-variant">
                  <Lock size={16} />
                </div>
                <input
                  id="confirmPassword"
                  type="password"
                  placeholder="Re-enter your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-surface border border-border text-on-surface text-sm rounded-md focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-colors font-manrope placeholder:text-on-surface-variant/50"
                  minLength={8}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-primary text-on-primary font-medium text-sm rounded-md hover:bg-primary/90 transition-colors font-manrope mt-6 disabled:cursor-not-allowed disabled:opacity-70"
              disabled={loading}
            >
              {loading ? 'Creating account...' : 'Sign Up'}
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
            <span>Already have an account?</span>
            <Link href="/login" className="font-medium text-primary hover:underline">
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
