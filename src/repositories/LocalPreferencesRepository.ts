import type { KanaScript } from "@/domain/character";
import type { ExerciseType } from "@/domain/progress";
import { type KeyValueStore, readJson, writeJson } from "@/lib/storage";
import type { PreferencesRepository } from "./PreferencesRepository";

export class LocalPreferencesRepository implements PreferencesRepository {
  constructor(private readonly store: KeyValueStore) {}

  async getSelection(script: KanaScript, exercise: ExerciseType): Promise<string[]> {
    return readJson<string[]>(this.store, `kaizen:v1:selection:${script}:${exercise}`, []);
  }

  async saveSelection(script: KanaScript, exercise: ExerciseType, rowIds: string[]): Promise<void> {
    writeJson(this.store, `kaizen:v1:selection:${script}:${exercise}`, rowIds);
  }
}
