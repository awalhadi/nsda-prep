// Server-side access to the generated CBT&A bundles. Pages using this are
// statically generated, so the files are only read at build time.

import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import index from "./generated/index.json";
import cblms from "./generated/cblms.json";
import type { GenCblm, GenConcept, GenGuide, GenIndexEntry, GenTopicRef } from "@/lib/cbta/types";

const GENERATED = join(process.cwd(), "src/data/cbta/generated");

export const CONCEPT_INDEX = index.concepts as GenIndexEntry[];
export const CONTENT_VERSION = index.contentVersion;
export const CBLMS = cblms as GenCblm[];

export function getCblm(n: number): GenCblm | undefined {
  return CBLMS.find((c) => c.n === n);
}

export function getConcept(id: string): GenConcept | null {
  if (!CONCEPT_INDEX.some((c) => c.id === id)) return null;
  return JSON.parse(readFileSync(join(GENERATED, "concepts", `${id}.json`), "utf8")) as GenConcept;
}

export function getIndexEntry(id: string): GenIndexEntry | undefined {
  return CONCEPT_INDEX.find((c) => c.id === id);
}

export function getGuide(n: number): GenGuide | null {
  const p = join(GENERATED, "guides", `cblm${String(n).padStart(2, "0")}.json`);
  return existsSync(p) ? (JSON.parse(readFileSync(p, "utf8")) as GenGuide) : null;
}

export function topicHref(cblm: number, t: GenTopicRef): string {
  return t.concept ? `/cbta/concept/${t.concept}` : `/cbta/cblm/${cblm}/topic/${t.id}`;
}

const introductionIds = new Set(["module-at-a-glance", "learning-outcomes", "performance-criteria"]);

export function topicKind(topic: GenTopicRef): "intro" | "help" | "lesson" {
  if (topic.concept) return "lesson";
  if (introductionIds.has(topic.id)) return "intro";
  return topic.id === "how-to-use-this-guide" ? "help" : "lesson";
}

export function lessonGroups(cblm: GenCblm) {
  return cblm.groups
    .map((group) => ({ ...group, topics: group.topics.filter((topic) => topicKind(topic) === "lesson") }))
    .filter((group) => group.topics.length > 0);
}

export function lessonCount(groups: ReturnType<typeof lessonGroups>) {
  return groups.reduce((count, group) => count + group.topics.length, 0);
}

/** Where a topic sits in its CBLM's list: neighbours for Previous / Next. */
export function topicPlace(cblm: number, match: (t: GenTopicRef) => boolean) {
  const topics = getCblm(cblm)?.groups.flatMap((g) => g.topics) ?? [];
  const current = topics.find(match);
  if (!current || topicKind(current) === "help") return null;
  const all = topics.filter((topic) => topicKind(topic) === topicKind(current));
  const i = all.findIndex(match);
  return i < 0 ? null : { index: i, total: all.length, prev: all[i - 1] ?? null, next: all[i + 1] ?? null };
}
