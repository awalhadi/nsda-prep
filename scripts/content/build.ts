// CLI for stage D.
//
//   node --experimental-strip-types scripts/content/build.ts                 write outputs
//   … build.ts --check                                                        no writes; fail if outputs are stale
//   … build.ts --strict=cblm12 --require-approved=cblm12                       release gates
//
// Exit code 1 on any error-level issue (outputs are still written so the reports show why).

import { existsSync, readdirSync, readFileSync, rmSync } from "node:fs";
import { join, relative } from "node:path";
import { GENERATED_DIR, runBuild } from "./lib/build-core.ts";
import { writeText } from "./lib/canonical-json.ts";
import { ROOT } from "./lib/raw.ts";

const args = process.argv.slice(2);
const listArg = (name: string) =>
  args.find((a) => a.startsWith(`--${name}=`))?.split("=")[1].split(",").filter(Boolean) ?? [];
const check = args.includes("--check");

const result = runBuild({ strict: listArg("strict"), requireApproved: listArg("require-approved") });

const existingGenerated = ["concepts", "guides"].flatMap((d) => {
  const dir = join(GENERATED_DIR, d);
  return existsSync(dir) ? readdirSync(dir).map((f) => join(dir, f)) : [];
});
const stale = existingGenerated.filter((f) => !result.outputs.has(f));

if (check) {
  const diffs = [...result.outputs].filter(([p, text]) => !existsSync(p) || readFileSync(p, "utf8") !== text).map(([p]) => p);
  diffs.push(...stale);
  if (diffs.length) {
    console.error(`content:check: ${diffs.length} output(s) out of date. Run \`npm run content:build\`:\n  ` +
      diffs.map((p) => relative(ROOT, p)).join("\n  "));
    process.exitCode = 1;
  }
} else {
  let written = 0;
  for (const [p, text] of result.outputs) written += +writeText(p, text);
  for (const f of stale) rmSync(f);
  console.log(`content:build: ${result.results.length} concept(s), ${result.guides.length} guide(s), ${written} file(s) updated, ${stale.length} removed`);
}

const statuses = result.results.reduce<Record<string, number>>((m, r) => ((m[r.status] = (m[r.status] ?? 0) + 1), m), {});
const warnings = result.results.reduce((s, r) => s + r.issues.filter((i) => i.level === "warn").length, 0);
console.log(`  status: ${JSON.stringify(statuses)} · warnings: ${warnings} · errors: ${result.errorCount} · version ${result.contentVersion}`);
if (result.errorCount) {
  for (const i of result.globalIssues.filter((x) => x.level === "error")) console.error(`  ✗ ${i.code}: ${i.message}`);
  for (const r of result.results) for (const i of r.issues.filter((x) => x.level === "error"))
    console.error(`  ✗ ${r.id} ${i.path}: ${i.code}: ${i.message}`);
  for (const g of result.guides) for (const i of g.issues.filter((x) => x.level === "error"))
    console.error(`  ✗ ${g.file} ${i.path}: ${i.code}: ${i.message}`);
  process.exitCode = 1;
}
