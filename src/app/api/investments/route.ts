import { NextRequest, NextResponse } from "next/server";
import { findPerson } from "@/lib/people";
import { edgarFtsUiUrl, searchFilings } from "@/lib/sources/sec";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const slug = sp.get("slug");
  const nameParam = sp.get("name");
  const person = slug ? findPerson(slug) : undefined;
  const name = person?.name ?? nameParam;
  if (!name) return NextResponse.json({ error: "name or slug required" }, { status: 400 });

  const errors: string[] = [];
  // Insider/ownership forms naming this person (Form 4 trades, 13D/G stakes).
  const filings = await searchFilings(name, "4,3,13D,13G,SC 13D,SC 13G").catch((e) => {
    errors.push(String(e));
    return undefined;
  });
  if (!filings) errors.push("SEC EDGAR full-text search unreachable — direct search link provided.");

  return NextResponse.json({
    data: {
      filings: filings ?? null,
      edgarSearchUrl: edgarFtsUiUrl(name),
      edgarInsiderUrl: edgarFtsUiUrl(name, "4"),
      companies: (person?.organizations ?? [])
        .filter((o) => o.type === "company")
        .map((o) => ({ id: o.id, name: o.name, role: o.role, ticker: o.ticker, links: o.links, provenance: o.provenance })),
    },
    fetchedAt: new Date().toISOString(),
    live: Boolean(filings),
    sources: [{ name: "SEC EDGAR full-text search", url: "https://efts.sec.gov/LATEST/search-index?q=" }],
    errors: errors.length ? errors : undefined,
  });
}
