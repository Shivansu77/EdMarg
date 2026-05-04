import React from 'react';
import Link from 'next/link';
import { Twitter, Linkedin, Globe } from 'lucide-react';

import Logo from '@/components/Logo';

const Footer = () => {
  const y = new Date().getFullYear();
  return (
    <footer className="relative overflow-hidden bg-gradient-to-b from-emerald-900 to-emerald-950 text-white py-12 border-t border-emerald-700/40">
      {/* Subtle radial halo at top center */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-200 h-75 bg-[radial-gradient(ellipse_at_top,var(--tw-gradient-stops))] from-emerald-400/20 via-emerald-900 to-emerald-950 pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-8 mb-8">
          <div className="flex flex-col items-center lg:items-start group">
            <Logo 
              className="mb-1" 
              imgClassName="h-12 w-auto" 
              textColor="text-white"
            />
            <p className="text-xs text-emerald-200/80 font-medium">Find Your Career North Star</p>
          </div>
          
          <nav className="flex flex-wrap justify-center gap-8 text-sm font-semibold text-emerald-200/80">
            <Link href="/about" className="hover:text-emerald-400 transition-colors">About Us</Link>
            <Link href="/pricing" className="hover:text-emerald-400 transition-colors">Pricing</Link>
            <Link href="/contact" className="hover:text-emerald-400 transition-colors">Contact</Link>
            <Link href="/privacy" className="hover:text-emerald-400 transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-emerald-400 transition-colors">Terms</Link>
          </nav>
          
          <div className="flex items-center gap-4">
            {[Twitter, Linkedin, Globe].map((Icon, i) => (
              <Link key={i} href="#" className="w-10 h-10 rounded-full border border-emerald-800/70 bg-emerald-900/60 flex items-center justify-center text-emerald-200/80 hover:text-emerald-300 hover:border-emerald-400/40 hover:bg-emerald-800/60 transition-all">
                <Icon size={18} />
              </Link>
            ))}
          </div>
        </div>
        
        <div className="pt-8 border-t border-emerald-800/70 text-center">
          <p className="text-xs font-medium text-emerald-300/60">&copy; {y} EdMarg. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
