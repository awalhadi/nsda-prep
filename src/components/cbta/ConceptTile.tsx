import Link from "next/link";
import { ChevronRight, MessageSquareText } from "lucide-react";
import type { GenIndexEntry } from "@/lib/cbta/types";
import { HighlightMark, PRIORITY, StatusBadge } from "./Badges";

export default function ConceptTile({ c, showCblm = false }: { c: GenIndexEntry; showCblm?: boolean }) {
  const p = PRIORITY[c.stars];
  return (
    <Link
      href={`/cbta/concept/${c.id}`}
      className="group relative flex overflow-hidden rounded-2xl border border-white/10 bg-surface/80 transition-all hover:-translate-y-0.5 hover:border-white/20 hover:bg-surface-2"
    >
      <span className={`w-1.5 shrink-0 ${p.rail}`} aria-hidden />
      <div className="flex min-w-0 flex-1 items-center gap-3 p-4">
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-display text-[17px] font-semibold leading-snug group-hover:text-white">{c.title}</h3>
            <span className={`shrink-0 text-sm tracking-tight ${p.text}`} aria-label={`${c.stars} of 3 stars`}>{"★".repeat(c.stars)}</span>
          </div>
          <p className="mt-1 line-clamp-2 text-sm text-text-muted">{c.oneLine}</p>
          <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
            {showCblm && <span className="rounded-full bg-white/5 px-2 py-0.5 text-[11px] text-text-muted">CBLM {c.cblmPrimary}</span>}
            {c.asked > 0 && (
              <span className="inline-flex items-center gap-1 rounded-full bg-indigo-400/15 px-2 py-0.5 text-[11px] font-medium text-indigo-200">
                <MessageSquareText size={11} aria-hidden /> Asked {c.asked}×
              </span>
            )}
            {c.highlighted && <HighlightMark size="sm" />}
            {c.status !== "draft" && <StatusBadge status={c.status} />}
          </div>
        </div>
        <ChevronRight size={18} className="shrink-0 text-text-faint transition-transform group-hover:translate-x-0.5 group-hover:text-text-muted" aria-hidden />
      </div>
    </Link>
  );
}
