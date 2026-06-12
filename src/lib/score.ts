import { PEOPLE } from "./people";
import type { Person } from "./types";

/**
 * Influence Score — a transparent 0–100 composite of power and reach.
 * Methodology (documented on /methodology):
 *
 *   40%  Wealth        log-scaled net worth ($10M floor → $500B ceiling)
 *   25%  Network       degree in the documented connection graph + org count
 *   20%  Political     disclosed political giving (log-scaled, FEC) + PAC control
 *   15%  Institutional control of public companies / large nonprofits / media
 *
 * Live inputs (FEC totals, Wikidata net worth) refine the curated baseline at
 * request time; every component is reported so users can see the breakdown.
 */

export interface ScoreBreakdown {
  wealth: number; // 0..40
  network: number; // 0..25
  political: number; // 0..20
  institutional: number; // 0..15
  total: number; // 0..100
  inputs: {
    netWorthUSDBillion?: number;
    connectionCount: number;
    organizationCount: number;
    pacCount: number;
    disclosedPoliticalGivingUSD?: number;
  };
  computedAt: string;
}

function logScale(value: number, floor: number, ceiling: number): number {
  if (value <= floor) return 0;
  const v = Math.min(value, ceiling);
  return (Math.log10(v) - Math.log10(floor)) / (Math.log10(ceiling) - Math.log10(floor));
}

export function computeScore(
  person: Person,
  live: { netWorthUSDBillion?: number; politicalGivingUSD?: number } = {},
): ScoreBreakdown {
  const netWorth = live.netWorthUSDBillion ?? person.netWorthUSDBillion;
  // Wealth: $0.01B (=$10M, the tracker's floor) .. $500B
  const wealth = 40 * logScale((netWorth ?? 0.01) * 1e9, 1e7, 5e11);

  // Network: documented person-to-person links + breadth of org footprint.
  const connectionCount = person.connections.length + inboundConnections(person.slug);
  const organizationCount = person.organizations.length;
  const network = 25 * Math.min(1, (connectionCount * 1.5 + organizationCount) / 12);

  // Political: PAC/candidate-committee control + disclosed giving volume.
  const pacCount = person.organizations.filter((o) => o.type === "pac").length;
  const giving = live.politicalGivingUSD ?? 0;
  const political = 20 * Math.min(1, 0.35 * Math.min(pacCount, 2) + 0.65 * logScale(giving, 1e3, 3e8));

  // Institutional: public-company control, major nonprofits, media ownership.
  const companies = person.organizations.filter((o) => o.type === "company").length;
  const nonprofits = person.organizations.filter((o) => o.type === "nonprofit" || o.type === "fund").length;
  const media = person.organizations.filter((o) => o.type === "media").length;
  const institutional = 15 * Math.min(1, (companies * 1.2 + nonprofits + media * 1.5) / 6);

  const total = wealth + network + political + institutional;
  return {
    wealth: round1(wealth),
    network: round1(network),
    political: round1(political),
    institutional: round1(institutional),
    total: round1(total),
    inputs: {
      netWorthUSDBillion: netWorth,
      connectionCount,
      organizationCount,
      pacCount,
      disclosedPoliticalGivingUSD: live.politicalGivingUSD,
    },
    computedAt: new Date().toISOString(),
  };
}

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}

/** Connections are stored on one side; count edges pointing at this person too. */
function inboundConnections(slug: string): number {
  let n = 0;
  for (const p of PEOPLE) {
    if (p.slug === slug) continue;
    if (p.connections.some((c) => c.to === slug)) n++;
  }
  return n;
}

export interface RankedPerson {
  person: Person;
  score: ScoreBreakdown;
}

export function rankPeople(liveGiving?: Map<string, number>): RankedPerson[] {
  return PEOPLE.map((person) => ({
    person,
    score: computeScore(person, { politicalGivingUSD: liveGiving?.get(person.slug) }),
  })).sort((a, b) => b.score.total - a.score.total);
}
