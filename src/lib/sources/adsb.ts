import { cached, TTL } from "../cache";
import { fetchJson } from "../http";

/**
 * Live aircraft data from crowd-sourced public ADS-B receivers.
 *  - Live position: adsb.lol open API (free, no key) — https://api.adsb.lol/docs
 *  - Registration metadata: adsbdb (free, no key) — https://www.adsbdb.com
 * All positions are broadcast openly by aircraft transponders and aggregated
 * by volunteer receiver networks; we link each tail to public trackers.
 */

export interface LiveFlight {
  registration: string;
  hex?: string;
  callsign?: string;
  airborne: boolean;
  lat?: number;
  lon?: number;
  altitudeFt?: number | "ground";
  groundSpeedKt?: number;
  /** ISO timestamp of the position report. */
  seenAt?: string;
  trackerUrl: string;
}

interface AdsbLolResponse {
  ac?: Array<{
    hex?: string;
    flight?: string;
    r?: string;
    lat?: number;
    lon?: number;
    alt_baro?: number | "ground";
    gs?: number;
    seen?: number; // seconds since last message
  }>;
  now?: number;
}

export async function getLiveFlight(registration: string): Promise<LiveFlight | undefined> {
  return cached(`adsb:${registration}`, TTL.flights, async () => {
    const res = await fetchJson<AdsbLolResponse>(
      `https://api.adsb.lol/v2/reg/${encodeURIComponent(registration)}`,
      { timeoutMs: 8_000 },
    );
    if (!res.ok) return undefined;
    const ac = res.data?.ac?.[0];
    const trackerUrl = ac?.hex
      ? `https://globe.adsbexchange.com/?icao=${ac.hex}`
      : `https://globe.airplanes.live/?q=${encodeURIComponent(registration)}`;
    if (!ac) {
      return { registration, airborne: false, trackerUrl };
    }
    const seenAt =
      res.data?.now && typeof ac.seen === "number"
        ? new Date(res.data.now - ac.seen * 1000).toISOString()
        : new Date().toISOString();
    return {
      registration,
      hex: ac.hex,
      callsign: ac.flight?.trim(),
      airborne: ac.alt_baro !== "ground",
      lat: ac.lat,
      lon: ac.lon,
      altitudeFt: ac.alt_baro,
      groundSpeedKt: ac.gs,
      seenAt,
      trackerUrl,
    };
  });
}

export interface AircraftMeta {
  registration: string;
  hex?: string;
  type?: string;
  manufacturer?: string;
  registeredOwner?: string;
  photoUrl?: string;
  sourceUrl: string;
}

interface AdsbDbResponse {
  response?: {
    aircraft?: {
      mode_s?: string;
      registration?: string;
      manufacturer?: string;
      type?: string;
      registered_owner?: string;
      url_photo_thumbnail?: string;
    };
  };
}

export async function getAircraftMeta(registration: string): Promise<AircraftMeta | undefined> {
  return cached(`adsbdb:${registration}`, TTL.aircraftMeta, async () => {
    const res = await fetchJson<AdsbDbResponse>(
      `https://api.adsbdb.com/v0/aircraft/${encodeURIComponent(registration)}`,
      { timeoutMs: 8_000 },
    );
    const a = res.data?.response?.aircraft;
    if (!res.ok || !a) return undefined;
    return {
      registration: a.registration ?? registration,
      hex: a.mode_s,
      type: a.type,
      manufacturer: a.manufacturer,
      registeredOwner: a.registered_owner,
      photoUrl: a.url_photo_thumbnail,
      sourceUrl: `https://www.adsbdb.com/`,
    };
  });
}
