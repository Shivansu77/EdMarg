'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? 'bg-gradient-to-br from-white via-gray-50 to-gray-100 backdrop-blur-xl border-b border-gray-200 py-3 shadow-sm'
          : 'bg-transparent py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-12 flex items-center justify-between">
        <Link href="/" className={`text-2xl font-bold tracking-tight font-sora z-50 ${
          scrolled ? 'text-gray-900' : 'text-white'
        }`}>
          Edmarg<span className={`${scrolled ? 'text-purple-600' : 'text-[#A78BFA]'}`}>.</span>
        </Link>

        <nav className={`hidden lg:flex absolute left-1/2 -translate-x-1/2 items-center gap-10 text-[14px] font-medium font-inter ${
          scrolled ? 'text-gray-600' : 'text-white/60'
        }`}>
          <Link href="#how-it-works" className={`hover:${scrolled ? 'text-gray-900' : 'text-white'} transition-colors`}>How it Works</Link>
          <Link href="#mentors" className={`hover:${scrolled ? 'text-gray-900' : 'text-white'} transition-colors`}>Mentors</Link>
          <Link href="#success-stories" className={`hover:${scrolled ? 'text-gray-900' : 'text-white'} transition-colors`}>Success Stories</Link>
          <Link href="#about" className={`hover:${scrolled ? 'text-gray-900' : 'text-white'} transition-colors`}>About</Link>
        </nav>

        <div className="hidden lg:flex items-center gap-5">
          <Link href="/login" className={`text-[14px] font-medium transition-colors font-inter ${
            scrolled ? 'text-gray-600 hover:text-gray-900' : 'text-white/60 hover:text-white'
          }`}>
            Log in
          </Link>
          <Link href="/signup" className="btn-primary px-6 py-2.5 text-[14px] font-inter">
            Sign Up
          </Link>
        </div>

        <button className={`lg:hidden z-50 p-2 rounded-lg transition-colors ${
          scrolled ? 'text-gray-900 hover:bg-gray-200' : 'text-white hover:bg-white/5'
        }`} onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        <div className={`fixed inset-0 z-40 lg:hidden transition-transform duration-500 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        } ${scrolled ? 'bg-white' : 'bg-[#0B0F19]'}`}>
          <div className="flex flex-col h-full pt-32 px-10 gap-8">
            <nav className={`flex flex-col gap-6 text-2xl font-bold font-sora ${
              scrolled ? 'text-gray-900' : 'text-white'
            }`}>
              <Link href="#how-it-works" onClick={() => setIsOpen(false)}>How it Works</Link>
              <Link href="#mentors" onClick={() => setIsOpen(false)}>Mentors</Link>
              <Link href="#success-stories" onClick={() => setIsOpen(false)}>Success Stories</Link>
              <Link href="#about" onClick={() => setIsOpen(false)}>About</Link>
            </nav>
            <div className="mt-auto mb-16 flex flex-col gap-4">
              <Link href="/login" onClick={() => setIsOpen(false)} className={`w-full py-3.5 text-center text-base font-medium rounded-full font-inter ${
                scrolled ? 'text-gray-900 border border-gray-300' : 'text-white border border-white/20'
              }`}>Log in</Link>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
