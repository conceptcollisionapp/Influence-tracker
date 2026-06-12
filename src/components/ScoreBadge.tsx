import Link from "next/link";
import type { ScoreBreakdown } from "@/lib/score";
import { Timestamp } from "./Timestamp";

function hueFor(pct: number): number {
  return 214 - Math.min(100, Math.max(0, pct)) * 1.5; // blue → gold as influence rises
}

/** Small circular dial — used in lists. */
export function ScoreDial({ score, size = 64 }: { score: ScoreBreakdown; size?: number }) {
  const pct = Math.min(100, Math.max(0, score.total));
  const inner = size - 8;
  return (
    <div
      className="relative grid shrink-0 place-items-center rounded-full"
      style={{
        width: size,
        height: size,
        background: `conic-gradient(hsl(${hueFor(pct)} 90% 62%) ${pct * 3.6}deg, var(--color-surface-3) 0deg)`,
      }}
      title={`Influence Score ${score.total}/100`}
    >
      <div className="grid place-items-center rounded-full bg-bg font-bold tabular-nums" style={{ width: inner, height: inner }}>
        <span style={{ fontSize: size * 0.28 }}>{Math.round(score.total)}</span>
      </div>
    </div>
  );
}

const COMPONENTS: Array<{ key: keyof Pick<ScoreBreakdown, "wealth" | "network" | "political" | "institutional">; label: string; max: number; color: string }> = [
  { key: "wealth", label: "Wealth", max: 40, color: "var(--color-gold)" },
  { key: "network", label: "Network", max: 25, color: "var(--color-brand)" },
  { key: "political", label: "Political", max: 20, color: "var(--color-rose)" },
  { key: "institutional", label: "Institutional", max: 15, color: "var(--color-violet)" },
];

/** Big hero score with component bars — used on profile pages. */
export function ScoreHero({ score }: { score: ScoreBreakdown }) {
  const pct = Math.min(100, Math.max(0, score.total));
  return (
    <div className="card flex flex-col gap-5 p-5 sm:flex-row sm:items-center">
      <div className="flex items-center gap-4">
        <div
          className="relative grid h-24 w-24 shrink-0 place-items-center rounded-full"
          style={{ background: `conic-gradient(hsl(${hueFor(pct)} 90% 62%) ${pct * 3.6}deg, var(--color-surface-3) 0deg)` }}
        >
          <div className="grid h-[84px] w-[84px] place-items-center rounded-full bg-bg">
            <span className="text-3xl font-bold tabular-nums">{Math.round(score.total)}</span>
          </div>
        </div>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-faint">Influence Score</p>
          <p className="text-2xl font-bold leading-tight">{score.total}<span className="text-base font-normal text-faint">/100</span></p>
          <Link href="/methodology" className="text-xs text-brand-soft underline decoration-brand/30">How it&apos;s calculated</Link>
        </div>
      </div>

      <div className="flex-1 space-y-2.5 sm:border-l sm:border-line sm:pl-6">
        {COMPONENTS.map((c) => {
          const val = score[c.key];
          return (
            <div key={c.key}>
              <div className="mb-1 flex items-baseline justify-between text-xs">
                <span className="text-muted">{c.label}</span>
                <span className="tabular-nums text-faint">
                  {val}<span className="opacity-60">/{c.max}</span>
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-surface-3">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{ width: `${(val / c.max) * 100}%`, background: c.color }}
                />
              </div>
            </div>
          );
        })}
        <div className="pt-1">
          <Timestamp iso={score.computedAt} kind="live" label="computed" />
        </div>
      </div>
    </div>
  );
}
