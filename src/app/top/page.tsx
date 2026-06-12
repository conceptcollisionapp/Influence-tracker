import { TopList } from "@/components/TopList";

export const metadata = { title: "Top 10 Most Influential — Influence Tracker" };

export default function TopPage() {
  return (
    <div>
      <div className="mb-1 text-sm text-muted">🏆 Ranking</div>
      <h1 className="mb-2 text-3xl font-bold tracking-tight">Top 10 most influential</h1>
      <p className="mb-7 max-w-2xl text-sm text-muted">
        Ranked by Influence Score — a transparent composite of wealth, documented network, disclosed political
        giving, and institutional control. Live FEC totals refine the ranking at load time.
      </p>
      <TopList />
    </div>
  );
}
