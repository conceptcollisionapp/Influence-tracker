import { PersonProfile } from "@/components/PersonProfile";

/**
 * Live public-records lookup for anyone outside the curated registry:
 * Wikipedia/Wikidata profile + FEC + EDGAR + ProPublica, matched by name.
 */
export default async function LookupPage({ params }: { params: Promise<{ title: string }> }) {
  const { title } = await params;
  return <PersonProfile wikiTitle={decodeURIComponent(title)} />;
}
