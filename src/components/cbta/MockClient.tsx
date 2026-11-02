"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Clock, Play, RotateCcw } from "lucide-react";
import { buildMock, scoreMock, BLUEPRINT, type MockAnswers, type MockPaper, type Pool } from "@/lib/cbta/mock";
import { recordPractice, saveMock } from "@/lib/cbta/progress";

type Stage = "setup" | "exam" | "mark" | "results";

const btnPrimary = "cbta-btn inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border-2 border-brand border-b-brand-ink bg-brand px-6 text-[15px] font-bold text-white";
const btnQuiet = "cbta-btn inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border-2 border-line border-b-line-strong bg-card px-4 text-[14px] font-bold text-ink-2 hover:bg-paper";

function useCountdown(active: boolean, minutes: number) {
  const [left, setLeft] = useState(minutes * 60);
  useEffect(() => {
    if (!active) return;
    const t = setInterval(() => setLeft((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(t);
  }, [active]);
  return [left, setLeft] as const;
}

export default function MockClient({ cblms }: { cblms: { n: number; title: string; ready: boolean }[] }) {
  const [stage, setStage] = useState<Stage>("setup");
  const [scope, setScope] = useState<number | "all">("all");
  const [paper, setPaper] = useState<MockPaper | null>(null);
  const [answers, setAnswers] = useState<MockAnswers>({ mcq: {}, matching: {}, short: {} });
  const [startedAt, setStartedAt] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [left, setLeft] = useCountdown(stage === "exam", BLUEPRINT.minutes);

  const start = async () => {
    setLoading(true); setError(null);
    try {
      const pool = (await (await fetch("/cbta/pool.json")).json()) as Pool;
      const p = buildMock(pool, scope, Date.now() % 1_000_000_007);
      setPaper(p); setAnswers({ mcq: {}, matching: {}, short: {} }); setLeft(p.minutes * 60);
      setStartedAt(Date.now()); setStage("exam"); window.scrollTo(0, 0);
    } catch {
      setError("Could not load the questions. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- time is up: move to marking automatically
    if (stage === "exam" && left === 0) setStage("mark");
  }, [left, stage]);

  const result = useMemo(() => (paper && stage === "results" ? scoreMock(paper, answers) : null), [paper, answers, stage]);

  const finish = () => {
    if (!paper) return;
    const r = scoreMock(paper, answers);
    for (const id of r.weak) recordPractice(id, "mock", false);
    for (const id of r.strong) recordPractice(id, "mock", true);
    saveMock({ at: new Date().toISOString(), scope: String(scope), minutes: Math.round((Date.now() - startedAt) / 60000), score: r.score, weak: r.weak });
    setStage("results"); window.scrollTo(0, 0);
  };

  if (stage === "setup") {
    return (
      <div className="space-y-6">
        <div className="rounded-2xl border border-line bg-card p-6">
          <h2 className="text-[18px] font-extrabold">Same pattern as the real exam</h2>
          <ul className="mt-3 grid grid-cols-3 divide-x divide-line rounded-xl border border-line text-center">
            {[["10", "MCQ"], ["5", "Matching"], ["10", "Short"]].map(([n, k]) => (
              <li key={k} className="py-3"><span className="block text-xl font-extrabold">{n}</span><span className="text-[12px] text-ink-3">{k}</span></li>
            ))}
          </ul>
          <p className="mt-3 text-[14px] text-ink-2"><Clock size={14} className="mr-1 inline" aria-hidden />60 minutes. Real exam questions come up more often, then ★★★ topics.</p>
        </div>
        <fieldset className="rounded-2xl border border-line bg-card p-6">
          <legend className="px-1 text-[15px] font-bold">Which CBLMs?</legend>
          <div className="mt-2 grid gap-2 sm:grid-cols-2">
            <label className="flex min-h-11 cursor-pointer items-center gap-2.5 rounded-xl border border-line px-3 has-[:checked]:border-brand has-[:checked]:bg-brand-soft">
              <input type="radio" name="scope" checked={scope === "all"} onChange={() => setScope("all")} className="accent-[#0e7c5a]" /> All CBLMs (full exam)
            </label>
            {cblms.filter((c) => c.ready).map((c) => (
              <label key={c.n} className="flex min-h-11 cursor-pointer items-center gap-2.5 rounded-xl border border-line px-3 text-[14px] has-[:checked]:border-brand has-[:checked]:bg-brand-soft">
                <input type="radio" name="scope" checked={scope === c.n} onChange={() => setScope(c.n)} className="accent-[#0e7c5a]" /> CBLM {c.n}: {c.title}
              </label>
            ))}
          </div>
        </fieldset>
        {error && <p role="alert" className="rounded-xl bg-danger-soft p-3 text-danger">{error}</p>}
        <button type="button" onClick={start} disabled={loading} className={btnPrimary}><Play size={16} aria-hidden /> {loading ? "Loading…" : "Start mock exam"}</button>
      </div>
    );
  }

  if (!paper) return null;
  const mm = String(Math.floor(left / 60)).padStart(2, "0"), ss = String(left % 60).padStart(2, "0");
  const letters = "ABCDEFGH";

  if (stage === "exam") {
    return (
      <div className="space-y-6">
        <div className="sticky top-14 z-30 -mx-4 flex items-center justify-between border-b border-line bg-paper/95 px-4 py-2 backdrop-blur sm:mx-0 sm:rounded-xl sm:border">
          <span className={`inline-flex items-center gap-1.5 text-[15px] font-extrabold tabular-nums ${left < 300 ? "text-danger" : "text-ink"}`}><Clock size={16} aria-hidden /> {mm}:{ss}</span>
          <button type="button" onClick={() => { setStage("mark"); window.scrollTo(0, 0); }} className={btnQuiet}>Submit paper</button>
        </div>

        <section className="rounded-2xl border border-line bg-card p-5 sm:p-6">
          <h2 className="mb-4 text-[18px] font-extrabold">Part A · Multiple choice <span className="text-[14px] font-semibold text-ink-3">(10)</span></h2>
          <ol className="space-y-6">
            {paper.mcq.map((q, qi) => (
              <li key={q.id}>
                <p className="font-bold">{qi + 1}. {q.prompt}</p>
                <div className="mt-2 grid gap-2">
                  {q.options.map((o, oi) => (
                    <label key={oi} className="flex min-h-11 cursor-pointer items-center gap-3 rounded-xl border-2 border-line px-3 py-2 text-[15px] has-[:checked]:border-brand has-[:checked]:bg-brand-soft">
                      <input type="radio" name={q.id} checked={answers.mcq[q.id] === oi} onChange={() => setAnswers((a) => ({ ...a, mcq: { ...a.mcq, [q.id]: oi } }))} className="accent-[#0e7c5a]" />
                      <span className="font-bold text-ink-3">{letters[oi]})</span> {o}
                    </label>
                  ))}
                </div>
              </li>
            ))}
          </ol>
        </section>

        <section className="rounded-2xl border border-line bg-card p-5 sm:p-6">
          <h2 className="mb-1 text-[18px] font-extrabold">Part B · Matching <span className="text-[14px] font-semibold text-ink-3">(5)</span></h2>
          <p className="mb-4 text-[14px] text-ink-3">Choose the letter from Column B for each item in Column A.</p>
          <div className="mb-4 rounded-xl bg-paper p-3 text-[14.5px] ring-1 ring-line">
            <p className="mb-1 text-[12px] font-bold uppercase tracking-wide text-ink-3">Column B</p>
            <ul className="space-y-1">{paper.matching.rightOrder.map((ri, k) => <li key={ri}><strong>{letters[k]})</strong> {paper.matching.pairs[ri].right}</li>)}</ul>
          </div>
          <ol className="space-y-3">
            {paper.matching.pairs.map((p, i) => (
              <li key={p.id} className="flex items-center gap-3">
                <span className="flex-1 font-semibold">{i + 1}. {p.left}</span>
                <select aria-label={`Answer for ${p.left}`} value={answers.matching[i] === undefined ? "" : String(paper.matching.rightOrder.indexOf(answers.matching[i]))}
                  onChange={(e) => { const k = Number(e.target.value); setAnswers((a) => ({ ...a, matching: { ...a.matching, [i]: paper.matching.rightOrder[k] } })); }}
                  className="min-h-11 w-20 rounded-xl border-2 border-line bg-card px-2 text-center font-bold">
                  <option value="">–</option>
                  {paper.matching.rightOrder.map((_, k) => <option key={k} value={k}>{letters[k]}</option>)}
                </select>
              </li>
            ))}
          </ol>
        </section>

        <section className="rounded-2xl border border-line bg-card p-5 sm:p-6">
          <h2 className="mb-1 text-[18px] font-extrabold">Part C · Short questions <span className="text-[14px] font-semibold text-ink-3">(10)</span></h2>
          <p className="mb-4 text-[14px] text-ink-3">Write your answers on paper or below. You will check them against the model answers after you submit.</p>
          <ol className="space-y-5">
            {paper.short.map((q, qi) => (
              <li key={q.id}>
                <p className="font-bold">{qi + 1}. {q.prompt}</p>
                <textarea rows={3} aria-label={`Your answer to question ${qi + 1}`} className="mt-2 w-full rounded-xl border-2 border-line bg-card p-3 text-[15px] focus:border-brand focus:outline-none" />
              </li>
            ))}
          </ol>
        </section>
        <button type="button" onClick={() => { setStage("mark"); window.scrollTo(0, 0); }} className={btnPrimary}>Submit paper</button>
      </div>
    );
  }

  if (stage === "mark") {
    return (
      <div className="space-y-5">
        <div className="rounded-2xl border border-line bg-card p-5">
          <h2 className="text-[18px] font-extrabold">Check your short answers</h2>
          <p className="mt-1 text-[14px] text-ink-2">MCQ and matching are marked automatically. For each short question, compare your answer with the model answer and be honest.</p>
        </div>
        {paper.short.map((q, qi) => {
          const v = answers.short[q.id];
          const set = (n: number) => setAnswers((a) => ({ ...a, short: { ...a.short, [q.id]: n } }));
          return (
            <section key={q.id} className="rounded-2xl border border-line bg-card p-5">
              {q.real && <span className="text-[12px] font-semibold text-ink-3">{q.real}</span>}
              <p className="font-bold">{qi + 1}. {q.prompt}</p>
              <div className="mt-3 whitespace-pre-line rounded-xl border-l-4 border-brand bg-brand-soft p-3 text-[15px]">{q.modelAnswer}</div>
              <div className="mt-3 grid grid-cols-3 gap-2" role="group" aria-label="How well did you answer?">
                {([[1, "Full"], [0.5, "Half"], [0, "Missed"]] as const).map(([n, label]) => (
                  <button key={label} type="button" aria-pressed={v === n} onClick={() => set(n)}
                    className={`cbta-btn min-h-11 rounded-xl border-2 text-[14px] font-bold ${v === n ? (n === 0 ? "border-danger/40 border-b-danger bg-danger-soft text-danger" : "border-ok/40 border-b-ok bg-ok-soft text-ok") : "border-line border-b-line-strong bg-card text-ink-2"}`}>
                    {label}
                  </button>
                ))}
              </div>
            </section>
          );
        })}
        <button type="button" onClick={finish} className={btnPrimary}>See my result</button>
      </div>
    );
  }

  if (!result) return null;
  const total = result.score.mcq[0] + result.score.matching[0] + result.score.short[0];
  const max = result.score.mcq[1] + result.score.matching[1] + result.score.short[1];
  const pct = Math.round((total / Math.max(1, max)) * 100);
  const byId = new Map([...paper.mcq, ...paper.short, ...paper.matching.pairs].map((x) => [x.conceptId, x.title]));
  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-line bg-card p-6 text-center">
        <p className="text-[13px] font-bold uppercase tracking-wider text-ink-3">Your score</p>
        <p className={`mt-1 text-5xl font-extrabold ${pct >= 70 ? "text-ok" : pct >= 50 ? "text-[#9a5b00]" : "text-danger"}`}>{pct}%</p>
        <p lang="bn" className="mt-2 text-ink-2">{pct >= 70 ? "চমৎকার! এভাবে চালিয়ে যান।" : pct >= 50 ? "ভালো হয়েছে, দুর্বল topic-গুলো আরেকবার পড়ুন।" : "আরও প্র্যাকটিস দরকার। নিচের topic-গুলো দিয়ে শুরু করুন।"}</p>
        <dl className="mt-5 grid grid-cols-3 divide-x divide-line rounded-xl border border-line">
          {(["mcq", "matching", "short"] as const).map((k) => (
            <div key={k} className="py-3"><dd className="text-xl font-extrabold">{result.score[k][0]}/{result.score[k][1]}</dd><dt className="text-[12px] capitalize text-ink-3">{k === "mcq" ? "MCQ" : k}</dt></div>
          ))}
        </dl>
      </section>
      {result.weak.length > 0 && (
        <section className="rounded-2xl border border-danger-line bg-danger-soft p-5">
          <h2 className="mb-1 text-[17px] font-extrabold text-danger">Read these again</h2>
          <p className="mb-3 text-[14px] text-ink-2">They are now in your revision list for tomorrow.</p>
          <ul className="space-y-1.5">
            {result.weak.map((id) => <li key={id}><Link href={`/cbta/concept/${id}`} className="font-semibold text-ink underline decoration-danger/40 underline-offset-4 hover:text-danger">{byId.get(id) ?? id}</Link></li>)}
          </ul>
        </section>
      )}
      <section className="rounded-2xl border border-line bg-card p-5">
        <h2 className="mb-3 text-[17px] font-extrabold">MCQ answers</h2>
        <ol className="space-y-2 text-[15px]">
          {paper.mcq.map((q, i) => {
            const ok = answers.mcq[q.id] === q.answerIndex;
            return <li key={q.id}><span className={ok ? "text-ok" : "text-danger"}>{ok ? "✓" : "✗"}</span> {i + 1}. {q.prompt} <strong className="text-ink">→ {q.options[q.answerIndex]}</strong></li>;
          })}
        </ol>
      </section>
      <div className="flex flex-wrap gap-3">
        <button type="button" onClick={() => setStage("setup")} className={btnPrimary}><RotateCcw size={16} aria-hidden /> New mock exam</button>
        <Link href="/cbta/revise" className={btnQuiet}>Go to revision</Link>
      </div>
    </div>
  );
}
