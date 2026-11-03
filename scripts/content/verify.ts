// Read-only check of one or more concept or study-guide files (no outputs written).
//   node --experimental-strip-types scripts/content/verify.ts content/cbta/concepts/cblm12/<id>.json …
//   … verify.ts content/cbta/guides/cblm12.json

import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { Concept, Guide } from "../../src/lib/cbta/schema.ts";
import { CONCEPTS_DIR, loadOutline } from "./lib/build-core.ts";
import { checkConcept, checkGuide } from "./lib/checks.ts";
import { loadEvidence } from "./lib/evidence.ts";

/** Every card id → its primary CBLM. */
function cards(): Map<string, number> {
  return new Map(readdirSync(CONCEPTS_DIR).flatMap((d) => readdirSync(join(CONCEPTS_DIR, d)).map((f) => {
    const c = JSON.parse(readFileSync(join(CONCEPTS_DIR, d, f), "utf8")) as { id: string; cblmPrimary: number };
    return [c.id, c.cblmPrimary] as const;
  })));
}

const files = process.argv.slice(2);
if (!files.length) {
  console.error("usage: verify.ts <concept.json> …");
  process.exit(2);
}
const ev = loadEvidence();
let errors = 0;
for (const file of files) {
  if (file.includes("guides/")) {
    const parsed = Guide.safeParse(JSON.parse(readFileSync(file, "utf8")));
    if (!parsed.success) {
      errors++;
      console.log(`✗ ${file}: schema`);
      for (const i of parsed.error.issues) console.log(`    ${i.path.join(".")}: ${i.message}`);
      continue;
    }
    const { issues, cites, outline } = checkGuide(parsed.data, ev, cards(), loadOutline(parsed.data.cblm));
    const e = issues.filter((i) => i.level === "error");
    errors += e.length;
    const ol = outline ? `, outline ${outline.covered}/${outline.total}` : ", no outline file";
    console.log(`${e.length ? "✗" : "✓"} ${file}: ${cites.length} cites${ol}, ${e.length} errors, ${issues.filter((i) => i.level === "warn").length} warnings`);
    for (const i of issues) console.log(`    [${i.level}] ${i.path}: ${i.code}: ${i.message}`);
    continue;
  }
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
