import { cached, TTL } from "../cache";
import { fetchJson } from "../http";

/**
 * ProPublica Nonprofit Explorer — IRS Form 990 data (free, no key).
 * Docs: https://projects.propublica.org/nonprofits/api
 */

export interface NonprofitRecord {
  name: string;
  ein: string;
  city?: string;
  state?: string;
  /** Click-through to the full IRS filing history. */
  url: string;
  incomeUSD?: number;
  assetsUSD?: number;
  /** Most recent tax period on file, e.g. "2023". */
  latestFilingYear?: number;
}

interface PpSearchResponse {
  organizations?: Array<{
    name?: string;
    ein?: number | string;
    city?: string;
    state?: string;
    income_amount?: number;
    asset_amount?: number;
    tax_period?: number; // e.g. 202312
  }>;
}

export async function searchNonprofits(q: string): Promise<NonprofitRecord[] | undefined> {
  return cached(`pp:${q.toLowerCase()}`, TTL.nonprofits, async () => {
    const res = await fetchJson<PpSearchResponse>(
      `https://projects.propublica.org/nonprofits/api/v2/search.json?q=${encodeURIComponent(q)}`,
      { timeoutMs: 15_000 },
    );
    if (!res.ok || !res.data?.organizations) return undefined;
    return res.data.organizations.slice(0, 8).map((o) => {
      const ein = String(o.ein ?? "");
      return {
        name: o.name ?? "Unknown organization",
        ein,
        city: o.city,
        state: o.state,
        url: `https://projects.propublica.org/nonprofits/organizations/${ein}`,
        incomeUSD: o.income_amount,
        assetsUSD: o.asset_amount,
        latestFilingYear: o.tax_period ? Math.floor(o.tax_period / 100) : undefined,
      };
    });
  });
}
