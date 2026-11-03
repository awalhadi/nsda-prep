// Contract for authored CBT&A concept cards (content/cbta/concepts/**.json).
//
// Trust rule: every factual statement is a Claim with ≥1 citation to a page of
// a source PDF and a verbatim quote from it. `content:build` verifies each
// quote against the extracted page text. Pedagogy fields (Bangla explanation,
// example, mnemonic) carry no new facts and are checked by a human reviewer.
//
// Imported by the build scripts (Node type stripping) and the app, so it uses
// relative imports only.

import { z } from "zod";

export const SourceId = z.string().regex(/^(cblm\d{2}|paper-[a-z0-9-]+)$/);

export const Cite = z.object({
  src: SourceId,
  /** Physical PDF page (1-based). Printed page numbers are looked up at build time. */
  page: z.number().int().positive(),
  /** Copied word-for-word from the source page. */
  quote: z.string().min(8),
  passageId: z.string().optional(),
}).strict();

export const Claim = z.object({
  text: z.string().min(1),
  cites: z.array(Cite).min(1),
  /** verbatim = the official CBLM wording; paraphrase = simplified, same meaning. */
  fidelity: z.enum(["verbatim", "paraphrase"]),
}).strict();

export const Keyword = z.object({
  en: z.string().min(1),
  bn: z.string().min(1),
}).strict();

// ---------- Visual blocks (shared by concept cards and study guides) ----------

const Bn = z.string().min(2);
/** Links a guide block to items of the CBLM outline it explains (coverage check). */
const Outline = z.array(z.string()).optional();

/** A table cell: plain text for headings/labels, a Claim for any fact. */
export const Cell = z.union([z.string(), Claim]);

export const TableBlock = z.object({
  kind: z.literal("table"),
  title: z.string().optional(),
  title_bn: Bn.optional(),
  columns: z.array(z.string().min(1)).min(2).max(5),
  rows: z.array(z.array(Cell).min(2).max(5)).min(1),
  outline: Outline,
}).strict();

export const StepsBlock = z.object({
  kind: z.literal("steps"),
  title: z.string(),
  title_bn: Bn.optional(),
  items: z.array(Claim).min(2),
  /** One Bangla line under each step: meaning + a simple explanation (pedagogy). */
  labels_bn: z.array(Bn),
  /** Draw as a cycle (last step leads back to the first). */
  cycle: z.boolean().optional(),
  outline: Outline,
}).strict();

const CompareSide = z.object({ title: z.string(), title_bn: Bn.optional(), points: z.array(Claim).min(1) }).strict();
export const CompareBlock = z.object({
  kind: z.literal("compare"),
  title: z.string(),
  title_bn: Bn.optional(),
  left: CompareSide,
  right: CompareSide,
  outline: Outline,
}).strict();

export const Visual = z.discriminatedUnion("kind", [TableBlock, StepsBlock, CompareBlock]);

export const CheckItem = z.object({
  /** JSON pointer-ish path inside the concept, e.g. "practice.mcq". */
  path: z.string(),
  note: z.string().min(3),
}).strict();

export const Practice = z.object({
  short: z.object({
    prompt: z.string(),
    modelAnswer: z.string(),
    keyPoints: z.array(Claim).min(1),
    marks: z.number().int().positive().optional(),
  }).strict(),
  mcq: z.object({
    prompt: z.string(),
    options: z.array(z.string().min(1)).length(4),
    answerIndex: z.number().int().min(0).max(3),
    answerCite: Cite,
  }).strict(),
  matching: z.object({
    prompt: z.string(),
    pairs: z.array(z.object({ left: z.string(), right: z.string(), cite: Cite }).strict()).min(3).max(6),
  }).strict(),
  viva: z.object({
    prompt: z.string(),
    answer: Claim,
  }).strict(),
}).strict();

export const Concept = z.object({
  id: z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/),
  canonical_title: z.string().min(2),
  aliases: z.array(z.string()).default([]),
  cblmPrimary: z.number().int().min(1).max(12),
  source_type: z.enum(["cblm", "question-paper-only"]),
  /** Highlight passages (evidence ids) this concept covers. */
  covers: z.array(z.string()),
  /** Real exam/self-check question ids this concept answers; shown verbatim in practice. */
  questions: z.array(z.string()),

  one_line_answer: Claim,
  keywords: z.array(Keyword).min(3).max(6),
  bangla_explanation: z.array(z.string().min(2)).min(3).max(5),
  example: z.object({ en: z.string().min(5), bn: z.string().optional() }).strict(),
  mnemonic: z.object({ text: z.string(), explain_bn: z.string().optional() }).strict().optional(),
  list_answer: z.object({
    /** What the list is, in exam wording: "Characteristics of competency-based assessment". */
    title: z.string().min(3),
    title_bn: Bn,
    items: z.array(Claim).min(2),
    /** One Bangla line per item, same order: meaning + a simple explanation (pedagogy, no new facts). */
    items_bn: z.array(Bn),
    declaredCount: z.object({ n: z.number().int().positive(), cite: Cite }).strict().optional(),
  }).strict().optional(),
  traps: z.array(Claim).min(1),
  /** Optional diagram/table shown after the list (flow, comparison, table). */
  visual: Visual.optional(),
  practice: Practice,
  /** Open [CHECK] items; any open item blocks approval. */
  checks: z.array(CheckItem).default([]),
}).strict();

// ---------- CBLM study guide (content/cbta/guides/cblmNN.json) ----------
// Walks one CBLM in source order. Same trust rule as cards: facts are Claims.

export const QaBlock = z.object({
  kind: z.literal("qa"),
  q: z.string().min(3),
  q_bn: Bn,
  answer: Claim,
  example: z.object({ en: z.string().min(5), bn: Bn.optional() }).strict().optional(),
  tip: z.string().optional(),
  tip_bn: Bn.optional(),
  concept: z.string().optional(),
  outline: Outline,
}).strict();

export const ListBlock = z.object({
  kind: z.literal("list"),
  title: z.string(),
  title_bn: Bn,
  items: z.array(Claim).min(1),
  /** One Bangla line per item, same order. */
  items_bn: z.array(Bn),
  declaredCount: z.object({ n: z.number().int().positive(), cite: Cite }).strict().optional(),
  ordered: z.boolean().optional(),
  outline: Outline,
}).strict();

/** Explanation in prose: Bangla lines (pedagogy) and/or English facts. */
export const TextBlock = z.object({
  kind: z.literal("text"),
  title: z.string().optional(),
  claims: z.array(Claim).optional(),
  bn: z.array(Bn).optional(),
  outline: Outline,
}).strict();

/** A read-only mock-up of a CBLM form or template; labels must appear on the cited page(s). */
export const FormBlock = z.object({
  kind: z.literal("form"),
  title: z.string(),
  title_bn: Bn.optional(),
  /** Locates the form in the CBLM (quote = its printed title). */
  cite: Cite,
  /** Further pages the form continues on. */
  morePages: z.array(z.number().int().positive()).optional(),
  fields: z.array(z.string().min(1)).optional(),
  columns: z.array(z.string().min(1)).optional(),
  rows: z.array(z.array(z.string())).optional(),
  footer: z.array(z.string().min(1)).optional(),
  note_bn: Bn.optional(),
  outline: Outline,
}).strict();

export const NoteBlock = z.object({
  kind: z.literal("note"),
  tone: z.enum(["caution", "tip"]),
  /** caution notes state source facts (e.g. two CBLMs disagree), so they need claims. */
  claims: z.array(Claim).optional(),
  text: z.string().optional(),
  bn: Bn.optional(),
  outline: Outline,
}).strict();

export const GuideBlock = z.discriminatedUnion("kind", [
  QaBlock, ListBlock, TextBlock, FormBlock, NoteBlock, TableBlock, StepsBlock, CompareBlock,
]);

/**
 * One entry in a CBLM's topic list. With `concept`, the topic page is that card plus
 * these blocks (only what the card does not already say). Without it, the topic is
 * guide-only (learning outcomes, a Job sheet, a form) and needs a `title`.
 */
export const GuideTopic = z.object({
  id: z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/),
  concept: z.string().optional(),
  title: z.string().optional(),
  /** Short Bangla line under the title in the topic list. */
  title_bn: Bn,
  blocks: z.array(GuideBlock).default([]),
}).strict().refine((t) => t.concept || t.title, { message: "a topic needs a concept or a title" });

export const GuideSection = z.object({
  id: z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/),
  kind: z.enum(["overview", "info", "practical", "review"]),
  /** e.g. "Information Sheet 1", "Job 2". */
  label: z.string(),
  title: z.string(),
  title_bn: Bn,
  pages: z.tuple([z.number().int().positive(), z.number().int().positive()]),
  topics: z.array(GuideTopic).min(1),
}).strict();

export const GuideSelfCheck = z.object({
  /** Question id from evidence (cblmNN-scK-qM); question + answer key are pulled in at build time. */
  question: z.string(),
  q_bn: Bn,
  /** "Write like this": a short exam answer. */
  modelAnswer: z.string().min(3),
  keyPoints: z.array(Claim).min(1),
  tip: z.string().optional(),
  concept: z.string().optional(),
}).strict();

export const GuideMcq = z.object({
  prompt: z.string(),
  options: z.array(z.string().min(1)).length(4),
  answerIndex: z.number().int().min(0).max(3),
  answerCite: Cite,
  concept: z.string().optional(),
}).strict();

export const Guide = z.object({
  cblm: z.number().int().min(1).max(12),
  title: z.string(),
  title_bn: Bn,
  intro_bn: z.array(Bn).min(1).max(4),
  sections: z.array(GuideSection).min(1),
  selfChecks: z.array(GuideSelfCheck),
  practice: z.object({
    mcq: z.array(GuideMcq).min(5),
    matching: z.object({
      prompt: z.string(),
      pairs: z.array(z.object({ left: z.string(), right: z.string(), cite: Cite }).strict()).min(4).max(10),
    }).strict(),
    viva: z.array(z.object({ q: z.string(), q_bn: Bn.optional(), answer: Claim }).strict()).min(5),
  }).strict(),
  /** Last-minute revision sheet. */
  revision: z.array(z.object({ topic: z.string(), answer: Claim, concept: z.string().optional() }).strict()).min(5),
}).strict();

/** Every heading, list, table, form, self check and job of a CBLM (content/cbta/authoring/outline). */
export const OutlineFile = z.object({
  cblm: z.number().int(),
  items: z.array(z.object({ id: z.string(), page: z.number().int().positive(), title: z.string() }).strict()),
}).strict();

export type CiteT = z.infer<typeof Cite>;
export type ClaimT = z.infer<typeof Claim>;
export type ConceptT = z.infer<typeof Concept>;
export type ConceptInput = z.input<typeof Concept>;
export type VisualT = z.infer<typeof Visual>;
export type GuideT = z.infer<typeof Guide>;
export type GuideBlockT = z.infer<typeof GuideBlock>;
export type OutlineT = z.infer<typeof OutlineFile>;
