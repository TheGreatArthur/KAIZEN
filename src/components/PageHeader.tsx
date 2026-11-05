import Link from "next/link";

export function PageHeader({ title, subtitle, back }: { title: string; subtitle?: string; back?: { href: string; label: string } }) {
  return (
    <header className="mb-8">
      {back && (
        <nav aria-label="Fil d'Ariane" className="text-sm">
          <Link href={back.href} className="text-muted underline-offset-2 hover:text-ink hover:underline">
            {back.label}
          </Link>
        </nav>
      )}
      <h1 className="mt-1 text-3xl font-bold tracking-tight">{title}</h1>
      {subtitle && <p className="mt-2 max-w-2xl text-muted">{subtitle}</p>}
    </header>
  );
}
