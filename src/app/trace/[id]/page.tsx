"use client";

import Link from "next/link";
import { use } from "react";
import { ConnectionGraph } from "@/components/ConnectionGraph";
import { Timestamp } from "@/components/Timestamp";
import { ErrorNote, Source } from "@/components/Ui";
import { useApi } from "@/components/useApi";
import type { TraceResult } from "@/lib/trace";

/**
 * "Follow the Money" — full chain of donations, funding, and connections
 * radiating out from a person or organization, hop by hop, each hop sourced.
 */
export default function TracePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { env, loading, error } = useApi<TraceResult>(`/api/trace/${encodeURIComponent(id)}?depth=3`);
  const trace = env?.data;
  const root = trace?.nodes.find((n) => n.id === trace.rootId);

  return (
    <div>
      <div className="mb-2 flex flex-wrap items-baseline gap-3">
        <h1 className="text-3xl font-bold text-white">
          💰 Follow the Money{root ? <>: <span className="text-gold">{root.label}</span></> : ""}
        </h1>
        {env && <Timestamp iso={env.fetchedAt} kind="curated" label="traced" />}
      </div>
      <p className="mb-6 max-w-3xl text-sm text-slate-400">
        Tracing the documented chain of money and influence outward from the starting point — roles at companies,
        funding of nonprofits and PACs, and person-to-person links. Every hop cites its public source.
      </p>

      {loading && <p className="text-sm text-slate-500">Tracing the chain…</p>}
      {error && (
        <p className="text-sm text-rose-300">
          No trace available for “{decodeURIComponent(id)}”. Traces start from tracked profiles and their
          organizations — <Link href="/" className="text-accent-2 underline">search the registry</Link>.
        </p>
      )}

      {trace && (
        <>
          <ConnectionGraph nodes={trace.nodes} edges={trace.edges} height={520} highlightId={trace.rootId} />

          <h2 className="mb-3 mt-8 text-sm font-semibold uppercase tracking-wider text-slate-300">
            The chain, hop by hop ({trace.edges.length} sourced links)
          </h2>
          <ol className="space-y-2">
            {trace.edges
              .slice()
              .sort((a, b) => depthOf(trace, a) - depthOf(trace, b))
              .map((e, i) => {
                const from = trace.nodes.find((n) => n.id === e.from);
                const to = trace.nodes.find((n) => n.id === e.to);
                return (
                  <li key={i} className="flex flex-wrap items-baseline gap-2 rounded-lg border border-edge bg-panel/60 px-4 py-2.5 text-sm">
                    <span className="rounded bg-panel-2 px-1.5 py-0.5 text-[10px] tabular-nums text-slate-500">
                      hop {depthOf(trace, e) + 1}
                    </span>
                    <NodeRef node={from} />
                    <span className="text-slate-500">—</span>
                    <span className="text-slate-300">{e.relation}</span>
                    <span className="text-slate-500">→</span>
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
  if (node.kind === "person") {
    return (
      <Link href={`/person/${node.id}`} className="font-semibold text-white underline decoration-edge hover:decoration-accent">
        {node.label}
      </Link>
    );
  }
  return (
    <Link href={`/trace/${node.id}`} className="font-medium text-accent-2 underline decoration-accent/40" title="Follow the money from this organization">
      {node.label}
    </Link>
  );
}
