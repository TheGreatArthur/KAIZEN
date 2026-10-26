import type { Metadata } from "next";
import { ExerciseCards } from "@/components/hub/ExerciseCards";
import { PageHeader } from "@/components/PageHeader";

export const metadata: Metadata = { title: "Hiragana" };

export default function HiraganaHub() {
  return (
    <>
      <PageHeader
        title="Hiragana ひらがな"
        subtitle="Le premier alphabet japonais : 46 kana de base, leurs variantes avec dakuten et les combinaisons."
        back={{ href: "/", label: "Accueil" }}
      />
      <ExerciseCards script="hiragana" />
    </>
  );
}
