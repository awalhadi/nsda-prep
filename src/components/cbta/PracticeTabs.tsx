"use client";

import { useMemo, useState } from "react";
import { Check, X, RotateCcw, Mic, ListChecks, Shuffle, FileQuestion, Eye } from "lucide-react";
import type { GenConcept } from "@/lib/cbta/types";

type Tab = "mcq" | "short" | "matching" | "viva";

const TABS: { id: Tab; label: string; Icon: typeof Check }[] = [
  { id: "mcq", label: "MCQ", Icon: ListChecks },
  { id: "short", label: "Short", Icon: FileQuestion },
  { id: "matching", label: "Matching", Icon: Shuffle },
  { id: "viva", label: "Viva", Icon: Mic },
];

function Mcq({ mcq }: { mcq: GenConcept["practice"]["mcq"] }) {
  const [picked, setPicked] = useState<number | null>(null);
  const done = picked !== null;
  return (
    <div>
      <p className="text-[17px] font-semibold leading-snug">{mcq.prompt}</p>
      <div className="mt-4 grid gap-2">
        {mcq.options.map((o, i) => {
          const isAnswer = i === mcq.answerIndex;
          const state = !done ? "idle" : isAnswer ? "right" : i === picked ? "wrong" : "dim";
          return (
            <button
              key={o}
              type="button"
              disabled={done}
              onClick={() => setPicked(i)}
              className={`flex min-h-12 items-center gap-3 rounded-xl border px-4 py-3 text-left text-[15px] transition-all ${
                state === "idle" ? "border-white/10 bg-white/3 hover:border-indigo-400/60 hover:bg-indigo-500/10" :
                state === "right" ? "border-emerald-400/60 bg-emerald-500/15 text-emerald-100" :
                state === "wrong" ? "border-rose-400/60 bg-rose-500/15 text-rose-100" : "border-white/5 opacity-50"
              }`}
            >
              <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                state === "right" ? "bg-emerald-400 text-emerald-950" : state === "wrong" ? "bg-rose-400 text-rose-950" : "bg-white/10"
              }`}>
                {state === "right" ? <Check size={15} /> : state === "wrong" ? <X size={15} /> : String.fromCharCode(65 + i)}
              </span>
              {o}
            </button>
          );
        })}
      </div>
      {done && (
        <div role="status" className={`mt-4 rounded-xl p-3 text-sm ${picked === mcq.answerIndex ? "bg-emerald-500/10 text-emerald-200" : "bg-rose-500/10 text-rose-200"}`}>
          {picked === mcq.answerIndex ? "সঠিক! Correct." : `ভুল। Correct answer: ${mcq.options[mcq.answerIndex]}`}
          <span className="mt-1 block text-xs text-text-faint">“{mcq.answerCite.quote}”</span>
          <button type="button" onClick={() => setPicked(null)} className="mt-2 inline-flex items-center gap-1 text-xs text-text-muted hover:text-text-primary">
            <RotateCcw size={12} /> Try again
          </button>
        </div>
      )}
    </div>
  );
}

function Short({ short }: { short: GenConcept["practice"]["short"] }) {
  const [shown, setShown] = useState(false);
  const [ticked, setTicked] = useState<Set<number>>(new Set());
  return (
    <div>
      <p className="text-[17px] font-semibold leading-snug">{short.prompt}</p>
      <p className="mt-2 text-sm text-text-faint">Write your answer on paper first, then check it.</p>
      {!shown ? (
        <button type="button" onClick={() => setShown(true)} className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-xl bg-indigo-500 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-400">
          <Eye size={15} /> Show model answer
        </button>
      ) : (
        <div className="mt-4 space-y-4">
          <div className="rounded-xl border border-emerald-400/30 bg-emerald-500/10 p-4 text-[15px] leading-relaxed whitespace-pre-line">{short.modelAnswer}</div>
          <div>
            <p className="mb-2 text-sm font-semibold text-text-muted">Tick the key points you wrote:</p>
            <ul className="space-y-2">
              {short.keyPoints.map((k, i) => (
                <li key={i}>
                  <label className="flex min-h-11 cursor-pointer items-start gap-3 rounded-lg bg-white/3 px-3 py-2.5 text-sm">
                    <input
                      type="checkbox"
                      className="mt-0.5 h-4 w-4 accent-emerald-400"
                      checked={ticked.has(i)}
                      onChange={() => setTicked((s) => { const n = new Set(s); if (n.has(i)) n.delete(i); else n.add(i); return n; })}
                    />
                    {k.text}
                  </label>
                </li>
              ))}
            </ul>
            <p className="mt-2 text-sm text-text-muted">{ticked.size} / {short.keyPoints.length} key points</p>
          </div>
        </div>
      )}
    </div>
  );
}

function Matching({ matching }: { matching: GenConcept["practice"]["matching"] }) {
  // Rotate the right column by half so no answer sits beside its term; deterministic for SSR.
  const rights = useMemo(() => {
    const n = matching.pairs.length;
    return matching.pairs.map((_, k) => {
      const i = (k + Math.ceil(n / 2)) % n;
      return { text: matching.pairs[i].right, i };
    });
  }, [matching.pairs]);
  const [left, setLeft] = useState<number | null>(null);
  const [paired, setPaired] = useState<Record<number, number>>({});
  const [wrong, setWrong] = useState<number | null>(null);
  const done = Object.keys(paired).length === matching.pairs.length;

  const pickRight = (ri: number) => {
    if (left === null || Object.values(paired).includes(ri)) return;
    if (ri === left) { setPaired((p) => ({ ...p, [left]: ri })); setLeft(null); setWrong(null); }
    else setWrong(ri);
  };

  return (
    <div>
      <p className="text-[17px] font-semibold leading-snug">{matching.prompt}</p>
      <p className="mt-1 text-sm text-text-faint">Tap a term on the left, then its match on the right.</p>
      <div className="mt-4 grid grid-cols-2 gap-2 sm:gap-3">
        <div className="space-y-2">
          {matching.pairs.map((p, i) => {
            const isPaired = paired[i] !== undefined;
            return (
              <button key={p.left} type="button" disabled={isPaired} onClick={() => { setLeft(i); setWrong(null); }}
                aria-pressed={left === i}
                className={`flex min-h-14 w-full items-center gap-2 rounded-xl border px-3 py-2 text-left text-[14px] font-semibold transition-all ${
                  isPaired ? "border-emerald-400/40 bg-emerald-500/10 text-emerald-200" :
                  left === i ? "border-indigo-400 bg-indigo-500/20 ring-2 ring-indigo-400/40" : "border-white/10 bg-white/3 hover:border-indigo-400/50"
                }`}>
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/10 text-[11px]">{isPaired ? <Check size={13} /> : i + 1}</span>
                {p.left}
              </button>
            );
          })}
        </div>
        <div className="space-y-2">
          {rights.map((r) => {
            const pairedWith = Object.entries(paired).find(([, v]) => v === r.i)?.[0];
            return (
              <button key={r.i} type="button" disabled={pairedWith !== undefined} onClick={() => pickRight(r.i)}
                className={`flex min-h-14 w-full items-center gap-2 rounded-xl border px-3 py-2 text-left text-[13px] leading-snug transition-all ${
                  pairedWith !== undefined ? "border-emerald-400/40 bg-emerald-500/10 text-emerald-200" :
                  wrong === r.i ? "border-rose-400/60 bg-rose-500/15" : "border-white/10 bg-white/3 hover:border-indigo-400/50"
                }`}>
                {pairedWith !== undefined && <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-400 text-[11px] font-bold text-emerald-950">{Number(pairedWith) + 1}</span>}
                {r.text}
              </button>
            );
          })}
        </div>
      </div>
      <div role="status" className="mt-3 text-sm">
        {done ? <span className="text-emerald-300">সব মিলেছে! All matched.</span> : wrong !== null ? <span className="text-rose-300">Not a match. Try another.</span> : null}
      </div>
      {done && (
        <button type="button" onClick={() => { setPaired({}); setLeft(null); }} className="mt-1 inline-flex items-center gap-1 text-xs text-text-muted hover:text-text-primary">
          <RotateCcw size={12} /> Again
        </button>
      )}
    </div>
  );
}

function Viva({ viva }: { viva: GenConcept["practice"]["viva"] }) {
  const [flipped, setFlipped] = useState(false);
  return (
    <div>
      <p className="mb-3 text-sm text-text-faint">Say the answer out loud, then flip the card. <span className="opacity-70">(Viva questions are made from the CBLM; the papers had no viva samples.)</span></p>
      <button type="button" onClick={() => setFlipped((f) => !f)} className="cbta-flip block w-full text-left" aria-label={flipped ? "Show question" : "Show answer"}>
        <div className="cbta-flip-inner relative min-h-44" data-flipped={flipped}>
          <div className="cbta-flip-face absolute inset-0 flex flex-col justify-center rounded-2xl border border-indigo-400/30 bg-linear-to-br from-indigo-500/20 to-violet-500/10 p-5">
            <span className="mb-2 inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-indigo-300"><Mic size={13} /> Assessor asks</span>
            <p className="text-lg font-semibold leading-snug">{viva.prompt}</p>
            <span className="mt-3 text-xs text-text-faint">Tap to flip</span>
          </div>
          <div className="cbta-flip-face cbta-flip-back absolute inset-0 flex flex-col justify-center rounded-2xl border border-emerald-400/30 bg-linear-to-br from-emerald-500/20 to-teal/10 p-5">
            <span className="mb-2 text-xs font-semibold uppercase tracking-wider text-emerald-300">You say</span>
            <p className="text-lg leading-snug">{viva.answer.text}</p>
          </div>
        </div>
      </button>
    </div>
  );
}

export default function PracticeTabs({ practice }: { practice: GenConcept["practice"] }) {
  const [tab, setTab] = useState<Tab>("mcq");
  return (
    <div>
      <div role="tablist" aria-label="Practice type" className="grid grid-cols-4 gap-1 rounded-xl bg-black/25 p-1">
        {TABS.map(({ id, label, Icon }) => (
          <button key={id} role="tab" type="button" aria-selected={tab === id} onClick={() => setTab(id)}
            className={`flex min-h-11 items-center justify-center gap-1.5 rounded-lg text-xs font-semibold transition-all sm:text-sm ${
              tab === id ? "bg-indigo-500 text-white shadow-lg shadow-indigo-500/20" : "text-text-muted hover:text-text-primary"
            }`}>
            <Icon size={14} aria-hidden /> {label}
          </button>
        ))}
      </div>
      <div role="tabpanel" className="mt-5">
        {tab === "mcq" && <Mcq mcq={practice.mcq} />}
        {tab === "short" && <Short short={practice.short} />}
        {tab === "matching" && <Matching matching={practice.matching} />}
        {tab === "viva" && <Viva viva={practice.viva} />}
      </div>
    </div>
  );
}
