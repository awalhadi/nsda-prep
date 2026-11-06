"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { ShortQuestion } from "@/lib/cbta/short-questions";
import { norm } from "@/lib/cbta/norm";
import ShortQuestionAnswer from "./ShortQuestionAnswer";

type TopicHelp = { title: string; cblm: number; bn: string[]; keywords: { en: string; bn: string }[]; example: string; memory: string | null };
export default function ShortQuestionsClient({ questions, topics, cblms }: {
  questions: ShortQuestion[]; topics: Record<string, TopicHelp>; cblms: { n: number; title: string }[];
}) {
  const [query, setQuery] = useState("");
  const [cblm, setCblm] = useState("all");
  const [mode, setMode] = useState("all");
  const [limit, setLimit] = useState(20);
  const filtered = useMemo(() => {
    const terms = norm(query).split(" ").filter(Boolean);
    return questions.filter((q) => {
      const t = q.conceptId ? topics[q.conceptId] : null;
      if (cblm === "other" ? t : cblm !== "all" && t?.cblm !== Number(cblm)) return false;
      if (mode === "simple" && !q.study) return false;
      if (mode === "review" && !q.reviewNote) return false;
      const text = norm([String(q.id), q.question, q.study?.bn ?? "", t?.title ?? "", ...(t?.bn ?? []), ...(t?.keywords.flatMap((k) => [k.en, k.bn]) ?? [])].join(" "));
      return terms.every((term) => text.includes(term));
    });
  }, [questions, topics, query, cblm, mode]);
  function reset() { setLimit(20); }
  return (
    <section className="space-y-4">
      <div className="space-y-3 rounded-2xl border border-line bg-card p-4 sm:p-5">
        <label lang="bn" className="block font-bold" htmlFor="short-search">প্রশ্ন, নম্বর বা বিষয় খুঁজুন</label>
        <input id="short-search" type="search" value={query} onChange={(e) => { setQuery(e.target.value); reset(); }} placeholder="যেমন: প্রমাণ, evidence, 11" className="min-h-12 w-full rounded-xl border border-line bg-paper px-3 text-base focus-visible:outline-2 focus-visible:outline-brand" />
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="text-sm font-semibold">CBLM
            <select value={cblm} onChange={(e) => { setCblm(e.target.value); reset(); }} className="mt-1 min-h-12 w-full rounded-xl border border-line bg-paper px-2 text-base">
              <option value="all">সব CBLM</option>
              {cblms.map((c) => <option key={c.n} value={c.n}>CBLM {c.n} · {c.title}</option>)}
              <option value="other">অতিরিক্ত / টপিক নির্ধারিত হয়নি</option>
            </select>
          </label>
          <label lang="bn" className="text-sm font-semibold">কোন প্রশ্ন দেখব?
            <select value={mode} onChange={(e) => { setMode(e.target.value); reset(); }} className="mt-1 min-h-12 w-full rounded-xl border border-line bg-paper px-2 text-base">
              <option value="all">সব প্রশ্ন</option>
              <option value="simple">আলাদা সহজ উত্তর ও উদাহরণসহ</option>
              <option value="review">সংশোধন / যাচাইয়ের নোট আছে</option>
            </select>
          </label>
        </div>
      </div>
      <p role="status" aria-live="polite" lang="bn" className="text-sm text-ink-2">{filtered.length}টি প্রশ্ন পাওয়া গেছে · {Math.min(limit, filtered.length)}টি দেখাচ্ছে</p>
      {!filtered.length && <p lang="bn" className="rounded-xl bg-sand p-4">কোনো প্রশ্ন মেলেনি। অন্য শব্দ লিখুন বা filter বদলান।</p>}
      {filtered.slice(0, limit).map((q) => {
        const t = q.conceptId ? topics[q.conceptId] : null;
        return <article key={q.id} className="rounded-2xl border border-line bg-card p-5 sm:p-6">
          <p lang="bn" className="mb-2 text-sm font-bold text-brand">প্রশ্ন {q.id} {t ? `· CBLM ${t.cblm}` : "· অতিরিক্ত প্রশ্ন"}</p>
          <h2 className="text-lg font-bold leading-relaxed">{q.question}</h2>
          {t && <Link href={`/cbta/concept/${q.conceptId}`} className="mt-2 inline-flex min-h-11 items-center text-sm font-semibold text-brand">টপিক শিখুন: {t.title} →</Link>}
          <details className="mt-3 border-t border-line pt-2">
            <summary lang="bn" className="min-h-12 cursor-pointer content-center font-bold">আগে নিজে বলুন, তারপর উত্তর দেখুন</summary>
            <div className="mt-3 space-y-4">
              <ShortQuestionAnswer q={q} />
              {t && !q.study && <div className="rounded-xl border border-sand-line bg-sand p-4">
                <h3 lang="bn" className="font-bold">টপিকের সহজ নোট</h3>
                <p lang="bn" className="mt-1 text-sm text-ink-2">এই নোট বিষয়টি বুঝতে সাহায্য করবে। প্রশ্নে চাওয়া নির্দিষ্ট সংখ্যা বা ধাপের জন্য মূল উত্তরও মিলিয়ে পড়ুন।</p>
                {t.bn.map((line, i) => <p lang="bn" key={i} className="mt-2">{line}</p>)}
                {t.example && <p lang="bn" className="mt-3"><strong>উদাহরণ: </strong>{t.example}</p>}
                {t.memory && <p lang="bn" className="mt-3"><strong>মনে রাখি: </strong>{t.memory}</p>}
                <div className="mt-3 flex flex-wrap gap-2">{t.keywords.map((k) => <span key={k.en} className="rounded-lg bg-card px-2 py-1 text-sm">{k.en} = <span lang="bn">{k.bn}</span></span>)}</div>
              </div>}
            </div>
          </details>
        </article>;
      })}
      {filtered.length > limit && <button lang="bn" type="button" onClick={() => setLimit(limit + 20)} className="min-h-12 w-full rounded-xl border-2 border-brand bg-card p-3 font-bold text-brand">আরও ২০টি প্রশ্ন দেখুন</button>}
    </section>
  );
}
