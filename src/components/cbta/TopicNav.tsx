import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { GenTopicRef } from "@/lib/cbta/types";
import { topicHref } from "@/data/cbta/loader";

/** Previous / next topic in CBLM order, so a learner can just keep reading. */
export default function TopicNav({ cblm, prev, next }: { cblm: number; prev: GenTopicRef | null; next: GenTopicRef | null }) {
  const item = (t: GenTopicRef, dir: "prev" | "next") => (
    <Link href={topicHref(cblm, t)}
      className={`flex min-h-16 flex-1 items-center gap-2 rounded-2xl border border-line bg-card p-3.5 hover:border-brand ${dir === "next" ? "justify-end text-right" : ""}`}>
      {dir === "prev" && <ChevronLeft size={20} className="shrink-0 text-ink-3" aria-hidden />}
      <span className="min-w-0">
        <span className="block text-[12px] font-semibold text-ink-3">{dir === "prev" ? "Previous topic" : "Next topic"}</span>
        <span className="line-clamp-2 block text-[15px] font-bold text-ink">{t.title}</span>
      </span>
      {dir === "next" && <ChevronRight size={20} className="shrink-0 text-brand" aria-hidden />}
    </Link>
  );
  return (
    <nav aria-label="More topics" className="flex gap-2.5">
      {prev ? item(prev, "prev") : <span className="flex-1" />}
      {next ? item(next, "next") : (
        <Link href={`/cbta/cblm/${cblm}`} className="flex min-h-16 flex-1 items-center justify-end rounded-2xl border border-line bg-card p-3.5 text-right text-[15px] font-bold text-brand hover:border-brand">
          All topics of CBLM {cblm} →
        </Link>
      )}
    </nav>
  );
}
