// Offline study for both courses. Visited pages are cached; bulk download covers all study routes.
//
// - Pages under /cbta: network first (3 s), then the cache, then /cbta/offline.
// - Next.js static assets (/_next/static): cache first (file names are content-hashed).
// - RSC (client navigation) requests: network only; when offline we answer 503 so Next.js
//   falls back to a full page load, which the page handler above serves from the cache.
// - "precache" message: downloads every /cbta page and its assets for full offline use.

const VERSION = "nsda-study-v2";
const PAGES = `${VERSION}-pages`;
const STATIC = `${VERSION}-static`;

self.addEventListener("install", () => self.skipWaiting());

self.addEventListener("activate", (event) => {
  event.waitUntil((async () => {
    for (const key of await caches.keys()) if ((key.startsWith("cbta-v") || key.startsWith("nsda-study-")) && !key.startsWith(VERSION)) await caches.delete(key);
    await self.clients.claim();
  })());
});

const isStudy = (url) => url.pathname === "/" || /^\/(cbta|modules|module|quiz|flashcards|review|settings)(\/|$)/.test(url.pathname);
const isRsc = (req, url) => req.headers.get("RSC") === "1" || url.searchParams.has("_rsc");

function timeout(ms) {
  return new Promise((_, reject) => setTimeout(() => reject(new Error("timeout")), ms));
}

async function pageFromNetworkOrCache(req) {
  const cache = await caches.open(PAGES);
  try {
    const res = await Promise.race([fetch(req), timeout(3000)]);
    if (res.ok) cache.put(req, res.clone());
    return res;
  } catch {
    // Quiz query parameters select timing and question counts; never substitute a different configuration.
    const exactQuiz = new URL(req.url).pathname.startsWith("/quiz/");
    return (await cache.match(req, { ignoreSearch: !exactQuiz })) ||
      (await cache.match("/cbta/offline")) ||
      new Response("Offline", { status: 503, headers: { "Content-Type": "text/plain" } });
  }
}

async function staticFromCacheOrNetwork(req) {
  const cache = await caches.open(STATIC);
  const hit = await cache.match(req);
  if (hit) return hit;
  const res = await fetch(req);
  if (res.ok) cache.put(req, res.clone());
  return res;
}

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  if (url.pathname.startsWith("/_next/static/") || url.pathname.startsWith("/icons/") || url.pathname.startsWith("/fonts/")) {
    event.respondWith(staticFromCacheOrNetwork(req));
    return;
  }
  if (!isStudy(url)) return;
  if (isRsc(req, url)) {
    event.respondWith(fetch(req).catch(() => new Response(null, { status: 503 })));
    return;
  }
  event.respondWith(pageFromNetworkOrCache(req));
});

// Download everything needed to study offline, reporting progress to the page.
self.addEventListener("message", (event) => {
  if (event.data?.type !== "precache") return;
  const client = event.source;
  event.waitUntil((async () => {
    try {
      const list = await (await fetch("/cbta/offline-manifest.json", { cache: "no-store" })).json();
      const pages = await caches.open(PAGES);
      const statics = await caches.open(STATIC);
      const assets = new Set(["/fonts/NotoSansBengali-Regular.ttf", "/fonts/NotoSansBengali-Bold.ttf", "/icons/study-192.png", "/icons/study-512.png", "/icons/study-maskable-512.png", "/icons/apple-touch-icon.png"]);
      let done = 0;
      for (const path of list.urls) {
        const res = await fetch(path, { cache: "no-store" });
        if (!res.ok) throw new Error(`Could not save ${path}: ${res.status}`);
        if (res.ok) {
          await pages.put(path, res.clone());
          if ((res.headers.get("Content-Type") || "").includes("text/html")) {
            const html = await res.text();
            for (const m of html.matchAll(/(?:src|href)="(\/_next\/static\/[^"]+)"/g)) assets.add(m[1]);
          }
        }
        done++;
        if (done % 10 === 0 || done === list.urls.length) client?.postMessage({ type: "precache-progress", done, total: list.urls.length });
      }
      for (const a of assets) if (!(await statics.match(a))) {
        const r = await fetch(a);
        if (!r.ok) throw new Error(`Could not save asset: ${r.status}`);
        await statics.put(a, r);
      }
      client?.postMessage({ type: "precache-done", version: list.version, pages: list.urls.length, assets: assets.size });
    } catch (err) {
      client?.postMessage({ type: "precache-error", message: String(err) });
    }
  })());
});
