"use client";

import { useEffect, useState } from "react";
import type { ApiEnvelope } from "@/lib/types";

/** Client fetch hook for our API envelope, with optional polling for live data. */
export function useApi<T>(url: string | null, pollMs?: number) {
  const [state, setState] = useState<{ env?: ApiEnvelope<T>; loading: boolean; error?: string }>({
    loading: Boolean(url),
  });

  useEffect(() => {
    if (!url) return;
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | undefined;

    const load = async () => {
      try {
        const res = await fetch(url);
        if (!res.ok) throw new Error(`API ${res.status}`);
        const env = (await res.json()) as ApiEnvelope<T>;
        if (!cancelled) setState({ env, loading: false });
      } catch (e) {
        if (!cancelled) setState((s) => ({ ...s, loading: false, error: e instanceof Error ? e.message : String(e) }));
      }
      if (pollMs && !cancelled) timer = setTimeout(load, pollMs);
    };
    setState({ loading: true });
    load();
    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
    };
  }, [url, pollMs]);

  return state;
}
