/**
 * Backend Readiness Gate
 * ======================
 * The API is deployed on Render, where an idle instance hibernates and the
 * first request that arrives afterwards can fail at the edge proxy with a bare
 * 503 (`x-render-routing: hibernate-wake-error`) before the app ever runs.
 * Such a response carries no CORS headers, so the browser reports it as an
 * opaque CORS/network error rather than a 503.
 *
 * Hitting the cheap unauthenticated `/health` route first lets the instance
 * boot against a request we are happy to retry, instead of against a 500 MB
 * video upload that cannot be replayed.
 */

import { resolveBackendBaseUrl } from '@/utils/api-base';

const HEALTH_PATH = '/api/v1/health';
const PROBE_TIMEOUT_MS = 10_000;
const DEFAULT_MAX_WAIT_MS = 90_000;

/**
 * Successful probes stay valid for this long. A warm instance only hibernates
 * after minutes of inactivity, so re-probing on every call would add a
 * round-trip to each request for no benefit.
 */
const READY_TTL_MS = 60_000;

let readyUntil = 0;
let inFlightProbe: Promise<boolean> | null = null;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const probeOnce = async (): Promise<boolean> => {
  const baseUrl = (resolveBackendBaseUrl() || '').replace(/\/api\/v1\/?$/, '');
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), PROBE_TIMEOUT_MS);

  try {
    const response = await fetch(`${baseUrl}${HEALTH_PATH}`, {
      method: 'GET',
      cache: 'no-store',
      signal: controller.signal,
    });
    return response.ok;
  } catch {
    return false;
  } finally {
    clearTimeout(timer);
  }
};

/**
 * Resolve once the backend answers a health check, or after `maxWaitMs`.
 *
 * Returns `true` when the instance is confirmed awake. A `false` result means
 * the wait budget ran out — callers should still attempt their request, since
 * the probe itself may have been blocked by something unrelated to hibernation.
 */
export const ensureBackendAwake = async (
  maxWaitMs: number = DEFAULT_MAX_WAIT_MS
): Promise<boolean> => {
  if (Date.now() < readyUntil) {
    return true;
  }

  if (inFlightProbe) {
    return inFlightProbe;
  }

  inFlightProbe = (async () => {
    const deadline = Date.now() + maxWaitMs;
    let attempt = 0;

    while (Date.now() < deadline) {
      if (await probeOnce()) {
        readyUntil = Date.now() + READY_TTL_MS;
        return true;
      }

      attempt += 1;
      // 1s, 2s, 4s, 8s, capped at 8s — a cold start takes roughly 30-60s.
      const backoffMs = Math.min(1000 * 2 ** (attempt - 1), 8000);
      if (Date.now() + backoffMs >= deadline) {
        break;
      }
      await sleep(backoffMs);
    }

    return false;
  })().finally(() => {
    inFlightProbe = null;
  });

  return inFlightProbe;
};

/**
 * Drop the cached "awake" flag. Call this after a request fails in a way that
 * suggests the instance went down, so the next call re-probes instead of
 * trusting a stale success.
 */
export const invalidateBackendReadiness = () => {
  readyUntil = 0;
};

/**
 * Whether a failed request looks like the backend being asleep, restarting, or
 * otherwise briefly unreachable — as opposed to a genuine application error.
 *
 * Status 0 covers the case this module exists for: the edge proxy answered
 * without CORS headers, so the browser hid the real status from us.
 */
export const isBackendUnavailableStatus = (status: number) =>
  status === 0 || status === 502 || status === 503 || status === 504;
