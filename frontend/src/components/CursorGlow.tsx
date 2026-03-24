'use client';

import React, { useEffect, useRef, useCallback } from 'react';

const CursorGlow = () => {
  const glowRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (glowRef.current) {
      glowRef.current.style.transform = `translate(${e.clientX - 200}px, ${e.clientY - 200}px)`;
    }
  }, []);

  useEffect(() => {
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    if (isTouchDevice) return;

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [handleMouseMove]);

  return (
    <div
      ref={glowRef}
      className="fixed w-[400px] h-[400px] rounded-full pointer-events-none z-0 hidden lg:block will-change-transform"
      style={{
        background: 'radial-gradient(circle, rgba(124, 58, 237, 0.04) 0%, transparent 65%)',
        transition: 'transform 0.1s ease-out',
      }}
    />
  );
};

export default CursorGlow;
