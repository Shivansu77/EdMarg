import React from 'react';
import Link from 'next/link';
import { Twitter, Linkedin, Globe } from 'lucide-react';

const Footer = () => {
  const y = new Date().getFullYear();
  return (
    <footer className="bg-gray-900 text-white py-12 border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-8 mb-8">
          <div className="flex flex-col items-center lg:items-start">
            <Link href="/" className="text-2xl font-bold mb-1">EdMarg</Link>
            <p className="text-xs text-gray-400">Find Your Career North Star</p>
          </div>
          <nav className="flex flex-wrap justify-center gap-6 lg:gap-8 text-sm font-medium text-gray-400">
            <Link href="#how-it-works" className="hover:text-white transition-colors">How it Works</Link>
            <Link href="#mentors" className="hover:text-white transition-colors">Mentors</Link>
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
          </nav>
          <div className="flex items-center gap-3">
            {[Twitter, Linkedin, Globe].map((Icon, i) => (
              <Link key={i} href="#" className="w-10 h-10 rounded-lg border border-gray-700 bg-gray-800 flex items-center justify-center text-gray-400 hover:text-white hover:bg-gray-700 transition-all">
                <Icon size={18} />
              </Link>
            ))}
          </div>
        </div>
        <div className="pt-8 border-t border-gray-800 text-center">
          <p className="text-xs text-gray-500">&copy; {y} EdMarg. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
