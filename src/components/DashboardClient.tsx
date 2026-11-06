"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, BookOpen, RotateCcw, GraduationCap, Target, Flame, ClipboardCheck } from "lucide-react";
import ModuleCard from "@/components/ModuleCard";
import ProgressRing from "@/components/ProgressRing";
import InstallApp from "@/components/app/InstallApp";
import { MODULES } from "@/data/loader";
import { overallStats, moduleStats } from "@/lib/storage";

export default function DashboardClient() {
  const [stats, setStats] = useState<ReturnType<typeof overallStats> | null>(null);
  const [accuracy, setAccuracy] = useState<Record<string, number | null>>({});
  useEffect(() => {
    const load = () => { setStats(overallStats()); setAccuracy(Object.fromEntries(MODULES.map((m) => [m.id, moduleStats(m.id).accuracy]))); };
    load(); window.addEventListener("storage", load);
    return () => window.removeEventListener("storage", load);
  }, []);
  const weak = MODULES.filter((m) => m.kind === "mcq" && accuracy[m.id] != null && accuracy[m.id]! < 60).sort((a, b) => accuracy[a.id]! - accuracy[b.id]!);
  const mcq = MODULES.filter((m) => m.kind === "mcq");
  const flash = MODULES.filter((m) => m.kind === "flashcards");
  return <main className="mx-auto max-w-6xl space-y-7 px-4 pb-8 pt-6 sm:px-7 sm:pt-8 lg:px-9">
    <header><p className="study-eyebrow">YOUR DAILY STUDY DESK</p><h1 lang="bn" className="mt-2 text-3xl font-extrabold sm:text-[38px]">আজ একটু এগিয়ে যাই।</h1><p className="mt-2 text-ink-2">Web Design Level 3 <span lang="bn">· বুঝে শিখি, অনুশীলনে মনে রাখি।</span></p></header>
    <div className="grid gap-4 md:grid-cols-[1.2fr_1fr]">
      <section className="study-panel"><p className="study-eyebrow">YOUR PRACTICE SNAPSHOT</p><div className="mt-4 flex flex-wrap items-center gap-6"><ProgressRing value={stats?.accuracy ?? 0} size={132} label={stats?.attemptCount ? `${stats.accuracy}%` : "—"} sublabel="সঠিক উত্তর" color="var(--study-brand)" /><div><h2 lang="bn" className="text-xl font-bold">{stats?.attemptCount ? "অনুশীলনেই আত্মবিশ্বাস।" : "প্রথম অনুশীলন শুরু করুন।"}</h2><p lang="bn" className="mt-2 text-sm text-ink-2">{stats?.totalQ ?? 0}টি প্রশ্নের উত্তর · {stats?.attemptCount ?? 0}টি সেশন</p><p lang="bn" className="mt-1 text-xs text-ink-3">সঠিক উত্তরের হার; পরীক্ষায় পাসের পূর্বাভাস নয়।</p></div></div><div className="mt-5 grid grid-cols-2 gap-3 border-t border-line pt-4"><p className="flex items-center gap-2 text-sm"><Flame size={18} className="text-hot" /><strong className="tabular-nums">{stats?.streak.current ?? 0}</strong><span lang="bn" className="text-ink-2">দিনের ধারাবাহিকতা</span></p><p className="flex items-center gap-2 text-sm"><RotateCcw size={18} className="text-brand" /><strong className="tabular-nums">{stats?.mistakeCount ?? 0}</strong><span lang="bn" className="text-ink-2">ভুল আবার দেখুন</span></p></div></section>
      <section className="study-panel flex flex-col justify-between border-brand/25 bg-brand-soft"><div><p lang="bn" className="flex items-center gap-2 text-sm font-bold text-brand-ink"><Target size={18} /> এখন একটি কাজেই মন দিন</p><h2 lang="bn" className="mt-4 text-2xl font-extrabold">{weak.length ? "দুর্বল জায়গা থেকেই শুরু।" : "একটি ছোট practice session।"}</h2><p lang="bn" className="mt-2 text-sm text-ink-2">{weak[0] ? `${weak[0].title} আবার অনুশীলন করুন।` : "একটি বিষয় বেছে ১০টি প্রশ্ন দিন। শেষে ভুলগুলো বুঝে নিন।"}</p></div><Link href={weak[0] ? `/module/${weak[0].id}` : "/modules"} className="study-primary mt-6"><span lang="bn">অনুশীলন শুরু করি</span><ArrowRight size={18} /></Link></section>
    </div>
    <Link href="/cbta" className="study-panel flex items-center gap-4 hover:border-brand"><span className="brand-mark"><GraduationCap size={24} /></span><span className="flex-1"><strong className="block">CBT&amp;A Methodology · Level 4</strong><span lang="bn" className="mt-1 block text-sm text-ink-2">CBLM, বাংলা ব্যাখ্যা, প্রশ্নভান্ডার ও ব্যক্তিগত study plan।</span></span><ArrowRight size={19} className="shrink-0 text-brand" /></Link>
    {weak.length > 0 && <section><div className="mb-4"><p className="study-eyebrow">FOCUS FIRST</p><h2 lang="bn" className="mt-1 text-xl font-bold">আরেকবার পড়লে ভালো হবে</h2><p lang="bn" className="text-sm text-ink-2">আপনার সঠিক উত্তরের হার ৬০%-এর নিচে থাকা বিষয়গুলো।</p></div><div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">{weak.slice(0, 3).map((m) => <ModuleCard key={m.id} mod={m} accuracy={accuracy[m.id]} />)}</div></section>}
    <section><div className="mb-4 flex items-center justify-between"><h2 lang="bn" className="flex items-center gap-2 text-xl font-bold"><ClipboardCheck size={20} className="text-brand" /> প্রশ্ন অনুশীলন</h2><Link href="/modules" lang="bn" className="text-sm font-semibold text-brand">সব দেখুন →</Link></div><div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">{mcq.map((m) => <ModuleCard key={m.id} mod={m} accuracy={accuracy[m.id] ?? null} />)}</div></section>
    <section><h2 lang="bn" className="mb-4 flex items-center gap-2 text-xl font-bold"><BookOpen size={20} className="text-brand" /> না দেখে মনে করার কার্ড</h2><div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">{flash.map((m) => <ModuleCard key={m.id} mod={m} accuracy={accuracy[m.id] ?? null} />)}</div></section>
    <section className="study-panel flex flex-wrap items-center justify-between gap-4"><div><h2 lang="bn" className="font-bold">প্রস্তুতির সঙ্গী, আপনার ফোনে।</h2><p lang="bn" className="mt-1 text-sm text-ink-2">অ্যাপ ইনস্টল করে home screen থেকে পড়ায় ফিরুন।</p></div><InstallApp /></section>
  </main>;
}
