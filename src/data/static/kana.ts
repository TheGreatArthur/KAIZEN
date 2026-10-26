import type { Character, CharacterGroup, KanaScript } from "@/domain/character";

/**
 * Compact row definition: each cell is `[char, romaji[], idKey?]` or `null` for an empty slot.
 * `idKey` overrides the id suffix when the canonical romaji is ambiguous (ぢ = ji, like じ).
 */
export type KanaCell = [char: string, romaji: string[], idKey?: string] | null;

export interface KanaRowDef {
  row: string;
  group: CharacterGroup;
  cells: KanaCell[];
}

const ID_PREFIX: Record<KanaScript, string> = { hiragana: "hira", katakana: "kata" };

/** KanjiVG file names are the 5-digit lowercase hex code point of the character. */
export function kanjiVgFile(char: string): string {
  return `/kanjivg/${char.codePointAt(0)!.toString(16).padStart(5, "0")}.svg`;
}

/** Expands compact row definitions into domain characters. */
export function buildCharacters(
  script: KanaScript,
  rows: KanaRowDef[],
  strokeCounts: Record<string, number>,
): Character[] {
  return rows.flatMap(({ row, group, cells }) =>
    cells.flatMap((cell, slot) => {
      if (!cell) return [];
      const [char, romaji, idKey] = cell;
      const glyphs = Array.from(char);
      return [
        {
          id: `${ID_PREFIX[script]}-${idKey ?? romaji[0]}`,
          script,
          char,
          romaji,
          row,
          group,
          slot,
          strokeCount: glyphs.reduce((sum, g) => sum + (strokeCounts[g] ?? 0), 0),
          svgPath: glyphs.map(kanjiVgFile),
        },
      ];
    }),
  );
}
