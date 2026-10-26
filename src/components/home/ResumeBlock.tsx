"use client";

import Link from "next/link";
import { useProgress } from "@/hooks/useProgress";
import { formatRelative } from "@/lib/format";
import { EXERCISE_LABELS, EXERCISE_SLUG } from "@/lib/navigation";

export function ResumeBlock() {
  const { summary } = useProgress("hiragana");
  const last = summary?.lastSession;
  if (!last) return null;
  const slug = EXERCISE_SLUG[last.exercise];
  return (
    <section aria-labelledby="resume-title" className="flex flex-wrap items-center gap-4 rounded-3xl bg-accent-soft p-6">
      <div>
        <h2 id="resume-title" className="text-lg font-bold">
          Reprendre
        </h2>
        <p className="text-sm text-muted">
          {EXERCISE_LABELS[slug]} des hiragana — {formatRelative(last.startedAt)}
          {last.total > 0 && ` · ${last.correct}/${last.total}`}
        </p>
      </div>
      <Link href={`/${last.script}/${slug}`} className="ml-auto rounded-xl bg-accent px-5 py-2.5 font-semibold text-white hover:bg-accent-ink">
        Continuer → {EXERCISE_LABELS[slug]}
      </Link>
    </section>
  );
}
