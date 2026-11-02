// Parses exam/question papers into MCQ, matching and short questions,
// with answers where the paper provides them (answer key section, inline
// "Answer:" / "Answer guide:" / "Hints:" blocks, or highlighted options).

import type { RawDoc, RawLine, RawPage } from "./raw.ts";
import { cleanText } from "./normalize.ts";
import { orderedLines, printedPageNumber } from "./layout.ts";

export type QType = "mcq" | "matching" | "short";

export interface PaperQuestion {
  id: string;
  paper: string;
  type: QType;
  num: number;
  /** Topic/unit heading in papers that group questions by unit (e.g. Short_Questions.pdf). */
  group: string | null;
  page: number;
  printedPage: number | null;
  question: string;
  options?: string[];
  answerIndex?: number | null;
  /** Matching: the right-hand column (shared by all items of the set) and this item's answer letter. */
  matchSet?: string;
  answerLetter?: string | null;
  answer?: string | null;
  flags: string[];
}

export interface MatchingSet {
  id: string;
  paper: string;
  page: number;
  prompt: string;
  right: { letter: string; text: string }[];
}

interface Ln { text: string; page: number; printed: number | null; x0: number; y0: number; y1: number; width: number; size: number; bold: boolean; highlighted: boolean }

const PART = /^part\s+([a-e])\s*[:.\-–]?\s*(.*)$/i;
const MATCH_HDR = /^match(?:ing)?\b/i;
const SHORT_HDR = /^short\s+questions?\b/i;
const KEY_HDR = /^answer\s+key\b/i;
const NUM = /^(?:q\.?\s*)?(\d{1,2})\s*[.)]\s*(.*)$/i;
const OPT = /^([a-dA-D])\s*[).]\s*(.*)$/;
const LETTER = /^([A-F])\s*[).]\s*(.*)$/;
const ANSWER = /^(?:answer(?:\s+guide)?|ans|hints?)\s*[:.\-]\s*(.*)$/i;

function overlapsHighlight(line: RawLine, page: RawPage): boolean {
  return page.annots.some((a) => a.type === "Highlight" &&
    a.rect[1] < line.bbox[3] - 2 && a.rect[3] > line.bbox[1] + 2 &&
    a.rect[0] < line.bbox[2] && a.rect[2] > line.bbox[0]);
}

function linesOf(doc: RawDoc): Ln[] {
  const out: Ln[] = [];
  for (const page of doc.pages) {
    const printed = printedPageNumber(page);
    for (const l of orderedLines(page)) {
      const text = cleanText(l.text);
      if (!text) continue;
      if (/^page\s*\d+\s*of\s*\d+$/i.test(text) || /\|\s*short questions\s*•\s*\d+$/i.test(text)) continue;
      out.push({ text, page: page.page, printed, x0: l.bbox[0], y0: l.bbox[1], y1: l.bbox[3], width: page.width,
        size: l.size, bold: l.bold, highlighted: overlapsHighlight(l, page) });
    }
  }
  return out;
}

/** Splits "1. Question …  A) right item" when both columns share one text line. */
function splitColumns(text: string): [string, string | null] {
  const m = /^(.*?\S)\s{2,}([A-F]\s*[).]\s*.*)$/.exec(text);
  return m ? [m[1], m[2]] : [text, null];
}

export function parsePaper(doc: RawDoc): { questions: PaperQuestion[]; matchSets: MatchingSet[] } {
  const lines = linesOf(doc);
  const questions: PaperQuestion[] = [];
  const matchSets: MatchingSet[] = [];
  let mode = null as QType | null;
  let inKey = false;
  let keyPart: QType | null = null;
  let keyRow: number | null = null;
  let group: string | null = null;
  let current: PaperQuestion | null = null;
  let currentSet = null as MatchingSet | null;
  let lastRight: { letter: string; text: string } | null = null;
  let collectingAnswer = false;
  // Papers number questions strictly in sequence; numbered rows inside answers (tables, lists) are content.
  let expected = 1;
  const bodySize = mostCommonSize(lines);

  const qid = (type: QType, num: number) => {
    const g = group ? `-${slug(group)}` : "";
    return `${doc.id}${g}-q${num}`;
  };

  const newMatchSet = (ln: Ln, prompt: string): MatchingSet => {
    const set: MatchingSet = { id: `${doc.id}-match${matchSets.length + 1}`, paper: doc.id, page: ln.page, prompt, right: [] };
    matchSets.push(set);
    return set;
  };

  for (let i = 0; i < lines.length; i++) {
    const ln = lines[i];
    const text = ln.text;

    // ---------- answer key section (assessor copy at the end of a paper) ----------
    if (KEY_HDR.test(text)) { inKey = true; current = null; continue; }
    if (inKey) {
      const part = PART.exec(text);
      if (part) { keyPart = /mcq|multiple/i.test(part[2]) ? "mcq" : /match/i.test(part[2]) ? "matching" : "short"; current = null; keyRow = null; continue; }
      if (keyPart === "mcq" || keyPart === "matching") {
        // Table rows: the row number and the answer may be separate cells.
        const row = /^(\d{1,2})(?:\s+(.*))?$/.exec(text);
        if (row) { keyRow = Number(row[1]); }
        const cell = row ? row[2] ?? "" : text;
        if (keyRow !== null && keyPart === "mcq") {
          const m = /^([A-D])\s*\)/.exec(cell);
          const q = questions.find((x) => x.type === "mcq" && x.num === keyRow);
          if (m && q) q.answerIndex = "ABCD".indexOf(m[1]);
        } else if (keyRow !== null) {
          const inAnswerCol = ln.x0 > ln.width * 0.42 && ln.x0 < ln.width * 0.6;
          const letter = /^([A-F])$/.exec(cell.trim()) ?? (/\s([A-F])$/.exec(cell.trim()));
          const q = questions.filter((x) => x.type === "matching")[keyRow - 1];
          if (q && letter && (inAnswerCol || row)) q.answerLetter = letter[1];
        }
      } else if (keyPart === "short") {
        const n = NUM.exec(text);
        const a = ANSWER.exec(text);
        if (n) current = questions.find((x) => x.type === "short" && x.num === Number(n[1])) ?? null;
        else if (a && current) current.answer = a[1];
        else if (current && current.answer != null) current.answer += "\n" + text;
      }
      continue;
    }

    // ---------- section headers ----------
    const part = PART.exec(text);
    if (part) {
      const label = part[2];
      if (/match/i.test(label)) { currentSet = newMatchSet(ln, lines[i + 1]?.text ?? ""); mode = "matching"; }
      else mode = /multiple|mcq/i.test(label) ? "mcq" : /short/i.test(label) ? "short" : mode;
      current = null;
      expected = 1;
      continue;
    }
    if (MATCH_HDR.test(text)) {
      if (currentSet && mode === "matching" && currentSet.right.length === 0) currentSet.prompt = text;
      else { currentSet = newMatchSet(ln, text); mode = "matching"; current = null; }
      continue;
    }
    if (SHORT_HDR.test(text) && text.length < 60) { mode = "short"; current = null; continue; }
    // Unit/topic group headings (larger or bold standalone lines without numbering)
    if (!NUM.test(text) && !OPT.test(text) && ln.size >= bodySize + 1.5 && text.length < 90 &&
        !/^(name|date|time|units?)\b/i.test(text) && NUM.test(lines[i + 1]?.text ?? "")) {
      group = text;
      current = null;
      continue;
    }

    // ---------- matching rows ----------
    if (mode === "matching" && currentSet) {
      if (/^column\s+[ab]\b/i.test(text) || /^(no\.?|ans(wer)?)$/i.test(text)) continue;
      // Table layout: the row number is its own cell, the statement follows on the same row.
      if (/^\d{1,2}$/.test(text) && ln.x0 < ln.width * 0.2) {
        const num = Number(text);
        expected = num + 1;
        current = {
          id: qid("matching", num), paper: doc.id, type: "matching", num, group, page: ln.page, printedPage: ln.printed,
          question: "", matchSet: currentSet.id, answerLetter: null, flags: [],
        };
        questions.push(current);
        continue;
      }
      const [left, rightInline] = splitColumns(text);
      // A lettered line is always a right-column option, even when the PDF places it far left.
      const isRightCol = ln.x0 > ln.width * 0.42 || (LETTER.test(text) && !NUM.test(text));
      const rightText = isRightCol ? text : rightInline;
      const n = !isRightCol ? NUM.exec(left) : null;
      if (n) {
        const num = Number(n[1]);
        expected = num + 1;
        // Answer letters sometimes sit between the columns: "11. Item text   E"
        const tail = /^(.*?)\s+([A-F])$/.exec(n[2]);
        current = {
          id: qid("matching", num), paper: doc.id, type: "matching", num, group, page: ln.page, printedPage: ln.printed,
          question: tail ? tail[1] : n[2], matchSet: currentSet.id, answerLetter: tail ? tail[2] : null, flags: [],
        };
        questions.push(current);
      } else if (!isRightCol && current && current.type === "matching" && !rightText) {
        if (/^[A-F]$/.test(text)) current.answerLetter = text;
        else current.question = (current.question + " " + left).trim();
      }
      if (rightText) {
        // Answer copies print the answer letter in front of the right column: "E A) Evidence Guide".
        const withAnswer = /^([A-F])\s+([A-F])\s*[).]\s*(.*)$/.exec(rightText);
        if (withAnswer) {
          if (current && current.type === "matching") current.answerLetter = withAnswer[1];
          lastRight = { letter: withAnswer[2], text: withAnswer[3] };
          currentSet.right.push(lastRight);
          continue;
        }
        const r = LETTER.exec(rightText);
        if (r) { lastRight = { letter: r[1], text: r[2] }; currentSet.right.push(lastRight); }
        else if (/^[A-F]$/.test(rightText) && current) current.answerLetter = rightText;
        else if (lastRight) lastRight.text += " " + rightText;
      }
      // A plain numbered line after the matching block with no right column → short questions begin.
      if (n && Number(n[1]) > 0 && questions.filter((q) => q.matchSet === currentSet!.id).length > 5) {
        const q = questions.pop()!;
        mode = "short"; currentSet = null;
        q.type = "short"; delete q.matchSet; delete q.answerLetter;
        current = q; questions.push(q);
      }
      continue;
    }

    // ---------- inline answers ----------
    const ans = ANSWER.exec(text);
    if (ans && current) { current.answer = ans[1]; collectingAnswer = true; continue; }

    // ---------- numbered question ----------
    const n = NUM.exec(text);
    const nextIsOption = OPT.test(lines[i + 1]?.text ?? "") || OPT.test(lines[i + 2]?.text ?? "");
    if (n && Number(n[1]) === expected) {
      const num = Number(n[1]);
      expected = num + 1;
      const type: QType = mode === "mcq" || (mode === null && nextIsOption) || nextIsOption ? "mcq" : "short";
      current = {
        id: qid(type, num), paper: doc.id, type, num, group, page: ln.page, printedPage: ln.printed,
        question: n[2], flags: [],
        ...(type === "mcq" ? { options: [], answerIndex: null } : {}),
      };
      questions.push(current);
      collectingAnswer = false;
      continue;
    }

    // ---------- options / continuation ----------
    const opt = OPT.exec(text);
    if (opt && current?.type === "mcq" && current.options && !collectingAnswer) {
      current.options.push(opt[2]);
      if (ln.highlighted) current.answerIndex = current.options.length - 1;
      continue;
    }
    if (!current) continue;
    if (collectingAnswer) current.answer += "\n" + text;
    else if (current.type === "mcq" && current.options && current.options.length) {
      current.options[current.options.length - 1] += " " + text;
    } else if (current.type === "short" && current.question && !/[?.]$/.test(current.question)) {
      current.question += " " + text;
    } else if (current.type === "short") {
      // Text after a complete short question without an "Answer:" label is its answer.
      current.answer = current.answer ? current.answer + "\n" + text : text;
    } else {
      current.question += " " + text;
    }
  }

  // Papers whose parts restart numbering (Part A MCQ 1–10, Part C Short 1–10) would give two
  // questions the same id. Qualify only colliding ids with their type so every question stays reachable.
  const idCount = new Map<string, number>();
  for (const q of questions) idCount.set(q.id, (idCount.get(q.id) ?? 0) + 1);
  for (const q of questions) {
    if ((idCount.get(q.id) ?? 0) > 1) q.id = q.id.replace(/-q(\d+)$/, `-${q.type === "matching" ? "match" : q.type}-q$1`);
  }

  for (const q of questions) {
    q.question = q.question.trim();
    if (q.answer) q.answer = q.answer.trim();
    if (q.answer != null && q.answer.replace(/[^\p{L}\p{N}]/gu, "").length < 3) q.answer = null;
    if (q.type === "mcq") {
      if ((q.options?.length ?? 0) !== 4) q.flags.push(`mcq-has-${q.options?.length ?? 0}-options`);
      if (q.answerIndex == null) q.flags.push("no-answer-in-paper");
    }
    if (q.type === "matching" && !q.answerLetter) q.flags.push("no-answer-in-paper");
    if (q.type === "short" && !q.answer) q.flags.push("no-answer-in-paper");
  }
  return { questions, matchSets };
}

function mostCommonSize(lines: Ln[]): number {
  const w = new Map<number, number>();
  for (const l of lines) w.set(Math.round(l.size), (w.get(Math.round(l.size)) ?? 0) + l.text.length);
  return [...w].sort((a, b) => b[1] - a[1])[0]?.[0] ?? 11;
}

function slug(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 30);
}
