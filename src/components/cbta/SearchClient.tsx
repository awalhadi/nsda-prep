"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { norm } from "@/lib/cbta/norm";
import type { GenIndexEntry } from "@/lib/cbta/types";
import ConceptTile from "./ConceptTile";

export default function SearchClient({ index, autoFocus = true }: { index: GenIndexEntry[]; autoFocus?: boolean }) {
  const [q, setQ] = useState("");
  const docs = useMemo(() => index.map((c) => ({
    c,
    title: norm([c.title, ...c.aliases].join(" | ")),
    words: norm(c.keywords.map((k) => `${k.en} ${k.bn}`).join(" | ")),
    line: norm(c.oneLine),
  })), [index]);

  const results = useMemo(() => {
    const terms = norm(q).split(" ").filter(Boolean);
    if (!terms.length) return [];
    return docs
      .map((d) => {
        let score = 0;
        for (const t of terms) {
          if (d.title.includes(t)) score += 3;
          else if (d.words.includes(t)) score += 2;
          else if (d.line.includes(t)) score += 1;
          else return null;
        }
        return { c: d.c, score };
      })
      .filter((x): x is { c: GenIndexEntry; score: number } => x !== null)
      .sort((a, b) => b.score - a.score)
      .slice(0, 40);
  }, [q, docs]);

  return (
    <div>
      <label className="relative block">
        <span className="sr-only">Search a topic</span>
        <Search size={20} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink-3" aria-hidden />
        <input autoFocus={autoFocus} type="search" value={q} onChange={(e) => setQ(e.target.value)}
          placeholder="Search a topic: evidence, hazard, প্রমাণ…"
          className="min-h-14 w-full rounded-2xl border-2 border-line bg-card pl-12 pr-4 text-[17px] text-ink placeholder:text-ink-3 focus:border-brand focus:outline-none" />
      </label>
      {q && <p className="mt-2 text-[13px] text-ink-3" role="status">{results.length ? `${results.length} topic${results.length === 1 ? "" : "s"}` : "No topic found. Try another word."}</p>}
      <ul className="mt-4 space-y-2.5">
        {results.map(({ c }) => <li key={c.id}><ConceptTile c={c} showCblm /></li>)}
      </ul>
    </div>
  );
}
