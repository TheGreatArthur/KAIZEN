import { describe, expect, it } from "vitest";
import { MemoryStore } from "@/lib/storage";
import { isMastered } from "@/domain/progress";
import { LocalProgressRepository, MAX_STORED_ATTEMPTS } from "../LocalProgressRepository";
import { LocalPreferencesRepository } from "../LocalPreferencesRepository";

const attempt = (characterId: string, correct: boolean, exercise: "reading" | "calligraphy" = "reading") => ({
  characterId,
  exercise,
  correct,
  createdAt: new Date().toISOString(),
});

describe("LocalProgressRepository", () => {
  it("generates a stable anonymous user id and scopes keys with it", async () => {
    const store = new MemoryStore();
    const repo = new LocalProgressRepository(store);
    const id = await repo.getUserId();
    expect(id).toMatch(/^[0-9a-f-]{36}$/);
    expect(await new LocalProgressRepository(store).getUserId()).toBe(id);

    await repo.saveAttempt(attempt("hira-a", true));
    expect(store.getItem(`kaizen:v1:${id}:stats`)).toContain("hira-a");
  });

  it("aggregates stats per character and per exercise", async () => {
    const repo = new LocalProgressRepository(new MemoryStore());
    await repo.saveAttempt(attempt("hira-ka", true));
    await repo.saveAttempt(attempt("hira-ka", true));
    await repo.saveAttempt(attempt("hira-ka", false, "calligraphy"));
    await repo.saveAttempt(attempt("hira-ka", true));

    const s = (await repo.getStats("hira-ka"))!;
    expect(s.attempts).toBe(4);
    expect(s.correct).toBe(3);
    expect(s.streak).toBe(1);
    expect(s.byExercise.reading).toEqual({ attempts: 3, correct: 3, streak: 3 });
    expect(s.byExercise.calligraphy).toEqual({ attempts: 1, correct: 0, streak: 0 });
    expect(isMastered(s, "reading")).toBe(true);
    expect(isMastered(s, "calligraphy")).toBe(false);
    expect(await repo.getStats("hira-ki")).toBeUndefined();
    expect(Object.keys(await repo.getStatsMany(["hira-ka", "hira-ki"]))).toEqual(["hira-ka"]);
  });

  it("caps the number of stored raw attempts", async () => {
    const repo = new LocalProgressRepository(new MemoryStore());
    for (let i = 0; i < MAX_STORED_ATTEMPTS + 5; i++) await repo.saveAttempt(attempt("hira-a", true));
    expect(await repo.getAttempts()).toHaveLength(MAX_STORED_ATTEMPTS);
    expect((await repo.getStats("hira-a"))!.attempts).toBe(MAX_STORED_ATTEMPTS + 5);
  });

  it("starts, finishes and retrieves sessions", async () => {
    let t = Date.parse("2026-01-01T10:00:00Z");
    const repo = new LocalProgressRepository(new MemoryStore(), () => new Date((t += 1000)));
    const s1 = await repo.startSession({ script: "hiragana", exercise: "reading", characterIds: ["hira-a"] });
    const s2 = await repo.startSession({ script: "hiragana", exercise: "calligraphy", characterIds: ["hira-i"] });
    await repo.finishSession(s1.id, { correct: 1, total: 1 });

    expect((await repo.getSession(s1.id))!.finishedAt).not.toBeNull();
    expect((await repo.getLastSession())!.id).toBe(s2.id);
    expect((await repo.getLastSession({ exercise: "reading" }))!.correct).toBe(1);
    expect(await repo.finishSession("unknown", { correct: 0, total: 0 })).toBeUndefined();
  });

  it("survives corrupted storage", async () => {
    const store = new MemoryStore();
    const repo = new LocalProgressRepository(store);
    store.setItem(`kaizen:v1:${await repo.getUserId()}:stats`, "{not json");
    expect(await repo.getStats("hira-a")).toBeUndefined();
    await repo.saveAttempt(attempt("hira-a", true));
    expect((await repo.getStats("hira-a"))!.attempts).toBe(1);
  });
});

describe("LocalPreferencesRepository", () => {
  it("remembers the selection per script and exercise", async () => {
    const prefs = new LocalPreferencesRepository(new MemoryStore());
    await prefs.saveSelection("hiragana", "reading", ["a", "ka"]);
    expect(await prefs.getSelection("hiragana", "reading")).toEqual(["a", "ka"]);
    expect(await prefs.getSelection("hiragana", "calligraphy")).toEqual([]);
  });
});
