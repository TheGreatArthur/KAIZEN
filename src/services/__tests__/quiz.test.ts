import { describe, expect, it } from "vitest";
import { HIRAGANA } from "@/data/static/hiragana";
import { charactersForRows, formatDuration, nextPendingIndex, scorePercent, shuffle } from "../quiz";

describe("quiz helpers", () => {
  it("shuffles without losing items", () => {
    const items = [1, 2, 3, 4, 5];
    const out = shuffle(items, () => 0.3);
    expect(out).toHaveLength(5);
    expect([...out].sort()).toEqual(items);
    expect(items).toEqual([1, 2, 3, 4, 5]);
  });

  it("selects characters by row", () => {
    expect(charactersForRows(HIRAGANA, ["ya", "wa"]).map((c) => c.char)).toEqual(["や", "ゆ", "よ", "わ", "を", "ん"]);
  });

  it("finds the next pending card, wrapping around", () => {
    const cards = [{ status: "pending" }, { status: "correct" }, { status: "wrong" }] as const;
    expect(nextPendingIndex([...cards], 0)).toBe(0);
    expect(nextPendingIndex([...cards], 1)).toBe(0);
    expect(nextPendingIndex([{ status: "correct" }], 0)).toBe(-1);
  });

  it("formats scores and durations", () => {
    expect(scorePercent(23, 46)).toBe(50);
    expect(scorePercent(0, 0)).toBe(0);
    expect(formatDuration(125_000)).toBe("02:05");
  });
});
