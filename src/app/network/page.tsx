"use client";

import { ConnectionGraph } from "@/components/ConnectionGraph";
import { Timestamp } from "@/components/Timestamp";
import { ErrorNote, Skeleton } from "@/components/Ui";
import { useApi } from "@/components/useApi";
import type { TraceResult } from "@/lib/trace";

export default function NetworkPage() {
  const { env, loading } = useApi<TraceResult>("/api/network");

  return (
    <div>
      <h1 className="mb-2 text-3xl font-bold tracking-tight">Connection network</h1>
      <p className="mb-1 max-w-3xl text-sm text-muted">
        How tracked people are linked through shared companies, nonprofits, PACs, and documented relationships.
        Every edge is individually sourced — click any node to see its connections and the original records.
      </p>
      {env && (
        <p className="mb-4">
          <Timestamp iso={env.fetchedAt} kind="curated" label="graph generated" />
        </p>
      )}
      {loading ? (
        <Skeleton className="h-[640px] w-full rounded-2xl" />
      ) : (
        env?.data && <ConnectionGraph nodes={env.data.nodes} edges={env.data.edges} height={640} />
      )}
      <ErrorNote errors={env?.errors} />
    </div>
  );
}
