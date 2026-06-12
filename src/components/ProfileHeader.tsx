"use client";

/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import type { ScoreBreakdown } from "@/lib/score";
import type { Person } from "@/lib/types";
import { ScoreBadge } from "./ScoreBadge";
import { Timestamp } from "./Timestamp";
import { ErrorNote, Money, Source } from "./Ui";
import { useApi } from "./useApi";

interface ProfileData {
  person: Person | null;
  wiki: {
    title: string;
    description?: string;
    extract?: string;
    thumbnail?: string;
    pageUrl: string;
  } | null;
  liveNetWorth: { amountUSD: number; pointInTime?: string; source: string } | null;
  score: ScoreBreakdown | null;
}

export function ProfileHeader({ person, wikiTitle }: { person?: Person; wikiTitle?: string }) {
  const slug = person?.slug ?? "lookup";
  const url = `/api/profile/${slug}${wikiTitle && !person ? `?wiki=${encodeURIComponent(wikiTitle)}` : ""}`;
  const { env, loading } = useApi<ProfileData>(url);
  const wiki = env?.data?.wiki;
  const liveNW = env?.data?.liveNetWorth;
  const score = env?.data?.score;
  const name = person?.name ?? wiki?.title ?? wikiTitle ?? "";

  const netWorthUSD = liveNW?.amountUSD ?? (person?.netWorthUSDBillion ? person.netWorthUSDBillion * 1e9 : undefined);

  return (
    <header className="rounded-2xl border border-edge bg-panel/70 p-6">
      <div className="flex flex-wrap items-start gap-6">
        {wiki?.thumbnail ? (
          <img
            src={wiki.thumbnail}
            alt={name}
            className="h-28 w-28 rounded-xl border border-edge object-cover"
          />
        ) : (
          <div className="grid h-28 w-28 place-items-center rounded-xl border border-edge bg-panel-2 text-3xl font-bold text-slate-500">
            {name
              .split(" ")
              .map((w) => w[0])
              .slice(0, 2)
              .join("")}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <h1 className="text-3xl font-bold text-white">{name}</h1>
          <p className="text-slate-300">{person?.title ?? wiki?.description}</p>
          <div className="mt-2 flex flex-wrap items-center gap-3 text-sm">
            {netWorthUSD !== undefined && (
              <span className="text-slate-300">
                Net worth {liveNW ? "" : "≈ "}
                <strong className="text-gold"><Money usd={netWorthUSD} /></strong>
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
            {env && <Timestamp iso={env.fetchedAt} kind={env.live ? "live" : "curated"} label="profile" />}
          </div>
          {wiki?.extract && <p className="mt-3 max-w-3xl text-sm leading-relaxed text-slate-400">{wiki.extract}</p>}
          {loading && <p className="mt-2 text-xs text-slate-500">loading live profile…</p>}
        </div>
        <div className="flex flex-col items-end gap-3">
          {score && <ScoreBadge score={score} />}
          {person && (
            <Link
              href={`/trace/${person.slug}`}
              className="rounded-lg border border-gold/50 bg-gold/10 px-4 py-2 text-sm font-semibold text-gold transition hover:bg-gold/20"
            >
              💰 Follow the Money →
            </Link>
          )}
        </div>
      </div>
      <ErrorNote errors={env?.errors} />
    </header>
  );
}
