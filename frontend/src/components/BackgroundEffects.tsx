'use client';

import React from 'react';

const BackgroundEffects = () => {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {/* Soft lavender gradient mesh — top left */}
      <div
        className="absolute top-[-10%] left-[-5%] w-[600px] h-[600px] rounded-full blur-[150px] animate-subtle-float"
        style={{ background: 'rgba(124, 58, 237, 0.08)' }}
      />
      {/* Soft pink/purple — top right */}
      <div
        className="absolute top-[5%] right-[-10%] w-[500px] h-[500px] rounded-full blur-[130px] animate-subtle-float"
        style={{ background: 'rgba(167, 139, 250, 0.07)', animationDelay: '-7s' }}
      />
      {/* Soft teal — bottom */}
      <div
        className="absolute bottom-[-5%] left-[30%] w-[400px] h-[400px] rounded-full blur-[120px] animate-subtle-float"
        style={{ background: 'rgba(45, 212, 191, 0.05)', animationDelay: '-12s' }}
      />
    </div>
  );
};

export default BackgroundEffects;
