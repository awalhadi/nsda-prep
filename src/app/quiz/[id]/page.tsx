import { notFound } from "next/navigation";
import TopNav from "@/components/TopNav";
import QuizClient from "@/components/QuizClient";
import { getModuleMeta, getModuleQuestions } from "@/data/loader";
import type { MCQQuestion } from "@/data/types";

export default async function QuizPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ count?: string; timed?: string; spq?: string; r?: string }>;
}) {
  const { id } = await params;
  const sp = await searchParams;
  const mod = getModuleMeta(id);
  if (!mod || mod.kind !== "mcq") return notFound();

  const questions = getModuleQuestions(id) as MCQQuestion[];
  const count = Math.min(parseInt(sp.count ?? "15", 10) || 15, questions.length);
  const timed = sp.timed !== "0";
  const secondsPerQuestion = parseInt(sp.spq ?? "30", 10) || 30;

  return (
    <>
      <TopNav />
      <QuizClient
        key={sp.r ?? "0"}
        moduleId={mod.id}
        moduleTitle={mod.title}
        allQuestions={questions}
        count={count}
        timed={timed}
        secondsPerQuestion={secondsPerQuestion}
      />
    </>
  );
}
