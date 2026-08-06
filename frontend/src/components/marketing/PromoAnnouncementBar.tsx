'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { X, ArrowRight, Sparkles } from 'lucide-react';
import { trackEvent } from '@/utils/analytics';

export interface PromoAnnouncementBarProps {

  /** Where clicking the message takes the user. */
  href?: string;
  /** The promotional message. */
  message?: string;
  /** Short call-to-action label shown after the message. */
  ctaLabel?: string;
}

/**
 * PromoAnnouncementBar — a slim, minimalist SaaS-style promo strip that sits
 * at the very top of the navbar. Clicking the message navigates to the offer;
 * the X closes it for the current view. It reappears on every visit / reload
 * since the dismissal is not persisted.
 */
export function PromoAnnouncementBar({
  href = '/browse-mentors',
  message = 'Get up to 50% off your first mentorship session',
  ctaLabel = 'Claim offer',
}: PromoAnnouncementBarProps) {
  // Shown on every mount — the X only hides it until the next page load/visit.
  const [visible, setVisible] = useState(true);

  const handleDismiss = () => {
    setVisible(false);
    trackEvent('promo_bar_dismissed');
  };


  if (!visible) return null;

  return (
    <div className="relative w-full bg-gradient-to-r from-primary via-secondary to-primary text-white">
      <div className="mx-auto flex max-w-7xl items-center justify-center gap-2 px-10 py-2 sm:px-12">
        <Link
          href={href}
          onClick={() => trackEvent('promo_bar_clicked', { href })}
          className="group flex items-center justify-center gap-2 text-center text-[12.5px] font-medium tracking-tight transition-opacity hover:opacity-90 sm:text-sm"
        >
          <Sparkles size={15} className="shrink-0 opacity-90" aria-hidden="true" />
          <span>{message}</span>
          <span className="hidden items-center gap-1 font-semibold underline-offset-4 group-hover:underline sm:inline-flex">
            {ctaLabel}
            <ArrowRight
              size={14}
              className="transition-transform group-hover:translate-x-0.5"
              aria-hidden="true"
            />
          </span>
        </Link>
      </div>

      <button
        type="button"
        onClick={handleDismiss}
        aria-label="Dismiss announcement"
        className="absolute right-2 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full text-white/80 transition-colors hover:bg-white/15 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60 sm:right-3"
      >
        <X size={16} aria-hidden="true" />
      </button>
    </div>
  );
}

export default PromoAnnouncementBar;
