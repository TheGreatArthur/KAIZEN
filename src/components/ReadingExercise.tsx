"use client";

import { useRef, useState } from "react";
import type { Character, KanaScript } from "@/domain/character";
import { useCharacters } from "@/hooks/useCharacters";
import { useProgressActions } from "@/hooks/useProgress";
import { useSelection } from "@/hooks/useSelection";
import { charactersForRows, shuffle } from "@/services/quiz";
import { KanaSelector } from "./KanaSelector";
import { QuizGrid, type QuizOutcome } from "./QuizGrid";
import { ResultsPanel } from "./ResultsPanel";

type Phase =
  | { name: "select" }
  | { name: "quiz"; characters: Character[]; run: number }
  | { name: "results"; outcome: QuizOutcome; characters: Character[] };

export function ReadingExercise({ script }: { script: KanaScript }) {
  const { characters, groups, loading } = useCharacters(script);
  const { selected, setSelected, loaded } = useSelection(script, "reading");
  const progress = useProgressActions();
  const [phase, setPhase] = useState<Phase>({ name: "select" });
  const session = useRef<{ id?: string; correct: number; total: number }>({ correct: 0, total: 0 });
  const runs = useRef(0);

  const start = (chars: Character[]) => {
    const list = shuffle(chars);
    session.current = { correct: 0, total: 0 };
    progress.startSession({ script, exercise: "reading", characterIds: list.map((c) => c.id) }).then((s) => {
      session.current.id = s.id;
    });
    setPhase({ name: "quiz", characters: list, run: ++runs.current });
    window.scrollTo({ top: 0 });
  };

  const onAnswer = (character: Character, correct: boolean, answer: string) => {
    session.current.total++;
    if (correct) session.current.correct++;
    progress.saveAttempt({
      characterId: character.id,
      exercise: "reading",
      correct,
      answer,
      createdAt: new Date().toISOString(),
      sessionId: session.current.id,
    });
  };

  const onFinish = (outcome: QuizOutcome) => {
    const { id, correct, total } = session.current;
    if (id) progress.finishSession(id, { correct, total });
    if (phase.name === "quiz") setPhase({ name: "results", outcome, characters: phase.characters });
  };

  if (loading || !loaded) return <p className="text-muted">Chargement…</p>;

  if (phase.name === "quiz") {
    return (
      <QuizGrid
        key={phase.run}
        characters={phase.characters}
        onAnswer={onAnswer}
        onFinish={onFinish}
        onRestart={() => start(phase.characters)}
        onBack={() => setPhase({ name: "select" })}
      />
    );
  }

  if (phase.name === "results") {
    return (
      <ResultsPanel
        cards={phase.outcome.cards}
        durationMs={phase.outcome.durationMs}
        onRetryMistakes={() => start(phase.outcome.cards.filter((c) => c.status === "wrong").map((c) => c.character))}
        onNewQuiz={() => start(charactersForRows(characters, selected))}
        onChangeSelection={() => setPhase({ name: "select" })}
      />
    );
  }

  return (
    <KanaSelector
      groups={groups}
      selected={selected}
      onChange={setSelected}
      startLabel="Lancer le quiz"
      onStart={() => start(charactersForRows(characters, selected))}
    />
  );
}
