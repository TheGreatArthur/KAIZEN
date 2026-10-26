export function Footer() {
  return (
    <footer className="border-t border-line py-6 text-sm text-muted">
      <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 sm:flex-row sm:justify-between sm:px-6">
        <p>Kaizen — 改善, s&apos;améliorer un peu chaque jour.</p>
        <p>
          Tracés des caractères :{" "}
          <a className="underline underline-offset-2 hover:text-ink" href="https://kanjivg.tagaini.net/" target="_blank" rel="noreferrer">
            KanjiVG
          </a>{" "}
          © Ulrich Apel, licence{" "}
          <a className="underline underline-offset-2 hover:text-ink" href="https://creativecommons.org/licenses/by-sa/3.0/" target="_blank" rel="noreferrer">
            CC BY-SA 3.0
          </a>
          .
        </p>
      </div>
    </footer>
  );
}
