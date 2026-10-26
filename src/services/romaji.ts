import type { Character } from "@/domain/character";

/** Case-insensitive, whitespace-free comparison form. */
export function normalizeRomaji(input: string): string {
  return input.toLowerCase().replace(/\s+/g, "");
}

export function isCorrectAnswer(character: Pick<Character, "romaji">, input: string): boolean {
  const value = normalizeRomaji(input);
  return value.length > 0 && character.romaji.includes(value);
}

/**
 * True when the input can be validated without waiting for a validation key:
 * it is a correct answer AND no longer accepted answer starts with it.
 * e.g. ん: "n" waits (because "nn" is also accepted), "nn" validates immediately.
 */
export function shouldAutoValidate(character: Pick<Character, "romaji">, input: string): boolean {
  const value = normalizeRomaji(input);
  if (!isCorrectAnswer(character, value)) return false;
  return !character.romaji.some((r) => r.length > value.length && r.startsWith(value));
}
