import type { Character, CharacterGroupInfo, KanaScript } from "@/domain/character";

export interface CharacterRepository {
  getByScript(script: KanaScript): Promise<Character[]>;
  getByIds(ids: string[]): Promise<Character[]>;
  /** Characters grouped by block (main / dakuten / combination) then by row. */
  getGroups(script: KanaScript): Promise<CharacterGroupInfo[]>;
}
