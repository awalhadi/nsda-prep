import type { Metadata } from "next";
import Link from "next/link";
import { getCblm, getIndexEntry, lessonGroups } from "@/data/cbta/loader";

import { modules } from "./topics";

export const metadata: Metadata = { title: "Must Know · CBT&A Level 4" };

export default function MustKnowPage() {
  return (
    <main lang="bn" className="mx-auto max-w-4xl space-y-5 px-4 py-7 sm:px-7">
      <header>
        <h1 lang="en" className="text-3xl font-extrabold">Must Know</h1>
        <p className="mt-2 text-ink-2">সময় কম থাকলে ওপর থেকে শুরু করুন। CBT&amp;A Competency Standard (২০১২ V3.1) অনুযায়ী পড়ুন ও কাজগুলো অনুশীলন করুন।</p>
        <Link href="/cbta/guide" className="study-secondary mt-3">Important টপিক</Link>
      </header>

      {modules.map((module) => {
        const { n, topics, practice, cs } = module;
        const cblm = getCblm(n)!;
        const refs = lessonGroups(cblm).flatMap((group) => group.topics);
        return (
          <section key={n} id={`cblm-${n}`} className="study-panel scroll-mt-24">
            <h2 className="text-lg font-bold">CBLM {n} · <span lang="en">{cblm.title}</span></h2>
            <ul className="mt-3 divide-y divide-line">
              {topics.map(([id]) => {
                const topic = getIndexEntry(id)!;
                const titleBn = refs.find((ref) => ref.concept === id)?.title_bn;
                return (
                  <li key={id}>
                    <Link href={`/cbta/concept/${id}`} prefetch={false} className="block rounded-lg py-2 hover:bg-paper">
                      <span className="block font-semibold text-brand-ink" lang={titleBn ? "bn" : "en"}>{titleBn || topic.title}</span>
                      {titleBn && <span className="block text-sm text-ink-2" lang="en">{topic.title}</span>}
                    </Link>
                  </li>
                );
              })}
            </ul>
            <p className="mt-3 text-sm text-ink-2"><strong>করে দেখান।</strong> {practice}</p>
            <details className="mt-3 text-sm text-ink-2">
              <summary className="cursor-pointer font-semibold text-brand">CS ও CBLM রেফারেন্স</summary>
              <p className="mt-2">CS · {cs}</p>
              {"note" in module && <p className="mt-1">{module.note}</p>}
              <ul className="mt-2 space-y-1">
                {topics.map(([id, pages, source]) => (
                  <li key={id}>
                    <span lang="en">{getIndexEntry(id)!.title}</span>
                    {" · "}{source === "reading" ? "মূল পাঠ" : "Highlight"} · পৃ. {pages}
                  </li>
                ))}
              </ul>
            </details>
            <Link href={`/cbta/cblm/${n}`} className="mt-2 inline-flex min-h-11 items-center text-sm font-semibold text-brand">মডিউলের সব টপিক →</Link>
          </section>
        );
      })}
    </main>
  );
}
