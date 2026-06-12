import { use } from "react";
import { TraceView } from "@/components/TraceView";

/**
 * "Follow the Money" — full sourced chain of donations, funding, and
 * connections radiating out from a person or organization.
 */
export default function TracePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const label = decodeURIComponent(id).replace(/-/g, " ").replace(/\b\w/g, (m) => m.toUpperCase());

  return (
    <div>
      <div className="mb-1 text-sm text-muted">💰 Follow the Money</div>
      <h1 className="mb-2 text-3xl font-bold tracking-tight">
        <span className="text-gold">{label}</span>
      </h1>
      <p className="mb-6 max-w-2xl text-sm text-muted">
        Tracing the documented chain of money and influence — roles at companies, funding of nonprofits and PACs,
        and person-to-person links. Every hop cites its public source.
      </p>
      <TraceView id={id} view="full" height={520} />
    </div>
  );
}
