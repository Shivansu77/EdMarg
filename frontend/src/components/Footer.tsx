import React from 'react';
import Link from 'next/link';
import { Twitter, Linkedin, Globe } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-surface py-12 lg:py-16 border-t border-border">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        
        <div className="flex flex-col lg:flex-row items-center justify-between gap-10 lg:gap-0">
          
          {/* Logo & Brand */}
          <div className="flex flex-col items-center lg:items-start text-center lg:text-left">
            <Link href="/" className="text-2xl font-bold tracking-tight font-plus-jakarta text-on-surface mb-3">
              Edmarg<span className="text-primary">.</span>
            </Link>
            <p className="text-xs font-medium text-on-surface-variant font-manrope">
              Find Your Career North Star
            </p>
          </div>

          {/* Navigation Links */}
          <nav className="flex flex-wrap justify-center items-center gap-6 lg:gap-8 text-sm font-medium text-on-surface-variant font-manrope">
            <Link href="#how-it-works" className="hover:text-on-surface transition-colors py-2">How it Works</Link>
            <Link href="#mentors" className="hover:text-on-surface transition-colors py-2">Mentors</Link>
            <Link href="/privacy" className="hover:text-on-surface transition-colors py-2">Privacy</Link>
            <Link href="/terms" className="hover:text-on-surface transition-colors py-2">Terms</Link>
          </nav>

          {/* Social Icons */}
          <div className="flex items-center gap-4">
            <Link href="#" className="w-10 h-10 rounded-md border border-border bg-surface flex items-center justify-center text-on-surface-variant hover:text-on-surface hover:bg-surface-dim transition-colors shadow-sm">
              <Twitter size={18} />
            </Link>
            <Link href="#" className="w-10 h-10 rounded-md border border-border bg-surface flex items-center justify-center text-on-surface-variant hover:text-on-surface hover:bg-surface-dim transition-colors shadow-sm">
              <Linkedin size={18} />
            </Link>
            <Link href="#" className="w-10 h-10 rounded-md border border-border bg-surface flex items-center justify-center text-on-surface-variant hover:text-on-surface hover:bg-surface-dim transition-colors shadow-sm">
              <Globe size={18} />
            </Link>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="mt-12 lg:mt-16 pt-8 border-t border-border flex flex-col lg:flex-row items-center justify-between gap-4">
          <p className="text-xs font-medium text-on-surface-variant font-manrope text-center">
            &copy; {currentYear} Edmarg. All rights reserved.
          </p>
          <p className="text-xs font-medium text-on-surface-variant font-manrope text-center">
            Crafted for the future of careers
          </p>
        </div>

      </div>
    </footer>
  );
};

export default Footer;
