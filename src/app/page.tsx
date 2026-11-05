import { KaizenHero } from "@/components/home/KaizenHero";
import { ResumeBlock } from "@/components/home/ResumeBlock";
import { ScriptCards } from "@/components/home/ScriptCards";

export default function Home() {
  return (
    <div className="flex flex-col gap-10">
      <section className="pt-2 text-center sm:pt-8">
        <KaizenHero />
        <h1 className="mt-6 text-4xl font-bold tracking-tight sm:text-5xl">Apprenez à lire et écrire le japonais</h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-muted">
          Des quiz de lecture rapides et un cahier de calligraphie interactif pour progresser un peu chaque jour.
        </p>
      </section>
      <ResumeBlock />
      <ScriptCards />
    </div>
  );
}
