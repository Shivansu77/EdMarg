'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import AppImage from '@/components/AppImage';
import { Menu, X, LogOut } from 'lucide-react';
import { Show, SignInButton, SignUpButton, useUser as useClerkUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { getImageUrl } from '@/utils/imageUrl';

import Logo from '@/components/common/Logo';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { user, logout, isLoading } = useAuth();
  const { isLoaded: isClerkLoaded, isSignedIn: isClerkSignedIn } = useClerkUser();
  const router = useRouter();

  const isLoggedIn = !isLoading && !!user;
  const isClerkSession = isClerkLoaded && Boolean(isClerkSignedIn);
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
          ? 'border-b border-slate-200/60 bg-white/80 py-2 shadow-sm backdrop-blur-xl'
          : 'bg-transparent py-3'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-8 flex items-center justify-between">
        <Logo />

        <nav className="hidden lg:flex absolute left-1/2 -translate-x-1/2 items-center gap-1 rounded-full border border-slate-200/60 bg-white/80 px-2 py-1.5 text-[13px] font-medium text-slate-600 shadow-sm backdrop-blur-md">
          <Link href="/" className="rounded-full px-3 py-1 hover:bg-slate-100 hover:text-slate-900 transition-colors">Home</Link>
          <Link href="/pricing" className="rounded-full px-3 py-1 hover:bg-slate-100 hover:text-slate-900 transition-colors">Pricing</Link>
          <Link href="/about" className="rounded-full px-3 py-1 hover:bg-slate-100 hover:text-slate-900 transition-colors">About</Link>
          <Link href="/blogs" className="rounded-full px-3 py-1 hover:bg-slate-100 hover:text-slate-900 transition-colors">Blog</Link>
          {isLoggedIn && userRole === 'student' && (
            <Link href="/student/wishlist" className="rounded-full px-3 py-1 hover:bg-slate-100 hover:text-slate-900 transition-colors">Wishlist</Link>
          )}
          {!isLoggedIn && (
            <>
              <Link href="/#how-it-works" className="rounded-full px-3 py-1 hover:bg-slate-100 hover:text-slate-900 transition-colors">How it Works</Link>
              <Link href="/#mentors" className="rounded-full px-3 py-1 hover:bg-slate-100 hover:text-slate-900 transition-colors">Mentors</Link>
            </>
          )}
        </nav>

        <div className="hidden lg:flex items-center gap-4">
          {isLoggedIn ? (
            <div className="flex items-center gap-3">
              <AppImage
                src={userAvatar}
                alt={`${userName} avatar`}
                width={28}
                height={28}
                fallbackName={userName}
                className="h-7 w-7 rounded-full object-cover object-top"
              />
              <span className="text-[13px] font-medium text-slate-500">Welcome, {userName}</span>
              <Link
                href={`/${userRole}/dashboard`}
                className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-[13px] font-semibold rounded-full transition-colors"
              >
                Dashboard
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 px-2 py-1.5 text-slate-500 hover:text-slate-900 transition-colors text-[13px] font-medium"
              >
                <LogOut size={16} />
                Logout
              </button>
            </div>
          ) : (
            <Show when="signed-out">
              <SignInButton
                mode="modal"
                forceRedirectUrl="/student/dashboard"
                fallbackRedirectUrl="/student/dashboard"
              >
                <button className="text-[13px] font-semibold text-slate-600 hover:text-emerald-600 transition-colors">
                  Log in
                </button>
              </SignInButton>
              <SignUpButton
                mode="modal"
                forceRedirectUrl="/student/dashboard"
                fallbackRedirectUrl="/student/dashboard"
              >
                <button className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-[13px] font-semibold rounded-full transition-all shadow-sm shadow-emerald-500/20 hover:-translate-y-0.5 active:scale-95">
                  Get Started
                </button>
              </SignUpButton>
            </Show>
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
              <Link href="/pricing" onClick={() => setIsOpen(false)}>Pricing</Link>
              <Link href="/about" onClick={() => setIsOpen(false)}>About</Link>
              <Link href="/blogs" onClick={() => setIsOpen(false)}>Blog</Link>
              {isLoggedIn && userRole === 'student' && (
                <Link href="/student/wishlist" onClick={() => setIsOpen(false)}>Wishlist</Link>
              )}
              {!isLoggedIn && (
                <>
                <Link href="/#how-it-works" onClick={() => setIsOpen(false)}>How it Works</Link>
                <Link href="/#mentors" onClick={() => setIsOpen(false)}>Mentors</Link>
                </>
              )}
            </nav>
            <div className="flex flex-col gap-3">
              {isLoggedIn ? (
                <>
                  <div className="py-3 px-4 bg-white rounded-2xl border border-emerald-100 text-center shadow-[0_10px_30px_rgba(16,185,129,0.12)]">
                    <AppImage
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
                <Show when="signed-out">
                  <SignInButton
                    mode="modal"
                    forceRedirectUrl="/student/dashboard"
                    fallbackRedirectUrl="/student/dashboard"
                  >
                    <button
                      onClick={() => setIsOpen(false)}
                      className="w-full py-3 text-center text-slate-900 border border-slate-300 rounded-full font-semibold hover:bg-white transition-colors"
                    >
                      Log in
                    </button>
                  </SignInButton>
                  <SignUpButton
                    mode="modal"
                    forceRedirectUrl="/student/dashboard"
                    fallbackRedirectUrl="/student/dashboard"
                  >
                    <button
                      onClick={() => setIsOpen(false)}
                      className="w-full py-3 text-center bg-linear-to-r from-emerald-300 to-green-400 text-slate-900 rounded-full font-bold hover:from-emerald-400 hover:to-green-500 transition-colors"
                    >
                      Sign up
                    </button>
                  </SignUpButton>
                </Show>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
