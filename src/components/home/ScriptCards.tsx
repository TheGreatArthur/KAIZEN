"use client";

import Link from "next/link";
import { useProgress } from "@/hooks/useProgress";
import { SCRIPTS } from "@/lib/navigation";
import { SoonBadge } from "../Badge";
import { ProgressBar } from "../ProgressBar";

export function ScriptCards() {
  const { summary } = useProgress("hiragana");
  return (
    <ul className="grid gap-4 sm:grid-cols-3">
      {SCRIPTS.map((s) => (
        <li key={s.id}>
          {s.available ? (
            <Link
              href={s.href}
              className="group flex h-full flex-col gap-4 rounded-3xl bg-card p-6 shadow-card transition-transform hover:-translate-y-0.5"
            >
              <span aria-hidden className="font-jp text-7xl text-accent transition-transform group-hover:scale-105">
                {s.glyph}
              </span>
              <span>
                <span className="block text-xl font-bold">{s.label}</span>
                <span className="mt-1 block text-sm text-muted">{s.description}</span>
              </span>
              <span className="mt-auto">
                <ProgressBar value={summary?.mastered ?? 0} max={summary?.total ?? 0} label="Kana maîtrisés" />
              </span>
            </Link>
          ) : (
            <Link
              href={s.href}
              className="flex h-full flex-col gap-4 rounded-3xl border-2 border-dashed border-line p-6 text-muted transition-colors hover:bg-card/60"
            >
              <span aria-hidden className="font-jp text-7xl opacity-50">
                {s.glyph}
              </span>
              <span>
                <span className="flex items-center gap-2 text-xl font-bold">
                  {s.label} <SoonBadge />
                </span>
                <span className="mt-1 block text-sm">{s.description}</span>
              </span>
            </Link>
          )}
        </li>
      ))}
    </ul>
  );
}
