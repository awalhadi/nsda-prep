import { describe, it, expect } from "vitest";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import manifest from "../../../src/app/manifest";

describe("installable study app", () => {
  it("provides a stable identity, standalone mode, both icon sizes and maskable artwork", () => {
    const m = manifest();
    expect(m.id).toBe("/"); expect(m.scope).toBe("/"); expect(m.start_url).toBe("/cbta");
    expect(m.display).toBe("standalone");
    expect(m.icons?.some((icon) => icon.sizes === "192x192")).toBe(true);
    expect(m.icons?.some((icon) => icon.sizes === "512x512" && icon.purpose === "maskable")).toBe(true);
    for (const icon of m.icons ?? []) expect(existsSync(join(process.cwd(), "public", icon.src))).toBe(true);
    expect(existsSync(join(process.cwd(), "public/icons/apple-touch-icon.png"))).toBe(true);
  });
  it("ships Bengali fonts and includes them in offline downloads", () => {
    const worker = readFileSync(join(process.cwd(), "public/sw.js"), "utf8");
    for (const file of ["NotoSansBengali-Regular.ttf", "NotoSansBengali-Bold.ttf"]) {
      expect(existsSync(join(process.cwd(), "public/fonts", file))).toBe(true);
      expect(worker).toContain(file);
    }
  });
});
