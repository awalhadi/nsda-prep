// Server-side access to the generated CBT&A bundles. Pages using this are
// statically generated, so the files are only read at build time.

import { readFileSync } from "node:fs";
import { join } from "node:path";
import index from "./generated/index.json";
import cblms from "./generated/cblms.json";
import type { GenCblm, GenConcept, GenIndexEntry } from "@/lib/cbta/types";

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
