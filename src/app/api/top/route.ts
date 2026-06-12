import { NextResponse } from "next/server";
import { rankPeople } from "@/lib/score";

export const dynamic = "force-dynamic";

/**
 * Top-10 most influential, ranked by the documented Influence Score.
 *
 * Computed synchronously from the curated registry so it renders instantly
 * and reliably (no blocking on rate-limited upstream APIs). Live FEC giving
 * still refines individual profile scores when a profile page loads.
 */
export function GET() {
  const ranked = rankPeople().slice(0, 10);

  return NextResponse.json({
    data: ranked.map(({ person, score }, i) => ({
      rank: i + 1,
      slug: person.slug,
      name: person.name,
      title: person.title,
      category: person.category,
      netWorthUSDBillion: score.inputs.netWorthUSDBillion,
      score,
    })),
    fetchedAt: new Date().toISOString(),
    live: false,
    sources: [{ name: "Influence Score methodology", url: "/methodology" }],
  });
}
