"use client";

import { useEffect, useRef, useState } from "react";
import type { Character, KanaScript } from "@/domain/character";
import { useCharacters } from "@/hooks/useCharacters";
import { useProgressActions } from "@/hooks/useProgress";
import { useSelection } from "@/hooks/useSelection";
import { type GlyphStroke, loadGlyph } from "@/services/glyph";
import { charactersForRows, shuffle } from "@/services/quiz";
import { matchStrokes, type MatchResult, type StrokeStatus, type Tolerance } from "@/services/strokeMatcher";
import { DrawingCanvas, type DrawnStroke } from "./DrawingCanvas";
import { GlyphPaths } from "./GlyphPaths";
import { KanaSelector } from "./KanaSelector";
import { StrokeAnimator } from "./StrokeAnimator";

const STATUS_COLOR: Record<StrokeStatus, string> = {
  correct: "#2E9E5B",
  reversed: "#E08A00",
  misordered: "#E08A00",
  wrong: "#D7263D",
  extra: "#D7263D",
};

const STATUS_LABEL: Record<StrokeStatus, string> = {
  correct: "correct",
  reversed: "sens inversé",
  misordered: "ordre des traits",
  wrong: "hors forme",
  extra: "trait en trop",
};

const TOLERANCE_LABEL: Record<Tolerance, string> = { easy: "Facile", normal: "Normal", strict: "Strict" };

type Phase = { name: "select" } | { name: "practice"; queue: Character[] } | { name: "summary"; results: MatchResult[] };

function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <label className="flex cursor-pointer items-center gap-2 text-sm">
      <input type="checkbox" className="peer sr-only" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <span
        aria-hidden
        className="relative h-6 w-10 rounded-full bg-line transition-colors peer-checked:bg-accent peer-focus-visible:outline-3 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-accent after:absolute after:left-0.5 after:top-0.5 after:h-5 after:w-5 after:rounded-full after:bg-white after:shadow after:transition-transform peer-checked:after:translate-x-4"
      />
      {label}
    </label>
  );
}

function ToleranceSelect({ value, onChange }: { value: Tolerance; onChange: (t: Tolerance) => void }) {
  return (
    <fieldset className="flex items-center gap-2 text-sm">
      <legend className="sr-only">Tolérance</legend>
      <span className="text-muted" aria-hidden>
        Tolérance
      </span>
      <div className="flex rounded-lg border border-line p-0.5">
        {(Object.keys(TOLERANCE_LABEL) as Tolerance[]).map((t) => (
          <label
            key={t}
            className={`cursor-pointer rounded-md px-2.5 py-1 transition-colors has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-accent ${
              value === t ? "bg-accent text-white" : "hover:bg-card-muted"
            }`}
          >
            <input type="radio" name="tolerance" className="sr-only" checked={value === t} onChange={() => onChange(t)} />
            {TOLERANCE_LABEL[t]}
          </label>
        ))}
      </div>
    </fieldset>
  );
}

function Practice({
  queue,
  tolerance,
  setTolerance,
  onAttempt,
  onDone,
  onBack,
}: {
  queue: Character[];
  tolerance: Tolerance;
  setTolerance: (t: Tolerance) => void;
  onAttempt: (c: Character, r: MatchResult) => void;
  onDone: (results: MatchResult[]) => void;
  onBack: () => void;
}) {
  const [index, setIndex] = useState(0);
  const [glyph, setGlyph] = useState<{ id: string; strokes: GlyphStroke[] } | null>(null);
  const [strokes, setStrokes] = useState<DrawnStroke[]>([]);
  const [result, setResult] = useState<MatchResult | null>(null);
  const [showModel, setShowModel] = useState(false);
  const [guided, setGuided] = useState(false);
  const results = useRef<MatchResult[]>([]);
  const character = queue[index];

  useEffect(() => {
    let cancelled = false;
    loadGlyph(character.svgPath).then((s) => !cancelled && setGlyph({ id: character.id, strokes: s }));
    return () => {
      cancelled = true;
    };
  }, [character]);

  const expected = glyph?.id === character.id ? glyph.strokes : [];
  const nextStroke = !result && guided ? expected[strokes.length] : undefined;

  const validate = () => {
    const r = matchStrokes(
      strokes.map((s) => s.points),
      expected.map((s) => s.points),
      tolerance,
    );
    setResult(r);
    results.current.push(r);
    onAttempt(character, r);
  };

  const next = () => {
    if (index + 1 >= queue.length) return onDone(results.current);
    setIndex(index + 1);
    setStrokes([]);
    setResult(null);
  };

  const btn = "rounded-xl border border-line px-4 py-2 text-sm font-medium hover:bg-card-muted disabled:cursor-not-allowed disabled:opacity-50";

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center gap-x-6 gap-y-3 rounded-2xl bg-card p-4 shadow-card">
        <p className="text-sm font-semibold tabular-nums">
          {index + 1} / {queue.length}
        </p>
        <Toggle checked={showModel} onChange={setShowModel} label="Modèle" />
        <Toggle checked={guided} onChange={setGuided} label="Guidé" />
        <ToleranceSelect value={tolerance} onChange={setTolerance} />
        <button type="button" onClick={onBack} className="ml-auto rounded-lg border border-line px-3 py-1.5 text-sm hover:bg-card-muted">
          Retour à la sélection
        </button>
      </div>

      <div className="grid gap-6 md:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] md:items-start">
        <div className="flex flex-col items-center gap-2 rounded-2xl bg-card p-5 shadow-card">
          <p lang="ja" className="font-jp text-6xl">
            {character.char}
          </p>
          <p className="text-lg font-semibold">{character.romaji[0]}</p>
          <p className="text-sm text-muted">
            {character.strokeCount} trait{character.strokeCount > 1 ? "s" : ""}
          </p>
          <StrokeAnimator strokes={expected} label={`Ordre des traits de ${character.char}`} />
        </div>

        <div className="flex w-full flex-col items-center gap-4 md:w-[320px]">
          <DrawingCanvas
            strokes={strokes}
            onStrokeEnd={(s) => setStrokes((prev) => [...prev, s])}
            disabled={!!result}
            colors={result?.strokes.map((s) => STATUS_COLOR[s.status])}
            label={`Case d'écriture pour ${character.char}`}
            underlay={
              (showModel || result) && (
                <g stroke="#e4ddd3">
                  <GlyphPaths strokes={expected} width={5} />
                </g>
              )
            }
            overlay={
              nextStroke && (
                <>
                  <defs>
                    <marker id="guide-arrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="4" markerHeight="4" orient="auto-start-reverse">
                      <path d="M0,0 L10,5 L0,10 z" fill="#D7263D" />
                    </marker>
                  </defs>
                  <g stroke="#D7263D" strokeDasharray="3 3" opacity={0.75}>
                    <GlyphPaths strokes={[nextStroke]} width={1.6} pathProps={() => ({ markerEnd: "url(#guide-arrow)" })} />
                  </g>
                  <circle cx={nextStroke.points[0].x} cy={nextStroke.points[0].y} r={2.4} fill="#D7263D" />
                </>
              )
            }
          />
          <div className="flex flex-wrap justify-center gap-2">
            <button type="button" className={btn} disabled={!strokes.length || !!result} onClick={() => setStrokes((s) => s.slice(0, -1))}>
              Annuler le dernier trait
            </button>
            <button type="button" className={btn} disabled={!strokes.length || !!result} onClick={() => setStrokes([])}>
              Effacer
            </button>
            <button
              type="button"
              className="rounded-xl bg-accent px-4 py-2 text-sm font-semibold text-white hover:bg-accent-ink disabled:cursor-not-allowed disabled:bg-line disabled:text-muted"
              disabled={!strokes.length || !!result || expected.length === 0}
              onClick={validate}
            >
              Valider
            </button>
            <button type="button" className={btn} onClick={next}>
              Suivant
            </button>
          </div>
        </div>

        <div aria-live="polite" className="rounded-2xl bg-card p-5 shadow-card">
          {result ? (
            <>
              <p className={`text-4xl font-bold tabular-nums ${result.passed ? "text-success-ink" : "text-accent-ink"}`}>
                {result.score}
                <span className="text-lg text-muted">/100</span>
              </p>
              <p className="mt-1 text-sm text-muted">
                {result.drawnCount} trait{result.drawnCount > 1 ? "s" : ""} dessiné{result.drawnCount > 1 ? "s" : ""} sur {result.expectedCount} attendu
                {result.expectedCount > 1 ? "s" : ""}
              </p>
              <ul className="mt-4 flex flex-col gap-1.5 text-sm">
                {result.strokes.map((s) => (
                  <li key={s.index} className="flex items-center gap-2">
                    <span aria-hidden className="h-3 w-3 rounded-full" style={{ background: STATUS_COLOR[s.status] }} />
                    Trait {s.index + 1} : {STATUS_LABEL[s.status]}
                  </li>
                ))}
                {result.drawnCount < result.expectedCount && (
                  <li className="text-error-ink">
                    {result.expectedCount - result.drawnCount} trait(s) manquant(s)
                  </li>
                )}
              </ul>
            </>
          ) : (
            <p className="text-sm text-muted">
              Tracez le caractère dans la case, trait par trait, en respectant l&apos;ordre et le sens des traits, puis cliquez sur
              «&nbsp;Valider&nbsp;».
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export function CalligraphyExercise({ script }: { script: KanaScript }) {
  const { characters, groups, loading } = useCharacters(script);
  const { selected, setSelected, loaded } = useSelection(script, "calligraphy");
  const progress = useProgressActions();
  const [phase, setPhase] = useState<Phase>({ name: "select" });
  const [tolerance, setTolerance] = useState<Tolerance>("normal");
  const session = useRef<{ id?: string; correct: number; total: number }>({ correct: 0, total: 0 });

  const start = () => {
    const queue = shuffle(charactersForRows(characters, selected));
    session.current = { correct: 0, total: 0 };
    progress.startSession({ script, exercise: "calligraphy", characterIds: queue.map((c) => c.id) }).then((s) => {
      session.current.id = s.id;
    });
    setPhase({ name: "practice", queue });
  };

  const onAttempt = (c: Character, r: MatchResult) => {
    session.current.total++;
    if (r.passed) session.current.correct++;
    progress.saveAttempt({
      characterId: c.id,
      exercise: "calligraphy",
      correct: r.passed,
      score: r.score,
      createdAt: new Date().toISOString(),
      sessionId: session.current.id,
    });
  };

  const onDone = (results: MatchResult[]) => {
    const { id, correct, total } = session.current;
    if (id) progress.finishSession(id, { correct, total });
    setPhase({ name: "summary", results });
  };

  if (loading || !loaded) return <p className="text-muted">Chargement…</p>;

  if (phase.name === "practice") {
    return (
      <Practice
        queue={phase.queue}
        tolerance={tolerance}
        setTolerance={setTolerance}
        onAttempt={onAttempt}
        onDone={onDone}
        onBack={() => setPhase({ name: "select" })}
      />
    );
  }

  if (phase.name === "summary") {
    const { results } = phase;
    const avg = results.length ? Math.round(results.reduce((s, r) => s + r.score, 0) / results.length) : 0;
    return (
      <section className="mx-auto flex max-w-xl flex-col items-center gap-4 rounded-3xl bg-card p-10 text-center shadow-card">
        <h2 className="text-2xl font-bold">Série terminée</h2>
        <p className="text-5xl font-bold tabular-nums text-accent-ink">
          {avg}
          <span className="text-xl text-muted">/100</span>
        </p>
        <p className="text-muted">
          Score moyen sur {results.length} caractère{results.length > 1 ? "s" : ""} validé{results.length > 1 ? "s" : ""} —{" "}
          {results.filter((r) => r.passed).length} réussi{results.filter((r) => r.passed).length > 1 ? "s" : ""}
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <button type="button" onClick={start} className="rounded-xl bg-accent px-5 py-2.5 font-semibold text-white hover:bg-accent-ink">
            Nouvelle série
          </button>
          <button type="button" onClick={() => setPhase({ name: "select" })} className="rounded-xl border border-line px-5 py-2.5 font-semibold hover:bg-card-muted">
            Changer la sélection
          </button>
        </div>
      </section>
    );
  }

  return <KanaSelector groups={groups} selected={selected} onChange={setSelected} startLabel="Commencer" onStart={start} />;
}
