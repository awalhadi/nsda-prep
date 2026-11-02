import Link from "next/link";

export default function OfflinePage() {
  return (
    <main className="mx-auto max-w-xl px-4 pb-20 pt-16 text-center sm:px-6">
      <h1 className="text-[26px] font-extrabold">You are offline</h1>
      <p lang="bn" className="mt-3 text-[16px] text-ink-2">এই পাতাটি এখনো ফোনে সেভ করা হয়নি। ইন্টারনেট পেলে হোম পেজের “Download for offline use” চাপুন, তাহলে সব কার্ড অফলাইনেও পড়া যাবে।</p>
      <Link href="/cbta" className="mt-6 inline-block font-bold text-brand underline underline-offset-4">Go to the home page</Link>
    </main>
  );
}
