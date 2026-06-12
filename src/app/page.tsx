import Link from "next/link";
import { SearchBar } from "@/components/SearchBar";
import { TopList } from "@/components/TopList";
import { PEOPLE } from "@/lib/people";

export default function Home() {
  const stats = {
    people: PEOPLE.length,
    orgs: new Set(PEOPLE.flatMap((p) => p.organizations.map((o) => o.id))).size,
    jets: PEOPLE.reduce((n, p) => n + p.aircraft.length, 0),
  };
  return (
    <div className="space-y-12">
      <section className="pt-10 text-center">
        <h1 className="mx-auto max-w-3xl text-4xl font-bold tracking-tight text-white sm:text-5xl">
          Follow the power. <span className="text-accent">Verify the sources.</span>
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-slate-300">
          The public influence footprint of billionaires, celebrities, and politicians — private-jet movements,
          political donations, lobbying, investments, and nonprofit funding. Every datum timestamped and linked to
          the original public record.
        </p>
        <div className="mt-8">
          <SearchBar autoFocus />
        </div>
        <p className="mt-3 text-xs text-slate-500">
          {stats.people} tracked dossiers · {stats.orgs} linked organizations · {stats.jets} registered aircraft —
          plus live public-records lookup for anyone else.
        </p>
      </section>

      <section>
        <div className="mb-4 flex items-baseline justify-between">
          <h2 className="text-xl font-semibold text-white">Top 10 most influential</h2>
          <Link href="/network" className="text-sm text-accent-2 underline">
            Explore the full connection network →
          </Link>
        </div>
        <TopList />
      </section>
    </div>
  );
}
