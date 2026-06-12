"use client";

import Link from "next/link";
import { ConnectionGraph } from "./ConnectionGraph";
import { Timestamp } from "./Timestamp";
import { EmptyState, ErrorNote, Skeleton, Source } from "./Ui";
import { useApi } from "./useApi";
import type { TraceResult } from "@/lib/trace";

/**
 * Shared "Follow the Money" renderer: force-directed graph + hop-by-hop
 * sourced chain. Used standalone on /trace and inside profile tabs.
 */
export function TraceView({
  id,
  view = "full",
  height = 520,
  depth = 3,
}: {
  id: string;
  view?: "full" | "graph";
  height?: number;
  depth?: number;
}) {
  const { env, loading, error } = useApi<TraceResult>(`/api/trace/${encodeURIComponent(id)}?depth=${depth}`);
  const trace = env?.data;

  if (loading) return <Skeleton className="w-full rounded-2xl" style={{ height }} />;
  if (error || !trace)
    return (
      <EmptyState icon="🧭" title="No trace available">
        Traces start from tracked profiles and their organizations.{" "}
        <Link href="/" className="text-brand-soft underline">Search the registry →</Link>
      </EmptyState>
    );

  return (
    <div>
      <ConnectionGraph nodes={trace.nodes} edges={trace.edges} height={height} highlightId={trace.rootId} />

      {view === "full" && (
        <>
          <div className="mb-3 mt-7 flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-[13px] font-semibold uppercase tracking-wider text-muted">
              The chain, hop by hop · {trace.edges.length} sourced links
            </h3>
            <Timestamp iso={trace.generatedAt} kind="curated" label="traced" />
          </div>
          <ol className="space-y-2">
            {trace.edges
              .slice()
              .sort((a, b) => depthOf(trace, a) - depthOf(trace, b))
              .map((e, i) => {
                const from = trace.nodes.find((n) => n.id === e.from);
                const to = trace.nodes.find((n) => n.id === e.to);
                return (
                  <li
                    key={i}
                    className="flex flex-wrap items-baseline gap-2 rounded-xl border border-line bg-surface/50 px-4 py-2.5 text-sm"
                  >
                    <span className="rounded-md bg-surface-3 px-1.5 py-0.5 text-[10px] tabular-nums text-faint">
                      hop {depthOf(trace, e) + 1}
                    </span>
                    <NodeRef node={from} />
                    <span className="text-faint">— {e.relation} →</span>
                    <NodeRef node={to} />
                    <span className="ml-auto flex items-center gap-2 text-xs">
                      <Source link={e.source} />
                      <Timestamp iso={e.asOf} kind="curated" />
                    </span>
                  </li>
                );
              })}
          </ol>
        </>
      )}
      <ErrorNote errors={env?.errors} />
    </div>
  );
}

function depthOf(trace: TraceResult, e: { from: string; to: string }): number {
  const d = (id: string) => trace.nodes.find((n) => n.id === id)?.depth ?? 0;
  return Math.min(d(e.from), d(e.to));
}

function NodeRef({ node }: { node?: { id: string; kind: string; label: string } }) {
  if (!node) return null;
  if (node.kind === "person")
    return (
      <Link href={`/person/${node.id}`} className="font-semibold text-fg underline decoration-line hover:decoration-brand">
        {node.label}
      </Link>
    );
  return (
    <Link
      href={`/trace/${node.id}`}
      className="font-medium text-brand-soft underline decoration-brand/30"
      title="Follow the money from this organization"
    >
      {node.label}
    </Link>
  );
}
