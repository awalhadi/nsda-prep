import type { Metadata } from "next";
import Link from "next/link";
import ConceptTile from "@/components/cbta/ConceptTile";
import { CBLMS, CONCEPT_INDEX } from "@/data/cbta/loader";

export const metadata: Metadata = { title: "Study priority guide · CBT&A L4" };

const byScore = [...CONCEPT_INDEX].sort((a, b) => b.score - a.score || a.title.localeCompare(b.title));

export default function GuidePage() {
  const top30 = byScore.slice(0, 30);
  const s3 = CONCEPT_INDEX.filter((c) => c.stars === 3).length;
  const s2 = CONCEPT_INDEX.filter((c) => c.stars === 2).length;
  const plans = [
    { days: 3, title: "3 days left", bn: "৩ দিন বাকি", steps: [`Day 1–2: read all ${s3} ★★★ "Must read" cards and do their practice.`, "Day 3: take 2 mock exams, then revise every weak topic."] },
    { days: 7, title: "7 days left", bn: "৭ দিন বাকি", steps: [`Day 1–3: all ${s3} ★★★ cards.`, `Day 4–5: the ${s2} ★★ "Important" cards.`, "Day 6: two mock exams.", "Day 7: revision list only, then rest."] },
    { days: 15, title: "15 days or more", bn: "১৫ দিন বা বেশি", steps: ["Study one CBLM per day, all its cards (Most likely first).", "Every 3rd day: one mock exam for the CBLMs done so far.", "Every morning: clear the revision list first (10 minutes)."] },
  ];
  return (
    <main className="mx-auto max-w-4xl space-y-12 px-4 pb-20 pt-8 sm:px-6">
      <header className="max-w-2xl">
        <h1 className="text-[30px] font-extrabold tracking-tight">Study priority guide</h1>
        <p lang="bn" className="mt-2 text-[16px] text-ink-2">কোন topic আগে পড়বেন, তা ঠিক হয়েছে আসল প্রশ্নপত্র আর CBLM self check-এর ডেটা থেকে: কোন topic কতবার এসেছে, কোথায় highlight করা, আর কতগুলো CBLM-এ আছে।</p>
        <p className="mt-3 rounded-xl bg-card p-3 text-[13.5px] text-ink-3 ring-1 ring-line">
          Priority = highlight weight + number of CBLMs + exam frequency (3 × official paper, 2 × formative/unit paper, 2 × self check). ★★★ = top quarter or asked in the official paper.
        </p>
      </header>

      <section aria-labelledby="plans">
        <h2 id="plans" className="mb-4 text-[22px] font-extrabold tracking-tight">Your study plan</h2>
        <div className="grid gap-3 md:grid-cols-3">
          {plans.map((p) => (
            <div key={p.days} className="rounded-2xl border border-line bg-card p-5">
              <p className="text-[18px] font-extrabold">{p.title}</p>
              <p lang="bn" className="text-[14px] text-ink-3">{p.bn}</p>
              <ol className="mt-3 list-decimal space-y-1.5 pl-5 text-[14.5px] text-ink-2">{p.steps.map((s) => <li key={s}>{s}</li>)}</ol>
            </div>
          ))}
        </div>
      </section>

      <section aria-labelledby="top30">
        <h2 id="top30" className="mb-1 text-[22px] font-extrabold tracking-tight">Top 30 most likely topics</h2>
        <p lang="bn" className="mb-4 text-[15px] text-ink-3">সব CBLM মিলিয়ে সবচেয়ে বেশি আসা ৩০টি topic।</p>
        <ol className="grid gap-2.5 md:grid-cols-2">{top30.map((c) => <li key={c.id}><ConceptTile c={c} showCblm /></li>)}</ol>
      </section>

      <section aria-labelledby="percblm">
        <h2 id="percblm" className="mb-4 text-[22px] font-extrabold tracking-tight">Top 10 in each CBLM</h2>
        <div className="space-y-4">
          {CBLMS.filter((c) => c.conceptIds.length).map((cb) => {
            const list = byScore.filter((c) => c.cblmPrimary === cb.n).slice(0, 10);
            const types = new Set(list.flatMap((c) => c.types));
            return (
              <details key={cb.n} className="group rounded-2xl border border-line bg-card">
                <summary className="flex min-h-14 cursor-pointer list-none items-center gap-3 px-4">
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand text-[15px] font-extrabold text-white">{cb.n}</span>
                  <span className="flex-1 font-bold">{cb.title}</span>
                  <span className="hidden text-[12.5px] text-ink-3 sm:inline">Comes as: {[...types].map((t) => (t === "mcq" ? "MCQ" : t)).join(", ") || "—"}</span>
                </summary>
                <ol className="space-y-2 border-t border-line p-4">
                  {list.map((c, i) => (
                    <li key={c.id}>
                      <Link href={`/cbta/concept/${c.id}`} className="flex gap-3 rounded-lg px-2 py-1.5 hover:bg-paper">
                        <span className="w-5 shrink-0 text-right font-bold text-ink-3">{i + 1}.</span>
                        <span className="flex-1 font-semibold">{c.title}</span>
                        <span className="shrink-0 text-[13px] text-hot">{"★".repeat(c.stars)}</span>
                      </Link>
                    </li>
                  ))}
                </ol>
              </details>
            );
          })}
        </div>
      </section>
    </main>
  );
}
