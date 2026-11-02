import type { Metadata } from "next";
import MockClient from "@/components/cbta/MockClient";
import { CBLMS } from "@/data/cbta/loader";

export const metadata: Metadata = { title: "Mock exam · CBT&A L4" };

export default function MockPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 pb-20 pt-8 sm:px-6">
      <h1 className="text-[28px] font-extrabold tracking-tight">Mock exam</h1>
      <p lang="bn" className="mb-6 text-[15px] text-ink-3">আসল পরীক্ষার মতো: ১০টি MCQ, ৫টি matching, ১০টি short question, ৬০ মিনিট।</p>
      <MockClient cblms={CBLMS.map((c) => ({ n: c.n, title: c.title, ready: c.conceptIds.length > 0 }))} />
    </main>
  );
}
