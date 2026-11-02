import { describe, expect, it } from "vitest";
import { segmentDoc } from "../../../scripts/content/lib/segment.ts";
import { definitionMismatch, pairSelfChecks, splitAnswer } from "../../../scripts/content/lib/selfcheck.ts";
import { fixture } from "./helpers.ts";

describe("pairSelfChecks on OSH p.16–17", () => {
  const pairs = pairSelfChecks(segmentDoc(fixture("cblm03-p16-17")), "cblm03");

  it("pairs all 7 questions of Self Check 1 with the answer key", () => {
    expect(pairs.map((p) => p.num)).toEqual([1, 2, 3, 4, 5, 6, 7]);
    expect(pairs.every((p) => p.answer !== null)).toBe(true);
    expect(pairs[0].questionPage).toBe(16);
    expect(pairs[0].answerPage).toBe(17);
  });

  it("flags the known answer-key error: 'workplace hazard' answered as 'workplace'", () => {
    expect(pairs[0].question).toBe("What is workplace hazard?");
    expect(pairs[0].answer).toMatch(/^A workplace is a place/);
    expect(pairs[0].flags).toContain("suspect-definition-mismatch");
  });

  it("reads short answers correctly", () => {
    expect(pairs[2].answer).toBe("Risk Matrix");
    expect(pairs[1].answer).toBe("True");
  });
});

describe("pairSelfChecks on CBLM 8 ('Q01 -' and 'Answer:' format)", () => {
  const pairs = pairSelfChecks(segmentDoc(fixture("cblm08-p33-36")), "cblm08");
  it("parses dash-numbered questions and answers", () => {
    expect(pairs.length).toBeGreaterThanOrEqual(4);
    expect(pairs[0].question).toBe("What is Competency Standards?");
    expect(pairs[0].answer).toMatch(/^Competency standards are industry-determined/);
  });
});

describe("splitAnswer", () => {
  it("splits on an Ans: label", () => {
    expect(splitAnswer("What is X?\nAns: It is Y.")).toEqual({ restated: "What is X?", answer: "It is Y." });
  });
  it("splits after a restated question", () => {
    expect(splitAnswer("Who reports?\nHead of the department.")).toEqual({ restated: "Who reports?", answer: "Head of the department." });
  });
});

describe("definitionMismatch", () => {
  it("catches a definition of a different term", () => {
    expect(definitionMismatch("What is workplace hazard?", "A workplace is a place where people work.")).toBe(true);
  });
  it("accepts a matching definition", () => {
    expect(definitionMismatch("What is workplace hazard?", "A hazard is anything that can cause harm.")).toBe(false);
    expect(definitionMismatch("What is maintenance?", "Maintenance is performing routine actions.")).toBe(false);
  });
  it("accepts plural answers to singular questions", () => {
    expect(definitionMismatch("What is reasonable adjustment in CBT&A?", "Reasonable adjustments are designed to ascertain that all people are treated equally")).toBe(false);
  });
  it("ignores long 'what are the …' questions", () => {
    expect(definitionMismatch("What are the benefits of providing feedback on assessment performance?", "Feedback is beneficial both to the assessor and the candidate")).toBe(false);
  });
  it("ignores non-definition questions", () => {
    expect(definitionMismatch("List 4 hazards.", "Physical, chemical …")).toBe(false);
  });
});

describe("numbered lists inside answers", () => {
  it("does not mistake a sub-list or a two-column table for the next questions", async () => {
    const { pairSelfChecks: pair } = await import("../../../scripts/content/lib/selfcheck.ts");
    const { readFileSync } = await import("node:fs");
    const { join } = await import("node:path");
    const qs = JSON.parse(readFileSync(join(import.meta.dirname, "../../../content/cbta/evidence/questions/cblm01.json"), "utf8")).selfChecks;
    const q2 = qs.find((x: { id: string }) => x.id === "cblm01-sc2-q2");
    expect(q2.answer).toMatch(/^Relationship between elements and learning outcomes/);
    expect(typeof pair).toBe("function");
  });
});
