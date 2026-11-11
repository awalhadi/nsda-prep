// Study pages for the offline download. Custom quiz URLs are cached separately when visited.
import { MODULES } from "@/data/loader";
import { CBLMS, CONCEPT_INDEX, CONTENT_VERSION, getGuide, topicHref } from "@/data/cbta/loader";

export const dynamic = "force-static";

export function GET() {
  const urls = [
    "/", "/modules", "/review", "/settings", "/cbta/courses",
    ...MODULES.flatMap((m) => [`/module/${m.id}`, m.kind === "mcq" ? `/quiz/${m.id}` : `/flashcards/${m.id}`]),
    "/cbta", "/cbta/questions", "/cbta/guide", "/cbta/must-know", "/cbta/search", "/cbta/revise", "/cbta/mock", "/cbta/offline", "/cbta/pool.json",
    ...CBLMS.map((c) => `/cbta/cblm/${c.n}`),
    ...CBLMS.filter((c) => getGuide(c.n)).flatMap((c) => ["self-check", "practice", "last-minute"].map((p) => `/cbta/cblm/${c.n}/${p}`)),
    ...CBLMS.flatMap((c) => c.groups.flatMap((g) => g.topics.filter((t) => !t.concept).map((t) => topicHref(c.n, t)))),
    ...CONCEPT_INDEX.map((c) => `/cbta/concept/${c.id}`),
  ];
  return Response.json({ version: `${CONTENT_VERSION}-design-v5`, urls });
}
