import { NextRequest, NextResponse } from "next/server";
import { findPerson } from "@/lib/people";
import { computeScore } from "@/lib/score";
import { getDonations } from "@/lib/sources/fec";
import { getWikidataNetWorth, getWikiProfile } from "@/lib/sources/wikipedia";

export const dynamic = "force-dynamic";
export const maxDuration = 20;

/**
 * Aggregated profile: curated registry entry + live Wikipedia summary +
 * live Wikidata net worth + influence score (refined by live FEC giving).
 * Works for registry slugs; arbitrary people are served by ?wiki=<title>.
 */
export async function GET(req: NextRequest, ctx: { params: Promise<{ slug: string }> }) {
  const { slug } = await ctx.params;
  const wikiTitle = req.nextUrl.searchParams.get("wiki") ?? undefined;
  const person = findPerson(slug);
  const errors: string[] = [];

  if (!person && !wikiTitle) {
    return NextResponse.json({ error: "Unknown person" }, { status: 404 });
  }

  const title = person?.wikipedia ?? wikiTitle!;
  const [wiki, donations] = await Promise.all([
    getWikiProfile(title).catch((e) => {
      errors.push(String(e));
      return undefined;
    }),
    person
      ? getDonations(person.name, person.searchAliases).catch((e) => {
          errors.push(String(e));
          return undefined;
        })
      : Promise.resolve(undefined),
  ]);

  let liveNetWorth: { amountUSD: number; pointInTime?: string; source: string } | undefined;
  if (wiki?.wikidataId) {
    try {
      liveNetWorth = await getWikidataNetWorth(wiki.wikidataId);
    } catch (e) {
      errors.push(String(e));
    }
  }

  const score = person
    ? computeScore(person, {
        netWorthUSDBillion: liveNetWorth ? liveNetWorth.amountUSD / 1e9 : undefined,
        politicalGivingUSD: donations?.totalUSD,
      })
    : undefined;

  return NextResponse.json({
    data: {
      person: person ?? null,
      wiki: wiki ?? null,
      liveNetWorth: liveNetWorth ?? null,
      score: score ?? null,
    },
    fetchedAt: new Date().toISOString(),
    live: Boolean(wiki),
    sources: [
      { name: "Wikipedia", url: `https://en.wikipedia.org/wiki/${title}` },
      ...(liveNetWorth ? [{ name: "Wikidata", url: liveNetWorth.source }] : []),
    ],
    errors: errors.length ? errors : undefined,
  });
}
