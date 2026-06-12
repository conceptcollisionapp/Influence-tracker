import { NextResponse } from "next/server";
import { fullNetwork } from "@/lib/trace";

export const dynamic = "force-dynamic";

export async function GET() {
  const graph = fullNetwork();
  return NextResponse.json({
    data: graph,
    fetchedAt: graph.generatedAt,
    live: false,
    sources: [{ name: "Curated registry (each edge individually sourced)", url: "/methodology" }],
  });
}
