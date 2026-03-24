"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowRight, Lock, Mail, Phone, User, GraduationCap, Users } from 'lucide-react';

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [role, setRole] = useState<'student' | 'mentor'>('student');
  const [classLevel, setClassLevel] = useState('');
  const [interests, setInterests] = useState('');
  const [expertise, setExpertise] = useState('');
  const [bio, setBio] = useState('');

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

    const payload: any = {
      name,
      email,
      password,
      phoneNumber,
      role,
    };

    if (role === 'student') {
      payload.studentProfile = {
        classLevel,
        interests: interests.split(',').map(i => i.trim()).filter(i => i !== ''),
      };
    } else {
      payload.mentorProfile = {
        expertise: expertise.split(',').map(e => e.trim()).filter(e => e !== ''),
        bio,
      };
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/users`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.error || result.message || 'Signup failed');
      }

      setSuccess(`Welcome, ${result.data?.name || name}! Your account was created.`);
      
      // ✅ ROLE BASED REDIRECT
      setTimeout(() => {
        if (role === 'student') {
          router.push('/student/dashboard');
        } else if (role === 'mentor') {
          router.push('/mentor/dashboard');
        }
      }, 1500); // Small delay to show success message

      setName('');
      setEmail('');
      setPhoneNumber('');
      setPassword('');
      setConfirmPassword('');
      setClassLevel('');
      setInterests('');
      setExpertise('');
      setBio('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to create account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen py-20 flex flex-col items-center justify-center p-6 bg-surface relative overflow-hidden">
      {/* Background Subtle Splashes */}
      <div className="absolute top-[10%] left-[-10%] w-[50%] h-[50%] bg-surface-dim rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[40%] h-[40%] bg-surface-dim rounded-full blur-[100px] pointer-events-none" />

      {/* Brand logo/name */}
      <Link href="/" className="absolute top-8 left-8 text-2xl font-bold font-sora text-on-surface flex items-center gap-2 z-10">
        Edmarg<span className="text-primary">.</span>
      </Link>

      {/* Main Content */}
      <div className="w-full relative z-10 flex flex-col items-center">
        <div className="mx-auto w-full max-w-md rounded-2xl border border-border bg-surface p-8 shadow-(--shadow-ambient)">
          <div className="mb-8 text-center">
            <h2 className="text-2xl font-bold font-sora text-on-surface mb-2 tracking-tight">Create Account</h2>
            <p className="text-sm font-inter text-on-surface-variant">
              Set up your profile to get started
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* ROLE SELECTION */}
            <div className="flex p-1 bg-surface-dim rounded-xl border border-border mb-6">
              <button
                type="button"
                onClick={() => setRole('student')}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg transition-all duration-300 font-inter text-sm font-medium ${
                  role === 'student' 
                    ? 'bg-white text-primary shadow-sm' 
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                <GraduationCap size={18} />
                Student
              </button>
              <button
                type="button"
                onClick={() => setRole('mentor')}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg transition-all duration-300 font-inter text-sm font-medium ${
                  role === 'mentor' 
                    ? 'bg-white text-primary shadow-sm' 
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                <Users size={18} />
                Mentor
              </button>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-semibold font-inter text-on-surface" htmlFor="name">
                Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-on-surface-variant">
                  <User size={16} />
                </div>
                <input
                  id="name"
                  type="text"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-surface border border-border text-on-surface text-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-inter"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-semibold font-inter text-on-surface" htmlFor="email">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-on-surface-variant">
                  <Mail size={16} />
                </div>
                <input
                  id="email"
                  type="email"
                  placeholder="you@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-surface border border-border text-on-surface text-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-inter"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-semibold font-inter text-on-surface" htmlFor="phoneNumber">
                Phone Number
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
                  className="w-full pl-10 pr-4 py-2.5 bg-surface border border-border text-on-surface text-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-inter"
                />
              </div>
            </div>

            {/* DYNAMIC PROFILE FIELDS */}
            {role === 'student' ? (
              <>
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold font-inter text-on-surface" htmlFor="classLevel">
                    Class / Level
                  </label>
                  <input
                    id="classLevel"
                    type="text"
                    placeholder="e.g. Class 12, Graduate"
                    value={classLevel}
                    onChange={(e) => setClassLevel(e.target.value)}
                    className="w-full px-4 py-2.5 bg-surface border border-border text-on-surface text-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-inter"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold font-inter text-on-surface" htmlFor="interests">
                    Interests (comma separated)
                  </label>
                  <input
                    id="interests"
                    type="text"
                    placeholder="e.g. Design, Tech, Space"
                    value={interests}
                    onChange={(e) => setInterests(e.target.value)}
                    className="w-full px-4 py-2.5 bg-surface border border-border text-on-surface text-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-inter"
                  />
                </div>
              </>
            ) : (
              <>
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold font-inter text-on-surface" htmlFor="expertise">
                    Expertise (comma separated)
                  </label>
                  <input
                    id="expertise"
                    type="text"
                    placeholder="e.g. Career Coaching, Engineering"
                    value={expertise}
                    onChange={(e) => setExpertise(e.target.value)}
                    className="w-full px-4 py-2.5 bg-surface border border-border text-on-surface text-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-inter"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold font-inter text-on-surface" htmlFor="bio">
                    Short Bio
                  </label>
                  <textarea
                    id="bio"
                    placeholder="Tell us about your experience..."
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    className="w-full px-4 py-2.5 bg-surface border border-border text-on-surface text-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-inter min-h-[80px]"
                  />
                </div>
              </>
            )}

            <div className="space-y-1.5">
              <label className="text-sm font-semibold font-inter text-on-surface" htmlFor="password">
                Password
              </label>
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
                  className="w-full pl-10 pr-4 py-2.5 bg-surface border border-border text-on-surface text-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-inter"
                  minLength={8}
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-semibold font-inter text-on-surface" htmlFor="confirmPassword">
                Confirm Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-on-surface-variant">
                  <Lock size={16} />
                </div>
                <input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-surface border border-border text-on-surface text-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-inter"
                  minLength={8}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-primary text-white font-bold text-[14px] rounded-lg hover:bg-primary-dim transition-all shadow-lg shadow-primary/20 active:scale-[0.98] font-inter mt-6 disabled:cursor-not-allowed disabled:opacity-70"
              disabled={loading}
            >
              {loading ? 'Creating account...' : 'Create Account'}
              {!loading && <ArrowRight size={18} />}
            </button>

            {error && (
              <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-xs font-inter font-medium text-red-600">
                {error}
              </p>
            )}

            {success && (
              <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs font-inter font-medium text-emerald-700">
                {success}
              </div>
            )}
          </form>

          <div className="mt-8 text-center text-[13px] text-on-surface-variant font-inter flex items-center justify-center gap-1">
            <span>Already have an account?</span>
            <Link href="/login" className="font-bold text-primary hover:text-primary-dim transition-colors transition-all active:scale-95">
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
