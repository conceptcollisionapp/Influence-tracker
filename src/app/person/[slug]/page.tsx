import Link from "next/link";
import { notFound } from "next/navigation";
import { ProfileHeader } from "@/components/ProfileHeader";
import { Timestamp } from "@/components/Timestamp";
import { Card, Source } from "@/components/Ui";
import { DonationsSection } from "@/components/sections/DonationsSection";
import { FlightsSection } from "@/components/sections/FlightsSection";
import { InvestmentsSection } from "@/components/sections/InvestmentsSection";
import { NonprofitsSection } from "@/components/sections/NonprofitsSection";
import { findPerson, PEOPLE_BY_SLUG } from "@/lib/people";

export function generateStaticParams() {
  return [...PEOPLE_BY_SLUG.keys()].map((slug) => ({ slug }));
}

export default async function PersonPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const person = findPerson(slug);
  if (!person) notFound();

  return (
    <div className="space-y-6">
      <ProfileHeader person={person} />

      <div className="grid gap-6 lg:grid-cols-2">
        <FlightsSection aircraft={person.aircraft} personName={person.name} />
        <DonationsSection slug={person.slug} name={person.name} />
        <InvestmentsSection slug={person.slug} name={person.name} curatedOrgs={person.organizations} />
        <NonprofitsSection slug={person.slug} name={person.name} curatedOrgs={person.organizations} />
      </div>

      <Card
        title="Documented connections"
        right={
          <Link
            href={`/trace/${person.slug}`}
            className="rounded-md border border-gold/50 bg-gold/10 px-3 py-1 text-xs font-semibold text-gold hover:bg-gold/20"
          >
            💰 Follow the Money →
          </Link>
        }
      >
        {person.connections.length === 0 ? (
          <p className="text-sm text-slate-400">
            No documented person-to-person links in the registry yet — explore the{" "}
            <Link href="/network" className="text-accent-2 underline">full network</Link> instead.
          </p>
        ) : (
          <ul className="grid gap-3 sm:grid-cols-2">
            {person.connections.map((c, i) => {
              const other = findPerson(c.to);
              return (
                <li key={i} className="rounded-lg border border-edge bg-panel-2 p-3 text-sm">
                  <div className="flex items-center justify-between gap-2">
                    <Link href={`/person/${c.to}`} className="font-semibold text-white underline decoration-edge hover:decoration-accent">
                      {other?.name ?? c.to}
                    </Link>
                    <Timestamp iso={c.provenance.asOf} kind="curated" />
                  </div>
                  <p className="mt-1 text-xs text-slate-400">
                    via <span className="text-slate-200">{c.via}</span> — {c.description}
                  </p>
                  <div className="mt-1.5 text-xs">
                    <Source link={c.provenance.source} />
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </Card>
    </div>
  );
}
