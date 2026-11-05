import type { Script } from "@/domain/character";

export interface ScriptInfo {
  id: Script;
  label: string;
  glyph: string;
  href: string;
  available: boolean;
  description: string;
}

export const SCRIPTS: ScriptInfo[] = [
  { id: "hiragana", label: "Hiragana", glyph: "あ", href: "/hiragana", available: true, description: "L'alphabet de base : 46 kana, dakuten et combinaisons." },
  { id: "katakana", label: "Katakana", glyph: "ア", href: "/katakana", available: false, description: "Pour les mots étrangers et les onomatopées." },
  { id: "kanji", label: "Kanji", glyph: "字", href: "/kanji", available: false, description: "Les idéogrammes, par niveau JLPT." },
];

export type ExerciseSlug = "cours" | "lecture" | "calligraphie";

export const EXERCISE_LABELS: Record<ExerciseSlug, string> = {
  cours: "Cours",
  lecture: "Lecture",
  calligraphie: "Calligraphie",
};

export const EXERCISE_SLUG = { reading: "lecture", calligraphy: "calligraphie" } as const;
