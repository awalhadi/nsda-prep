import { readFileSync } from "node:fs";
import { join } from "node:path";
import vm from "node:vm";
import { describe, expect, it } from "vitest";

const worker = readFileSync(join(process.cwd(), "public/sw.js"), "utf8");
function harness(fetcher: (req: unknown) => Promise<Response>) {
  const listeners: Record<string, (event: unknown) => void> = {};
  const removed: string[] = [];
  const matches: { ignoreSearch?: boolean }[] = [];
  const cache = { match: async (_req: unknown, options: { ignoreSearch?: boolean }) => { matches.push(options); return new Response("cached"); }, put: async () => {} };
  const caches = { keys: async () => ["another-app-cache", "cbta-v1-pages", "nsda-study-v1-static", "nsda-study-v2-pages"], delete: async (key: string) => { removed.push(key); }, open: async () => cache };
  vm.runInNewContext(worker, { self: { addEventListener: (name: string, cb: (event: unknown) => void) => { listeners[name] = cb; }, location: { origin: "https://study.test" }, clients: { claim: async () => {} }, skipWaiting() {} }, caches, fetch: fetcher, URL, Response, setTimeout: () => 0, Set });
  return { listeners, removed, matches };
}
describe("offline worker", () => {
  it("cleans up only this app's old caches", async () => {
    const h = harness(async () => new Response("ok"));
    let work: Promise<void> | undefined;
    h.listeners.activate({ waitUntil: (p: Promise<void>) => { work = p; } }); await work;
    expect(h.removed).toEqual(["cbta-v1-pages", "nsda-study-v1-static"]);
  });
  it("serves visited web-design pages offline while preserving custom quiz configurations", async () => {
    const h = harness(async () => { throw Error("offline"); });
    for (const route of ["/modules", "/quiz/html?count=10&timed=0"]) {
      let response: Promise<Response> | undefined;
      h.listeners.fetch({ request: { method: "GET", url: `https://study.test${route}`, headers: new Headers() }, respondWith: (p: Promise<Response>) => { response = p; } });
      expect(await (await response!).text()).toBe("cached");
    }
    expect(h.matches[0].ignoreSearch).toBe(true);
    expect(h.matches[1].ignoreSearch).toBe(false);
  });
  it("reports a download error rather than claiming missing pages were saved", async () => {
    const h = harness(async (req) => String(req).includes("offline-manifest") ? Response.json({ urls: ["/cbta/missing"], version: "test" }) : new Response("missing", { status: 404 }));
    const messages: { type: string }[] = []; let work: Promise<void> | undefined;
    h.listeners.message({ data: { type: "precache" }, source: { postMessage: (m: { type: string }) => messages.push(m) }, waitUntil: (p: Promise<void>) => { work = p; } }); await work;
    expect(messages.map((m) => m.type)).toEqual(["precache-error"]);
  });
});
