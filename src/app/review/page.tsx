"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import TopNav from "@/components/TopNav";
import { AlertTriangle, ArrowRight, Sparkles } from "lucide-react";
import { loadStore, type MistakeEntry } from "@/lib/storage";
import { getAllMcqQuestions, getModuleMeta } from "@/data/loader";

export default function ReviewPage() {
  const [mistakes, setMistakes] = useState<MistakeEntry[]>([]);

  useEffect(() => {
    const store = loadStore();
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time localStorage hydration on mount
    setMistakes(Object.values(store.mistakes).sort((a, b) => b.timesMissed - a.timesMissed));
  }, []);

  const allQ = getAllMcqQuestions();
  const items = mistakes
    .map((m) => ({ mistake: m, q: allQ.find((q) => q.id === m.questionId) }))
    .filter((x) => x.q);

  const byModule = items.reduce<Record<string, typeof items>>((acc, item) => {
    const mid = item.mistake.moduleId;
    acc[mid] = acc[mid] ? [...acc[mid], item] : [item];
    return acc;
  }, {});

  return (
    <>
      <TopNav />
      <div className="mx-auto max-w-3xl px-4 sm:px-6 py-8 space-y-6">
        <div>
          <p className="font-mono-tag text-xs text-teal mb-1">$ grep -r &quot;wrong&quot; ./attempts</p>
          <h1 className="font-display font-bold text-2xl">Mistake review</h1>
          <p className="text-text-muted text-sm mt-1">
            Every question you&apos;ve missed, grouped by module. Cleared automatically once you answer it correctly again.
          </p>
        </div>

        {items.length === 0 ? (
          <div className="rounded-2xl border border-border-subtle bg-surface p-10 text-center">
            <Sparkles className="mx-auto text-amber mb-3" size={28} />
            <p className="font-display font-semibold text-lg">Nothing to review</p>
            <p className="text-text-muted text-sm mt-1">Take a quiz and any missed questions will show up here.</p>
            <Link href="/modules" className="inline-flex items-center gap-1.5 mt-4 text-teal text-sm font-medium">
              Browse modules <ArrowRight size={14} />
            </Link>
          </div>
        ) : (
          Object.entries(byModule).map(([mid, group]) => {
            const mod = getModuleMeta(mid);
            return (
              <div key={mid} className="rounded-2xl border border-border-subtle bg-surface p-5">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="font-display font-semibold text-base">{mod?.title ?? mid}</h2>
                  <Link
                    href={`/quiz/${mid}?count=${group.length}&timed=0`}
                    className="text-xs font-mono-tag text-teal hover:underline"
                  >
                    drill these →
                  </Link>
                </div>
                <div className="space-y-3">
                  {group.map(({ mistake, q }) => (
                    <div key={mistake.questionId} className="rounded-xl border border-border-subtle bg-surface-2 p-3">
                      <div className="flex items-start justify-between gap-3">
                        <p className="text-sm">{q!.question}</p>
                        <span className="shrink-0 flex items-center gap-1 text-[10px] font-mono-tag text-rose">
                          <AlertTriangle size={11} /> ×{mistake.timesMissed}
                        </span>
                      </div>
                      <p className="text-xs text-teal mt-2 font-mono-tag">
                        correct: {q!.options[q!.answerIndex]}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            );
          })
        )}
      </div>
    </>
  );
}
