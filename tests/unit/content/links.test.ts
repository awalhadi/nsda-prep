import { describe, expect, it } from "vitest";
import { resolveLinks } from "../../../scripts/content/lib/links.ts";
import { loadEvidence } from "../../../scripts/content/lib/evidence.ts";

const ev = loadEvidence();
const concepts = new Set(["rules-of-evidence"]);
const realPassage = ev.passagesBySrc.get("cblm11")![0].id;
const realQuestion = [...ev.questions.keys()].find((k) => k.startsWith("cblm11-"))!;

describe("cross-CBLM links", () => {
  it("attaches another CBLM's highlights and questions to an existing card", () => {
    const r = resolveLinks([{ file: "links/cblm11.json", links: [
      { concept: "rules-of-evidence", passages: [realPassage], questions: [realQuestion], note: "Same rules of evidence as CBLM 12." },
    ] }], ev, concepts);
    expect(r.issues).toEqual([]);
    expect(r.passages.get("rules-of-evidence")).toEqual([realPassage]);
    expect(r.questions.get("rules-of-evidence")).toEqual([realQuestion]);
  });

  it("rejects links to missing concepts, passages or questions, and links without a note", () => {
    const r = resolveLinks([{ file: "links/x.json", links: [
      { concept: "no-such-card", passages: [realPassage], note: "x" },
      { concept: "rules-of-evidence", passages: ["cblm11-p999-deadbeef"], questions: ["cblm11-sc9-q9"], note: "" },
    ] }], ev, concepts);
    expect(r.issues.map((i) => i.code).sort()).toEqual(
      ["link-needs-note", "link-unknown-concept", "link-unknown-passage", "link-unknown-question"]);
  });
});
