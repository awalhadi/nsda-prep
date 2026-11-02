"use client";

import { useEffect, useState } from "react";
import { BookmarkPlus, Check } from "lucide-react";
import { getCbta, markRead, reviseLater } from "@/lib/cbta/progress";

/** Marks the card as read when opened, and lets the learner send it to revision. */
export default function CardActions({ conceptId }: { conceptId: string }) {
  const [queued, setQueued] = useState(false);

  useEffect(() => {
    markRead(conceptId);
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time localStorage hydration on mount
    setQueued(!!getCbta().leitner[conceptId]);
  }, [conceptId]);

  return (
    <button type="button" disabled={queued} onClick={() => { reviseLater(conceptId); setQueued(true); }}
      className="cbta-btn inline-flex min-h-11 items-center gap-2 rounded-xl border-2 border-line border-b-line-strong bg-card px-4 text-[14px] font-bold text-ink-2 hover:bg-paper disabled:opacity-70">
      {queued ? <><Check size={16} className="text-ok" aria-hidden /> In my revision list</> : <><BookmarkPlus size={16} aria-hidden /> Revise later</>}
    </button>
  );
}
