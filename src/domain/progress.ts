import type { KanaScript } from "./character";

export type ExerciseType = "reading" | "calligraphy";

export interface AttemptResult {
  characterId: string;
  exercise: ExerciseType;
  correct: boolean;
  /** Reading: romaji typed by the user. */
  answer?: string;
  /** Calligraphy: global score out of 100. */
  score?: number;
  /** ISO 8601 timestamp. */
  createdAt: string;
  sessionId?: string;
}

export interface ExerciseStats {
  attempts: number;
  correct: number;
  /** Consecutive correct answers, reset on error. */
  streak: number;
}

export interface CharacterStats extends ExerciseStats {
  characterId: string;
  lastAttemptAt: string | null;
  byExercise: Partial<Record<ExerciseType, ExerciseStats>>;
}

export interface ExerciseSession {
  id: string;
  script: KanaScript;
  exercise: ExerciseType;
  characterIds: string[];
  startedAt: string;
  finishedAt: string | null;
  correct: number;
  total: number;
}

/** A character is considered mastered after this many consecutive correct answers. */
export const MASTERY_STREAK = 3;

/** Mastered overall, or for a given exercise when `exercise` is provided. */
export function isMastered(stats: CharacterStats | undefined, exercise?: ExerciseType): boolean {
  const s = exercise ? stats?.byExercise[exercise] : stats;
  return !!s && s.streak >= MASTERY_STREAK;
}

export function applyAttempt(stats: ExerciseStats | undefined, correct: boolean): ExerciseStats {
  const prev = stats ?? { attempts: 0, correct: 0, streak: 0 };
  return {
    attempts: prev.attempts + 1,
    correct: prev.correct + (correct ? 1 : 0),
    streak: correct ? prev.streak + 1 : 0,
  };
}
