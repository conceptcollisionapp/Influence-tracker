/** A link back to the original public source of a piece of data. */
export interface SourceLink {
  name: string;
  url: string;
}

/** Every datum carries provenance: where it came from and when. */
export interface Provenance {
  source: SourceLink;
  /** ISO timestamp: when this fact was last fetched or editorially verified. */
  asOf: string;
  /** "live" = fetched from the source API just now; "curated" = editorially maintained baseline. */
  kind: "live" | "curated";
}

export type PersonCategory = "billionaire" | "celebrity" | "politician" | "investor";

export interface Aircraft {
  registration: string;
  model: string;
  /** Reporting that publicly tied this tail number to the person. */
  provenance: Provenance;
  note?: string;
}

export type OrgType = "company" | "nonprofit" | "pac" | "fund" | "media";

export interface Organization {
  id: string;
  name: string;
  type: OrgType;
  role: string; // person's relationship, e.g. "CEO", "Founder", "Major donor"
  /** Primary click-through (company site, EDGAR, ProPublica, FEC...). */
  links: SourceLink[];
  /** SEC ticker, used to build live EDGAR links/queries. */
  ticker?: string;
  note?: string;
  provenance: Provenance;
}

export interface Connection {
  /** slug of the other person */
  to: string;
  /** organization or mechanism that links them */
  via: string;
  description: string;
  provenance: Provenance;
}

export interface Person {
  slug: string;
  name: string;
  /** Wikipedia page title, for live profile/photo lookup. */
  wikipedia: string;
  /** Wikidata QID, for live net-worth lookup. */
  wikidata?: string;
  category: PersonCategory;
  title: string; // short descriptor, e.g. "CEO, Tesla & SpaceX"
  /** Curated approximate net worth in USD billions, with source. Live Wikidata value overrides when available. */
  netWorthUSDBillion?: number;
  netWorthProvenance?: Provenance;
  aircraft: Aircraft[];
  organizations: Organization[];
  connections: Connection[];
  /** Name variants to use when querying FEC / EDGAR / ProPublica. */
  searchAliases?: string[];
}

/** Standard envelope for every API response: data + freshness + provenance. */
export interface ApiEnvelope<T> {
  data: T;
  fetchedAt: string;
  live: boolean;
  sources: SourceLink[];
  errors?: string[];
}
