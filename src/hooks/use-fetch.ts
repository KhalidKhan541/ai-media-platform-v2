import * as React from "react";

interface UseFetchOptions<T> {
  url: string;
  method?: string;
  body?: unknown;
  headers?: Record<string, string>;
  immediate?: boolean;
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
}

interface UseFetchReturn<T> {
  data: T | null;
  error: Error | null;
  isLoading: boolean;
  execute: () => Promise<void>;
}

function useFetch<T>({ url, method = "GET", body, headers = {}, immediate = true, onSuccess, onError }: UseFetchOptions<T>): UseFetchReturn<T> {
  const [data, setData] = React.useState<T | null>(null);
  const [error, setError] = React.useState<Error | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);

  const execute = React.useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json", ...headers },
        body: body ? JSON.stringify(body) : undefined,
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      const result: T = await res.json();
      setData(result);
      onSuccess?.(result);
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      setError(e);
      onError?.(e);
    } finally {
      setIsLoading(false);
    }
  }, [url, method, body, headers, onSuccess, onError]);

  React.useEffect(() => {
    if (immediate) execute();
  }, [immediate, execute]);

  return { data, error, isLoading, execute };
}

export { useFetch };
