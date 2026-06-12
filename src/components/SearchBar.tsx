"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

interface RegistryHit {
  slug: string;
  name: string;
  title: string;
  category: string;
}
interface WikiHit {
  title: string;
  description?: string;
  pageUrl: string;
}

export function SearchBar({ autoFocus = false }: { autoFocus?: boolean }) {
  const [q, setQ] = useState("");
  const [registry, setRegistry] = useState<RegistryHit[]>([]);
  const [wiki, setWiki] = useState<WikiHit[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (q.trim().length < 2) {
      setRegistry([]);
      setWiki([]);
      return;
    }
    const t = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
        const json = await res.json();
        setRegistry(json.data?.registry ?? []);
        setWiki(json.data?.wiki ?? []);
        setOpen(true);
      } catch {
        /* network hiccup; keep previous results */
      } finally {
        setLoading(false);
      }
    }, 250);
    return () => clearTimeout(t);
  }, [q]);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  return (
    <div ref={boxRef} className="relative mx-auto w-full max-w-2xl">
      <input
        autoFocus={autoFocus}
        value={q}
        onChange={(e) => setQ(e.target.value)}
        onFocus={() => (registry.length || wiki.length) && setOpen(true)}
        placeholder="Search any billionaire, celebrity, or politician…"
        className="w-full rounded-xl border border-edge bg-panel px-5 py-4 text-lg text-white placeholder-slate-500 shadow-xl shadow-black/30 outline-none transition focus:border-accent"
      />
      {loading && (
        <span className="absolute right-4 top-1/2 -translate-y-1/2 animate-pulse text-xs text-slate-400">searching…</span>
      )}
      {open && (registry.length > 0 || wiki.length > 0) && (
        <div className="absolute z-30 mt-2 w-full overflow-hidden rounded-xl border border-edge bg-panel-2 shadow-2xl">
          {registry.length > 0 && (
            <div>
              <p className="bg-panel px-4 py-1.5 text-[10px] uppercase tracking-widest text-slate-400">
                Tracked profiles — full influence dossier
              </p>
              {registry.map((r) => (
                <Link
                  key={r.slug}
                  href={`/person/${r.slug}`}
                  onClick={() => setOpen(false)}
                  className="flex items-baseline justify-between gap-3 px-4 py-2.5 hover:bg-panel"
                >
                  <span className="font-medium text-white">{r.name}</span>
                  <span className="truncate text-xs text-slate-400">{r.title}</span>
                </Link>
              ))}
            </div>
          )}
          {wiki.length > 0 && (
            <div>
              <p className="bg-panel px-4 py-1.5 text-[10px] uppercase tracking-widest text-slate-400">
                Live lookup — public records search for anyone
              </p>
              {wiki.map((w) => (
                <Link
                  key={w.title}
                  href={`/lookup/${encodeURIComponent(w.title)}`}
                  onClick={() => setOpen(false)}
                  className="flex items-baseline justify-between gap-3 px-4 py-2.5 hover:bg-panel"
                >
                  <span className="font-medium text-white">{w.title}</span>
                  <span className="truncate text-xs text-slate-400">{w.description}</span>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
