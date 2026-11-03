import Link from "next/link";
import { ChevronRight } from "lucide-react";
import type { GenIndexEntry } from "@/lib/cbta/types";

/** A topic in a list: title, its one-line answer, and which CBLM it belongs to. */
export default function ConceptTile({ c, showCblm = false }: { c: GenIndexEntry; showCblm?: boolean }) {
  return (
    <Link href={`/cbta/concept/${c.id}`}
      className="group flex items-center gap-3 rounded-2xl border border-line bg-card p-4 hover:border-line-strong">
      <div className="min-w-0 flex-1">
        <h3 className="text-[16.5px] font-bold leading-snug text-ink">{c.title}</h3>
        <p className="mt-1 line-clamp-2 text-[14.5px] text-ink-2">{c.oneLine}</p>
        {showCblm && <p className="mt-1.5 text-[12.5px] font-semibold text-ink-3">CBLM {c.cblmPrimary}</p>}
      </div>
      <ChevronRight size={18} className="shrink-0 text-line-strong group-hover:text-ink-3" aria-hidden />
    </Link>
  );
}
