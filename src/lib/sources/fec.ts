import { cached, TTL } from "../cache";
import { FEC_API_KEY, fetchJson } from "../http";

/**
 * Federal Election Commission campaign-finance data.
 * Docs: https://api.open.fec.gov/developers/  (free key; DEMO_KEY fallback)
 * Every record links back to the matching fec.gov search so users can verify.
 */

export interface DonationRecord {
  committee: string;
  committeeId?: string;
  committeeUrl?: string;
  amount: number;
  date?: string;
  receiptUrl: string;
  contributorName: string;
  employer?: string;
}

export interface DonationSummary {
  totalUSD: number;
  count: number;
  records: DonationRecord[];
  searchUrl: string;
  note?: string;
}

interface ScheduleAResponse {
  results?: Array<{
    contributor_name?: string;
    contributor_employer?: string;
    contribution_receipt_amount?: number;
    contribution_receipt_date?: string;
    committee?: { name?: string; committee_id?: string };
    committee_id?: string;
    pdf_url?: string;
  }>;
  pagination?: { count?: number };
}

function fecSearchUrl(name: string): string {
  return `https://www.fec.gov/data/receipts/individual-contributions/?contributor_name=${encodeURIComponent(name)}`;
}

export async function getDonations(name: string, aliases: string[] = []): Promise<DonationSummary | undefined> {
  const key = `fec:${name.toLowerCase()}`;
  return cached(key, TTL.donations, async () => {
    const names = [name, ...aliases.filter((a) => a !== name)].slice(0, 3);
    const params = new URLSearchParams({
      api_key: FEC_API_KEY,
      per_page: "50",
      sort: "-contribution_receipt_date",
      is_individual: "true",
    });
    for (const n of names) params.append("contributor_name", n);
    const res = await fetchJson<ScheduleAResponse>(
      `https://api.open.fec.gov/v1/schedules/schedule_a/?${params.toString()}`,
      { timeoutMs: 8_000 },
    );
    if (!res.ok || !res.data?.results) return undefined;

    const records: DonationRecord[] = res.data.results
      .filter((r) => typeof r.contribution_receipt_amount === "number")
      .map((r) => {
        const committeeId = r.committee?.committee_id ?? r.committee_id;
        return {
          committee: r.committee?.name ?? "Unknown committee",
          committeeId,
          committeeUrl: committeeId ? `https://www.fec.gov/data/committee/${committeeId}/` : undefined,
          amount: r.contribution_receipt_amount as number,
          date: r.contribution_receipt_date ?? undefined,
          receiptUrl: fecSearchUrl(name),
          contributorName: r.contributor_name ?? name,
          employer: r.contributor_employer ?? undefined,
        };
      });

    return {
      totalUSD: records.reduce((s, r) => s + r.amount, 0),
      count: res.data.pagination?.count ?? records.length,
      records,
      searchUrl: fecSearchUrl(name),
      note:
        FEC_API_KEY === "DEMO_KEY"
          ? "Fetched with FEC DEMO_KEY (rate-limited). Set FEC_API_KEY for production use."
          : undefined,
    };
  });
}

/** Senate Lobbying Disclosure Act filings for an organization (free, no key). */
export interface LobbyingFiling {
  registrant: string;
  client: string;
  year?: number;
  period?: string;
  incomeUSD?: number;
  expensesUSD?: number;
  url: string;
  postedAt?: string;
}

interface LdaResponse {
  results?: Array<{
    filing_uuid?: string;
    filing_year?: number;
    filing_period_display?: string;
    income?: string | null;
    expenses?: string | null;
    dt_posted?: string;
    registrant?: { name?: string };
    client?: { name?: string };
    filing_document_url?: string;
  }>;
}

export async function getLobbying(clientName: string): Promise<LobbyingFiling[] | undefined> {
  return cached(`lda:${clientName.toLowerCase()}`, TTL.donations, async () => {
    const url = `https://lda.senate.gov/api/v1/filings/?client_name=${encodeURIComponent(clientName)}&ordering=-dt_posted&page_size=10`;
    const res = await fetchJson<LdaResponse>(url, { timeoutMs: 8_000 });
    if (!res.ok || !res.data?.results) return undefined;
    return res.data.results.map((f) => ({
      registrant: f.registrant?.name ?? "Unknown registrant",
      client: f.client?.name ?? clientName,
      year: f.filing_year,
      period: f.filing_period_display,
      incomeUSD: f.income ? Number(f.income) : undefined,
      expensesUSD: f.expenses ? Number(f.expenses) : undefined,
      url:
        f.filing_document_url ??
        `https://lda.senate.gov/filings/public/filing/search/?search=filing&client_name=${encodeURIComponent(clientName)}`,
      postedAt: f.dt_posted,
    }));
  });
}
