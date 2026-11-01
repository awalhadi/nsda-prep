import { BadgeCheck, FileClock, Flame, Highlighter, Star, TriangleAlert } from "lucide-react";
import type { CardStatus } from "@/lib/cbta/types";

const STATUS: Record<CardStatus, { label: string; className: string; Icon: typeof BadgeCheck }> = {
  approved: { label: "Verified", className: "border-teal/40 text-teal bg-teal/10", Icon: BadgeCheck },
  reviewed: { label: "Draft", className: "border-white/10 text-text-muted bg-white/5", Icon: FileClock },
  draft: { label: "Draft", className: "border-white/10 text-text-muted bg-white/5", Icon: FileClock },
  changed: { label: "Draft · changed", className: "border-amber/40 text-amber bg-amber/10", Icon: TriangleAlert },
};

export function StatusBadge({ status }: { status: CardStatus }) {
  const s = STATUS[status];
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium ${s.className}`}>
      <s.Icon size={13} aria-hidden />
      {s.label}
    </span>
  );
}

export const PRIORITY = {
  3: { label: "Must read", bn: "অবশ্যই পড়ুন", ring: "from-rose-500/25 via-amber/15", text: "text-rose-300", chip: "bg-rose-500/15 text-rose-200 border-rose-400/30", rail: "bg-linear-to-b from-rose-400 to-amber" },
  2: { label: "Important", bn: "গুরুত্বপূর্ণ", ring: "from-amber/25 via-amber/10", text: "text-amber", chip: "bg-amber/15 text-amber border-amber/30", rail: "bg-amber" },
  1: { label: "Good to know", bn: "জেনে রাখুন", ring: "from-teal/20 via-teal/5", text: "text-teal", chip: "bg-teal/10 text-teal border-teal/30", rail: "bg-teal/70" },
} as const;

export function PriorityPill({ n, size = "md" }: { n: 1 | 2 | 3; size?: "sm" | "md" }) {
  const p = PRIORITY[n];
  const Icon = n === 3 ? Flame : Star;
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border font-semibold ${p.chip} ${size === "sm" ? "px-2 py-0.5 text-[11px]" : "px-3 py-1 text-xs"}`}
      aria-label={`Exam priority: ${p.label}`}
    >
      <Icon size={size === "sm" ? 11 : 13} aria-hidden />
      {p.label}
      <span aria-hidden className="tracking-tight opacity-90">{"★".repeat(n)}</span>
    </span>
  );
}

export function Stars({ n }: { n: 1 | 2 | 3 }) {
  return (
    <span className="text-amber tracking-tight" aria-label={`${n} of 3 stars`}>
      {"★".repeat(n)}
      <span className="text-text-faint">{"★".repeat(3 - n)}</span>
    </span>
  );
}

/** The one yellow mark used everywhere for highlighted CBLM material. */
export function HighlightMark({ size = "md" }: { size?: "sm" | "md" }) {
  return (
    <span className={`inline-flex items-center gap-1 rounded-full bg-[#fde047] font-semibold text-[#1a1600] ${size === "sm" ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-1 text-[11px]"}`}>
      <Highlighter size={size === "sm" ? 10 : 11} aria-hidden /> Highlighted
    </span>
  );
}
