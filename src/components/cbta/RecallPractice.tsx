"use client";

import { useState } from "react";

export default function RecallPractice({ id, prompt, answer }: { id: string; prompt: string; answer: string }) {
  const [revealed, setRevealed] = useState(false);
  const [draft, setDraft] = useState("");
  return (
    <section className="rounded-2xl border-2 border-brand bg-card p-5 sm:p-6" aria-labelledby={`recall-${id}`}>
      <h2 id={`recall-${id}`} lang="bn" className="text-lg font-extrabold">না দেখে মনে করুন</h2>
      <p lang="bn" className="mt-1 text-ink-2">বই বন্ধ করে নিজের ভাষায় মূল কথাটি বলুন বা লিখুন। তারপর উত্তর মিলিয়ে দেখুন।</p>
      <p className="mt-3 font-semibold">{prompt}</p>
      <label htmlFor={`draft-${id}`} lang="bn" className="mt-3 block text-sm font-semibold">আমার উত্তর (বাংলা বা English)</label>
      <textarea id={`draft-${id}`} value={draft} onChange={(e) => setDraft(e.target.value)} rows={3} className="mt-1 w-full rounded-xl border border-line bg-paper p-3 text-base focus-visible:outline-2 focus-visible:outline-brand" />
      <button type="button" aria-expanded={revealed} aria-controls={`model-${id}`} onClick={() => setRevealed(!revealed)} className="mt-2 min-h-11 rounded-xl bg-brand px-4 py-2 font-bold text-white">{revealed ? "উত্তর লুকাই" : "উত্তর মিলিয়ে দেখি"}</button>
      {revealed && <div id={`model-${id}`} className="mt-3 rounded-xl bg-brand-soft p-4">
        <p>{answer}</p>
        <p lang="bn" className="mt-2 text-sm text-ink-2">মূল বিষয়গুলো আছে কি? কিছু বাদ গেলে আবার বলুন। এটি নিজে যাচাই করার অনুশীলন; নম্বর দেওয়া হচ্ছে না।</p>
      </div>}
      <p lang="bn" className="mt-3 text-sm text-ink-3">এই লেখাটি সংরক্ষিত হয় না। আজ পড়ুন, আগামীকাল আবার মনে করুন, ৩ দিন পরে আবার যাচাই করুন।</p>
    </section>
  );
}
