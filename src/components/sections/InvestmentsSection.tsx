"use client";

import type { FilingRecord } from "@/lib/sources/sec";
import type { Organization, Provenance, SourceLink } from "@/lib/types";
import { Timestamp } from "../Timestamp";
import { Card, ErrorNote, OrgTypeBadge, SkeletonList, Source } from "../Ui";
import { useApi } from "../useApi";

interface InvestmentsData {
  filings: FilingRecord[] | null;
  edgarSearchUrl: string;
  edgarInsiderUrl: string;
  companies: Array<{
    id: string;
    name: string;
    role: string;
    ticker?: string;
    links: SourceLink[];
    provenance: Provenance;
  }>;
}

export function InvestmentsSection({
  slug,
  name,
  curatedOrgs,
}: {
  slug?: string;
  name: string;
  curatedOrgs: Organization[];
}) {
  const url = slug ? `/api/investments?slug=${slug}` : `/api/investments?name=${encodeURIComponent(name)}`;
  const { env, loading } = useApi<InvestmentsData>(url);
  const companies = curatedOrgs.filter((o) => o.type === "company");

  return (
    <Card
      title="Major investments & companies"
      right={env && <Timestamp iso={env.fetchedAt} kind={env.live ? "live" : "curated"} />}
    >
      {companies.length > 0 && (
        <ul className="mb-4 space-y-2">
          {companies.map((o) => (
            <li key={o.id} className="rounded-lg border border-line bg-surface-2 p-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-medium text-white">{o.name}</span>
                {o.ticker && <span className="rounded bg-sky-500/15 px-1.5 py-0.5 text-[10px] font-semibold text-sky-300">{o.ticker}</span>}
                <OrgTypeBadge type={o.type} />
                <span className="text-xs text-slate-400">· {o.role}</span>
                <span className="ml-auto"><Timestamp iso={o.provenance.asOf} kind="curated" /></span>
              </div>
              {o.note && <p className="mt-1 text-xs text-slate-400">{o.note}</p>}
              <div className="mt-1.5 flex flex-wrap gap-3 text-xs">
                {o.links.map((l) => (
                  <Source key={l.url} link={l} />
                ))}
              </div>
            </li>
          ))}
        </ul>
      )}

      <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
        Recent SEC ownership filings naming “{name}” (live, EDGAR full-text search)
      </h3>
      {loading && <SkeletonList rows={3} />}
      {env?.data?.filings?.length ? (
        <ul className="space-y-1 text-sm">
          {env.data.filings.map((f, i) => (
            <li key={i} className="flex flex-wrap items-baseline gap-2">
              <span className="rounded bg-surface-2 px-1.5 py-0.5 text-[10px] font-semibold text-slate-300">{f.form}</span>
              <a href={f.url} target="_blank" rel="noopener noreferrer" className="text-brand-soft underline">
                {f.company} ↗
              </a>
              <span className="text-xs text-slate-500">filed {f.filedAt}</span>
            </li>
          ))}
        </ul>
      ) : (
        !loading && (
          <p className="text-sm text-slate-400">
            Live EDGAR data unavailable — search directly:{" "}
            {env?.data && (
              <>
                <Source link={{ name: "all filings", url: env.data.edgarSearchUrl }} />{" "}
                ·{" "}
                <Source link={{ name: "insider trades (Form 4)", url: env.data.edgarInsiderUrl }} />
              </>
            )}
          </p>
        )
      )}
      {env?.data?.filings?.length ? (
        <div className="mt-3 flex flex-wrap gap-3 text-xs">
          <Source link={{ name: "Full EDGAR search for this name", url: env.data.edgarSearchUrl }} />
          <Source link={{ name: "Insider trades only (Form 4)", url: env.data.edgarInsiderUrl }} />
        </div>
      ) : null}
      <ErrorNote errors={env?.errors} />
    </Card>
  );
}
