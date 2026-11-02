import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import ConceptTile from "@/components/cbta/ConceptTile";
import HomeProgress from "@/components/cbta/HomeProgress";
import OfflineButton from "@/components/cbta/OfflineButton";
import { CBLMS, CONCEPT_INDEX, CONTENT_VERSION } from "@/data/cbta/loader";

export const metadata: Metadata = {
  title: "CBT&A Level 4 Exam Prep",
  description: "Learn every highlighted CBLM topic once, in simple English with Bangla help, and practise the real exam pattern.",
};

export default function CbtaHome() {
  const top = [...CONCEPT_INDEX].sort((a, b) => b.score - a.score || a.title.localeCompare(b.title)).slice(0, 6);
  const highlights = CBLMS.reduce((s, c) => s + c.highlights, 0);
  const covered = CBLMS.reduce((s, c) => s + c.covered, 0);

  return (
    <main className="mx-auto max-w-5xl space-y-12 px-4 pb-20 pt-8 sm:px-6 sm:pt-12">
      <header className="max-w-2xl">
        <p className="text-[13px] font-bold uppercase tracking-[0.08em] text-brand">NSDA · CBT&amp;A Methodology · Level 4</p>
        <h1 className="mt-3 text-[34px] font-extrabold leading-[1.1] tracking-tight sm:text-[48px]">
          Read once. Remember.<br />Write the right answer.
        </h1>
        <p lang="bn" className="mt-4 text-[18px] text-ink-2">
          প্রতিটি highlighted topic সহজ English আর বাংলা ব্যাখ্যায়, আসল পরীক্ষার ধরন অনুযায়ী।
        </p>
        <dl className="mt-6 grid max-w-xl grid-cols-3 divide-x divide-line rounded-xl border border-line bg-card text-center">
          {[["CBLMs", "11 of 12"], ["highlighted parts explained", `${covered} / ${highlights}`], ["exam pattern", "10 · 5 · 10"]].map(([k, v]) => (
            <div key={k} className="px-2 py-3">
              <dd className="text-[18px] font-extrabold">{v}</dd>
              <dt className="text-[11.5px] leading-tight text-ink-3">{k}</dt>
            </div>
          ))}
        </dl>
        <p className="mt-2 text-[12.5px] text-ink-3">Exam pattern = 10 MCQ, 5 matching, 10 short questions. Every fact links to the exact CBLM words.</p>
      </header>

      <div className="space-y-2.5">
        <HomeProgress total={CONCEPT_INDEX.length} />
        <OfflineButton version={CONTENT_VERSION} />
      </div>

      <section aria-labelledby="top">
        <div className="mb-1 flex items-baseline justify-between gap-3">
          <h2 id="top" className="text-[22px] font-extrabold tracking-tight">Most likely in the exam</h2>
          <Link href="/cbta/guide" className="shrink-0 text-[14px] font-bold text-brand hover:underline">Full priority guide →</Link>
        </div>
        <p lang="bn" className="mb-4 text-[15px] text-ink-3">পরীক্ষায় সবচেয়ে বেশি এসেছে, তাই আগে এগুলো পড়ুন।</p>
        <ul className="grid gap-2.5 md:grid-cols-2">
          {top.map((c) => <li key={c.id}><ConceptTile c={c} showCblm /></li>)}
        </ul>
      </section>

      <section aria-labelledby="cblms">
        <h2 id="cblms" className="mb-1 text-[22px] font-extrabold tracking-tight">Study CBLM by CBLM</h2>
        <p lang="bn" className="mb-4 text-[15px] text-ink-3">একটা একটা করে CBLM শেষ করুন।</p>
        <ul className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
          {CBLMS.map((c) => {
            const pct = c.highlights ? Math.round((c.covered / c.highlights) * 100) : 0;
            const ready = c.conceptIds.length > 0;
            return (
              <li key={c.n}>
                <Link href={`/cbta/cblm/${c.n}`}
                  className="group flex h-full items-start gap-3.5 rounded-2xl border border-line bg-card p-4 transition-shadow hover:border-line-strong hover:shadow-[0_2px_12px_rgba(27,26,23,0.06)]">
                  <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-[17px] font-extrabold ${ready ? "bg-brand text-white" : "bg-paper text-ink-3 ring-1 ring-line"}`}>{c.n}</span>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-[15px] font-bold leading-snug">{c.title}</h3>
                    {!c.hasPdf ? (
                      <p className="mt-1 text-[13px] font-semibold text-danger">No CBLM PDF yet</p>
                    ) : ready ? (
                      <>
                        <div className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-paper ring-1 ring-line">
                          <div className="h-full rounded-full bg-brand" style={{ width: `${pct}%` }} />
                        </div>
                        <p className="mt-1.5 text-[13px] text-ink-3">{c.conceptIds.length} concepts · {pct}% explained</p>
                      </>
                    ) : (
                      <p className="mt-1 text-[13px] text-ink-3">{c.highlights} highlighted parts · coming soon</p>
                    )}
                  </div>
                  <ChevronRight size={18} className="mt-2.5 shrink-0 text-line-strong group-hover:text-ink-3" aria-hidden />
                </Link>
              </li>
            );
          })}
        </ul>
      </section>
    </main>
  );
}
