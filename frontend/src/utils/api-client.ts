import { resolveApiBaseUrl } from '@/utils/api-base';

const API_BASE_URL = resolveApiBaseUrl();

const getStoredToken = () => {
  if (typeof window === 'undefined') {
    return null;
  }
  return window.localStorage.getItem('token');
};

const clearAuthTokenCookie = () => {
  if (typeof window === 'undefined') {
    return;
  }

  document.cookie = 'auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT; SameSite=Lax';
  document.cookie = 'accessToken=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT; SameSite=Lax';
};

interface RequestOptions extends RequestInit {
  params?: Record<string, string | number | boolean>;
}

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  page?: number;
  pages?: number;
  total?: number;
  count?: number;
}

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

    try {
      const headers = new Headers(fetchOptions.headers);
      const token = getStoredToken();
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

      const data = await response.json();

      if (response.status === 401) {
        if (typeof window !== 'undefined') {
          window.localStorage.removeItem('token');
          window.localStorage.removeItem('user');
          clearAuthTokenCookie();
          window.dispatchEvent(new Event('edmarg-auth-user-change'));
          // Only redirect if not already on login page
          if (window.location.pathname !== '/login') {
            window.location.href = '/login?session_expired=true';
          }
        }
      }

      if (!response.ok) {
        throw new Error(data.message || data.error || 'Request failed');
      }

      return data;
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
