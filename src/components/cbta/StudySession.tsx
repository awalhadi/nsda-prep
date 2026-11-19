"use client";

import { useState } from "react";
import Link from "next/link";
import { foundation, type StudyPath } from "@/lib/cbta/foundation";
import { recordPractice } from "@/lib/cbta/progress";

export type SessionTopic = {
  id: string; title: string; bn: string; explanation: string; example: string;
  prompt: string; answer: string; points: string[];
};

export default function StudySession({ topics, path, due, onClose }: {
  topics: SessionTopic[]; path: StudyPath; due: string[]; onClose: () => void;
}) {
  const [index, setIndex] = useState(0);
  const [checked, setChecked] = useState(false);
  const [learned, setLearned] = useState(false);
  const [draft, setDraft] = useState("");
  const topic = topics[index];
  if (!topic) return <section className="study-panel" aria-live="polite">
    <h2 className="text-xl font-bold">আজকের সেশন শেষ</h2>
    <p className="my-3">{topics.length.toLocaleString("bn-BD")}টি টপিকে নিজের উত্তর মিলিয়েছেন।</p>
    <button className="study-primary" onClick={onClose}>পড়ার টেবিলে ফিরি</button>
  </section>;
  const lesson = foundation.find((entry) => entry.id === topic.id);
  const recallFirst = due.includes(topic.id) || path === "weak";
  const showQuestion = recallFirst || learned;
  function finish(correct: boolean) {
    recordPractice(topic.id, "short", correct);
    setIndex(index + 1);
    setLearned(false);
    setChecked(false);
    setDraft("");
  }
  return <section className="study-panel space-y-4" lang="bn">
    <p>এই সেশনে {(index + 1).toLocaleString("bn-BD")} / {topics.length.toLocaleString("bn-BD")}</p>
    <h2 className="text-2xl font-bold">{lesson?.title || topic.bn || topic.title}</h2>
    <strong lang="en">{lesson?.term || topic.title}</strong>
    {!showQuestion ? <>
      <p>{topic.explanation}</p>
      <p className="rounded-xl bg-sand p-4">{lesson?.example || topic.example}</p>
      {topic.id === "rules-of-evidence" && <table className="w-full text-left text-sm">
        <caption className="mb-2 text-left font-bold">প্রমাণ যাচাইয়ের চার প্রশ্ন</caption>
        <tbody>{[["Validity", "যে কাজ চাওয়া হয়েছে সেটিই দেখছি?"], ["Authenticity", "কাজটি তার নিজের?"], ["Sufficiency", "সিদ্ধান্ত নিতে যথেষ্ট প্রমাণ আছে?"], ["Currency", "এখনও কাজটি করতে পারে?"]].map(([term, question]) =>
          <tr key={term} className="border-b border-line"><th scope="row" className="py-2">{term}</th><td>{question}</td></tr>)}</tbody>
      </table>}
      <button className="study-primary" onClick={() => setLearned(true)}>না দেখে বলি</button>
    </> : <>
      <p className="font-bold">{lesson?.prompt || topic.prompt}</p>
      <label className="block">মুখে বলুন বা লিখুন<textarea className="block w-full rounded-xl border border-line p-3" rows={2} value={draft} onChange={(event) => setDraft(event.target.value)} /></label>
      {!checked ? <button className="study-primary" onClick={() => setChecked(true)}>উত্তর মিলিয়ে দেখি</button> : <>
        <p lang="en">{lesson?.answer || topic.answer}</p>
        <ul className="list-disc ps-5">{(lesson?.points || topic.points).map((point) => <li key={point}>{point}</li>)}</ul>
        <p>নিজের উত্তরের সঙ্গে মেলান।</p>
        <div className="flex flex-wrap gap-2">
          <button className="study-primary" onClick={() => finish(true)}>সব মূল কথা বলেছি</button>
          <button className="study-secondary" onClick={() => finish(false)}>আরও অনুশীলন চাই</button>
        </div>
      </>}
    </>}
    <div className="flex flex-wrap gap-4"><Link className="study-secondary" href={`/cbta/concept/${topic.id}`}>পূর্ণ পাঠ খুলুন</Link>
    <button className="underline" onClick={onClose}>সেশন ছাড়ি</button></div>
  </section>;
}
