import { TopList } from "@/components/TopList";

export const metadata = { title: "Top 10 — Influence Tracker" };

export default function TopPage() {
  return (
    <div>
      <h1 className="mb-2 text-3xl font-bold text-white">Top 10 most influential</h1>
      <p className="mb-6 max-w-2xl text-sm text-slate-400">
        Ranked by Influence Score — a transparent composite of wealth, documented network, disclosed political
        giving, and institutional control. Live FEC totals refine the ranking at load time.
      </p>
      <TopList />
    </div>
  );
}
