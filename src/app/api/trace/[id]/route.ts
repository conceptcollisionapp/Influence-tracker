import { NextRequest, NextResponse } from "next/server";
import { followTheMoney } from "@/lib/trace";

export const dynamic = "force-dynamic";

/** "Follow the Money": BFS trace of sourced money/influence edges from a person or org. */
export async function GET(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const depthParam = Number(req.nextUrl.searchParams.get("depth") ?? "3");
  const depth = Number.isFinite(depthParam) ? Math.min(Math.max(depthParam, 1), 4) : 3;
  const trace = followTheMoney(id, depth);
  if (!trace) {
    return NextResponse.json({ error: `No registry entry for "${id}"` }, { status: 404 });
  }
  return NextResponse.json({
    data: trace,
    fetchedAt: trace.generatedAt,
    live: false,
    sources: [{ name: "Curated registry (each edge individually sourced)", url: "/methodology" }],
  });
}
