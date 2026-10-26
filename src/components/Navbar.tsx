"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SCRIPTS } from "@/lib/navigation";
import { SoonBadge } from "./Badge";

export function Navbar() {
  const pathname = usePathname();
  return (
    <header className="sticky top-0 z-30 border-b border-line bg-bg/90 backdrop-blur">
      <nav aria-label="Navigation principale" className="mx-auto flex max-w-6xl items-center gap-2 px-4 py-3 sm:px-6">
        <Link href="/" className="mr-auto flex items-center gap-2 rounded-lg font-semibold">
          <span aria-hidden className="grid h-9 w-9 place-items-center rounded-xl bg-accent font-jp text-lg text-white">
            改
          </span>
          <span className="hidden text-lg min-[420px]:inline">Kaizen</span>
        </Link>
        <ul className="flex items-center gap-1 text-sm sm:gap-2">
          {SCRIPTS.map((s) => {
            const active = pathname.startsWith(s.href);
            return (
              <li key={s.id}>
                <Link
                  href={s.href}
                  aria-current={active ? "page" : undefined}
                  className={`flex items-center gap-1.5 rounded-lg px-2 py-1.5 transition-colors sm:px-3 ${
                    active ? "bg-accent-soft text-accent-ink" : s.available ? "hover:bg-card-muted" : "text-muted hover:bg-card-muted"
                  }`}
                >
                  <span className="font-jp" aria-hidden>
                    {s.glyph}
                  </span>
                  <span>{s.label}</span>
                  {!s.available && (
                    <>
                      <span className="hidden md:inline-flex">
                        <SoonBadge />
                      </span>
                      <span className="sr-only md:hidden">(bientôt)</span>
                    </>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </header>
  );
}
