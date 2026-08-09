import { notFound } from "next/navigation";
import TopNav from "@/components/TopNav";
import FlashcardsClient from "@/components/FlashcardsClient";
import { getModuleMeta, getModuleQuestions } from "@/data/loader";
import type { CardQuestion } from "@/data/types";

export default async function FlashcardsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const mod = getModuleMeta(id);
  if (!mod || mod.kind !== "flashcards") return notFound();

  const cards = getModuleQuestions(id) as CardQuestion[];

  return (
    <>
      <TopNav />
      <FlashcardsClient moduleId={mod.id} moduleTitle={mod.title} allCards={cards} />
    </>
  );
}
