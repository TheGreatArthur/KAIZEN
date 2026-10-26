"use client";

import { useEffect, useState } from "react";
import type { Character, CharacterGroupInfo, KanaScript } from "@/domain/character";
import { getContainer } from "@/lib/container";

export function useCharacters(script: KanaScript) {
  const [state, setState] = useState<{ characters: Character[]; groups: CharacterGroupInfo[]; loading: boolean }>({
    characters: [],
    groups: [],
    loading: true,
  });

  useEffect(() => {
    let cancelled = false;
    const repo = getContainer().characters;
    Promise.all([repo.getByScript(script), repo.getGroups(script)]).then(([characters, groups]) => {
      if (!cancelled) setState({ characters, groups, loading: false });
    });
    return () => {
      cancelled = true;
    };
  }, [script]);

  return state;
}
