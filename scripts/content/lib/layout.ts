// Page layout helpers: reading order, repeated header/footer detection,
// printed page numbers and heading detection.

import type { RawDoc, RawLine, RawPage } from "./raw.ts";
import { cleanText, normalizeForMatch } from "./normalize.ts";

const EDGE = 0.12; // top/bottom share of the page treated as header/footer zone

export function orderedLines(page: RawPage): RawLine[] {
  return [...page.lines].sort((a, b) => {
    const dy = a.bbox[1] - b.bbox[1];
    return Math.abs(dy) > 3 ? dy : a.bbox[0] - b.bbox[0];
  });
}

function boilerKey(text: string): string {
  return normalizeForMatch(text).replace(/\d+/g, "#");
}

function inEdge(line: RawLine, page: RawPage): boolean {
  return line.bbox[1] < page.height * EDGE || line.bbox[3] > page.height * (1 - EDGE);
}

/** Keys of lines that repeat in the header/footer zone on many pages of a document. */
export function detectBoilerplate(doc: RawDoc): Set<string> {
  const counts = new Map<string, number>();
  for (const page of doc.pages) {
    const seen = new Set<string>();
    for (const line of page.lines) {
      if (!inEdge(line, page)) continue;
      const k = boilerKey(line.text);
      if (k && !seen.has(k)) {
        seen.add(k);
        counts.set(k, (counts.get(k) ?? 0) + 1);
      }
    }
  }
  const min = Math.max(3, Math.ceil(doc.pages.length * 0.3));
  return new Set([...counts].filter(([, n]) => n >= min).map(([k]) => k));
}

export function isBoilerplate(line: RawLine, page: RawPage, boiler: Set<string>): boolean {
  if (inEdge(line, page) && boiler.has(boilerKey(line.text))) return true;
  // Small running headers (e.g. "Unit - Information Sheet No: 1 - …") and "Page N of M" footers.
  if (line.bbox[1] < page.height * 0.07 && line.size < 9) return true;
  return /^page\s*\d+\s*of\s*\d+$/i.test(line.text.trim());
}

export function printedPageNumber(page: RawPage): number | null {
  for (const line of page.lines) {
    if (line.bbox[1] < page.height * 0.8) continue;
    const m = /page\s*(\d+)\s*of\s*\d+/i.exec(line.text);
    if (m) return Number(m[1]);
  }
  return null;
}

/** Body font size = the size carrying the most characters in the document. */
export function bodySize(doc: RawDoc): number {
  const weight = new Map<number, number>();
  for (const p of doc.pages)
    for (const l of p.lines) {
      const s = Math.round(l.size * 2) / 2;
      weight.set(s, (weight.get(s) ?? 0) + l.text.length);
    }
  let best = 11, bestW = -1;
  for (const [s, w] of weight) if (w > bestW) [best, bestW] = [s, w];
  return best;
}

export type HeadingLevel = 1 | 2 | 0;

export function headingLevel(line: RawLine, body: number): HeadingLevel {
  const text = cleanText(line.text);
  if (text.length < 3 || text.length > 110 || !/[A-Za-z]{3}/.test(text)) return 0;
  if (/\.{4,}/.test(text)) return 0; // table-of-contents leader dots
  if (line.size >= body + 2.5) return 1;
  // 12pt body text is common next to 11pt text, so a size-only heading must be clearly larger.
  if (line.size >= body + 1.4 && !/[.,;]$/.test(text) && !/^[a-z]/.test(text)) return 2;
  if (line.bold && text.length <= 80 && !/[.;,]$/.test(text) && !/^[•\-–]/.test(text)) return 2;
  return 0;
}
