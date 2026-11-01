// Contract tests over the committed evidence. They run without the PDFs.

import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = join(import.meta.dirname, "../../..");
const read = (p: string) => JSON.parse(readFileSync(join(ROOT, p), "utf8"));

const expected: Record<string, Record<string, number>> = read("content/cbta/expected-counts.json");
const summary = read("content/cbta/evidence/summary.json") as {
  cblms: { src: string; annots: Record<string, number>; markupAnnots: number }[];
};

describe("evidence coverage", () => {
  it("covers all 11 available CBLMs", () => {
    expect(summary.cblms.map((c) => c.src)).toHaveLength(11);
  });

  it.each(summary.cblms.map((c) => [c.src, c] as const))("%s annotation counts match expected-counts.json", (src, c) => {
    expect(c.annots).toEqual(expected[src]);
  });

  it("totals 1,409 CBLM highlights", () => {
    expect(summary.cblms.reduce((s, c) => s + (c.annots.Highlight ?? 0), 0)).toBe(1409);
  });

  it.each(summary.cblms.map((c) => [c.src, c] as const))("%s: every highlight/underline is inside exactly one passage or listed", (src, c) => {
    const passages: { annotXrefs: number[] }[] = read(`content/cbta/evidence/passages/${src}.json`);
    const notes: { type: string }[] = read(`content/cbta/evidence/notes/${src}.json`);
    const inPassages = passages.flatMap((p) => p.annotXrefs);
    expect(new Set(inPassages).size).toBe(inPassages.length);
    const empty = notes.filter((n) => n.type.startsWith("empty-")).length;
    expect(inPassages.length + empty).toBe(c.markupAnnots);
  });
});
