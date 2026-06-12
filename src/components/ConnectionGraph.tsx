"use client";

import { forceCenter, forceCollide, forceLink, forceManyBody, forceSimulation } from "d3-force";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import type { TraceEdge, TraceNode } from "@/lib/trace";
import { Source } from "./Ui";

interface SimNode extends TraceNode {
  x?: number;
  y?: number;
  vx?: number;
  vy?: number;
}
interface SimLink {
  source: SimNode | string;
  target: SimNode | string;
  edge: TraceEdge;
}

const ORG_COLORS: Record<string, string> = {
  company: "#38bdf8",
  nonprofit: "#34d399",
  pac: "#fb7185",
  fund: "#a78bfa",
  media: "#fbbf24",
};

/** Force-directed graph of people (gold) and organizations (typed colors). */
export function ConnectionGraph({
  nodes,
  edges,
  height = 560,
  highlightId,
}: {
  nodes: TraceNode[];
  edges: TraceEdge[];
  height?: number;
  highlightId?: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(900);
  const [positions, setPositions] = useState<Map<string, { x: number; y: number }>>(new Map());
  const [selected, setSelected] = useState<TraceNode | null>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setWidth(el.clientWidth));
    ro.observe(el);
    setWidth(el.clientWidth);
    return () => ro.disconnect();
  }, []);

  const { simNodes, simLinks } = useMemo(() => {
    const simNodes: SimNode[] = nodes.map((n) => ({ ...n }));
    const byId = new Map(simNodes.map((n) => [n.id, n]));
    const simLinks: SimLink[] = edges
      .filter((e) => byId.has(e.from) && byId.has(e.to))
      .map((e) => ({ source: e.from, target: e.to, edge: e }));
    return { simNodes, simLinks };
  }, [nodes, edges]);

  useEffect(() => {
    const sim = forceSimulation(simNodes)
      .force("charge", forceManyBody().strength(-220))
      .force(
        "link",
        forceLink<SimNode, SimLink>(simLinks)
          .id((d) => d.id)
          .distance(90)
          .strength(0.4),
      )
      .force("center", forceCenter(width / 2, height / 2))
      .force("collide", forceCollide(28))
      .stop();
    // Run synchronously for a stable, deterministic-feeling layout.
    sim.tick(300);
    setPositions(new Map(simNodes.map((n) => [n.id, { x: n.x ?? 0, y: n.y ?? 0 }])));
    return () => void sim.stop();
  }, [simNodes, simLinks, width, height]);

  const selectedEdges = selected ? edges.filter((e) => e.from === selected.id || e.to === selected.id) : [];

  return (
    <div ref={containerRef} className="relative w-full">
      <svg width={width} height={height} className="rounded-xl border border-line bg-bg/60">
        {simLinks.map((l, i) => {
          const s = positions.get(typeof l.source === "string" ? l.source : l.source.id);
          const t = positions.get(typeof l.target === "string" ? l.target : l.target.id);
          if (!s || !t) return null;
          const active = selected && (l.edge.from === selected.id || l.edge.to === selected.id);
          return (
            <line
              key={i}
              x1={s.x}
              y1={s.y}
              x2={t.x}
              y2={t.y}
              stroke={active ? "#7cc5ff" : "#2b3c63"}
              strokeWidth={active ? 2 : 1}
              opacity={selected && !active ? 0.25 : 0.8}
            />
          );
        })}
        {simNodes.map((n) => {
          const p = positions.get(n.id);
          if (!p) return null;
          const isPerson = n.kind === "person";
          const color = isPerson ? "#e8b454" : (ORG_COLORS[n.orgType ?? ""] ?? "#94a3b8");
          const r = isPerson ? 13 : 8;
          const dim = selected && selected.id !== n.id && !selectedEdges.some((e) => e.from === n.id || e.to === n.id);
          return (
            <g
              key={n.id}
              transform={`translate(${p.x},${p.y})`}
              className="cursor-pointer"
              opacity={dim ? 0.3 : 1}
              onClick={() => setSelected(selected?.id === n.id ? null : n)}
            >
              <circle
                r={r}
                fill={color}
                stroke={n.id === highlightId ? "#fff" : "#0b1220"}
                strokeWidth={n.id === highlightId ? 3 : 1.5}
              />
              <text
                y={-r - 5}
                textAnchor="middle"
                className="select-none"
                fill={isPerson ? "#fff" : "#9fb3d4"}
                fontSize={isPerson ? 12 : 10}
                fontWeight={isPerson ? 600 : 400}
              >
                {n.label}
              </text>
            </g>
          );
        })}
      </svg>

      {selected && (
        <div className="absolute right-3 top-3 w-80 max-w-[90%] rounded-xl border border-line bg-surface-2/95 p-4 text-sm shadow-2xl backdrop-blur">
          <div className="mb-1 flex items-start justify-between gap-2">
            <p className="font-semibold text-white">{selected.label}</p>
            <button onClick={() => setSelected(null)} className="text-slate-400 hover:text-white">✕</button>
          </div>
          {selected.subtitle && <p className="mb-2 text-xs text-slate-400">{selected.subtitle}</p>}
          <div className="mb-2 flex flex-wrap gap-2 text-xs">
            {selected.links.map((l) =>
              l.url.startsWith("/") ? (
                <Link key={l.url} href={l.url} className="text-brand-soft underline">
                  {l.name}
                </Link>
              ) : (
                <Source key={l.url} link={l} />
              ),
            )}
            <Link href={`/trace/${selected.id}`} className="text-gold underline">Follow the money →</Link>
          </div>
          {selectedEdges.length > 0 && (
            <ul className="max-h-48 space-y-1.5 overflow-auto border-t border-line pt-2 text-xs text-slate-300">
              {selectedEdges.map((e, i) => (
                <li key={i}>
                  <span className="text-slate-500">{e.from === selected.id ? "→" : "←"}</span>{" "}
                  {(e.from === selected.id ? e.to : e.from).replace(/-/g, " ")} · {e.relation}{" "}
                  <Source link={e.source} className="ml-1" />
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      <div className="mt-2 flex flex-wrap gap-4 text-[11px] text-slate-400">
        <span><span className="mr-1 inline-block h-2.5 w-2.5 rounded-full" style={{ background: "#e8b454" }} />person</span>
        {Object.entries(ORG_COLORS).map(([k, c]) => (
          <span key={k}><span className="mr-1 inline-block h-2 w-2 rounded-full" style={{ background: c }} />{k}</span>
        ))}
        <span className="ml-auto">click a node for sources &amp; details</span>
      </div>
    </div>
  );
}
