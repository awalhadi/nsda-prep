// Human approval of one concept card. Never run by an agent.
//
//   npm run content:approve -- <conceptId> --by <reviewer> [--status=reviewed] [--notes="…"]
//
// Requires a terminal, a reviewer listed in content/cbta/review/reviewers.json,
// and a card with no build errors, open [CHECK] items or undecided errata.

import { createInterface } from "node:readline/promises";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { runBuild } from "./lib/build-core.ts";
import { canonicalJson } from "./lib/canonical-json.ts";
import { REVIEW_DIR, loadLedger, loadReviewers, type ReviewStatus } from "./lib/ledger.ts";

const args = process.argv.slice(2);
const id = args.find((a) => !a.startsWith("--") && args[args.indexOf(a) - 1] !== "--by");
const by = args[args.indexOf("--by") + 1];
const status = (args.find((a) => a.startsWith("--status="))?.split("=")[1] ?? "approved") as ReviewStatus;
const notes = args.find((a) => a.startsWith("--notes="))?.slice("--notes=".length);

function fail(msg: string): never {
  console.error(`content:approve: ${msg}`);
  process.exit(1);
}

if (!process.stdin.isTTY || !process.stdout.isTTY) fail("must be run by a person in an interactive terminal.");
if (!id) fail("usage: npm run content:approve -- <conceptId> --by <reviewer>");
if (!by || args.indexOf("--by") === -1) fail("--by <reviewer> is required.");
if (status !== "approved" && status !== "reviewed") fail("--status must be approved or reviewed.");
const reviewers = loadReviewers();
if (!reviewers.includes(by)) fail(`"${by}" is not in content/cbta/review/reviewers.json (${reviewers.join(", ") || "empty"}).`);

const build = runBuild();
const r = build.results.find((x) => x.id === id);
if (!r || !r.concept) fail(`no valid concept "${id}".`);
if (r.blockers.length) fail(`cannot ${status === "approved" ? "approve" : "mark reviewed"} ${id}:\n  - ${r.blockers.join("\n  - ")}`);

const c = r.concept;
const line = (s = "") => console.log(s);
line(`\n${c.canonical_title}  ${"★".repeat(r.stars)}${"☆".repeat(3 - r.stars)}  (score ${r.score}, now ${r.status})`);
line(`Why important: ${r.importance.en}`);
line(`\nOne-line answer: ${c.one_line_answer.text}`);
if (c.list_answer) c.list_answer.items.forEach((it, i) => line(`  ${i + 1}. ${it.text}`));
line(`\nKey words: ${c.keywords.map((k) => `${k.en} = ${k.bn}`).join(" · ")}`);
line("Bangla:");
c.bangla_explanation.forEach((b) => line(`  ${b}`));
line(`Example: ${c.example.en}`);
if (c.mnemonic) line(`Memory trick: ${c.mnemonic.text}`);
line("Traps:");
c.traps.forEach((t) => line(`  - ${t.text}`));
line(`\nCitations (${r.cites.length}):`);
for (const x of r.cites) line(`  [${x.exact ? "exact" : x.score}] ${x.cite.src} p.${x.cite.page}: "${x.cite.quote}"`);
const warns = r.issues.filter((i) => i.level === "warn");
if (warns.length) {
  line(`\nWarnings (${warns.length}):`);
  warns.forEach((w) => line(`  ! ${w.path}: ${w.message}`));
}

// Diff against the snapshot of the previous approval, if any.
const ledger = loadLedger();
const prev = ledger[id];
const snapDir = join(REVIEW_DIR, "snapshots");
if (prev) {
  const snap = join(snapDir, `${id}@${prev.contentHash.slice(0, 8)}.json`);
  if (existsSync(snap)) {
    const before = readFileSync(snap, "utf8").split("\n");
    const after = canonicalJson(r.raw).split("\n");
    const removed = before.filter((l) => !after.includes(l));
    const added = after.filter((l) => !before.includes(l));
    line(`\nChanges since ${prev.status} by ${prev.reviewer} (${prev.at}):`);
    removed.forEach((l) => line(`  - ${l.trim()}`));
    added.forEach((l) => line(`  + ${l.trim()}`));
    if (!removed.length && !added.length) line("  (card unchanged; cited source pages changed)");
  }
}

line("\nCheck the Bangla meaning and the example yourself: the build cannot verify them.");
const rl = createInterface({ input: process.stdin, output: process.stdout });
const answer = (await rl.question(`Mark ${id} as ${status} by ${by}? [y/N] `)).trim().toLowerCase();
rl.close();
if (answer !== "y" && answer !== "yes") fail("not changed.");

ledger[id] = {
  status, contentHash: r.hashes.content, evidenceHash: r.hashes.evidence, reviewer: by, at: new Date().toISOString(),
  ...(notes ? { notes } : {}),
};
mkdirSync(snapDir, { recursive: true });
writeFileSync(join(snapDir, `${id}@${r.hashes.content.slice(0, 8)}.json`), canonicalJson(r.raw));
writeFileSync(join(REVIEW_DIR, "ledger.json"), canonicalJson(ledger));
line(`\n✓ ${id} marked ${status}. Run \`npm run content:build\` to update the app and reports.`);
