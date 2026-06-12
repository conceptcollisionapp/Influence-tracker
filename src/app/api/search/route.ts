import { NextRequest, NextResponse } from "next/server";
import { searchRegistry } from "@/lib/people";
import { searchWikipedia } from "@/lib/sources/wikipedia";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q")?.trim() ?? "";
  if (q.length < 2) {
    return NextResponse.json({ data: { registry: [], wiki: [] }, fetchedAt: new Date().toISOString(), live: false, sources: [] });
  }

  const registry = searchRegistry(q).map((p) => ({
    slug: p.slug,
    name: p.name,
    title: p.title,
    category: p.category,
  }));

  let wiki: Awaited<ReturnType<typeof searchWikipedia>> = [];
  const errors: string[] = [];
  try {
    wiki = await searchWikipedia(q);
  } catch (e) {
    errors.push(e instanceof Error ? e.message : String(e));
  }

  // Don't duplicate registry people in the wiki results.
  const registryNames = new Set(registry.map((r) => r.name.toLowerCase()));
  wiki = wiki.filter((w) => !registryNames.has(w.title.toLowerCase()));

  return NextResponse.json({
    data: { registry, wiki },
    fetchedAt: new Date().toISOString(),
    live: wiki.length > 0,
    sources: [{ name: "Wikipedia search", url: "https://en.wikipedia.org" }],
    errors: errors.length ? errors : undefined,
  });
}
