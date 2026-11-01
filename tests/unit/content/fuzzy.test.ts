import { describe, expect, it } from "vitest";
import { findQuote, stem, supportScore, tokenDistance } from "../../../scripts/content/lib/fuzzy.ts";

const page = "As we go down this list of options, the controls become less reliable and require more work.\n" +
  "Personal protective equipment is always considered a control of the last resort.";

describe("findQuote", () => {
  it("matches exactly after normalisation", () => {
    expect(findQuote("personal protective equipment is ALWAYS considered", page)).toEqual({ score: 1, exact: true });
  });
  it("scores a near match below 1", () => {
    const m = findQuote("the controls become less reliable and need more work", page);
    expect(m.exact).toBe(false);
    expect(m.score).toBeGreaterThan(0.8);
    expect(m.score).toBeLessThan(0.97);
  });
  it("rejects text that is not on the page", () => {
    expect(findQuote("PPE removes the hazard completely", page).score).toBeLessThan(0.5);
  });
});

describe("tokenDistance", () => {
  it("counts token edits", () => {
    expect(tokenDistance(["a", "b", "c"], ["a", "x", "c"])).toBe(1);
    expect(tokenDistance([], ["a"])).toBe(1);
  });
});

describe("stem and supportScore", () => {
  it("joins word families", () => {
    expect(stem("elimination")).toBe(stem("eliminate"));
    expect(stem("isolation")).toBe(stem("isolating"));
    expect(stem("controls")).toBe(stem("control"));
  });
  it("measures how much of a claim its quotes support", () => {
    expect(supportScore("Controls become less reliable down the list.", [page])).toBe(1);
    expect(supportScore("PPE removes every hazard forever.", [page])).toBeLessThan(0.4);
  });
});
