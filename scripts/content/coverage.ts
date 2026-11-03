// Read-only coverage check for one or more CBLMs: every highlight passage and
// every Self Check question must be covered by a concept card or a link.
//   node --experimental-strip-types scripts/content/coverage.ts cblm11 [cblm09 …]

import { runBuild } from "./lib/build-core.ts";
import { loadEvidence } from "./lib/evidence.ts";

const srcs = process.argv.slice(2);
if (!srcs.length) {
  console.error("usage: coverage.ts <cblmNN> …");
  process.exit(2);
}
const ev = loadEvidence();
const r = runBuild({ strict: srcs, evidence: ev });
let bad = 0;
for (const src of srcs) {
  const cov = r.coverage.find((c) => c.src === src);
  if (!cov) { console.log(`✗ ${src}: unknown source`); bad++; continue; }
  const unmapped = r.globalIssues.filter((i) => i.code === "unmapped-question" && i.path.startsWith(`${src}-`));
  const ok = !cov.uncovered.length && !unmapped.length;
  if (!ok) bad++;
  console.log(`${ok ? "✓" : "✗"} ${src}: ${cov.covered}/${cov.total} passages covered, ${unmapped.length} unmapped self-check question(s)`);
  for (const id of cov.uncovered) {
    const p = ev.passages.get(id)!;
    console.log(`    uncovered ${id} (p.${p.page}): ${p.text.slice(0, 110)}`);
  }
  for (const i of unmapped) console.log(`    unmapped ${i.path}: ${i.message}`);
  const g = r.guides.find((x) => x.cblm === cov.cblm);
  if (!g) console.log(`  · ${src}: no study guide yet`);
  else {
    const gErr = g.issues.filter((i) => i.level === "error");
    const ol = g.outline;
    const gOk = !gErr.length && !!ol && ol.covered === ol.total;
    if (!gOk) bad++;
    console.log(`${gOk ? "✓" : "✗"} ${src} study guide: outline ${ol ? `${ol.covered}/${ol.total}` : "file missing"}, ${gErr.length} error(s)`);
    for (const i of gErr.slice(0, 40)) console.log(`    ${i.code} ${i.path}: ${i.message}`);
  }
}
const errors = r.globalIssues.filter((i) => i.level === "error" && !["uncovered-highlights", "unmapped-question"].includes(i.code));
for (const i of errors) console.log(`  ✗ ${i.code} ${i.path}: ${i.message}`);
for (const i of r.globalIssues.filter((x) => x.code === "possible-duplicate-concept")) console.log(`  ! ${i.path}: ${i.message}`);
process.exitCode = bad || errors.length ? 1 : 0;
