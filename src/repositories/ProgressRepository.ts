import type { KanaScript } from "@/domain/character";
import type {
  AttemptResult,
  CharacterStats,
  ExerciseSession,
  ExerciseType,
} from "@/domain/progress";

export interface SessionFilter {
  script?: KanaScript;
  exercise?: ExerciseType;
}

export interface ProgressRepository {
  /** Anonymous local user id today, authenticated account id later. */
  getUserId(): Promise<string>;
  saveAttempt(attempt: AttemptResult): Promise<void>;
  getStats(characterId: string): Promise<CharacterStats | undefined>;
  getStatsMany(characterIds: string[]): Promise<Record<string, CharacterStats>>;
  startSession(session: Omit<ExerciseSession, "id" | "startedAt" | "finishedAt" | "correct" | "total">): Promise<ExerciseSession>;
  finishSession(sessionId: string, result: { correct: number; total: number }): Promise<ExerciseSession | undefined>;
  getSession(sessionId: string): Promise<ExerciseSession | undefined>;
  /** Most recent session (finished or not) matching the filter. */
  getLastSession(filter?: SessionFilter): Promise<ExerciseSession | undefined>;
}
