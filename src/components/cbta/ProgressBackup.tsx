"use client";

import { useState } from "react";
import { z } from "zod";
import { getCbta, migrateCbta, updateCbta } from "@/lib/cbta/progress";

const day = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);
const counts = z.tuple([z.number().int().nonnegative(), z.number().int().nonnegative()]);
const backup = z.object({
  course: z.literal("cbta"),
  progress: z.object({
    v: z.literal(1),
    read: z.record(z.string(), day),
    mastered: z.record(z.string(), day),
    leitner: z.record(z.string(), z.object({ box: z.union([z.literal(1), z.literal(2), z.literal(3)]), due: day, last: day })),
    attempts: z.array(z.object({ conceptId: z.string(), questionId: z.number().int().positive().optional(), kind: z.enum(["mcq", "short", "matching", "viva", "mock", "revise"]), correct: z.boolean(), at: z.iso.datetime() })).max(3000),
    mocks: z.array(z.object({ at: z.iso.datetime(), scope: z.string(), minutes: z.number(), weak: z.array(z.string()), score: z.object({ mcq: counts, matching: counts, short: counts }) })).max(50),
  }),
});

export default function ProgressBackup() {
  const [status, setStatus] = useState("");
  const [pending, setPending] = useState<ReturnType<typeof getCbta> | null>(null);
  function download() {
    const url = URL.createObjectURL(new Blob([JSON.stringify({ course: "cbta", progress: getCbta() })], { type: "application/json" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = "cbta-progress.json";
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  async function read(file?: File) {
    setPending(null);
    setStatus("");
    if (!file) return;
    try {
      const data = backup.parse(JSON.parse(await file.text()));
      setPending(migrateCbta(data.progress));
    } catch {
      setStatus("এই ফাইল থেকে অগ্রগতি পড়া যায়নি। CBT&A backup বেছে নিন।");
    }
  }
  return <details className="study-panel">
    <summary className="cursor-pointer font-bold">CBT&amp;A অগ্রগতির ব্যাকআপ</summary>
    <div className="mt-3 space-y-3">
      <button className="study-secondary" onClick={download}>ব্যাকআপ ডাউনলোড</button>
      <label className="block">আগের ব্যাকআপ খুলুন<input className="block max-w-full" type="file" accept=".json" onChange={(e) => void read(e.target.files?.[0])} /></label>
      {pending && <div><p>এই ডিভাইসের CBT&amp;A অগ্রগতির জায়গায় ব্যাকআপের {pending.attempts.length}টি অনুশীলন রেকর্ড বসবে।</p>
        <button className="study-secondary" onClick={() => { updateCbta(() => pending); setPending(null); setStatus(JSON.stringify(getCbta()) === JSON.stringify(pending) ? "অগ্রগতি ফিরিয়ে আনা হয়েছে।" : "অগ্রগতি সংরক্ষণ করা যায়নি।"); }}>এই ব্যাকআপ ব্যবহার করি</button></div>}
      <p role="status">{status}</p>
    </div>
  </details>;
}
