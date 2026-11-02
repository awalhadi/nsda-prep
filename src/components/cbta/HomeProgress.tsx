"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { dueConcepts, getCbta, type CbtaState } from "@/lib/cbta/progress";

export default function HomeProgress({ total }: { total: number }) {
  const [s, setS] = useState<CbtaState | null>(null);
  useEffect(() => {
    const load = () => setS(getCbta());
    load();
    window.addEventListener("cbta-progress", load);
    return () => window.removeEventListener("cbta-progress", load);
  }, []);
  const read = s ? Object.keys(s.read).length : 0;
  const due = s ? dueConcepts(s).length : 0;
  const last = s?.mocks.at(-1);
  const lastPct = last ? Math.round(((last.score.mcq[0] + last.score.matching[0] + last.score.short[0]) /
    Math.max(1, last.score.mcq[1] + last.score.matching[1] + last.score.short[1])) * 100) : null;
  return (
    <section aria-label="Your progress" className="grid gap-2.5 sm:grid-cols-3">
      <div className="rounded-2xl border border-line bg-card p-4">
        <p className="text-[12.5px] font-semibold text-ink-3">Cards read</p>
        <p className="mt-1 text-2xl font-extrabold">{read}<span className="text-[15px] text-ink-3"> / {total}</span></p>
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-paper ring-1 ring-line"><div className="h-full rounded-full bg-brand" style={{ width: `${(read / total) * 100}%` }} /></div>
      </div>
      <Link href="/cbta/revise" className="rounded-2xl border border-line bg-card p-4 hover:border-line-strong">
        <p className="text-[12.5px] font-semibold text-ink-3">Revision due today</p>
        <p className={`mt-1 text-2xl font-extrabold ${due ? "text-hot" : ""}`}>{due}</p>
        <p className="text-[12.5px] text-brand">{due ? "Revise now →" : "All clear"}</p>
      </Link>
      <Link href="/cbta/mock" className="rounded-2xl border border-line bg-card p-4 hover:border-line-strong">
        <p className="text-[12.5px] font-semibold text-ink-3">Last mock exam</p>
        <p className="mt-1 text-2xl font-extrabold">{lastPct === null ? "—" : `${lastPct}%`}</p>
        <p className="text-[12.5px] text-brand">{lastPct === null ? "Take your first mock →" : "Take another →"}</p>
      </Link>
    </section>
  );
}
