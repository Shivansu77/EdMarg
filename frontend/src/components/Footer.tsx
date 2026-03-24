import React from 'react';
import Link from 'next/link';
import { Twitter, Linkedin, Globe } from 'lucide-react';

const Footer = () => {
  const y = new Date().getFullYear();
  return (
    <footer className="section-dark py-14 border-t border-white/5">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-10">
          <div className="flex flex-col items-center lg:items-start">
            <Link href="/" className="text-2xl font-bold font-sora text-white mb-2">Edmarg<span className="text-[#A78BFA]">.</span></Link>
            <p className="text-xs text-white/30 font-inter">Find Your Career North Star</p>
          </div>
          <nav className="flex flex-wrap justify-center gap-6 lg:gap-8 text-sm font-medium text-white/40 font-inter">
            <Link href="#how-it-works" className="hover:text-white transition-colors">How it Works</Link>
            <Link href="#mentors" className="hover:text-white transition-colors">Mentors</Link>
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
          </nav>
          <div className="flex items-center gap-3">
            {[Twitter, Linkedin, Globe].map((Icon, i) => (
              <Link key={i} href="#" className="w-10 h-10 rounded-full border border-white/10 bg-white/5 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition-all"><Icon size={18} /></Link>
            ))}
          </div>
        </div>
        <div className="mt-12 pt-8 border-t border-white/5 text-center">
          <p className="text-xs text-white/20 font-inter">&copy; {y} Edmarg. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
