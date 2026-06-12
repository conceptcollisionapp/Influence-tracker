import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "Influence Tracker",
  description:
    "Track the public influence footprint of powerful individuals — jets, political donations, investments, and nonprofits — with every datum linked to its original public source.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">
        <header className="sticky top-0 z-40 border-b border-edge bg-ink/85 backdrop-blur">
          <div className="mx-auto flex max-w-6xl items-center gap-6 px-4 py-3">
            <Link href="/" className="flex items-center gap-2 text-lg font-bold tracking-tight">
              <span className="inline-block h-2.5 w-2.5 rounded-full bg-accent shadow-[0_0_12px_2px_rgba(79,142,247,0.8)]" />
              Influence<span className="text-accent">Tracker</span>
            </Link>
            <nav className="ml-auto flex items-center gap-5 text-sm text-slate-300">
              <Link href="/" className="hover:text-white">Search</Link>
              <Link href="/top" className="hover:text-white">Top 10</Link>
              <Link href="/network" className="hover:text-white">Network</Link>
              <Link href="/methodology" className="hover:text-white">Methodology &amp; sources</Link>
            </nav>
          </div>
        </header>
        <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
        <footer className="mt-16 border-t border-edge py-8 text-center text-xs text-slate-400">
          <p className="mx-auto max-w-3xl px-4">
            All data shown is drawn from public records — FAA registry &amp; crowd-sourced ADS-B, FEC campaign-finance
            filings, Senate lobbying disclosures, IRS Form 990s via ProPublica, SEC EDGAR, and Wikipedia/Wikidata —
            and every item links to its original source with a timestamp. Estimates are labeled. This is a research
            tool, not a statement about any person&apos;s character or intent.
          </p>
        </footer>
      </body>
    </html>
  );
}
