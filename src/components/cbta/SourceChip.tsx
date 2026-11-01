import { BookOpen } from "lucide-react";
import type { GenCite } from "@/lib/cbta/types";

export function citeLabel(cite: GenCite): string {
  const where = cite.cblm ? `CBLM ${cite.cblm}` : cite.sourceTitle ?? cite.src;
  const page = cite.printedPage && cite.printedPage !== cite.page ? `p.${cite.printedPage}` : `p.${cite.page}`;
  return `${where} · ${page}`;
}

/** Small source tag; tap to read the exact quote from the CBLM. */
export default function SourceChip({ cite }: { cite: GenCite }) {
  return (
    <details className="group inline-block align-middle">
      <summary className="inline-flex cursor-pointer list-none items-center gap-1 rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[11px] text-text-faint transition-colors hover:border-teal/40 hover:text-teal group-open:border-teal/40 group-open:text-teal">
        <BookOpen size={10} aria-hidden />
        {citeLabel(cite)}
      </summary>
      <blockquote className="mt-2 max-w-prose rounded-lg border-l-2 border-teal/60 bg-black/20 px-3 py-2 text-[13px] leading-relaxed text-text-muted">
        “{cite.quote}”
        <span className="mt-1 block text-[11px] text-text-faint">
          {cite.match === "exact" ? "✓ exact words from the CBLM" : `close match (${cite.match})`}
        </span>
      </blockquote>
    </details>
  );
}
