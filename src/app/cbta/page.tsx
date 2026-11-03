import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import DueToday from "@/components/cbta/DueToday";
import OfflineButton from "@/components/cbta/OfflineButton";
import SearchClient from "@/components/cbta/SearchClient";
import { CBLMS, CONCEPT_INDEX, CONTENT_VERSION } from "@/data/cbta/loader";

export const metadata: Metadata = {
  title: "CBT&A Level 4 Exam Prep",
  description: "Learn every CBLM topic in simple English with Bangla help, then test yourself.",
};

export default function CbtaHome() {
  return (
    <main className="mx-auto max-w-3xl space-y-7 px-4 pb-20 pt-6 text-ink sm:px-6 sm:pt-10">
      <header className="px-1">
        <p className="text-[13px] font-bold uppercase tracking-[0.08em] text-brand">NSDA · CBT&amp;A · Level 4</p>
        <h1 className="mt-2 text-[30px] font-extrabold leading-tight tracking-tight sm:text-[40px]">What do you want to learn?</h1>
        <p lang="bn" className="mt-2 text-[17px] text-ink-2">একটা CBLM বেছে নিন, অথবা নিচে যেকোনো topic খুঁজুন।</p>
      </header>

      <SearchClient index={CONCEPT_INDEX} autoFocus={false} />
      <DueToday />

      <section aria-labelledby="cblms">
        <h2 id="cblms" className="mb-2.5 px-1 text-[19px] font-extrabold">CBLMs</h2>
        <ul className="divide-y divide-line overflow-hidden rounded-2xl border border-line bg-card">
          {CBLMS.map((c) => {
            const count = c.groups.reduce((s, g) => s + g.topics.length, 0);
            return (
              <li key={c.n}>
                <Link href={`/cbta/cblm/${c.n}`} className="flex min-h-16 items-center gap-3.5 px-4 py-3 hover:bg-paper">
                  <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-[16px] font-extrabold ${count ? "bg-brand text-white" : "bg-paper text-ink-3 ring-1 ring-line"}`}>{c.n}</span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[15.5px] font-bold leading-snug">{c.title}</span>
                    <span className="block text-[13px] text-ink-3">{count ? `${count} topics` : "Coming soon"}</span>
                  </span>
                  <ChevronRight size={18} className="shrink-0 text-line-strong" aria-hidden />
                </Link>
              </li>
            );
          })}
        </ul>
      </section>

      <OfflineButton version={CONTENT_VERSION} />
    </main>
  );
}
