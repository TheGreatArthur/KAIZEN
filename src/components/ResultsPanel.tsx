"use client";

import { useEffect, useRef } from "react";
import { formatDuration, type QuizCardState, scorePercent } from "@/services/quiz";

interface ResultsPanelProps {
  cards: QuizCardState[];
  durationMs: number;
  onRetryMistakes: () => void;
  onNewQuiz: () => void;
  onChangeSelection: () => void;
}

export function ResultsPanel({ cards, durationMs, onRetryMistakes, onNewQuiz, onChangeSelection }: ResultsPanelProps) {
  const heading = useRef<HTMLHeadingElement>(null);
  const correct = cards.filter((c) => c.status === "correct").length;
  const mistakes = cards.filter((c) => c.status === "wrong");
  const score = scorePercent(correct, cards.length);

  useEffect(() => heading.current?.focus(), []);

  return (
    <section className="mx-auto flex max-w-3xl flex-col gap-6 rounded-3xl bg-card p-6 shadow-card sm:p-10" aria-labelledby="results-title">
      <div className="text-center">
        <h2 id="results-title" ref={heading} tabIndex={-1} className="text-2xl font-bold outline-none">
          {score === 100 ? "Parfait ! 🎉" : score >= 80 ? "Très bien !" : "Continuez comme ça !"}
        </h2>
        <div className="mt-6 flex justify-center gap-10">
          <div>
            <p className={`text-5xl font-bold tabular-nums ${score >= 80 ? "text-success-ink" : "text-accent-ink"}`}>{score}%</p>
            <p className="text-sm text-muted">
              {correct} / {cards.length} bonnes réponses
            </p>
          </div>
          <div>
            <p className="text-5xl font-bold tabular-nums">{formatDuration(durationMs)}</p>
            <p className="text-sm text-muted">temps total</p>
          </div>
        </div>
      </div>

      {mistakes.length > 0 && (
        <div>
          <h3 className="mb-3 font-semibold">Kana à revoir ({mistakes.length})</h3>
          <ul className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {mistakes.map((c) => (
              <li key={c.character.id} className="flex items-center gap-3 rounded-xl bg-error-soft px-3 py-2">
                <span lang="ja" className="font-jp text-3xl">
                  {c.character.char}
                </span>
                <span className="text-sm leading-tight">
                  <span className="block text-error-ink line-through" aria-label={`Votre réponse : ${c.value}`}>
                    {c.value}
                  </span>
                  <span className="block font-semibold" aria-label={`Bonne réponse : ${c.character.romaji[0]}`}>
                    {c.character.romaji.join(" / ")}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex flex-wrap justify-center gap-3">
        {mistakes.length > 0 && (
          <button type="button" onClick={onRetryMistakes} className="rounded-xl bg-accent px-5 py-2.5 font-semibold text-white hover:bg-accent-ink">
            Réessayer les erreurs
          </button>
        )}
        <button
          type="button"
          onClick={onNewQuiz}
          className={`rounded-xl px-5 py-2.5 font-semibold ${mistakes.length ? "border border-line hover:bg-card-muted" : "bg-accent text-white hover:bg-accent-ink"}`}
        >
          Nouveau quiz
        </button>
        <button type="button" onClick={onChangeSelection} className="rounded-xl border border-line px-5 py-2.5 font-semibold hover:bg-card-muted">
          Changer la sélection
        </button>
      </div>
    </section>
  );
}
