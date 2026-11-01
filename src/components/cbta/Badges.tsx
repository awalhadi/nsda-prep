import { BadgeCheck, FileClock, Highlighter, TriangleAlert } from "lucide-react";
import type { CardStatus } from "@/lib/cbta/types";

const STATUS: Record<CardStatus, { label: string; labelBn: string; className: string; Icon: typeof BadgeCheck }> = {
  approved: { label: "Verified", labelBn: "যাচাই করা", className: "border-teal/50 text-teal bg-teal/10", Icon: BadgeCheck },
  reviewed: { label: "Draft · reviewed", labelBn: "খসড়া", className: "border-border-subtle text-text-muted bg-surface-2", Icon: FileClock },
  draft: { label: "Draft", labelBn: "খসড়া", className: "border-border-subtle text-text-muted bg-surface-2", Icon: FileClock },
  changed: { label: "Draft · changed", labelBn: "পরিবর্তিত খসড়া", className: "border-amber/50 text-amber bg-amber/10", Icon: TriangleAlert },
};

export function StatusBadge({ status }: { status: CardStatus }) {
  const s = STATUS[status];
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium ${s.className}`}>
      <s.Icon size={13} aria-hidden />
      {s.label}
      <span lang="bn" className="opacity-80">· {s.labelBn}</span>
    </span>
  );
}

export function Stars({ n }: { n: 1 | 2 | 3 }) {
  return (
    <span className="text-amber tracking-tight" aria-label={`${n} of 3 stars: ${n === 3 ? "most likely in exam" : n === 2 ? "likely" : "less likely"}`}>
      {"★".repeat(n)}
      <span className="text-text-faint">{"★".repeat(3 - n)}</span>
    </span>
  );
}

/** The one yellow mark used everywhere for highlighted CBLM material. */
export function HighlightMark() {
  return (
    <span className="inline-flex items-center gap-1 rounded-md bg-[#fde047] px-1.5 py-0.5 text-[11px] font-semibold text-[#1a1600]">
      <Highlighter size={11} aria-hidden /> Highlighted
    </span>
  );
}
