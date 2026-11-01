// Loads the committed evidence (content/cbta/evidence) into lookup maps.

import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { EVIDENCE_DIR, loadSources, type SourceConfig } from "./raw.ts";
import type { SelfCheckPair } from "./selfcheck.ts";
import type { MatchingSet, PaperQuestion } from "./papers.ts";

export interface EvPage { page: number; printedPage: number | null; section: string; text: string; lowText: boolean }
export interface EvPassage {
  id: string; src: string; page: number; printedPage: number | null; text: string; context: string;
  leadIn: string | null; section: string; heading: string; flags: string[]; annotXrefs: number[]; kinds: string[];
}

export type EvQuestion =
  | { kind: "selfcheck"; src: string; cblm: number; item: SelfCheckPair }
  | { kind: "paper"; src: string; paperClass: string; title: string; item: PaperQuestion; set?: MatchingSet };

export interface Evidence {
  sources: Map<string, SourceConfig>;
  pages: Map<string, EvPage[]>;
  passages: Map<string, EvPassage>;
  passagesBySrc: Map<string, EvPassage[]>;
  questions: Map<string, EvQuestion>;
}

const readJson = <T>(p: string): T => JSON.parse(readFileSync(p, "utf8")) as T;

export function loadEvidence(dir = EVIDENCE_DIR): Evidence {
  const sources = new Map(loadSources().map((s) => [s.id, s]));
  const pages = new Map<string, EvPage[]>();
  const passages = new Map<string, EvPassage>();
  const passagesBySrc = new Map<string, EvPassage[]>();
  const questions = new Map<string, EvQuestion>();

  for (const src of sources.values()) {
    if (!src.file) continue;
    const pagesPath = join(dir, "pages", `${src.id}.json`);
    if (existsSync(pagesPath)) pages.set(src.id, readJson<EvPage[]>(pagesPath));
    if (src.kind === "cblm") {
      const ps = readJson<EvPassage[]>(join(dir, "passages", `${src.id}.json`));
      passagesBySrc.set(src.id, ps);
      for (const p of ps) passages.set(p.id, p);
      const { selfChecks } = readJson<{ selfChecks: SelfCheckPair[] }>(join(dir, "questions", `${src.id}.json`));
      for (const item of selfChecks) questions.set(item.id, { kind: "selfcheck", src: src.id, cblm: src.cblm!, item });
    } else {
      const { questions: qs, matchSets } = readJson<{ questions: PaperQuestion[]; matchSets: MatchingSet[] }>(
        join(dir, "questions", `${src.id}.json`));
      for (const item of qs) {
        questions.set(item.id, {
          kind: "paper", src: src.id, paperClass: src.paperClass!, title: src.title, item,
          set: item.matchSet ? matchSets.find((m) => m.id === item.matchSet) : undefined,
        });
      }
    }
  }
  return { sources, pages, passages, passagesBySrc, questions };
}

export function pageText(ev: Evidence, src: string, page: number): string | null {
  const p = ev.pages.get(src)?.[page - 1];
  return p ? p.text : null;
}

export function printedPage(ev: Evidence, src: string, page: number): number | null {
  return ev.pages.get(src)?.[page - 1]?.printedPage ?? null;
}
