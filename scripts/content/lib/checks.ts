// Per-concept fidelity checks. Each issue is an error (blocks the build),
// a warning (goes to REVIEW_QUEUE) or a check (open [CHECK] item; blocks approval).

import type { ClaimT, CiteT, ConceptT, GuideT, OutlineT } from "../../../src/lib/cbta/schema.ts";
import { pageText, type Evidence } from "./evidence.ts";
import { findQuote, stem, supportScore } from "./fuzzy.ts";
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
/** Everyday classroom words a Bangla line may use in English without the card defining them. */
const EVERYDAY = ("learner trainee student trainer teacher instructor assessor candidate class classroom session training " +
  "workshop laboratory lab group team task job work skill knowledge example question answer exam test point list step").split(" ");

const isClaim = (v: unknown): v is ClaimT =>
  !!v && typeof v === "object" && "text" in v && "cites" in v && "fidelity" in v;
const isCite = (v: unknown): v is CiteT =>
  !!v && typeof v === "object" && "src" in v && "page" in v && "quote" in v;

/** Every Claim and every stand-alone Cite inside any value (guides, visual blocks), with paths. */
export function walkFacts(v: unknown, path: string, out = { claims: [] as { path: string; claim: ClaimT }[], cites: [] as { path: string; cite: CiteT }[] }) {
  if (isClaim(v)) {
    out.claims.push({ path, claim: v });
    v.cites.forEach((cite, i) => out.cites.push({ path: `${path}.cites[${i}]`, cite }));
  } else if (isCite(v)) out.cites.push({ path, cite: v });
  else if (Array.isArray(v)) v.forEach((x, i) => walkFacts(x, `${path}[${i}]`, out));
  else if (v && typeof v === "object") for (const [k, x] of Object.entries(v)) walkFacts(x, path ? `${path}.${k}` : k, out);
  return out;
}

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
  if (c.visual) out.push(...walkFacts(c.visual, "visual").cites);
  return out;
}

/** Every Claim in a concept, with its path. */
export function collectClaims(c: ConceptT): { path: string; claim: ClaimT }[] {
  const out: { path: string; claim: ClaimT }[] = [{ path: "one_line_answer", claim: c.one_line_answer }];
  c.list_answer?.items.forEach((claim, i) => out.push({ path: `list_answer.items[${i}]`, claim }));
  c.traps.forEach((claim, i) => out.push({ path: `traps[${i}]`, claim }));
  c.practice.short.keyPoints.forEach((claim, i) => out.push({ path: `practice.short.keyPoints[${i}]`, claim }));
  out.push({ path: "practice.viva.answer", claim: c.practice.viva.answer });
  if (c.visual) out.push(...walkFacts(c.visual, "visual").claims);
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

type Add = (level: Level, code: string, path: string, message: string) => void;

/** Checks 1–3, shared by concept cards and study guides. Returns the verified cites. */
function checkFacts(ev: Evidence, citeList: { path: string; cite: CiteT }[], claimList: { path: string; claim: ClaimT }[], add: Add): CiteResult[] {
  const cites: CiteResult[] = [];
  for (const { path, cite } of citeList) {
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
  for (const { path, claim } of claimList) {
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
  return cites;
}

function checkSentences(items: { path: string; text: string; verbatim: boolean }[], add: Add) {
  for (const r of items) {
    for (const s of sentences(r.text)) {
      const n = wordCount(s);
      if (n > MAX_WORDS) add(r.verbatim ? "warn" : "error", "sentence-too-long", r.path, `${n} words (max ${MAX_WORDS}): "${s.slice(0, 70)}"`);
    }
  }
}

/**
 * A learner must see what a list is and what each point means:
 * a name, a Bangla name (cards and guide lists) and one Bangla line per item.
 */
function checkListBangla(l: { title?: string; title_bn?: string; items: unknown[]; items_bn?: string[] }, path: string, add: Add, needTitleBn: boolean) {
  if (!l.title?.trim()) add("error", "list-title-missing", path, "say what this list is, e.g. \"Characteristics of …\"");
  if (needTitleBn && !l.title_bn) add("error", "list-title-bn-missing", path, "add title_bn: the list name in Bangla");
  if (!l.items_bn?.length) add("error", "list-bn-missing", path, "add one Bangla line per item (items_bn / labels_bn)");
  else if (l.items_bn.length !== l.items.length) add("error", "list-bn-count", path, `${l.items_bn.length} Bangla lines for ${l.items.length} items`);
}

export function checkConcept(c: ConceptT, ev: Evidence): { issues: Issue[]; cites: CiteResult[] } {
  const issues: Issue[] = [];
  const add = (level: Level, code: string, path: string, message: string) => issues.push({ level, code, path, message });
  const cites: CiteResult[] = [];

  // 1–3. Citations resolve, quotes exist on the cited page, claims are supported.
  cites.push(...checkFacts(ev, collectCites(c), collectClaims(c), add));

  // 4. List count equals the count the source declares.
  if (c.list_answer) {
    const n = c.list_answer.items.length;
    // Only the definition's quotes can declare the list size; item quotes mention other counts
    // ("the four dimensions of competency" inside a rules-of-evidence item).
    const declared = c.list_answer.declaredCount?.n ??
      detectDeclaredCount(c.one_line_answer.cites.map((x) => x.quote).join(" "));
    if (c.list_answer.declaredCount) {
      const found = detectDeclaredCount(c.list_answer.declaredCount.cite.quote);
      if (found !== null && found !== c.list_answer.declaredCount.n)
        add("error", "declared-count-mismatch", "list_answer.declaredCount", `declared ${c.list_answer.declaredCount.n} but the quote says ${found}`);
    }
    if (declared !== null && declared !== n)
      add("error", "list-count-mismatch", "list_answer.items", `source declares ${declared} items, card lists ${n}`);
    const texts = c.list_answer.items.map((it) => normalizeForMatch(it.text));
    if (new Set(texts).size !== texts.length) add("error", "duplicate-list-item", "list_answer.items", "list has duplicate items");
    checkListBangla(c.list_answer, "list_answer", add, true);
  }
  if (c.visual?.kind === "steps") checkListBangla({ title: c.visual.title, items: c.visual.items, items_bn: c.visual.labels_bn }, "visual", add, false);

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
    ...(c.list_answer?.items ?? []).map((t, i) => ({ path: `list_answer.items[${i}]`, text: t.text, verbatim: t.fidelity === "verbatim" })),
    ...c.practice.short.keyPoints.map((k, i) => ({ path: `practice.short.keyPoints[${i}]`, text: k.text, verbatim: k.fidelity === "verbatim" })),
    { path: "practice.viva.answer", text: c.practice.viva.answer.text, verbatim: c.practice.viva.answer.fidelity === "verbatim" },
    ...(c.visual ? walkFacts(c.visual, "visual").claims : []).map(({ path, claim }) => ({ path, text: claim.text, verbatim: claim.fidelity === "verbatim" })),
  ];
  checkSentences(readable, add);

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
  [c.list_answer?.title_bn, ...(c.list_answer?.items_bn ?? [])].forEach((l, i) => {
    if (l !== undefined && !BENGALI.test(l)) add("error", "bn-not-bengali", `list_answer.items_bn[${i - 1}]`, "no Bengali script");
  });
  for (const { path, claim } of collectClaims(c)) if (BENGALI.test(claim.text)) add("error", "en-has-bengali", path, "claim text must be English");

  // 9. Pedagogy term guard: English terms used in Bangla lines must be grounded in the card's claims.
  const corpus = normalizeForMatch([
    c.canonical_title, ...c.aliases, ...c.keywords.map((k) => k.en),
    ...collectClaims(c).map((x) => x.claim.text), c.example.en,
  ].join(" "));
  // Compare word roots (learner = learners, assess = assessment) and allow everyday classroom words.
  const known = new Set([...corpus.split(" "), ...EVERYDAY].map(stem));
  const bnLines = [
    ...c.bangla_explanation.map((l, i) => ({ l, path: `bangla_explanation[${i}]` })),
    ...(c.list_answer?.items_bn ?? []).map((l, i) => ({ l, path: `list_answer.items_bn[${i}]` })),
  ];
  for (const { l, path } of bnLines) {
    const latin = (l.match(/[A-Za-z]{3,}/g) ?? []).map((w) => w.toLowerCase());
    const unknown = latin.filter((w) => !known.has(stem(w)));
    if (unknown.length) add("warn", "term-not-in-claims", path, `English term(s) not in the card's claims: ${unknown.join(", ")}`);
  }

  // 10. References to evidence exist.
  c.covers.forEach((id, i) => { if (!ev.passages.has(id)) add("error", "unknown-passage", `covers[${i}]`, `passage ${id} does not exist`); });
  c.questions.forEach((id, i) => { if (!ev.questions.has(id)) add("error", "unknown-question", `questions[${i}]`, `question ${id} does not exist`); });

  // 11. Open [CHECK] items.
  c.checks.forEach((ch) => add("check", "open-check", ch.path, ch.note));

  return { issues, cites };
}

export interface GuideCheck {
  issues: Issue[];
  cites: CiteResult[];
  outline: { total: number; covered: number; missing: string[] } | null;
}

/** Fidelity + completeness checks for a CBLM study guide. */
/** `cards` maps every concept id to its primary CBLM. */
export function checkGuide(g: GuideT, ev: Evidence, cards: Map<string, number>, outline: OutlineT | null): GuideCheck {
  const issues: Issue[] = [];
  const add: Add = (level, code, path, message) => issues.push({ level, code, path, message });
  const src = `cblm${String(g.cblm).padStart(2, "0")}`;

  // 1–3 + readability, for every fact anywhere in the guide.
  const facts = walkFacts(g, "");
  const cites = checkFacts(ev, facts.cites, facts.claims, add);
  checkSentences(facts.claims.map(({ path, claim }) => ({ path, text: claim.text, verbatim: claim.fidelity === "verbatim" })), add);
  for (const { path, claim } of facts.claims) if (BENGALI.test(claim.text)) add("error", "en-has-bengali", path, "claim text must be English");

  // Bangla fields are in Bengali script; references point at real cards.
  const walk = (v: unknown, path: string) => {
    if (Array.isArray(v)) { v.forEach((x, i) => walk(x, `${path}[${i}]`)); return; }
    if (!v || typeof v !== "object") return;
    for (const [k, x] of Object.entries(v)) {
      const p = path ? `${path}.${k}` : k;
      if ((k === "bn" || k.endsWith("_bn")) && x !== undefined) {
        for (const line of Array.isArray(x) ? x : [x]) if (typeof line === "string" && !BENGALI.test(line)) add("error", "bn-not-bengali", p, "Bangla field has no Bengali script");
      } else if (k === "concept" && typeof x === "string") {
        if (!cards.has(x)) add("error", "unknown-concept", p, `no concept card ${x}`);
      } else walk(x, p);
    }
  };
  walk(g, "");
  // Topic list: each card of this CBLM appears exactly once; ids are unique.
  const topics = g.sections.flatMap((s) => s.topics);
  const topicIds = topics.map((t) => t.id);
  for (const id of new Set(topicIds)) if (topicIds.filter((x) => x === id).length > 1) add("error", "duplicate-topic", "sections", `topic id ${id} is used twice`);
  const listed = topics.flatMap((t) => (t.concept ? [t.concept] : []));
  for (const id of new Set(listed)) if (listed.filter((x) => x === id).length > 1) add("error", "duplicate-topic-card", "sections", `card ${id} is listed as a topic twice`);
  for (const [id, n] of cards) if (n === g.cblm && !listed.includes(id)) add("error", "card-not-in-topics", "sections", `card ${id} is not in the topic list`);

  g.sections.forEach((s, si) => s.topics.forEach((t, ti) => t.blocks.forEach((b, bi) => {
    const path = `sections[${si}].topics[${ti}].blocks[${bi}]`;
    if (b.kind === "note" && b.tone === "caution" && !b.claims?.length) add("error", "caution-without-source", path, "a caution states a source fact, so it needs a claim");
    if (b.kind === "steps") checkListBangla({ title: b.title, items: b.items, items_bn: b.labels_bn }, path, add, false);
    if (b.kind === "list") checkListBangla(b, path, add, true);
    if (b.kind === "table") b.rows.forEach((r, ri) => { if (r.length !== b.columns.length) add("error", "table-row-width", `${path}.rows[${ri}]`, `row has ${r.length} cells, table has ${b.columns.length} columns`); });
    if (b.kind === "form") {
      // Form labels are copied from the CBLM, so their words must be on the form's pages.
      const pages = [b.cite.page, ...(b.morePages ?? [])].map((p) => pageText(ev, b.cite.src, p) ?? "").join("\n");
      const labels = [...(b.fields ?? []), ...(b.columns ?? []), ...(b.rows ?? []).flat(), ...(b.footer ?? [])].filter((l) => /[A-Za-z]{3}/.test(l));
      for (const l of labels) {
        const s = supportScore(l, [pages]);
        if (s < 0.6) add("warn", "form-label-not-on-page", path, `"${l.slice(0, 60)}" is not on ${b.cite.src} p.${[b.cite.page, ...(b.morePages ?? [])].join(",")} (support ${s})`);
      }
    }
  })));

  // Self checks: every one of this CBLM, each a real question.
  const seen = new Set<string>();
  g.selfChecks.forEach((sc, i) => {
    const q = ev.questions.get(sc.question);
    if (!q) add("error", "unknown-question", `selfChecks[${i}]`, `question ${sc.question} does not exist`);
    else if (q.kind !== "selfcheck" || q.src !== src) add("error", "foreign-question", `selfChecks[${i}]`, `${sc.question} is not a ${src} self check`);
    if (seen.has(sc.question)) add("error", "duplicate-self-check", `selfChecks[${i}]`, `${sc.question} appears twice`);
    seen.add(sc.question);
  });
  for (const [id, q] of ev.questions) if (q.kind === "selfcheck" && q.src === src && !seen.has(id))
    add("error", "missing-self-check", "selfChecks", `${id} is not answered in the guide`);

  // Practice.
  g.practice.mcq.forEach((m, i) => {
    if (new Set(m.options.map(normalizeForMatch)).size !== 4) add("error", "mcq-duplicate-options", `practice.mcq[${i}]`, "options must be distinct");
    const ok = supportScore(m.options[m.answerIndex], [m.answerCite.quote]);
    if (ok < 0.5) add("warn", "mcq-answer-weak-support", `practice.mcq[${i}]`, `correct option weakly supported by its cite (${ok})`);
  });
  for (const side of ["left", "right"] as const) {
    const vals = g.practice.matching.pairs.map((p) => normalizeForMatch(p[side]));
    if (new Set(vals).size !== vals.length) add("error", "matching-duplicates", `practice.matching.${side}`, `duplicate ${side} items`);
  }

  // Completeness: every outline item of the CBLM is explained by some block.
  let outlineCov: GuideCheck["outline"] = null;
  if (outline) {
    const ids = new Set(outline.items.map((o) => o.id));
    const refs = new Set<string>(g.selfChecks.map((s) => s.question));
    const collect = (v: unknown) => {
      if (Array.isArray(v)) v.forEach(collect);
      else if (v && typeof v === "object") for (const [k, x] of Object.entries(v)) {
        if (k === "outline" && Array.isArray(x)) x.forEach((id: string) => refs.add(id)); else collect(x);
      }
    };
    collect(g.sections);
    for (const r of refs) if (!ids.has(r) && !ev.questions.has(r)) add("error", "unknown-outline-item", "outline", `${r} is not in the ${src} outline`);
    const missing = outline.items.filter((o) => !refs.has(o.id)).map((o) => o.id);
    for (const id of missing) {
      const o = outline.items.find((x) => x.id === id)!;
      add("error", "outline-not-covered", "outline", `${id} (p.${o.page} ${o.title}) is not explained by any guide block`);
    }
    outlineCov = { total: outline.items.length, covered: outline.items.length - missing.length, missing };
  }

  return { issues, cites, outline: outlineCov };
}
