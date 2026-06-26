import { apiUrl } from './http';

const healthUrl = apiUrl('/api/health');

let wakePromise: Promise<boolean> | null = null;
let lastReadyAt = 0;
const READY_TTL_MS = 60_000;
const DEFAULT_TIMEOUT_MS = 30_000;
const RETRY_DELAY_MS = 2_000;

const logWakeError = (error: unknown) => {
  if (import.meta.env.DEV) console.warn('BISILE backend wake check failed.', error);
};

const wait = (ms: number, signal?: AbortSignal) => new Promise<void>((resolve, reject) => {
  if (signal?.aborted) {
    reject(signal.reason ?? new DOMException('Request aborted', 'AbortError'));
    return;
  }

  const timeoutId = window.setTimeout(resolve, ms);
  signal?.addEventListener('abort', () => {
    window.clearTimeout(timeoutId);
    reject(signal.reason ?? new DOMException('Request aborted', 'AbortError'));
  }, { once: true });
});

type WakeBackendOptions = {
  timeoutMs?: number;
  retryDelayMs?: number;
  signal?: AbortSignal;
};

export const wakeBackend = async (options: WakeBackendOptions = {}): Promise<boolean> => {
  if (Date.now() - lastReadyAt < READY_TTL_MS) return true;
  if (wakePromise) return wakePromise;

  const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  const retryDelayMs = options.retryDelayMs ?? RETRY_DELAY_MS;
  const startedAt = Date.now();

  wakePromise = (async () => {
    while (Date.now() - startedAt <= timeoutMs) {
      try {
        console.info('BISILE backend wake request', { url: healthUrl });
        const response = await fetch(healthUrl, {
          cache: 'no-store',
          signal: options.signal,
        });

        if (response.ok) {
          console.info('BISILE backend health response', { status: response.status });
          lastReadyAt = Date.now();
          return true;
        }

        console.warn('BISILE backend health request was not ready', {
          status: response.status,
          statusText: response.statusText,
        });
      } catch (error) {
        if (options.signal?.aborted) throw error;
        logWakeError(error);
      }

      if (Date.now() - startedAt + retryDelayMs <= timeoutMs) {
        await wait(retryDelayMs, options.signal);
      } else {
        break;
      }
    }

    return false;
  })().finally(() => {
    wakePromise = null;
  });

  return wakePromise;
};

export const ensureBackendReady = async (options: WakeBackendOptions = {}) => {
  const ready = await wakeBackend({ timeoutMs: DEFAULT_TIMEOUT_MS, retryDelayMs: RETRY_DELAY_MS, ...options });
  if (!ready) throw new Error('Unable to connect to our payment service. Please try again shortly.');
};
