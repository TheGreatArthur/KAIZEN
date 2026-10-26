import Link from "next/link";

export function PageHeader({ title, subtitle, back }: { title: string; subtitle?: string; back?: { href: string; label: string } }) {
  return (
    <header className="mb-8">
      {back && (
        <Link href={back.href} className="text-sm text-muted hover:text-ink">
          ← {back.label}
        </Link>
      )}
      <h1 className="mt-1 text-3xl font-bold tracking-tight">{title}</h1>
      {subtitle && <p className="mt-2 max-w-2xl text-muted">{subtitle}</p>}
    </header>
  );
}
