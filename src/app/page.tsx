import Link from "next/link";
import { SearchBar } from "@/components/SearchBar";
import { TopList } from "@/components/TopList";

export default function Home() {
  return (
    <div className="space-y-16">
      {/* Hero */}
      <section className="relative pt-10 text-center sm:pt-16">
        <div className="mx-auto mb-5 inline-flex items-center gap-2 rounded-full border border-line bg-surface/60 px-3 py-1 text-xs text-muted">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald" />
          Live public-records data · every fact sourced &amp; timestamped
        </div>
        <h1 className="mx-auto max-w-3xl text-balance text-4xl font-bold tracking-tight sm:text-6xl">
          Follow the power.
          <br />
          <span className="bg-gradient-to-r from-brand via-brand-soft to-violet bg-clip-text text-transparent">
            Verify every source.
          </span>
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-pretty text-base text-muted sm:text-lg">
          See the public influence footprint of any billionaire, celebrity, or politician — private jets,
          political donations, investments, and the nonprofits they fund.
        </p>

        <div className="mt-9">
          <SearchBar autoFocus />
        </div>

        <div className="mt-5 flex flex-wrap items-center justify-center gap-2 text-sm">
          <span className="text-faint">Try:</span>
          {[
            ["Elon Musk", "elon-musk"],
            ["Taylor Swift", "taylor-swift"],
            ["Bill Gates", "bill-gates"],
            ["Donald Trump", "donald-trump"],
          ].map(([name, slug]) => (
            <Link
              key={slug}
              href={`/person/${slug}`}
              className="rounded-full border border-line bg-surface/50 px-3 py-1 text-muted transition hover:border-brand/50 hover:text-fg"
            >
              {name}
            </Link>
          ))}
        </div>
      </section>

      {/* Feature strip */}
      <section className="grid gap-3 sm:grid-cols-3">
        {[
          { icon: "✈️", title: "Private jet movements", body: "Live aircraft positions from public ADS-B data, refreshed every minute." },
          { icon: "🗳️", title: "Money in politics", body: "Itemized FEC donations and lobbying filings, linked to the original records." },
          { icon: "💰", title: "Follow the money", body: "Trace the full chain of funding and connections from any person in one click." },
        ].map((f) => (
          <div key={f.title} className="card p-5">
            <div className="mb-2 text-2xl">{f.icon}</div>
            <h3 className="font-semibold">{f.title}</h3>
            <p className="mt-1 text-sm text-muted">{f.body}</p>
          </div>
        ))}
      </section>

      {/* Top 10 */}
      <section>
        <div className="mb-5 flex items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Top 10 most influential</h2>
            <p className="mt-1 text-sm text-muted">Ranked by Influence Score — wealth, network, political &amp; institutional power.</p>
          </div>
          <Link href="/network" className="hidden shrink-0 text-sm text-brand-soft underline decoration-brand/30 sm:block">
            Explore the network →
          </Link>
        </div>
        <TopList />
      </section>
    </div>
  );
}
