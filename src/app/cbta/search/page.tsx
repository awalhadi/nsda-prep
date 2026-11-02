import type { Metadata } from "next";
import SearchClient from "@/components/cbta/SearchClient";
import { CONCEPT_INDEX } from "@/data/cbta/loader";

export const metadata: Metadata = { title: "Search · CBT&A L4" };

export default function SearchPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 pb-20 pt-8 sm:px-6">
      <h1 className="text-[28px] font-extrabold tracking-tight">Search</h1>
      <p lang="bn" className="mb-5 text-[15px] text-ink-3">English বা বাংলা শব্দ লিখে যেকোনো topic খুঁজুন।</p>
      <SearchClient index={CONCEPT_INDEX} />
    </main>
  );
}
