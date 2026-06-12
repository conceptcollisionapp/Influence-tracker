import type { SourceLink } from "@/lib/types";

/** External-source hyperlink — every org/datum click-through uses this. */
export function Source({ link, className = "" }: { link: SourceLink; className?: string }) {
  const external = link.url.startsWith("http");
  return (
    <a
      href={link.url}
      target={external ? "_blank" : undefined}
      rel={external ? "noopener noreferrer" : undefined}
      className={`text-accent-2 underline decoration-accent/40 hover:decoration-accent ${className}`}
    >
      {link.name}
      {external && <span aria-hidden className="ml-0.5 text-[10px]">↗</span>}
    </a>
  );
}

export function Card({
  title,
  children,
  right,
}: {
  title?: React.ReactNode;
  children: React.ReactNode;
  right?: React.ReactNode;
}) {
  return (
    <section className="rounded-xl border border-edge bg-panel/70 p-4 shadow-lg shadow-black/20">
      {(title || right) && (
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          {title && <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-300">{title}</h2>}
          {right}
        </div>
      )}
      {children}
    </section>
  );
}

export function Money({ usd }: { usd?: number }) {
  if (usd === undefined || usd === null || !Number.isFinite(usd)) return <span className="text-slate-500">—</span>;
  const fmt =
    Math.abs(usd) >= 1e9
      ? `$${(usd / 1e9).toFixed(usd >= 1e10 ? 0 : 1)}B`
      : Math.abs(usd) >= 1e6
        ? `$${(usd / 1e6).toFixed(1)}M`
        : Math.abs(usd) >= 1e3
          ? `$${(usd / 1e3).toFixed(0)}K`
          : `$${usd.toFixed(0)}`;
  return <span className="tabular-nums">{fmt}</span>;
}

export function ErrorNote({ errors }: { errors?: string[] }) {
  if (!errors?.length) return null;
  return (
    <p className="mt-2 rounded-md border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-300">
      Live source notice: {errors.join(" · ")}
    </p>
  );
}

export const ORG_TYPE_STYLE: Record<string, string> = {
  company: "border-sky-500/40 bg-sky-500/10 text-sky-300",
  nonprofit: "border-emerald-500/40 bg-emerald-500/10 text-emerald-300",
  pac: "border-rose-500/40 bg-rose-500/10 text-rose-300",
  fund: "border-violet-500/40 bg-violet-500/10 text-violet-300",
  media: "border-amber-500/40 bg-amber-500/10 text-amber-300",
};

export function OrgTypeBadge({ type }: { type: string }) {
  return (
    <span className={`rounded-full border px-2 py-0.5 text-[10px] uppercase tracking-wide ${ORG_TYPE_STYLE[type] ?? "border-edge text-slate-400"}`}>
      {type}
    </span>
  );
}
