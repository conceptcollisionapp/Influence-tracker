/**
 * Tiny in-memory TTL cache for server-side API responses.
 * Keeps upstream public APIs happy (rate limits) while staying near-real-time.
 */
interface Entry<T> {
  value: T;
  expires: number;
  storedAt: string;
}

const store = new Map<string, Entry<unknown>>();

export function cacheGet<T>(key: string): { value: T; storedAt: string } | undefined {
  const hit = store.get(key);
  if (!hit) return undefined;
  if (Date.now() > hit.expires) {
    store.delete(key);
    return undefined;
  }
  return { value: hit.value as T, storedAt: hit.storedAt };
}

export function cacheSet<T>(key: string, value: T, ttlMs: number): void {
  store.set(key, { value, expires: Date.now() + ttlMs, storedAt: new Date().toISOString() });
}

/** Fetch-through helper: return cached value or compute and cache it. */
export async function cached<T>(key: string, ttlMs: number, fn: () => Promise<T>): Promise<T> {
  const hit = cacheGet<T>(key);
  if (hit) return hit.value;
  const value = await fn();
  cacheSet(key, value, ttlMs);
  return value;
}

export const TTL = {
  /** Live aircraft positions move fast. */
  flights: 60 * 1000,
  /** Aircraft registration metadata barely changes. */
  aircraftMeta: 24 * 60 * 60 * 1000,
  /** Campaign-finance + lobbying data updates on filing schedules. */
  donations: 30 * 60 * 1000,
  nonprofits: 6 * 60 * 60 * 1000,
  filings: 30 * 60 * 1000,
  profile: 60 * 60 * 1000,
} as const;
