"use client";

import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import Link from "next/link";
import {
  Check, X, ArrowRight, Flag, ArrowLeft, RotateCcw,
  Trophy, Target, Timer as TimerIcon,
} from "lucide-react";
import type { MCQQuestion } from "@/data/types";
import ProgressRing from "@/components/ProgressRing";
import { recordAttempt } from "@/lib/storage";

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

type Phase = "active" | "results";

interface Props {
  moduleId: string;
  moduleTitle: string;
  allQuestions: MCQQuestion[];
  count: number;
  timed: boolean;
}

const TIME_PER_Q = 30;

export default function QuizClient({ moduleId, moduleTitle, allQuestions, count, timed }: Props) {
  const questions = useMemo(() => shuffle(allQuestions).slice(0, count), [allQuestions, count]);
  const [idx, setIdx] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [locked, setLocked] = useState(false);
  const [answers, setAnswers] = useState<Record<string, { chosen: number | null; correct: boolean }>>({});
  const [phase, setPhase] = useState<Phase>("active");
  const [timeLeft, setTimeLeft] = useState(TIME_PER_Q);
  const [startedAt] = useState(() => Date.now());
  const [savedOnce, setSavedOnce] = useState(false);
  const [finalDurationSec, setFinalDurationSec] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const q = questions[idx];
  const total = questions.length;
  const correctCount = Object.values(answers).filter((a) => a.correct).length;

  const goNext = useCallback(() => {
    if (idx + 1 >= total) {
      setFinalDurationSec(Math.round((Date.now() - startedAt) / 1000));
      setPhase("results");
    } else {
      setIdx((v) => v + 1);
      setSelected(null);
      setLocked(false);
      setTimeLeft(TIME_PER_Q);
    }
  }, [idx, total, startedAt]);

  const commitAnswer = useCallback(
    (choice: number | null) => {
      if (!q || locked) return;
      const correct = choice === q.answerIndex;
      setAnswers((prev) => ({ ...prev, [q.id]: { chosen: choice, correct } }));
      setSelected(choice);
      setLocked(true);
    },
    [q, locked]
  );

  // timer
  useEffect(() => {
    if (!timed || phase !== "active" || locked) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          commitAnswer(null);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timed, phase, locked, idx]);

  // keyboard shortcuts
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (phase !== "active" || !q) return;
      if (["1", "2", "3", "4"].includes(e.key)) {
        const n = parseInt(e.key, 10) - 1;
        if (n < q.options.length) commitAnswer(n);
      } else if (e.key === "Enter" || e.key === " ") {
        if (locked) {
          e.preventDefault();
          goNext();
        }
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [phase, q, locked, commitAnswer, goNext]);

  // save attempt on reaching results
  useEffect(() => {
    if (phase === "results" && !savedOnce) {
      const wrongIds = Object.entries(answers)
        .filter(([, v]) => !v.correct)
        .map(([id]) => id);
      recordAttempt({
        moduleId,
        moduleTitle,
        total: questions.length,
        correct: correctCount,
        durationSec: finalDurationSec,
        wrongIds,
      });
      // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time attempt persistence when entering results phase
      setSavedOnce(true);
    }
  }, [phase, savedOnce, answers, moduleId, moduleTitle, questions.length, correctCount, finalDurationSec]);

  if (total === 0) {
    return <p className="text-text-muted p-8">No questions available.</p>;
  }

  if (phase === "results") {
    const pct = Math.round((correctCount / total) * 100);
    const wrongQuestions = questions.filter((qq) => answers[qq.id] && !answers[qq.id].correct);
    return (
      <div className="mx-auto max-w-3xl px-4 sm:px-6 py-10 space-y-6">
        <div className="rounded-2xl border border-border-subtle bg-surface p-6 sm:p-8 flex flex-col sm:flex-row items-center gap-8">
          <ProgressRing value={pct} size={140} color="auto" />
          <div className="flex-1 text-center sm:text-left">
            <p className="font-mono-tag text-xs text-teal mb-1">$ session complete</p>
            <h1 className="font-display font-bold text-2xl flex items-center gap-2 justify-center sm:justify-start">
              {pct >= 80 ? <Trophy size={22} className="text-amber" /> : <Target size={22} className="text-teal" />}
              {moduleTitle}
            </h1>
            <p className="text-text-muted text-sm mt-2">
              {correctCount} of {total} correct — {pct}% accuracy, in {finalDurationSec}s.
            </p>
            <div className="flex gap-2 mt-4 justify-center sm:justify-start flex-wrap">
              <Link href={`/module/${moduleId}`} className="rounded-lg border border-border-subtle bg-surface-2 text-sm px-4 py-2 hover:border-teal/60 transition inline-flex items-center gap-1.5">
                <ArrowLeft size={14} /> Module
              </Link>
              {wrongQuestions.length > 0 && (
                <Link
                  href={`/quiz/${moduleId}?count=${wrongQuestions.length}&timed=0&retry=1`}
                  className="rounded-lg bg-amber text-[#1a1200] font-semibold text-sm px-4 py-2 hover:brightness-110 transition inline-flex items-center gap-1.5"
                >
                  <RotateCcw size={14} /> Retry mistakes ({wrongQuestions.length})
                </Link>
              )}
              <Link href="/" className="rounded-lg border border-border-subtle bg-surface-2 text-sm px-4 py-2 hover:border-teal/60 transition">
                Dashboard
              </Link>
            </div>
          </div>
        </div>

        {wrongQuestions.length > 0 && (
          <div className="space-y-3">
            <h2 className="font-display font-semibold text-lg flex items-center gap-2">
              <Flag size={16} className="text-rose" /> Review mistakes
            </h2>
            {wrongQuestions.map((wq) => {
              const chosen = answers[wq.id]?.chosen;
              return (
                <div key={wq.id} className="rounded-xl border border-border-subtle bg-surface p-4">
                  <p className="font-medium text-sm mb-3">{wq.question}</p>
                  <div className="space-y-1.5">
                    {wq.options.map((opt, i) => {
                      const isCorrect = i === wq.answerIndex;
                      const isChosen = i === chosen;
                      return (
                        <div
                          key={i}
                          className={`text-xs rounded-lg px-3 py-2 border flex items-center gap-2 font-mono-tag ${
                            isCorrect
                              ? "border-teal/60 bg-teal/10 text-teal"
                              : isChosen
                              ? "border-rose/60 bg-rose/10 text-rose"
                              : "border-border-subtle text-text-muted"
                          }`}
                        >
                          {isCorrect ? <Check size={12} /> : isChosen ? <X size={12} /> : <span className="w-3" />}
                          {opt}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  const progressPct = Math.round((idx / total) * 100);
  const timeUrgent = timed && timeLeft <= 10;

  return (
    <div className="mx-auto max-w-2xl px-4 sm:px-6 py-6 sm:py-10">
      {/* progress + score bar */}
      <div className="flex items-center justify-between mb-2 text-xs font-mono-tag text-text-faint">
        <span>Q{idx + 1} / {total}</span>
        <span className="flex items-center gap-3">
          <span className="text-teal">{correctCount} correct</span>
          {timed && (
            <span className={`flex items-center gap-1 ${timeUrgent ? "text-rose animate-pulse" : ""}`}>
              <TimerIcon size={12} /> {timeLeft}s
            </span>
          )}
        </span>
      </div>
      <div className="h-1.5 rounded-full bg-surface-3 overflow-hidden mb-6">
        <div className="h-full bg-teal transition-all duration-300" style={{ width: `${progressPct}%` }} />
      </div>

      <div className="rounded-2xl border border-border-subtle bg-surface p-5 sm:p-7">
        <p className="font-mono-tag text-[11px] text-text-faint mb-3">{q.topic} · {q.source}</p>
        <h2 className="font-display font-semibold text-lg sm:text-xl leading-snug mb-6">{q.question}</h2>

        <div className="space-y-2.5">
          {q.options.map((opt, i) => {
            const isCorrect = i === q.answerIndex;
            const isChosen = i === selected;
            let stateClasses = "border-border-subtle bg-surface-2 hover:border-teal/50 hover:bg-surface-3";
            if (locked) {
              if (isCorrect) stateClasses = "border-teal bg-teal/10 text-teal";
              else if (isChosen) stateClasses = "border-rose bg-rose/10 text-rose";
              else stateClasses = "border-border-subtle bg-surface-2 opacity-50";
            }
            return (
              <button
                key={i}
                disabled={locked}
                onClick={() => commitAnswer(i)}
                className={`w-full text-left rounded-xl border px-4 py-3 flex items-center gap-3 transition-all text-sm ${stateClasses} ${locked ? "cursor-default" : "cursor-pointer active:scale-[0.99]"}`}
              >
                <span className="font-mono-tag text-[11px] w-5 h-5 flex items-center justify-center rounded-md border border-border-subtle shrink-0">
                  {i + 1}
                </span>
                <span className="flex-1">{opt}</span>
                {locked && isCorrect && <Check size={16} className="shrink-0" />}
                {locked && isChosen && !isCorrect && <X size={16} className="shrink-0" />}
              </button>
            );
          })}
        </div>

        <div className="mt-6 flex justify-between items-center">
          <span className="text-xs text-text-faint font-mono-tag hidden sm:block">
            tip: press 1–4 to answer, enter to continue
          </span>
          {locked && (
            <button
              onClick={goNext}
              autoFocus
              className="ml-auto inline-flex items-center gap-1.5 rounded-lg bg-teal text-[#052924] font-semibold text-sm px-5 py-2.5 hover:brightness-110 transition"
            >
              {idx + 1 >= total ? "See results" : "Next"} <ArrowRight size={14} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
