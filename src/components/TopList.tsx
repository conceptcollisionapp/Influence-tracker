"use client";

import Link from "next/link";
import type { ScoreBreakdown } from "@/lib/score";
import { ScoreDial } from "./ScoreBadge";
import { Timestamp } from "./Timestamp";
import { CategoryBadge, EmptyState, ErrorNote, Money, Skeleton } from "./Ui";
import { useApi } from "./useApi";

interface TopEntry {
  rank: number;
  slug: string;
  name: string;
  title: string;
  category: string;
  netWorthUSDBillion?: number;
  score: ScoreBreakdown;
}

export function TopList({ limit }: { limit?: number }) {
  const { env, loading } = useApi<TopEntry[]>("/api/top");

  if (loading) {
    return (
      <ol className="grid gap-3 sm:grid-cols-2">
        {Array.from({ length: limit ?? 10 }).map((_, i) => (
          <li key={i}>
            <Skeleton className="h-[92px] w-full rounded-2xl" />
          </li>
        ))}
      </ol>
    );
  }
  if (!env?.data?.length)
    return <EmptyState icon="📊" title="Ranking unavailable">Try refreshing in a moment.</EmptyState>;

  const data = limit ? env.data.slice(0, limit) : env.data;

  return (
    <div>
      <ol className="grid gap-3 sm:grid-cols-2">
        {data.map((e) => (
          <li key={e.slug}>
            <Link
              href={`/person/${e.slug}`}
              className="group flex items-center gap-4 rounded-2xl border border-line bg-surface/60 p-4 transition hover:-translate-y-0.5 hover:border-brand/50 hover:bg-surface-2 hover:shadow-lg hover:shadow-brand/5"
            >
              <span className="w-6 text-center text-xl font-bold tabular-nums text-faint">{e.rank}</span>
              <ScoreDial score={e.score} size={56} />
              <span className="min-w-0 flex-1">
                <span className="block truncate font-semibold text-fg group-hover:text-brand-soft">{e.name}</span>
                <span className="block truncate text-xs text-muted">{e.title}</span>
                <span className="mt-1.5 flex items-center gap-2">
                  <CategoryBadge category={e.category} />
                  <span className="text-xs text-faint">
                    ≈ <Money usd={(e.netWorthUSDBillion ?? 0) * 1e9} />
                  </span>
                </span>
              </span>
              <span className="shrink-0 text-right">
                <span className="block text-lg font-bold tabular-nums text-gold">{e.score.total}</span>
                <span className="block text-[10px] uppercase tracking-wide text-faint">score</span>
              </span>
            </Link>
          </li>
        ))}
      </ol>
      <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-faint">
        <Timestamp iso={env.fetchedAt} kind={env.live ? "live" : "curated"} label="ranked" />
        <Link href="/methodology" className="text-brand-soft underline decoration-brand/30">
          Influence Score methodology
        </Link>
      </div>
      <ErrorNote errors={env.errors} />
    </div>
  );
}
