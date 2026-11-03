// A topic page. Kept deliberately short and in one fixed order, so a learner reads it
// top to bottom: what to write → Bangla → picture/list → example → cautions → test.
// Colour carries meaning only: green = what to write, sand = Bangla help, red = cautions.

import type { ReactNode } from "react";
import { AlertTriangle, Brain, Factory, GraduationCap, ListOrdered, MessageCircle, PenLine } from "lucide-react";
import type { GenConcept } from "@/lib/cbta/types";
import PracticeTabs from "./PracticeTabs";
import SourcesFooter from "./SourcesFooter";
import { GuideBlockView, VisualBlock } from "./guide/Blocks";

function Box({ Icon, title, titleBn, children }: { Icon: typeof PenLine; title: string; titleBn?: string; children: ReactNode }) {
  return (
    <section className="rounded-2xl border border-line bg-card p-5 sm:p-6">
      <h2 className="mb-3 flex flex-wrap items-center gap-2 text-[13px] font-bold uppercase tracking-[0.08em] text-ink-3">
        <Icon size={17} aria-hidden /> {title}
        {titleBn && <span lang="bn" className="normal-case tracking-normal">· {titleBn}</span>}
      </h2>
      {children}
    </section>
  );
}

/** "Head: description" → ["Head", "description"] */
function splitHead(text: string): [string, string] {
  const i = text.indexOf(":");
  return i > 0 && i < 60 ? [text.slice(0, i), text.slice(i + 1).trim()] : [text, ""];
}

/** Letters of a mnemonic like "… → E-S-I-E-A-P (top to bottom)". */
function mnemonicLetters(text: string): string[] | null {
  const m = /→\s*([A-Z](?:\s*-\s*[A-Z])+)/.exec(text);
  return m ? m[1].split("-").map((s) => s.trim()) : null;
}

export default function ConceptCard({ c, place }: { c: GenConcept; place?: { index: number; total: number } | null }) {
  const letters = c.mnemonic ? mnemonicLetters(c.mnemonic.text) : null;
  const tiles = letters && c.listAnswer && letters.length === c.listAnswer.items.length
    ? letters.map((l, i) => ({ l, word: splitHead(c.listAnswer!.items[i].text)[0].split(/[\s(]/)[0] }))
    : null;
  const mnemonicPhrase = c.mnemonic?.text.split("→")[0].trim().replace(/^"|"$/g, "");
  // A flow picture of the same steps already is the list; don't show it twice.
  const showList = c.listAnswer && !(c.visual?.kind === "steps" && c.visual.items.length === c.listAnswer.items.length);

  return (
    <article className="space-y-3.5 text-[16px] leading-relaxed text-ink sm:text-[17px]">
      <header className="px-1 pt-1">
        <p className="text-[13px] font-semibold text-ink-3">
          CBLM {c.cblmPrimary}{place ? ` · Topic ${place.index + 1} of ${place.total}` : ""}
        </p>
        <h1 className="mt-1 text-[28px] font-extrabold leading-tight tracking-tight sm:text-[34px]">{c.title}</h1>
      </header>

      {/* What to write */}
      <section className="rounded-2xl border-2 border-brand/30 bg-brand-soft p-5 sm:p-6">
        <h2 className="mb-2 flex flex-wrap items-center gap-2 text-[13px] font-bold uppercase tracking-[0.08em] text-brand-ink">
          <PenLine size={17} aria-hidden /> Write this in the exam <span lang="bn" className="normal-case tracking-normal opacity-80">· পরীক্ষায় লিখুন</span>
        </h2>
        <p className="text-[20px] font-bold leading-snug sm:text-[23px]">{c.oneLineAnswer.text}</p>
      </section>

      {/* Bangla */}
      <section className="rounded-2xl border border-sand-line bg-sand p-5 sm:p-6">
        <h2 className="mb-2.5 flex items-center gap-2 text-[#8a5a00]">
          <MessageCircle size={17} aria-hidden /> <span lang="bn" className="text-[16px] font-bold">বাংলায় বুঝি</span>
        </h2>
        <ul className="space-y-2">
          {c.banglaExplanation.map((l, i) => <li key={i} lang="bn" className="text-[17px]">{l}</li>)}
        </ul>
        <p className="mt-3 flex flex-wrap gap-1.5">
          {c.keywords.map((k) => (
            <span key={k.en} className="rounded-full bg-card px-2.5 py-1 text-[13px] ring-1 ring-sand-line">
              <strong>{k.en}</strong> <span lang="bn" className="text-ink-2">= {k.bn}</span>
            </span>
          ))}
        </p>
      </section>

      {c.visual && (
        <Box Icon={ListOrdered} title="Picture" titleBn="ছবিতে বুঝি"><VisualBlock b={c.visual} /></Box>
      )}

      {showList && c.listAnswer && (
        <section className="rounded-2xl border border-line bg-card p-5 sm:p-6">
          <h2 className="mb-3.5">
            <span className="flex items-center gap-2 text-[17.5px] font-extrabold leading-snug text-ink">
              <ListOrdered size={18} className="shrink-0 text-ink-3" aria-hidden />
              {c.listAnswer.title ?? "Remember the list"} ({c.listAnswer.items.length})
            </span>
            {c.listAnswer.titleBn && <span lang="bn" className="mt-0.5 block pl-[26px] text-[15px] font-medium text-ink-2">{c.listAnswer.titleBn}</span>}
          </h2>
          <ol className="space-y-3">
            {c.listAnswer.items.map((it, i) => {
              const [head, rest] = splitHead(it.text);
              return (
                <li key={i} className="flex gap-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-ink text-[13px] font-bold text-white">{i + 1}</span>
                  <span className="min-w-0">
                    <span className="block"><strong>{head}</strong>{rest && <span className="text-ink-2"> · {rest}</span>}</span>
                    {c.listAnswer!.itemsBn[i] && <span lang="bn" className="mt-0.5 block text-[15.5px] text-[#7a4f00]">{c.listAnswer!.itemsBn[i]}</span>}
                  </span>
                </li>
              );
            })}
          </ol>
        </section>
      )}

      {c.mnemonic && (
        <Box Icon={Brain} title="Memory trick" titleBn="মনে রাখার কৌশল">
          {tiles && (
            <div className="mb-3 grid gap-1.5" style={{ gridTemplateColumns: `repeat(${tiles.length}, minmax(0, 1fr))` }}>
              {tiles.map((t, i) => (
                <div key={i} className="flex flex-col items-center rounded-xl border border-line bg-paper px-1 pb-2 pt-2.5 text-center">
                  <span className="text-2xl font-extrabold text-brand">{t.l}</span>
                  <span className="mt-0.5 line-clamp-2 text-[10.5px] font-medium leading-tight text-ink-3">{t.word}</span>
                </div>
              ))}
            </div>
          )}
          <p className="text-lg font-bold">{mnemonicPhrase}</p>
          {c.mnemonic.explain_bn && <p lang="bn" className="mt-1 text-[15.5px] text-ink-2">{c.mnemonic.explain_bn}</p>}
        </Box>
      )}

      <Box Icon={Factory} title="Example" titleBn="উদাহরণ">
        <p>{c.example.en}</p>
        {c.example.bn && <p lang="bn" className="mt-2 text-[15.5px] text-ink-2">{c.example.bn}</p>}
      </Box>

      {c.extra.length > 0 && (
        <section className="space-y-5 rounded-2xl border border-line bg-card p-5 sm:p-6">
          <h2 className="text-[13px] font-bold uppercase tracking-[0.08em] text-ink-3">More from the CBLM <span lang="bn" className="normal-case tracking-normal">· আরও বিস্তারিত</span></h2>
          {c.extra.map((b, i) => <GuideBlockView key={i} b={b} />)}
        </section>
      )}

      {/* Cautions */}
      <section className="rounded-2xl border border-danger-line bg-danger-soft p-5 sm:p-6">
        <h2 className="mb-2.5 flex items-center gap-2 text-danger">
          <AlertTriangle size={17} aria-hidden /> <span lang="bn" className="text-[16px] font-bold">সাবধান</span>
          <span className="text-[13px] font-semibold opacity-80">· common mistakes</span>
        </h2>
        <ul className="space-y-2">
          {c.traps.map((t, i) => <li key={i} className="flex gap-2.5"><span className="font-bold text-danger" aria-hidden>!</span>{t.text}</li>)}
          {c.errata.map((e) => (
            <li key={e.id} className="rounded-xl bg-card p-3 text-[15px] ring-1 ring-danger-line">
              <strong className="text-danger">The CBLM answer key is wrong here.</strong> {e.issue} <strong>Write:</strong> {e.proposed}
            </li>
          ))}
        </ul>
      </section>

      {/* Test yourself: closed until the learner asks for it */}
      <details className="group rounded-2xl border-2 border-brand border-b-4 bg-card">
        <summary className="flex min-h-14 cursor-pointer list-none items-center gap-2 px-5 text-[17px] font-extrabold text-brand-ink">
          <GraduationCap size={20} aria-hidden /> Test yourself <span lang="bn" className="text-[14px] font-semibold">· নিজেকে যাচাই</span>
          <span className="ml-auto text-[13px] font-semibold group-open:hidden">Open</span>
        </summary>
        <div className="border-t border-line p-5 sm:p-6">
          <PracticeTabs practice={c.practice} conceptId={c.id} />
          {c.realQuestions.length > 0 && (
            <details className="mt-5 rounded-xl border border-line">
              <summary className="flex min-h-11 cursor-pointer list-none items-center px-4 text-[14px] font-bold">Asked before in exams ({c.realQuestions.length})</summary>
              <ul className="divide-y divide-line border-t border-line">
                {c.realQuestions.map((q) => (
                  <li key={q.id} className="px-4 py-3">
                    <p className="font-semibold">{q.question}</p>
                    {q.options && (
                      <ol className="mt-1 list-[upper-alpha] pl-6 text-[15px] text-ink-2">
                        {q.options.map((o, i) => <li key={i} className={q.answerIndex === i ? "font-semibold text-ok" : ""}>{o}</li>)}
                      </ol>
                    )}
                    {q.answer && <p className="mt-1 whitespace-pre-line text-[15px] text-ink-2"><strong>Answer:</strong> {q.answer}</p>}
                  </li>
                ))}
              </ul>
            </details>
          )}
        </div>
      </details>

      <SourcesFooter from={[c.oneLineAnswer, c.listAnswer, c.traps, c.visual, c.extra]} />
    </article>
  );
}
