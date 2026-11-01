// Stage D: concepts + evidence → verified app bundles and review reports.
// Pure computation: returns every output file as text; the CLI decides to write or compare.

import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { Concept, type ConceptT, type CiteT, type ClaimT } from "../../../src/lib/cbta/schema.ts";
import { assignStars, priorityScore, type PrioritySignals, type Stars } from "../../../src/lib/cbta/priority.ts";
import { importanceReason } from "../../../src/lib/cbta/importance.ts";
import { canonicalJson, sha256 } from "./canonical-json.ts";
import { checkConcept, type CiteResult, type Issue } from "./checks.ts";
import { loadEvidence, printedPage, type EvQuestion, type Evidence } from "./evidence.ts";
import { contentHash, effectiveStatus, evidenceHash, loadLedger, type EffectiveStatus, type Ledger } from "./ledger.ts";
import { ROOT } from "./raw.ts";
import { renderCoverage, renderPatternAnalysis, renderReviewQueue } from "./build-reports.ts";

export const CONCEPTS_DIR = join(ROOT, "content/cbta/concepts");
export const GENERATED_DIR = join(ROOT, "src/data/cbta/generated");

export interface Erratum {
  id: string;
  kind: "answer-key-error" | "count-conflict" | "garbled" | "no-source";
  questionId?: string;
  source: { src: string; page: number; quote?: string };
  issue: string;
  proposed: string;
  proposedCites?: CiteT[];
  status: "open" | "confirmed" | "rejected";
  conceptIds: string[];
  reviewer?: string;
}

export interface ConceptResult {
  id: string;
  file: string;
  raw: unknown;
  concept: ConceptT | null;
  issues: Issue[];
  cites: CiteResult[];
  signals: PrioritySignals;
  score: number;
  breakdown: { highlight: number; repeat: number; exam: number };
  stars: Stars;
  importance: { en: string; bn: string };
  likelyTypes: ("mcq" | "matching" | "short")[];
  status: EffectiveStatus;
  hashes: { content: string; evidence: string };
  blockers: string[];
  appearsIn: { cblm: number; src: string; pages: { pdf: number; printed: number | null }[] }[];
  suggestedErrata: { questionId: string; flag: string }[];
}

export interface BuildResult {
  results: ConceptResult[];
  globalIssues: Issue[];
  outputs: Map<string, string>;
  coverage: { src: string; cblm: number; total: number; covered: number; uncovered: string[] }[];
  contentVersion: string;
  errorCount: number;
}

export interface BuildOptions {
  /** CBLM source ids whose highlights must be 100% covered (e.g. ["cblm12"]). */
  strict?: string[];
  /** CBLM source ids whose ★★★ concepts must all be approved before release. */
  requireApproved?: string[];
  ledger?: Ledger;
  conceptsDir?: string;
  evidence?: Evidence;
}

const readJson = <T>(p: string): T => JSON.parse(readFileSync(p, "utf8")) as T;
const optJson = <T>(p: string, fallback: T): T => (existsSync(p) ? readJson<T>(p) : fallback);

function walkJson(dir: string): string[] {
  if (!existsSync(dir)) return [];
  return readdirSync(dir).flatMap((f) => {
    const p = join(dir, f);
    return statSync(p).isDirectory() ? walkJson(p) : f.endsWith(".json") ? [p] : [];
  });
}

/** "Paper (Short 45)", "Paper (Short 48)" → "Paper (Short 45, 48)"; same for self checks. */
export function groupedLabels(qs: EvQuestion[]): string[] {
  const groups = new Map<string, string[]>();
  for (const q of qs) {
    const m = /^(.*) \((.*)\)$/.exec(questionLabel(q));
    if (!m) continue;
    const [, head, item] = m;
    const list = groups.get(head) ?? groups.set(head, []).get(head)!;
    // Drop a repeated type word: "Short 45, Short 48" → "Short 45, 48".
    const prevType = list.length ? list[list.length - 1].split(" ")[0] : null;
    const [type, ...rest] = item.split(" ");
    list.push(prevType === type && rest.length ? rest.join(" ") : item);
  }
  return [...groups].map(([head, items]) => `${head} (${items.join(", ")})`);
}

export function questionLabel(q: EvQuestion): string {
  if (q.kind === "selfcheck") {
    const mod = q.item.part > 1 ? ` (module ${q.item.part})` : "";
    return `CBLM ${q.cblm} Self Check ${q.item.sheet}${mod} (Q${q.item.num})`;
  }
  const t = q.item.type === "mcq" ? "MCQ" : q.item.type === "matching" ? "Matching" : "Short";
  return `${q.title} (${t} ${q.item.num})`;
}

function questionType(q: EvQuestion): "mcq" | "matching" | "short" {
  return q.kind === "selfcheck" ? "short" : q.item.type;
}

function enrichCite(ev: Evidence, results: CiteResult[], cite: CiteT) {
  const r = results.find((x) => x.cite === cite);
  const src = ev.sources.get(cite.src);
  return {
    ...cite,
    cblm: src?.kind === "cblm" ? src.cblm : undefined,
    sourceTitle: src?.title,
    printedPage: printedPage(ev, cite.src, cite.page),
    match: r ? (r.exact ? "exact" : r.score) : null,
  };
}

function enrichClaim(ev: Evidence, results: CiteResult[], c: ClaimT) {
  return { ...c, cites: c.cites.map((x) => enrichCite(ev, results, x)) };
}

export function realQuestion(ev: Evidence, id: string) {
  const q = ev.questions.get(id);
  if (!q) return null;
  if (q.kind === "selfcheck") {
    return {
      id, kind: "selfcheck" as const, label: questionLabel(q), type: "short" as const,
      question: q.item.question, answer: q.item.answer, flags: q.item.flags,
      src: q.src, page: q.item.questionPage, printedPage: q.item.questionPrintedPage,
    };
  }
  return {
    id, kind: "paper" as const, label: questionLabel(q), type: q.item.type, paperClass: q.paperClass,
    question: q.item.question, options: q.item.options, answerIndex: q.item.answerIndex ?? null,
    answerLetter: q.item.answerLetter ?? null, answer: q.item.answer ?? null,
    right: q.set?.right, flags: q.item.flags, src: q.src, page: q.item.page, printedPage: q.item.printedPage,
  };
}

export function runBuild(opts: BuildOptions = {}): BuildResult {
  const ev = opts.evidence ?? loadEvidence();
  const ledger = opts.ledger ?? loadLedger();
  const conceptsDir = opts.conceptsDir ?? CONCEPTS_DIR;
  const errata = optJson<Erratum[]>(join(ROOT, "content/cbta/errata.json"), []);
  const assessorFlags = optJson<Record<string, string>>(join(ROOT, "content/cbta/authoring/assessor-flags.json"), {});
  const conceptMap = optJson<{ unmapped?: Record<string, string> }>(join(ROOT, "content/cbta/authoring/concept-map.json"), {});
  const globalIssues: Issue[] = [];

  // ---------- load + validate ----------
  const loaded = walkJson(conceptsDir).sort().map((file) => {
    const raw = readJson<unknown>(file);
    const parsed = Concept.safeParse(raw);
    const rel = relative(ROOT, file);
    if (!parsed.success) {
      const issues: Issue[] = parsed.error.issues.map((i) => ({
        level: "error", code: "schema", path: i.path.join("."), message: i.message,
      }));
      const id = (raw as { id?: string })?.id ?? rel;
      return { file: rel, raw, concept: null as ConceptT | null, issues, id };
    }
    return { file: rel, raw, concept: parsed.data, issues: [] as Issue[], id: parsed.data.id };
  });
  const ids = loaded.map((l) => l.id);
  for (const id of new Set(ids)) if (ids.filter((x) => x === id).length > 1)
    globalIssues.push({ level: "error", code: "duplicate-concept-id", path: id, message: `concept id ${id} is used by more than one file` });

  // ---------- per concept ----------
  const partial = loaded.map((l) => {
    const c = l.concept;
    const issues = [...l.issues];
    let cites: CiteResult[] = [];
    if (c) {
      const r = checkConcept(c, ev);
      issues.push(...r.issues);
      cites = r.cites;
      if (l.file.split("/").slice(-2)[0] !== `cblm${String(c.cblmPrimary).padStart(2, "0")}`)
        issues.push({ level: "warn", code: "folder-mismatch", path: l.file, message: `file should live in concepts/cblm${String(c.cblmPrimary).padStart(2, "0")}/` });
    }
    const qs = (c?.questions ?? []).map((id) => ev.questions.get(id)).filter((q): q is EvQuestion => !!q);
    const covered = (c?.covers ?? []).map((id) => ev.passages.get(id)).filter((p) => !!p);
    const cblmSet = new Set<number>();
    if (c) cblmSet.add(c.cblmPrimary);
    covered.forEach((p) => cblmSet.add(ev.sources.get(p!.src)!.cblm!));
    if (c) for (const { cite } of cites) { const s = ev.sources.get(cite.src); if (s?.kind === "cblm") cblmSet.add(s.cblm!); }
    const papers = new Map<string, string>();
    qs.forEach((q) => { if (q.kind === "paper") papers.set(q.src, q.paperClass); });
    const signals: PrioritySignals = {
      highlighted: covered.length > 0,
      highlightPlaces: new Set(covered.map((p) => `${p!.src}:${p!.page}`)).size,
      cblmCount: cblmSet.size,
      officialPapers: [...papers.values()].filter((k) => k === "official").length,
      otherPapers: [...papers.values()].filter((k) => k !== "official").length,
      selfChecks: qs.filter((q) => q.kind === "selfcheck").length,
      assessorRaise: !!(c && assessorFlags[c.id]),
    };
    const pr = priorityScore(signals);

    // appears_in: CBLM pages from covered highlights and CBLM citations.
    const pagesBySrc = new Map<string, Set<number>>();
    covered.forEach((p) => (pagesBySrc.get(p!.src) ?? pagesBySrc.set(p!.src, new Set()).get(p!.src)!).add(p!.page));
    for (const { cite } of cites) if (ev.sources.get(cite.src)?.kind === "cblm")
      (pagesBySrc.get(cite.src) ?? pagesBySrc.set(cite.src, new Set()).get(cite.src)!).add(cite.page);
    const appearsIn = [...pagesBySrc].map(([src, set]) => ({
      cblm: ev.sources.get(src)!.cblm!, src,
      pages: [...set].sort((a, b) => a - b).map((pdf) => ({ pdf, printed: printedPage(ev, src, pdf) })),
    })).sort((a, b) => a.cblm - b.cblm);

    // Self-check answers flagged as likely wrong need a confirmed/rejected erratum before approval.
    const suggestedErrata = qs.flatMap((q) => q.kind === "selfcheck"
      ? q.item.flags.filter((f) => f === "suspect-definition-mismatch").map((flag) => ({ questionId: q.item.id, flag }))
      : [])
      .filter((s) => !errata.some((e) => e.questionId === s.questionId && e.status !== "open"));

    const hashes = c ? { content: contentHash(l.raw), evidence: evidenceHash(c, ev) } : { content: "", evidence: "" };
    return { ...l, issues, cites, qs, signals, pr, appearsIn, suggestedErrata, hashes };
  });

  const stars = assignStars(partial.filter((p) => p.concept).map((p) => ({ id: p.id, score: p.pr.score, signals: p.signals })));

  const results: ConceptResult[] = partial.map((p) => {
    const st = stars.get(p.id) ?? 1;
    const types = [...new Set(p.qs.map(questionType))].sort() as ("mcq" | "matching" | "short")[];
    const importance = importanceReason({
      papers: groupedLabels(p.qs.filter((q) => q.kind === "paper")),
      selfChecks: groupedLabels(p.qs.filter((q) => q.kind === "selfcheck")),
      highlightedIn: [...new Set((p.concept?.covers ?? []).map((id) => ev.sources.get(ev.passages.get(id)?.src ?? "")?.cblm)
        .filter((n): n is number => typeof n === "number"))].sort((a, b) => a - b),
      types,
      stars: st,
    });
    const openErrata = errata.filter((e) => e.status === "open" && p.concept && e.conceptIds.includes(p.concept.id));
    const blockers = [
      ...p.issues.filter((i) => i.level === "error").map((i) => `error: ${i.code} at ${i.path}`),
      ...p.issues.filter((i) => i.level === "check").map((i) => `[CHECK] ${i.path}: ${i.message}`),
      ...openErrata.map((e) => `open erratum ${e.id}`),
      ...p.suggestedErrata.map((s) => `suspected answer-key error in ${s.questionId} needs a decision in errata.json`),
    ];
    const status = p.concept ? effectiveStatus(ledger[p.id], p.hashes, blockers.length > 0) : "draft";
    return {
      id: p.id, file: p.file, raw: p.raw, concept: p.concept, issues: p.issues, cites: p.cites,
      signals: p.signals, score: p.pr.score, breakdown: p.pr.breakdown, stars: st, importance,
      likelyTypes: types, status, hashes: p.hashes, blockers, appearsIn: p.appearsIn, suggestedErrata: p.suggestedErrata,
    };
  });

  // ---------- coverage ----------
  const coveredIds = new Set(results.flatMap((r) => r.concept?.covers ?? []));
  const coverage = [...ev.passagesBySrc].map(([src, ps]) => ({
    src, cblm: ev.sources.get(src)!.cblm!, total: ps.length,
    covered: ps.filter((p) => coveredIds.has(p.id)).length,
    uncovered: ps.filter((p) => !coveredIds.has(p.id)).map((p) => p.id),
  })).sort((a, b) => a.cblm - b.cblm);
  for (const src of opts.strict ?? []) {
    const cov = coverage.find((c) => c.src === src);
    if (!cov) globalIssues.push({ level: "error", code: "strict-unknown-source", path: src, message: `no evidence for ${src}` });
    else if (cov.uncovered.length) globalIssues.push({
      level: "error", code: "uncovered-highlights", path: src,
      message: `${cov.uncovered.length} highlight passage(s) in ${src} are not covered by any concept`,
    });
  }
  const mappedQ = new Set(results.flatMap((r) => r.concept?.questions ?? []));
  for (const src of opts.strict ?? []) {
    for (const [id, q] of ev.questions) {
      if (q.src === src && !mappedQ.has(id) && !conceptMap.unmapped?.[id])
        globalIssues.push({ level: "error", code: "unmapped-question", path: id, message: `${questionLabel(q)} is not mapped to a concept` });
    }
  }
  for (const src of opts.requireApproved ?? []) {
    const cblm = ev.sources.get(src)?.cblm;
    for (const r of results) if (r.concept?.cblmPrimary === cblm && r.stars === 3 && r.status !== "approved")
      globalIssues.push({ level: "error", code: "release-not-approved", path: r.id, message: `★★★ concept ${r.id} is ${r.status}, not approved` });
  }

  // ---------- outputs ----------
  const contentVersion = sha256(canonicalJson({
    concepts: results.map((r) => [r.id, r.hashes.content, r.hashes.evidence, r.status]),
    evidence: readFileSync(join(ROOT, "content/cbta/evidence/summary.json"), "utf8"),
    errata,
  })).slice(0, 12);

  const outputs = new Map<string, string>();
  const gen = (name: string, v: unknown) => outputs.set(join(GENERATED_DIR, name), canonicalJson(v));
  const valid = results.filter((r) => r.concept);

  gen("index.json", {
    contentVersion,
    concepts: valid.map((r) => ({
      id: r.id, title: r.concept!.canonical_title, aliases: r.concept!.aliases, cblmPrimary: r.concept!.cblmPrimary,
      cblms: r.appearsIn.map((a) => a.cblm), stars: r.stars, score: r.score, status: r.status,
      highlighted: r.signals.highlighted, sourceType: r.concept!.source_type,
      keywords: r.concept!.keywords, oneLine: r.concept!.one_line_answer.text,
      asked: r.concept!.questions.length, types: r.likelyTypes,
    })),
  });
  gen("cblms.json", [...ev.sources.values()].filter((s) => s.kind === "cblm").sort((a, b) => a.cblm! - b.cblm!).map((s) => {
    const cov = coverage.find((c) => c.src === s.id);
    return {
      n: s.cblm, id: s.id, title: s.title, hasPdf: !!s.file,
      conceptIds: valid.filter((r) => r.appearsIn.some((a) => a.cblm === s.cblm) || r.concept!.cblmPrimary === s.cblm)
        .sort((a, b) => b.score - a.score || a.id.localeCompare(b.id)).map((r) => r.id),
      highlights: cov?.total ?? 0, covered: cov?.covered ?? 0,
    };
  }));
  for (const r of valid) {
    const c = r.concept!;
    const ec = (cite: CiteT) => enrichCite(ev, r.cites, cite);
    const ecl = (cl: ClaimT) => enrichClaim(ev, r.cites, cl);
    gen(`concepts/${r.id}.json`, {
      id: r.id, title: c.canonical_title, aliases: c.aliases, cblmPrimary: c.cblmPrimary, sourceType: c.source_type,
      status: r.status, stars: r.stars, score: r.score, breakdown: r.breakdown, importance: r.importance,
      likelyTypes: r.likelyTypes, vivaDerived: true, highlighted: r.signals.highlighted, appearsIn: r.appearsIn,
      oneLineAnswer: ecl(c.one_line_answer), keywords: c.keywords, banglaExplanation: c.bangla_explanation,
      example: c.example, mnemonic: c.mnemonic ?? null,
      listAnswer: c.list_answer ? { items: c.list_answer.items.map(ecl), declaredCount: c.list_answer.declaredCount?.n ?? null } : null,
      traps: c.traps.map(ecl),
      practice: {
        short: { ...c.practice.short, keyPoints: c.practice.short.keyPoints.map(ecl) },
        mcq: { ...c.practice.mcq, answerCite: ec(c.practice.mcq.answerCite) },
        matching: { ...c.practice.matching, pairs: c.practice.matching.pairs.map((p) => ({ ...p, cite: ec(p.cite) })) },
        viva: { ...c.practice.viva, answer: ecl(c.practice.viva.answer) },
      },
      realQuestions: c.questions.map((id) => realQuestion(ev, id)).filter(Boolean),
      errata: errata.filter((e) => e.status === "confirmed" && e.conceptIds.includes(r.id)),
      openChecks: c.checks.length,
      warnings: r.issues.filter((i) => i.level === "warn").length,
    });
  }

  outputs.set(join(ROOT, "docs/plan/COVERAGE_REPORT.md"), renderCoverage(coverage, ev, results, conceptMap.unmapped ?? {}));
  outputs.set(join(ROOT, "docs/plan/REVIEW_QUEUE.md"), renderReviewQueue(results, globalIssues, errata, ev));
  outputs.set(join(ROOT, "docs/plan/PATTERN_ANALYSIS.md"), renderPatternAnalysis(ev, results));

  const errorCount = globalIssues.filter((i) => i.level === "error").length +
    results.reduce((s, r) => s + r.issues.filter((i) => i.level === "error").length, 0);
  return { results, globalIssues, outputs, coverage, contentVersion, errorCount };
}
