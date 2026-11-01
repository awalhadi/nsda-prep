import { readFileSync } from "node:fs";
import { join } from "node:path";
import type { RawDoc } from "../../../scripts/content/lib/raw.ts";

export function fixture(name: string): RawDoc {
  return JSON.parse(readFileSync(join(import.meta.dirname, "../../fixtures/cblm", `${name}.json`), "utf8"));
}
