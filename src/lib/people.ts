import type { Aircraft, Connection, Organization, OrgType, Person, Provenance, SourceLink } from "./types";

/**
 * Curated registry of notable high-net-worth individuals.
 *
 * Everything here is drawn from public records and public reporting, and every
 * entry links back to its original source (FAA registry, SEC EDGAR, FEC,
 * ProPublica Nonprofit Explorer, official sites). `asOf` is the date the fact
 * was last editorially verified against the linked source — live API data
 * fetched at request time supplements/overrides this baseline.
 *
 * The registry seeds the Top-10 index and connection graph; the search box
 * additionally resolves *any* public figure live via Wikipedia/Wikidata,
 * FEC, ProPublica and SEC full-text search.
 */

const REGISTRY_REVIEWED = "2025-12-15"; // last full editorial review of this file

function curated(source: SourceLink, asOf: string = REGISTRY_REVIEWED): Provenance {
  return { source, asOf, kind: "curated" };
}

function faa(reg: string): SourceLink {
  return {
    name: "FAA Aircraft Registry",
    url: `https://registry.faa.gov/aircraftinquiry/Search/NNumberResult?nNumberTxt=${reg.replace(/^N/i, "")}`,
  };
}

function jet(registration: string, model: string, asOf: string, note?: string): Aircraft {
  return { registration, model, provenance: curated(faa(registration), asOf), note };
}

function edgarByTicker(ticker: string): SourceLink {
  // EDGAR's company browse accepts a ticker in the CIK parameter.
  return {
    name: "SEC EDGAR filings",
    url: `https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=${ticker}&type=&dateb=&owner=include&count=40`,
  };
}

function propublicaSearch(orgName: string): SourceLink {
  return {
    name: "ProPublica Nonprofit Explorer",
    url: `https://projects.propublica.org/nonprofits/search?q=${encodeURIComponent(orgName)}`,
  };
}

function fecCommitteeSearch(name: string): SourceLink {
  return {
    name: "FEC committee records",
    url: `https://www.fec.gov/data/committees/?q=${encodeURIComponent(name)}`,
  };
}

function org(
  id: string,
  name: string,
  type: OrgType,
  role: string,
  links: SourceLink[],
  opts: { ticker?: string; note?: string; asOf?: string } = {},
): Organization {
  return {
    id,
    name,
    type,
    role,
    links,
    ticker: opts.ticker,
    note: opts.note,
    provenance: curated(links[0], opts.asOf ?? REGISTRY_REVIEWED),
  };
}

function company(id: string, name: string, role: string, ticker: string, site: string, note?: string): Organization {
  return org(id, name, "company", role, [edgarByTicker(ticker), { name: "Official site", url: site }], {
    ticker,
    note,
  });
}

function privateCo(id: string, name: string, role: string, site: string, note?: string): Organization {
  return org(id, name, "company", role, [{ name: "Official site", url: site }], { note });
}

function nonprofit(id: string, name: string, role: string, site?: string, note?: string): Organization {
  const links = [propublicaSearch(name)];
  if (site) links.push({ name: "Official site", url: site });
  return org(id, name, "nonprofit", role, links, { note });
}

function pac(id: string, name: string, role: string, note?: string): Organization {
  return org(id, name, "pac", role, [fecCommitteeSearch(name)], { note });
}

function link(to: string, via: string, description: string, source: SourceLink, asOf?: string): Connection {
  return { to, via, description, provenance: curated(source, asOf) };
}

const wiki = (title: string): SourceLink => ({
  name: "Wikipedia (with citations)",
  url: `https://en.wikipedia.org/wiki/${title}`,
});

const forbes = (slug: string): SourceLink => ({
  name: "Forbes profile",
  url: `https://www.forbes.com/profile/${slug}/`,
});

export const PEOPLE: Person[] = [
  {
    slug: "elon-musk",
    name: "Elon Musk",
    wikipedia: "Elon_Musk",
    category: "billionaire",
    title: "CEO, Tesla & SpaceX; owner, X / xAI",
    netWorthUSDBillion: 400,
    netWorthProvenance: curated(forbes("elon-musk")),
    aircraft: [
      jet("N628TS", "Gulfstream G650ER", "2024-06-01", "Tail number widely reported in coverage of the @ElonJet tracker."),
    ],
    organizations: [
      company("tesla", "Tesla, Inc.", "CEO", "TSLA", "https://www.tesla.com"),
      privateCo("spacex", "SpaceX", "Founder & CEO", "https://www.spacex.com"),
      privateCo("xcorp", "X Corp.", "Owner", "https://x.com"),
      privateCo("xai", "xAI", "Founder", "https://x.ai"),
      nonprofit("musk-foundation", "Musk Foundation", "Founder & donor"),
      pac("america-pac", "America PAC", "Founder & principal funder", "Super PAC supporting 2024 Trump campaign; filings on FEC.gov."),
    ],
    connections: [
      link("peter-thiel", "PayPal", "Co-founders of PayPal (X.com / Confinity merger, 2000).", wiki("PayPal")),
      link("donald-trump", "America PAC", "Musk founded and funded America PAC supporting Trump's 2024 campaign.", fecCommitteeSearch("America PAC")),
      link("larry-page", "SpaceX", "Google (Alphabet) led a $1B investment in SpaceX in 2015.", wiki("SpaceX"), "2015-01-20"),
      link("larry-ellison", "Tesla, Inc.", "Ellison served on Tesla's board of directors (2018–2022).", wiki("Larry_Ellison"), "2022-08-01"),
    ],
    searchAliases: ["Elon Musk", "Elon R. Musk"],
  },
  {
    slug: "jeff-bezos",
    name: "Jeff Bezos",
    wikipedia: "Jeff_Bezos",
    category: "billionaire",
    title: "Founder & executive chairman, Amazon; founder, Blue Origin",
    netWorthUSDBillion: 240,
    netWorthProvenance: curated(forbes("jeff-bezos")),
    aircraft: [
      jet("N271DV", "Gulfstream G650ER", "2024-06-01", "Registered to Poplar Glen LLC; publicly reported as Bezos's jet."),
    ],
    organizations: [
      company("amazon", "Amazon.com, Inc.", "Founder & executive chairman", "AMZN", "https://www.amazon.com"),
      privateCo("blue-origin", "Blue Origin", "Founder", "https://www.blueorigin.com"),
      privateCo("washington-post", "The Washington Post", "Owner (via Nash Holdings)", "https://www.washingtonpost.com"),
      nonprofit("bezos-earth-fund", "Bezos Earth Fund", "Founder & funder", "https://www.bezosearthfund.org", "$10B climate-philanthropy commitment (2020)."),
      nonprofit("day-one-fund", "Bezos Day One Fund", "Founder & funder", "https://www.bezosdayonefund.org"),
    ],
    connections: [
      link("mackenzie-scott", "Amazon.com, Inc.", "Co-built Amazon; divorced 2019 with Scott retaining a major AMZN stake.", wiki("MacKenzie_Scott"), "2019-07-05"),
      link("bill-gates", "Breakthrough Energy Ventures", "Both are investors in Gates-led Breakthrough Energy Ventures.", { name: "Breakthrough Energy", url: "https://www.breakthroughenergy.org" }, "2016-12-12"),
    ],
    searchAliases: ["Jeff Bezos", "Jeffrey P. Bezos"],
  },
  {
    slug: "bill-gates",
    name: "Bill Gates",
    wikipedia: "Bill_Gates",
    category: "billionaire",
    title: "Co-founder, Microsoft; chair, Gates Foundation",
    netWorthUSDBillion: 105,
    netWorthProvenance: curated(forbes("bill-gates")),
    aircraft: [
      jet("N887WM", "Gulfstream G650ER", "2024-06-01", "Registered via Challenger Administration LLC; publicly reported."),
      jet("N194WM", "Gulfstream G650ER", "2024-06-01", "Second G650ER publicly reported in Gates's fleet."),
    ],
    organizations: [
      company("microsoft", "Microsoft Corporation", "Co-founder; former CEO & chairman", "MSFT", "https://www.microsoft.com"),
      org("gates-foundation", "Bill & Melinda Gates Foundation", "nonprofit", "Co-chair & trustee", [
        { name: "ProPublica Nonprofit Explorer (EIN 56-2618866)", url: "https://projects.propublica.org/nonprofits/organizations/562618866" },
        { name: "Official site", url: "https://www.gatesfoundation.org" },
      ]),
      privateCo("cascade", "Cascade Investment LLC", "Owner (personal investment vehicle)", "https://en.wikipedia.org/wiki/Cascade_Investment"),
      privateCo("breakthrough-energy", "Breakthrough Energy", "Founder", "https://www.breakthroughenergy.org"),
      privateCo("terrapower", "TerraPower", "Founder & chairman", "https://www.terrapower.com"),
    ],
    connections: [
      link("warren-buffett", "Bill & Melinda Gates Foundation", "Buffett has donated tens of billions in Berkshire stock to the foundation; trustee until 2021.", { name: "Gates Foundation", url: "https://www.gatesfoundation.org" }, "2021-06-23"),
      link("jeff-bezos", "Breakthrough Energy Ventures", "Bezos is an investor in Gates-led Breakthrough Energy Ventures.", { name: "Breakthrough Energy", url: "https://www.breakthroughenergy.org" }, "2016-12-12"),
      link("michael-bloomberg", "Breakthrough Energy Ventures", "Bloomberg is a Breakthrough Energy investor; the two foundations have co-funded global public-health programs.", { name: "Breakthrough Energy", url: "https://www.breakthroughenergy.org" }, "2016-12-12"),
    ],
    searchAliases: ["Bill Gates", "William H. Gates III", "William Gates"],
  },
  {
    slug: "mark-zuckerberg",
    name: "Mark Zuckerberg",
    wikipedia: "Mark_Zuckerberg",
    category: "billionaire",
    title: "Founder & CEO, Meta Platforms",
    netWorthUSDBillion: 200,
    netWorthProvenance: curated(forbes("mark-zuckerberg")),
    aircraft: [
      jet("N68885", "Gulfstream G650", "2024-08-01", "Publicly reported in 2024 SEC security-cost disclosures coverage."),
    ],
    organizations: [
      company("meta", "Meta Platforms, Inc.", "Founder, chairman & CEO", "META", "https://about.meta.com"),
      privateCo("czi", "Chan Zuckerberg Initiative", "Co-founder & co-CEO", "https://chanzuckerberg.com", "Structured as an LLC; affiliated 501(c)(3) entities file public Form 990s."),
    ],
    connections: [
      link("peter-thiel", "Meta Platforms, Inc.", "Thiel was Facebook's first outside investor (2004) and a board member until 2022.", wiki("Peter_Thiel"), "2022-02-07"),
    ],
    searchAliases: ["Mark Zuckerberg"],
  },
  {
    slug: "warren-buffett",
    name: "Warren Buffett",
    wikipedia: "Warren_Buffett",
    category: "investor",
    title: "Chairman & CEO, Berkshire Hathaway",
    netWorthUSDBillion: 145,
    netWorthProvenance: curated(forbes("warren-buffett")),
    aircraft: [],
    organizations: [
      company("berkshire", "Berkshire Hathaway Inc.", "Chairman & CEO", "BRK-A", "https://www.berkshirehathaway.com"),
      org("gates-foundation", "Bill & Melinda Gates Foundation", "nonprofit", "Largest outside donor; former trustee", [
        { name: "ProPublica Nonprofit Explorer (EIN 56-2618866)", url: "https://projects.propublica.org/nonprofits/organizations/562618866" },
        { name: "Official site", url: "https://www.gatesfoundation.org" },
      ]),
      nonprofit("stb-foundation", "Susan Thompson Buffett Foundation", "Funder"),
    ],
    connections: [
      link("bill-gates", "Bill & Melinda Gates Foundation", "Has pledged the bulk of his fortune via annual Berkshire-stock gifts to the foundation.", { name: "Berkshire Hathaway news releases", url: "https://www.berkshirehathaway.com/news/news.html" }, "2024-06-28"),
    ],
    searchAliases: ["Warren Buffett", "Warren E. Buffett"],
  },
  {
    slug: "larry-ellison",
    name: "Larry Ellison",
    wikipedia: "Larry_Ellison",
    category: "billionaire",
    title: "Co-founder & CTO, Oracle",
    netWorthUSDBillion: 230,
    netWorthProvenance: curated(forbes("larry-ellison")),
    aircraft: [],
    organizations: [
      company("oracle", "Oracle Corporation", "Co-founder, chairman & CTO", "ORCL", "https://www.oracle.com"),
      nonprofit("ellison-medical", "Lawrence Ellison Foundation", "Founder & funder"),
      privateCo("ellison-institute", "Ellison Institute of Technology", "Founder", "https://eit.org"),
    ],
    connections: [
      link("elon-musk", "Tesla, Inc.", "Served on Tesla's board (2018–2022); disclosed large personal TSLA stake.", wiki("Larry_Ellison"), "2022-08-01"),
      link("donald-trump", "Republican fundraising", "Hosted a 2020 Trump campaign fundraiser at his Rancho Mirage estate.", wiki("Larry_Ellison"), "2020-02-19"),
    ],
    searchAliases: ["Larry Ellison", "Lawrence J. Ellison", "Lawrence Ellison"],
  },
  {
    slug: "bernard-arnault",
    name: "Bernard Arnault",
    wikipedia: "Bernard_Arnault",
    category: "billionaire",
    title: "Chairman & CEO, LVMH",
    netWorthUSDBillion: 180,
    netWorthProvenance: curated(forbes("bernard-arnault")),
    aircraft: [],
    organizations: [
      privateCo("lvmh", "LVMH Moët Hennessy Louis Vuitton", "Chairman & CEO", "https://www.lvmh.com", "Listed on Euronext Paris (MC.PA); not an SEC registrant."),
      privateCo("fondation-lv", "Fondation Louis Vuitton", "Founder (corporate foundation)", "https://www.fondationlouisvuitton.fr"),
      privateCo("agache", "Agache (family holding)", "Controlling shareholder", "https://en.wikipedia.org/wiki/Agache_(company)"),
    ],
    connections: [],
    searchAliases: ["Bernard Arnault"],
  },
  {
    slug: "michael-bloomberg",
    name: "Michael Bloomberg",
    wikipedia: "Michael_Bloomberg",
    category: "politician",
    title: "Founder, Bloomberg LP; former NYC mayor",
    netWorthUSDBillion: 105,
    netWorthProvenance: curated(forbes("michael-bloomberg")),
    aircraft: [],
    organizations: [
      privateCo("bloomberg-lp", "Bloomberg L.P.", "Co-founder & majority owner", "https://www.bloomberg.com/company"),
      nonprofit("bloomberg-philanthropies", "Bloomberg Philanthropies", "Founder & funder", "https://www.bloomberg.org"),
      pac("mike-bloomberg-2020", "Mike Bloomberg 2020, Inc.", "Candidate committee (2020 presidential run)", "Self-funded over $1B; itemized on FEC.gov."),
    ],
    connections: [
      link("bill-gates", "Breakthrough Energy Ventures", "Breakthrough Energy investor; Bloomberg Philanthropies and the Gates Foundation co-fund public-health initiatives.", { name: "Bloomberg Philanthropies", url: "https://www.bloomberg.org" }, "2016-12-12"),
      link("george-soros", "Democratic Party committees", "Both rank among the largest publicly disclosed Democratic political donors (FEC records).", { name: "FEC individual contributions", url: "https://www.fec.gov/data/receipts/individual-contributions/" }),
    ],
    searchAliases: ["Michael Bloomberg", "Michael R. Bloomberg", "Mike Bloomberg"],
  },
  {
    slug: "george-soros",
    name: "George Soros",
    wikipedia: "George_Soros",
    category: "investor",
    title: "Founder, Soros Fund Management & Open Society Foundations",
    netWorthUSDBillion: 7,
    netWorthProvenance: curated(forbes("george-soros"), "2025-06-01"),
    aircraft: [],
    organizations: [
      privateCo("soros-fund", "Soros Fund Management", "Founder & chairman", "https://www.sorosfundmgmt.com", "Family office; 13F filings public on EDGAR."),
      nonprofit("osf", "Open Society Foundations", "Founder & chair (handed to Alex Soros, 2023)", "https://www.opensocietyfoundations.org", "Has received the majority of Soros's fortune (~$32B transferred)."),
      pac("democracy-pac", "Democracy PAC", "Founder & principal funder"),
    ],
    connections: [
      link("michael-bloomberg", "Democratic Party committees", "Both rank among the largest publicly disclosed Democratic political donors (FEC records).", { name: "FEC individual contributions", url: "https://www.fec.gov/data/receipts/individual-contributions/" }),
    ],
    searchAliases: ["George Soros"],
  },
  {
    slug: "peter-thiel",
    name: "Peter Thiel",
    wikipedia: "Peter_Thiel",
    category: "investor",
    title: "Co-founder, PayPal & Palantir; partner, Founders Fund",
    netWorthUSDBillion: 20,
    netWorthProvenance: curated(forbes("peter-thiel")),
    aircraft: [],
    organizations: [
      company("palantir", "Palantir Technologies", "Co-founder & chairman", "PLTR", "https://www.palantir.com"),
      privateCo("founders-fund", "Founders Fund", "Partner", "https://foundersfund.com"),
      nonprofit("thiel-foundation", "Thiel Foundation", "Founder", "https://www.thielfoundation.org"),
    ],
    connections: [
      link("elon-musk", "PayPal", "Co-founders of PayPal; both members of the so-called 'PayPal Mafia'.", wiki("PayPal")),
      link("mark-zuckerberg", "Meta Platforms, Inc.", "First outside investor in Facebook (2004); board member until 2022.", wiki("Peter_Thiel"), "2022-02-07"),
      link("donald-trump", "Trump campaign donations", "Donated $1.25M supporting Trump's 2016 campaign; spoke at the 2016 RNC.", { name: "FEC individual contributions", url: "https://www.fec.gov/data/receipts/individual-contributions/?contributor_name=thiel%2C+peter" }, "2016-10-15"),
    ],
    searchAliases: ["Peter Thiel", "Peter A. Thiel"],
  },
  {
    slug: "larry-page",
    name: "Larry Page",
    wikipedia: "Larry_Page",
    category: "billionaire",
    title: "Co-founder, Google / Alphabet",
    netWorthUSDBillion: 170,
    netWorthProvenance: curated(forbes("larry-page")),
    aircraft: [],
    organizations: [
      company("alphabet", "Alphabet Inc.", "Co-founder; board member; controlling shareholder", "GOOGL", "https://abc.xyz"),
      nonprofit("page-foundation", "Carl Victor Page Memorial Foundation", "Founder & funder"),
    ],
    connections: [
      link("elon-musk", "SpaceX", "Google (Alphabet), under Page, led a $1B investment in SpaceX in 2015.", wiki("SpaceX"), "2015-01-20"),
    ],
    searchAliases: ["Larry Page", "Lawrence Page", "Lawrence E. Page"],
  },
  {
    slug: "mackenzie-scott",
    name: "MacKenzie Scott",
    wikipedia: "MacKenzie_Scott",
    category: "billionaire",
    title: "Philanthropist; major Amazon shareholder",
    netWorthUSDBillion: 32,
    netWorthProvenance: curated(forbes("mackenzie-scott")),
    aircraft: [],
    organizations: [
      company("amazon", "Amazon.com, Inc.", "Major shareholder (post-2019 divorce settlement)", "AMZN", "https://www.amazon.com"),
      privateCo("yield-giving", "Yield Giving", "Founder", "https://yieldgiving.com", "Publishes a public database of all gifts — $19B+ donated to date."),
    ],
    connections: [
      link("jeff-bezos", "Amazon.com, Inc.", "Co-built Amazon; ex-spouse holding a major AMZN stake.", wiki("MacKenzie_Scott"), "2019-07-05"),
    ],
    searchAliases: ["MacKenzie Scott", "MacKenzie Bezos"],
  },
  {
    slug: "donald-trump",
    name: "Donald Trump",
    wikipedia: "Donald_Trump",
    category: "politician",
    title: "47th U.S. President; owner, Trump Organization",
    netWorthUSDBillion: 6,
    netWorthProvenance: curated(forbes("donald-trump")),
    aircraft: [
      jet("N757AF", "Boeing 757-200", "2024-11-01", "'Trump Force One', registered to DJT Operations I LLC."),
    ],
    organizations: [
      privateCo("trump-org", "The Trump Organization", "Owner", "https://www.trump.com"),
      company("tmtg", "Trump Media & Technology Group", "Majority shareholder", "DJT", "https://tmtgcorp.com"),
      pac("save-america", "Save America", "Leadership PAC"),
      pac("trump-2024", "Donald J. Trump for President 2024", "Candidate committee"),
    ],
    connections: [
      link("elon-musk", "America PAC", "Musk founded and funded America PAC supporting Trump's 2024 campaign.", fecCommitteeSearch("America PAC")),
      link("peter-thiel", "Trump campaign donations", "Thiel donated $1.25M supporting the 2016 campaign.", { name: "FEC individual contributions", url: "https://www.fec.gov/data/receipts/individual-contributions/?contributor_name=thiel%2C+peter" }, "2016-10-15"),
      link("larry-ellison", "Republican fundraising", "Ellison hosted a 2020 Trump campaign fundraiser.", wiki("Larry_Ellison"), "2020-02-19"),
      link("kim-kardashian", "White House clemency advocacy", "Kardashian lobbied Trump directly on criminal-justice clemency cases (2018–2020).", wiki("Kim_Kardashian"), "2020-12-23"),
    ],
    searchAliases: ["Donald Trump", "Donald J. Trump"],
  },
  {
    slug: "taylor-swift",
    name: "Taylor Swift",
    wikipedia: "Taylor_Swift",
    category: "celebrity",
    title: "Musician & businesswoman",
    netWorthUSDBillion: 1.6,
    netWorthProvenance: curated(forbes("taylor-swift")),
    aircraft: [
      jet("N621MM", "Dassault Falcon 7X", "2024-02-01", "Reported retained after she sold her Falcon 900 (N898TS) in Jan 2024."),
    ],
    organizations: [
      privateCo("tas-rights", "TAS Rights Management", "Owner", "https://en.wikipedia.org/wiki/Taylor_Swift", "Holding company managing Swift's IP and trademarks."),
      privateCo("taylor-swift-productions", "Taylor Swift Productions", "Owner", "https://en.wikipedia.org/wiki/Taylor_Swift_Productions"),
    ],
    connections: [],
    searchAliases: ["Taylor Swift", "Taylor A. Swift"],
  },
  {
    slug: "oprah-winfrey",
    name: "Oprah Winfrey",
    wikipedia: "Oprah_Winfrey",
    category: "celebrity",
    title: "Media executive & philanthropist",
    netWorthUSDBillion: 3,
    netWorthProvenance: curated(forbes("oprah-winfrey")),
    aircraft: [],
    organizations: [
      privateCo("harpo", "Harpo Productions", "Founder & chairwoman", "https://en.wikipedia.org/wiki/Harpo_Productions"),
      privateCo("own", "OWN: Oprah Winfrey Network", "Co-founder", "https://www.oprah.com/app/own-tv.html"),
      nonprofit("oprah-foundation", "Oprah Winfrey Charitable Foundation", "Founder & funder"),
      nonprofit("owla", "Oprah Winfrey Leadership Academy Foundation", "Founder & funder"),
    ],
    connections: [],
    searchAliases: ["Oprah Winfrey", "Oprah G. Winfrey"],
  },
  {
    slug: "drake",
    name: "Drake",
    wikipedia: "Drake_(musician)",
    category: "celebrity",
    title: "Musician & entrepreneur",
    netWorthUSDBillion: 0.25,
    netWorthProvenance: curated({ name: "Celebrity Net Worth (estimate)", url: "https://www.celebritynetworth.com/richest-celebrities/singers/drake-net-worth/" }),
    aircraft: [
      jet("N767CJ", "Boeing 767-200ER", "2024-06-01", "'Air Drake', gifted/branded via Cargojet partnership (2019)."),
    ],
    organizations: [
      privateCo("ovo", "OVO (October's Very Own)", "Co-founder", "https://octobersveryown.com"),
      privateCo("dreamcrew", "DreamCrew", "Co-founder", "https://www.dreamcrew.com"),
    ],
    connections: [],
    searchAliases: ["Drake", "Aubrey Graham", "Aubrey Drake Graham"],
  },
  {
    slug: "kim-kardashian",
    name: "Kim Kardashian",
    wikipedia: "Kim_Kardashian",
    category: "celebrity",
    title: "Founder, SKIMS & SKKY Partners",
    netWorthUSDBillion: 1.7,
    netWorthProvenance: curated(forbes("kim-kardashian")),
    aircraft: [
      jet("N1980K", "Gulfstream G650ER", "2024-06-01", "'Kim Air', publicly reported custom G650ER."),
    ],
    organizations: [
      privateCo("skims", "SKIMS", "Co-founder", "https://skims.com"),
      privateCo("skky", "SKKY Partners", "Co-founder & managing partner", "https://www.skkypartners.com", "Consumer-focused private-equity firm."),
    ],
    connections: [
      link("donald-trump", "White House clemency advocacy", "Lobbied Trump directly on criminal-justice clemency cases (2018–2020).", wiki("Kim_Kardashian"), "2020-12-23"),
    ],
    searchAliases: ["Kim Kardashian", "Kimberly Kardashian"],
  },
  {
    slug: "nancy-pelosi",
    name: "Nancy Pelosi",
    wikipedia: "Nancy_Pelosi",
    category: "politician",
    title: "U.S. Representative (CA-11); former Speaker of the House",
    netWorthUSDBillion: 0.25,
    netWorthProvenance: curated({
      name: "OpenSecrets personal finances",
      url: "https://www.opensecrets.org/personal-finances/nancy-pelosi/net-worth?cid=N00007360",
    }, "2025-06-01"),
    aircraft: [],
    organizations: [
      pac("nancy-pelosi-for-congress", "Nancy Pelosi for Congress", "Principal campaign committee", "Itemized receipts & disbursements on FEC.gov."),
      pac("pac-to-the-future", "PAC to the Future", "Leadership PAC", "Pelosi's leadership PAC supporting Democratic candidates."),
      org(
        "house-financial-disclosures",
        "U.S. House Financial Disclosures",
        "fund",
        "Annual asset & transaction reports (incl. spouse's equity trades)",
        [{ name: "House Clerk disclosure search", url: "https://disclosures-clerk.house.gov/PublicDisclosure/FinancialDisclosure" }],
        { note: "Members of Congress disclose assets and securities trades annually under the STOCK Act." },
      ),
    ],
    connections: [
      link("george-soros", "Democratic Party committees", "Both rank among the most active publicly disclosed Democratic political donors/fundraisers (FEC records).", { name: "FEC individual contributions", url: "https://www.fec.gov/data/receipts/individual-contributions/?contributor_name=pelosi%2C+nancy" }),
      link("michael-bloomberg", "Democratic Party committees", "Allied through Democratic Party fundraising and committee giving (FEC records).", { name: "FEC committee data", url: "https://www.fec.gov/data/committees/?q=pelosi" }),
    ],
    searchAliases: ["Nancy Pelosi", "Nancy P. Pelosi", "Nancy Patricia Pelosi"],
  },
];

export const PEOPLE_BY_SLUG = new Map(PEOPLE.map((p) => [p.slug, p]));

export function findPerson(slug: string): Person | undefined {
  return PEOPLE_BY_SLUG.get(slug);
}

export function searchRegistry(q: string): Person[] {
  const needle = q.trim().toLowerCase();
  if (!needle) return [];
  return PEOPLE.filter(
    (p) =>
      p.name.toLowerCase().includes(needle) ||
      p.title.toLowerCase().includes(needle) ||
      (p.searchAliases ?? []).some((a) => a.toLowerCase().includes(needle)),
  );
}
