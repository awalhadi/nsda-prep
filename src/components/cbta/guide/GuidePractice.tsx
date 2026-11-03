"use client";

// Whole-CBLM practice set: an MCQ run with a score, one matching set, a viva deck.
// MCQs linked to a card record progress for that card; the rest is practice only.

import { useEffect, useState } from "react";
import { Check, ChevronLeft, ChevronRight, RotateCcw, X } from "lucide-react";
import type { GenGuide } from "@/lib/cbta/types";
import { recordPractice } from "@/lib/cbta/progress";
import { Matching, Viva } from "../PracticeTabs";

type Tab = "mcq" | "matching" | "viva";

function McqRun({ mcq }: { mcq: GenGuide["practice"]["mcq"] }) {
  const [i, setI] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const finished = i >= mcq.length;
  const q = mcq[Math.min(i, mcq.length - 1)];

  const pick = (k: number) => {
    if (picked !== null) return;
    setPicked(k);
    const ok = k === q.answerIndex;
    if (ok) setScore((s) => s + 1);
    if (q.concept) recordPractice(q.concept, "mcq", ok);
  };
  const next = () => { setI((n) => n + 1); setPicked(null); };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (finished || (e.target as HTMLElement)?.closest("input, textarea")) return;
      if (/^[1-4]$/.test(e.key)) pick(Number(e.key) - 1);
      else if ((e.key === "Enter" || e.key === " ") && picked !== null) { e.preventDefault(); next(); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  if (finished) {
    return (
      <div role="status" className="rounded-2xl bg-brand-soft p-6 text-center">
        <p className="text-[34px] font-extrabold text-brand-ink">{score} / {mcq.length}</p>
        <p lang="bn" className="mt-1 text-[16px] text-ink-2">{score / mcq.length >= 0.8 ? "দারুণ! পরীক্ষার জন্য প্রস্তুত।" : "ভুল topic-গুলো আবার পড়ুন, তারপর আবার চেষ্টা করুন।"}</p>
        <button type="button" onClick={() => { setI(0); setScore(0); setPicked(null); }}
          className="cbta-btn mt-4 inline-flex min-h-11 items-center gap-1.5 rounded-xl border-2 border-line border-b-line-strong bg-card px-4 text-[14px] font-bold">
          <RotateCcw size={14} /> Start again
        </button>
      </div>
    );
  }
  return (
    <div>
      <div className="mb-3 flex items-center justify-between text-[13px] font-semibold text-ink-3">
        <span>Question {i + 1} of {mcq.length}</span>
        <span>Score {score}</span>
      </div>
      <div className="mb-4 h-1.5 overflow-hidden rounded-full bg-paper ring-1 ring-line">
        <div className="h-full bg-brand transition-all" style={{ width: `${(i / mcq.length) * 100}%` }} />
      </div>
      <p className="text-[18px] font-bold leading-snug">{q.prompt}</p>
      <div className="mt-4 grid gap-2.5">
        {q.options.map((o, k) => {
          const st = picked === null ? "idle" : k === q.answerIndex ? "right" : k === picked ? "wrong" : "dim";
          return (
            <button key={o} type="button" disabled={picked !== null} onClick={() => pick(k)}
              className={`cbta-btn flex min-h-13 w-full items-center gap-3 rounded-xl border-2 px-4 py-3 text-left text-[15.5px] font-semibold ${
                st === "idle" ? "border-line border-b-line-strong bg-card hover:bg-paper" :
                st === "right" ? "border-ok/50 border-b-ok bg-ok-soft text-ok" :
                st === "wrong" ? "border-danger/40 border-b-danger bg-danger-soft text-danger" : "border-line bg-card opacity-50"}`}>
              <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-[13px] font-bold ${
                st === "right" ? "bg-ok text-white" : st === "wrong" ? "bg-danger text-white" : "bg-paper text-ink-2 ring-1 ring-line"}`}>
                {st === "right" ? <Check size={15} /> : st === "wrong" ? <X size={15} /> : String.fromCharCode(65 + k)}
              </span>
              {o}
            </button>
          );
        })}
      </div>
      {picked !== null && (
        <div role="status" className={`mt-4 rounded-xl p-4 text-[15px] ${picked === q.answerIndex ? "bg-ok-soft text-ok" : "bg-danger-soft text-danger"}`}>
          <strong>{picked === q.answerIndex ? "সঠিক! Correct." : "ভুল হয়েছে।"}</strong>
          {picked !== q.answerIndex && <> Correct answer: <strong>{q.options[q.answerIndex]}</strong></>}
          <span className="mt-1.5 block text-[13px] text-ink-2">CBLM: “{q.answerCite.quote}”</span>
          <button type="button" onClick={next}
            className="cbta-btn mt-3 inline-flex min-h-11 items-center gap-1 rounded-xl border-2 border-brand border-b-brand-ink bg-brand px-4 text-[14px] font-bold text-white">
            Next <ChevronRight size={15} />
          </button>
        </div>
      )}
      <p className="mt-3 hidden text-[12.5px] text-ink-3 sm:block">Keys: 1–4 to answer, Enter for next.</p>
    </div>
  );
}

function VivaDeck({ viva }: { viva: GenGuide["practice"]["viva"] }) {
  const [i, setI] = useState(0);
  const v = viva[i];
  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <button type="button" disabled={i === 0} onClick={() => setI(i - 1)} className="inline-flex min-h-10 items-center gap-1 rounded-lg px-2 text-[14px] font-semibold text-ink-2 disabled:opacity-40"><ChevronLeft size={16} /> Back</button>
        <span className="text-[13px] font-semibold text-ink-3">{i + 1} / {viva.length}</span>
        <button type="button" disabled={i === viva.length - 1} onClick={() => setI(i + 1)} className="inline-flex min-h-10 items-center gap-1 rounded-lg px-2 text-[14px] font-semibold text-ink-2 disabled:opacity-40">Next <ChevronRight size={16} /></button>
      </div>
      {v.q_bn && <p lang="bn" className="mb-2 text-[14.5px] text-ink-2">বাংলা অর্থ: {v.q_bn}</p>}
      <Viva key={i} viva={{ prompt: v.q, answer: v.answer }} conceptId={null} />
    </div>
  );
}

export default function GuidePractice({ practice }: { practice: GenGuide["practice"] }) {
  const [tab, setTab] = useState<Tab>("mcq");
  const tabs: { id: Tab; label: string }[] = [
    { id: "mcq", label: `MCQ (${practice.mcq.length})` },
    { id: "matching", label: `Matching (${practice.matching.pairs.length})` },
    { id: "viva", label: `Viva (${practice.viva.length})` },
  ];
  return (
    <div>
      <div role="tablist" aria-label="Practice type" className="grid grid-cols-3 gap-1 rounded-xl bg-paper p-1 ring-1 ring-line">
        {tabs.map(({ id, label }) => (
          <button key={id} role="tab" type="button" aria-selected={tab === id} onClick={() => setTab(id)}
            className={`min-h-10 rounded-lg text-[13.5px] font-bold transition-colors ${tab === id ? "bg-card text-ink shadow-sm ring-1 ring-line" : "text-ink-3 hover:text-ink"}`}>
            {label}
          </button>
        ))}
      </div>
      <div role="tabpanel" className="mt-5">
        {tab === "mcq" && <McqRun mcq={practice.mcq} />}
        {tab === "matching" && <Matching matching={practice.matching} conceptId={null} />}
        {tab === "viva" && <VivaDeck viva={practice.viva} />}
      </div>
    </div>
  );
}
