"use client";

import Link from "next/link";
import { useProgress } from "@/hooks/useProgress";
import { SCRIPTS } from "@/lib/navigation";
import { SoonBadge } from "../Badge";
import { ProgressBar } from "../ProgressBar";

const FIRST_ROW = ["あ", "い", "う", "え", "お"];

export function ScriptCards() {
  const { summary } = useProgress("hiragana");
  const featured = SCRIPTS.find((s) => s.available)!;
  const upcoming = SCRIPTS.filter((s) => !s.available);
  const started = !!summary && (summary.mastered > 0 || !!summary.lastSession);

  return (
    <div className="grid grid-cols-[minmax(0,1fr)] gap-4 md:grid-cols-3">
      {/* Featured: the only script available today. */}
      <section
        aria-labelledby="featured-title"
        className="flex flex-col gap-6 rounded-3xl bg-card p-5 shadow-card min-[400px]:p-6 sm:flex-row sm:items-center sm:p-8 md:col-span-2"
      >
        <span aria-hidden className="font-jp text-8xl leading-none text-accent sm:text-9xl">
          {featured.glyph}
        </span>
        <div className="flex min-w-0 flex-1 flex-col gap-4">
          <div>
            <h2 id="featured-title" className="text-2xl font-bold">
              <Link href={featured.href} className="hover:text-accent-ink">
                {featured.label}
              </Link>
            </h2>
            <p className="mt-1 text-muted">{featured.description}</p>
          </div>

          {!summary ? (
            // Progress loads from storage on the client: keep the space to avoid a layout jump.
            <div aria-hidden className="h-24" />
          ) : started ? (
            <>
              <ProgressBar value={summary.mastered} max={summary.total} label="Kana maîtrisés" />
              <Link href={featured.href} className="btn-glass-prominent self-start rounded-full px-5 py-2.5 font-semibold">
                Continuer les hiragana
              </Link>
            </>
          ) : (
            <>
              <p className="text-sm text-muted">
                Nouveau ici ? Commencez par la première colonne, cinq kana en deux minutes :
              </p>
              <p lang="ja" aria-hidden className="flex gap-1.5 font-jp text-2xl min-[400px]:gap-2 min-[400px]:text-3xl">
                {FIRST_ROW.map((c) => (
                  <span key={c} className="grid h-10 w-10 place-items-center rounded-xl bg-card-muted min-[400px]:h-12 min-[400px]:w-12 min-[400px]:rounded-2xl">
                    {c}
                  </span>
                ))}
              </p>
              <div className="flex flex-wrap gap-3">
                <Link href={`${featured.href}/lecture?rows=a`} className="btn-glass-prominent rounded-full px-5 py-2.5 font-semibold">
                  Commencer par あいうえお
                </Link>
                <Link href={featured.href} className="btn-glass rounded-full px-5 py-2.5 font-semibold">
                  Voir les exercices
                </Link>
              </div>
            </>
          )}
        </div>
      </section>

      {/* Upcoming scripts: compact, low emphasis. */}
      <ul className="grid gap-4 sm:grid-cols-2 md:grid-cols-1" aria-label="Bientôt disponibles">
        {upcoming.map((s) => (
          <li key={s.id}>
            <Link
              href={s.href}
              className="flex h-full items-center gap-4 rounded-3xl border border-dashed border-line bg-card/30 p-5 text-muted transition-colors hover:bg-card/60"
            >
              <span aria-hidden className="font-jp text-5xl opacity-50">
                {s.glyph}
              </span>
              <span>
                <span className="flex items-center gap-2 text-lg font-bold">
                  {s.label} <SoonBadge />
                </span>
                <span className="mt-0.5 block text-sm">{s.description}</span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
