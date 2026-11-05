"use client";

import { useCallback, useEffect, useState } from "react";
import type { KanaScript } from "@/domain/character";
import type { ExerciseType } from "@/domain/progress";
import { getContainer } from "@/lib/container";

/** Row ids passed in the URL (`?rows=a,ka`), used by deep links such as the home page's "start here" button. */
function rowsFromUrl(): string[] | null {
  const raw = new URLSearchParams(window.location.search).get("rows");
  const rows = raw?.split(",").map((r) => r.trim()).filter(Boolean);
  return rows?.length ? rows : null;
}

/** Selected row ids of the selector screen, remembered through the PreferencesRepository. */
export function useSelection(script: KanaScript, exercise: ExerciseType) {
  const [selected, setSelected] = useState<string[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const preferences = getContainer().preferences;
    const fromUrl = rowsFromUrl();
    if (fromUrl) preferences.saveSelection(script, exercise, fromUrl);
    preferences.getSelection(script, exercise).then((rows) => {
      setSelected(fromUrl ?? rows);
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
