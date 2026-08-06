/**
 * In-flight request de-duplication
 * ---------------------------------
 * Coalesces identical, concurrent idempotent (GET) requests so that only ONE
 * network round-trip happens while a request is already in flight. Any extra
 * caller that arrives before the first settles receives the SAME pending
 * promise.
 *
 * This is NOT a time-based cache: the moment a request settles (resolve OR
 * reject) its key is released, so a later fetch — e.g. a manual "Refresh" —
 * always hits the network again.
 *
 * Why this exists
 * ---------------
 * React 18 StrictMode intentionally mounts -> unmounts -> remounts every
 * component in development, which fires each data-loading `useEffect` twice.
 * Without coalescing, a single page load produces duplicate GETs (clearly
 * visible in the backend request logs). De-duping keeps the network clean in
 * development WITHOUT disabling StrictMode's safety checks, and also guards
 * against accidental duplicate fetches from multiple components in production.
 */

const inFlight = new Map<string, Promise<unknown>>();

/**
 * Share a single in-flight promise across concurrent callers using the same
 * `key`. The `factory` is invoked only when no request is currently pending for
 * that key.
 */
export const dedupeInFlight = <T>(key: string, factory: () => Promise<T>): Promise<T> => {
  const existing = inFlight.get(key) as Promise<T> | undefined;
  if (existing) {
    return existing;
  }

  const request = (async () => {
    try {
      return await factory();
    } finally {
      // Release the key as soon as the request settles so subsequent calls are
      // never served stale data — only truly concurrent calls are coalesced.
      inFlight.delete(key);
    }
  })();

  inFlight.set(key, request);
  return request;
};

/** Number of requests currently being coalesced (primarily for tests/debug). */
export const pendingRequestCount = () => inFlight.size;

/** Clear any pending coalesced requests (primarily for tests). */
export const clearInFlightRequests = () => {
  inFlight.clear();
};
