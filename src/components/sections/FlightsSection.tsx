"use client";

import type { Aircraft } from "@/lib/types";
import type { AircraftMeta, LiveFlight } from "@/lib/sources/adsb";
import { Timestamp } from "../Timestamp";
import { Card, Source } from "../Ui";
import { useApi } from "../useApi";

function JetCard({ jet }: { jet: Aircraft }) {
  // Poll every 60s — positions come from public ADS-B receivers.
  const { env, loading } = useApi<{ live: LiveFlight | null; meta: AircraftMeta | null }>(
    `/api/flights/${jet.registration}`,
    60_000,
  );
  const live = env?.data?.live;
  const meta = env?.data?.meta;

  return (
    <div className="rounded-lg border border-edge bg-panel-2 p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="font-semibold text-white">
            {jet.registration} <span className="ml-1 font-normal text-slate-400">{jet.model}</span>
          </p>
          {meta?.registeredOwner && (
            <p className="text-xs text-slate-400">Registered owner: {meta.registeredOwner}</p>
          )}
        </div>
        <div className="flex items-center gap-2">
          {live ? (
            live.airborne ? (
              <span className="rounded-full border border-emerald-500/50 bg-emerald-500/15 px-2.5 py-0.5 text-xs font-medium text-emerald-300">
                ✈ Airborne now
              </span>
            ) : (
              <span className="rounded-full border border-edge bg-panel px-2.5 py-0.5 text-xs text-slate-400">
                Not currently transmitting / on ground
              </span>
            )
          ) : loading ? (
            <span className="text-xs text-slate-500">checking live ADS-B…</span>
          ) : (
            <span className="text-xs text-slate-500">live feed unavailable</span>
          )}
          {live?.seenAt && live.airborne && <Timestamp iso={live.seenAt} kind="live" label="position" />}
        </div>
      </div>

      {live?.airborne && live.lat !== undefined && (
        <p className="mt-2 text-sm tabular-nums text-slate-300">
          {live.lat.toFixed(3)}, {live.lon?.toFixed(3)} · {live.altitudeFt === "ground" ? "ground" : `${live.altitudeFt?.toLocaleString()} ft`}
          {live.groundSpeedKt ? ` · ${Math.round(live.groundSpeedKt)} kt` : ""}
          {live.callsign ? ` · callsign ${live.callsign}` : ""}
        </p>
      )}

      {jet.note && <p className="mt-2 text-xs text-slate-400">{jet.note}</p>}

      <div className="mt-3 flex flex-wrap items-center gap-3 text-xs">
        <Source link={jet.provenance.source} />
        {live && <a href={live.trackerUrl} target="_blank" rel="noopener noreferrer" className="text-accent-2 underline">Live map ↗</a>}
        <a
          href={`https://www.flightaware.com/live/flight/${jet.registration}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-accent-2 underline"
        >
          FlightAware history ↗
        </a>
        <Timestamp iso={jet.provenance.asOf} kind="curated" label="tail # verified" />
      </div>
    </div>
  );
}

export function FlightsSection({ aircraft, personName }: { aircraft: Aircraft[]; personName: string }) {
  return (
    <Card title="Private jet movements" right={<span className="text-[11px] text-slate-500">public ADS-B transponder data · auto-refreshes every 60s</span>}>
      {aircraft.length === 0 ? (
        <p className="text-sm text-slate-400">
          No aircraft publicly tied to {personName} in our registry (some owners use charter or fractional
          programs like NetJets, which aren&apos;t individually attributable).{" "}
          <a
            className="text-accent-2 underline"
            href={`https://registry.faa.gov/aircraftinquiry/Search/NameResult?nametxt=${encodeURIComponent(personName)}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            Search the FAA registry by name ↗
          </a>
        </p>
      ) : (
        <div className="space-y-3">
          {aircraft.map((j) => (
            <JetCard key={j.registration} jet={j} />
          ))}
        </div>
      )}
    </Card>
  );
}
