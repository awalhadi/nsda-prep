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
    items: z.array(Claim).min(2),
    declaredCount: z.object({ n: z.number().int().positive(), cite: Cite }).strict().optional(),
  }).strict().optional(),
  traps: z.array(Claim).min(1),
  practice: Practice,
  /** Open [CHECK] items; any open item blocks approval. */
  checks: z.array(CheckItem).default([]),
}).strict();

export type CiteT = z.infer<typeof Cite>;
export type ClaimT = z.infer<typeof Claim>;
export type ConceptT = z.infer<typeof Concept>;
export type ConceptInput = z.input<typeof Concept>;
