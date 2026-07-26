type ApiErrorPayload = {
  error?: string;
  message?: string;
};

export class ApiError extends Error {
  constructor(message: string, public readonly status: number) {
    super(message);
    this.name = 'ApiError';
  }
}

export const API_BASE_URL = (import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');

const isAbsoluteUrl = (value: string) => /^https?:\/\//i.test(value);

export const apiUrl = (path: string) => {
  if (isAbsoluteUrl(path)) return path;

  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  if (!API_BASE_URL) return normalizedPath;

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

      throw new ApiError(response.ok ? fallbackMessage : `${fallbackMessage} (${response.status} ${response.statusText})`, response.status);
    }
  }

  if (!response.ok) {
    const errorPayload = payload as ApiErrorPayload;
    throw new ApiError(errorPayload.message || errorPayload.error || `${fallbackMessage} (${response.status} ${response.statusText})`, response.status);
  }

  return payload as T;
};
