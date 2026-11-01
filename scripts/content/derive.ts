// Stage B: raw PDF dump → committed evidence files + extraction report.
//
//   content/cbta/evidence/pages/<src>.json      page text, section, printed page
//   content/cbta/evidence/passages/<src>.json   merged highlight/underline passages
//   content/cbta/evidence/notes/<src>.json      teacher notes, strikeouts, empty markup
//   content/cbta/evidence/questions/<src>.json  self-check pairs (CBLM) or paper questions
//   content/cbta/evidence/summary.json
//   docs/plan/EXTRACTION_REPORT.md
//
// Usage: node --experimental-strip-types scripts/content/derive.ts

import { existsSync, readFileSync } from "node:fs";
import type { RawWord } from "./lib/raw.ts";
import { join } from "node:path";
import { EVIDENCE_DIR, ROOT, loadRaw, loadSources, type RawDoc, type RawPage, type SourceConfig } from "./lib/raw.ts";
import { segmentDoc, headingAtY, type Segmented } from "./lib/segment.ts";
import { MARKUP_TYPES, leadIn, mergePageMarkup, spanContext, spanText } from "./lib/merge.ts";
import { joinWords } from "./lib/normalize.ts";
import { pairSelfChecks, type SelfCheckPair } from "./lib/selfcheck.ts";
import { parsePaper, type PaperQuestion, type MatchingSet } from "./lib/papers.ts";
import { sha1Short, writeCanonical, writeText } from "./lib/canonical-json.ts";
import { renderCoverageBaseline, renderExtractionReport } from "./lib/report.ts";

export interface Passage {
  id: string;
  src: string;
  page: number;
  printedPage: number | null;
  kinds: string[];
  annotXrefs: number[];
  text: string;
  context: string;
  leadIn: string | null;
  section: string;
  heading: string;
  flags: string[];
}

export interface Note {
  id: string;
  src: string;
  page: number;
  printedPage: number | null;
  type: string;
  text: string;
  nearText: string;
}

export interface CblmSummary {
  src: string;
  cblm: number;
  pages: number;
  annots: Record<string, number>;
  markupAnnots: number;
  passages: number;
  emptyMarkup: number;
  shortPassages: number;
  notes: number;
  strikeouts: number;
  selfChecks: number;
  selfCheckFlagged: number;
  sections: string[];
  lowTextPages: number[];
  doubtPages: number[];
  parts: number;
}

export interface PaperSummary {
  src: string;
  paperClass: string;
  title: string;
  counts: Record<string, number>;
  answered: Record<string, number>;
  flagged: number;
  overridden: number;
}

function sectionLabel(s: { kind: string; num: number | null; part: number }): string {
  const base = s.num !== null ? `${s.kind}${s.num}` : s.kind;
  return s.part > 1 ? `m${s.part}-${base}` : base;
}

function wordsNear(page: RawPage, rect: number[], pad = 18): string {
  const [x0, y0, x1, y1] = rect;
  const ws = page.words
    .filter((w) => w[2] >= x0 - pad && w[0] <= x1 + pad && w[3] >= y0 - pad && w[1] <= y1 + pad)
    .sort((a, b) => a[5] - b[5] || a[6] - b[6] || a[7] - b[7]);
  return joinWords(ws.map((w) => w[4])).slice(0, 240);
}

/** One rectangle per text line covered by a passage (for proof renders). */
function lineBoxes(indices: number[], ordered: RawWord[]): number[][] {
  const byLine = new Map<string, number[]>();
  const first = indices[0], last = indices[indices.length - 1];
  for (let i = first; i <= last; i++) {
    const w = ordered[i];
    const key = `${w[5]}:${w[6]}`;
    const b = byLine.get(key);
    if (!b) byLine.set(key, [w[0], w[1], w[2], w[3]]);
    else byLine.set(key, [Math.min(b[0], w[0]), Math.min(b[1], w[1]), Math.max(b[2], w[2]), Math.max(b[3], w[3])]);
  }
  return [...byLine.values()].map((b) => b.map((v) => Math.round(v * 10) / 10));
}

function deriveCblm(src: SourceConfig, raw: RawDoc) {
  const seg: Segmented = segmentDoc(raw);
  const passages: Passage[] = [];
  const notes: Note[] = [];
  const doubt = new Set<number>();
  let emptyMarkup = 0;
  let markupAnnots = 0;
  const annots: Record<string, number> = {};
  let heading = "";
  const boxes: Record<number, { id: string; boxes: number[][] }[]> = {};

  for (const page of raw.pages) {
    const info = seg.pages[page.page - 1];
    for (const a of page.annots) annots[a.type] = (annots[a.type] ?? 0) + 1;
    markupAnnots += page.annots.filter((a) => MARKUP_TYPES.has(a.type)).length;

    const { spans, empty, ordered } = mergePageMarkup(page);
    let covered = empty.length;
    for (const span of spans) {
      covered += span.annotXrefs.length;
      const firstWord = ordered[span.indices[0]];
      const text = spanText(span, ordered);
      heading = headingAtY(info, firstWord[1], heading);
      const flags: string[] = [];
      if (span.partial) flags.push("initial-letter");
      else if (text.replace(/[^\p{L}\p{N}]/gu, "").length < 4) flags.push("very-short");
      if (info.lowText) flags.push("low-text-page");
      if (flags.length) doubt.add(page.page);
      const id = `${src.id}-p${page.page}-${sha1Short(span.annotXrefs.slice().sort((x, y) => x - y).join(","))}`;
      (boxes[page.page] ??= []).push({ id, boxes: lineBoxes(span.indices, ordered) });
      passages.push({
        id,
        src: src.id,
        page: page.page,
        printedPage: info.printedPage,
        kinds: [...new Set(span.types)].sort(),
        annotXrefs: span.annotXrefs.slice().sort((x, y) => x - y),
        text,
        context: spanContext(span, ordered),
        leadIn: leadIn(span, ordered),
        section: sectionLabel(info.section),
        heading,
        flags,
      });
    }
    // Invariant: every markup annotation is either inside a passage or reported as empty.
    const pageMarkup = page.annots.filter((a) => MARKUP_TYPES.has(a.type)).length;
    if (covered !== pageMarkup) {
      throw new Error(`${src.id} p${page.page}: ${pageMarkup} markup annots but ${covered} accounted for`);
    }
    for (const a of empty) {
      emptyMarkup++;
      doubt.add(page.page);
      notes.push({ id: `${src.id}-p${page.page}-a${a.xref}`, src: src.id, page: page.page, printedPage: info.printedPage,
        type: `empty-${a.type}`, text: "", nearText: wordsNear(page, a.rect, 4) });
    }
    for (const a of page.annots) {
      if (MARKUP_TYPES.has(a.type)) continue;
      const base = { id: `${src.id}-p${page.page}-a${a.xref}`, src: src.id, page: page.page, printedPage: info.printedPage, type: a.type };
      if (a.type === "StrikeOut") {
        const ws = page.words.filter((w) => a.quads.some((q) => (w[0] + w[2]) / 2 >= q[0] && (w[0] + w[2]) / 2 <= q[2] && (w[1] + w[3]) / 2 >= q[1] && (w[1] + w[3]) / 2 <= q[3]));
        notes.push({ ...base, text: joinWords(ws.map((w) => w[4])), nearText: wordsNear(page, a.rect) });
      } else {
        notes.push({ ...base, text: a.content, nearText: wordsNear(page, a.rect) });
      }
    }
  }

  const selfChecks: SelfCheckPair[] = pairSelfChecks(seg, src.id);
  const pages = seg.pages.map((p) => ({
    page: p.page,
    printedPage: p.printedPage,
    section: sectionLabel(p.section),
    sectionTitle: p.section.title,
    text: p.text,
    lowText: p.lowText,
    images: p.images,
  }));

  const sections: string[] = [];
  let prevSection = "";
  for (const p of pages) {
    if (p.section !== prevSection) sections.push(`${p.section}@${p.page}`);
    prevSection = p.section;
  }

  const summary: CblmSummary = {
    src: src.id,
    cblm: src.cblm!,
    pages: raw.pages.length,
    annots,
    markupAnnots,
    passages: passages.length,
    emptyMarkup,
    shortPassages: passages.filter((p) => p.flags.includes("very-short")).length,
    notes: notes.filter((n) => ["FreeText", "Ink", "Caret"].includes(n.type)).length,
    strikeouts: notes.filter((n) => n.type === "StrikeOut" || n.type === "Redact").length,
    selfChecks: selfChecks.length,
    selfCheckFlagged: selfChecks.filter((s) => s.flags.length).length,
    sections,
    lowTextPages: pages.filter((p) => p.lowText).map((p) => p.page),
    doubtPages: [...doubt].sort((a, b) => a - b),
    parts: Math.max(...seg.pages.map((p) => p.section.part)),
  };
  return { pages, passages, notes, selfChecks, summary, boxes };
}

interface Override { id: string; reason: string; set: Partial<PaperQuestion> }

function applyOverrides(srcId: string, questions: PaperQuestion[]): number {
  const path = join(EVIDENCE_DIR, "overrides", `${srcId}.json`);
  if (!existsSync(path)) return 0;
  const overrides = JSON.parse(readFileSync(path, "utf8")) as Override[];
  for (const o of overrides) {
    const q = questions.find((x) => x.id === o.id);
    if (!q) throw new Error(`override ${o.id} matches no question in ${srcId}`);
    Object.assign(q, o.set);
    q.flags = q.flags.filter((f) => !f.startsWith("mcq-has-") && f !== "no-answer-in-paper");
    q.flags.push("overridden");
  }
  return overrides.length;
}

function derivePaper(src: SourceConfig, raw: RawDoc) {
  const { questions, matchSets } = parsePaper(raw);
  const overridden = applyOverrides(src.id, questions);
  const counts: Record<string, number> = {}, answered: Record<string, number> = {};
  for (const q of questions) {
    counts[q.type] = (counts[q.type] ?? 0) + 1;
    const has = q.type === "mcq" ? q.answerIndex != null : q.type === "matching" ? !!q.answerLetter : !!q.answer;
    if (has) answered[q.type] = (answered[q.type] ?? 0) + 1;
  }
  const summary: PaperSummary = {
    src: src.id, paperClass: src.paperClass!, title: src.title, counts, answered,
    flagged: questions.filter((q) => q.flags.some((f) => f !== "overridden")).length, overridden,
  };
  return { questions, matchSets, summary };
}

function main() {
  const sources = loadSources();
  const cblms: CblmSummary[] = [];
  const papers: PaperSummary[] = [];
  const allSelfChecks: SelfCheckPair[] = [];
  const allPaperQs: { q: PaperQuestion; sets: MatchingSet[] }[] = [];
  let written = 0;
  const proofSpec: Record<string, unknown> = {};

  for (const src of sources) {
    if (!src.file) continue;
    const raw = loadRaw(src.id);
    if (src.kind === "cblm") {
      const d = deriveCblm(src, raw);
      written += +writeCanonical(join(EVIDENCE_DIR, "pages", `${src.id}.json`), d.pages);
      written += +writeCanonical(join(EVIDENCE_DIR, "passages", `${src.id}.json`), d.passages);
      written += +writeCanonical(join(EVIDENCE_DIR, "notes", `${src.id}.json`), d.notes);
      written += +writeCanonical(join(EVIDENCE_DIR, "questions", `${src.id}.json`), { selfChecks: d.selfChecks });
      cblms.push(d.summary);
      allSelfChecks.push(...d.selfChecks);
      proofSpec[src.id] = { file: src.file, doubtPages: d.summary.doubtPages, pages: d.boxes };
    } else {
      const d = derivePaper(src, raw);
      written += +writeCanonical(join(EVIDENCE_DIR, "questions", `${src.id}.json`), { questions: d.questions, matchSets: d.matchSets });
      papers.push(d.summary);
      for (const q of d.questions) allPaperQs.push({ q, sets: d.matchSets });
    }
  }

  writeCanonical(join(ROOT, "content/cbta/.cache/proof-spec.json"), proofSpec);
  const summary = { cblms, papers };
  written += +writeCanonical(join(EVIDENCE_DIR, "summary.json"), summary);
  // content:build takes over COVERAGE_REPORT.md once concepts exist; only write the baseline before that.
  if (!existsSync(join(ROOT, "content/cbta/concepts"))) {
    written += +writeText(join(ROOT, "docs/plan/COVERAGE_REPORT.md"),
      renderCoverageBaseline(cblms, allSelfChecks.length, allPaperQs.length));
  }
  written += +writeText(join(ROOT, "docs/plan/EXTRACTION_REPORT.md"),
    renderExtractionReport(cblms, papers, allSelfChecks, allPaperQs.map((x) => x.q)));

  const totalHl = cblms.reduce((s, c) => s + (c.annots.Highlight ?? 0), 0);
  const totalPassages = cblms.reduce((s, c) => s + c.passages, 0);
  console.log(`derive: ${cblms.length} CBLMs, ${totalHl} highlights → ${totalPassages} passages; ` +
    `${allSelfChecks.length} self-check pairs; ${allPaperQs.length} paper questions; ${written} file(s) updated`);
}

main();
