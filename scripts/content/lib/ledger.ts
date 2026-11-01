// Human review ledger. Approval is stored apart from the concept file and is
// pinned to two hashes, so any later edit to the card or to its cited source
// pages silently drops it back to "changed since approval".

import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import type { ConceptT } from "../../../src/lib/cbta/schema.ts";
import { canonicalJson, sha256 } from "./canonical-json.ts";
import { collectCites } from "./checks.ts";
import { pageText, type Evidence } from "./evidence.ts";
import { normalizeForMatch } from "./normalize.ts";
import { ROOT } from "./raw.ts";

export type ReviewStatus = "reviewed" | "approved";
export type EffectiveStatus = "draft" | "reviewed" | "approved" | "changed";

export interface LedgerEntry {
  status: ReviewStatus;
  contentHash: string;
  evidenceHash: string;
  reviewer: string;
  at: string;
  notes?: string;
}

export type Ledger = Record<string, LedgerEntry>;

export const REVIEW_DIR = join(ROOT, "content/cbta/review");

export function loadLedger(dir = REVIEW_DIR): Ledger {
  const p = join(dir, "ledger.json");
  return existsSync(p) ? (JSON.parse(readFileSync(p, "utf8")) as Ledger) : {};
}

export function loadReviewers(dir = REVIEW_DIR): string[] {
  const p = join(dir, "reviewers.json");
  return existsSync(p) ? (JSON.parse(readFileSync(p, "utf8")) as { reviewers: string[] }).reviewers : [];
}

/** Hash of the authored file exactly as written (computed fields are never in it). */
export function contentHash(rawConcept: unknown): string {
  return sha256(canonicalJson(rawConcept));
}

/** Hash of the normalised text of every page the card cites. */
export function evidenceHash(c: ConceptT, ev: Evidence): string {
  const keys = [...new Set(collectCites(c).map(({ cite }) => `${cite.src}:${cite.page}`))].sort();
  const parts = keys.map((k) => {
    const [src, page] = k.split(":");
    return `${k}\n${normalizeForMatch(pageText(ev, src, Number(page)) ?? "")}`;
  });
  return sha256(parts.join("\n\n"));
}

export function effectiveStatus(
  entry: LedgerEntry | undefined,
  hashes: { content: string; evidence: string },
  blocked: boolean,
): EffectiveStatus {
  if (!entry) return "draft";
  if (entry.contentHash !== hashes.content || entry.evidenceHash !== hashes.evidence) return "changed";
  if (entry.status === "approved") return blocked ? "changed" : "approved";
  return "reviewed";
}
