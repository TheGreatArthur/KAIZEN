"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SCRIPTS } from "@/lib/navigation";
import { SoonBadge } from "./Badge";

export function Navbar() {
  const pathname = usePathname();
  return (
    <header className="sticky top-0 z-30 px-3 pt-3 sm:px-6">
      {/* One glass capsule for the whole navigation layer: nearby glass shares a single surface. */}
      <nav
        aria-label="Navigation principale"
        className="glass mx-auto flex max-w-6xl items-center gap-2 rounded-full py-2 pl-2 pr-2 sm:pr-3"
      >
        <Link href="/" className="mr-auto flex items-center gap-2 rounded-full pr-2 font-semibold">
          <span aria-hidden className="grid h-9 w-9 place-items-center rounded-full bg-accent-fill font-jp text-lg text-on-accent">
            改
          </span>
          <span className="hidden text-lg min-[420px]:inline">Kaizen</span>
        </Link>
        <ul className="flex items-center gap-0.5 text-sm min-[400px]:gap-1 sm:gap-1.5">
          {SCRIPTS.map((s) => {
            const active = pathname.startsWith(s.href);
            return (
              <li key={s.id}>
                <Link
                  href={s.href}
                  aria-current={active ? "page" : undefined}
                  className={`flex items-center gap-1.5 whitespace-nowrap rounded-full px-2 py-1.5 transition-colors min-[400px]:px-2.5 sm:px-3 ${
                    active ? "btn-glass-prominent" : s.available ? "hover:bg-[var(--glass-bg-hover)]" : "text-muted hover:bg-[var(--glass-bg-hover)]"
                  }`}
                >
                  <span className="hidden font-jp min-[400px]:inline" aria-hidden>
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
