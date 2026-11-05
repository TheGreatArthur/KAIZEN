import { KaizenHero } from "@/components/home/KaizenHero";
import { ResumeBlock } from "@/components/home/ResumeBlock";
import { ScriptCards } from "@/components/home/ScriptCards";

export default function Home() {
  return (
    <div className="flex flex-col gap-10">
      <section className="pt-2 text-center sm:pt-8">
        <KaizenHero />
        <p lang="ja" aria-hidden className="mt-4 font-jp text-base tracking-[0.3em] text-accent">
          ひらがな・カタカナ・漢字
        </p>
        <h1 className="mt-3 text-4xl font-bold tracking-tight sm:text-5xl">Apprenez à lire et écrire le japonais</h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-muted">
          Des quiz de lecture rapides et un cahier de calligraphie interactif pour progresser un peu chaque jour —
          <span className="font-jp"> 改善</span>.
        </p>
      </section>
      <ResumeBlock />
      <ScriptCards />
    </div>
  );
}
