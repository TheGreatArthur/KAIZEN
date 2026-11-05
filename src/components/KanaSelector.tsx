"use client";

import type { ReactNode } from "react";
import type { CharacterGroup, CharacterGroupInfo, CharacterRow } from "@/domain/character";
import { plural } from "@/lib/format";

const GROUP_TITLES: Record<CharacterGroup, string> = {
  main: "Kana principaux",
  dakuten: "Dakuten",
  combination: "Combinaisons",
};

interface KanaSelectorProps {
  groups: CharacterGroupInfo[];
  /** Selected row ids. */
  selected: string[];
  onChange: (rowIds: string[]) => void;
  startLabel: string;
  onStart: () => void;
  /** Exercise specific options shown next to the start button. */
  options?: ReactNode;
}

function Column({ row, selected, onToggle }: { row: CharacterRow; selected: boolean; onToggle: () => void }) {
  const slots = Array.from({ length: row.slots }, (_, i) => row.characters.find((c) => c.slot === i));
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={selected}
      aria-label={`Ligne ${row.label} : ${row.characters.map((c) => c.char).join(" ")}`}
      onClick={onToggle}
      className={`group relative flex min-w-[3.75rem] max-w-[6.5rem] flex-1 basis-[3.75rem] flex-col items-center gap-1 rounded-2xl border-2 px-2 pb-2 pt-6 transition-colors ${
        selected ? "border-accent bg-accent-soft" : "border-transparent bg-card shadow-card hover:border-line"
      }`}
    >
      <span
        aria-hidden
        className={`absolute right-1.5 top-1.5 grid h-5 w-5 place-items-center rounded-full text-xs transition-colors ${
          selected ? "bg-accent text-white" : "border border-line text-transparent"
        }`}
      >
        ✓
      </span>
      {slots.map((c, i) =>
        c ? (
          <span key={c.id} className="flex flex-col items-center leading-tight">
            <span className="font-jp text-2xl lg:text-3xl">{c.char}</span>
            <span className="text-xs text-muted">{c.romaji[0]}</span>
          </span>
        ) : (
          <span key={`gap-${i}`} aria-hidden className="h-[2.85rem] lg:h-[3.35rem]" />
        ),
      )}
    </button>
  );
}

export function KanaSelector({ groups, selected, onChange, startLabel, onStart, options }: KanaSelectorProps) {
  const selectedSet = new Set(selected);
  const allRows = groups.flatMap((g) => g.rows);
  const count = allRows.filter((r) => selectedSet.has(r.id)).reduce((n, r) => n + r.characters.length, 0);
  const allSelected = allRows.length > 0 && allRows.every((r) => selectedSet.has(r.id));

  const setRows = (rows: CharacterRow[], value: boolean) => {
    const next = new Set(selectedSet);
    for (const r of rows) {
      if (value) next.add(r.id);
      else next.delete(r.id);
    }
    // Keep data order for a stable stored selection.
    onChange(allRows.filter((r) => next.has(r.id)).map((r) => r.id));
  };

  return (
    <div className="flex flex-col gap-8">
      {groups.map((group) => {
        const groupAll = group.rows.every((r) => selectedSet.has(r.id));
        return (
          <section key={group.id} aria-labelledby={`group-${group.id}`}>
            <div className="mb-3 flex items-center justify-between gap-3">
              <h2 id={`group-${group.id}`} className="text-lg font-semibold">
                {GROUP_TITLES[group.id]}
              </h2>
              <button type="button" onClick={() => setRows(group.rows, !groupAll)} className="btn-glass rounded-full px-3 py-1.5 text-sm font-medium">
                {groupAll ? "Tout désélectionner" : "Tout sélectionner"}
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {group.rows.map((row) => (
                <Column key={row.id} row={row} selected={selectedSet.has(row.id)} onToggle={() => setRows([row], !selectedSet.has(row.id))} />
              ))}
            </div>
          </section>
        );
      })}

      {/* Floating action bar: controls float above the content, always within thumb reach. */}
      <div className="sticky bottom-3 z-20 sm:bottom-5">
        <div className="glass mx-auto flex max-w-3xl flex-wrap items-center gap-2 rounded-[1.75rem] p-2 pl-2 sm:flex-nowrap sm:gap-3 sm:rounded-full">
          <button
            type="button"
            onClick={() => setRows(allRows, !allSelected)}
            aria-label={allSelected ? "Tout désélectionner" : "Tout sélectionner"}
            className="btn-glass shrink-0 rounded-full px-3.5 py-2 text-sm font-medium"
          >
            <span aria-hidden className="sm:hidden">
              {allSelected ? "Aucun" : "Tout"}
            </span>
            <span aria-hidden className="hidden sm:inline">
              {allSelected ? "Tout désélectionner" : "Tout sélectionner"}
            </span>
          </button>
          <p aria-live="polite" className="min-w-0 flex-1 text-sm leading-tight">
            {count === 0 ? (
              <span className="text-muted">Sélectionnez au moins une colonne</span>
            ) : (
              <strong>{plural(count, "kana sélectionné", "kana sélectionnés")}</strong>
            )}
          </p>
          {options}
          <button
            type="button"
            onClick={onStart}
            disabled={count === 0}
            className="btn-glass-prominent w-full shrink-0 rounded-full px-5 py-2.5 font-semibold sm:w-auto"
          >
            {startLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
