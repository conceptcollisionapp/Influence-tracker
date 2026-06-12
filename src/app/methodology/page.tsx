export const metadata = { title: "Methodology & sources — Influence Tracker" };

const SOURCES = [
  {
    name: "FAA Aircraft Registry + crowd-sourced ADS-B (adsb.lol, adsbdb, ADS-B Exchange)",
    url: "https://registry.faa.gov/aircraftinquiry/",
    what: "Aircraft ownership and live positions. Tail-number attributions come from public reporting and the FAA registry; positions are openly broadcast by aircraft transponders and aggregated by volunteer receiver networks.",
    freshness: "Positions refresh every 60 seconds while a page is open; tail attributions carry an editorial verification date.",
  },
  {
    name: "Federal Election Commission (FEC) API",
    url: "https://api.open.fec.gov/developers/",
    what: "Itemized individual political contributions (Schedule A) and committee records. Matched by contributor name — namesakes are possible, so every row links to the FEC search to verify.",
    freshness: "Fetched live per request, cached 30 minutes. FEC data updates on official filing schedules.",
  },
  {
    name: "U.S. Senate Lobbying Disclosure Act database",
    url: "https://lda.senate.gov/system/public/",
    what: "Quarterly lobbying filings by companies affiliated with a tracked person.",
    freshness: "Fetched live per request, cached 30 minutes.",
  },
  {
    name: "SEC EDGAR full-text search",
    url: "https://efts.sec.gov/LATEST/search-index?q=",
    what: "Insider trades (Forms 3/4), beneficial-ownership stakes (13D/13G), and other filings naming a person. Company links go to the issuer's full EDGAR history.",
    freshness: "Fetched live per request, cached 30 minutes.",
  },
  {
    name: "ProPublica Nonprofit Explorer (IRS Form 990)",
    url: "https://projects.propublica.org/nonprofits/",
    what: "Nonprofit finances, assets, and filing history for foundations a person funds or controls.",
    freshness: "Fetched live per request, cached 6 hours; underlying IRS data is annual.",
  },
  {
    name: "Wikipedia / Wikidata",
    url: "https://www.wikidata.org",
    what: "Biographical summaries, photos, and structured net-worth statements (property P2218) with their own point-in-time qualifiers.",
    freshness: "Fetched live per request, cached 1 hour.",
  },
];

export default function MethodologyPage() {
  return (
    <article className="prose-invert mx-auto max-w-3xl space-y-10">
      <section>
        <h1 className="mb-3 text-3xl font-bold text-white">Methodology &amp; sources</h1>
        <p className="text-slate-300">
          Influence Tracker aggregates <strong>public records only</strong> and links every datum back to its
          original source with a timestamp. Two kinds of data appear in the app, and each item is labeled:
        </p>
        <ul className="mt-3 list-disc space-y-2 pl-6 text-slate-300">
          <li>
            <span className="rounded-full border border-emerald-500/40 bg-emerald-500/10 px-2 py-0.5 text-xs text-emerald-300">live</span>{" "}
            — fetched from the source API at request time; the badge shows when.
          </li>
          <li>
            <span className="rounded-full border border-edge bg-panel px-2 py-0.5 text-xs text-slate-400">verified</span>{" "}
            — curated baseline facts (e.g., which tail number is publicly tied to which owner) with the date they
            were last editorially checked against the linked source.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="mb-3 text-xl font-semibold text-white">Data sources</h2>
        <div className="space-y-4">
          {SOURCES.map((s) => (
            <div key={s.name} className="rounded-xl border border-edge bg-panel/70 p-4">
              <a href={s.url} target="_blank" rel="noopener noreferrer" className="font-semibold text-accent-2 underline">
                {s.name} ↗
              </a>
              <p className="mt-1 text-sm text-slate-300">{s.what}</p>
              <p className="mt-1 text-xs text-slate-500">{s.freshness}</p>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-xl font-semibold text-white">Influence Score</h2>
        <p className="text-slate-300">
          A transparent 0–100 composite, recomputed at request time. The four components and weights:
        </p>
        <div className="mt-3 overflow-hidden rounded-xl border border-edge">
          <table className="w-full text-left text-sm">
            <thead className="bg-panel-2 text-xs uppercase tracking-wide text-slate-400">
              <tr>
                <th className="px-4 py-2">Component</th>
                <th className="px-4 py-2">Weight</th>
                <th className="px-4 py-2">Basis</th>
              </tr>
            </thead>
            <tbody className="text-slate-300">
              <tr className="border-t border-edge"><td className="px-4 py-2">Wealth</td><td className="px-4 py-2">40</td><td className="px-4 py-2">Net worth, log-scaled from the $10M tracking floor to a $500B ceiling. Live Wikidata value when available, otherwise the curated estimate.</td></tr>
              <tr className="border-t border-edge"><td className="px-4 py-2">Network</td><td className="px-4 py-2">25</td><td className="px-4 py-2">Degree in the documented connection graph (both directions) plus breadth of organizational footprint.</td></tr>
              <tr className="border-t border-edge"><td className="px-4 py-2">Political</td><td className="px-4 py-2">20</td><td className="px-4 py-2">Control of PACs/candidate committees plus disclosed FEC giving volume (log-scaled, fetched live).</td></tr>
              <tr className="border-t border-edge"><td className="px-4 py-2">Institutional</td><td className="px-4 py-2">15</td><td className="px-4 py-2">Control of public companies, major nonprofits, and media properties in the registry.</td></tr>
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-sm text-slate-400">
          The score measures <em>documented public footprint</em>, not character or hidden influence. Each profile
          shows its full component breakdown and computation timestamp.
        </p>
      </section>

      <section>
        <h2 className="mb-3 text-xl font-semibold text-white">Follow the Money</h2>
        <p className="text-slate-300">
          The trace view walks the sourced influence graph breadth-first from any person or organization: roles at
          companies → co-members of those organizations → their funding vehicles, up to three hops. Every hop in
          the chain displays its own citation and verification date. The trace covers the curated registry; it is
          a map of documented relationships, not an allegation of coordination.
        </p>
      </section>

      <section>
        <h2 className="mb-3 text-xl font-semibold text-white">Accuracy, limits &amp; ethics</h2>
        <ul className="list-disc space-y-2 pl-6 text-sm text-slate-300">
          <li>Name-matched records (FEC, EDGAR, ProPublica) can include other people with the same name — always verify via the linked original record.</li>
          <li>Net worths are estimates by their cited publishers and move with markets.</li>
          <li>Aircraft positions only appear while a transponder is publicly broadcasting; blocked or re-registered aircraft may not appear. Jet attributions reflect public reporting, and registrations change — hence the verification dates.</li>
          <li>The tracker covers public figures (≥ $10M net worth threshold) using exclusively public records, in the tradition of OpenSecrets, LittleSis, and ProPublica.</li>
          <li>Found an error? Every datum links to its source — corrections to the registry are a one-line change in <code className="rounded bg-panel-2 px-1">src/lib/people.ts</code>.</li>
        </ul>
      </section>
    </article>
  );
}
