import React from 'react';
import Link from 'next/link';
import AppImage from '@/components/AppImage';

interface LogoProps {
  className?: string;
  imgClassName?: string;
  showText?: boolean;
  textColor?: string;
}

const Logo: React.FC<LogoProps> = ({
  className = '',
  imgClassName = 'h-14 w-auto',
  showText = true,
  textColor = 'text-slate-900'
}) => {
  return (
    <Link href="/" className={`group flex items-center gap-0 ${className}`}>
      <AppImage
        src="/edmargLogo.png"
        alt="EdMarg Logo"
        width={144}
        height={144}
        className={`-mr-1 flex-shrink-0 object-contain transition-transform duration-300 group-hover:-translate-y-0.5 ${imgClassName}`}
        priority
      />
      {showText && (
        <span className={`text-xl font-extrabold tracking-tight transition-colors ${textColor} group-hover:text-emerald-500`}>
          EdMarg
        </span>
      )}
    </Link>
  );
};

export default Logo;
