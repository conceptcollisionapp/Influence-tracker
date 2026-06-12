import { NextRequest, NextResponse } from "next/server";
import { getAircraftMeta, getLiveFlight } from "@/lib/sources/adsb";

export const dynamic = "force-dynamic";
export const maxDuration = 20;

export async function GET(_req: NextRequest, ctx: { params: Promise<{ reg: string }> }) {
  const { reg } = await ctx.params;
  const registration = reg.toUpperCase();
  if (!/^[A-Z0-9-]{2,10}$/.test(registration)) {
    return NextResponse.json({ error: "Invalid registration" }, { status: 400 });
  }

  const errors: string[] = [];
  const [live, meta] = await Promise.all([
    getLiveFlight(registration).catch((e) => {
      errors.push(String(e));
      return undefined;
    }),
    getAircraftMeta(registration).catch((e) => {
      errors.push(String(e));
      return undefined;
    }),
  ]);

  return NextResponse.json({
    data: { live: live ?? null, meta: meta ?? null },
    fetchedAt: new Date().toISOString(),
    live: Boolean(live),
    sources: [
      { name: "adsb.lol (live ADS-B)", url: "https://adsb.lol" },
      { name: "adsbdb (registration data)", url: "https://www.adsbdb.com" },
      {
        name: "FAA Registry",
        url: `https://registry.faa.gov/aircraftinquiry/Search/NNumberResult?nNumberTxt=${registration.replace(/^N/, "")}`,
      },
    ],
    errors: errors.length ? errors : undefined,
  });
}
