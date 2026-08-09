"use client";

import Link from "next/link";
import {
  Code2, Palette, Braces, LayoutGrid, PenTool, Wrench, Droplet,
  ClipboardCheck, FileText, Layers, ArrowUpRight,
} from "lucide-react";
import type { ModuleMeta } from "@/data/types";

const ICONS: Record<string, React.ElementType> = {
  Code2, Palette, Braces, LayoutGrid, PenTool, Wrench, Droplet,
  ClipboardCheck, FileText, Layers,
};

export default function ModuleCard({
  mod,
  accuracy,
}: {
  mod: ModuleMeta;
  accuracy: number | null;
}) {
  const Icon = ICONS[mod.icon] ?? Layers;
  const ringColor =
    accuracy === null ? "var(--text-faint)" : accuracy >= 80 ? "var(--accent-teal)" : accuracy >= 50 ? "var(--accent-amber)" : "var(--accent-rose)";

  return (
    <Link
      href={`/module/${mod.id}`}
      className="group relative flex flex-col justify-between rounded-xl border border-border-subtle bg-surface p-4 hover:border-teal/60 hover:bg-surface-2 transition-all"
    >
      <div className="flex items-start justify-between">
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-surface-2 border border-border-subtle text-teal group-hover:scale-105 transition-transform">
          <Icon size={17} />
        </span>
        <ArrowUpRight size={16} className="text-text-faint group-hover:text-teal transition-colors" />
      </div>
      <div className="mt-3">
        <h3 className="font-display font-semibold text-[15px] leading-tight">{mod.title}</h3>
        <p className="font-mono-tag text-[11px] text-text-faint mt-1">
          {mod.count} {mod.kind === "mcq" ? "questions" : "cards"}
        </p>
      </div>
      <div className="mt-3 flex items-center gap-2">
        <div className="h-1.5 flex-1 rounded-full bg-surface-3 overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{
              width: accuracy === null ? "0%" : `${accuracy}%`,
              background: ringColor,
            }}
          />
        </div>
        <span className="font-mono-tag text-[11px] tabular-nums" style={{ color: ringColor }}>
          {accuracy === null ? "—" : `${accuracy}%`}
        </span>
      </div>
    </Link>
  );
}
