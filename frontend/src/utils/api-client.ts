import { resolveApiBaseUrl } from '@/utils/api-base';
import { getAuthToken } from '@/utils/auth-session';
import { dedupeInFlight } from '@/utils/request-dedupe';
import {
  ensureBackendAwake,
  invalidateBackendReadiness,
  isBackendUnavailableStatus,
} from '@/utils/backend-ready';

const API_BASE_URL = resolveApiBaseUrl();

/**
 * Total attempts for a request that fails in a way the backend platform is
 * expected to recover from on its own (cold start, proxy 502, rolling restart).
 */
const MAX_ATTEMPTS = 3;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Requests that can be replayed without risking a duplicate side effect.
 * A retried POST could create two bookings, so unsafe methods are only retried
 * when the failure happened before the request could have been processed.
 */
const IDEMPOTENT_METHODS = new Set(['GET', 'HEAD', 'OPTIONS', 'PUT', 'DELETE']);


interface RequestOptions extends RequestInit {
  params?: Record<string, string | number | boolean>;
}

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  errors?: unknown;
  page?: number;
  pages?: number;
  total?: number;
  count?: number;
  status?: number;
  retryAfterSeconds?: number;
}

const readResponseBody = async (response: Response): Promise<Record<string, unknown>> => {
  const rawBody = await response.text();

  if (!rawBody) {
    return {};
  }

  try {
    const parsed = JSON.parse(rawBody);
    return parsed && typeof parsed === 'object' ? (parsed as Record<string, unknown>) : {};
  } catch {
    return {
      message: rawBody,
    };
  }
};

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = (API_BASE_URL || '').replace(/\/api\/v1\/?$/, '')) {
    this.baseUrl = baseUrl;
  }

  private buildUrl(endpoint: string, params?: Record<string, string | number | boolean>): string {
    const url = new URL(`${this.baseUrl}${endpoint}`);
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.append(key, String(value));
      });
    }
    return url.toString();
  }

  async request<T>(
    endpoint: string,
    options: RequestOptions = {}
  ): Promise<ApiResponse<T>> {
    const { params, ...fetchOptions } = options;
    const url = this.buildUrl(endpoint, params);
    const method = (fetchOptions.method ?? 'GET').toUpperCase();

    // Only idempotent GETs are coalesced. POST/PUT/PATCH/DELETE always execute
    // so side effects are never dropped when two callers overlap (e.g. React
    // StrictMode's double-invoked effects in development).
    if (method === 'GET') {
      return dedupeInFlight(`GET:${url}`, () =>
        this.executeWithRetry<T>(url, fetchOptions, method)
      );
    }

    return this.executeWithRetry<T>(url, fetchOptions, method);
  }

  /**
   * Run a request, retrying transient backend-unavailable failures.
   *
   * The API runs on a platform that hibernates idle instances; the first
   * request after that can be rejected by the edge proxy with a 502/503 that
   * carries no CORS headers, which the browser surfaces as an opaque network
   * error. Retrying here keeps a cold start from looking like a real failure.
   */
  private async executeWithRetry<T>(
    url: string,
    fetchOptions: RequestInit,
    method: string
  ): Promise<ApiResponse<T>> {
    let lastResponse: ApiResponse<T> | null = null;

    for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt += 1) {
      const response = await this.execute<T>(url, fetchOptions);
      lastResponse = response;

      const status = response.status ?? 0;
      if (response.success || !isBackendUnavailableStatus(status)) {
        return response;
      }

      // A status of 0 means the request never got a usable response, so
      // replaying it cannot duplicate a side effect. Any other transient status
      // came from the server, so only idempotent methods are safe to repeat.
      const canRetry = status === 0 || IDEMPOTENT_METHODS.has(method);
      if (!canRetry || attempt === MAX_ATTEMPTS) {
        return response;
      }

      invalidateBackendReadiness();

      // Honour the server's own Retry-After hint when it sent one.
      const serverDelayMs = (response.retryAfterSeconds ?? 0) * 1000;
      await sleep(Math.max(serverDelayMs, 1000 * attempt));
      await ensureBackendAwake(30_000);
    }

    return (
      lastResponse ?? {
        success: false,
        error: 'Request failed',
        message: 'Request failed',
      }
    );
  }

  private async execute<T>(
    url: string,
    fetchOptions: RequestInit
  ): Promise<ApiResponse<T>> {

    try {
      const headers = new Headers(fetchOptions.headers);
      const token = await getAuthToken();
      const hasBody = fetchOptions.body !== undefined && fetchOptions.body !== null;
      const isFormDataBody =
        typeof FormData !== 'undefined' && fetchOptions.body instanceof FormData;

      if (hasBody && !isFormDataBody && !headers.has('Content-Type')) {
        headers.set('Content-Type', 'application/json');
      }
      if (!hasBody) {
        headers.delete('Content-Type');
      }

      if (token && !headers.has('Authorization')) {
        headers.set('Authorization', `Bearer ${token}`);
      }

      const response = await fetch(url, {
        credentials: 'include',
        ...fetchOptions,
        headers,
      });

      const data = await readResponseBody(response);

      if (!response.ok) {
        const message =
          typeof data.message === 'string'
            ? data.message
            : typeof data.error === 'string'
              ? data.error
              : 'Request failed';

        return {
          success: false,
          error: message,
          message,
          errors: data.errors,
          status: response.status,
          retryAfterSeconds:
            typeof data.retryAfterSeconds === 'number' ? data.retryAfterSeconds : undefined,
        };
      }

      return {
        ...(data as unknown as ApiResponse<T>),
        success: typeof data.success === 'boolean' ? data.success : true,
        status: response.status,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  get<T>(endpoint: string, options?: RequestOptions): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: 'GET' });
  }

  post<T>(endpoint: string, body?: unknown, options?: RequestOptions): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  }

  put<T>(endpoint: string, body?: unknown, options?: RequestOptions): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  }

  patch<T>(endpoint: string, body?: unknown, options?: RequestOptions): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  }

  delete<T>(endpoint: string, options?: RequestOptions): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' });
  }
}

export const apiClient = new ApiClient();
