// Cross-CBLM links: a highlight or question in one CBLM that is explained by a
// concept card owned by another CBLM (topics repeat across CBLMs). Links live in
// content/cbta/authoring/links/cblmNN.json, apart from the card, so linking never
// changes a card's content hash or approval; the reviewer still sees every link.

import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { ROOT } from "./raw.ts";
import type { Evidence } from "./evidence.ts";
import type { Issue } from "./checks.ts";

export interface LinkEntry {
  concept: string;
  passages?: string[];
  questions?: string[];
  note: string;
}

export interface LinkFile {
  file: string;
  links: LinkEntry[];
}

export const LINKS_DIR = join(ROOT, "content/cbta/authoring/links");

export function loadLinks(dir = LINKS_DIR): LinkFile[] {
  if (!existsSync(dir)) return [];
  return readdirSync(dir).filter((f) => f.endsWith(".json")).sort().map((f) => ({
    file: `links/${f}`,
    links: (JSON.parse(readFileSync(join(dir, f), "utf8")) as { links: LinkEntry[] }).links ?? [],
  }));
}

export interface ResolvedLinks {
  passages: Map<string, string[]>;
  questions: Map<string, string[]>;
  notes: Map<string, { from: string; note: string; passages: number; questions: number }[]>;
  issues: Issue[];
}

export function resolveLinks(files: LinkFile[], ev: Evidence, conceptIds: Set<string>): ResolvedLinks {
  const out: ResolvedLinks = { passages: new Map(), questions: new Map(), notes: new Map(), issues: [] };
  for (const f of files) {
    f.links.forEach((l, i) => {
      const path = `${f.file}#${i}`;
      if (!conceptIds.has(l.concept)) {
        out.issues.push({ level: "error", code: "link-unknown-concept", path, message: `links to missing concept ${l.concept}` });
        return;
      }
      for (const id of l.passages ?? []) if (!ev.passages.has(id))
        out.issues.push({ level: "error", code: "link-unknown-passage", path, message: `passage ${id} does not exist` });
      for (const id of l.questions ?? []) if (!ev.questions.has(id))
        out.issues.push({ level: "error", code: "link-unknown-question", path, message: `question ${id} does not exist` });
      if (!l.note || l.note.length < 5)
        out.issues.push({ level: "error", code: "link-needs-note", path, message: "every link needs a short note saying why it is the same topic" });
      const ps = (l.passages ?? []).filter((id) => ev.passages.has(id));
      const qs = (l.questions ?? []).filter((id) => ev.questions.has(id));
      out.passages.set(l.concept, [...(out.passages.get(l.concept) ?? []), ...ps]);
      out.questions.set(l.concept, [...(out.questions.get(l.concept) ?? []), ...qs]);
      out.notes.set(l.concept, [...(out.notes.get(l.concept) ?? []), { from: f.file, note: l.note, passages: ps.length, questions: qs.length }]);
    });
  }
  return out;
}
