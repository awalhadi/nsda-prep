import { describe, expect, it } from "vitest";
import collection from "../../../src/data/cbta/short-questions.json";
import index from "../../../src/data/cbta/generated/index.json";
import { questionsForConcept, SHORT_QUESTIONS } from "../../../src/lib/cbta/short-questions";

describe("supplied short-question collection", () => {
  it("retains every sequential question with an answer and page locator", () => {
    expect(SHORT_QUESTIONS.map((q) => q.id)).toEqual(Array.from({ length: 428 }, (_, i) => i + 1));
    for (const q of SHORT_QUESTIONS) {
      expect(q.question.trim().length).toBeGreaterThan(5);
      expect(q.sourceAnswer.trim().length).toBeGreaterThan(0);
      expect(q.sourcePage).toBeGreaterThanOrEqual(1);
      expect(q.sourcePage).toBeLessThanOrEqual(87);
    }
  });
  it("does not confuse numbered answer steps with the next question", () => {
    expect(SHORT_QUESTIONS[7].question).toMatch(/^As a professional trainer/);
    expect(SHORT_QUESTIONS[6].sourceAnswer).toContain("Monitor and review");
    expect(SHORT_QUESTIONS[7].question).not.toContain("Monitor and review");
  });
  it("only links to existing concepts and keeps ambiguous questions unassigned", () => {
    const ids = new Set(index.concepts.map((c) => c.id));
    for (const q of SHORT_QUESTIONS) if (q.conceptId) expect(ids.has(q.conceptId)).toBe(true);
    expect(SHORT_QUESTIONS[317].conceptId).toBeNull();
    expect(SHORT_QUESTIONS[317].reviewNote).toBeTruthy();
    expect(questionsForConcept("rules-of-evidence").map((q) => q.id)).toContain(416);
  });
  it("keeps new explanations separate from source answers and unverified provenance", () => {
    expect(collection.source.officialStatus).toBe("unverified");
    expect(collection.source.sha256).toMatch(/^[a-f0-9]{64}$/);
    for (const q of SHORT_QUESTIONS) if (q.study) {
      expect(q.study.bn).toBeTruthy();
      expect(q.study.answer).toBeTruthy();
      expect(q.study.example).toBeTruthy();
    }
    expect(SHORT_QUESTIONS[405].study?.answer).not.toContain("floppy");
    expect(SHORT_QUESTIONS[415].reviewNote).toContain("৫ বছরের");
  });
});
