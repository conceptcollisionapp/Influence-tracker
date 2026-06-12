import { NextRequest, NextResponse } from "next/server";
import { findPerson } from "@/lib/people";
import { getDonations, getLobbying } from "@/lib/sources/fec";

export const dynamic = "force-dynamic";
export const maxDuration = 20;

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const slug = sp.get("slug");
  const nameParam = sp.get("name");
  const person = slug ? findPerson(slug) : undefined;
  const name = person?.name ?? nameParam;
  if (!name) return NextResponse.json({ error: "name or slug required" }, { status: 400 });

  const errors: string[] = [];
  const donations = await getDonations(name, person?.searchAliases).catch((e) => {
    errors.push(String(e));
    return undefined;
  });
  if (!donations) errors.push("FEC API unreachable — showing direct search links instead.");

  // Lobbying: company-level LDA filings for the person's major organizations.
  const lobbyTargets = (person?.organizations ?? [])
    .filter((o) => o.type === "company")
    .slice(0, 3)
    .map((o) => o.name);
  const lobbying = (
    await Promise.all(
      lobbyTargets.map(async (client) => ({
        client,
        filings: await getLobbying(client).catch((e) => {
          errors.push(String(e));
          return undefined;
        }),
      })),
    )
  ).filter((l) => l.filings?.length);

  return NextResponse.json({
    data: {
      donations: donations ?? null,
      lobbying,
      fecSearchUrl: `https://www.fec.gov/data/receipts/individual-contributions/?contributor_name=${encodeURIComponent(name)}`,
      opensecretsUrl: `https://www.opensecrets.org/search?q=${encodeURIComponent(name)}`,
      ldaSearchUrl: "https://lda.senate.gov/system/public/",
    },
    fetchedAt: new Date().toISOString(),
    live: Boolean(donations),
    sources: [
      { name: "FEC", url: "https://www.fec.gov/data/" },
      { name: "Senate LDA", url: "https://lda.senate.gov" },
    ],
    errors: errors.length ? errors : undefined,
  });
}
