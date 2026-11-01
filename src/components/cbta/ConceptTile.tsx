import Link from "next/link";
import { ChevronRight } from "lucide-react";
import type { GenIndexEntry } from "@/lib/cbta/types";
import { HighlightMark, PRIORITY, StatusBadge } from "./Badges";

export default function ConceptTile({ c, showCblm = false }: { c: GenIndexEntry; showCblm?: boolean }) {
  const p = PRIORITY[c.stars];
  return (
    <Link href={`/cbta/concept/${c.id}`}
      className="group flex items-center gap-3 rounded-2xl border border-line bg-card p-4 transition-shadow hover:border-line-strong hover:shadow-[0_2px_12px_rgba(27,26,23,0.06)]">
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-[16.5px] font-bold leading-snug text-ink">{c.title}</h3>
          <span className={`shrink-0 text-[15px] tracking-tight ${p.text}`} aria-label={`${c.stars} of 3 stars`}>
            {"★".repeat(c.stars)}<span className="text-line-strong">{"★".repeat(3 - c.stars)}</span>
          </span>
        </div>
        <p className="mt-1 line-clamp-2 text-[14.5px] text-ink-2">{c.oneLine}</p>
        <div className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[12.5px] font-semibold text-ink-3">
          {showCblm && <span>CBLM {c.cblmPrimary}</span>}
          {c.asked > 0 && <span>Asked {c.asked}×</span>}
          {c.highlighted && <HighlightMark size="sm" />}
          {c.status !== "draft" && <StatusBadge status={c.status} />}
        </div>
      </div>
      <ChevronRight size={18} className="shrink-0 text-line-strong transition-transform group-hover:translate-x-0.5 group-hover:text-ink-3" aria-hidden />
    </Link>
  );
}
