import React from 'react';
import Link from 'next/link';

interface LogoProps {
  className?: string;
  imgClassName?: string;
  showText?: boolean;
  textColor?: string;
}

const Logo: React.FC<LogoProps> = ({ 
  className = '', 
  imgClassName = 'h-10', 
  showText = true,
  textColor = 'text-slate-900'
}) => {
  return (
    <Link href="/" className={`group flex items-center gap-3 ${className}`}>
      <div className="flex-shrink-0 overflow-hidden rounded-xl shadow-md ring-1 ring-slate-200/50 bg-slate-900">
        <img
          src="/logo.png"
          alt="EdMarg Logo"
          className={`${imgClassName} w-auto block object-cover transition-transform duration-500 group-hover:scale-110`}
        />
      </div>
      {showText && (
        <div className="flex flex-col">
          <span className={`text-xl font-black tracking-tighter leading-none transition-colors ${textColor} group-hover:text-emerald-600`}>
            EdMarg
          </span>
          <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-emerald-500 mt-1">
            Career Guide
          </span>
        </div>
      )}
    </Link>
  );
};

export default Logo;
