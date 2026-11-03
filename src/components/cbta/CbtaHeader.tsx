import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

export default function CbtaHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-paper/90 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4 sm:px-6">
        <Link href="/cbta" className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand text-[13px] font-extrabold text-white">L4</span>
          <span className="leading-tight">
            <span className="block text-[15px] font-extrabold tracking-tight text-ink">CBT&amp;A Prep</span>
            <span lang="bn" className="block text-[11px] text-ink-3">একবার পড়ুন, মনে রাখুন</span>
          </span>
        </Link>
        <nav className="flex items-center gap-0.5 text-sm font-semibold sm:gap-1">
          <Link href="/cbta" className="rounded-lg px-2.5 py-2 text-ink-2 hover:bg-card hover:text-ink sm:px-3">Home</Link>
          <Link href="/cbta/revise" className="rounded-lg px-2.5 py-2 text-ink-2 hover:bg-card hover:text-ink sm:px-3">Revise</Link>
          <Link href="/cbta/mock" className="rounded-lg px-2.5 py-2 text-ink-2 hover:bg-card hover:text-ink sm:px-3">Mock exam</Link>
          <Link href="/" className="hidden items-center gap-1 rounded-lg px-3 py-2 text-ink-3 hover:bg-card hover:text-ink md:inline-flex">
            Main app <ArrowUpRight size={14} aria-hidden />
          </Link>
        </nav>
      </div>
    </header>
  );
}
