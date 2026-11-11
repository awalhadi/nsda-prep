import type { Metadata } from "next";
import Link from "next/link";
import { getCblm, getIndexEntry, lessonGroups } from "@/data/cbta/loader";

export const metadata: Metadata = { title: "Must Know · CBT&A Level 4" };

// Study order follows the workflow from reading standards to assessing a candidate.
const modules = [
  { n: 8, ids: ["industry-competency-standards", "learning-outcome-vs-element", "assessment-vs-performance-criteria", "parts-of-cblm"], practice: "একটি unit থেকে learning outcome লিখুন এবং উপযুক্ত learning material বাছুন।" },
  { n: 9, ids: ["competency-standard-components", "curriculum-document", "session-plan", "session-plan-steps"], practice: "Curriculum দেখে একটি training session-এর উদ্দেশ্য, কাজ ও সময় লিখুন।" },
  { n: 11, ids: ["analysing-standards-for-evidence", "assessment-plan", "oral-questioning-tool"], practice: "একটি criterion থেকে evidence requirement বের করে একটি oral question তৈরি করুন।" },
  { n: 12, ids: ["forms-of-evidence", "rules-of-evidence", "reasonable-adjustment", "assessment-decision", "recording-reporting", "effective-feedback"], practice: "নমুনা evidence যাচাই করুন, সিদ্ধান্ত রেকর্ড করুন এবং feedback দিন।" },
  { n: 3, ids: ["hazard-management-process", "risk-matrix", "hierarchy-of-controls"], practice: "একটি workshop hazard-এর ঝুঁকি নির্ধারণ করে control বাছুন।" },
  { n: 1, ids: ["ntvqf-levels", "recognition-of-prior-learning", "quality-assurance-framework"], practice: "NTVQF, RPL ও quality assurance-এর কাজ একটি করে উদাহরণ দিয়ে বোঝান।" },
  { n: 2, ids: ["principles-of-inclusivity", "support-for-special-needs", "inclusive-communication-skills"], practice: "একজন শিক্ষার্থীর অংশগ্রহণের বাধা শনাক্ত করে training-এ কী পরিবর্তন করবেন বলুন।" },
  { n: 5, ids: ["assessing-own-professional-skills", "professional-development-plan"], practice: "নিজের একটি skill gap চিহ্নিত করে professional development plan লিখুন।" },
  { n: 6, ids: ["maintenance-activities", "preventive-corrective-maintenance", "equipment-maintenance-schedule"], practice: "একটি যন্ত্রের maintenance schedule বানিয়ে কখন preventive ও corrective কাজ করবেন দেখান।" },
  { n: 7, ids: ["technical-self-assessment", "technical-competency-development-plan", "prove-technical-competency"], practice: "একটি technical skill gap, উন্নতির কাজ এবং দক্ষতা অর্জনের প্রমাণ লিখুন।" },
  { n: 10, ids: ["skill-demonstration", "checking-learner-needs-understanding", "effective-feedback-characteristics"], practice: "একটি দক্ষতা দেখান, শিক্ষার্থীকে করতে দিন এবং তার কাজ দেখে feedback দিন।" },
  { n: 4, ids: ["ms-word-bullets-merge-cells", "workbook-worksheet-animation-transition"], practice: "একটি Word টেবিল বানান এবং workbook, worksheet, animation ও transition-এর পার্থক্য বোঝান।" },
];

export default function MustKnowPage() {
  return (
    <main lang="bn" className="mx-auto max-w-4xl space-y-5 px-4 py-7 sm:px-7">
      <header>
        <h1 lang="en" className="text-3xl font-extrabold">Must Know</h1>
        <p className="mt-2 text-ink-2">সময় কম থাকলে ওপর থেকে শুরু করুন। বর্তমান CBLM ও প্রশ্নের প্রমাণ ধরে এই প্রস্তুতির তালিকা সাজানো হয়েছে। পূর্ণ CBT&amp;A CS-এর সঙ্গে যাচাই বাকি।</p>
        <Link href="/cbta/guide" className="study-secondary mt-3">Important টপিক</Link>
      </header>

      {modules.map(({ n, ids, practice }) => {
        const cblm = getCblm(n)!;
        const refs = lessonGroups(cblm).flatMap((group) => group.topics);
        return (
          <section key={n} id={`cblm-${n}`} className="study-panel scroll-mt-24">
            <h2 className="text-lg font-bold">CBLM {n} · <span lang="en">{cblm.title}</span></h2>
            {!cblm.hasPdf && <p className="mt-2 text-sm text-ink-2">এই মডিউলের CBLM PDF অ্যাপে নেই। টপিকগুলো বর্তমান প্রশ্নভিত্তিক নোট থেকে নেওয়া।</p>}
            <ul className="mt-3 divide-y divide-line">
              {ids.map((id) => {
                const topic = getIndexEntry(id)!;
                const titleBn = refs.find((ref) => ref.concept === id)?.title_bn;
                return (
                  <li key={id}>
                    <Link href={`/cbta/concept/${id}`} prefetch={false} className="block rounded-lg py-2 hover:bg-paper">
                      <span className="block font-semibold text-brand-ink" lang={titleBn ? "bn" : "en"}>{titleBn || topic.title}</span>
                      {titleBn && <span className="block text-sm text-ink-2" lang="en">{topic.title}</span>}
                      {(topic.highlighted || topic.asked > 0) && (
                        <span className="block text-xs text-ink-3">
                          {[topic.highlighted && "CBLM highlight আছে", topic.asked > 0 && `${topic.asked}টি যুক্ত প্রশ্ন বা Self Check`].filter(Boolean).join(" · ")}
                        </span>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
            <p className="mt-3 text-sm text-ink-2"><strong>অনুশীলন করুন।</strong> {practice}</p>
            <Link href={`/cbta/cblm/${n}`} className="mt-2 inline-flex min-h-11 items-center text-sm font-semibold text-brand">মডিউলের সব টপিক →</Link>
          </section>
        );
      })}
    </main>
  );
}
