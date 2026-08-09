"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  RotateCw, Check, X, ArrowLeft, PartyPopper, Shuffle,
} from "lucide-react";
import type { CardQuestion } from "@/data/types";
import { getFlashProgress, saveFlashProgress } from "@/lib/storage";

function shuffleArr<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function FlashcardsClient({
  moduleId,
  moduleTitle,
  allCards,
}: {
  moduleId: string;
  moduleTitle: string;
  allCards: CardQuestion[];
}) {
  const [deck, setDeck] = useState<CardQuestion[]>([]);
  const [idx, setIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [known, setKnown] = useState<string[]>([]);
  const [learning, setLearning] = useState<string[]>([]);
  const [requeueDone, setRequeueDone] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- initial deck shuffle on mount/module change
    setDeck(shuffleArr(allCards));
  }, [allCards]);

  const card = deck[idx];
  const total = allCards.length;

  const flip = useCallback(() => setFlipped((f) => !f), []);

  const rate = useCallback(
    (know: boolean) => {
      if (!card) return;
      if (know) setKnown((k) => [...k, card.id]);
      else setLearning((l) => [...l, card.id]);

      if (idx + 1 < deck.length) {
        setIdx((v) => v + 1);
        setFlipped(false);
      } else if (!requeueDone && learning.length + (know ? 0 : 1) > 0) {
        // requeue the "still learning" cards once
        const stillLearning = know ? learning : [...learning, card.id];
        const requeueIds = new Set(stillLearning);
        const requeueCards = allCards.filter((c) => requeueIds.has(c.id));
        if (requeueCards.length > 0) {
          setDeck(shuffleArr(requeueCards));
          setIdx(0);
          setFlipped(false);
          setRequeueDone(true);
        } else {
          setDone(true);
        }
      } else {
        setDone(true);
      }
    },
    [card, idx, deck.length, requeueDone, learning, allCards]
  );

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (done) return;
      if (e.key === " ") {
        e.preventDefault();
        flip();
      } else if (flipped && (e.key === "1" || e.key.toLowerCase() === "n")) {
        rate(false);
      } else if (flipped && (e.key === "2" || e.key.toLowerCase() === "y")) {
        rate(true);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [flip, rate, flipped, done]);

  useEffect(() => {
    if (done) {
      const prev = getFlashProgress(moduleId);
      saveFlashProgress(moduleId, {
        known: Array.from(new Set([...prev.known, ...known])),
        learning: Array.from(new Set(learning.filter((id) => !known.includes(id)))),
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [done]);

  if (deck.length === 0) return null;

  if (done) {
    const knownCount = new Set(known).size;
    const pct = Math.round((knownCount / total) * 100);
    return (
      <div className="mx-auto max-w-xl px-4 sm:px-6 py-16 text-center space-y-5">
        <PartyPopper className="mx-auto text-amber" size={40} />
        <h1 className="font-display font-bold text-2xl">Deck complete</h1>
        <p className="text-text-muted text-sm">
          You knew {knownCount} of {total} cards ({pct}%) in {moduleTitle}.
        </p>
        <div className="flex gap-2 justify-center flex-wrap">
          <button
            onClick={() => {
              setDeck(shuffleArr(allCards));
              setIdx(0);
              setFlipped(false);
              setKnown([]);
              setLearning([]);
              setRequeueDone(false);
              setDone(false);
            }}
            className="inline-flex items-center gap-1.5 rounded-lg bg-teal text-[#052924] font-semibold text-sm px-4 py-2 hover:brightness-110 transition"
          >
            <Shuffle size={14} /> Study again
          </button>
          <Link href={`/module/${moduleId}`} className="rounded-lg border border-border-subtle bg-surface-2 text-sm px-4 py-2 hover:border-teal/60 transition inline-flex items-center gap-1.5">
            <ArrowLeft size={14} /> Module
          </Link>
        </div>
      </div>
    );
  }

  const progressPct = Math.round((idx / deck.length) * 100);

  return (
    <div className="mx-auto max-w-xl px-4 sm:px-6 py-6 sm:py-10">
      <div className="flex items-center justify-between mb-2 text-xs font-mono-tag text-text-faint">
        <span>{requeueDone ? "review round" : "card"} {idx + 1} / {deck.length}</span>
        <span className="flex items-center gap-3">
          <span className="text-teal">{known.length} known</span>
          <span className="text-amber">{learning.length} learning</span>
        </span>
      </div>
      <div className="h-1.5 rounded-full bg-surface-3 overflow-hidden mb-6">
        <div className="h-full bg-teal transition-all duration-300" style={{ width: `${progressPct}%` }} />
      </div>

      <button
        onClick={flip}
        className="w-full text-left rounded-2xl border border-border-subtle bg-surface p-6 sm:p-8 min-h-[240px] flex flex-col justify-center relative group"
        style={{ perspective: "1000px" }}
      >
        <span className="absolute top-4 right-4 text-text-faint group-hover:text-teal transition-colors">
          <RotateCw size={16} />
        </span>
        <p className="font-mono-tag text-[11px] text-text-faint mb-3">{card.topic} · {card.source}</p>
        {!flipped ? (
          <p className="font-display font-semibold text-lg sm:text-xl leading-snug">{card.question}</p>
        ) : (
          <div>
            <p className="text-[11px] uppercase tracking-wider text-teal mb-2 font-mono-tag">Answer</p>
            <p className="text-[15px] leading-relaxed whitespace-pre-line">{card.answer}</p>
          </div>
        )}
        <span className="text-[11px] text-text-faint mt-4 font-mono-tag">
          {flipped ? "tap to flip back" : "tap or press space to reveal"}
        </span>
      </button>

      {flipped && (
        <div className="mt-5 grid grid-cols-2 gap-3">
          <button
            onClick={() => rate(false)}
            className="flex items-center justify-center gap-2 rounded-xl border border-rose/50 bg-rose/10 text-rose font-medium text-sm py-3 hover:bg-rose/20 transition"
          >
            <X size={16} /> Still learning
          </button>
          <button
            onClick={() => rate(true)}
            className="flex items-center justify-center gap-2 rounded-xl border border-teal/50 bg-teal/10 text-teal font-medium text-sm py-3 hover:bg-teal/20 transition"
          >
            <Check size={16} /> I know this
          </button>
        </div>
      )}
    </div>
  );
}
