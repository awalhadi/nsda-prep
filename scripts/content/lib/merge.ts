// Turns raw text-markup annotations into merged, readable passages.
//
// Users highlight one sentence or list in several strokes, and a quad often
// cuts a word in half ("su" of "supports"). We map every quad to whole words,
// then merge annotations whose word spans touch in reading order.

import type { RawAnnot, RawPage, RawWord } from "./raw.ts";
import { isTrivialToken, joinWords } from "./normalize.ts";

export const MARKUP_TYPES = new Set(["Highlight", "Underline"]);

/** Words sorted into reading order (block, line, word number). */
export function readingOrder(words: RawWord[]): RawWord[] {
  return [...words].sort((a, b) => a[5] - b[5] || a[6] - b[6] || a[7] - b[7]);
}

/**
 * A word belongs to a quad when its centre is inside the quad, or when the
 * quad covers at least a quarter of the word's width on the same text line.
 * The second rule turns word fragments into whole words.
 */
export function wordInQuad(w: RawWord, q: [number, number, number, number]): boolean {
  const [x0, y0, x1, y1] = w;
  const cx = (x0 + x1) / 2, cy = (y0 + y1) / 2;
  if (cx >= q[0] && cx <= q[2] && cy >= q[1] - 1 && cy <= q[3] + 1) return true;
  const wh = y1 - y0, ww = x1 - x0;
  const ovy = Math.min(y1, q[3]) - Math.max(y0, q[1]);
  const ovx = Math.min(x1, q[2]) - Math.max(x0, q[0]);
  return wh > 0 && ww > 0 && ovy >= 0.5 * wh && ovx >= 0.25 * ww;
}

/** Any horizontal overlap on the same text line: used when a marking covers only part of a word. */
export function wordTouchesQuad(w: RawWord, q: [number, number, number, number]): boolean {
  const [x0, y0, x1, y1] = w;
  const wh = y1 - y0;
  const ovy = Math.min(y1, q[3]) - Math.max(y0, q[1]);
  const ovx = Math.min(x1, q[2]) - Math.max(x0, q[0]);
  return wh > 0 && ovy >= 0.5 * wh && ovx > 0.5;
}

/**
 * Indices (into reading-ordered words) covered by an annotation, and whether
 * only part of a word was marked. Highlighting just the first letters
 * (P-erformance, S-tandards, C-onditions) is a deliberate memory trick.
 */
export function annotWordIndices(annot: RawAnnot, ordered: RawWord[]): { indices: number[]; partial: boolean } {
  const quads = annot.quads.length ? annot.quads : [annot.rect];
  const out: number[] = [];
  ordered.forEach((w, i) => {
    if (quads.some((q) => wordInQuad(w, q))) out.push(i);
  });
  if (out.length) return { indices: out, partial: false };
  ordered.forEach((w, i) => {
    if (quads.some((q) => wordTouchesQuad(w, q))) out.push(i);
  });
  return { indices: out, partial: out.length > 0 };
}

export interface MergedSpan {
  annotXrefs: number[];
  partial: boolean;
  types: string[];
  colors: number[][];
  indices: number[];
}

/**
 * Merge annotations on one page when their word spans overlap or touch,
 * allowing only trivial tokens (bullets, dashes) between them.
 */
export function mergeSpans(
  items: { annot: RawAnnot; indices: number[]; partial?: boolean }[],
  ordered: RawWord[],
): MergedSpan[] {
  const withWords = items.filter((it) => it.indices.length > 0)
    .sort((a, b) => a.indices[0] - b.indices[0]);
  const spans: MergedSpan[] = [];
  for (const it of withWords) {
    const last = spans[spans.length - 1];
    if (last) {
      const lastMax = last.indices[last.indices.length - 1];
      const start = it.indices[0];
      let touches = start <= lastMax + 1;
      if (!touches) {
        touches = true;
        for (let i = lastMax + 1; i < start; i++) {
          if (!isTrivialToken(ordered[i][4])) { touches = false; break; }
        }
      }
      if (touches) {
        last.annotXrefs.push(it.annot.xref);
        last.types.push(it.annot.type);
        last.colors.push(it.annot.color);
        last.partial = last.partial || !!it.partial;
        last.indices = [...new Set([...last.indices, ...it.indices])].sort((a, b) => a - b);
        continue;
      }
    }
    spans.push({
      partial: !!it.partial,
      annotXrefs: [it.annot.xref],
      types: [it.annot.type],
      colors: [it.annot.color],
      indices: [...it.indices],
    });
  }
  return spans;
}

/** Text of a merged span; gaps inside the span (unhighlighted words) are kept for readability. */
export function spanText(span: MergedSpan, ordered: RawWord[]): string {
  const first = span.indices[0], last = span.indices[span.indices.length - 1];
  return joinWords(ordered.slice(first, last + 1).map((w) => w[4]));
}

/** Surrounding sentence context inside the same text block. */
export function spanContext(span: MergedSpan, ordered: RawWord[], radius = 30): string {
  const first = span.indices[0], last = span.indices[span.indices.length - 1];
  const block = ordered[first][5];
  let a = first, b = last;
  while (a > 0 && first - a < radius && ordered[a - 1][5] === block) a--;
  while (b < ordered.length - 1 && b - last < radius && ordered[b + 1][5] === block) b++;
  return joinWords(ordered.slice(a, b + 1).map((w) => w[4]));
}

/**
 * Nearest preceding line (within a few lines) that introduces a list, e.g.
 * "An inclusive learning environment is one that:". Keeps list items meaningful.
 */
export function leadIn(span: MergedSpan, ordered: RawWord[]): string | null {
  const first = ordered[span.indices[0]];
  const lines = new Map<string, RawWord[]>();
  for (const w of ordered) {
    const key = `${w[5]}:${w[6]}`;
    if (!lines.has(key)) lines.set(key, []);
    lines.get(key)!.push(w);
  }
  const keys = [...lines.keys()];
  const startKey = `${first[5]}:${first[6]}`;
  const idx = keys.indexOf(startKey);
  // Walk back through the list; a finished sentence that is not a bullet ends the search.
  for (let k = idx - 1; k >= Math.max(0, idx - 20); k--) {
    const text = joinWords(lines.get(keys[k])!.map((w) => w[4]));
    if (/:\s*$/.test(text) || /\bfollowing\b/i.test(text)) return text;
    if (/\.\s*$/.test(text) && !/^[•\-–]/.test(text) && k < idx - 1) return null;
  }
  return null;
}

export interface PageMarkup {
  spans: MergedSpan[];
  /** Markup annotations that cover no extractable word (image or blank area). */
  empty: RawAnnot[];
}

export function mergePageMarkup(page: RawPage): PageMarkup & { ordered: RawWord[] } {
  const ordered = readingOrder(page.words);
  const items = page.annots
    .filter((a) => MARKUP_TYPES.has(a.type))
    .map((annot) => ({ annot, ...annotWordIndices(annot, ordered) }));
  return {
    ordered,
    spans: mergeSpans(items, ordered),
    empty: items.filter((it) => it.indices.length === 0).map((it) => it.annot),
  };
}
