// Types for the raw PDF dump written by scripts/cblm/extract_raw.py.

import { readFileSync } from "node:fs";
import { join } from "node:path";

/** [x0, y0, x1, y1, text, block, line, wordNo] */
export type RawWord = [number, number, number, number, string, number, number, number];

export interface RawLine {
  bbox: [number, number, number, number];
  text: string;
  size: number;
  bold: boolean;
}

export interface RawAnnot {
  xref: number;
  type: string;
  rect: [number, number, number, number];
  quads: [number, number, number, number][];
  color: number[];
  content: string;
}

export interface RawPage {
  page: number;
  label: string;
  width: number;
  height: number;
  words: RawWord[];
  lines: RawLine[];
  images: number;
  annots: RawAnnot[];
}

export interface RawDoc {
  id: string;
  file: string;
  sha256: string;
  pages: RawPage[];
}

export interface SourceConfig {
  id: string;
  kind: "cblm" | "paper";
  cblm?: number;
  paperClass?: "official" | "formative" | "unit";
  title: string;
  file: string | null;
}

export const ROOT = join(import.meta.dirname, "..", "..", "..");
export const RAW_DIR = join(ROOT, "content/cbta/.cache/raw");
export const EVIDENCE_DIR = join(ROOT, "content/cbta/evidence");

export function loadSources(): SourceConfig[] {
  const cfg = JSON.parse(readFileSync(join(ROOT, "content/cbta/sources.config.json"), "utf8"));
  return cfg.sources as SourceConfig[];
}

export function loadRaw(id: string): RawDoc {
  return JSON.parse(readFileSync(join(RAW_DIR, `${id}.json`), "utf8")) as RawDoc;
}
