import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface LogoProps {
  className?: string;
  imgClassName?: string;
  showText?: boolean;
  textColor?: string;
}

const Logo: React.FC<LogoProps> = ({
  className = '',
  imgClassName = 'h-9 w-auto',
  showText = true,
  textColor = 'text-slate-900'
}) => {
  return (
    <Link href="/" className={`group flex items-center gap-3 ${className}`}>
      <div className={`relative flex-shrink-0 ${imgClassName}`}>
        <Image
          src="/image.png"
          alt="EdMarg Logo"
          fill
          className="object-contain transition-transform duration-300 group-hover:-translate-y-0.5"
          priority
        />
      </div>
      {showText && (
        <span className={`text-xl font-extrabold tracking-tight transition-colors ${textColor} group-hover:text-emerald-500`}>
          EdMarg
        </span>
      )}
    </Link>
  );
};

export default Logo;
