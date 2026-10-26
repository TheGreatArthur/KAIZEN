import type { KanaScript } from "@/domain/character";
import type { ExerciseType } from "@/domain/progress";

export interface PreferencesRepository {
  /** Row ids selected on the selector screen of an exercise. */
  getSelection(script: KanaScript, exercise: ExerciseType): Promise<string[]>;
  saveSelection(script: KanaScript, exercise: ExerciseType, rowIds: string[]): Promise<void>;
}
