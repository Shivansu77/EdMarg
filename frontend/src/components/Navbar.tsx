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
          ? 'border-b border-border bg-white/90 py-3 shadow-sm backdrop-blur-xl'
          : 'py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-12 flex items-center justify-between">
        <Link href="/" className={`text-2xl font-bold tracking-tight font-sora z-50 ${
          scrolled ? 'text-on-surface' : 'text-on-surface'
        }`}>
          Edmarg<span className="text-primary">.</span>
        </Link>

        <nav className={`hidden lg:flex absolute left-1/2 -translate-x-1/2 items-center gap-10 text-[14px] font-medium font-inter ${
          scrolled ? 'text-on-surface-variant' : 'text-on-surface-variant'
        }`}>
          <Link href="#how-it-works" className="transition-colors hover:text-on-surface">How it Works</Link>
          <Link href="#mentors" className="transition-colors hover:text-on-surface">Mentors</Link>
          <Link href="#success-stories" className="transition-colors hover:text-on-surface">Success Stories</Link>
          <Link href="#about" className="transition-colors hover:text-on-surface">About</Link>
        </nav>

        <div className="hidden lg:flex items-center gap-5">
          <Link href="/login" className={`text-[14px] font-medium transition-colors font-inter ${
            scrolled ? 'text-on-surface-variant hover:text-on-surface' : 'text-on-surface-variant hover:text-on-surface'
          }`}>
            Log in
          </Link>
          <Link href="/signup" className="btn-primary px-6 py-2.5 text-[14px] font-inter">
            Sign Up
          </Link>
        </div>

        <button className={`lg:hidden z-50 p-2 rounded-lg transition-colors ${
          scrolled ? 'text-on-surface hover:bg-surface-dim' : 'text-on-surface hover:bg-surface-dim'
        }`} onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        <div className={`fixed inset-0 z-40 lg:hidden transition-transform duration-500 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        } bg-white`}>
          <div className="flex flex-col h-full pt-32 px-10 gap-8">
            <nav className={`flex flex-col gap-6 text-2xl font-bold font-sora ${
              scrolled ? 'text-on-surface' : 'text-on-surface'
            }`}>
              <Link href="#how-it-works" onClick={() => setIsOpen(false)}>How it Works</Link>
              <Link href="#mentors" onClick={() => setIsOpen(false)}>Mentors</Link>
              <Link href="#success-stories" onClick={() => setIsOpen(false)}>Success Stories</Link>
              <Link href="#about" onClick={() => setIsOpen(false)}>About</Link>
            </nav>
            <div className="mt-auto mb-16 flex flex-col gap-4">
              <Link href="/login" onClick={() => setIsOpen(false)} className={`w-full py-3.5 text-center text-base font-medium rounded-full font-inter ${
                scrolled ? 'border border-border text-on-surface' : 'border border-border text-on-surface'
              }`}>Log in</Link>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
