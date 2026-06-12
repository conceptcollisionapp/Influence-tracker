import { NextRequest, NextResponse } from "next/server";
import { findPerson } from "@/lib/people";
import { searchNonprofits } from "@/lib/sources/propublica";

export const dynamic = "force-dynamic";
export const maxDuration = 20;

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const slug = sp.get("slug");
  const q = sp.get("q");
  const person = slug ? findPerson(slug) : undefined;
  const errors: string[] = [];

  // Query ProPublica for each curated nonprofit by name, or a free-text query.
  const queries = person
    ? person.organizations.filter((o) => o.type === "nonprofit" || o.type === "fund").map((o) => o.name)
    : q
      ? [q]
      : [];
  if (!queries.length && person) queries.push(person.name); // fall back to namesake foundations

  const results = (
    await Promise.all(
      queries.slice(0, 4).map(async (query) => ({
        query,
        orgs: await searchNonprofits(query).catch((e) => {
          errors.push(String(e));
          return undefined;
        }),
      })),
    )
  ).filter(Boolean);

  const anyLive = results.some((r) => r.orgs?.length);
  if (!anyLive) errors.push("ProPublica Nonprofit Explorer unreachable — curated links still available.");

  return NextResponse.json({
    data: { results },
    fetchedAt: new Date().toISOString(),
    live: anyLive,
    sources: [{ name: "ProPublica Nonprofit Explorer (IRS Form 990)", url: "https://projects.propublica.org/nonprofits/" }],
    errors: errors.length ? errors : undefined,
  });
}
