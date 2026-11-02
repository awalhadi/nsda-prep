import type { Metadata } from "next";
import ReviseClient from "@/components/cbta/ReviseClient";
import { CONCEPT_INDEX } from "@/data/cbta/loader";

export const metadata: Metadata = { title: "Revise · CBT&A L4" };

export default function RevisePage() {
  return (
    <main className="mx-auto max-w-3xl px-4 pb-20 pt-8 sm:px-6">
      <h1 className="text-[28px] font-extrabold tracking-tight">Revise</h1>
      <p lang="bn" className="mb-6 text-[15px] text-ink-3">যেগুলো ভুল হয়েছে, সেগুলো ঠিক সময়ে আবার ফিরে আসে: ১ দিন, ৩ দিন, ৭ দিন পর।</p>
      <ReviseClient index={CONCEPT_INDEX} />
    </main>
  );
}
