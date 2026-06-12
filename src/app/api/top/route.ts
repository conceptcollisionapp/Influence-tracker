import { NextResponse } from "next/server";
import { rankPeople } from "@/lib/score";
import { getDonations } from "@/lib/sources/fec";
import { PEOPLE } from "@/lib/people";
import { cached, TTL } from "@/lib/cache";

export const dynamic = "force-dynamic";

/** Top-10 most influential, ranked by the documented Influence Score. */
export async function GET() {
  const errors: string[] = [];

  // Refine scores with live FEC giving totals (best-effort, cached).
  const giving = await cached("top:giving", TTL.donations, async () => {
    const map = new Map<string, number>();
    await Promise.all(
      PEOPLE.map(async (p) => {
        try {
          const d = await getDonations(p.name, p.searchAliases);
          if (d) map.set(p.slug, d.totalUSD);
        } catch {
          /* best-effort */
        }
      }),
    );
    return map;
  }).catch((e) => {
    errors.push(String(e));
    return undefined;
  });

  const ranked = rankPeople(giving ?? undefined).slice(0, 10);

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
    live: Boolean(giving && giving.size > 0),
    sources: [
      { name: "Influence Score methodology", url: "/methodology" },
      { name: "FEC", url: "https://www.fec.gov/data/" },
    ],
    errors: errors.length ? errors : undefined,
  });
}
