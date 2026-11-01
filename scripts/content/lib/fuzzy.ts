// Quote verification against extracted page text, without dependencies.

import { normalizeForMatch, tokens } from "./normalize.ts";

export interface QuoteMatch {
  /** 1 = exact after normalisation; otherwise best token-window similarity. */
  score: number;
  exact: boolean;
}

/** Token-level Levenshtein distance. */
export function tokenDistance(a: string[], b: string[]): number {
  const prev = new Array(b.length + 1).fill(0).map((_, j) => j);
  for (let i = 1; i <= a.length; i++) {
    let diag = prev[0];
    prev[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const tmp = prev[j];
      prev[j] = Math.min(prev[j] + 1, prev[j - 1] + 1, diag + (a[i - 1] === b[j - 1] ? 0 : 1));
      diag = tmp;
    }
  }
  return prev[b.length];
}

export function findQuote(quote: string, pageText: string): QuoteMatch {
  const q = normalizeForMatch(quote);
  const page = normalizeForMatch(pageText);
  if (!q) return { score: 0, exact: false };
  if (page.includes(q)) return { score: 1, exact: true };
  const qt = q.split(" ");
  const pt = page.split(" ");
  let best = 0;
  for (const size of [qt.length - 1, qt.length, qt.length + 1]) {
    if (size < 1 || size > pt.length) continue;
    for (let i = 0; i + size <= pt.length; i++) {
      // Cheap pre-filter: the window must share its first or last token with the quote.
      if (pt[i] !== qt[0] && pt[i + size - 1] !== qt[qt.length - 1]) continue;
      const d = tokenDistance(qt, pt.slice(i, i + size));
      const s = 1 - d / Math.max(qt.length, size);
      if (s > best) best = s;
    }
  }
  return { score: Math.round(best * 1000) / 1000, exact: false };
}

const STOP = new Set(
  ("a an the and or of to in on at by for with from as is are was were be been being it its this that these those " +
    "which who whom what when where why how can could will would should must may might do does did not no than then " +
    "so such into about over under your you we our they their them he she his her there here also any all each every " +
    "has have had one").split(" "),
);

/** Crude stem: drop a plural "s", then keep 6 letters (eliminate/elimination, isolating/isolation). */
export function stem(t: string): string {
  const w = t.length > 4 ? t.replace(/s$/, "") : t;
  return w.length > 6 ? w.slice(0, 6) : w;
}

export function contentWords(text: string): string[] {
  return tokens(text).filter((t) => t.length >= 3 && !STOP.has(t)).map(stem);
}

/** Share of the claim's content words that appear in the cited quotes (0–1). */
export function supportScore(claimText: string, quotes: string[]): number {
  const words = contentWords(claimText);
  if (!words.length) return 1;
  const pool = new Set(quotes.flatMap(contentWords));
  const hit = words.filter((w) => pool.has(w)).length;
  return Math.round((hit / words.length) * 100) / 100;
}
