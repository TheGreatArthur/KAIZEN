"use client";

import Link from "next/link";
import type { KanaScript } from "@/domain/character";
import type { ExerciseType } from "@/domain/progress";
import { useProgress } from "@/hooks/useProgress";
import { formatRelative } from "@/lib/format";
import { SoonBadge } from "../Badge";
import { ProgressBar } from "../ProgressBar";

const CARDS: { slug: string; title: string; glyph: string; description: string; exercise?: ExerciseType }[] = [
  { slug: "cours", title: "Cours", glyph: "学", description: "Leçons progressives avec mnémotechniques et exemples." },
  { slug: "lecture", title: "Lecture", glyph: "読", exercise: "reading", description: "Tapez le romaji de chaque kana le plus vite possible." },
  { slug: "calligraphie", title: "Calligraphie", glyph: "書", exercise: "calligraphy", description: "Tracez les kana dans le bon ordre et le bon sens." },
];

export function ExerciseCards({ script }: { script: KanaScript }) {
  const { summary } = useProgress(script);
  return (
    <ul className="grid gap-4 md:grid-cols-3">
      {CARDS.map((card) => {
        if (!card.exercise) {
          return (
            <li key={card.slug}>
              <Link href={`/${script}/${card.slug}`} className="flex h-full flex-col gap-3 rounded-3xl border-2 border-dashed border-line p-6 text-muted hover:bg-card/60">
                <span aria-hidden className="font-jp text-5xl opacity-50">
                  {card.glyph}
                </span>
                <span className="flex items-center gap-2 text-xl font-bold">
                  {card.title} <SoonBadge />
                </span>
                <span className="text-sm">{card.description}</span>
              </Link>
            </li>
          );
        }
        const last = summary?.lastSessionBy[card.exercise];
        return (
          <li key={card.slug}>
            <Link href={`/${script}/${card.slug}`} className="group flex h-full flex-col gap-3 rounded-3xl bg-card p-6 shadow-card transition-transform hover:-translate-y-0.5">
              <span aria-hidden className="font-jp text-5xl text-accent">
                {card.glyph}
              </span>
              <span className="text-xl font-bold">{card.title}</span>
              <span className="text-sm text-muted">{card.description}</span>
              <span className="mt-auto flex flex-col gap-2 pt-2">
                <ProgressBar value={summary?.masteredBy[card.exercise] ?? 0} max={summary?.total ?? 0} label="Kana maîtrisés" />
                <span className="text-xs text-muted">
                  Dernière session :{" "}
                  {last ? `${formatRelative(last.startedAt)}${last.total ? ` · ${last.correct}/${last.total}` : ""}` : "aucune"}
                </span>
              </span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
