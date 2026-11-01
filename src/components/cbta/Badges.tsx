import { BadgeCheck, FileClock, Flame, Star, TriangleAlert } from "lucide-react";
import type { CardStatus } from "@/lib/cbta/types";

const STATUS: Record<CardStatus, { label: string; className: string; Icon: typeof BadgeCheck }> = {
  approved: { label: "Verified by trainer", className: "bg-ok-soft text-ok", Icon: BadgeCheck },
  reviewed: { label: "Draft", className: "bg-paper text-ink-3 ring-1 ring-line", Icon: FileClock },
  draft: { label: "Draft", className: "bg-paper text-ink-3 ring-1 ring-line", Icon: FileClock },
  changed: { label: "Draft · changed", className: "bg-hot-soft text-hot", Icon: TriangleAlert },
};

export function StatusBadge({ status }: { status: CardStatus }) {
  const s = STATUS[status];
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${s.className}`}>
      <s.Icon size={13} aria-hidden />
      {s.label}
    </span>
  );
}

export const PRIORITY = {
  3: { label: "Must read", bn: "অবশ্যই পড়ুন", chip: "bg-hot-soft text-hot", text: "text-hot", rail: "bg-hot" },
  2: { label: "Important", bn: "গুরুত্বপূর্ণ", chip: "bg-sand text-[#9a5b00]", text: "text-[#9a5b00]", rail: "bg-[#e0a43a]" },
  1: { label: "Good to know", bn: "জেনে রাখুন", chip: "bg-brand-soft text-brand-ink", text: "text-brand", rail: "bg-brand/60" },
} as const;

export function PriorityPill({ n }: { n: 1 | 2 | 3 }) {
  const p = PRIORITY[n];
  const Icon = n === 3 ? Flame : Star;
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${p.chip}`} aria-label={`Exam priority: ${p.label}`}>
      <Icon size={13} aria-hidden />
      {p.label}
      <span aria-hidden className="tracking-tight">{"★".repeat(n)}</span>
    </span>
  );
}

/** Same yellow as a real highlighter pen: marks material highlighted in the CBLM. */
export function HighlightMark({ size = "md" }: { size?: "sm" | "md" }) {
  return (
    <span className={`inline-flex items-center rounded-md bg-mark font-bold text-mark-ink ${size === "sm" ? "px-1.5 py-0.5 text-[10px]" : "px-2 py-1 text-[11px]"}`}>
      Highlighted in CBLM
    </span>
  );
}
