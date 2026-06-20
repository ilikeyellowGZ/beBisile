type ApiErrorPayload = {
  error?: string;
  message?: string;
};

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
