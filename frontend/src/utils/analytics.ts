/**
 * Lightweight, framework-agnostic analytics helper.
 *
 * Emits events to whichever provider is available at runtime (Google
 * Analytics / gtag, a `dataLayer` from GTM, Segment's `analytics`, or a
 * PostHog instance). When none is present it falls back to a namespaced
 * `console.debug` so events are still observable in development.
 *
 * Add or swap providers here without touching feature code.
 */

export type AnalyticsPayload = Record<string, unknown>;

type Gtag = (command: 'event', action: string, params?: AnalyticsPayload) => void;

interface AnalyticsWindow extends Window {
  gtag?: Gtag;
  dataLayer?: AnalyticsPayload[];
  analytics?: { track?: (event: string, props?: AnalyticsPayload) => void };
  posthog?: { capture?: (event: string, props?: AnalyticsPayload) => void };
}

/**
 * Track a single analytics event. Safe to call on the server (no-op) and
 * never throws — analytics must never break the UI.
 */
export function trackEvent(event: string, payload: AnalyticsPayload = {}): void {
  if (typeof window === 'undefined') return;

  const win = window as AnalyticsWindow;
  const enriched: AnalyticsPayload = {
    ...payload,
    timestamp: new Date().toISOString(),
  };

  try {
    if (typeof win.gtag === 'function') {
      win.gtag('event', event, enriched);
    } else if (Array.isArray(win.dataLayer)) {
      win.dataLayer.push({ event, ...enriched });
    } else if (win.analytics?.track) {
      win.analytics.track(event, enriched);
    } else if (win.posthog?.capture) {
      win.posthog.capture(event, enriched);
    } else if (process.env.NODE_ENV !== 'production') {
      console.debug(`[analytics] ${event}`, enriched);
    }

  } catch {
    // Swallow — analytics failures should never surface to users.
  }
}
