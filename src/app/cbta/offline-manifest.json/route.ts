// Every /cbta URL the service worker downloads for offline study.
import { CBLMS, CONCEPT_INDEX, CONTENT_VERSION } from "@/data/cbta/loader";

export const dynamic = "force-static";

export function GET() {
  const urls = [
    "/cbta", "/cbta/guide", "/cbta/search", "/cbta/revise", "/cbta/mock", "/cbta/offline", "/cbta/pool.json",
    ...CBLMS.map((c) => `/cbta/cblm/${c.n}`),
    ...CONCEPT_INDEX.map((c) => `/cbta/concept/${c.id}`),
  ];
  return Response.json({ version: CONTENT_VERSION, urls });
}
