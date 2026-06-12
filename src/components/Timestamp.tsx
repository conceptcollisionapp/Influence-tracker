"use client";

/** Relative + absolute freshness indicator shown next to every datum. */
export function Timestamp({
  iso,
  label,
  kind,
}: {
  iso?: string;
  label?: string;
  kind?: "live" | "curated";
}) {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  const rel = relative(d);
  return (
    <time
      dateTime={iso}
      title={d.toLocaleString()}
      className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] leading-4 ${
        kind === "live"
          ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-300"
          : "border-edge bg-panel text-slate-400"
      }`}
    >
      {kind === "live" && <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />}
      {label ?? (kind === "live" ? "fetched" : "verified")} {rel}
    </time>
  );
}

function relative(d: Date): string {
  const s = (Date.now() - d.getTime()) / 1000;
  if (s < 0) return d.toLocaleDateString();
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s / 60)} min ago`;
  if (s < 86400) return `${Math.floor(s / 3600)} h ago`;
  if (s < 86400 * 60) return `${Math.floor(s / 86400)} d ago`;
  return d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}
