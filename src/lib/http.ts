/** Shared fetch helper for upstream public-data APIs: timeouts + JSON + soft failures. */

const DEFAULT_TIMEOUT_MS = 10_000;

export interface FetchResult<T> {
  ok: boolean;
  data?: T;
  error?: string;
  status?: number;
}

export async function fetchJson<T>(
  url: string,
  init: RequestInit & { timeoutMs?: number } = {},
): Promise<FetchResult<T>> {
  const { timeoutMs = DEFAULT_TIMEOUT_MS, ...rest } = init;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      ...rest,
      signal: controller.signal,
      headers: {
        accept: "application/json",
        // Many public APIs (Wikimedia, SEC) want a descriptive UA.
        "user-agent": SEC_USER_AGENT,
        ...rest.headers,
      },
      // Upstream data is cached by our own TTL cache; don't double-cache.
      cache: "no-store",
    });
    if (!res.ok) {
      return { ok: false, status: res.status, error: `${new URL(url).hostname} responded ${res.status}` };
    }
    return { ok: true, status: res.status, data: (await res.json()) as T };
  } catch (err) {
    const msg = err instanceof Error ? (err.name === "AbortError" ? "timed out" : err.message) : String(err);
    return { ok: false, error: `${new URL(url).hostname}: ${msg}` };
  } finally {
    clearTimeout(timer);
  }
}

export const SEC_USER_AGENT =
  process.env.SEC_USER_AGENT ?? "InfluenceTracker/1.0 (research app; set SEC_USER_AGENT)";

export const FEC_API_KEY = process.env.FEC_API_KEY ?? "DEMO_KEY";
