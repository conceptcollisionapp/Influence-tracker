import { PEOPLE, PEOPLE_BY_SLUG } from "./people";
import type { Person, SourceLink } from "./types";

/**
 * "Follow the Money" — breadth-first trace of the documented money/influence
 * graph starting from any person or organization. Each hop is a sourced edge
 * (role at an org, funding of a nonprofit/PAC, or a documented connection),
 * so users can walk the full chain and click through to the original records.
 */

export interface TraceNode {
  id: string; // person slug or org id
  kind: "person" | "org";
  label: string;
  subtitle?: string;
  orgType?: string;
  links: SourceLink[];
  depth: number;
}

export interface TraceEdge {
  from: string;
  to: string;
  relation: string; // e.g. "CEO", "Funder", "co-founders of PayPal"
  asOf: string;
  source: SourceLink;
}

export interface TraceResult {
  rootId: string;
  nodes: TraceNode[];
  edges: TraceEdge[];
  maxDepth: number;
  generatedAt: string;
}

interface GraphIndex {
  /** org id -> people connected to it (with their role) */
  orgMembers: Map<string, Array<{ person: Person; role: string }>>;
  orgInfo: Map<string, { name: string; type: string; links: SourceLink[]; asOf: string }>;
}

let indexCache: GraphIndex | undefined;

function buildIndex(): GraphIndex {
  if (indexCache) return indexCache;
  const orgMembers = new Map<string, Array<{ person: Person; role: string }>>();
  const orgInfo = new Map<string, { name: string; type: string; links: SourceLink[]; asOf: string }>();
  for (const person of PEOPLE) {
    for (const o of person.organizations) {
      if (!orgMembers.has(o.id)) orgMembers.set(o.id, []);
      orgMembers.get(o.id)!.push({ person, role: o.role });
      if (!orgInfo.has(o.id)) {
        orgInfo.set(o.id, { name: o.name, type: o.type, links: o.links, asOf: o.provenance.asOf });
      }
    }
  }
  indexCache = { orgMembers, orgInfo };
  return indexCache;
}

export function followTheMoney(rootId: string, maxDepth = 3): TraceResult | undefined {
  const { orgMembers, orgInfo } = buildIndex();
  const isPerson = PEOPLE_BY_SLUG.has(rootId);
  const isOrg = orgInfo.has(rootId);
  if (!isPerson && !isOrg) return undefined;

  const nodes = new Map<string, TraceNode>();
  const edges: TraceEdge[] = [];
  const edgeSeen = new Set<string>();
  const queue: Array<{ id: string; kind: "person" | "org"; depth: number }> = [
    { id: rootId, kind: isPerson ? "person" : "org", depth: 0 },
  ];

  const addEdge = (e: TraceEdge) => {
    const key = [e.from, e.to, e.relation].join("|");
    const rev = [e.to, e.from, e.relation].join("|");
    if (edgeSeen.has(key) || edgeSeen.has(rev)) return;
    edgeSeen.add(key);
    edges.push(e);
  };

  while (queue.length) {
    const { id, kind, depth } = queue.shift()!;
    if (nodes.has(id)) continue;

    if (kind === "person") {
      const p = PEOPLE_BY_SLUG.get(id);
      if (!p) continue;
      nodes.set(id, {
        id,
        kind,
        label: p.name,
        subtitle: p.title,
        links: [{ name: "Profile", url: `/person/${p.slug}` }],
        depth,
      });
      if (depth >= maxDepth) continue;
      // hop 1: orgs they run or fund
      for (const o of p.organizations) {
        addEdge({ from: id, to: o.id, relation: o.role, asOf: o.provenance.asOf, source: o.provenance.source });
        queue.push({ id: o.id, kind: "org", depth: depth + 1 });
      }
      // documented person-to-person links (both directions)
      for (const c of p.connections) {
        addEdge({ from: id, to: c.to, relation: `via ${c.via}`, asOf: c.provenance.asOf, source: c.provenance.source });
        queue.push({ id: c.to, kind: "person", depth: depth + 1 });
      }
      for (const other of PEOPLE) {
        for (const c of other.connections) {
          if (c.to === id) {
            addEdge({
              from: other.slug,
              to: id,
              relation: `via ${c.via}`,
              asOf: c.provenance.asOf,
              source: c.provenance.source,
            });
            queue.push({ id: other.slug, kind: "person", depth: depth + 1 });
          }
        }
      }
    } else {
      const info = orgInfo.get(id);
      if (!info) continue;
      nodes.set(id, {
        id,
        kind,
        label: info.name,
        subtitle: info.type,
        orgType: info.type,
        links: info.links,
        depth,
      });
      if (depth >= maxDepth) continue;
      // hop: other people attached to the same org (shared boards, co-funding)
      for (const { person, role } of orgMembers.get(id) ?? []) {
        addEdge({
          from: person.slug,
          to: id,
          relation: role,
          asOf: info.asOf,
          source: info.links[0],
        });
        queue.push({ id: person.slug, kind: "person", depth: depth + 1 });
      }
    }
  }

  return {
    rootId,
    nodes: [...nodes.values()],
    edges: edges.filter((e) => nodes.has(e.from) && nodes.has(e.to)),
    maxDepth,
    generatedAt: new Date().toISOString(),
  };
}

/** Full network graph (everyone in the registry) for the /network page. */
export function fullNetwork(): TraceResult {
  const { orgInfo } = buildIndex();
  const nodes = new Map<string, TraceNode>();
  const edges: TraceEdge[] = [];
  const edgeSeen = new Set<string>();

  for (const p of PEOPLE) {
    nodes.set(p.slug, {
      id: p.slug,
      kind: "person",
      label: p.name,
      subtitle: p.title,
      links: [{ name: "Profile", url: `/person/${p.slug}` }],
      depth: 0,
    });
  }
  for (const [id, info] of orgInfo) {
    nodes.set(id, {
      id,
      kind: "org",
      label: info.name,
      subtitle: info.type,
      orgType: info.type,
      links: info.links,
      depth: 1,
    });
  }
  for (const p of PEOPLE) {
    for (const o of p.organizations) {
      edges.push({ from: p.slug, to: o.id, relation: o.role, asOf: o.provenance.asOf, source: o.provenance.source });
    }
    for (const c of p.connections) {
      const key = [p.slug, c.to].sort().join("|") + c.via;
      if (edgeSeen.has(key)) continue;
      edgeSeen.add(key);
      edges.push({ from: p.slug, to: c.to, relation: `via ${c.via}`, asOf: c.provenance.asOf, source: c.provenance.source });
    }
  }
  return { rootId: "", nodes: [...nodes.values()], edges, maxDepth: 99, generatedAt: new Date().toISOString() };
}
