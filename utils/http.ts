type ApiErrorPayload = {
  error?: string;
  message?: string;
};

export const API_BASE_URL = (import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');

const isAbsoluteUrl = (value: string) => /^https?:\/\//i.test(value);

export const apiUrl = (path: string) => {
  if (isAbsoluteUrl(path)) return path;

  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  if (!API_BASE_URL) {
    if (import.meta.env.PROD) throw new Error('VITE_API_URL is required for production API requests.');
    return normalizedPath;
  }

  return `${API_BASE_URL}${normalizedPath}`;
};

export const configuredApiUrl = (override: string | undefined, fallbackPath: string) => {
  const value = override?.trim();
  return apiUrl(value || fallbackPath);
};

console.info('BISILE VITE_API_URL', API_BASE_URL || '(using local dev proxy)');

export const readJsonResponse = async <T>(response: Response, fallbackMessage: string): Promise<T> => {
  const text = await response.text();
  let payload: unknown = {};

  if (text) {
    try {
      payload = JSON.parse(text);
    } catch {
      if (import.meta.env.DEV) {
        console.error('Non-JSON API response', {
          status: response.status,
          statusText: response.statusText,
          body: text.slice(0, 500),
        });
      }

      throw new Error(response.ok ? fallbackMessage : `${fallbackMessage} (${response.status} ${response.statusText})`);
    }
  }

  if (!response.ok) {
    const errorPayload = payload as ApiErrorPayload;
    throw new Error(errorPayload.message || errorPayload.error || `${fallbackMessage} (${response.status} ${response.statusText})`);
  }

  return payload as T;
};
