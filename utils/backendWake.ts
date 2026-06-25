const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? '').replace(/\/$/, '');
const WAKE_TOKEN = import.meta.env.VITE_BACKEND_WAKE_TOKEN ?? '';

const protectedHealthUrl = `${API_BASE_URL}/api/health/protected`;

let wakePromise: Promise<boolean> | null = null;
let lastReadyAt = 0;
const READY_TTL_MS = 60_000;

const logWakeError = (error: unknown) => {
  if (import.meta.env.DEV) console.warn('BISILE backend wake check failed.', error);
};

const protectedHeaders = () => ({
  ...(WAKE_TOKEN ? { Authorization: `Bearer ${WAKE_TOKEN}` } : {}),
});

export const getBackendWakeToken = () => WAKE_TOKEN;

export const wakeBackend = async (retries = 2): Promise<boolean> => {
  if (Date.now() - lastReadyAt < READY_TTL_MS) return true;
  if (wakePromise) return wakePromise;

  wakePromise = (async () => {
    for (let attempt = 0; attempt <= retries; attempt += 1) {
      try {
        const response = await fetch(protectedHealthUrl, {
          cache: 'no-store',
          headers: protectedHeaders(),
        });
        if (response.ok) {
          lastReadyAt = Date.now();
          return true;
        }
      } catch (error) {
        logWakeError(error);
      }

      if (attempt < retries) await new Promise((resolve) => window.setTimeout(resolve, 1400 + attempt * 900));
    }

    return false;
  })().finally(() => {
    wakePromise = null;
  });

  return wakePromise;
};

export const ensureBackendReady = async () => {
  const ready = await wakeBackend(3);
  if (!ready) throw new Error('Payment service is starting. Please try again in a few seconds.');
};
