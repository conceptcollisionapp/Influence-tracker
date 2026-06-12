"use client";

import type { NonprofitRecord } from "@/lib/sources/propublica";
import type { Organization } from "@/lib/types";
import { Timestamp } from "../Timestamp";
import { Card, ErrorNote, Money, OrgTypeBadge, Source } from "../Ui";
import { useApi } from "../useApi";

interface NonprofitsData {
  results: Array<{ query: string; orgs?: NonprofitRecord[] }>;
}

export function NonprofitsSection({
  slug,
  name,
  curatedOrgs,
}: {
  slug?: string;
  name: string;
  curatedOrgs: Organization[];
}) {
  const url = slug ? `/api/nonprofits?slug=${slug}` : `/api/nonprofits?q=${encodeURIComponent(name)}`;
  const { env, loading } = useApi<NonprofitsData>(url);
  const nonprofits = curatedOrgs.filter((o) => o.type === "nonprofit" || o.type === "fund");

  return (
    <Card
      title="Nonprofits & philanthropy"
      right={env && <Timestamp iso={env.fetchedAt} kind={env.live ? "live" : "curated"} />}
    >
      {nonprofits.length > 0 && (
        <ul className="mb-4 space-y-2">
          {nonprofits.map((o) => (
            <li key={o.id} className="rounded-lg border border-line bg-surface-2 p-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-medium text-white">{o.name}</span>
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
        Matching IRS Form 990 filers (live, ProPublica Nonprofit Explorer)
      </h3>
      {loading && <p className="text-sm text-slate-500">Searching IRS filings…</p>}
      {env?.data?.results.some((r) => r.orgs?.length) ? (
        <ul className="space-y-1 text-sm">
          {env.data.results.flatMap((r) =>
            (r.orgs ?? []).slice(0, 4).map((o) => (
              <li key={o.ein} className="flex flex-wrap items-baseline gap-2">
                <a href={o.url} target="_blank" rel="noopener noreferrer" className="text-brand-soft underline">
                  {o.name} ↗
                </a>
                <span className="text-xs text-slate-500">
                  EIN {o.ein}
                  {o.city ? ` · ${o.city}, ${o.state}` : ""}
                  {o.latestFilingYear ? ` · latest 990: ${o.latestFilingYear}` : ""}
                  {o.assetsUSD ? <> · assets <Money usd={o.assetsUSD} /></> : null}
                </span>
              </li>
            )),
          )}
        </ul>
      ) : (
        !loading && (
          <p className="text-sm text-slate-400">
            Live IRS data unavailable —{" "}
            <a
              className="text-brand-soft underline"
              href={`https://projects.propublica.org/nonprofits/search?q=${encodeURIComponent(name)}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              search ProPublica Nonprofit Explorer directly ↗
            </a>
          </p>
        )
      )}
      <ErrorNote errors={env?.errors} />
    </Card>
  );
}
