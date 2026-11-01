import type { GenCite } from "@/lib/cbta/types";

export function citeLabel(cite: GenCite): string {
  const where = cite.cblm ? `CBLM ${cite.cblm}` : cite.sourceTitle ?? cite.src;
  const page = cite.printedPage && cite.printedPage !== cite.page ? `p.${cite.printedPage}` : `p.${cite.page}`;
  return `${where}, ${page}`;
}

/** Quiet source reference; tap to read the exact words from the CBLM. */
export default function SourceChip({ cite }: { cite: GenCite }) {
  return (
    <details className="group inline-block align-baseline">
      <summary className="inline cursor-pointer list-none rounded px-1 text-[12px] font-medium text-ink-3 underline decoration-line-strong decoration-dotted underline-offset-4 hover:text-brand group-open:text-brand">
        {citeLabel(cite)}
      </summary>
      <span className="mt-2 block max-w-prose rounded-xl bg-paper px-3 py-2 text-[13px] leading-relaxed text-ink-2 ring-1 ring-line">
        <span className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-ink-3">
          {cite.match === "exact" ? "Exact words from the CBLM" : "From the CBLM (close match)"}
        </span>
        “{cite.quote}”
      </span>
    </details>
  );
}
