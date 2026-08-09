"use client";

import { useEffect, useState } from "react";
import TopNav from "@/components/TopNav";
import ModuleCard from "@/components/ModuleCard";
import { MODULES } from "@/data/loader";
import { moduleStats } from "@/lib/storage";

export default function ModulesPage() {
  const [modAcc, setModAcc] = useState<Record<string, number | null>>({});

  useEffect(() => {
    const acc: Record<string, number | null> = {};
    MODULES.forEach((m) => {
      acc[m.id] = moduleStats(m.id).accuracy;
    });
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time localStorage hydration on mount
    setModAcc(acc);
  }, []);

  const mcq = MODULES.filter((m) => m.kind === "mcq");
  const flash = MODULES.filter((m) => m.kind === "flashcards");

  return (
    <>
      <TopNav />
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-8 space-y-8">
        <div>
          <p className="font-mono-tag text-xs text-teal mb-1">$ ls ./modules</p>
          <h1 className="font-display font-bold text-2xl">All practice modules</h1>
          <p className="text-text-muted text-sm mt-1">
            Every question from your source sheets, organized by topic. {MODULES.reduce((s, m) => s + m.count, 0)} questions total.
          </p>
        </div>
        <section>
          <h2 className="font-display font-semibold text-lg mb-3">MCQ practice sets</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {mcq.map((m) => (
              <ModuleCard key={m.id} mod={m} accuracy={modAcc[m.id] ?? null} />
            ))}
          </div>
        </section>
        <section>
          <h2 className="font-display font-semibold text-lg mb-3">Flashcard decks</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {flash.map((m) => (
              <ModuleCard key={m.id} mod={m} accuracy={modAcc[m.id] ?? null} />
            ))}
          </div>
        </section>
      </div>
    </>
  );
}
