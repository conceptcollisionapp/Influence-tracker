import type { SourceLink } from "@/lib/types";

/** External-source hyperlink — every org/datum click-through uses this. */
export function Source({ link, className = "" }: { link: SourceLink; className?: string }) {
  const external = link.url.startsWith("http");
  return (
    <a
      href={link.url}
      target={external ? "_blank" : undefined}
      rel={external ? "noopener noreferrer" : undefined}
      className={`inline-flex items-center gap-0.5 text-brand-soft underline decoration-brand/30 underline-offset-2 transition hover:decoration-brand ${className}`}
    >
      {link.name}
      {external && <span aria-hidden className="text-[10px] opacity-70">↗</span>}
    </a>
  );
}

export function Card({
  title,
  children,
  right,
  className = "",
}: {
  title?: React.ReactNode;
  children: React.ReactNode;
  right?: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={`card p-5 shadow-xl shadow-black/20 ${className}`}>
      {(title || right) && (
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          {title && <h2 className="text-[13px] font-semibold uppercase tracking-wider text-muted">{title}</h2>}
          {right}
        </div>
      )}
      {children}
    </section>
  );
}

export function Money({ usd, className = "" }: { usd?: number; className?: string }) {
  if (usd === undefined || usd === null || !Number.isFinite(usd))
    return <span className="text-faint">—</span>;
  const fmt =
    Math.abs(usd) >= 1e9
      ? `$${(usd / 1e9).toFixed(usd >= 1e10 ? 0 : 1)}B`
      : Math.abs(usd) >= 1e6
        ? `$${(usd / 1e6).toFixed(1)}M`
        : Math.abs(usd) >= 1e3
          ? `$${(usd / 1e3).toFixed(0)}K`
          : `$${usd.toFixed(0)}`;
  return <span className={`tabular-nums ${className}`}>{fmt}</span>;
}

export function ErrorNote({ errors }: { errors?: string[] }) {
  if (!errors?.length) return null;
  return (
    <p className="mt-3 flex items-start gap-2 rounded-lg border border-gold/25 bg-gold/[0.07] px-3 py-2 text-xs text-gold/90">
      <span aria-hidden>ⓘ</span>
      <span>{errors.join(" · ")}</span>
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
    <span
      className={`rounded-full border px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide ${
        ORG_TYPE_STYLE[type] ?? "border-line text-faint"
      }`}
    >
      {type}
    </span>
  );
}

/** Loading skeleton block. */
export function Skeleton({ className = "", style }: { className?: string; style?: React.CSSProperties }) {
  return <div className={`skeleton ${className}`} style={style} />;
}

export function SkeletonList({ rows = 4 }: { rows?: number }) {
  return (
    <div className="space-y-2.5">
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} className="h-12 w-full" />
      ))}
    </div>
  );
}

/** Friendly empty state. */
export function EmptyState({
  icon = "🔍",
  title,
  children,
}: {
  icon?: string;
  title: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-line px-6 py-10 text-center">
      <div className="mb-2 text-3xl opacity-80">{icon}</div>
      <p className="font-medium text-fg">{title}</p>
      {children && <div className="mt-1 max-w-sm text-sm text-muted">{children}</div>}
    </div>
  );
}

const CATEGORY_STYLE: Record<string, string> = {
  billionaire: "border-gold/40 bg-gold/10 text-gold",
  celebrity: "border-violet/40 bg-violet/10 text-violet",
  politician: "border-rose/40 bg-rose/10 text-rose",
  investor: "border-emerald/40 bg-emerald/10 text-emerald",
};

export function CategoryBadge({ category }: { category: string }) {
  return (
    <span
      className={`rounded-full border px-2.5 py-0.5 text-[11px] font-medium capitalize ${
        CATEGORY_STYLE[category] ?? "border-line text-muted"
      }`}
    >
      {category}
    </span>
  );
}
