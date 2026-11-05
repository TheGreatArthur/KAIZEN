import type { CharacterRepository } from "@/repositories/CharacterRepository";
import { LocalPreferencesRepository } from "@/repositories/LocalPreferencesRepository";
import { LocalProgressRepository } from "@/repositories/LocalProgressRepository";
import type { PreferencesRepository } from "@/repositories/PreferencesRepository";
import type { ProgressRepository } from "@/repositories/ProgressRepository";
import { StaticCharacterRepository } from "@/repositories/StaticCharacterRepository";
import { type KeyValueStore, MemoryStore } from "./storage";

/**
 * Single place where repository implementations are chosen.
 * Switching to an API / Postgres / Supabase backend means returning other
 * implementations here — the UI only depends on the interfaces.
 */
export interface Container {
  characters: CharacterRepository;
  progress: ProgressRepository;
  preferences: PreferencesRepository;
}

let container: Container | null = null;

function browserStore(): KeyValueStore {
  try {
    if (typeof window !== "undefined" && window.localStorage) return window.localStorage;
  } catch {
    // Access to localStorage can throw (privacy mode, sandboxed iframe).
  }
  return new MemoryStore();
}

export function getContainer(): Container {
  if (!container) {
    const store = browserStore();
    container = {
      characters: new StaticCharacterRepository(),
      progress: new LocalProgressRepository(store),
      preferences: new LocalPreferencesRepository(store),
    };
  }
  return container;
}

/** Test hook: inject custom implementations. */
export function setContainer(next: Container | null): void {
  container = next;
}
