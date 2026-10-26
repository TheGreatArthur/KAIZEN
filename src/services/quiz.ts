import type { Character } from "@/domain/character";

/** Fisher–Yates shuffle, returns a new array. `random` is injectable for tests. */
export function shuffle<T>(items: readonly T[], random: () => number = Math.random): T[] {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/** Characters belonging to the selected rows, in data order. */
export function charactersForRows(characters: Character[], rowIds: Iterable<string>): Character[] {
  const rows = new Set(rowIds);
  return characters.filter((c) => rows.has(c.row));
}

export type CardStatus = "pending" | "correct" | "wrong";

export interface QuizCardState {
  character: Character;
  value: string;
  status: CardStatus;
}

/** Index of the next pending card after `from`, wrapping around; -1 when none is left. */
export function nextPendingIndex(cards: Pick<QuizCardState, "status">[], from: number): number {
  for (let step = 1; step <= cards.length; step++) {
    const i = (from + step) % cards.length;
    if (cards[i].status === "pending") return i;
  }
  return -1;
}

export function scorePercent(correct: number, total: number): number {
  return total === 0 ? 0 : Math.round((correct / total) * 100);
}

export function formatDuration(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000));
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}
