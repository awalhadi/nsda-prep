"use client";

// All persistence is client-side localStorage. This is a real deployed
// Next.js app (not the sandboxed artifact preview), so localStorage is safe
// and appropriate here for a single-user offline-friendly study tool.

export interface AttemptRecord {
  id: string;
  moduleId: string;
  moduleTitle: string;
  date: string; // ISO
  total: number;
  correct: number;
  durationSec: number;
  wrongIds: string[];
}

export interface MistakeEntry {
  questionId: string;
  moduleId: string;
  lastMissedAt: string;
  timesMissed: number;
}

export interface FlashProgress {
  known: string[]; // question ids marked "I know this"
  learning: string[]; // question ids still learning
}

export interface UserSettings {
  defaultTimed: boolean;
  secondsPerQuestion: number;
  defaultCount: number;
}

export const DEFAULT_SETTINGS: UserSettings = {
  defaultTimed: true,
  secondsPerQuestion: 30,
  defaultCount: 15,
};

export interface StoreShape {
  attempts: AttemptRecord[];
  mistakes: Record<string, MistakeEntry>;
  flash: Record<string, FlashProgress>; // per moduleId
  streak: { lastDate: string | null; current: number; longest: number };
  xp: number;
  settings: UserSettings;
}

const KEY = "wdp3_store_v1";

function emptyStore(): StoreShape {
  return {
    attempts: [],
    mistakes: {},
    flash: {},
    streak: { lastDate: null, current: 0, longest: 0 },
    xp: 0,
    settings: { ...DEFAULT_SETTINGS },
  };
}

export function loadStore(): StoreShape {
  if (typeof window === "undefined") return emptyStore();
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return emptyStore();
    const parsed = JSON.parse(raw);
    return { ...emptyStore(), ...parsed };
  } catch {
    return emptyStore();
  }
}

export function saveStore(store: StoreShape) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, JSON.stringify(store));
}

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

export function bumpStreak(store: StoreShape): StoreShape {
  const today = todayStr();
  if (store.streak.lastDate === today) return store;
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
  const current = store.streak.lastDate === yesterday ? store.streak.current + 1 : 1;
  const longest = Math.max(current, store.streak.longest);
  return { ...store, streak: { lastDate: today, current, longest } };
}

export function recordAttempt(
  attempt: Omit<AttemptRecord, "id" | "date">
): StoreShape {
  let store = loadStore();
  store = bumpStreak(store);
  const record: AttemptRecord = {
    ...attempt,
    id: `${attempt.moduleId}-${Date.now()}`,
    date: new Date().toISOString(),
  };
  store.attempts = [record, ...store.attempts].slice(0, 300);

  const mistakesCopy = { ...store.mistakes };
  attempt.wrongIds.forEach((qid) => {
    const existing = mistakesCopy[qid];
    mistakesCopy[qid] = {
      questionId: qid,
      moduleId: attempt.moduleId,
      lastMissedAt: record.date,
      timesMissed: (existing?.timesMissed ?? 0) + 1,
    };
  });
  // clear mistakes for questions answered correctly this attempt that were
  // previously marked wrong but not in wrongIds this time
  store.mistakes = mistakesCopy;

  store.xp = store.xp + attempt.correct * 10 + Math.max(0, attempt.total - attempt.wrongIds.length - attempt.correct) * 0;
  saveStore(store);
  return store;
}

export function clearMistake(questionId: string) {
  const store = loadStore();
  if (store.mistakes[questionId]) {
    const next = { ...store.mistakes };
    delete next[questionId];
    store.mistakes = next;
    saveStore(store);
  }
}

export function getSettings(): UserSettings {
  return loadStore().settings;
}

export function saveSettings(settings: Partial<UserSettings>) {
  const store = loadStore();
  store.settings = { ...store.settings, ...settings };
  saveStore(store);
}

export function getFlashProgress(moduleId: string): FlashProgress {
  const store = loadStore();
  return store.flash[moduleId] ?? { known: [], learning: [] };
}

export function saveFlashProgress(moduleId: string, progress: FlashProgress) {
  const store = loadStore();
  store.flash = { ...store.flash, [moduleId]: progress };
  saveStore(store);
}

export function moduleStats(moduleId: string) {
  const store = loadStore();
  const attempts = store.attempts.filter((a) => a.moduleId === moduleId);
  const totalCorrect = attempts.reduce((s, a) => s + a.correct, 0);
  const totalQ = attempts.reduce((s, a) => s + a.total, 0);
  const accuracy = totalQ > 0 ? Math.round((totalCorrect / totalQ) * 100) : null;
  const lastAttempt = attempts[0] ?? null;
  return { attempts, accuracy, lastAttempt, attemptCount: attempts.length };
}

export function overallStats() {
  const store = loadStore();
  const totalCorrect = store.attempts.reduce((s, a) => s + a.correct, 0);
  const totalQ = store.attempts.reduce((s, a) => s + a.total, 0);
  const accuracy = totalQ > 0 ? Math.round((totalCorrect / totalQ) * 100) : 0;
  return {
    accuracy,
    totalQ,
    totalCorrect,
    attemptCount: store.attempts.length,
    streak: store.streak,
    xp: store.xp,
    mistakeCount: Object.keys(store.mistakes).length,
  };
}

export function level(xp: number) {
  // simple curve: 200xp per level
  const lvl = Math.floor(xp / 200) + 1;
  const into = xp % 200;
  const pct = Math.round((into / 200) * 100);
  return { lvl, pct, into, need: 200 };
}
