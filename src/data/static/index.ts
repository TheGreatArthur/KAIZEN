import type { Character, KanaScript } from "@/domain/character";
import { HIRAGANA } from "./hiragana";

/** Static content per script. Adding katakana = adding a `katakana.ts` data file here. */
export const STATIC_CHARACTERS: Record<KanaScript, Character[]> = {
  hiragana: HIRAGANA,
  katakana: [],
};
