"use client";

import { useEffect, useRef, useState } from "react";
import { GLYPH_BOX, type GlyphStroke, loadGlyph } from "@/services/glyph";
import { GlyphPaths } from "../GlyphPaths";

/** 改 (U+6539) and 善 (U+5584) from KanjiVG. */
const GLYPHS = [
  { char: "改", file: "/kanjivg/06539.svg" },
  { char: "善", file: "/kanjivg/05584.svg" },
];

/** Draws 改善 stroke by stroke once, as a calligraphy teaser. Static when reduced motion is requested. */
export function KaizenHero() {
  const root = useRef<HTMLDivElement>(null);
  const [glyphs, setGlyphs] = useState<GlyphStroke[][] | null>(null);

  useEffect(() => {
    let alive = true;
    Promise.all(GLYPHS.map((g) => loadGlyph([g.file])))
      .then((loaded) => alive && setGlyphs(loaded))
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    if (!glyphs || !root.current) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const paths = Array.from(root.current.querySelectorAll<SVGPathElement>("path[data-stroke]"));
    let delay = 250;
    const animations = paths.map((path) => {
      const len = path.getTotalLength();
      const duration = Math.max(180, len * 5);
      path.style.strokeDasharray = `${len}`;
      const anim = path.animate([{ strokeDashoffset: len }, { strokeDashoffset: 0 }], {
        duration,
        delay,
        fill: "backwards",
        easing: "ease-in-out",
      });
      delay += duration + 60;
      return anim;
    });
    return () => animations.forEach((a) => a.cancel());
  }, [glyphs]);

  return (
    <div ref={root} role="img" aria-label="改善, kaizen : s'améliorer" className="flex justify-center gap-1 sm:gap-3">
      {GLYPHS.map((g, i) => (
        <svg
          key={g.char}
          viewBox={`0 0 ${GLYPH_BOX} ${GLYPH_BOX}`}
          className={`h-20 w-20 sm:h-28 sm:w-28 ${i === 0 ? "text-accent" : "text-ink"}`}
          aria-hidden
        >
          {glyphs ? (
            <GlyphPaths strokes={glyphs[i]} width={5} pathProps={() => ({ stroke: "currentColor", "data-stroke": "" } as never)} />
          ) : (
            <text x="50%" y="54%" textAnchor="middle" dominantBaseline="middle" fontSize="88" className="fill-current font-jp opacity-10">
              {g.char}
            </text>
          )}
        </svg>
      ))}
    </div>
  );
}
