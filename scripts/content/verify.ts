// Read-only check of one or more concept files (no outputs written).
//   node --experimental-strip-types scripts/content/verify.ts content/cbta/concepts/cblm12/<id>.json …

import { readFileSync } from "node:fs";
import { Concept } from "../../src/lib/cbta/schema.ts";
import { checkConcept } from "./lib/checks.ts";
import { loadEvidence } from "./lib/evidence.ts";

const files = process.argv.slice(2);
if (!files.length) {
  console.error("usage: verify.ts <concept.json> …");
  process.exit(2);
}
const ev = loadEvidence();
let errors = 0;
for (const file of files) {
  const parsed = Concept.safeParse(JSON.parse(readFileSync(file, "utf8")));
  if (!parsed.success) {
    errors++;
    console.log(`✗ ${file}: schema`);
    for (const i of parsed.error.issues) console.log(`    ${i.path.join(".")}: ${i.message}`);
    continue;
  }
  const { issues, cites } = checkConcept(parsed.data, ev);
  const e = issues.filter((i) => i.level === "error");
  errors += e.length;
  console.log(`${e.length ? "✗" : "✓"} ${parsed.data.id}: ${cites.length} cites, ${e.length} errors, ${issues.filter((i) => i.level === "warn").length} warnings`);
  for (const i of issues) console.log(`    [${i.level}] ${i.path}: ${i.code}: ${i.message}`);
}
process.exitCode = errors ? 1 : 0;
