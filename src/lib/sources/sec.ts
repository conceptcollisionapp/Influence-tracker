import { cached, TTL } from "../cache";
import { fetchJson, SEC_USER_AGENT } from "../http";

/**
 * SEC EDGAR full-text search — public filings mentioning a person
 * (Forms 4 insider trades, 13D/13G stakes, proxy statements...).
 * Docs: https://efts.sec.gov/LATEST/search-index?q=  /  https://www.sec.gov/os/webmaster-faq#developers
 */

export interface FilingRecord {
  form: string;
  filedAt: string;
  company: string;
  cik?: string;
  description?: string;
  /** Click-through to the actual filing on sec.gov. */
  url: string;
}

interface EdgarFtsResponse {
  hits?: {
    hits?: Array<{
      _id?: string;
      _source?: {
        file_type?: string;
        file_date?: string;
        display_names?: string[];
        ciks?: string[];
        file_description?: string;
      };
    }>;
  };
}

function filingUrl(id: string | undefined, cik: string | undefined): string {
  // _id format: "0001234567-24-000123:doc.htm"
  if (id && cik) {
    const [accession, doc] = id.split(":");
    const accNoDashes = accession.replace(/-/g, "");
    return `https://www.sec.gov/Archives/edgar/data/${Number(cik)}/${accNoDashes}/${doc ?? ""}`;
  }
  return "https://efts.sec.gov/LATEST/search-index?q=";
}

export async function searchFilings(personName: string, forms?: string): Promise<FilingRecord[] | undefined> {
  const key = `edgar:${personName.toLowerCase()}:${forms ?? "all"}`;
  return cached(key, TTL.filings, async () => {
    const params = new URLSearchParams({ q: `"${personName}"` });
    if (forms) params.set("forms", forms);
    const res = await fetchJson<EdgarFtsResponse>(`https://efts.sec.gov/LATEST/search-index?${params.toString()}`, {
      headers: { "User-Agent": SEC_USER_AGENT },
      timeoutMs: 15_000,
    });
    if (!res.ok || !res.data?.hits?.hits) return undefined;
    return res.data.hits.hits.slice(0, 10).map((h) => {
      const s = h._source ?? {};
      const cik = s.ciks?.[0];
      return {
        form: s.file_type ?? "Filing",
        filedAt: s.file_date ?? "",
        company: s.display_names?.[0] ?? "Unknown filer",
        cik,
        description: s.file_description,
        url: filingUrl(h._id, cik),
      };
    });
  });
}

/** Human-browsable EDGAR full-text search UI link for the same query. */
export function edgarFtsUiUrl(personName: string, forms?: string): string {
  return `https://www.sec.gov/edgar/search/#/q=${encodeURIComponent(`"${personName}"`)}${forms ? `&forms=${forms}` : ""}`;
}
