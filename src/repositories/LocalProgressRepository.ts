import { type AttemptResult, type CharacterStats, type ExerciseSession, applyAttempt } from "@/domain/progress";
import { type KeyValueStore, readJson, uuid, writeJson } from "@/lib/storage";
import type { ProgressRepository, SessionFilter } from "./ProgressRepository";

const PREFIX = "kaizen:v1";
/** Raw attempts are kept for a future migration to the database, within a bounded budget. */
export const MAX_STORED_ATTEMPTS = 2000;
const MAX_STORED_SESSIONS = 100;

/**
 * localStorage implementation. Every key is scoped by an anonymous local user id
 * (`kaizen:v1:<userId>:...`) so the data can later be attached to a real account.
 */
export class LocalProgressRepository implements ProgressRepository {
  private userId: string | null = null;

  constructor(
    private readonly store: KeyValueStore,
    private readonly now: () => Date = () => new Date(),
  ) {}

  async getUserId(): Promise<string> {
    if (this.userId) return this.userId;
    let id = this.store.getItem(`${PREFIX}:userId`);
    if (!id) {
      id = uuid();
      this.store.setItem(`${PREFIX}:userId`, id);
    }
    this.userId = id;
    return id;
  }

  private async key(name: string) {
    return `${PREFIX}:${await this.getUserId()}:${name}`;
  }

  async saveAttempt(attempt: AttemptResult): Promise<void> {
    const attemptsKey = await this.key("attempts");
    const attempts = readJson<AttemptResult[]>(this.store, attemptsKey, []);
    attempts.push(attempt);
    writeJson(this.store, attemptsKey, attempts.slice(-MAX_STORED_ATTEMPTS));

    const statsKey = await this.key("stats");
    const stats = readJson<Record<string, CharacterStats>>(this.store, statsKey, {});
    const prev = stats[attempt.characterId];
    stats[attempt.characterId] = {
      ...applyAttempt(prev, attempt.correct),
      characterId: attempt.characterId,
      lastAttemptAt: attempt.createdAt,
      byExercise: {
        ...prev?.byExercise,
        [attempt.exercise]: applyAttempt(prev?.byExercise[attempt.exercise], attempt.correct),
      },
    };
    writeJson(this.store, statsKey, stats);
  }

  async getStats(characterId: string): Promise<CharacterStats | undefined> {
    return (await this.getStatsMany([characterId]))[characterId];
  }

  async getStatsMany(characterIds: string[]): Promise<Record<string, CharacterStats>> {
    const stats = readJson<Record<string, CharacterStats>>(this.store, await this.key("stats"), {});
    return Object.fromEntries(characterIds.flatMap((id) => (stats[id] ? [[id, stats[id]]] : [])));
  }

  /** Raw attempts, exposed for the localStorage → database migration. */
  async getAttempts(): Promise<AttemptResult[]> {
    return readJson<AttemptResult[]>(this.store, await this.key("attempts"), []);
  }

  private async sessions(): Promise<ExerciseSession[]> {
    return readJson<ExerciseSession[]>(this.store, await this.key("sessions"), []);
  }

  private async writeSessions(sessions: ExerciseSession[]) {
    writeJson(this.store, await this.key("sessions"), sessions.slice(-MAX_STORED_SESSIONS));
  }

  async startSession(
    input: Parameters<ProgressRepository["startSession"]>[0],
  ): Promise<ExerciseSession> {
    const session: ExerciseSession = {
      ...input,
      id: uuid(),
      startedAt: this.now().toISOString(),
      finishedAt: null,
      correct: 0,
      total: 0,
    };
    await this.writeSessions([...(await this.sessions()), session]);
    return session;
  }

  async finishSession(sessionId: string, result: { correct: number; total: number }) {
    const sessions = await this.sessions();
    const session = sessions.find((s) => s.id === sessionId);
    if (!session) return undefined;
    Object.assign(session, result, { finishedAt: this.now().toISOString() });
    await this.writeSessions(sessions);
    return session;
  }

  async getSession(sessionId: string) {
    return (await this.sessions()).find((s) => s.id === sessionId);
  }

  async getLastSession(filter: SessionFilter = {}) {
    return (await this.sessions())
      .filter((s) => (!filter.script || s.script === filter.script) && (!filter.exercise || s.exercise === filter.exercise))
      .sort((a, b) => b.startedAt.localeCompare(a.startedAt))[0];
  }
}
