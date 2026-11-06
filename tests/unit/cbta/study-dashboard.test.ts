import { describe, expect, it } from "vitest";
import { emptyCbta } from "../../../src/lib/cbta/progress";
import { studySummary } from "../../../src/lib/cbta/study-dashboard";
import { localDay } from "../../../src/lib/cbta/leitner";

const now = new Date(2026, 10, 6, 14);
const concepts = [{ id: "a", score: 2, cblms: [1] }, { id: "b", score: 8, cblms: [2] }, { id: "c", score: 1, cblms: [1] }];
const at = now.toISOString();
describe("personal study dashboard", () => {
  it("starts honestly at zero, without a fabricated pass probability", () => {
    const s = studySummary(emptyCbta(), concepts, now);
    expect(s.practiced).toBe(0);
    expect(s.accuracy).toBeNull();
    expect(s.next).toBe("b");
    expect(s.days).toHaveLength(7);
    expect(s.days.every((d) => d.count === 0)).toBe(true);
  });
  it("keeps opened, practiced, mastered and revision-only activity separate", () => {
    const state = emptyCbta();
    state.read = { a: at, stale: at };
    state.mastered = { c: at };
    state.attempts = [{ conceptId: "a", kind: "revise", correct: false, at }, { conceptId: "b", kind: "mcq", correct: true, at }, { conceptId: "stale", kind: "mcq", correct: false, at }];
    const s = studySummary(state, concepts, now);
    expect(s.read).toBe(1);
    expect(s.mastered).toBe(1);
    expect(s.practiced).toBe(1);
    expect(s.accuracy).toBe(100);
    expect(s.todayCount).toBe(1);
  });
  it("prioritises overdue revision over high-scoring unread concepts", () => {
    const state = emptyCbta();
    state.leitner.a = { box: 1, due: "2026-11-05", last: "2026-11-04" };
    state.leitner.b = { box: 1, due: "2026-11-07", last: "2026-11-06" };
    const s = studySummary(state, concepts, now);
    expect(s.due).toEqual(["a"]);
    expect(s.next).toBe("a");
  });
  it("uses the latest result rather than recommending an already corrected mistake", () => {
    const state = emptyCbta(); state.read.a = at;
    state.attempts = [{ conceptId: "a", kind: "mcq", correct: false, at }, { conceptId: "a", kind: "mcq", correct: true, at }];
    expect(studySummary(state, concepts, now).next).toBe("b");
    expect(studySummary(state, concepts, now).accuracy).toBe(50);
  });
  it("counts local calendar days across month boundaries and ignores invalid dates", () => {
    const state = emptyCbta();
    state.attempts = [{ conceptId: "a", kind: "mcq", correct: true, at: new Date(2026, 9, 31, 23, 59).toISOString() }, { conceptId: "b", kind: "mcq", correct: false, at: "invalid" }];
    const s = studySummary(state, concepts, now);
    expect(s.days[0]).toEqual({ date: "2026-10-31", count: 1 });
    expect(s.days[6].date).toBe(localDay(now));
    expect(s.accuracy).toBe(100);
  });
});
