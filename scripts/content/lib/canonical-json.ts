// Deterministic JSON output: sorted keys, 2-space indent, trailing newline.
// Every generated file goes through this so rebuilding leaves `git diff` clean.

import { createHash } from "node:crypto";
import { mkdirSync, readFileSync, writeFileSync, existsSync } from "node:fs";
import { dirname } from "node:path";

function sortDeep(v: unknown): unknown {
  if (Array.isArray(v)) return v.map(sortDeep);
  if (v && typeof v === "object") {
    const out: Record<string, unknown> = {};
    for (const k of Object.keys(v as object).sort()) {
      const val = (v as Record<string, unknown>)[k];
      if (val !== undefined) out[k] = sortDeep(val);
    }
    return out;
  }
  return v;
}

export function canonicalJson(v: unknown): string {
  return JSON.stringify(sortDeep(v), null, 2) + "\n";
}

export function sha256(s: string): string {
  return createHash("sha256").update(s).digest("hex");
}

export function sha1Short(s: string, len = 8): string {
  return createHash("sha1").update(s).digest("hex").slice(0, len);
}

/** Writes only when content changed; returns true if the file was (re)written. */
export function writeCanonical(path: string, v: unknown): boolean {
  const next = canonicalJson(v);
  if (existsSync(path) && readFileSync(path, "utf8") === next) return false;
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, next);
  return true;
}

export function writeText(path: string, text: string): boolean {
  if (existsSync(path) && readFileSync(path, "utf8") === text) return false;
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, text);
  return true;
}
