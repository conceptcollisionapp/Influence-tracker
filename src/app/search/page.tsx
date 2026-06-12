import { Suspense } from "react";
import { SearchResults } from "@/components/SearchResults";
import { Skeleton } from "@/components/Ui";

export const metadata = { title: "Search — Influence Tracker" };

export default function SearchPage() {
  return (
    <Suspense fallback={<Skeleton className="h-40 w-full rounded-2xl" />}>
      <SearchResults />
    </Suspense>
  );
}
