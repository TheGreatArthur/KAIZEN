import type {
  Character,
  CharacterGroup,
  CharacterGroupInfo,
  CharacterRow,
  KanaScript,
} from "@/domain/character";
import { STATIC_CHARACTERS } from "@/data/static";
import type { CharacterRepository } from "./CharacterRepository";

const GROUP_ORDER: CharacterGroup[] = ["main", "dakuten", "combination"];

export class StaticCharacterRepository implements CharacterRepository {
  constructor(private readonly source: Record<KanaScript, Character[]> = STATIC_CHARACTERS) {}

  async getByScript(script: KanaScript): Promise<Character[]> {
    return this.source[script];
  }

  async getByIds(ids: string[]): Promise<Character[]> {
    const all = new Map(Object.values(this.source).flat().map((c) => [c.id, c]));
    return ids.flatMap((id) => all.get(id) ?? []);
  }

  async getGroups(script: KanaScript): Promise<CharacterGroupInfo[]> {
    const rows = new Map<string, CharacterRow>();
    for (const c of this.source[script]) {
      let row = rows.get(c.row);
      if (!row) {
        row = { id: c.row, label: c.char, group: c.group, slots: 0, characters: [] };
        rows.set(c.row, row);
      }
      row.characters.push(c);
      row.slots = Math.max(row.slots, c.slot + 1);
    }
    return GROUP_ORDER.map((id) => ({
      id,
      rows: [...rows.values()].filter((r) => r.group === id),
    })).filter((g) => g.rows.length > 0);
  }
}
