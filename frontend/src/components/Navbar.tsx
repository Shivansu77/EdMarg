'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Menu, X, LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { getImageUrl } from '@/utils/imageUrl';

import Logo from '@/components/Logo';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { user, logout, isLoading } = useAuth();
  const router = useRouter();

  const isLoggedIn = !isLoading && !!user;
  const userName = user?.name || 'User';
  const userRole = user?.role || 'student';
  const userAvatar = getImageUrl(user?.profileImage, userName, 80, user?.profileImageUpdatedAt);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
    } catch {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      document.cookie = 'auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT; SameSite=Lax';
      window.dispatchEvent(new Event('edmarg-auth-user-change'));
    }
    setIsOpen(false);
    router.push('/');
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'border-b border-emerald-100 bg-white/88 py-3 shadow-[0_10px_40px_rgba(15,23,42,0.08)] backdrop-blur-xl'
          : 'bg-transparent py-4'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-8 flex items-center justify-between">
        <Logo />

        <nav className="hidden lg:flex absolute left-1/2 -translate-x-1/2 items-center gap-2 rounded-full border border-slate-200/80 bg-white/90 px-3 py-2 text-sm font-semibold text-slate-600 shadow-[0_10px_30px_rgba(15,23,42,0.06)] backdrop-blur-md">
          <Link href="/" className="rounded-full px-4 py-1.5 hover:bg-emerald-50 hover:text-slate-900 transition-colors">Home</Link>
          <Link href="/about" className="rounded-full px-4 py-1.5 hover:bg-emerald-50 hover:text-slate-900 transition-colors">About</Link>
          <Link href="/blogs" className="rounded-full px-4 py-1.5 hover:bg-emerald-50 hover:text-slate-900 transition-colors">Blog</Link>
          {!isLoggedIn && (
            <>
              <Link href="/#how-it-works" className="rounded-full px-4 py-1.5 hover:bg-emerald-50 hover:text-slate-900 transition-colors">How it Works</Link>
              <Link href="/#mentors" className="rounded-full px-4 py-1.5 hover:bg-emerald-50 hover:text-slate-900 transition-colors">Mentors</Link>
              <Link href="/#success-stories" className="rounded-full px-4 py-1.5 hover:bg-emerald-50 hover:text-slate-900 transition-colors">Success Stories</Link>
            </>
          )}
        </nav>

        <div className="hidden lg:flex items-center gap-4">
          {isLoggedIn ? (
            <div className="flex items-center gap-4">
              <Image
                src={userAvatar}
                alt={`${userName} avatar`}
                width={32}
                height={32}
                className="h-8 w-8 rounded-full object-cover object-top"
              />
              <span className="text-sm text-gray-600">Welcome, {userName}</span>
              <Link
                href={`/${userRole}/dashboard`}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold rounded-full transition-colors"
              >
                Dashboard
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <LogOut size={18} />
                Logout
              </button>
            </div>
          ) : (
            <>
              <Link href="/login" className="text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors">
                Log in
              </Link>
              <Link href="/signup" className="px-5 py-2.5 bg-linear-to-r from-emerald-300 to-green-400 hover:from-emerald-400 hover:to-green-500 text-slate-900 text-sm font-bold rounded-full transition-all shadow-[0_10px_24px_rgba(16,185,129,0.28)]">
                Sign up
              </Link>
            </>
          )}
        </div>

        <button
          className="lg:hidden p-2 text-slate-900 hover:bg-white/80 rounded-lg transition-colors"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {isOpen && (
          <div className="fixed inset-0 z-40 lg:hidden bg-linear-to-b from-emerald-50 to-white pt-24 px-6">
            <nav className="flex flex-col gap-4 text-lg font-semibold text-slate-900 mb-8">
              <Link href="/" onClick={() => setIsOpen(false)}>Home</Link>
              <Link href="/about" onClick={() => setIsOpen(false)}>About</Link>
              <Link href="/blogs" onClick={() => setIsOpen(false)}>Blog</Link>
              {!isLoggedIn && (
                <>
                <Link href="/#how-it-works" onClick={() => setIsOpen(false)}>How it Works</Link>
                <Link href="/#mentors" onClick={() => setIsOpen(false)}>Mentors</Link>
                <Link href="/#success-stories" onClick={() => setIsOpen(false)}>Success Stories</Link>
                </>
              )}
            </nav>
            <div className="flex flex-col gap-3">
              {isLoggedIn ? (
                <>
                  <div className="py-3 px-4 bg-white rounded-2xl border border-emerald-100 text-center shadow-[0_10px_30px_rgba(16,185,129,0.12)]">
                    <Image
                      src={userAvatar}
                      alt={`${userName} avatar`}
                      width={40}
                      height={40}
                      className="mx-auto mb-2 h-10 w-10 rounded-full object-cover object-top"
                    />
                    <p className="text-sm text-gray-600">Welcome, {userName}</p>
                  </div>
                  <Link
                    href={`/${userRole}/dashboard`}
                    onClick={() => setIsOpen(false)}
                    className="w-full py-3 text-center bg-slate-900 text-white rounded-full font-semibold hover:bg-slate-800 transition-colors"
                  >
                    Go to Dashboard
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full py-3 text-center bg-red-50 text-red-600 rounded-full font-semibold hover:bg-red-100 transition-colors flex items-center justify-center gap-2"
                  >
                    <LogOut size={18} />
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link href="/login" onClick={() => setIsOpen(false)} className="w-full py-3 text-center text-slate-900 border border-slate-300 rounded-full font-semibold hover:bg-white transition-colors">
                    Log in
                  </Link>
                  <Link href="/signup" onClick={() => setIsOpen(false)} className="w-full py-3 text-center bg-linear-to-r from-emerald-300 to-green-400 text-slate-900 rounded-full font-bold hover:from-emerald-400 hover:to-green-500 transition-colors">
                    Sign up
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
