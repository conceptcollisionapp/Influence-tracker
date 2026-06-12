"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
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

export function SearchBar({ autoFocus = false, size = "lg" }: { autoFocus?: boolean; size?: "lg" | "md" }) {
  const [q, setQ] = useState("");
  const [registry, setRegistry] = useState<RegistryHit[]>([]);
  const [wiki, setWiki] = useState<WikiHit[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [touched, setTouched] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (q.trim().length < 2) {
      setRegistry([]);
      setWiki([]);
      setTouched(false);
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
        setTouched(true);
      } catch {
        /* keep previous results on network hiccup */
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

  const hasResults = registry.length > 0 || wiki.length > 0;
  const showEmpty = touched && !loading && !hasResults && q.trim().length >= 2;
  const big = size === "lg";

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const term = q.trim();
    if (term.length < 2) return;
    setOpen(false);
    router.push(`/search?q=${encodeURIComponent(term)}`);
  }

  return (
    <div ref={boxRef} className="relative mx-auto w-full max-w-2xl">
      <form onSubmit={onSubmit}>
        <div className="relative">
          <span className={`pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 ${big ? "text-xl" : "text-base"} text-faint`}>
            🔍
          </span>
          <input
            autoFocus={autoFocus}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onFocus={() => hasResults && setOpen(true)}
            placeholder="Search any powerful person, billionaire, celebrity, or politician…"
            className={`w-full rounded-2xl border border-line bg-surface/90 pl-12 pr-12 text-fg placeholder-faint shadow-2xl shadow-black/40 outline-none ring-brand/0 transition focus:border-brand focus:ring-4 focus:ring-brand/15 ${
              big ? "py-4 text-base sm:text-lg" : "py-3 text-sm"
            }`}
          />
          {loading && (
            <span className="absolute right-4 top-1/2 -translate-y-1/2">
              <span className="block h-4 w-4 animate-spin rounded-full border-2 border-line border-t-brand" />
            </span>
          )}
        </div>
      </form>

      {open && (hasResults || showEmpty) && (
        <div className="absolute z-30 mt-2 w-full overflow-hidden rounded-2xl border border-line bg-surface-2 shadow-2xl shadow-black/50">
          {registry.length > 0 && (
            <Group label="Tracked profiles · full influence dossier">
              {registry.map((r) => (
                <Row key={r.slug} href={`/person/${r.slug}`} onPick={() => setOpen(false)} title={r.name} subtitle={r.title} tracked />
              ))}
            </Group>
          )}
          {wiki.length > 0 && (
            <Group label="Live public-records lookup · for anyone">
              {wiki.map((w) => (
                <Row key={w.title} href={`/lookup/${encodeURIComponent(w.title)}`} onPick={() => setOpen(false)} title={w.title} subtitle={w.description} />
              ))}
            </Group>
          )}
          {showEmpty && (
            <div className="px-4 py-6 text-center text-sm text-muted">
              <div className="mb-1 text-2xl">🤷</div>
              No matches for “{q}”. Try a full name like <em>Elon Musk</em> or <em>Taylor Swift</em>.
            </div>
          )}
          {hasResults && (
            <Link
              href={`/search?q=${encodeURIComponent(q.trim())}`}
              onClick={() => setOpen(false)}
              className="block border-t border-line bg-surface px-4 py-2.5 text-center text-xs font-medium text-brand-soft transition hover:bg-surface-3"
            >
              See all results for “{q.trim()}” →
            </Link>
          )}
        </div>
      )}
    </div>
  );
}

function Group({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="bg-surface px-4 py-2 text-[10px] font-semibold uppercase tracking-widest text-faint">{label}</p>
      {children}
    </div>
  );
}

function Row({
  href,
  title,
  subtitle,
  onPick,
  tracked = false,
}: {
  href: string;
  title: string;
  subtitle?: string;
  onPick: () => void;
  tracked?: boolean;
}) {
  return (
    <Link
      href={href}
      onClick={onPick}
      className="flex items-center gap-3 px-4 py-3 transition hover:bg-surface-3"
    >
      <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-full text-xs font-bold ${tracked ? "bg-brand/20 text-brand-soft" : "bg-surface-3 text-faint"}`}>
        {title.split(" ").map((w) => w[0]).slice(0, 2).join("")}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate font-medium text-fg">{title}</span>
        {subtitle && <span className="block truncate text-xs text-muted">{subtitle}</span>}
      </span>
      {tracked && <span className="shrink-0 text-[10px] font-medium uppercase tracking-wide text-brand-soft">Dossier →</span>}
    </Link>
  );
}
