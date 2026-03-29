import { useState, useCallback } from 'react';
import { apiClient } from '@/utils/api-client';

interface UseApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

interface UseApiReturn<T> extends UseApiState<T> {
  execute: (endpoint: string, options?: RequestInit & { params?: Record<string, string | number | boolean> }) => Promise<T | null>;
  reset: () => void;
}

export const useApi = <T>(): UseApiReturn<T> => {
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  const execute = useCallback(
    async (endpoint: string, options?: RequestInit & { params?: Record<string, string | number | boolean> }): Promise<T | null> => {
      setState({ data: null, loading: true, error: null });

      try {
        const response = await apiClient.request<T>(endpoint, options);

        if (!response.success) {
          const error = response.error || 'Request failed';
          setState({ data: null, loading: false, error });
          return null;
        }

        setState({ data: response.data || null, loading: false, error: null });
        return response.data || null;
      } catch (err) {
        const error = err instanceof Error ? err.message : 'Unknown error';
        setState({ data: null, loading: false, error });
        return null;
      }
    },
    []
  );

  const reset = useCallback(() => {
    setState({ data: null, loading: false, error: null });
  }, []);

  return { ...state, execute, reset };
};
