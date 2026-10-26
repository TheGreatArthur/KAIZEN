import { existsSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { HIRAGANA } from "../static/hiragana";
import { StaticCharacterRepository } from "@/repositories/StaticCharacterRepository";

describe("hiragana data", () => {
  it("contains 46 main kana, 25 dakuten and 33 combinations", () => {
    const count = (g: string) => HIRAGANA.filter((c) => c.group === g).length;
    expect(count("main")).toBe(46);
    expect(count("dakuten")).toBe(25);
    expect(count("combination")).toBe(33);
  });

  it("has unique stable ids", () => {
    const ids = HIRAGANA.map((c) => c.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(ids).toContain("hira-ka");
    expect(ids).toContain("hira-di");
  });

  it("references existing KanjiVG files and known stroke counts", () => {
    for (const c of HIRAGANA) {
      expect(c.strokeCount).toBeGreaterThan(0);
      for (const p of c.svgPath) expect(existsSync(join(process.cwd(), "public", p))).toBe(true);
    }
  });

  it("keeps the empty slots of the や and わ rows", async () => {
    const groups = await new StaticCharacterRepository().getGroups("hiragana");
    const rows = groups[0].rows;
    expect(rows.map((r) => r.id)).toEqual(["a", "ka", "sa", "ta", "na", "ha", "ma", "ya", "ra", "wa"]);
    expect(rows.find((r) => r.id === "ya")!.characters.map((c) => c.slot)).toEqual([0, 2, 4]);
    expect(rows.find((r) => r.id === "wa")!.characters.map((c) => c.slot)).toEqual([0, 4, 5]);
  });
});
