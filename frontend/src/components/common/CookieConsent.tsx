'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Cookie, X } from 'lucide-react';
import { trackEvent } from '@/utils/analytics';

const STORAGE_KEY = 'edmarg_cookie_consent';

type ConsentValue = 'accepted' | 'declined';

/**
 * CookieConsent — a slim, minimalist cookie notice pinned to the bottom of the
 * viewport. It appears once per visitor and remembers the choice in
 * localStorage so it never nags returning users. Accepting or declining both
 * dismiss the banner; the choice is surfaced via analytics.
 */
export function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (!stored) {
        // Small delay so it eases in after the page settles.
        const timer = window.setTimeout(() => setVisible(true), 600);
        return () => window.clearTimeout(timer);
      }
    } catch {
      // If storage is unavailable, still show the notice.
      setVisible(true);
    }
  }, []);

  const persist = (value: ConsentValue) => {
    try {
      window.localStorage.setItem(STORAGE_KEY, value);
    } catch {
      // Ignore storage failures — dismissal still works for this session.
    }
    setVisible(false);
    trackEvent('cookie_consent', { choice: value });
  };

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-live="polite"
      aria-label="Cookie consent"
      className="fixed inset-x-0 bottom-0 z-[60] flex justify-center px-4 pb-4 sm:px-6 sm:pb-6"
    >
      <div className="pointer-events-auto flex w-full max-w-3xl flex-col gap-3 rounded-2xl border border-outline-variant/40 bg-surface-container-lowest/95 p-4 shadow-ambient backdrop-blur-md sm:flex-row sm:items-center sm:gap-4 sm:p-5">
        <div className="flex items-start gap-3">
          <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-container text-primary">
            <Cookie size={18} aria-hidden="true" />
          </span>
          <p className="text-[13px] leading-relaxed text-on-surface-variant sm:text-sm">
            We use cookies to enhance your experience and analyze site usage. Read our{' '}
            <Link
              href="/privacy"
              className="font-medium text-primary underline-offset-2 hover:underline"
            >
              Privacy Policy
            </Link>
            .
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-2 sm:ml-auto">
          <button
            type="button"
            onClick={() => persist('declined')}
            className="rounded-full px-4 py-2 text-[13px] font-medium text-on-surface-variant transition-colors hover:bg-surface-container focus:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
          >
            Decline
          </button>
          <button
            type="button"
            onClick={() => persist('accepted')}
            className="rounded-full bg-primary px-5 py-2 text-[13px] font-semibold text-on-primary transition-colors hover:bg-primary-dim focus:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
          >
            Accept
          </button>
        </div>

        <button
          type="button"
          onClick={() => persist('declined')}
          aria-label="Dismiss cookie notice"
          className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full text-on-surface-variant transition-colors hover:bg-surface-container hover:text-on-surface focus:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 sm:hidden"
        >
          <X size={16} aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}

export default CookieConsent;
