"use client";

// CBT&A learner progress, stored in the app's existing localStorage store under `cbta`.
// The Web Design fields (attempts, mistakes, xp …) are never touched from here.

import { loadStore, saveStore } from "../storage";
import { isDue, localDay, review, type LeitnerEntry } from "./leitner";

export type PracticeKind = "mcq" | "short" | "matching" | "viva" | "mock" | "revise";

export interface CbtaAttempt {
  conceptId: string;
  kind: PracticeKind;
  correct: boolean;
  at: string;
}

export interface MockResult {
  at: string;
  scope: string;
  minutes: number;
  score: Record<"mcq" | "matching" | "short", [number, number]>;
  weak: string[];
}

export interface CbtaState {
  v: 1;
  attempts: CbtaAttempt[];
  leitner: Record<string, LeitnerEntry>;
  read: Record<string, string>;
  mastered: Record<string, string>;
  mocks: MockResult[];
}

const MAX_ATTEMPTS = 3000;
const MAX_MOCKS = 50;

export function emptyCbta(): CbtaState {
  return { v: 1, attempts: [], leitner: {}, read: {}, mastered: {}, mocks: [] };
}

const isObj = (v: unknown): v is Record<string, unknown> => !!v && typeof v === "object" && !Array.isArray(v);

/** Repairs anything malformed instead of throwing, so a bad store never breaks the app. */
export function migrateCbta(raw: unknown): CbtaState {
  const out = emptyCbta();
  if (!isObj(raw)) return out;
  if (Array.isArray(raw.attempts)) out.attempts = raw.attempts.filter((a): a is CbtaAttempt =>
    isObj(a) && typeof a.conceptId === "string" && typeof a.correct === "boolean" && typeof a.at === "string").slice(-MAX_ATTEMPTS);
  if (isObj(raw.leitner)) for (const [k, e] of Object.entries(raw.leitner))
    if (isObj(e) && [1, 2, 3].includes(e.box as number) && typeof e.due === "string") out.leitner[k] = e as unknown as LeitnerEntry;
  for (const key of ["read", "mastered"] as const) if (isObj(raw[key]))
    for (const [k, v] of Object.entries(raw[key] as object)) if (typeof v === "string") out[key][k] = v;
  if (Array.isArray(raw.mocks)) out.mocks = raw.mocks.filter((m): m is MockResult => isObj(m) && typeof m.at === "string").slice(-MAX_MOCKS);
  return out;
}

export function getCbta(): CbtaState {
  return migrateCbta(loadStore().cbta);
}

export function updateCbta(fn: (s: CbtaState) => CbtaState): CbtaState {
  const store = loadStore();
  const next = fn(migrateCbta(store.cbta));
  try {
    saveStore({ ...store, cbta: next });
  } catch {
    // Storage full or blocked: keep working for this session.
  }
  window.dispatchEvent(new Event("cbta-progress"));
  return next;
}

/** Record one practice answer and move the concept through the Leitner boxes. */
export function recordPractice(conceptId: string, kind: PracticeKind, correct: boolean, now = new Date()): CbtaState {
  const today = localDay(now);
  return updateCbta((s) => {
    const next = review(s.leitner[conceptId], correct, today);
    const leitner = { ...s.leitner };
    const mastered = { ...s.mastered };
    if (next) leitner[conceptId] = next;
    else if (s.leitner[conceptId]) { delete leitner[conceptId]; mastered[conceptId] = today; }
    return {
      ...s, leitner, mastered,
      attempts: [...s.attempts, { conceptId, kind, correct, at: now.toISOString() }].slice(-MAX_ATTEMPTS),
    };
  });
}

/** Put a concept into revision on purpose ("revise later"). */
export function reviseLater(conceptId: string, now = new Date()): CbtaState {
  return recordPractice(conceptId, "revise", false, now);
}

export function markRead(conceptId: string, now = new Date()): void {
  const s = getCbta();
  if (s.read[conceptId]) return;
  updateCbta((st) => ({ ...st, read: { ...st.read, [conceptId]: localDay(now) } }));
}

export function saveMock(result: MockResult): CbtaState {
  return updateCbta((s) => ({ ...s, mocks: [...s.mocks, result].slice(-MAX_MOCKS) }));
}

export function dueConcepts(s: CbtaState, now = new Date()): string[] {
  const today = localDay(now);
  return Object.entries(s.leitner).filter(([, e]) => isDue(e, today))
    .sort((a, b) => a[1].due.localeCompare(b[1].due)).map(([id]) => id);
}
