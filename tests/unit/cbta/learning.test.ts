import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { addDays, localDay, review } from "../../../src/lib/cbta/leitner";
import { BLUEPRINT, buildMock, scoreMock, type Pool } from "../../../src/lib/cbta/mock";
import { migrateCbta } from "../../../src/lib/cbta/progress";

const pool = JSON.parse(readFileSync(join(import.meta.dirname, "../../../src/data/cbta/generated/pool.json"), "utf8")) as Pool;

describe("Leitner boxes", () => {
  const today = "2026-11-02";
  it("sends a miss to the tomorrow box", () => {
    expect(review(undefined, false, today)).toEqual({ box: 1, due: "2026-11-03", last: today });
  });
  it("moves 1 → 3 days → 7 days → mastered", () => {
    const b2 = review({ box: 1, due: today, last: today }, true, today);
    expect(b2).toEqual({ box: 2, due: "2026-11-05", last: today });
    const b3 = review(b2!, true, today);
    expect(b3?.box).toBe(3);
    expect(b3?.due).toBe("2026-11-09");
    expect(review(b3!, true, today)).toBeNull();
  });
  it("does not add a concept answered right first time", () => {
    expect(review(undefined, true, today)).toBeNull();
  });
  it("uses local calendar days across month ends", () => {
    expect(addDays("2026-11-30", 1)).toBe("2026-12-01");
    expect(localDay(new Date(2026, 10, 2, 23, 59))).toBe("2026-11-02");
  });
});

describe("mock paper builder", () => {
  const paper = buildMock(pool, "all", 42);
  it("follows the real pattern: 10 MCQ, 5 matching, 10 short, 60 minutes", () => {
    expect(paper.mcq).toHaveLength(BLUEPRINT.mcq);
    expect(paper.matching.pairs).toHaveLength(BLUEPRINT.matching);
    expect(paper.short).toHaveLength(BLUEPRINT.short);
    expect(paper.minutes).toBe(60);
  });
  it("never asks the same concept twice in one section", () => {
    for (const list of [paper.mcq, paper.matching.pairs, paper.short]) {
      const ids = list.map((x) => x.conceptId);
      expect(new Set(ids).size).toBe(ids.length);
    }
  });
  it("is deterministic for a seed and different across seeds", () => {
    expect(buildMock(pool, "all", 42)).toEqual(paper);
    expect(buildMock(pool, "all", 43).mcq.map((q) => q.id)).not.toEqual(paper.mcq.map((q) => q.id));
  });
  it("can be limited to one CBLM", () => {
    const p12 = buildMock(pool, 12, 7);
    expect([...p12.mcq, ...p12.short, ...p12.matching.pairs].every((x) => x.cblm === 12)).toBe(true);
  });
  it("scores each section and lists weak concepts", () => {
    const perfect = scoreMock(paper, {
      mcq: Object.fromEntries(paper.mcq.map((q) => [q.id, q.answerIndex])),
      matching: Object.fromEntries(paper.matching.pairs.map((_, i) => [i, i])),
      short: Object.fromEntries(paper.short.map((q) => [q.id, 1])),
    });
    expect(perfect.score).toEqual({ mcq: [10, 10], matching: [5, 5], short: [10, 10] });
    expect(perfect.weak).toEqual([]);
    const blank = scoreMock(paper, { mcq: {}, matching: {}, short: {} });
    expect(blank.score.mcq[0]).toBe(0);
    expect(blank.weak.length).toBeGreaterThan(0);
  });
});

describe("progress store migration", () => {
  it("repairs malformed data instead of throwing", () => {
    const s = migrateCbta({ attempts: [{ conceptId: "x", correct: true, at: "t" }, { bad: 1 }], leitner: { a: { box: 9, due: "x" }, b: { box: 2, due: "2026-11-05", last: "x" } }, read: { a: "d", b: 3 } });
    expect(s.attempts).toHaveLength(1);
    expect(Object.keys(s.leitner)).toEqual(["b"]);
    expect(s.read).toEqual({ a: "d" });
    expect(migrateCbta(null).v).toBe(1);
  });
});
