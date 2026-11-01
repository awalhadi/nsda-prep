"use client";

import { useMemo, useState } from "react";
import { Check, X, RotateCcw, Mic, Eye } from "lucide-react";
import type { GenConcept } from "@/lib/cbta/types";

type Tab = "mcq" | "short" | "matching" | "viva";

const TABS: { id: Tab; label: string }[] = [
  { id: "mcq", label: "MCQ" },
  { id: "short", label: "Short" },
  { id: "matching", label: "Matching" },
  { id: "viva", label: "Viva" },
];

const choiceBase = "cbta-btn flex min-h-13 w-full items-center gap-3 rounded-xl border-2 px-4 py-3 text-left text-[15.5px] font-semibold";

function Feedback({ ok, children }: { ok: boolean; children: React.ReactNode }) {
  return (
    <div role="status" className={`mt-4 rounded-xl p-4 text-[15px] ${ok ? "bg-ok-soft text-ok" : "bg-danger-soft text-danger"}`}>
      {children}
    </div>
  );
}

function Mcq({ mcq }: { mcq: GenConcept["practice"]["mcq"] }) {
  const [picked, setPicked] = useState<number | null>(null);
  const done = picked !== null;
  return (
    <div>
      <p className="text-[18px] font-bold leading-snug">{mcq.prompt}</p>
      <div className="mt-4 grid gap-2.5">
        {mcq.options.map((o, i) => {
          const state = !done ? "idle" : i === mcq.answerIndex ? "right" : i === picked ? "wrong" : "dim";
          return (
            <button key={o} type="button" disabled={done} onClick={() => setPicked(i)}
              className={`${choiceBase} ${
                state === "idle" ? "border-line border-b-line-strong bg-card hover:bg-paper" :
                state === "right" ? "border-ok/50 border-b-ok bg-ok-soft text-ok" :
                state === "wrong" ? "border-danger/40 border-b-danger bg-danger-soft text-danger" : "border-line bg-card opacity-50"
              }`}>
              <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-[13px] font-bold ${
                state === "right" ? "bg-ok text-white" : state === "wrong" ? "bg-danger text-white" : "bg-paper text-ink-2 ring-1 ring-line"
              }`}>
                {state === "right" ? <Check size={15} /> : state === "wrong" ? <X size={15} /> : String.fromCharCode(65 + i)}
              </span>
              {o}
            </button>
          );
        })}
      </div>
      {done && (
        <Feedback ok={picked === mcq.answerIndex}>
          <strong>{picked === mcq.answerIndex ? "সঠিক! Correct." : "ভুল হয়েছে।"}</strong>
          {picked !== mcq.answerIndex && <> Correct answer: <strong>{mcq.options[mcq.answerIndex]}</strong></>}
          <span className="mt-1.5 block text-[13px] text-ink-2">CBLM: “{mcq.answerCite.quote}”</span>
          <button type="button" onClick={() => setPicked(null)} className="mt-2 inline-flex items-center gap-1 text-[13px] font-semibold text-ink-2 hover:text-ink">
            <RotateCcw size={13} /> Try again
          </button>
        </Feedback>
      )}
    </div>
  );
}

function Short({ short }: { short: GenConcept["practice"]["short"] }) {
  const [shown, setShown] = useState(false);
  const [ticked, setTicked] = useState<Set<number>>(new Set());
  return (
    <div>
      <p className="text-[18px] font-bold leading-snug">{short.prompt}</p>
      <p className="mt-1.5 text-[14px] text-ink-3">Write your answer on paper first. Then check it here.</p>
      {!shown ? (
        <button type="button" onClick={() => setShown(true)} className="cbta-btn mt-4 inline-flex min-h-12 items-center gap-2 rounded-xl border-2 border-brand border-b-brand-ink bg-brand px-5 text-[15px] font-bold text-white">
          <Eye size={16} /> Show model answer
        </button>
      ) : (
        <div className="mt-4 space-y-4">
          <div className="whitespace-pre-line rounded-xl border-l-4 border-brand bg-brand-soft p-4 text-[16px] leading-relaxed">{short.modelAnswer}</div>
          <div>
            <p className="mb-2 text-[14px] font-bold text-ink-2">Tick the key points you wrote:</p>
            <ul className="space-y-2">
              {short.keyPoints.map((k, i) => (
                <li key={i}>
                  <label className="flex min-h-11 cursor-pointer items-start gap-3 rounded-xl border border-line bg-card px-3 py-2.5 text-[15px] has-[:checked]:border-ok/50 has-[:checked]:bg-ok-soft">
                    <input type="checkbox" className="mt-1 h-4 w-4 accent-[#12805c]" checked={ticked.has(i)}
                      onChange={() => setTicked((s) => { const n = new Set(s); if (n.has(i)) n.delete(i); else n.add(i); return n; })} />
                    {k.text}
                  </label>
                </li>
              ))}
            </ul>
            <p className="mt-2 text-[14px] font-semibold text-ink-2">{ticked.size} of {short.keyPoints.length} key points</p>
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
  const tile = "cbta-btn flex min-h-14 w-full items-center gap-2 rounded-xl border-2 px-3 py-2 text-left";

  return (
    <div>
      <p className="text-[18px] font-bold leading-snug">{matching.prompt}</p>
      <p className="mt-1 text-[14px] text-ink-3">Tap a term on the left, then its match on the right.</p>
      <div className="mt-4 grid grid-cols-2 gap-2.5">
        <div className="space-y-2.5">
          {matching.pairs.map((p, i) => {
            const isPaired = paired[i] !== undefined;
            return (
              <button key={p.left} type="button" disabled={isPaired} onClick={() => { setLeft(i); setWrong(null); }} aria-pressed={left === i}
                className={`${tile} text-[14.5px] font-bold ${
                  isPaired ? "border-ok/40 border-b-ok bg-ok-soft text-ok" :
                  left === i ? "border-brand border-b-brand-ink bg-brand-soft text-brand-ink" : "border-line border-b-line-strong bg-card hover:bg-paper"
                }`}>
                <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-[12px] ${isPaired ? "bg-ok text-white" : "bg-paper ring-1 ring-line"}`}>
                  {isPaired ? <Check size={13} /> : i + 1}
                </span>
                {p.left}
              </button>
            );
          })}
        </div>
        <div className="space-y-2.5">
          {rights.map((r) => {
            const pairedWith = Object.entries(paired).find(([, v]) => v === r.i)?.[0];
            return (
              <button key={r.i} type="button" disabled={pairedWith !== undefined} onClick={() => pickRight(r.i)}
                className={`${tile} text-[13.5px] font-medium leading-snug ${
                  pairedWith !== undefined ? "border-ok/40 border-b-ok bg-ok-soft text-ok" :
                  wrong === r.i ? "border-danger/40 border-b-danger bg-danger-soft text-danger" : "border-line border-b-line-strong bg-card hover:bg-paper"
                }`}>
                {pairedWith !== undefined && <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-ok text-[12px] font-bold text-white">{Number(pairedWith) + 1}</span>}
                {r.text}
              </button>
            );
          })}
        </div>
      </div>
      <div role="status" className="mt-3 min-h-6 text-[14px] font-semibold">
        {done ? <span className="text-ok">সব মিলেছে! All matched.</span> : wrong !== null ? <span className="text-danger">Not a match. Try another.</span> : null}
      </div>
      {done && (
        <button type="button" onClick={() => { setPaired({}); setLeft(null); }} className="inline-flex items-center gap-1 text-[13px] font-semibold text-ink-2 hover:text-ink">
          <RotateCcw size={13} /> Play again
        </button>
      )}
    </div>
  );
}

function Viva({ viva }: { viva: GenConcept["practice"]["viva"] }) {
  const [flipped, setFlipped] = useState(false);
  return (
    <div>
      <p className="mb-3 text-[14px] text-ink-3">Say the answer out loud, then flip the card. Viva questions are made from the CBLM, because the papers had no viva samples.</p>
      <button type="button" onClick={() => setFlipped((f) => !f)} className="cbta-flip block w-full text-left" aria-label={flipped ? "Show question" : "Show answer"}>
        <div className="cbta-flip-inner relative min-h-48" data-flipped={flipped}>
          <div className="cbta-flip-face absolute inset-0 flex flex-col justify-center rounded-2xl border-2 border-line border-b-4 border-b-line-strong bg-card p-6">
            <span className="mb-2 inline-flex items-center gap-1.5 text-[12px] font-bold uppercase tracking-wider text-ink-3"><Mic size={14} /> Assessor asks</span>
            <p className="text-[19px] font-bold leading-snug">{viva.prompt}</p>
            <span className="mt-4 text-[13px] font-semibold text-brand">Tap to flip →</span>
          </div>
          <div className="cbta-flip-face cbta-flip-back absolute inset-0 flex flex-col justify-center rounded-2xl border-2 border-brand/40 border-b-4 border-b-brand bg-brand-soft p-6">
            <span className="mb-2 text-[12px] font-bold uppercase tracking-wider text-brand-ink">You say</span>
            <p className="text-[18px] font-semibold leading-snug">{viva.answer.text}</p>
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
      <div role="tablist" aria-label="Practice type" className="grid grid-cols-4 gap-1 rounded-xl bg-paper p-1 ring-1 ring-line">
        {TABS.map(({ id, label }) => (
          <button key={id} role="tab" type="button" aria-selected={tab === id} onClick={() => setTab(id)}
            className={`min-h-10 rounded-lg text-[13.5px] font-bold transition-colors ${tab === id ? "bg-card text-ink shadow-sm ring-1 ring-line" : "text-ink-3 hover:text-ink"}`}>
            {label}
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
