import { describe, expect, it } from "vitest";
import { Guide, type GuideT, type OutlineT } from "../../../src/lib/cbta/schema.ts";
import { checkGuide } from "../../../scripts/content/lib/checks.ts";
import { loadEvidence } from "../../../scripts/content/lib/evidence.ts";

const ev = loadEvidence();
const cite = (quote: string, page = 7) => ({ src: "cblm12", page, quote });
const verbatim = (text: string, page = 7) => ({ text, fidelity: "verbatim" as const, cites: [cite(text, page)] });
const selfCheckIds = [...ev.questions].filter(([, q]) => q.kind === "selfcheck" && q.src === "cblm12").map(([id]) => id);

function minimal(): GuideT {
  return Guide.parse({
    cblm: 12, title: "Organise and Conduct Competency Assessment", title_bn: "মূল্যায়ন আয়োজন ও পরিচালনা",
    intro_bn: ["পুরো CBLM ক্রমানুসারে।"],
    sections: [{
      id: "info-1", kind: "info", label: "Information Sheet 1", title: "Process", title_bn: "প্রক্রিয়া", pages: [7, 7],
      topics: [{
        id: "stages", title: "Stages of assessment", title_bn: "ধাপগুলো",
        blocks: [{ kind: "steps", title: "Stages", items: [verbatim("Make assessment decision"), verbatim("Provide feedback to candidate")], labels_bn: ["সিদ্ধান্ত নেওয়া", "ফলাফল জানানো"], outline: ["c12-p7-process"] }],
      }],
    }],
    selfChecks: selfCheckIds.map((question) => ({ question, q_bn: "প্রশ্ন", modelAnswer: "Answer.", keyPoints: [verbatim("Make assessment decision")] })),
    practice: {
      mcq: Array.from({ length: 5 }, () => ({ prompt: "Which stage?", options: ["Make assessment decision", "Buy tools", "Paint walls", "Sell tickets"], answerIndex: 0, answerCite: cite("Make assessment decision") })),
      matching: { prompt: "Match", pairs: ["a", "b", "c", "d"].map((x) => ({ left: `L${x}`, right: `R${x}`, cite: cite("Make assessment decision") })) },
      viva: Array.from({ length: 5 }, () => ({ q: "Next stage?", answer: verbatim("Provide feedback to candidate") })),
    },
    revision: Array.from({ length: 5 }, (_, i) => ({ topic: `T${i}`, answer: verbatim("Make assessment decision") })),
  });
}
const outline: OutlineT = { cblm: 12, items: [{ id: "c12-p7-process", page: 7, title: "Process" }] };
const codes = (g: GuideT, o: OutlineT | null = outline, cards = new Map<string, number>()) => checkGuide(g, ev, cards, o).issues.filter((i) => i.level === "error").map((i) => i.code);

describe("study guide checks", () => {
  it("a minimal correct guide passes", () => {
    const r = checkGuide(minimal(), ev, new Map(), outline);
    expect(r.issues.filter((i) => i.level === "error")).toEqual([]);
    expect(r.outline).toEqual({ total: 1, covered: 1, missing: [] });
  });

  it("an invented fact in a table cell is caught", () => {
    const g = minimal();
    g.sections[0].topics[0].blocks.push({ kind: "table", columns: ["A", "B"], rows: [["Stage", { text: "Assessors are paid weekly", fidelity: "paraphrase", cites: [cite("Assessors are paid weekly by the ministry")] }]] });
    expect(codes(g)).toContain("quote-not-found");
  });

  it("an outline item with no explaining block fails coverage", () => {
    const o: OutlineT = { cblm: 12, items: [...outline.items, { id: "c12-p24-negative", page: 24, title: "Negative assessment" }] };
    expect(codes(minimal(), o)).toContain("outline-not-covered");
  });

  it("every self check of the CBLM must be answered", () => {
    const g = minimal();
    g.selfChecks.pop();
    expect(codes(g)).toContain("missing-self-check");
  });

  it("links to unknown cards and Bangla fields without Bengali are errors", () => {
    const g = minimal();
    g.sections[0].topics[0].blocks.push({ kind: "qa", q: "What?", q_bn: "What in English", answer: verbatim("Make assessment decision"), concept: "no-such-card" });
    expect(codes(g)).toEqual(expect.arrayContaining(["unknown-concept", "bn-not-bengali"]));
  });

  it("every card of the CBLM must be in the topic list, once", () => {
    const g = minimal();
    expect(codes(g, outline, new Map([["assessment-process", 12]]))).toContain("card-not-in-topics");
    g.sections[0].topics.push({ id: "a", concept: "assessment-process", title_bn: "ধাপ", blocks: [] }, { id: "b", concept: "assessment-process", title_bn: "ধাপ", blocks: [] });
    expect(codes(g, outline, new Map([["assessment-process", 12]]))).toContain("duplicate-topic-card");
  });

  it("a guide list needs a Bangla name and one Bangla line per item", () => {
    const g = minimal();
    const list = { kind: "list" as const, title: "Stages", title_bn: "ধাপ", items: [verbatim("Make assessment decision"), verbatim("Provide feedback to candidate")], items_bn: ["সিদ্ধান্ত"] };
    Reflect.deleteProperty(list, "title_bn");
    g.sections[0].topics[0].blocks.push(list);
    expect(codes(g)).toEqual(expect.arrayContaining(["list-title-bn-missing", "list-bn-count"]));
  });

  it("a caution note must carry a source claim", () => {
    const g = minimal();
    g.sections[0].topics[0].blocks.push({ kind: "note", tone: "caution", text: "Two CBLMs disagree." });
    expect(codes(g)).toContain("caution-without-source");
  });
});
