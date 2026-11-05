import { describe, expect, it } from "vitest";
import { HIRAGANA } from "@/data/static/hiragana";
import { isCorrectAnswer, normalizeRomaji, shouldAutoValidate } from "../romaji";

const kana = (char: string) => HIRAGANA.find((c) => c.char === char)!;

describe("normalizeRomaji", () => {
  it("lowercases and strips whitespace", () => {
    expect(normalizeRomaji("  Sh I ")).toBe("shi");
  });
});

describe("isCorrectAnswer", () => {
  it.each([
    ["し", ["shi", "si"]],
    ["ち", ["chi", "ti"]],
    ["つ", ["tsu", "tu"]],
    ["ふ", ["fu", "hu"]],
    ["じ", ["ji", "zi"]],
    ["を", ["wo", "o"]],
    ["ん", ["n", "nn"]],
    ["しゃ", ["sha", "sya"]],
    ["ちょ", ["cho", "tyo"]],
  ])("accepts every Hepburn variant of %s", (char, answers) => {
    for (const a of answers) expect(isCorrectAnswer(kana(char), a)).toBe(true);
  });

  it("is case-insensitive and ignores spaces", () => {
    expect(isCorrectAnswer(kana("か"), " KA ")).toBe(true);
  });

  it("rejects wrong and empty answers", () => {
    expect(isCorrectAnswer(kana("か"), "ga")).toBe(false);
    expect(isCorrectAnswer(kana("か"), "")).toBe(false);
    expect(isCorrectAnswer(kana("し"), "sh")).toBe(false);
  });
});

describe("shouldAutoValidate", () => {
  it("validates as soon as the answer is complete", () => {
    expect(shouldAutoValidate(kana("か"), "k")).toBe(false);
    expect(shouldAutoValidate(kana("か"), "ka")).toBe(true);
    expect(shouldAutoValidate(kana("し"), "si")).toBe(true);
    expect(shouldAutoValidate(kana("し"), "shi")).toBe(true);
  });

  it("waits for a validation key on ん typed as 'n' since 'nn' is also accepted", () => {
    expect(shouldAutoValidate(kana("ん"), "n")).toBe(false);
    expect(isCorrectAnswer(kana("ん"), "n")).toBe(true);
    expect(shouldAutoValidate(kana("ん"), "nn")).toBe(true);
  });

  it("validates を typed as 'o' immediately", () => {
    expect(shouldAutoValidate(kana("を"), "o")).toBe(true);
  });
});
