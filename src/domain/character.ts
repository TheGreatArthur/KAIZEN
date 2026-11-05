/** Writing systems supported (or planned) by the app. */
export type Script = "hiragana" | "katakana" | "kanji";

/** Kana scripts share the same exercises (reading, calligraphy). */
export type KanaScript = Extract<Script, "hiragana" | "katakana">;

/** Selection blocks shown on the selector screen. */
export type CharacterGroup = "main" | "dakuten" | "combination";

export interface Character {
  /** Stable identifier, used as primary key in the future database (e.g. `hira-ka`). */
  id: string;
  script: Script;
  char: string;
  /** Accepted Hepburn romanizations; the first one is the canonical answer. */
  romaji: string[];
  /** Consonant row the character belongs to (e.g. `ka`), one selector column per row. */
  row: string;
  group: CharacterGroup;
  /** Vertical slot within its row (0 = a, 1 = i, 2 = u, 3 = e, 4 = o, 5 = extra), keeps gaps of や/わ rows. */
  slot: number;
  strokeCount: number;
  /**
   * KanjiVG files composing the glyph, relative to `/public`.
   * Combinations (yōon) are made of two files: base kana + small kana.
   */
  svgPath: string[];
}

export interface CharacterRow {
  id: string;
  /** Label shown on the column header (usually the first kana of the row). */
  label: string;
  group: CharacterGroup;
  /** Number of vertical slots in the column. */
  slots: number;
  characters: Character[];
}

export interface CharacterGroupInfo {
  id: CharacterGroup;
  rows: CharacterRow[];
}
