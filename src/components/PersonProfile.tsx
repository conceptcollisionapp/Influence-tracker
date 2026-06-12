"use client";

/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { useState } from "react";
import type { ScoreBreakdown } from "@/lib/score";
import type { Person } from "@/lib/types";
import { ScoreHero } from "./ScoreBadge";
import { Timestamp } from "./Timestamp";
import { Card, CategoryBadge, EmptyState, ErrorNote, Money, Skeleton, Source } from "./Ui";
import { TraceView } from "./TraceView";
import { useApi } from "./useApi";
import { DonationsSection } from "./sections/DonationsSection";
import { FlightsSection } from "./sections/FlightsSection";
import { InvestmentsSection } from "./sections/InvestmentsSection";
import { NonprofitsSection } from "./sections/NonprofitsSection";

interface ProfileData {
  person: Person | null;
  wiki: { title: string; description?: string; extract?: string; thumbnail?: string; pageUrl: string } | null;
  liveNetWorth: { amountUSD: number; pointInTime?: string; source: string } | null;
  score: ScoreBreakdown | null;
}

type TabId = "overview" | "jets" | "political" | "nonprofits" | "network" | "money";

export function PersonProfile({ person, wikiTitle }: { person?: Person; wikiTitle?: string }) {
  const slug = person?.slug;
  const url = `/api/profile/${slug ?? "lookup"}${wikiTitle && !person ? `?wiki=${encodeURIComponent(wikiTitle)}` : ""}`;
  const { env, loading } = useApi<ProfileData>(url);

  const wiki = env?.data?.wiki;
  const liveNW = env?.data?.liveNetWorth;
  const score = env?.data?.score ?? null;
  const name = person?.name ?? wiki?.title ?? (wikiTitle ? wikiTitle.replace(/_/g, " ") : "");
  const bareName = name.replace(/\s*\(.*\)$/, "");
  const netWorthUSD = liveNW?.amountUSD ?? (person?.netWorthUSDBillion ? person.netWorthUSDBillion * 1e9 : undefined);

  const tabs: Array<{ id: TabId; label: string; icon: string }> = person
    ? [
        { id: "overview", label: "Overview", icon: "📋" },
        { id: "jets", label: "Private Jets", icon: "✈️" },
        { id: "political", label: "Political Influence", icon: "🗳️" },
        { id: "nonprofits", label: "Nonprofits", icon: "🎗️" },
        { id: "network", label: "Network", icon: "🕸️" },
        { id: "money", label: "Follow the Money", icon: "💰" },
      ]
    : [
        { id: "overview", label: "Overview", icon: "📋" },
        { id: "political", label: "Political Influence", icon: "🗳️" },
        { id: "nonprofits", label: "Nonprofits", icon: "🎗️" },
      ];

  const [tab, setTab] = useState<TabId>("overview");

  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <header className="card overflow-hidden">
        <div className="h-24 bg-gradient-to-r from-brand/20 via-violet/15 to-transparent" />
        <div className="flex flex-col gap-5 px-5 pb-5 sm:flex-row sm:items-end sm:gap-6">
          <div className="-mt-12 shrink-0">
            {wiki?.thumbnail ? (
              <img
                src={wiki.thumbnail}
                alt={bareName}
                className="h-28 w-28 rounded-2xl border-4 border-surface object-cover shadow-xl sm:h-32 sm:w-32"
              />
            ) : loading ? (
              <Skeleton className="h-28 w-28 rounded-2xl sm:h-32 sm:w-32" />
            ) : (
              <div className="grid h-28 w-28 place-items-center rounded-2xl border-4 border-surface bg-surface-3 text-4xl font-bold text-faint shadow-xl sm:h-32 sm:w-32">
                {bareName.split(" ").map((w) => w[0]).slice(0, 2).join("")}
              </div>
            )}
          </div>
          <div className="min-w-0 flex-1 sm:pb-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{bareName}</h1>
              {person && <CategoryBadge category={person.category} />}
            </div>
            <p className="mt-0.5 text-muted">{person?.title ?? wiki?.description}</p>
            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm">
              {netWorthUSD !== undefined && (
                <span className="text-muted">
                  Net worth {liveNW ? "" : "≈ "}
                  <strong className="text-gold">
                    <Money usd={netWorthUSD} />
                  </strong>
                </span>
              )}
              {liveNW ? (
                <>
                  <Source link={{ name: "Wikidata", url: liveNW.source }} />
                  {liveNW.pointInTime && <Timestamp iso={liveNW.pointInTime} kind="live" label="as of" />}
                </>
              ) : (
                person?.netWorthProvenance && (
                  <>
                    <Source link={person.netWorthProvenance.source} />
                    <Timestamp iso={person.netWorthProvenance.asOf} kind="curated" />
                  </>
                )
              )}
              {wiki && <Source link={{ name: "Wikipedia", url: wiki.pageUrl }} />}
            </div>
          </div>
          {person && (
            <button
              onClick={() => setTab("money")}
              className="shrink-0 rounded-xl border border-gold/40 bg-gold/10 px-4 py-2.5 text-sm font-semibold text-gold transition hover:bg-gold/20"
            >
              💰 Follow the Money
            </button>
          )}
        </div>
        {wiki?.extract && (
          <p className="border-t border-line-soft px-5 py-4 text-sm leading-relaxed text-muted">{wiki.extract}</p>
        )}
        <ErrorNote errors={env?.errors} />
      </header>

      {/* ── Prominent Influence Score ── */}
      {person &&
        (score ? (
          <ScoreHero score={score} />
        ) : loading ? (
          <Skeleton className="h-40 w-full rounded-2xl" />
        ) : null)}

      {/* ── Tabs ── */}
      <div className="sticky top-[57px] z-20 -mx-4 border-b border-line/70 bg-bg/80 px-4 backdrop-blur-xl sm:mx-0 sm:rounded-xl sm:border sm:px-2 sm:py-1.5">
        <div className="scroll-thin flex gap-1 overflow-x-auto">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-lg px-3.5 py-2 text-sm font-medium transition ${
                tab === t.id ? "bg-brand/15 text-brand-soft" : "text-muted hover:bg-surface-2 hover:text-fg"
              }`}
            >
              <span className="text-xs">{t.icon}</span>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Tab content ── */}
      <div>
        {tab === "overview" && <OverviewTab person={person} name={bareName} />}
        {tab === "jets" && person && <FlightsSection aircraft={person.aircraft} personName={person.name} />}
        {tab === "political" && <DonationsSection slug={slug} name={bareName} curatedOrgs={person?.organizations ?? []} />}
        {tab === "nonprofits" && (
          <NonprofitsSection slug={slug} name={bareName} curatedOrgs={person?.organizations ?? []} />
        )}
        {tab === "network" && person && (
          <Card title="Connection network" right={<span className="text-[11px] text-faint">click any node for sources</span>}>
            <TraceView id={person.slug} view="graph" height={460} />
          </Card>
        )}
        {tab === "money" && person && <TraceView id={person.slug} view="full" height={460} />}
      </div>
    </div>
  );
}

/** Overview: companies/investments + documented connections (or lookup note). */
function OverviewTab({ person, name }: { person?: Person; name: string }) {
  if (!person) {
    return (
      <Card title="About this lookup">
        <p className="text-sm text-muted">
          This is a live public-records lookup for <strong className="text-fg">{name}</strong>. The Political
          Influence and Nonprofits tabs query FEC, SEC, and IRS data by name in real time. Records may include
          other people with the same name — always click through to verify. For a full curated dossier (jets,
          network, Follow the Money), {name} would need to be added to the tracked registry.
        </p>
      </Card>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <InvestmentsSection slug={person.slug} name={person.name} curatedOrgs={person.organizations} />
      <ConnectionsCard person={person} />
    </div>
  );
}

function ConnectionsCard({ person }: { person: Person }) {
  return (
    <Card
      title="Documented connections"
      right={
        <Link
          href={`/trace/${person.slug}`}
          className="rounded-md border border-gold/40 bg-gold/10 px-2.5 py-1 text-xs font-semibold text-gold hover:bg-gold/20"
        >
          💰 Follow the Money →
        </Link>
      }
    >
      {person.connections.length === 0 ? (
        <EmptyState icon="🔗" title="No documented links yet">
          Explore the <Link href="/network" className="text-brand-soft underline">full network →</Link>
        </EmptyState>
      ) : (
        <ul className="space-y-3">
          {person.connections.map((c, i) => (
            <li key={i} className="rounded-xl border border-line bg-surface-2/60 p-3 text-sm">
              <div className="flex items-center justify-between gap-2">
                <Link
                  href={`/person/${c.to}`}
                  className="font-semibold text-fg underline decoration-line hover:decoration-brand"
                >
                  {c.to.replace(/-/g, " ").replace(/\b\w/g, (m) => m.toUpperCase())}
                </Link>
                <Timestamp iso={c.provenance.asOf} kind="curated" />
              </div>
              <p className="mt-1 text-xs text-muted">
                via <span className="text-fg">{c.via}</span> — {c.description}
              </p>
              <div className="mt-1.5 text-xs">
                <Source link={c.provenance.source} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
