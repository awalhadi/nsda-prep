// One quiet source line per page ("CBLM 12 · p.7, 8"). Tap it to read the exact CBLM words.

import type { GenCite } from "@/lib/cbta/types";
import { citeLabel } from "./SourceChip";

function collect(v: unknown, out: GenCite[] = []): GenCite[] {
  if (Array.isArray(v)) v.forEach((x) => collect(x, out));
  else if (v && typeof v === "object") {
    if ("src" in v && "page" in v && "quote" in v) out.push(v as GenCite);
    else Object.values(v).forEach((x) => collect(x, out));
  }
  return out;
}

export default function SourcesFooter({ from }: { from: unknown }) {
  const seen = new Set<string>();
  const cites = collect(from).filter((c) => !seen.has(`${c.src}|${c.quote}`) && !!seen.add(`${c.src}|${c.quote}`));
  if (!cites.length) return null;
  const byBook = new Map<string, Set<number>>();
  for (const c of cites) {
    const book = c.cblm ? `CBLM ${c.cblm}` : c.sourceTitle ?? c.src;
    (byBook.get(book) ?? byBook.set(book, new Set()).get(book)!).add(c.printedPage ?? c.page);
  }
  const summary = [...byBook].map(([b, pages]) => `${b} · p.${[...pages].sort((x, y) => x - y).join(", ")}`).join(" · ");
  return (
    <details className="group rounded-xl px-1 text-[13px] text-ink-3">
      <summary className="inline-flex min-h-10 cursor-pointer list-none items-center underline decoration-dotted underline-offset-4 hover:text-brand">
        Source: {summary}
      </summary>
      <ul className="mt-2 space-y-2 rounded-xl bg-paper p-3 ring-1 ring-line">
        {cites.map((c, i) => (
          <li key={i} className="text-[13px] leading-relaxed text-ink-2">
            <span className="font-semibold text-ink-3">{citeLabel(c)}:</span> “{c.quote}”
          </li>
        ))}
      </ul>
    </details>
  );
}
