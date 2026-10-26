import Link from "next/link";
import { SoonBadge } from "./Badge";

export function ComingSoon({ title, glyph }: { title: string; glyph: string }) {
  return (
    <section className="mx-auto max-w-xl rounded-3xl bg-card p-10 text-center shadow-card">
      <p aria-hidden className="font-jp text-7xl text-muted">
        {glyph}
      </p>
      <h1 className="mt-4 flex items-center justify-center gap-3 text-2xl font-bold">
        {title} <SoonBadge />
      </h1>
      <p className="mt-3 text-muted">Cette section est en cours de préparation. Revenez bientôt !</p>
      <Link href="/hiragana" className="mt-6 inline-flex rounded-xl bg-accent px-5 py-2.5 font-medium text-white hover:bg-accent-ink">
        Continuer avec les hiragana
      </Link>
    </section>
  );
}
