import { describe, expect, it } from "vitest";
import { parsePaper } from "../../../scripts/content/lib/papers.ts";
import { fixture } from "./helpers.ts";

const count = (qs: { type: string }[], t: string) => qs.filter((q) => q.type === t).length;

describe("official written test (Inclusivity & Maintenance)", () => {
  const { questions, matchSets } = parsePaper(fixture("paper-written-inclusivity-maintenance"));

  it("follows the 10 MCQ + 5 matching + 10 short pattern", () => {
    expect([count(questions, "mcq"), count(questions, "matching"), count(questions, "short")]).toEqual([10, 5, 10]);
  });

  it("reads MCQ answers from the assessor answer key", () => {
    const answers = questions.filter((q) => q.type === "mcq").map((q) => q.answerIndex);
    // Key: D C D C B A C A B C
    expect(answers).toEqual([3, 2, 3, 2, 1, 0, 2, 0, 1, 2]);
    expect(questions.every((q) => q.type !== "mcq" || q.options?.length === 4)).toBe(true);
  });

  it("reads the matching table and its answer letters", () => {
    expect(matchSets).toHaveLength(1);
    expect(matchSets[0].right.map((r) => r.letter)).toEqual(["A", "B", "C", "D", "E", "F"]);
    expect(questions.filter((q) => q.type === "matching").map((q) => q.answerLetter)).toEqual(["F", "E", "A", "B", "D"]);
  });

  it("attaches the model answer to each short question", () => {
    const shorts = questions.filter((q) => q.type === "short");
    expect(shorts.every((q) => !!q.answer)).toBe(true);
    expect(shorts[0].question).toBe("What is inclusivity? Why practice inclusivity?");
    expect(shorts[0].answer).toMatch(/^Inclusivity means recognizing/);
  });
});

describe("Final Formative 01", () => {
  const { questions } = parsePaper(fixture("paper-final-formative-01"));
  it("has 10 MCQ + 5 matching + 10 short numbered 1–25", () => {
    expect([count(questions, "mcq"), count(questions, "matching"), count(questions, "short")]).toEqual([10, 5, 10]);
    expect(questions.map((q) => q.num)).toEqual(Array.from({ length: 25 }, (_, i) => i + 1));
  });
  it("never invents answers the paper does not give", () => {
    expect(questions.every((q) => q.flags.includes("no-answer-in-paper"))).toBe(true);
  });
});

describe("Unit 02 short questions", () => {
  const { questions } = parsePaper(fixture("paper-unit02-short"));
  it("keeps numbered rows inside answers as answer content", () => {
    expect(questions.map((q) => q.num)).toEqual(Array.from({ length: 18 }, (_, i) => i + 1));
    expect(questions.every((q) => q.type === "short")).toBe(true);
  });
});
