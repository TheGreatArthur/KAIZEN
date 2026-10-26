"use client";

import { type KeyboardEvent, useEffect, useRef, useState } from "react";
import type { Character } from "@/domain/character";
import { formatDuration, nextPendingIndex, type QuizCardState } from "@/services/quiz";
import { isCorrectAnswer, normalizeRomaji, shouldAutoValidate } from "@/services/romaji";
import { QuizCard } from "./QuizCard";

export interface QuizOutcome {
  cards: QuizCardState[];
  durationMs: number;
}

interface QuizGridProps {
  /** Characters in display order (already shuffled). */
  characters: Character[];
  onAnswer: (character: Character, correct: boolean, answer: string) => void;
  onFinish: (outcome: QuizOutcome) => void;
  onRestart: () => void;
  onBack: () => void;
}

export function QuizGrid({ characters, onAnswer, onFinish, onRestart, onBack }: QuizGridProps) {
  const [cards, setCards] = useState<QuizCardState[]>(() =>
    characters.map((character) => ({ character, value: "", status: "pending" })),
  );
  const cardsRef = useRef(cards);
  const inputs = useRef<(HTMLInputElement | null)[]>([]);
  const [startedAt] = useState(() => Date.now());
  const [now, setNow] = useState(startedAt);

  useEffect(() => {
    inputs.current[0]?.focus();
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const commit = (next: QuizCardState[]) => {
    cardsRef.current = next;
    setCards(next);
  };

  const focusAfter = (index: number, next: QuizCardState[]) => {
    const target = nextPendingIndex(next, index);
    if (target === -1) {
      setTimeout(() => onFinish({ cards: next, durationMs: Date.now() - startedAt }), 400);
    } else {
      // Wait for the current input to be disabled before moving focus.
      requestAnimationFrame(() => inputs.current[target]?.focus());
    }
  };

  const resolve = (index: number, value: string) => {
    const current = cardsRef.current;
    if (current[index].status !== "pending") return;
    const answer = normalizeRomaji(value);
    const correct = isCorrectAnswer(current[index].character, answer);
    const next = current.map((c, i) => (i === index ? { ...c, value: answer, status: correct ? "correct" : "wrong" } as const : c));
    commit(next);
    onAnswer(current[index].character, correct, answer);
    focusAfter(index, next);
  };

  const handleChange = (index: number, raw: string) => {
    // Mobile keyboards don't always emit key events for Space: treat a typed space as validation.
    if (/\s/.test(raw) && normalizeRomaji(raw)) return resolve(index, raw);
    const value = normalizeRomaji(raw);
    commit(cardsRef.current.map((c, i) => (i === index ? { ...c, value } : c)));
    if (shouldAutoValidate(cardsRef.current[index].character, value)) resolve(index, value);
  };

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    const isValidationKey = e.key === "Enter" || e.key === " " || (e.key === "Tab" && !e.shiftKey);
    if (!isValidationKey) return; // Shift+Tab keeps the native behaviour (previous pending card).
    e.preventDefault();
    const value = cardsRef.current[index].value;
    if (value) resolve(index, value);
    else if (e.key === "Tab") focusAfter(index, cardsRef.current);
  };

  const answered = cards.filter((c) => c.status !== "pending").length;
  const correct = cards.filter((c) => c.status === "correct").length;

  return (
    <div className="flex flex-col gap-4">
      <div className="sticky top-[61px] z-20 -mx-4 flex flex-wrap items-center gap-x-5 gap-y-2 border-b border-line bg-bg/95 px-4 py-3 backdrop-blur sm:mx-0 sm:rounded-2xl sm:border sm:bg-card sm:shadow-card">
        <dl className="flex flex-wrap items-center gap-x-5 gap-y-1 text-sm" aria-live="polite">
          <div className="flex gap-1.5">
            <dt className="sr-only">Progression</dt>
            <dd className="font-semibold tabular-nums">
              {answered} / {cards.length}
            </dd>
          </div>
          <div className="flex gap-1.5 text-success-ink">
            <dt>Bonnes</dt>
            <dd className="font-semibold tabular-nums">{correct}</dd>
          </div>
          <div className="flex gap-1.5 text-error-ink">
            <dt>Erreurs</dt>
            <dd className="font-semibold tabular-nums">{answered - correct}</dd>
          </div>
          <div className="flex gap-1.5 text-muted">
            <dt className="sr-only">Temps</dt>
            <dd className="tabular-nums" aria-live="off">
              ⏱ {formatDuration(now - startedAt)}
            </dd>
          </div>
        </dl>
        <div className="ml-auto flex gap-2">
          <button type="button" onClick={onRestart} className="rounded-lg border border-line px-3 py-1.5 text-sm hover:bg-card-muted">
            Recommencer
          </button>
          <button type="button" onClick={onBack} className="rounded-lg border border-line px-3 py-1.5 text-sm hover:bg-card-muted">
            Retour à la sélection
          </button>
        </div>
        <div className="h-1 w-full overflow-hidden rounded-full bg-card-muted" aria-hidden>
          <div className="h-full bg-accent transition-[width] duration-300" style={{ width: `${(answered / cards.length) * 100}%` }} />
        </div>
      </div>

      <div className="grid grid-cols-4 gap-2 sm:grid-cols-6 sm:gap-3 md:grid-cols-8 lg:grid-cols-10">
        {cards.map((card, i) => (
          <QuizCard
            key={card.character.id}
            card={card}
            index={i}
            inputRef={(el) => {
              inputs.current[i] = el;
            }}
            onChange={(v) => handleChange(i, v)}
            onKeyDown={(e) => handleKeyDown(i, e)}
          />
        ))}
      </div>
    </div>
  );
}
