import { CBLMS, CONCEPT_INDEX, getConcept } from "./loader";

const index = new Map(CONCEPT_INDEX.map((topic) => [topic.id, topic]));
const memberships = new Map<string, number[]>();

for (const cblm of CBLMS) {
  for (const id of new Set(cblm.conceptIds)) {
    memberships.set(id, [...(memberships.get(id) ?? []), cblm.n]);
  }
}

const paperIds = new Map(CONCEPT_INDEX.map(({ id }) => [
  id,
  new Set(getConcept(id)?.realQuestions.filter((q) => q.kind === "paper").map((q) => q.id)),
]));

export const studyModules = CBLMS.map((cblm) => {
  const topics = [...new Set(cblm.conceptIds)].flatMap((id) => {
    const topic = index.get(id);
    return topic ? [topic] : [];
  });
  topics.sort((a, b) => b.score - a.score || a.title.localeCompare(b.title));

  const shared = topics.filter((topic) => (memberships.get(topic.id)?.length ?? 0) > 1);
  const overlaps = CBLMS.filter((other) => other.n !== cblm.n)
    .map((other) => ({
      n: other.n,
      total: new Set(other.conceptIds).size,
      topics: shared.filter((topic) => memberships.get(topic.id)?.includes(other.n)),
    }))
    .filter((other) => other.topics.length)
    .sort((a, b) => b.topics.length - a.topics.length || a.n - b.n);

  return {
    n: cblm.n,
    topics,
    shared,
    overlaps,
    papers: new Set(topics.flatMap((topic) => [...(paperIds.get(topic.id) ?? [])])).size,
  };
});

export const byQuestionEvidence = [...studyModules]
  .sort((a, b) => b.papers - a.papers || a.n - b.n);

export const bySharedTopics = [...studyModules]
  .sort((a, b) => b.shared.length - a.shared.length || a.n - b.n);

export const moduleIntroductions: Record<number, { title: string; goal: string }> = {
  1: { title: "TVET ও দক্ষতার ভিত্তি", goal: "বাংলাদেশের দক্ষতা প্রশিক্ষণ ব্যবস্থা, যোগ্যতার মান এবং প্রশিক্ষকের কাজ বুঝবেন।" },
  2: { title: "সব শিক্ষার্থীর জন্য প্রশিক্ষণ", goal: "শিক্ষার্থীর বাধা চিনে ভাষা, উপকরণ ও শেখানোর পদ্ধতি মানিয়ে নিতে শিখবেন।" },
  3: { title: "কর্মক্ষেত্রের নিরাপত্তা", goal: "বিপদ চেনা, ঝুঁকি মাপা এবং নিরাপদ কাজের ব্যবস্থা করা শিখবেন।" },
  4: { title: "প্রশিক্ষণে কম্পিউটারের ব্যবহার", goal: "প্রশিক্ষণের নথি, হিসাব ও উপস্থাপনায় সাধারণ কম্পিউটার টুল ব্যবহার বুঝবেন।" },
  5: { title: "প্রশিক্ষক হিসেবে উন্নতি", goal: "নিজের কাজ পর্যালোচনা, মতামত নেওয়া এবং পেশাগত উন্নতির পরিকল্পনা করতে শিখবেন।" },
  6: { title: "যন্ত্রপাতি ও কর্মশালার যত্ন", goal: "প্রশিক্ষণের সরঞ্জাম, কর্মশালা ও রক্ষণাবেক্ষণের কাজ পরিকল্পনা করতে শিখবেন।" },
  7: { title: "নিজের কারিগরি দক্ষতা", goal: "নিজের কারিগরি দক্ষতার ঘাটতি চিহ্নিত করে শেখা ও অনুশীলনের পথ ঠিক করবেন।" },
  8: { title: "শেখার উপকরণ তৈরি", goal: "দক্ষতার মান থেকে শিক্ষার্থীর জন্য ব্যবহারযোগ্য শেখার উপকরণ তৈরি ও বদলাতে শিখবেন।" },
  9: { title: "ক্লাসের পরিকল্পনা", goal: "শেখার লক্ষ্য, সময়, উপকরণ ও কাজ ঠিক করে একটি প্রশিক্ষণ সেশন সাজাতে শিখবেন।" },
  10: { title: "ক্লাস নেওয়া", goal: "কাজ দেখানো, শিক্ষার্থীদের অনুশীলন করানো এবং শেখার অগ্রগতি যাচাই করতে শিখবেন।" },
  11: { title: "মূল্যায়ন তৈরি", goal: "দক্ষতার মান দেখে কী প্রমাণ লাগবে, কীভাবে তা নেবেন এবং কোন টুল বানাবেন তা শিখবেন।" },
  12: { title: "মূল্যায়ন নেওয়া", goal: "প্রার্থীকে প্রস্তুত করা, প্রমাণ যাচাই, সিদ্ধান্ত, ফল জানানো ও রেকর্ড রাখা শিখবেন।" },
};

export function combinedCoverage(numbers: number[]) {
  const selected = studyModules.filter((cblm) => numbers.includes(cblm.n));
  const ids = new Set(selected.flatMap((cblm) => cblm.topics.map((topic) => topic.id)));
  const outside = new Set(studyModules
    .filter((cblm) => !numbers.includes(cblm.n))
    .flatMap((cblm) => cblm.topics.filter((topic) => ids.has(topic.id)).map((topic) => topic.id)));

  return { numbers, total: ids.size, outside: outside.size };
}

export const reusePair = studyModules.flatMap((first, i) => studyModules.slice(i + 1)
  .map((second) => combinedCoverage([first.n, second.n])))
  .sort((a, b) => b.outside - a.outside || a.total - b.total)[0];
