"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CalendarClock, PartyPopper } from "lucide-react";
import type { GenIndexEntry } from "@/lib/cbta/types";
import { dueConcepts, getCbta, type CbtaState } from "@/lib/cbta/progress";
import { localDay } from "@/lib/cbta/leitner";
import ConceptTile from "./ConceptTile";

const BOX_LABEL = { 1: "Tomorrow box", 2: "3-day box", 3: "7-day box" } as const;

export default function ReviseClient({ index }: { index: GenIndexEntry[] }) {
  const [state, setState] = useState<CbtaState | null>(null);
  useEffect(() => {
    const load = () => setState(getCbta());
    load();
    window.addEventListener("cbta-progress", load);
    window.addEventListener("storage", load);
    return () => { window.removeEventListener("cbta-progress", load); window.removeEventListener("storage", load); };
  }, []);
  if (!state) return <div className="h-40 animate-pulse rounded-2xl bg-card" />;

  const byId = new Map(index.map((c) => [c.id, c]));
  const due = dueConcepts(state).map((id) => byId.get(id)).filter((c): c is GenIndexEntry => !!c);
  const today = localDay();
  const later = Object.entries(state.leitner).filter(([, e]) => e.due > today)
    .sort((a, b) => a[1].due.localeCompare(b[1].due));

  return (
    <div className="space-y-8">
      <section>
        <h2 className="mb-3 flex items-center gap-2 text-[18px] font-extrabold">
          Due today <span className="rounded-full bg-hot-soft px-2.5 py-0.5 text-[13px] text-hot">{due.length}</span>
        </h2>
        {due.length === 0 ? (
          <div className="flex items-center gap-3 rounded-2xl border border-line bg-card p-5 text-ink-2">
            <PartyPopper size={22} className="text-brand" aria-hidden />
            <p><span className="font-bold text-ink">Nothing due today.</span> <span lang="bn">আজ কিছু রিভিশন বাকি নেই।</span> Practise a card, or take a mock exam.</p>
          </div>
        ) : (
          <ul className="space-y-2.5">
            {due.map((c) => <li key={c.id}><ConceptTile c={c} showCblm /></li>)}
          </ul>
        )}
        <p className="mt-3 text-[13px] text-ink-3">Open a card and answer its practice questions. Right answers move it to a longer box (1 → 3 → 7 days). A wrong answer sends it back to tomorrow.</p>
      </section>

      {later.length > 0 && (
        <section>
          <h2 className="mb-3 flex items-center gap-2 text-[18px] font-extrabold"><CalendarClock size={18} className="text-ink-3" aria-hidden /> Coming up</h2>
          <ul className="divide-y divide-line rounded-2xl border border-line bg-card">
            {later.map(([id, e]) => {
              const c = byId.get(id);
              if (!c) return null;
              return (
                <li key={id}>
                  <Link href={`/cbta/concept/${id}`} className="flex min-h-12 items-center justify-between gap-3 px-4 py-3 hover:bg-paper">
                    <span className="font-semibold">{c.title}</span>
                    <span className="shrink-0 text-[12.5px] text-ink-3">{BOX_LABEL[e.box]} · {e.due}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      <p className="text-[13px] text-ink-3">Mastered so far: {Object.keys(state.mastered).length} · Cards read: {Object.keys(state.read).length} of {index.length}</p>
    </div>
  );
}
