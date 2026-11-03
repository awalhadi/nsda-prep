"use client";

// The topic list of one CBLM, in CBLM order, with a search box that filters it as you type.

import { useMemo, useState } from "react";
import Link from "next/link";
import { ChevronRight, Search } from "lucide-react";
import { norm } from "@/lib/cbta/norm";

export interface TopicItem { id: string; href: string; title: string; title_bn: string | null; search: string }
export interface TopicGroupItem { label: string; title: string; title_bn: string | null; topics: TopicItem[] }

export default function TopicList({ groups }: { groups: TopicGroupItem[] }) {
  const [q, setQ] = useState("");
  const query = norm(q);
  const shown = useMemo(() => {
    const terms = query.split(" ").filter(Boolean);
    return groups
      .map((g) => ({ ...g, topics: g.topics.filter((t) => terms.every((w) => t.search.includes(w))) }))
      .filter((g) => g.topics.length);
  }, [groups, query]);
  let n = 0;
  const numbers = new Map(groups.flatMap((g) => g.topics).map((t) => [t.id, ++n]));

  return (
    <div>
      <label className="relative block">
        <span className="sr-only">Search a topic</span>
        <Search size={19} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink-3" aria-hidden />
        <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search a topic… (English বা বাংলা)"
          className="min-h-13 w-full rounded-2xl border-2 border-line bg-card pl-11 pr-4 text-[16px] text-ink placeholder:text-ink-3 focus:border-brand focus:outline-none" />
      </label>
      {q && !shown.length && <p role="status" className="mt-4 text-[15px] text-ink-3">No topic found. Try another word.</p>}
      <div className="mt-5 space-y-6">
        {shown.map((g) => (
          <section key={g.label} aria-label={g.label}>
            <h2 className="mb-2 px-1">
              <span className="block text-[12px] font-bold uppercase tracking-[0.08em] text-brand">{g.label}</span>
              {g.title && <span className="block text-[17px] font-extrabold leading-snug text-ink">{g.title}</span>}
              {g.title_bn && <span lang="bn" className="block text-[14px] text-ink-3">{g.title_bn}</span>}
            </h2>
            <ul className="divide-y divide-line overflow-hidden rounded-2xl border border-line bg-card">
              {g.topics.map((t) => (
                <li key={t.id}>
                  <Link href={t.href} className="flex min-h-14 items-center gap-3 px-4 py-3 hover:bg-paper">
                    <span className="w-6 shrink-0 text-right text-[13px] font-bold text-ink-3">{numbers.get(t.id)}</span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-[16px] font-bold leading-snug text-ink">{t.title}</span>
                      {t.title_bn && <span lang="bn" className="block text-[14px] text-ink-2">{t.title_bn}</span>}
                    </span>
                    <ChevronRight size={18} className="shrink-0 text-line-strong" aria-hidden />
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
