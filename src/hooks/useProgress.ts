"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { KanaScript } from "@/domain/character";
import { type ExerciseSession, type ExerciseType, isMastered } from "@/domain/progress";
import { getContainer } from "@/lib/container";
import type { ProgressRepository } from "@/repositories/ProgressRepository";

export interface ProgressSummary {
  total: number;
  mastered: number;
  masteredBy: Record<ExerciseType, number>;
  lastSession?: ExerciseSession;
  lastSessionBy: Partial<Record<ExerciseType, ExerciseSession>>;
}

/** Aggregated progress of a script, computed through the ProgressRepository. */
export function useProgress(script: KanaScript) {
  const [summary, setSummary] = useState<ProgressSummary | null>(null);

  const refresh = useCallback(async () => {
    const { characters, progress } = getContainer();
    const chars = await characters.getByScript(script);
    const [stats, lastSession, lastReading, lastCalligraphy] = await Promise.all([
      progress.getStatsMany(chars.map((c) => c.id)),
      progress.getLastSession({ script }),
      progress.getLastSession({ script, exercise: "reading" }),
      progress.getLastSession({ script, exercise: "calligraphy" }),
    ]);
    const values = Object.values(stats);
    setSummary({
      total: chars.length,
      mastered: values.filter((s) => isMastered(s)).length,
      masteredBy: {
        reading: values.filter((s) => isMastered(s, "reading")).length,
        calligraphy: values.filter((s) => isMastered(s, "calligraphy")).length,
      },
      lastSession,
      lastSessionBy: { reading: lastReading, calligraphy: lastCalligraphy },
    });
  }, [script]);

  useEffect(() => {
    // Initial load from the (async) repository.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    refresh();
  }, [refresh]);

  return { summary, refresh };
}

/** Write access to progress for exercises. Resolved lazily so nothing touches storage during SSR. */
export function useProgressActions(): ProgressRepository {
  return useMemo(() => {
    const repo = () => getContainer().progress;
    return {
      getUserId: () => repo().getUserId(),
      saveAttempt: (a) => repo().saveAttempt(a),
      getStats: (id) => repo().getStats(id),
      getStatsMany: (ids) => repo().getStatsMany(ids),
      startSession: (s) => repo().startSession(s),
      finishSession: (id, r) => repo().finishSession(id, r),
      getSession: (id) => repo().getSession(id),
      getLastSession: (f) => repo().getLastSession(f),
    };
  }, []);
}
