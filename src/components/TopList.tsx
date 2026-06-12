"use client";

import Link from "next/link";
import type { ScoreBreakdown } from "@/lib/score";
import { ScoreBadge } from "./ScoreBadge";
import { Timestamp } from "./Timestamp";
import { ErrorNote, Money } from "./Ui";
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

export function TopList() {
  const { env, loading } = useApi<TopEntry[]>("/api/top");

  if (loading) return <p className="text-sm text-slate-500">Ranking the registry (live FEC giving feeds the score)…</p>;
  if (!env?.data) return <p className="text-sm text-slate-400">Ranking unavailable.</p>;

  return (
    <div>
      <ol className="grid gap-3 sm:grid-cols-2">
        {env.data.map((e) => (
          <li key={e.slug}>
            <Link
              href={`/person/${e.slug}`}
              className="flex items-center gap-4 rounded-xl border border-edge bg-panel/70 p-4 transition hover:border-accent/60 hover:bg-panel-2"
            >
              <span className="w-8 text-2xl font-bold tabular-nums text-slate-500">{e.rank}</span>
              <ScoreBadge score={e.score} compact />
              <span className="min-w-0">
                <span className="block truncate font-semibold text-white">{e.name}</span>
                <span className="block truncate text-xs text-slate-400">{e.title}</span>
                <span className="mt-0.5 block text-xs text-slate-500">
                  net worth ≈ <Money usd={(e.netWorthUSDBillion ?? 0) * 1e9} /> · {e.category}
                </span>
              </span>
              <span className="ml-auto shrink-0 text-lg font-bold tabular-nums text-gold">{e.score.total}</span>
            </Link>
          </li>
        ))}
      </ol>
      <div className="mt-3 flex items-center gap-3 text-xs text-slate-500">
        <Timestamp iso={env.fetchedAt} kind={env.live ? "live" : "curated"} label="ranked" />
        <Link href="/methodology" className="text-accent-2 underline">
          Influence Score methodology
        </Link>
      </div>
      <ErrorNote errors={env.errors} />
    </div>
  );
}
