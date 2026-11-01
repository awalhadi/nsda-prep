// The approval lifecycle: approve → edit → "changed" → re-approve.

import { cpSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterAll, describe, expect, it } from "vitest";
import { runBuild } from "../../../scripts/content/lib/build-core.ts";
import { loadEvidence } from "../../../scripts/content/lib/evidence.ts";
import { effectiveStatus, type Ledger } from "../../../scripts/content/lib/ledger.ts";

const ROOT = join(import.meta.dirname, "../../..");
const dir = mkdtempSync(join(tmpdir(), "cbta-concepts-"));
cpSync(join(ROOT, "content/cbta/concepts"), dir, { recursive: true });
const file = join(dir, "cblm03/hierarchy-of-controls.json");
const evidence = loadEvidence();
afterAll(() => rmSync(dir, { recursive: true, force: true }));

const build = (ledger: Ledger) => runBuild({ conceptsDir: dir, ledger, evidence });
const statusOf = (ledger: Ledger) => build(ledger).results.find((r) => r.id === "hierarchy-of-controls")!;

describe("review ledger", () => {
  const first = statusOf({});
  const approved: Ledger = {
    "hierarchy-of-controls": {
      status: "approved", contentHash: first.hashes.content, evidenceHash: first.hashes.evidence,
      reviewer: "Test Reviewer", at: "2026-11-01T00:00:00.000Z",
    },
  };

  it("starts as draft", () => {
    expect(first.status).toBe("draft");
  });

  it("is approved when the ledger hashes match", () => {
    expect(statusOf(approved).status).toBe("approved");
  });

  it("drops to 'changed' after any edit to the card", () => {
    const card = JSON.parse(readFileSync(file, "utf8"));
    card.example.en = "A welding shop has toxic fumes. First, use a safer process.";
    writeFileSync(file, JSON.stringify(card, null, 2));
    const r = statusOf(approved);
    expect(r.status).toBe("changed");
    expect(r.hashes.content).not.toBe(first.hashes.content);
  });

  it("is approved again once the new version is approved", () => {
    const r = statusOf(approved);
    const reapproved: Ledger = {
      "hierarchy-of-controls": { ...approved["hierarchy-of-controls"], contentHash: r.hashes.content },
    };
    expect(statusOf(reapproved).status).toBe("approved");
  });
});

describe("effectiveStatus", () => {
  const entry = { status: "approved" as const, contentHash: "a", evidenceHash: "b", reviewer: "r", at: "t" };
  it("treats a changed source page like a changed card", () => {
    expect(effectiveStatus(entry, { content: "a", evidence: "CHANGED" }, false)).toBe("changed");
  });
  it("never shows approved while blockers exist", () => {
    expect(effectiveStatus(entry, { content: "a", evidence: "b" }, true)).toBe("changed");
  });
  it("keeps 'reviewed' separate from approved", () => {
    expect(effectiveStatus({ ...entry, status: "reviewed" }, { content: "a", evidence: "b" }, false)).toBe("reviewed");
  });
});
