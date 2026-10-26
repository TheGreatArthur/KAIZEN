"use client";

import { useCallback, useEffect, useState } from "react";
import type { KanaScript } from "@/domain/character";
import type { ExerciseType } from "@/domain/progress";
import { getContainer } from "@/lib/container";

/** Selected row ids of the selector screen, remembered through the PreferencesRepository. */
export function useSelection(script: KanaScript, exercise: ExerciseType) {
  const [selected, setSelected] = useState<string[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    getContainer()
      .preferences.getSelection(script, exercise)
      .then((rows) => {
        setSelected(rows);
        setLoaded(true);
      });
  }, [script, exercise]);

  const update = useCallback(
    (rows: string[]) => {
      setSelected(rows);
      getContainer().preferences.saveSelection(script, exercise, rows);
    },
    [script, exercise],
  );

  return { selected, setSelected: update, loaded };
}
