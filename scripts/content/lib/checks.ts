// Per-concept fidelity checks. Each issue is an error (blocks the build),
// a warning (goes to REVIEW_QUEUE) or a check (open [CHECK] item; blocks approval).

import type { ClaimT, CiteT, ConceptT } from "../../../src/lib/cbta/schema.ts";
import { pageText, type Evidence } from "./evidence.ts";
import { findQuote, supportScore } from "./fuzzy.ts";
import { normalizeForMatch } from "./normalize.ts";

export type Level = "error" | "warn" | "check";

export interface Issue {
  level: Level;
  code: string;
  path: string;
  message: string;
}

export interface CiteResult { path: string; cite: CiteT; score: number; exact: boolean }

export const QUOTE_PASS = 0.97;
export const QUOTE_WARN = 0.9;
const BENGALI = /[ঀ-৿]/;
const MAX_WORDS = 15;

/** Every Cite in a concept, with its path. */
export function collectCites(c: ConceptT): { path: string; cite: CiteT }[] {
  const out: { path: string; cite: CiteT }[] = [];
  const claim = (path: string, cl: ClaimT) => cl.cites.forEach((cite, i) => out.push({ path: `${path}.cites[${i}]`, cite }));
  claim("one_line_answer", c.one_line_answer);
  c.list_answer?.items.forEach((it, i) => claim(`list_answer.items[${i}]`, it));
  if (c.list_answer?.declaredCount) out.push({ path: "list_answer.declaredCount.cite", cite: c.list_answer.declaredCount.cite });
  c.traps.forEach((t, i) => claim(`traps[${i}]`, t));
  c.practice.short.keyPoints.forEach((k, i) => claim(`practice.short.keyPoints[${i}]`, k));
  out.push({ path: "practice.mcq.answerCite", cite: c.practice.mcq.answerCite });
  c.practice.matching.pairs.forEach((p, i) => out.push({ path: `practice.matching.pairs[${i}].cite`, cite: p.cite }));
  claim("practice.viva.answer", c.practice.viva.answer);
  return out;
}

/** Every Claim in a concept, with its path. */
export function collectClaims(c: ConceptT): { path: string; claim: ClaimT }[] {
  const out: { path: string; claim: ClaimT }[] = [{ path: "one_line_answer", claim: c.one_line_answer }];
  c.list_answer?.items.forEach((claim, i) => out.push({ path: `list_answer.items[${i}]`, claim }));
  c.traps.forEach((claim, i) => out.push({ path: `traps[${i}]`, claim }));
  c.practice.short.keyPoints.forEach((claim, i) => out.push({ path: `practice.short.keyPoints[${i}]`, claim }));
  out.push({ path: "practice.viva.answer", claim: c.practice.viva.answer });
  return out;
}

/** Text of the cited page, plus the next page for quotes that run over a page break. */
function citedText(ev: Evidence, cite: CiteT): { text: string; withNext: string } | null {
  const t = pageText(ev, cite.src, cite.page);
  if (t === null) return null;
  return { text: t, withNext: `${t}\n${pageText(ev, cite.src, cite.page + 1) ?? ""}` };
}

export function verifyCite(ev: Evidence, cite: CiteT): { score: number; exact: boolean } | null {
  const pt = citedText(ev, cite);
  if (!pt) return null;
  const m = findQuote(cite.quote, pt.text);
  if (m.exact) return m;
  const m2 = findQuote(cite.quote, pt.withNext);
  return m2.score > m.score ? m2 : m;
}

const NUMBER_WORDS: Record<string, number> = {
  two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10, eleven: 11, twelve: 12,
};
const LIST_NOUN = "principles|rules|steps|types|stages|components|dimensions|levels|features|methods|parts|elements|" +
  "categories|rights|controls|factors|objectives|functions|ways|kinds|requirements|phases|criteria|points|areas|questions";

/** "four dimensions of competency", "the 5 rules" → 4 / 5 (first match), or null. */
export function detectDeclaredCount(text: string): number | null {
  const re = new RegExp(`\\b(\\d{1,2}|${Object.keys(NUMBER_WORDS).join("|")})\\s+(?:\\w+\\s+){0,2}?(?:${LIST_NOUN})\\b`, "i");
  const m = re.exec(text);
  if (!m) return null;
  const v = m[1].toLowerCase();
  return /^\d+$/.test(v) ? Number(v) : NUMBER_WORDS[v];
}

function sentences(text: string): string[] {
  return text.split(/(?<=[.!?;])\s+|\n+/).map((s) => s.trim()).filter(Boolean);
}

function wordCount(s: string): number {
  return s.replace(/\([^)]*\)/g, "").split(/\s+/).filter((w) => /[A-Za-z0-9]/.test(w)).length;
}

export function checkConcept(c: ConceptT, ev: Evidence): { issues: Issue[]; cites: CiteResult[] } {
  const issues: Issue[] = [];
  const add = (level: Level, code: string, path: string, message: string) => issues.push({ level, code, path, message });
  const cites: CiteResult[] = [];

  // 1–2. Citations resolve and quotes exist on the cited page.
  for (const { path, cite } of collectCites(c)) {
    const src = ev.sources.get(cite.src);
    if (!src || !src.file) { add("error", "unknown-source", path, `source ${cite.src} has no PDF`); continue; }
    const m = verifyCite(ev, cite);
    if (!m) { add("error", "page-out-of-range", path, `${cite.src} has no page ${cite.page}`); continue; }
    cites.push({ path, cite, ...m });
    if (m.score < QUOTE_WARN) add("error", "quote-not-found", path, `quote not found on ${cite.src} p.${cite.page} (best match ${m.score}): "${cite.quote.slice(0, 80)}"`);
    else if (m.score < QUOTE_PASS) add("warn", "quote-close-match", path, `quote only closely matches ${cite.src} p.${cite.page} (${m.score})`);
    if (cite.passageId) {
      const p = ev.passages.get(cite.passageId);
      if (!p) add("error", "unknown-passage", path, `passage ${cite.passageId} does not exist`);
      else if (p.src !== cite.src || p.page !== cite.page) add("warn", "passage-page-mismatch", path, `passage ${cite.passageId} is on ${p.src} p.${p.page}`);
    }
  }

  // 3. Claims are supported by their quotes; verbatim claims match the source exactly.
  for (const { path, claim } of collectClaims(c)) {
    if (claim.fidelity === "verbatim") {
      const exact = claim.cites.some((cite) => {
        const pt = citedText(ev, cite);
        return pt ? findQuote(claim.text, pt.withNext).exact : false;
      });
      if (!exact) add("error", "verbatim-mismatch", path, `"verbatim" claim is not word-for-word on a cited page: "${claim.text.slice(0, 80)}"`);
    } else {
      const s = supportScore(claim.text, claim.cites.map((x) => x.quote));
      if (s < 0.4) add("error", "unsupported-claim", path, `claim words barely appear in its quotes (support ${s})`);
      else if (s < 0.7) add("warn", "weak-support", path, `claim only partly supported by its quotes (support ${s})`);
    }
  }

  // 4. List count equals the count the source declares.
  if (c.list_answer) {
    const n = c.list_answer.items.length;
    const declared = c.list_answer.declaredCount?.n ??
      detectDeclaredCount([c.one_line_answer, ...c.list_answer.items].flatMap((cl) => cl.cites.map((x) => x.quote)).join(" "));
    if (c.list_answer.declaredCount) {
      const found = detectDeclaredCount(c.list_answer.declaredCount.cite.quote);
      if (found !== null && found !== c.list_answer.declaredCount.n)
        add("error", "declared-count-mismatch", "list_answer.declaredCount", `declared ${c.list_answer.declaredCount.n} but the quote says ${found}`);
    }
    if (declared !== null && declared !== n)
      add("error", "list-count-mismatch", "list_answer.items", `source declares ${declared} items, card lists ${n}`);
    const texts = c.list_answer.items.map((it) => normalizeForMatch(it.text));
    if (new Set(texts).size !== texts.length) add("error", "duplicate-list-item", "list_answer.items", "list has duplicate items");
  }

  // 5. MCQ.
  const mcq = c.practice.mcq;
  if (new Set(mcq.options.map(normalizeForMatch)).size !== 4) add("error", "mcq-duplicate-options", "practice.mcq.options", "options must be distinct");
  const correctSupport = supportScore(mcq.options[mcq.answerIndex], [mcq.answerCite.quote]);
  if (correctSupport < 0.5) add("warn", "mcq-answer-weak-support", "practice.mcq", `correct option weakly supported by its cite (${correctSupport})`);
  mcq.options.forEach((o, i) => {
    if (i !== mcq.answerIndex && supportScore(o, [mcq.answerCite.quote]) > correctSupport)
      add("warn", "mcq-ambiguous-distractor", `practice.mcq.options[${i}]`, "a distractor is better supported by the cite than the answer");
  });

  // 6. Matching.
  const pairs = c.practice.matching.pairs;
  for (const side of ["left", "right"] as const) {
    const vals = pairs.map((p) => normalizeForMatch(p[side]));
    if (new Set(vals).size !== vals.length) add("error", "matching-duplicates", `practice.matching.${side}`, `duplicate ${side} items`);
  }
  pairs.forEach((p, i) => {
    const s = supportScore(`${p.left} ${p.right}`, [p.cite.quote]);
    if (s < 0.5) add("warn", "matching-weak-support", `practice.matching.pairs[${i}]`, `pair weakly supported by its cite (${s})`);
  });

  // 7. Readability: learner-facing English sentences stay under 15 words.
  const readable: { path: string; text: string; verbatim: boolean }[] = [
    { path: "one_line_answer", text: c.one_line_answer.text, verbatim: c.one_line_answer.fidelity === "verbatim" },
    { path: "example.en", text: c.example.en, verbatim: false },
    ...c.traps.map((t, i) => ({ path: `traps[${i}]`, text: t.text, verbatim: t.fidelity === "verbatim" })),
    ...c.practice.short.keyPoints.map((k, i) => ({ path: `practice.short.keyPoints[${i}]`, text: k.text, verbatim: k.fidelity === "verbatim" })),
    { path: "practice.viva.answer", text: c.practice.viva.answer.text, verbatim: c.practice.viva.answer.fidelity === "verbatim" },
  ];
  for (const r of readable) {
    for (const s of sentences(r.text)) {
      const n = wordCount(s);
      if (n > MAX_WORDS) add(r.verbatim ? "warn" : "error", "sentence-too-long", r.path, `${n} words (max ${MAX_WORDS}): "${s.slice(0, 70)}"`);
    }
  }

  // 8. Script: Bangla fields contain Bengali; English fields do not.
  c.keywords.forEach((k, i) => {
    if (!BENGALI.test(k.bn)) add("error", "bn-not-bengali", `keywords[${i}].bn`, "Bangla meaning has no Bengali script");
    if (BENGALI.test(k.en)) add("error", "en-has-bengali", `keywords[${i}].en`, "English term contains Bengali script");
  });
  c.bangla_explanation.forEach((l, i) => {
    if (!BENGALI.test(l)) add("error", "bn-not-bengali", `bangla_explanation[${i}]`, "line has no Bengali script");
  });
  if (c.example.bn && !BENGALI.test(c.example.bn)) add("error", "bn-not-bengali", "example.bn", "no Bengali script");
  if (c.mnemonic?.explain_bn && !BENGALI.test(c.mnemonic.explain_bn)) add("error", "bn-not-bengali", "mnemonic.explain_bn", "no Bengali script");
  for (const { path, claim } of collectClaims(c)) if (BENGALI.test(claim.text)) add("error", "en-has-bengali", path, "claim text must be English");

  // 9. Pedagogy term guard: English terms used in Bangla lines must be grounded in the card's claims.
  const corpus = normalizeForMatch([
    c.canonical_title, ...c.aliases, ...c.keywords.map((k) => k.en),
    ...collectClaims(c).map((x) => x.claim.text), c.example.en,
  ].join(" "));
  const known = new Set(corpus.split(" "));
  c.bangla_explanation.forEach((l, i) => {
    const latin = (l.match(/[A-Za-z][A-Za-z-]{2,}[A-Za-z]/g) ?? []).map((w) => w.toLowerCase());
    const unknown = latin.filter((w) => !known.has(w) && !known.has(w.replace(/s$/, "")));
    if (unknown.length) add("warn", "term-not-in-claims", `bangla_explanation[${i}]`, `English term(s) not in the card's claims: ${unknown.join(", ")}`);
  });

  // 10. References to evidence exist.
  c.covers.forEach((id, i) => { if (!ev.passages.has(id)) add("error", "unknown-passage", `covers[${i}]`, `passage ${id} does not exist`); });
  c.questions.forEach((id, i) => { if (!ev.questions.has(id)) add("error", "unknown-question", `questions[${i}]`, `question ${id} does not exist`); });

  // 11. Open [CHECK] items.
  c.checks.forEach((ch) => add("check", "open-check", ch.path, ch.note));

  return { issues, cites };
}
