"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { RotateCcw } from "lucide-react";
import { dueConcepts, getCbta } from "@/lib/cbta/progress";

/** One line, only when something is due: "3 topics to revise today". */
export default function DueToday() {
  const [due, setDue] = useState(0);
  useEffect(() => {
    const load = () => setDue(dueConcepts(getCbta()).length);
    load();
    window.addEventListener("cbta-progress", load);
    return () => window.removeEventListener("cbta-progress", load);
  }, []);
  if (!due) return null;
  return (
    <Link href="/cbta/revise" className="flex min-h-13 items-center gap-3 rounded-2xl bg-hot-soft px-4 py-3 text-hot">
      <RotateCcw size={19} aria-hidden />
      <span className="font-bold">{due} topic{due > 1 ? "s" : ""} to revise today</span>
      <span lang="bn" className="ml-auto text-[14px]">আজকের revision →</span>
    </Link>
  );
}
