import { describe, expect, it } from "vitest";
import { assignStars, priorityScore, type PrioritySignals } from "../../../src/lib/cbta/priority.ts";
import { importanceReason } from "../../../src/lib/cbta/importance.ts";

const base: PrioritySignals = { highlighted: false, highlightPlaces: 0, cblmCount: 1, officialPapers: 0, otherPapers: 0, selfChecks: 0 };

describe("priorityScore", () => {
  it("implements the published formula", () => {
    const r = priorityScore({ highlighted: true, highlightPlaces: 2, cblmCount: 1, officialPapers: 1, otherPapers: 1, selfChecks: 1 });
    expect(r.breakdown).toEqual({ highlight: 3, repeat: 1, exam: 3 + 2 + 2 });
    expect(r.score).toBe(11);
  });
  it("gives no highlight weight when not highlighted", () => {
    expect(priorityScore(base).breakdown.highlight).toBe(0);
  });
});

describe("assignStars", () => {
  const item = (id: string, s: Partial<PrioritySignals>) => {
    const signals = { ...base, ...s };
    return { id, signals, score: priorityScore(signals).score };
  };
  const items = [
    item("top", { highlighted: true, highlightPlaces: 2, selfChecks: 2, otherPapers: 2 }),
    item("mid1", { selfChecks: 1 }),
    item("mid2", { selfChecks: 1 }),
    item("low", {}),
    item("lowHighlighted", { highlighted: true }),
    item("official", { officialPapers: 1 }),
    item("flagged", { assessorRaise: true }),
    item("low2", {}),
  ];
  const stars = assignStars(items);

  it("gives the top quarter ★★★", () => expect(stars.get("top")).toBe(3));
  it("gives anything asked in an official paper ★★★", () => expect(stars.get("official")).toBe(3));
  it("never lets a highlighted concept fall below ★★", () => expect(stars.get("lowHighlighted")).toBeGreaterThanOrEqual(2));
  it("lets assessor flags raise by exactly one star", () => {
    expect(stars.get("flagged")).toBe((stars.get("low") ?? 1) + 1);
  });
});

describe("importanceReason", () => {
  it("names only the real sources, in both languages", () => {
    const r = importanceReason({
      papers: ["Final Formative 01 (MCQ 3)"], selfChecks: ["CBLM 3 Self Check 1 (Q4)"],
      highlightedIn: [3], types: ["mcq", "short"], stars: 3,
    });
    expect(r.en).toBe("Asked in Final Formative 01 (MCQ 3) and CBLM 3 Self Check 1 (Q4). Highlighted in CBLM 3. Comes as MCQ and short question.");
    expect(r.bn).toContain("Final Formative 01 (MCQ 3) আর CBLM 3 Self Check 1 (Q4)");
    expect(r.bn).toContain("অবশ্যই পড়বেন।");
  });
  it("says so when there is no evidence yet", () => {
    const r = importanceReason({ papers: [], selfChecks: [], highlightedIn: [], types: [], stars: 1 });
    expect(r.en).toMatch(/Not yet seen/);
    expect(r.bn).not.toContain("অবশ্যই");
  });
});
