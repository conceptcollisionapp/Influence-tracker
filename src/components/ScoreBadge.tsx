import Link from "next/link";
import type { ScoreBreakdown } from "@/lib/score";
import { Timestamp } from "./Timestamp";

/** Influence Score dial + component breakdown. */
export function ScoreBadge({ score, compact = false }: { score: ScoreBreakdown; compact?: boolean }) {
  const pct = Math.min(100, Math.max(0, score.total));
  const hue = 210 - pct * 1.4; // blue → gold as influence rises
  const dial = (
    <div
      className="relative grid h-16 w-16 shrink-0 place-items-center rounded-full"
      style={{
        background: `conic-gradient(hsl(${hue} 85% 60%) ${pct * 3.6}deg, #233252 0deg)`,
      }}
      title={`Influence Score ${score.total}/100`}
    >
      <div className="grid h-12 w-12 place-items-center rounded-full bg-ink text-base font-bold tabular-nums">
        {Math.round(score.total)}
      </div>
    </div>
  );
  if (compact) return dial;
  return (
    <div className="flex items-center gap-4">
      {dial}
      <div className="text-xs text-slate-300">
        <p className="mb-1 font-semibold uppercase tracking-wider text-slate-400">
          Influence Score · <Link href="/methodology" className="text-accent-2 underline">how it&apos;s computed</Link>
        </p>
        <div className="grid grid-cols-2 gap-x-5 gap-y-0.5 tabular-nums">
          <span>Wealth {score.wealth}<span className="text-slate-500">/40</span></span>
          <span>Network {score.network}<span className="text-slate-500">/25</span></span>
          <span>Political {score.political}<span className="text-slate-500">/20</span></span>
          <span>Institutional {score.institutional}<span className="text-slate-500">/15</span></span>
        </div>
        <div className="mt-1">
          <Timestamp iso={score.computedAt} kind="live" label="computed" />
        </div>
      </div>
    </div>
  );
}
