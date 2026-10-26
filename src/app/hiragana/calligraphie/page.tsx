import type { Metadata } from "next";
import { CalligraphyExercise } from "@/components/CalligraphyExercise";
import { PageHeader } from "@/components/PageHeader";

export const metadata: Metadata = { title: "Calligraphie des hiragana" };

export default function HiraganaCalligraphy() {
  return (
    <>
      <PageHeader
        title="Calligraphie"
        subtitle="Choisissez les colonnes, puis tracez chaque kana à la souris, au doigt ou au stylet."
        back={{ href: "/hiragana", label: "Hiragana" }}
      />
      <CalligraphyExercise script="hiragana" />
    </>
  );
}
