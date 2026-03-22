import React from 'react';
import Link from 'next/link';
import { Twitter, Linkedin, Globe } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-surface py-12 lg:py-20 border-t border-on-surface/5">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        
        <div className="flex flex-col lg:flex-row items-center justify-between gap-10 lg:gap-0">
          
          {/* Logo & Brand */}
          <div className="flex flex-col items-center lg:items-start text-center lg:text-left">
            <Link href="/" className="text-2xl font-bold tracking-tight font-plus-jakarta text-on-surface mb-3">
              Edmarg<span className="text-primary">.</span>
            </Link>
            <p className="text-xs lg:text-sm font-bold text-on-surface-variant uppercase tracking-widest font-manrope">
              Find Your Career North Star
            </p>
          </div>

          {/* Navigation Links */}
          <nav className="flex flex-wrap justify-center items-center gap-6 lg:gap-12 text-[11px] lg:text-xs font-bold text-on-surface-variant uppercase tracking-[0.2em] font-manrope">
            <Link href="#how-it-works" className="hover:text-primary transition-colors py-2">How it Works</Link>
            <Link href="#mentors" className="hover:text-primary transition-colors py-2">Mentors</Link>
            <Link href="/privacy" className="hover:text-primary transition-colors py-2">Privacy</Link>
            <Link href="/terms" className="hover:text-primary transition-colors py-2">Terms</Link>
          </nav>

          {/* Social Icons */}
          <div className="flex items-center gap-6">
            <Link href="#" className="w-10 h-10 lg:w-12 lg:h-12 rounded-full bg-surface-container-low flex items-center justify-center text-on-surface hover:bg-primary hover:text-on-primary transition-all">
              <Twitter size={18} />
            </Link>
            <Link href="#" className="w-10 h-10 lg:w-12 lg:h-12 rounded-full bg-surface-container-low flex items-center justify-center text-on-surface hover:bg-primary hover:text-on-primary transition-all">
              <Linkedin size={18} />
            </Link>
            <Link href="#" className="w-10 h-10 lg:w-12 lg:h-12 rounded-full bg-surface-container-low flex items-center justify-center text-on-surface hover:bg-primary hover:text-on-primary transition-all">
              <Globe size={18} />
            </Link>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="mt-12 lg:mt-16 pt-8 border-t border-on-surface/5 flex flex-col lg:flex-row items-center justify-between gap-4">
          <p className="text-[10px] lg:text-xs font-bold text-on-surface-variant/60 uppercase tracking-widest font-manrope text-center">
            &copy; {currentYear} Edmarg. All rights reserved.
          </p>
          <p className="text-[10px] lg:text-xs font-bold text-on-surface-variant/40 uppercase tracking-widest font-manrope text-center">
            Crafted for the future of careers
          </p>
        </div>

      </div>
    </footer>
  );
};

export default Footer;
