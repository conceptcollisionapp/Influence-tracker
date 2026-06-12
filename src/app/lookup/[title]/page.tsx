import { ProfileHeader } from "@/components/ProfileHeader";
import { DonationsSection } from "@/components/sections/DonationsSection";
import { InvestmentsSection } from "@/components/sections/InvestmentsSection";
import { NonprofitsSection } from "@/components/sections/NonprofitsSection";
import { FlightsSection } from "@/components/sections/FlightsSection";

/**
 * Live public-records lookup for anyone outside the curated registry:
 * Wikipedia/Wikidata profile + FEC + EDGAR + ProPublica, matched by name.
 */
export default async function LookupPage({ params }: { params: Promise<{ title: string }> }) {
  const { title } = await params;
  const decoded = decodeURIComponent(title);
  const name = decoded.replace(/_/g, " ").replace(/\s*\(.*\)$/, "");

  return (
    <div className="space-y-6">
      <ProfileHeader wikiTitle={decoded} />
      <p className="rounded-lg border border-edge bg-panel/60 px-4 py-2 text-xs text-slate-400">
        Live lookup: the records below are name-matched against public databases in real time and may include
        other people with the same name — always click through to the original source to verify.
      </p>
      <div className="grid gap-6 lg:grid-cols-2">
        <DonationsSection name={name} />
        <InvestmentsSection name={name} curatedOrgs={[]} />
        <NonprofitsSection name={name} curatedOrgs={[]} />
        <FlightsSection aircraft={[]} personName={name} />
      </div>
    </div>
  );
}
