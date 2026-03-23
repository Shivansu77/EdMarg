'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-surface/80 backdrop-blur-md border-b border-border/40 py-4' : 'bg-transparent py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="text-2xl font-bold tracking-tight font-plus-jakarta text-on-surface z-50">
          Edmarg<span className="text-primary">.</span>
        </Link>

        {/* Desktop Nav Links - Centered */}
        <nav className="hidden lg:flex absolute left-1/2 -translate-x-1/2 items-center gap-10 text-[13px] font-medium text-on-surface-variant font-manrope">
          <Link href="#how-it-works" className="hover:text-primary transition-colors">How it Works</Link>
          <Link href="#mentors" className="hover:text-primary transition-colors">Mentors</Link>
          <Link href="#success-stories" className="hover:text-primary transition-colors">Success Stories</Link>
          <Link href="#about" className="hover:text-primary transition-colors">About</Link>
        </nav>

        {/* Desktop Auth Buttons - Right Aligned */}
        <div className="hidden lg:flex items-center gap-5">
          <Link
            href="/login"
            className="text-[13px] font-medium text-on-surface hover:text-on-surface-variant transition-colors font-manrope whitespace-nowrap"
          >
            Log in
          </Link>
          <Link
            href="/signup"
            className="px-5 py-2.5 text-[13px] font-medium text-white rounded-xl shadow-sm transition-all hover:scale-105 font-manrope whitespace-nowrap" style={{background: 'linear-gradient(135deg, #6366f1, #8b5cf6)'}}
          >
            Sign up
          </Link>
        </div>

        {/* Mobile Menu Toggle */}
        <button 
          className="lg:hidden z-50 p-2 text-on-surface hover:bg-surface-dim rounded-md transition-colors"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* Mobile Menu Overlay */}
        <div 
          className={`fixed inset-0 bg-surface z-40 lg:hidden transition-transform duration-500 ease-in-out ${
            isOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          <div className="flex flex-col h-full pt-32 px-10 gap-8">
            <nav className="flex flex-col gap-6 text-2xl font-bold font-plus-jakarta text-on-surface">
              <Link href="#how-it-works" onClick={() => setIsOpen(false)}>How it Works</Link>
              <Link href="#mentors" onClick={() => setIsOpen(false)}>Mentors</Link>
              <Link href="#success-stories" onClick={() => setIsOpen(false)}>Success Stories</Link>
              <Link href="#about" onClick={() => setIsOpen(false)}>About</Link>
            </nav>
            
            <div className="mt-auto mb-16 flex flex-col gap-4">
              <Link
                href="/login"
                onClick={() => setIsOpen(false)}
                className="w-full py-3.5 text-center text-base font-medium text-on-surface border border-border rounded-md font-manrope hover:bg-surface-dim transition-colors"
              >
                Log in
              </Link>
              <Link
                href="/signup"
                onClick={() => setIsOpen(false)}
                className="w-full py-3.5 text-center text-base font-medium text-white rounded-xl shadow-sm font-manrope transition-all hover:opacity-90" style={{background: 'linear-gradient(135deg, #6366f1, #8b5cf6)'}}
              >
                Sign up
              </Link>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
