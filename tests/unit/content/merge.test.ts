import { describe, expect, it } from "vitest";
import { MARKUP_TYPES, leadIn, mergePageMarkup, spanText } from "../../../scripts/content/lib/merge.ts";
import { fixture } from "./helpers.ts";

function passagesOf(name: string) {
  const page = fixture(name).pages[0];
  const { spans, empty, ordered } = mergePageMarkup(page);
  return { page, spans, empty, ordered, texts: spans.map((s) => spanText(s, ordered)) };
}

describe("mergePageMarkup on CBLM 2 p.6 (fragmented highlights)", () => {
  const { page, spans, empty, ordered, texts } = passagesOf("cblm02-p6");

  it("accounts for every markup annotation exactly once", () => {
    const markup = page.annots.filter((a) => MARKUP_TYPES.has(a.type)).map((a) => a.xref).sort();
    const used = [...spans.flatMap((s) => s.annotXrefs), ...empty.map((a) => a.xref)].sort();
    expect(used).toEqual(markup);
  });

  it("merges list-item fragments into one passage with whole words", () => {
    const list = texts.find((t) => t.startsWith("An inclusive learning environment is one that:"));
    expect(list).toBeDefined();
    expect(list).toContain("values and respects difference");
    expect(list).toContain("supports and advises colleagues, learners and clients");
    // The raw quad covered only "su"; no passage may end or start with a cut word.
    expect(texts.some((t) => /(^|\s)su(\s|$)/.test(t))).toBe(false);
  });

  it("keeps the definition sentence intact", () => {
    expect(texts).toContain(
      "Inclusivity means recognising, accommodating and meeting the learning needs of all your learners.",
    );
  });

  it("finds a list lead-in when one precedes the passage", () => {
    const span = spans[texts.findIndex((t) => t.startsWith("• provides opportunities"))];
    expect(leadIn(span, ordered)).toMatch(/:\s*$/);
  });
});

describe("mergePageMarkup on CBLM 9 p.31 (initial-letter highlights)", () => {
  const { spans, empty, texts } = passagesOf("cblm09-p31");

  it("turns first-letter markings (P-S-C memory trick) into whole words", () => {
    expect(empty).toHaveLength(0);
    const partial = spans.filter((s) => s.partial).length;
    expect(partial).toBeGreaterThanOrEqual(3);
    expect(texts).toContain("Standards");
    expect(texts).toContain("Conditions");
    expect(texts.some((t) => t.includes("three components") && t.endsWith("Performance"))).toBe(true);
  });
});
