// Pairs CBLM Self Check questions with their Answer Key entries and flags
// answers that look wrong or unreadable. CBLM answer keys contain errors,
// so suspicious pairs are surfaced for review, never silently trusted.

import type { Segmented, SectionKind } from "./segment.ts";
import { cleanText, tokens } from "./normalize.ts";
import { headingLevel } from "./layout.ts";

export interface NumberedItem {
  num: number;
  page: number;
  printedPage: number | null;
  text: string;
}

// "1.", "1)", "Q01 - …", "Question 2:", "Answer 1", "Ans No. 3"
const ITEM = /^(?:(?:q(?:uestion)?|answer|ans)\.?\s*(?:no\.?)?\s*)?0?(\d{1,2})\s*(?:[.):\-–]\s*|$)(.*)$/i;

/** Collect sequentially numbered items (1, 2, 3 …) from pages of one section. */
export function numberedItems(
  seg: Segmented,
  kind: SectionKind,
  num: number,
  part = 1,
): NumberedItem[] {
  const items: NumberedItem[] = [];
  let expected = 1;
  for (const p of seg.pages) {
    if (p.section.kind !== kind || p.section.num !== num || p.section.part !== part) continue;
    for (const line of p.lines) {
      const text = cleanText(line.text);
      if (!text || /^_+$/.test(text.replace(/\s/g, ""))) continue;
      if (headingLevel(line, seg.body) === 1) continue; // section title
      const m = ITEM.exec(text);
      if (m && Number(m[1]) === expected) {
        items.push({ num: expected, page: p.page, printedPage: p.printedPage, text: m[2] });
        expected++;
      } else if (items.length) {
        items[items.length - 1].text += "\n" + text;
      }
    }
  }
  for (const it of items) it.text = it.text.replace(/\n?_{3,}.*$/gm, "").trim();
  return items;
}

export interface SelfCheckPair {
  id: string;
  part: number;
  sheet: number;
  num: number;
  question: string;
  questionPage: number;
  questionPrintedPage: number | null;
  answer: string | null;
  answerPage: number | null;
  answerPrintedPage: number | null;
  /** Token overlap between the self-check question and the question restated in the answer key. */
  restatedSimilarity: number | null;
  flags: string[];
}

function jaccard(a: string, b: string): number {
  const A = new Set(tokens(a)), B = new Set(tokens(b));
  if (!A.size || !B.size) return 0;
  let inter = 0;
  for (const t of A) if (B.has(t)) inter++;
  return Math.round((inter / (A.size + B.size - inter)) * 100) / 100;
}

/** Split an answer-key item into the restated question and the answer. */
export function splitAnswer(text: string): { restated: string; answer: string } {
  const ans = /\b(?:ans(?:wer)?)\s*[:.\-]\s*/i.exec(text);
  if (ans) return { restated: text.slice(0, ans.index).trim(), answer: text.slice(ans.index + ans[0].length).trim() };
  const q = text.indexOf("?");
  if (q !== -1) return { restated: text.slice(0, q + 1).trim(), answer: text.slice(q + 1).trim() };
  return { restated: "", answer: text.trim() };
}

/**
 * "What is X?" answered with a definition of a different term,
 * e.g. "What is workplace hazard?" → "A workplace is a place where …".
 */
export function definitionMismatch(question: string, answer: string): boolean {
  const q = /^\s*what\s+(?:is|are|do\s+you\s+mean\s+by)\s+(?:an?\s+|the\s+)?(.+?)\s*\?/i.exec(question);
  if (!q) return false;
  const subject = tokens(q[1]);
  const head = subject[subject.length - 1];
  if (!head) return false;
  const opening = tokens(answer).slice(0, 10);
  const defines = /^\s*(?:an?\s+|the\s+)?([\w\s'-]{2,40}?)\s+(?:is|are|means|refers)\b/i.exec(answer);
  if (!defines) return false;
  const defined = tokens(defines[1]);
  return !defined.includes(head) && !opening.slice(0, 3).includes(head);
}

export function pairSelfChecks(seg: Segmented, sourceId: string): SelfCheckPair[] {
  const sheets = [...new Set(
    seg.pages.filter((p) => p.section.kind === "selfcheck" && p.section.num !== null)
      .map((p) => `${p.section.part}:${p.section.num}`),
  )].map((k) => k.split(":").map(Number) as [number, number]);
  const pairs: SelfCheckPair[] = [];
  for (const [part, sheet] of sheets) {
    const questions = numberedItems(seg, "selfcheck", sheet, part);
    const answers = new Map(numberedItems(seg, "answerkey", sheet, part).map((a) => [a.num, a]));
    const sheetId = part > 1 ? `m${part}sc${sheet}` : `sc${sheet}`;
    for (const q of questions) {
      const a = answers.get(q.num);
      const flags: string[] = [];
      let answer: string | null = null, sim: number | null = null;
      if (!a) flags.push("no-answer-key-entry");
      else {
        const split = splitAnswer(a.text);
        answer = split.answer;
        if (split.restated) sim = jaccard(q.text, split.restated);
        if (answer.replace(/[^\p{L}\p{N}]/gu, "").length < 3) flags.push("answer-empty-or-image");
        if (sim !== null && sim < 0.4) flags.push("restated-question-differs");
        if (definitionMismatch(q.text, answer)) flags.push("suspect-definition-mismatch");
      }
      if (q.text.replace(/[^\p{L}\p{N}]/gu, "").length < 5) flags.push("question-empty-or-image");
      pairs.push({
        id: `${sourceId}-${sheetId}-q${q.num}`,
        part,
        sheet,
        num: q.num,
        question: q.text,
        questionPage: q.page,
        questionPrintedPage: q.printedPage,
        answer,
        answerPage: a?.page ?? null,
        answerPrintedPage: a?.printedPage ?? null,
        restatedSimilarity: sim,
        flags,
      });
    }
  }
  return pairs;
}
