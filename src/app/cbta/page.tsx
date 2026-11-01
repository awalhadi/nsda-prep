import type { Metadata } from "next";
import Link from "next/link";
import { BookOpenCheck, ChevronRight, FileWarning, Flame, ShieldCheck } from "lucide-react";
import TopNav from "@/components/TopNav";
import ConceptTile from "@/components/cbta/ConceptTile";
import { CBLMS, CONCEPT_INDEX } from "@/data/cbta/loader";

export const metadata: Metadata = {
  title: "CBT&A Level 4 Exam Prep",
  description: "Learn every highlighted CBLM topic once, in simple English with Bangla help, and practise the real exam pattern.",
};

export default function CbtaHome() {
  const top = [...CONCEPT_INDEX].sort((a, b) => b.score - a.score || a.title.localeCompare(b.title)).slice(0, 6);
  const total = CONCEPT_INDEX.length;
  const highlights = CBLMS.reduce((s, c) => s + c.highlights, 0);

  return (
    <>
      <TopNav />
      <main className="mx-auto max-w-5xl space-y-10 px-4 pb-16 pt-6 sm:px-6">
        <header className="relative overflow-hidden rounded-3xl border border-white/10 bg-linear-to-br from-teal/20 via-surface to-amber/10 p-6 sm:p-10">
          <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-teal/15 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 -left-10 h-72 w-72 rounded-full bg-amber/10 blur-3xl" />
          <p className="relative inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-teal">
            <BookOpenCheck size={14} aria-hidden /> NSDA · CBT&A Methodology · Level 4
          </p>
          <h1 className="relative mt-4 max-w-2xl font-display text-3xl font-bold leading-tight tracking-tight sm:text-5xl">
            Read once. Remember. <span className="text-teal">Write the right answer.</span>
          </h1>
          <p lang="bn" className="relative mt-3 max-w-xl text-[17px] text-text-muted">
            প্রতিটি highlighted topic সহজ English আর বাংলা ব্যাখ্যায়, আসল পরীক্ষার ধরন অনুযায়ী।
          </p>
          <dl className="relative mt-6 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
            {[["CBLMs", "11 of 12"], ["Highlights tracked", highlights.toLocaleString()], ["Concept cards", total], ["Exam: MCQ · Match · Short", "10 · 5 · 10"]].map(([k, v]) => (
              <div key={k} className="rounded-2xl bg-black/25 px-4 py-2.5">
                <dd className="font-display text-lg font-bold">{v}</dd>
                <dt className="text-[11px] text-text-faint">{k}</dt>
              </div>
            ))}
          </dl>
          <p className="relative mt-5 flex items-center gap-1.5 text-xs text-text-faint">
            <ShieldCheck size={13} aria-hidden /> Every fact links to the exact CBLM words. Cards marked Draft are not yet checked by a trainer.
          </p>
        </header>

        <section aria-labelledby="top">
          <h2 id="top" className="mb-4">
            <span className="flex items-center gap-2 font-display text-xl font-semibold"><Flame size={20} className="text-rose-300" aria-hidden /> Most likely in the exam</span>
            <span lang="bn" className="block text-sm text-text-faint">পরীক্ষায় সবচেয়ে বেশি আসে</span>
          </h2>
          <ul className="grid gap-2.5 md:grid-cols-2">
            {top.map((c) => <li key={c.id}><ConceptTile c={c} showCblm /></li>)}
          </ul>
        </section>

        <section aria-labelledby="cblms">
          <h2 id="cblms" className="mb-4">
            <span className="block font-display text-xl font-semibold">Study CBLM by CBLM</span>
            <span lang="bn" className="block text-sm text-text-faint">CBLM ধরে ধরে পড়ুন</span>
          </h2>
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {CBLMS.map((c) => {
              const pct = c.highlights ? Math.round((c.covered / c.highlights) * 100) : 0;
              const ready = c.conceptIds.length > 0;
              return (
                <li key={c.n}>
                  <Link href={`/cbta/cblm/${c.n}`} className="group flex h-full flex-col rounded-2xl border border-white/10 bg-surface/80 p-4 transition-all hover:-translate-y-0.5 hover:border-teal/40">
                    <div className="flex items-center justify-between">
                      <span className={`flex h-10 w-10 items-center justify-center rounded-xl font-display text-lg font-bold ${ready ? "bg-teal/15 text-teal" : "bg-white/5 text-text-faint"}`}>{c.n}</span>
                      <ChevronRight size={18} className="text-text-faint group-hover:text-teal" aria-hidden />
                    </div>
                    <h3 className="mt-3 font-display text-[15px] font-semibold leading-snug">{c.title}</h3>
                    <div className="mt-auto pt-3">
                      {!c.hasPdf ? (
                        <span className="inline-flex items-center gap-1 text-xs text-rose-300"><FileWarning size={12} aria-hidden /> No CBLM PDF</span>
                      ) : ready ? (
                        <>
                          <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
                            <div className="h-full rounded-full bg-teal" style={{ width: `${pct}%` }} />
                          </div>
                          <p className="mt-1.5 text-xs text-text-muted">{c.conceptIds.length} concepts · {pct}% of highlights</p>
                        </>
                      ) : (
                        <p className="text-xs text-text-faint">{c.highlights} highlights · cards coming soon</p>
                      )}
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      </main>
    </>
  );
}
