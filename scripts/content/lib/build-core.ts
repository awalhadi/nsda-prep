// Stage D: concepts + evidence → verified app bundles and review reports.
// Pure computation: returns every output file as text; the CLI decides to write or compare.

import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { Concept, Guide, OutlineFile, type ConceptT, type CiteT, type ClaimT, type GuideT, type OutlineT } from "../../../src/lib/cbta/schema.ts";
import { assignStars, priorityScore, type PrioritySignals, type Stars } from "../../../src/lib/cbta/priority.ts";
import { importanceReason } from "../../../src/lib/cbta/importance.ts";
import { canonicalJson, sha256 } from "./canonical-json.ts";
import { checkConcept, checkGuide, type CiteResult, type GuideCheck, type Issue } from "./checks.ts";
import { loadEvidence, printedPage, type EvQuestion, type Evidence } from "./evidence.ts";
import { contentHash, effectiveStatus, evidenceHash, loadLedger, type EffectiveStatus, type Ledger } from "./ledger.ts";
import { ROOT } from "./raw.ts";
import { renderCoverage, renderPatternAnalysis, renderReviewQueue } from "./build-reports.ts";
import { loadLinks, resolveLinks } from "./links.ts";
import { normalizeForMatch } from "./normalize.ts";

export const CONCEPTS_DIR = join(ROOT, "content/cbta/concepts");
export const GENERATED_DIR = join(ROOT, "src/data/cbta/generated");
export const GUIDES_DIR = join(ROOT, "content/cbta/guides");
export const OUTLINE_DIR = join(ROOT, "content/cbta/authoring/outline");

export interface GuideResult extends GuideCheck {
  cblm: number;
  file: string;
  guide: GuideT | null;
}

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
  guides: GuideResult[];
  globalIssues: Issue[];
  outputs: Map<string, string>;
  coverage: { src: string; cblm: number; total: number; covered: number; uncovered: string[] }[];
  contentVersion: string;
  errorCount: number;
}

export interface BuildOptions {
  /** CBLM source ids whose highlights must be 100% covered (e.g. ["cblm12"]); "all" = every CBLM. */
  strict?: string[];
  /** CBLM source ids whose ★★★ concepts must all be approved before release. */
  requireApproved?: string[];
  ledger?: Ledger;
  conceptsDir?: string;
  guidesDir?: string;
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

/** Deep copy of a guide/visual value with every cite enriched (claims and stand-alone cites). */
function enrichDeep(ev: Evidence, results: CiteResult[], v: unknown): unknown {
  if (Array.isArray(v)) return v.map((x) => enrichDeep(ev, results, x));
  if (!v || typeof v !== "object") return v;
  if ("src" in v && "page" in v && "quote" in v) return enrichCite(ev, results, v as CiteT);
  return Object.fromEntries(Object.entries(v).map(([k, x]) => [k, enrichDeep(ev, results, x)]));
}

/** Outline file for a CBLM, or null when none is written yet. */
export function loadOutline(cblm: number, dir = OUTLINE_DIR): OutlineT | null {
  const p = join(dir, `cblm${String(cblm).padStart(2, "0")}.json`);
  return existsSync(p) ? OutlineFile.parse(readJson(p)) : null;
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

  // ---------- cross-CBLM links ----------
  const links = resolveLinks(loadLinks(), ev, new Set(loaded.filter((l) => l.concept).map((l) => l.id)));
  globalIssues.push(...links.issues);

  // ---------- possible duplicate concepts (same topic written twice) ----------
  const titleKeys = loaded.filter((l) => l.concept).map((l) => ({
    id: l.id,
    keys: [l.concept!.canonical_title, ...l.concept!.aliases].map((t) => normalizeForMatch(t).replace(/\b(the|of|and|a|an|in)\b/g, "").replace(/\s+/g, " ").trim()),
  }));
  for (let i = 0; i < titleKeys.length; i++) for (let j = i + 1; j < titleKeys.length; j++) {
    const shared = titleKeys[i].keys.filter((k) => k && titleKeys[j].keys.includes(k));
    if (shared.length) globalIssues.push({
      level: "warn", code: "possible-duplicate-concept", path: `${titleKeys[i].id} + ${titleKeys[j].id}`,
      message: `both cards are titled/aliased "${shared[0]}"; merge them or link one CBLM to the other`,
    });
  }

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
    const linkedQ = c ? links.questions.get(c.id) ?? [] : [];
    const linkedP = c ? links.passages.get(c.id) ?? [] : [];
    for (const n of c ? links.notes.get(c.id) ?? [] : [])
      issues.push({ level: "warn", code: "cross-cblm-link", path: n.from, message: `${n.passages} highlight(s) and ${n.questions} question(s) from another CBLM point to this card: ${n.note}. Check that the card really answers them.` });
    const qs = [...new Set([...(c?.questions ?? []), ...linkedQ])].map((id) => ev.questions.get(id)).filter((q): q is EvQuestion => !!q);
    const covered = [...new Set([...(c?.covers ?? []), ...linkedP])].map((id) => ev.passages.get(id)).filter((p) => !!p);
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

  // ---------- study guides ----------
  const cardCblm = new Map(results.filter((r) => r.concept).map((r) => [r.id, r.concept!.cblmPrimary]));
  const guides: GuideResult[] = walkJson(opts.guidesDir ?? GUIDES_DIR).sort().map((file) => {
    const rel = relative(ROOT, file);
    const parsed = Guide.safeParse(readJson<unknown>(file));
    if (!parsed.success) return {
      cblm: Number(/cblm(\d+)/.exec(file)?.[1] ?? 0), file: rel, guide: null, cites: [], outline: null,
      issues: parsed.error.issues.map((i) => ({ level: "error" as const, code: "schema", path: i.path.join("."), message: i.message })),
    };
    const g = parsed.data;
    return { cblm: g.cblm, file: rel, guide: g, ...checkGuide(g, ev, cardCblm, loadOutline(g.cblm)) };
  });

  // ---------- coverage ----------
  const coveredIds = new Set([...results.flatMap((r) => r.concept?.covers ?? []), ...[...links.passages.values()].flat()]);
  const coverage = [...ev.passagesBySrc].map(([src, ps]) => ({
    src, cblm: ev.sources.get(src)!.cblm!, total: ps.length,
    covered: ps.filter((p) => coveredIds.has(p.id)).length,
    uncovered: ps.filter((p) => !coveredIds.has(p.id)).map((p) => p.id),
  })).sort((a, b) => a.cblm - b.cblm);
  const strict = (opts.strict ?? []).includes("all") ? coverage.map((c) => c.src) : opts.strict ?? [];
  for (const src of strict) {
    const cov = coverage.find((c) => c.src === src);
    if (!cov) globalIssues.push({ level: "error", code: "strict-unknown-source", path: src, message: `no evidence for ${src}` });
    else if (cov.uncovered.length) globalIssues.push({
      level: "error", code: "uncovered-highlights", path: src,
      message: `${cov.uncovered.length} highlight passage(s) in ${src} are not covered by any concept`,
    });
  }
  const mappedQ = new Set([...results.flatMap((r) => r.concept?.questions ?? []), ...[...links.questions.values()].flat()]);
  for (const src of strict) {
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
    guides: guides.map((g) => sha256(canonicalJson(g.guide))),
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
  // Topic list per CBLM, in CBLM order. From the study guide when there is one;
  // otherwise cards ordered by their first cited page, grouped by Information Sheet.
  const topicGroups = (cblm: number, src: string) => {
    const g = guides.find((x) => x.cblm === cblm && x.guide)?.guide;
    if (g) return g.sections.map((s) => ({
      label: s.label, title: s.title, title_bn: s.title_bn,
      topics: s.topics.map((t) => ({
        id: t.id, concept: t.concept ?? null,
        title: t.title ?? valid.find((r) => r.id === t.concept)?.concept!.canonical_title ?? t.id, title_bn: t.title_bn,
      })),
    }));
    const firstPage = (r: ConceptResult) => Math.min(...(r.appearsIn.find((a) => a.src === src)?.pages.map((p) => p.pdf) ?? [9999]));
    const cards = valid.filter((r) => r.concept!.cblmPrimary === cblm).sort((a, b) => firstPage(a) - firstPage(b) || a.id.localeCompare(b.id));
    const groups: { label: string; title: string; title_bn: string | null; topics: { id: string; concept: string; title: string; title_bn: null }[] }[] = [];
    for (const r of cards) {
      const page = ev.pages.get(src)?.find((p) => p.page === firstPage(r));
      const sec = page?.section?.match(/^(?:info|job|selfcheck|answerkey)(\d+)$/);
      const label = sec ? `Information Sheet ${sec[1]}` : "Topics";
      const title = page?.sectionTitle ?? "";
      let grp = groups.find((x) => x.label === label);
      if (!grp) groups.push(grp = { label, title, title_bn: null, topics: [] });
      grp.topics.push({ id: r.id, concept: r.id, title: r.concept!.canonical_title, title_bn: null });
    }
    return groups;
  };

  gen("cblms.json", [...ev.sources.values()].filter((s) => s.kind === "cblm").sort((a, b) => a.cblm! - b.cblm!).map((s) => {
    const cov = coverage.find((c) => c.src === s.id);
    return {
      n: s.cblm, id: s.id, title: s.title, hasPdf: !!s.file,
      conceptIds: valid.filter((r) => r.appearsIn.some((a) => a.cblm === s.cblm) || r.concept!.cblmPrimary === s.cblm)
        .sort((a, b) => b.score - a.score || a.id.localeCompare(b.id)).map((r) => r.id),
      highlights: cov?.total ?? 0, covered: cov?.covered ?? 0,
      groups: topicGroups(s.cblm!, s.id),
      guide: (() => {
        const g = guides.find((x) => x.cblm === s.cblm && x.guide);
        return g ? { sections: g.guide!.sections.length, outline: g.outline ? { total: g.outline.total, covered: g.outline.covered } : null } : null;
      })(),
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
      listAnswer: c.list_answer ? {
        title: c.list_answer.title ?? null, titleBn: c.list_answer.title_bn ?? null,
        items: c.list_answer.items.map(ecl), itemsBn: c.list_answer.items_bn ?? [],
        declaredCount: c.list_answer.declaredCount?.n ?? null,
      } : null,
      traps: c.traps.map(ecl),
      visual: c.visual ? enrichDeep(ev, r.cites, c.visual) : null,
      extra: (() => {
        // Guide blocks shown under the card, minus lists/flows that only repeat the card's own list or picture.
        const own = new Set([...(c.list_answer?.items ?? []), ...(c.visual?.kind === "steps" ? c.visual.items : [])].map((x) => normalizeForMatch(x.text)));
        const repeats = (b: { kind: string; items?: ClaimT[] }) =>
          (b.kind === "steps" || b.kind === "list") && !!b.items?.length && b.items.every((x) => own.has(normalizeForMatch(x.text)));
        for (const gr of guides) for (const sec of gr.guide?.sections ?? []) for (const t of sec.topics)
          if (t.concept === r.id) return enrichDeep(ev, gr.cites, t.blocks.filter((b) => !repeats(b)));
        return [];
      })(),
      practice: {
        short: { ...c.practice.short, keyPoints: c.practice.short.keyPoints.map(ecl) },
        mcq: { ...c.practice.mcq, answerCite: ec(c.practice.mcq.answerCite) },
        matching: { ...c.practice.matching, pairs: c.practice.matching.pairs.map((p) => ({ ...p, cite: ec(p.cite) })) },
        viva: { ...c.practice.viva, answer: ecl(c.practice.viva.answer) },
      },
      realQuestions: [...new Set([...c.questions, ...(links.questions.get(r.id) ?? [])])].map((id) => realQuestion(ev, id)).filter(Boolean),
      errata: errata.filter((e) => e.status === "confirmed" && e.conceptIds.includes(r.id)),
      openChecks: c.checks.length,
      warnings: r.issues.filter((i) => i.level === "warn").length,
    });
  }

  for (const gr of guides) {
    if (!gr.guide) continue;
    const g = gr.guide;
    const enriched = enrichDeep(ev, gr.cites, g) as Record<string, unknown>;
    gen(`guides/cblm${String(g.cblm).padStart(2, "0")}.json`, {
      ...enriched,
      selfChecks: g.selfChecks.map((sc, i) => ({
        ...(enriched.selfChecks as Record<string, unknown>[])[i],
        real: realQuestion(ev, sc.question),
      })),
      outline: gr.outline,
      warnings: gr.issues.filter((i) => i.level === "warn").length,
    });
  }

  // ---------- mock-exam pool (card practice + real questions that have answers) ----------
  const pool = { mcq: [] as unknown[], short: [] as unknown[], pairs: [] as unknown[] };
  const seenReal = new Set<string>();
  for (const r of valid) {
    const c = r.concept!;
    const meta = { conceptId: r.id, title: c.canonical_title, cblm: c.cblmPrimary, stars: r.stars };
    pool.mcq.push({ ...meta, id: `${r.id}#mcq`, prompt: c.practice.mcq.prompt, options: c.practice.mcq.options, answerIndex: c.practice.mcq.answerIndex, real: null });
    pool.short.push({ ...meta, id: `${r.id}#short`, prompt: c.practice.short.prompt, modelAnswer: c.practice.short.modelAnswer, keyPoints: c.practice.short.keyPoints.map((k) => k.text), real: null });
    c.practice.matching.pairs.forEach((p, i) => pool.pairs.push({ ...meta, id: `${r.id}#pair${i}`, left: p.left, right: p.right }));
    const realIds = [...new Set([...c.questions, ...(links.questions.get(r.id) ?? [])])];
    for (const qid of realIds) {
      const rq = realQuestion(ev, qid);
      if (!rq || seenReal.has(qid)) continue;
      if (rq.type === "mcq" && rq.options?.length === 4 && rq.answerIndex != null) {
        seenReal.add(qid);
        pool.mcq.push({ ...meta, id: qid, prompt: rq.question, options: rq.options, answerIndex: rq.answerIndex, real: rq.label });
      } else if (rq.type === "short" && rq.answer) {
        seenReal.add(qid);
        pool.short.push({ ...meta, id: qid, prompt: rq.question, modelAnswer: rq.answer, keyPoints: [], real: rq.label });
      }
    }
  }
  gen("pool.json", pool);

  outputs.set(join(ROOT, "docs/plan/COVERAGE_REPORT.md"), renderCoverage(coverage, ev, results, conceptMap.unmapped ?? {}, [...links.questions.values()].flat()));
  outputs.set(join(ROOT, "docs/plan/REVIEW_QUEUE.md"), renderReviewQueue(results, globalIssues, errata, ev));
  outputs.set(join(ROOT, "docs/plan/PATTERN_ANALYSIS.md"), renderPatternAnalysis(ev, results));

  const errorCount = globalIssues.filter((i) => i.level === "error").length +
    results.reduce((s, r) => s + r.issues.filter((i) => i.level === "error").length, 0) +
    guides.reduce((s, g) => s + g.issues.filter((i) => i.level === "error").length, 0);
  return { results, guides, globalIssues, outputs, coverage, contentVersion, errorCount };
}
