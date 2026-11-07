"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, BookOpen, Check, Clock3, Target, RotateCcw, ClipboardCheck, TrendingUp, ChevronRight } from "lucide-react";
import { emptyCbta, getCbta, type CbtaState } from "@/lib/cbta/progress";
import { studySummary } from "@/lib/cbta/study-dashboard";

type Concept = { id: string; title: string; score: number; cblms: number[]; bn: string };
type Course = { n: number; title: string; bn: string; concepts: string[]; topics: number };
const bn = (n: number) => n.toLocaleString("bn-BD");

export default function StudyDashboard({ concepts, courses }: { concepts: Concept[]; courses: Course[] }) {
  const [state, setState] = useState<CbtaState>(emptyCbta);
  const [ready, setReady] = useState(false);
  const [budget, setBudget] = useState(20);
  const [asOf, setAsOf] = useState(() => new Date(2000, 0, 7, 12));
  useEffect(() => {
    const load = () => { setState(getCbta()); setAsOf(new Date()); setReady(true); };
    load();
    window.addEventListener("cbta-progress", load); window.addEventListener("storage", load);
    return () => { window.removeEventListener("cbta-progress", load); window.removeEventListener("storage", load); };
  }, []);
  const summary = studySummary(state, concepts, asOf);
  const next = concepts.find((c) => c.id === summary.next);
  const percent = summary.total ? Math.round(summary.practiced / summary.total * 100) : 0;
  const priority = [...concepts].sort((a, b) => b.score - a.score || a.id.localeCompare(b.id)).slice(0, budget === 10 ? 2 : budget === 20 ? 4 : 6);
  const maxActivity = Math.max(1, ...summary.days.map((d) => d.count));
  return <div className="space-y-7">
    <header className="flex flex-wrap items-start justify-between gap-3">
      <div><p className="study-eyebrow">YOUR DAILY STUDY DESK</p><h1 lang="bn" className="mt-2 text-[30px] font-extrabold tracking-tight sm:text-[38px]">ছোট পদক্ষেপে, বড় প্রস্তুতি।</h1><p lang="bn" className="mt-1 text-ink-2">CBT&amp;A Level 4 · <Link href="/cbta/guide" className="inline-flex min-h-11 items-center font-bold text-brand underline underline-offset-4">কোন CBLM আগে পড়ব? →</Link></p></div>
      <span className="hidden items-center gap-1.5 rounded-full border border-line bg-card px-3 py-1.5 text-xs font-semibold text-ink-2 sm:inline-flex"><span className="h-1.5 w-1.5 rounded-full bg-ok" /> নিজের গতিতে শিখুন</span>
    </header>
    <div className="grid gap-4 md:grid-cols-[1.2fr_1fr]">
      <section className="study-panel relative overflow-hidden" aria-labelledby="progress-title">
        <div className="flex items-center justify-between"><p className="study-eyebrow">LEARNING PROGRESS</p><TrendingUp size={18} className="text-brand" /></div>
        <div className="mt-4 flex items-center gap-5 sm:gap-7">
          <div className="relative flex h-28 w-28 shrink-0 items-center justify-center sm:h-32 sm:w-32">
            <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90" role="img" aria-label={`অনুশীলন করা টপিক ${percent}%`}><circle cx="60" cy="60" r="50" fill="none" stroke="var(--bg-surface-2)" strokeWidth="9" /><circle cx="60" cy="60" r="50" fill="none" stroke="var(--study-brand)" strokeWidth="9" strokeLinecap="round" strokeDasharray="314.16" strokeDashoffset={314.16 * (1 - percent / 100)} /></svg>
            <span className="absolute text-center"><strong className="block text-3xl font-extrabold tabular-nums">{ready ? bn(percent) : "—"}<span className="text-lg">%</span></strong><span lang="bn" className="text-xs text-ink-3">অনুশীলন হয়েছে</span></span>
          </div>
          <div><h2 id="progress-title" lang="bn" className="text-xl font-bold">{summary.practiced ? "ভালো হচ্ছে, চালিয়ে যান।" : "আজই শুরু হোক।"}</h2><p lang="bn" className="mt-2 text-sm text-ink-2">{bn(summary.total)}টি টপিকের মধ্যে {bn(summary.practiced)}টিতে অনুশীলন।</p><p lang="bn" className="mt-1 text-xs text-ink-3">এটি শেখার অগ্রগতি; পরীক্ষায় পাসের সম্ভাবনা নয়।</p></div>
        </div>
        <div className="mt-5 hidden grid-cols-3 divide-x divide-line border-t border-line pt-4 sm:grid">
          {[{ n: bn(summary.read), label: "খুলে পড়েছেন" }, { n: bn(summary.mastered), label: "রিভিশনে আয়ত্ত" }, { n: summary.accuracy === null ? "—" : `${bn(summary.accuracy)}%`, label: "উত্তর সঠিক" }].map((item) => <div key={item.label} className="text-center"><strong className="text-xl font-bold tabular-nums">{ready ? item.n : "—"}</strong><p lang="bn" className="mt-1 text-xs text-ink-3">{item.label}</p></div>)}
        </div>
      </section>
      <section className="study-panel flex flex-col justify-between border-brand/25 bg-brand-soft" aria-labelledby="next-title">
        <div><div className="flex items-center gap-2 text-brand-ink"><Target size={18} /><span lang="bn" className="text-sm font-bold">এখন আপনার পরের কাজ</span></div><h2 id="next-title" lang="bn" className="mt-4 text-2xl font-extrabold">{summary.due.length ? `${bn(summary.due.length)}টি টপিক মনে করে দেখুন` : "একটি টপিক বুঝে শিখুন"}</h2><p className="mt-2 font-semibold text-brand-ink">{next?.bn || next?.title || "CBLM থেকে শুরু করুন"}</p><p lang="bn" className="mt-2 hidden text-sm text-ink-2 sm:block">{summary.due.length ? "আগের ভুল ঠিক করলে নতুন পড়াও মনে রাখা সহজ হবে।" : "বাংলায় বুঝুন → উদাহরণ দেখুন → না দেখে উত্তর বলুন।"}</p></div>
        <Link href={summary.due.length ? "/cbta/revise" : next ? `/cbta/concept/${next.id}` : "#cblms"} className="study-primary mt-6 w-full"><span lang="bn">{summary.due.length ? "রিভিশন শুরু করি" : "পড়া শুরু করি"}</span><ArrowRight size={18} /></Link>
      </section>
    </div>
    <section className="study-panel" aria-labelledby="plan-title">
      <div className="flex flex-wrap items-center justify-between gap-3"><div><p className="study-eyebrow">A LITTLE EVERY DAY</p><h2 id="plan-title" lang="bn" className="mt-1 text-xl font-bold">আজ কতটুকু সময় আছে?</h2></div><div className="flex rounded-xl bg-paper p-1" role="group" aria-label="পড়ার সময় নির্বাচন">{[10, 20, 30].map((n) => <button key={n} type="button" aria-pressed={budget === n} onClick={() => setBudget(n)} className={`min-h-11 rounded-lg px-4 text-sm font-bold ${budget === n ? "bg-brand text-white" : "text-ink-2"}`}><span lang="bn">{bn(n)} মিনিট</span></button>)}</div></div>
      <p lang="bn" className="mt-2 text-sm text-ink-3">সময় আনুমানিক। বুঝতে বেশি সময় লাগলে ধীরে পড়ুন।</p>
      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        {[{ icon: RotateCcw, label: "আগের পড়া মনে করি", detail: summary.due.length ? `${bn(summary.due.length)}টি টপিক রিভিশনের সময় হয়েছে` : "রিভিশন তালিকা দেখে নিন", href: "/cbta/revise", time: budget === 10 ? 2 : budget === 20 ? 4 : 5 }, { icon: BookOpen, label: "জরুরি টপিক বুঝি", detail: `Evidence score অনুযায়ী ${bn(priority.length)}টি টপিক`, href: priority[0] ? `/cbta/concept/${priority[0].id}` : "#cblms", time: budget === 10 ? 5 : budget === 20 ? 10 : 15 }, { icon: ClipboardCheck, label: "নিজেকে যাচাই করি", detail: "প্রশ্ন পড়ি, উত্তর না দেখে বলি", href: "/cbta/questions", time: budget === 10 ? 3 : budget === 20 ? 6 : 10 }].map((task, i) => <Link key={task.label} href={task.href} className="group rounded-2xl border border-line p-4 hover:border-brand"><div className="flex items-center justify-between"><task.icon size={20} className="text-brand" /><span className="text-xs font-semibold text-ink-3">0{i + 1}</span></div><h3 lang="bn" className="mt-4 font-bold">{task.label}</h3><p lang="bn" className="mt-1 text-sm text-ink-2">{task.detail}</p><span lang="bn" className="mt-4 flex items-center gap-1 text-xs font-semibold text-brand"><Clock3 size={13} /> {bn(task.time)} মিনিট <ChevronRight size={14} className="ml-auto" /></span></Link>)}
      </div>
      <details className="mt-4"><summary lang="bn" className="min-h-11 cursor-pointer content-center text-sm font-semibold text-brand">এই সেশনের গুরুত্বপূর্ণ টপিক দেখুন ({bn(priority.length)}টি)</summary><ol className="mt-2 space-y-2">{priority.map((c) => <li key={c.id}><Link href={`/cbta/concept/${c.id}`} className="flex min-h-11 items-center gap-2 rounded-lg bg-paper px-3 py-2 text-sm"><BookOpen size={14} className="shrink-0 text-brand" /><span>{c.title}</span><ChevronRight size={14} className="ml-auto shrink-0" /></Link></li>)}</ol></details>
    </section>
    <div className="grid gap-4">
      <section className="study-panel"><div className="flex items-center justify-between"><div><p className="study-eyebrow">YOUR CONSISTENCY</p><h2 lang="bn" className="mt-1 text-lg font-bold">গত ৭ দিনের অনুশীলন</h2></div><span lang="bn" className="text-sm font-bold text-brand">আজ {bn(summary.todayCount)}টি</span></div>
        <div className="mt-5 grid h-28 grid-cols-7 items-end gap-3" role="img" aria-label={ready ? summary.days.map((d) => `${d.date}: ${d.count}টি উত্তর`).join("; ") : "অনুশীলনের তথ্য লোড হচ্ছে"}>{summary.days.map((day) => <div key={day.date} className="flex h-full flex-col items-center justify-end gap-1"><span className="text-[10px] tabular-nums text-ink-3">{bn(day.count)}</span><div className="flex h-16 w-full max-w-9 items-end rounded-md bg-paper"><span className="block w-full rounded-md bg-brand/75" style={{ height: `${day.count / maxActivity * 100}%` }} /></div><span className="text-[10px] text-ink-3">{ready ? bn(Number(day.date.slice(-2))) : "—"}</span></div>)}</div>
        <p lang="bn" className="mt-4 text-xs text-ink-3">তারিখ অনুযায়ী দেওয়া উত্তরের সংখ্যা। শুধু পড়া বা “revise later” এখানে গণনা হয় না।</p>
      </section>
    </div>
    <section id="cblms" className="scroll-mt-24" aria-labelledby="cblms-title">
      <div className="mb-4 flex items-end justify-between gap-3"><div><p className="study-eyebrow">THE WHOLE PICTURE</p><h2 id="cblms-title" lang="bn" className="mt-1 text-2xl font-extrabold">আপনার CBLM মানচিত্র</h2></div><Link href="/cbta/guide" lang="bn" className="text-sm font-semibold text-brand">পরীক্ষার পড়ার ক্রম →</Link></div>
      <p lang="bn" className="mb-4 text-sm text-ink-2">প্রতিটি কার্ডে পূর্ণ পাঠের সংখ্যা আছে। বারটি শুধু অনুশীলনযোগ্য কার্ডের অগ্রগতি দেখায়।</p>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">{courses.map((course) => {
        const practiced = course.concepts.filter((id) => state.attempts.some((a) => a.conceptId === id && a.kind !== "revise")).length;
        const due = course.concepts.filter((id) => summary.due.includes(id)).length;
        const p = course.concepts.length ? Math.round(practiced / course.concepts.length * 100) : 0;
        return <Link key={course.n} href={`/cbta/cblm/${course.n}`} className="rounded-2xl border border-line bg-card p-5 transition-colors hover:border-brand"><div className="flex items-center justify-between"><span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-soft text-sm font-extrabold text-brand-ink">{String(course.n).padStart(2, "0")}</span>{due > 0 ? <span lang="bn" className="rounded-full bg-hot-soft px-2 py-1 text-xs font-bold text-hot">{bn(due)}টি রিভিশন</span> : p === 100 && practiced > 0 ? <Check size={18} className="text-ok" /> : <ChevronRight size={17} className="text-ink-3" />}</div><h3 className="mt-3 text-[15px] font-bold leading-snug">{course.title}</h3>{course.bn && <p lang="bn" className="mt-1 text-sm text-ink-2">{course.bn}</p>}<div className="mt-4 progress-track" role="progressbar" aria-label={`${course.title}: অনুশীলন করা টপিক`} aria-valuenow={p} aria-valuemin={0} aria-valuemax={100}><span style={{ width: `${p}%` }} /></div><div lang="bn" className="mt-2 flex flex-wrap justify-between gap-2 text-xs text-ink-3"><span>{bn(course.topics)}টি পাঠ ও জব শিট</span><span>{bn(practiced)}/{bn(course.concepts.length)} কার্ড অনুশীলন</span></div></Link>;
      })}</div>
    </section>
  </div>;
}
