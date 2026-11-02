"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import type { GenIndexEntry } from "@/lib/cbta/types";
import ConceptTile from "./ConceptTile";

/** NFC, lower-case, drop zero-width joiners so Bangla typed on any keyboard still matches. */
function norm(s: string): string {
  return s.normalize("NFC").toLowerCase().replace(/[​-‍﻿]/g, "").replace(/\s+/g, " ").trim();
}

export default function SearchClient({ index }: { index: GenIndexEntry[] }) {
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
        return { c: d.c, score: score + d.c.stars * 0.1 };
      })
      .filter((x): x is { c: GenIndexEntry; score: number } => x !== null)
      .sort((a, b) => b.score - a.score)
      .slice(0, 40);
  }, [q, docs]);

  return (
    <div>
      <label className="relative block">
        <span className="sr-only">Search concepts</span>
        <Search size={20} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink-3" aria-hidden />
        <input autoFocus type="search" value={q} onChange={(e) => setQ(e.target.value)}
          placeholder="Search: evidence, hazard, প্রমাণ, ঝুঁকি…"
          className="min-h-14 w-full rounded-2xl border-2 border-line bg-card pl-12 pr-4 text-[17px] text-ink placeholder:text-ink-3 focus:border-brand focus:outline-none" />
      </label>
      <p className="mt-2 text-[13px] text-ink-3" role="status">
        {q ? `${results.length} result${results.length === 1 ? "" : "s"}` : `Search ${index.length} concepts by English or Bangla words.`}
      </p>
      <ul className="mt-4 space-y-2.5">
        {results.map(({ c }) => <li key={c.id}><ConceptTile c={c} showCblm /></li>)}
      </ul>
    </div>
  );
}
