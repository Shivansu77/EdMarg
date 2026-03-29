'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Menu, X, LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState('');
  const [userRole, setUserRole] = useState('student');
  const router = useRouter();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    
    // Check authentication status
    const checkAuth = () => {
      const token = localStorage.getItem('token');
      const user = localStorage.getItem('user');
      
      if (token && user) {
        try {
          const userData = JSON.parse(user);
          setIsLoggedIn(true);
          setUserName(userData.name || 'User');
          setUserRole(userData.role || 'student');
        } catch (e) {
          setIsLoggedIn(false);
        }
      } else {
        setIsLoggedIn(false);
      }
    };

    checkAuth();

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsLoggedIn(false);
    setIsOpen(false);
    router.push('/');
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'border-b border-gray-200 bg-white/95 py-3 shadow-sm backdrop-blur-md'
          : 'bg-white py-4'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-8 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold text-gray-900">
          EdMarg
        </Link>

        <nav className="hidden lg:flex absolute left-1/2 -translate-x-1/2 items-center gap-8 text-sm font-medium text-gray-600">
          <Link href="/" className="hover:text-gray-900 transition-colors">Home</Link>
          <Link href="/about" className="hover:text-gray-900 transition-colors">About</Link>
          <Link href="/blog" className="hover:text-gray-900 transition-colors">Blog</Link>
          {!isLoggedIn && (
            <>
              <Link href="/#how-it-works" className="hover:text-gray-900 transition-colors">How it Works</Link>
              <Link href="/#mentors" className="hover:text-gray-900 transition-colors">Mentors</Link>
              <Link href="/#success-stories" className="hover:text-gray-900 transition-colors">Success Stories</Link>
            </>
          )}
        </nav>

        <div className="hidden lg:flex items-center gap-4">
          {isLoggedIn ? (
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">Welcome, {userName}</span>
              <Link
                href={`/${userRole}/dashboard`}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-900 text-sm font-medium rounded-lg transition-colors"
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
              <Link href="/login" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
                Log in
              </Link>
              <Link href="/signup" className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors">
                Sign up
              </Link>
            </>
          )}
        </div>

        <button
          className="lg:hidden p-2 text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {isOpen && (
          <div className="fixed inset-0 z-40 lg:hidden bg-white pt-24 px-6">
            <nav className="flex flex-col gap-6 text-lg font-semibold text-gray-900 mb-8">
              <Link href="/" onClick={() => setIsOpen(false)}>Home</Link>
              <Link href="/about" onClick={() => setIsOpen(false)}>About</Link>
              <Link href="/blog" onClick={() => setIsOpen(false)}>Blog</Link>
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
                  <div className="py-3 px-4 bg-gray-50 rounded-lg text-center">
                    <p className="text-sm text-gray-600">Welcome, {userName}</p>
                  </div>
                  <Link
                    href={`/${userRole}/dashboard`}
                    onClick={() => setIsOpen(false)}
                    className="w-full py-3 text-center bg-gray-100 text-gray-900 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                  >
                    Go to Dashboard
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full py-3 text-center bg-red-50 text-red-600 rounded-lg font-medium hover:bg-red-100 transition-colors flex items-center justify-center gap-2"
                  >
                    <LogOut size={18} />
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link href="/login" onClick={() => setIsOpen(false)} className="w-full py-3 text-center text-gray-900 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition-colors">
                    Log in
                  </Link>
                  <Link href="/signup" onClick={() => setIsOpen(false)} className="w-full py-3 text-center bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors">
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
