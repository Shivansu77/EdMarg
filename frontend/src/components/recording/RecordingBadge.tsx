'use client';

/**
 * RecordingBadge
 * ==============
 * Small floating "● Recording" indicator with pulsing dot and live timer.
 * Displayed fixed at top-right during an active recording session.
 */

import React from 'react';

interface RecordingBadgeProps {
  /** Elapsed time formatted as HH:MM:SS */
  elapsed: string;
  /** Optional callback to stop recording */
  onStop?: () => void;
}

export default function RecordingBadge({ elapsed, onStop }: RecordingBadgeProps) {
  return (
    <div
      style={{
        position: 'fixed',
        top: 20,
        right: 20,
        zIndex: 10000,
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        background: 'rgba(15, 23, 42, 0.92)',
        backdropFilter: 'blur(8px)',
        color: '#fff',
        padding: '10px 18px',
        borderRadius: 14,
        fontSize: 14,
        fontWeight: 700,
        fontFamily: 'inherit',
        boxShadow: '0 8px 30px rgba(0,0,0,0.25)',
        letterSpacing: '0.02em',
        animation: 'rec-badge-enter 0.3s ease-out',
      }}
    >
      {/* Pulsing red dot */}
      <span
        style={{
          position: 'relative',
          display: 'inline-flex',
          width: 10,
          height: 10,
        }}
      >
        <span
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: '50%',
            background: '#ef4444',
            animation: 'rec-dot-ping 1.2s cubic-bezier(0, 0, 0.2, 1) infinite',
            opacity: 0.6,
          }}
        />
        <span
          style={{
            position: 'relative',
            display: 'inline-block',
            width: 10,
            height: 10,
            borderRadius: '50%',
            background: '#ef4444',
          }}
        />
      </span>

      <span style={{ color: '#ef4444', fontWeight: 800 }}>REC</span>
      <span
        style={{
          fontVariantNumeric: 'tabular-nums',
          color: '#94a3b8',
          fontWeight: 600,
        }}
      >
        {elapsed}
      </span>

      {onStop && (
        <button
          onClick={onStop}
          style={{
            marginLeft: 8,
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#ef4444',
            color: '#fff',
            border: 'none',
            borderRadius: 8,
            padding: '4px 10px',
            fontSize: 12,
            fontWeight: 700,
            cursor: 'pointer',
            transition: 'background 0.2s',
          }}
          onMouseOver={(e) => (e.currentTarget.style.background = '#dc2626')}
          onMouseOut={(e) => (e.currentTarget.style.background = '#ef4444')}
        >
          Stop
        </button>
      )}

      {/* Keyframes */}
      <style>{`
        @keyframes rec-badge-enter {
          from { opacity: 0; transform: translateY(-8px) scale(0.95); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes rec-dot-ping {
          0%   { transform: scale(1); opacity: 0.6; }
          75%, 100% { transform: scale(2.2); opacity: 0; }
        }
      `}</style>
    </div>
  );
}
