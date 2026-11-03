import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { CBLMS, getGuide } from "@/data/cbta/loader";

/** Static params for the per-CBLM extras (self checks, practice, last-minute): CBLMs with a guide. */
export function guideParams() {
  return CBLMS.filter((c) => getGuide(c.n)).map((c) => ({ n: String(c.n) }));
}

export default function ExtraPage({ cblm, title, titleBn, intro, children }: { cblm: number; title: string; titleBn: string; intro?: string; children: ReactNode }) {
  return (
    <main className="mx-auto max-w-3xl space-y-4 px-4 pb-20 pt-4 text-ink sm:px-6">
      <Link href={`/cbta/cblm/${cblm}`} className="inline-flex min-h-11 items-center gap-1.5 text-sm font-semibold text-ink-3 hover:text-brand">
        <ArrowLeft size={15} aria-hidden /> All topics of CBLM {cblm}
      </Link>
      <header className="px-1">
        <p className="text-[13px] font-semibold text-ink-3">CBLM {cblm}</p>
        <h1 className="mt-1 text-[28px] font-extrabold leading-tight tracking-tight sm:text-[34px]">{title}</h1>
        <p lang="bn" className="mt-1 text-[16px] text-ink-2">{titleBn}</p>
        {intro && <p className="mt-2 text-[14px] text-ink-3">{intro}</p>}
      </header>
      {children}
    </main>
  );
}
