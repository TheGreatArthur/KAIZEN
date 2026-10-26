import type { Metadata } from "next";
import { PageHeader } from "@/components/PageHeader";
import { ReadingExercise } from "@/components/ReadingExercise";

export const metadata: Metadata = { title: "Lecture des hiragana" };

export default function HiraganaReading() {
  return (
    <>
      <PageHeader
        title="Lecture"
        subtitle="Choisissez les colonnes à réviser, puis tapez le romaji de chaque kana. La réponse est validée dès qu'elle est correcte."
        back={{ href: "/hiragana", label: "Hiragana" }}
      />
      <ReadingExercise script="hiragana" />
    </>
  );
}
