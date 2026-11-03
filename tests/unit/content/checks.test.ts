import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { Concept, type ConceptT } from "../../../src/lib/cbta/schema.ts";
import { checkConcept, detectDeclaredCount } from "../../../scripts/content/lib/checks.ts";
import { loadEvidence } from "../../../scripts/content/lib/evidence.ts";

const ROOT = join(import.meta.dirname, "../../..");
const GOLD = JSON.parse(readFileSync(join(ROOT, "content/cbta/concepts/cblm03/hierarchy-of-controls.json"), "utf8"));
const ev = loadEvidence();

function gold(): ConceptT {
  return Concept.parse(structuredClone(GOLD));
}

function codes(c: ConceptT, level = "error") {
  return checkConcept(c, ev).issues.filter((i) => i.level === level).map((i) => i.code);
}

describe("gold card: hierarchy-of-controls", () => {
  it("passes every check", () => {
    const { issues, cites } = checkConcept(gold(), ev);
    expect(issues).toEqual([]);
    expect(cites.length).toBeGreaterThan(20);
    expect(cites.every((x) => x.score >= 0.97)).toBe(true);
  });
});

describe("fidelity checks catch broken cards", () => {
  it("a quote that is not on the cited page", () => {
    const c = gold();
    c.one_line_answer.cites[0].quote = "The hierarchy of controls was invented in 1950 by engineers.";
    expect(codes(c)).toContain("quote-not-found");
  });

  it("a citation to a page that does not exist", () => {
    const c = gold();
    c.traps[0].cites[0].page = 999;
    expect(codes(c)).toContain("page-out-of-range");
  });

  it("a claim its quotes do not support", () => {
    const c = gold();
    c.traps[0].text = "Gloves are better than redesigning the machine.";
    expect(codes(c)).toContain("unsupported-claim");
  });

  it("a 'verbatim' claim that is not word-for-word", () => {
    const c = gold();
    c.one_line_answer.fidelity = "verbatim";
    expect(codes(c)).toContain("verbatim-mismatch");
  });

  it("a list shorter than the count the source declares", () => {
    const c = gold();
    c.list_answer!.items.pop();
    c.list_answer!.declaredCount = { n: 6, cite: c.list_answer!.items[0].cites[0] };
    expect(codes(c)).toContain("list-count-mismatch");
  });

  it("a sentence longer than 15 words", () => {
    const c = gold();
    c.example.en = "This example sentence is deliberately written to be far too long for a learner with weak English to read.";
    expect(codes(c)).toContain("sentence-too-long");
  });

  it("a Bangla meaning written in English", () => {
    const c = gold();
    c.keywords[0].bn = "source of harm";
    expect(codes(c)).toContain("bn-not-bengali");
  });

  it("duplicate MCQ options", () => {
    const c = gold();
    c.practice.mcq.options[2] = c.practice.mcq.options[1];
    expect(codes(c)).toContain("mcq-duplicate-options");
  });

  it("references to evidence that does not exist", () => {
    const c = gold();
    c.covers.push("cblm03-p99-deadbeef");
    c.questions.push("paper-final-formative-01-q99");
    expect(codes(c)).toEqual(expect.arrayContaining(["unknown-passage", "unknown-question"]));
  });

  it("an open [CHECK] item", () => {
    const c = gold();
    c.checks.push({ path: "example", note: "Confirm the example with a trainer." });
    expect(codes(c, "check")).toEqual(["open-check"]);
  });
});

describe("detectDeclaredCount", () => {
  it.each([
    ["the four dimensions of competency", 4],
    ["There are 5 rules of evidence", 5],
    ["three important rights given to workers", 3],
    ["controls become less reliable", null],
  ])("%s → %s", (text, n) => {
    expect(detectDeclaredCount(text)).toBe(n);
  });
});

describe("lists say what they are and explain each point in Bangla", () => {
  it("a list without a name is rejected", () => {
    const c = gold();
    Reflect.deleteProperty(c.list_answer!, "title");
    expect(codes(c)).toContain("list-title-missing");
  });

  it("every item needs its own Bangla line", () => {
    const c = gold();
    c.list_answer!.items_bn = ["শুধু একটি লাইন"];
    expect(codes(c)).toContain("list-bn-count");
    Reflect.deleteProperty(c.list_answer!, "items_bn");
    expect(codes(c)).toContain("list-bn-missing");
  });
});
