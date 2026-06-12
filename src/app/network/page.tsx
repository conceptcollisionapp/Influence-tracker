"use client";

import { ConnectionGraph } from "@/components/ConnectionGraph";
import { Timestamp } from "@/components/Timestamp";
import { ErrorNote } from "@/components/Ui";
import { useApi } from "@/components/useApi";
import type { TraceResult } from "@/lib/trace";

export default function NetworkPage() {
  const { env, loading } = useApi<TraceResult>("/api/network");

  return (
    <div>
      <h1 className="mb-2 text-3xl font-bold text-white">Connection network</h1>
      <p className="mb-1 max-w-3xl text-sm text-slate-400">
        How tracked people are linked through shared companies, nonprofits, PACs, and documented relationships.
        Every edge is individually sourced — click any node to see its connections and the original records.
      </p>
      {env && (
        <p className="mb-4 text-xs text-slate-500">
          <Timestamp iso={env.fetchedAt} kind="curated" label="graph generated" />
        </p>
      )}
      {loading && <p className="text-sm text-slate-500">Building graph…</p>}
      {env?.data && <ConnectionGraph nodes={env.data.nodes} edges={env.data.edges} height={640} />}
      <ErrorNote errors={env?.errors} />
    </div>
  );
}
