import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "Influence Tracker — follow the power, verify the source",
  description:
    "Search any billionaire, celebrity, or politician and see their public influence footprint — private jets, political donations, investments, and nonprofits — every fact timestamped and linked to its original public source.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen">
        <header className="sticky top-0 z-40 border-b border-line/70 bg-bg/70 backdrop-blur-xl">
          <div className="mx-auto flex max-w-6xl items-center gap-6 px-4 py-3.5 sm:px-6">
            <Link href="/" className="group flex items-center gap-2.5 font-semibold tracking-tight">
              <span className="relative grid h-7 w-7 place-items-center rounded-lg bg-gradient-to-br from-brand to-violet shadow-lg shadow-brand/30">
                <span className="h-2 w-2 rounded-full bg-white" />
              </span>
              <span className="text-[15px]">
                Influence<span className="text-brand">Tracker</span>
              </span>
            </Link>
            <form action="/search" className="ml-auto hidden items-center sm:flex">
              <label className="relative">
                <span className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-faint">🔍</span>
                <input
                  type="search"
                  name="q"
                  placeholder="Search a person…"
                  className="w-44 rounded-lg border border-line bg-surface/80 py-1.5 pl-7 pr-2 text-sm text-fg placeholder-faint outline-none transition focus:w-60 focus:border-brand"
                />
              </label>
            </form>
            <nav className="flex items-center gap-1 text-sm sm:ml-2">
              <NavLink href="/top">Top 10</NavLink>
              <NavLink href="/network">Network</NavLink>
            </nav>
          </div>
        </header>

        <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6">{children}</main>

        <footer className="mt-20 border-t border-line/70">
          <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
              <div className="max-w-md">
                <div className="mb-2 flex items-center gap-2 font-semibold">
                  <span className="grid h-6 w-6 place-items-center rounded-md bg-gradient-to-br from-brand to-violet">
                    <span className="h-1.5 w-1.5 rounded-full bg-white" />
                  </span>
                  InfluenceTracker
                </div>
                <p className="text-sm leading-relaxed text-faint">
                  A research tool built entirely on public records. Every data point is timestamped and links to
                  its original source. Not a statement about any person&apos;s character or intent.
                </p>
              </div>
              <nav className="grid grid-cols-2 gap-x-12 gap-y-2 text-sm">
                <div className="flex flex-col gap-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-faint">Explore</span>
                  <Link href="/" className="text-muted hover:text-fg">Search</Link>
                  <Link href="/top" className="text-muted hover:text-fg">Top 10</Link>
                  <Link href="/network" className="text-muted hover:text-fg">Network</Link>
                </div>
                <div className="flex flex-col gap-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-faint">Trust</span>
                  <Link href="/methodology" className="text-muted hover:text-fg">Methodology &amp; Data Sources</Link>
                  <a href="https://www.fec.gov/data/" target="_blank" rel="noopener noreferrer" className="text-muted hover:text-fg">FEC.gov</a>
                  <a href="https://projects.propublica.org/nonprofits/" target="_blank" rel="noopener noreferrer" className="text-muted hover:text-fg">ProPublica</a>
                </div>
              </nav>
            </div>
            <p className="mt-8 border-t border-line-soft pt-6 text-xs text-faint">
              © {new Date().getFullYear()} Influence Tracker · Public records only — FAA &amp; ADS-B, FEC, Senate
              lobbying disclosures, IRS Form 990s, SEC EDGAR, Wikipedia/Wikidata.
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="rounded-lg px-3 py-1.5 text-muted transition hover:bg-surface-2 hover:text-fg"
    >
      {children}
    </Link>
  );
}
