"use client";

import type { KeyboardEvent, Ref } from "react";
import type { QuizCardState } from "@/services/quiz";

interface QuizCardProps {
  card: QuizCardState;
  index: number;
  inputRef: Ref<HTMLInputElement>;
  onChange: (value: string) => void;
  onKeyDown: (e: KeyboardEvent<HTMLInputElement>) => void;
}

const STYLES = {
  pending: "bg-card shadow-card focus-within:ring-2 focus-within:ring-accent",
  correct: "bg-success-soft animate-pop",
  wrong: "bg-error-soft animate-shake",
} as const;

export function QuizCard({ card, index, inputRef, onChange, onKeyDown }: QuizCardProps) {
  const { character, status, value } = card;
  const done = status !== "pending";
  return (
    <div className={`flex flex-col overflow-hidden rounded-2xl transition-colors duration-200 ${STYLES[status]}`}>
      <label htmlFor={`quiz-${index}`} className="grid flex-1 place-items-center pb-1 pt-3">
        <span
          lang="ja"
          className={`whitespace-nowrap font-jp leading-none ${
            character.char.length > 1 ? "text-3xl sm:text-4xl" : "text-5xl sm:text-[3.25rem]"
          }`}
        >
          {character.char}
        </span>
        <span className="sr-only">Romaji de {character.char}</span>
      </label>
      <div className="relative px-2 pb-2">
        <input
          id={`quiz-${index}`}
          ref={inputRef}
          value={value}
          disabled={done}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={onKeyDown}
          autoComplete="off"
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
          enterKeyHint="next"
          aria-invalid={status === "wrong" || undefined}
          className={`w-full rounded-lg border px-1 py-1 text-center text-sm outline-none transition-colors ${
            status === "pending"
              ? "border-line bg-card-muted focus:border-accent"
              : status === "correct"
                ? "border-transparent bg-transparent font-semibold text-success-ink"
                : "border-transparent bg-transparent text-error-ink line-through"
          }`}
        />
        {status === "wrong" && (
          <span className="block text-center text-xs font-semibold text-error-ink">{character.romaji[0]}</span>
        )}
      </div>
    </div>
  );
}
