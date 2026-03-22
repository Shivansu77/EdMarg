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
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 px-6 py-4 ${
        scrolled ? 'bg-surface/80 backdrop-blur-md shadow-sm' : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="text-2xl font-bold tracking-tight font-plus-jakarta text-on-surface z-50">
          Edmarg<span className="text-primary">.</span>
        </Link>

        {/* Desktop Nav Links */}
        <nav className="hidden lg:flex items-center gap-8 text-[13px] font-bold text-on-surface-variant font-manrope uppercase tracking-wider">
          <Link href="#how-it-works" className="hover:text-primary transition-colors">How it Works</Link>
          <Link href="#mentors" className="hover:text-primary transition-colors">Mentors</Link>
          <Link href="#success-stories" className="hover:text-primary transition-colors">Success Stories</Link>
          <Link href="#about" className="hover:text-primary transition-colors">About</Link>
        </nav>

        {/* Desktop Auth Buttons */}
        <div className="hidden lg:flex items-center gap-6">
          <Link
            href="/connect"
            className="text-sm font-bold text-primary hover:text-primary-dim transition-colors font-manrope"
          >
            Connect with Mentor
          </Link>
          <Link
            href="/assessment"
            className="px-8 py-3.5 text-sm font-bold bg-primary text-on-primary rounded-[3rem] hover:shadow-ambient transition-all transform hover:-translate-y-1 font-manrope"
          >
            Take Assessment
          </Link>
        </div>

        {/* Mobile Menu Toggle */}
        <button 
          className="lg:hidden z-50 p-2 text-on-surface"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X size={28} /> : <Menu size={28} />}
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
                href="/connect"
                onClick={() => setIsOpen(false)}
                className="w-full py-4 text-center text-lg font-bold text-primary border-2 border-primary rounded-[3rem] font-manrope"
              >
                Connect with Mentor
              </Link>
              <Link
                href="/assessment"
                onClick={() => setIsOpen(false)}
                className="w-full py-4 text-center text-lg font-bold bg-primary text-on-primary rounded-[3rem] font-manrope"
              >
                Take Assessment
              </Link>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
