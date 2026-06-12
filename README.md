# Influence Tracker

Track the **public influence footprint** of powerful individuals — billionaires, celebrities, politicians, and other high-net-worth figures (≥ $10M) — with every datum **timestamped** and **hyperlinked to its original public source**.

![stack](https://img.shields.io/badge/Next.js%2015-TypeScript-blue) ![data](https://img.shields.io/badge/data-public%20records%20only-green)

## Features

- **🔍 Search anyone** — curated dossiers for tracked figures, plus live public-records lookup (Wikipedia/Wikidata + FEC + SEC + IRS) for anybody else.
- **✈️ Private jet movements** — publicly reported tail numbers checked against live, crowd-sourced ADS-B data (adsb.lol / adsbdb), auto-refreshing every 60 s, with FAA-registry and FlightAware click-throughs.
- **🗳️ Political donations & lobbying** — itemized FEC Schedule A contributions and Senate LDA lobbying filings, fetched live, every row linked to FEC.gov.
- **📈 Major investments** — SEC EDGAR full-text search for Forms 3/4/13D/13G naming the person, plus each affiliated company's full filing history.
- **🎗️ Nonprofits & philanthropy** — IRS Form 990 data via ProPublica Nonprofit Explorer, linked by EIN.
- **🕸️ Connection network** — force-directed graph of people ↔ organizations; every edge individually sourced and dated.
- **💰 Follow the Money** — one click traces the full documented chain of donations, funding, and connections outward from any person *or organization*, hop by hop, with citations.
- **🏆 Top 10 + Influence Score** — transparent 0–100 composite (wealth 40 / network 25 / political 20 / institutional 15), refined by live FEC giving totals; full breakdown and methodology page.
- **⏱️ Timestamps everywhere** — green `live` badges show fetch time; gray `verified` badges show when curated facts were last checked against their linked source.

## Quick start

```bash
npm install
cp .env.example .env   # optional: add a free FEC API key + SEC user agent
npm run dev            # http://localhost:3000
```

Production: `npm run build && npm start`.

> **Note:** live data requires outbound network access to the public APIs below. Without it the app degrades gracefully to the curated, source-linked baseline.

## Data sources (all public, all free)

| Source | Data | Freshness |
|---|---|---|
| [adsb.lol](https://api.adsb.lol/docs) + [adsbdb](https://www.adsbdb.com) + [FAA Registry](https://registry.faa.gov/aircraftinquiry/) | Live aircraft positions & registration | 60 s polling |
| [FEC API](https://api.open.fec.gov/developers/) | Itemized political contributions | live, 30 min cache |
| [Senate LDA](https://lda.senate.gov/system/public/) | Lobbying filings | live, 30 min cache |
| [SEC EDGAR FTS](https://efts.sec.gov/LATEST/search-index?q=) | Insider/ownership filings | live, 30 min cache |
| [ProPublica Nonprofit Explorer](https://projects.propublica.org/nonprofits/api) | IRS Form 990s | live, 6 h cache |
| [Wikipedia / Wikidata](https://www.wikidata.org) | Bios, photos, net worth (P2218) | live, 1 h cache |

## Architecture

```
src/lib/people.ts        Curated registry — every fact has {source, asOf} provenance
src/lib/score.ts         Influence Score (documented weights, live-refined)
src/lib/trace.ts         Follow-the-Money BFS over the sourced graph
src/lib/sources/*.ts     Connectors: FEC, LDA, EDGAR, ProPublica, ADS-B, Wikipedia
src/app/api/*            JSON API (envelope: {data, fetchedAt, live, sources, errors})
src/app/*                Pages: home/search, /top, /network, /person, /lookup, /trace, /methodology
```

In-memory TTL caching keeps upstream APIs within rate limits while staying near-real-time.

## Accuracy & ethics

Public records only, in the tradition of OpenSecrets / LittleSis / ProPublica. Name-matched records may include namesakes — every item links to the original record for verification. Tail-number attributions reflect public reporting and carry verification dates. See **/methodology** in the app for the full statement.
