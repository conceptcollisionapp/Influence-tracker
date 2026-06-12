"use client";

import type { DonationSummary, LobbyingFiling } from "@/lib/sources/fec";
import type { Organization } from "@/lib/types";
import { Timestamp } from "../Timestamp";
import { Card, ErrorNote, Money, OrgTypeBadge, SkeletonList, Source } from "../Ui";
import { useApi } from "../useApi";

interface DonationsData {
  donations: DonationSummary | null;
  lobbying: Array<{ client: string; filings?: LobbyingFiling[] }>;
  fecSearchUrl: string;
  opensecretsUrl: string;
  ldaSearchUrl: string;
}

export function DonationsSection({
  slug,
  name,
  curatedOrgs = [],
}: {
  slug?: string;
  name: string;
  curatedOrgs?: Organization[];
}) {
  const url = slug ? `/api/donations?slug=${slug}` : `/api/donations?name=${encodeURIComponent(name)}`;
  const { env, loading } = useApi<DonationsData>(url);
  const d = env?.data;
  const committees = curatedOrgs.filter((o) => o.type === "pac");

  return (
    <Card
      title="Political donations & lobbying"
      right={env && <Timestamp iso={env.fetchedAt} kind={env.live ? "live" : "curated"} />}
    >
      {/* Curated political committees — always shown, always sourced to FEC.gov */}
      {committees.length > 0 && (
        <div className="mb-4">
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
            Political committees &amp; PACs
          </h3>
          <ul className="space-y-2">
            {committees.map((o) => (
              <li key={o.id} className="rounded-lg border border-line bg-surface-2 p-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-medium text-white">{o.name}</span>
                  <OrgTypeBadge type={o.type} />
                  <span className="text-xs text-slate-400">· {o.role}</span>
                  <span className="ml-auto">
                    <Timestamp iso={o.provenance.asOf} kind="curated" />
                  </span>
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
        </div>
      )}

      <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
        Itemized federal contributions (live, FEC)
      </h3>
      {loading && <SkeletonList rows={4} />}

      {d && (
        <>
          {d.donations && d.donations.records.length > 0 ? (
            <>
              <p className="mb-3 text-sm text-slate-300">
                <Money usd={d.donations.totalUSD} /> across the {d.donations.records.length} most recent itemized
                federal contributions matching “{name}” ({d.donations.count.toLocaleString()} records total on FEC.gov).
                <span className="ml-1 text-xs text-slate-500">
                  Name-matched records may include other people with the same name — click through to verify.
                </span>
              </p>
              <div className="scroll-thin max-h-80 overflow-auto rounded-lg border border-line">
                <table className="w-full text-left text-sm">
                  <thead className="sticky top-0 bg-surface-2 text-xs uppercase tracking-wide text-slate-400">
                    <tr>
                      <th className="px-3 py-2">Date</th>
                      <th className="px-3 py-2">Committee (recipient)</th>
                      <th className="px-3 py-2 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {d.donations.records.map((r, i) => (
                      <tr key={i} className="border-t border-line/60 hover:bg-surface-2/60">
                        <td className="whitespace-nowrap px-3 py-1.5 tabular-nums text-slate-400">
                          {r.date ? new Date(r.date).toLocaleDateString() : "—"}
                        </td>
                        <td className="px-3 py-1.5">
                          {r.committeeUrl ? (
                            <a href={r.committeeUrl} target="_blank" rel="noopener noreferrer" className="text-brand-soft underline">
                              {r.committee} ↗
                            </a>
                          ) : (
                            r.committee
                          )}
                        </td>
                        <td className="px-3 py-1.5 text-right tabular-nums"><Money usd={r.amount} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {d.donations.note && <p className="mt-2 text-xs text-amber-300/80">{d.donations.note}</p>}
            </>
          ) : (
            !loading && (
              <p className="text-sm text-slate-400">
                No itemized individual contributions matched “{name}” in the live FEC feed right now (this is common
                for people who give mainly through PACs/committees, or when the FEC API is rate-limited). Use the
                direct search links below — they always work.
              </p>
            )
          )}

          {d.lobbying.length > 0 && (
            <div className="mt-4">
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
                Lobbying by affiliated companies (Senate LDA filings)
              </h3>
              <ul className="space-y-1.5 text-sm">
                {d.lobbying.map((l) =>
                  (l.filings ?? []).slice(0, 3).map((f, i) => (
                    <li key={`${l.client}-${i}`} className="flex flex-wrap items-baseline gap-2">
                      <a href={f.url} target="_blank" rel="noopener noreferrer" className="text-brand-soft underline">
                        {f.client} ↗
                      </a>
                      <span className="text-slate-400">
                        {f.year} {f.period} · registrant: {f.registrant}
                        {f.incomeUSD ? <> · <Money usd={f.incomeUSD} /></> : f.expensesUSD ? <> · <Money usd={f.expensesUSD} /> expenses</> : null}
                      </span>
                      {f.postedAt && <Timestamp iso={f.postedAt} kind="live" label="filed" />}
                    </li>
                  )),
                )}
              </ul>
            </div>
          )}

          <div className="mt-4 flex flex-wrap gap-3 text-xs">
            <Source link={{ name: "Search FEC individual contributions", url: d.fecSearchUrl }} />
            <Source link={{ name: "OpenSecrets profile search", url: d.opensecretsUrl }} />
            <Source link={{ name: "Senate lobbying disclosure search", url: d.ldaSearchUrl }} />
          </div>
        </>
      )}
      <ErrorNote errors={env?.errors} />
    </Card>
  );
}
