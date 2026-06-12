"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { SearchBar } from "./SearchBar";
import { CategoryBadge, EmptyState, Money, Skeleton } from "./Ui";

interface RegistryHit {
  slug: string;
  name: string;
  title: string;
  category: string;
  netWorthUSDBillion?: number;
  score: number;
}
interface WikiHit {
  title: string;
  description?: string;
  thumbnail?: string;
  pageUrl: string;
}

function scoreColor(s: number) {
  const hue = 214 - Math.min(100, Math.max(0, s)) * 1.5;
  return `hsl(${hue} 90% 62%)`;
}

export function SearchResults() {
  const params = useSearchParams();
  const router = useRouter();
  const q = params.get("q") ?? "";
  const [data, setData] = useState<{ registry: RegistryHit[]; wiki: WikiHit[] } | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (q.trim().length < 2) {
      setData(null);
      return;
    }
    let cancelled = false;
    setLoading(true);
    fetch(`/api/search?q=${encodeURIComponent(q)}`)
      .then((r) => r.json())
      .then((j) => !cancelled && setData(j.data))
      .catch(() => !cancelled && setData({ registry: [], wiki: [] }))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [q]);

  const total = (data?.registry.length ?? 0) + (data?.wiki.length ?? 0);

  return (
    <div className="space-y-7">
      <div>
        <h1 className="mb-3 text-2xl font-bold tracking-tight">Search</h1>
        <SearchBar size="md" />
      </div>

      {q.trim().length < 2 ? (
        <EmptyState icon="🔎" title="Search for a powerful person">
          Try a full name like <em>Elon Musk</em>, <em>Warren Buffett</em>, or <em>Nancy Pelosi</em>.
        </EmptyState>
      ) : loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full rounded-2xl" />
          ))}
        </div>
      ) : total === 0 ? (
        <EmptyState icon="🤷" title={`No results for “${q}”`}>
          Check the spelling, or try a full name. We track public figures with a documented public footprint.
        </EmptyState>
      ) : (
        <>
          <p className="text-sm text-muted">
            {total} result{total === 1 ? "" : "s"} for <span className="text-fg">“{q}”</span>
          </p>

          {data!.registry.length > 0 && (
            <section className="space-y-3">
              <h2 className="text-[13px] font-semibold uppercase tracking-wider text-faint">
                Tracked profiles · full dossier
              </h2>
              {data!.registry.map((r) => (
                <div
                  key={r.slug}
                  className="card flex items-center gap-4 p-4 transition hover:border-brand/40"
                >
                  <div
                    className="grid h-14 w-14 shrink-0 place-items-center rounded-full text-lg font-bold tabular-nums"
                    style={{ background: `conic-gradient(${scoreColor(r.score)} ${r.score * 3.6}deg, var(--color-surface-3) 0deg)` }}
                    title={`Influence Score ${r.score}/100`}
                  >
                    <span className="grid h-11 w-11 place-items-center rounded-full bg-bg text-sm">{Math.round(r.score)}</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="truncate font-semibold text-fg">{r.name}</h3>
                      <CategoryBadge category={r.category} />
                    </div>
                    <p className="truncate text-sm text-muted">{r.title}</p>
                    <p className="mt-0.5 text-xs text-faint">
                      Influence Score <span className="font-semibold text-gold">{r.score}</span> · net worth ≈{" "}
                      <Money usd={(r.netWorthUSDBillion ?? 0) * 1e9} />
                    </p>
                  </div>
                  <Link
                    href={`/person/${r.slug}`}
                    className="shrink-0 rounded-xl bg-brand px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand/85"
                  >
                    View Profile →
                  </Link>
                </div>
              ))}
            </section>
          )}

          {data!.wiki.length > 0 && (
            <section className="space-y-3">
              <h2 className="text-[13px] font-semibold uppercase tracking-wider text-faint">
                Live public-records lookup · for anyone
              </h2>
              {data!.wiki.map((w) => (
                <div key={w.title} className="card flex items-center gap-4 p-4 transition hover:border-brand/40">
                  <div className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-surface-3 text-sm font-bold text-faint">
                    {w.title.split(" ").map((p) => p[0]).slice(0, 2).join("")}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate font-semibold text-fg">{w.title}</h3>
                    <p className="truncate text-sm text-muted">{w.description ?? "Public figure"}</p>
                  </div>
                  <button
                    onClick={() => router.push(`/lookup/${encodeURIComponent(w.title)}`)}
                    className="shrink-0 rounded-xl border border-line bg-surface-2 px-4 py-2 text-sm font-semibold text-fg transition hover:border-brand/40"
                  >
                    View Profile →
                  </button>
                </div>
              ))}
            </section>
          )}
        </>
      )}
    </div>
  );
}
