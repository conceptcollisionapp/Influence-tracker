"use client";

import type { DonationSummary, LobbyingFiling } from "@/lib/sources/fec";
import { Timestamp } from "../Timestamp";
import { Card, ErrorNote, Money, Source } from "../Ui";
import { useApi } from "../useApi";

interface DonationsData {
  donations: DonationSummary | null;
  lobbying: Array<{ client: string; filings?: LobbyingFiling[] }>;
  fecSearchUrl: string;
  opensecretsUrl: string;
  ldaSearchUrl: string;
}

export function DonationsSection({ slug, name }: { slug?: string; name: string }) {
  const url = slug ? `/api/donations?slug=${slug}` : `/api/donations?name=${encodeURIComponent(name)}`;
  const { env, loading } = useApi<DonationsData>(url);
  const d = env?.data;

  return (
    <Card
      title="Political donations & lobbying"
      right={env && <Timestamp iso={env.fetchedAt} kind={env.live ? "live" : "curated"} />}
    >
      {loading && <p className="text-sm text-slate-500">Querying FEC &amp; Senate LDA records…</p>}

      {d && (
        <>
          {d.donations ? (
            <>
              <p className="mb-3 text-sm text-slate-300">
                <Money usd={d.donations.totalUSD} /> across the {d.donations.records.length} most recent itemized
                federal contributions matching “{name}” ({d.donations.count.toLocaleString()} records total on FEC.gov).
                <span className="ml-1 text-xs text-slate-500">
                  Name-matched records may include other people with the same name — click through to verify.
                </span>
              </p>
              <div className="max-h-80 overflow-auto rounded-lg border border-line">
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
                Live FEC data unavailable right now — search the records directly below.
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
