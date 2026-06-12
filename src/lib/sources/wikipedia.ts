import { cached, TTL } from "../cache";
import { fetchJson } from "../http";

export interface WikiProfile {
  title: string;
  description?: string;
  extract?: string;
  thumbnail?: string;
  pageUrl: string;
  wikidataId?: string;
  fetchedAt: string;
}

interface WikiSummaryResponse {
  title: string;
  description?: string;
  extract?: string;
  thumbnail?: { source: string };
  content_urls?: { desktop?: { page?: string } };
  wikibase_item?: string;
  type?: string;
}

export async function getWikiProfile(title: string): Promise<WikiProfile | undefined> {
  return cached(`wiki:${title}`, TTL.profile, async () => {
    const res = await fetchJson<WikiSummaryResponse>(
      `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`,
    );
    if (!res.ok || !res.data) return undefined;
    const d = res.data;
    return {
      title: d.title,
      description: d.description,
      extract: d.extract,
      thumbnail: d.thumbnail?.source,
      pageUrl: d.content_urls?.desktop?.page ?? `https://en.wikipedia.org/wiki/${encodeURIComponent(title)}`,
      wikidataId: d.wikibase_item,
      fetchedAt: new Date().toISOString(),
    };
  });
}

export interface WikiSearchHit {
  title: string;
  description?: string;
  thumbnail?: string;
  pageUrl: string;
}

interface WikiSearchResponse {
  pages?: Array<{
    title: string;
    description?: string;
    thumbnail?: { url?: string };
    key: string;
  }>;
}

/** Live people search via Wikipedia's REST search (used for non-registry lookups). */
export async function searchWikipedia(q: string): Promise<WikiSearchHit[]> {
  return cached(`wikisearch:${q.toLowerCase()}`, TTL.profile, async () => {
    const res = await fetchJson<WikiSearchResponse>(
      `https://en.wikipedia.org/w/rest.php/v1/search/page?q=${encodeURIComponent(q)}&limit=8`,
    );
    if (!res.ok || !res.data?.pages) return [];
    return res.data.pages.map((p) => ({
      title: p.title,
      description: p.description,
      thumbnail: p.thumbnail?.url ? `https:${p.thumbnail.url.startsWith("//") ? p.thumbnail.url : `//${p.thumbnail.url}`}` : undefined,
      pageUrl: `https://en.wikipedia.org/wiki/${encodeURIComponent(p.key)}`,
    }));
  });
}

/** Live net worth from Wikidata (property P2218), when present. */
export interface WikidataNetWorth {
  amountUSD: number;
  pointInTime?: string;
  source: string;
}

interface WikidataEntityResponse {
  entities?: Record<
    string,
    {
      claims?: {
        P2218?: Array<{
          mainsnak?: { datavalue?: { value?: { amount?: string; unit?: string } } };
          qualifiers?: { P585?: Array<{ datavalue?: { value?: { time?: string } } }> };
        }>;
      };
    }
  >;
}

export async function getWikidataNetWorth(qid: string): Promise<WikidataNetWorth | undefined> {
  return cached(`wikidata-networth:${qid}`, TTL.profile, async () => {
    const res = await fetchJson<WikidataEntityResponse>(
      `https://www.wikidata.org/wiki/Special:EntityData/${qid}.json`,
    );
    const claims = res.data?.entities?.[qid]?.claims?.P2218;
    if (!res.ok || !claims?.length) return undefined;
    // Prefer the most recent point-in-time qualifier.
    let best: { amount: number; time?: string } | undefined;
    for (const c of claims) {
      const v = c.mainsnak?.datavalue?.value;
      if (!v?.amount || v.unit !== "http://www.wikidata.org/entity/Q4917") continue; // Q4917 = USD
      const time = c.qualifiers?.P585?.[0]?.datavalue?.value?.time?.replace(/^\+/, "");
      const amount = Number(v.amount);
      if (!Number.isFinite(amount)) continue;
      if (!best || (time ?? "") > (best.time ?? "")) best = { amount, time };
    }
    if (!best) return undefined;
    return {
      amountUSD: best.amount,
      pointInTime: best.time,
      source: `https://www.wikidata.org/wiki/${qid}`,
    };
  });
}
