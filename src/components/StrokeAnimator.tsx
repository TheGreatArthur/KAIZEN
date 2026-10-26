"use client";

import { useEffect, useRef, useState } from "react";
import { GLYPH_BOX, type GlyphStroke } from "@/services/glyph";
import { GlyphPaths } from "./GlyphPaths";

interface StrokeAnimatorProps {
  strokes: GlyphStroke[];
  label: string;
  size?: number;
}

/** Shows a KanjiVG glyph and replays its stroke order, stroke by stroke, with stroke-dashoffset. */
export function StrokeAnimator({ strokes, label, size = 140 }: StrokeAnimatorProps) {
  const svg = useRef<SVGSVGElement>(null);
  const [playing, setPlaying] = useState(false);
  const animations = useRef<Animation[]>([]);

  const stop = () => {
    animations.current.forEach((a) => a.cancel());
    animations.current = [];
  };

  useEffect(() => {
    stop();
    // Glyph changed: cancel any running animation.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPlaying(false);
    return stop;
  }, [strokes]);

  const play = () => {
    const paths = Array.from(svg.current?.querySelectorAll<SVGPathElement>("path[data-stroke]") ?? []);
    stop();
    setPlaying(true);
    let delay = 0;
    animations.current = paths.map((path) => {
      const len = path.getTotalLength();
      const duration = Math.max(300, len * 9);
      path.style.strokeDasharray = `${len}`;
      const anim = path.animate([{ strokeDashoffset: len }, { strokeDashoffset: 0 }], {
        duration,
        delay,
        fill: "backwards",
        easing: "ease-in-out",
      });
      delay += duration + 180;
      return anim;
    });
    Promise.all(animations.current.map((a) => a.finished))
      .then(() => setPlaying(false))
      .catch(() => {});
  };

  return (
    <div className="flex flex-col items-center gap-3">
      <svg
        ref={svg}
        viewBox={`0 0 ${GLYPH_BOX} ${GLYPH_BOX}`}
        width={size}
        height={size}
        role="img"
        aria-label={label}
        className="rounded-2xl bg-white text-[#1f1b16]"
      >
        <GlyphPaths strokes={strokes} width={3.5} pathProps={() => ({ stroke: "currentColor", "data-stroke": "" } as never)} />
      </svg>
      <button
        type="button"
        onClick={play}
        disabled={playing || strokes.length === 0}
        className="rounded-lg border border-line px-3 py-1.5 text-sm font-medium hover:bg-card-muted disabled:opacity-60"
      >
        {playing ? "Animation…" : "Voir l'ordre des traits"}
      </button>
    </div>
  );
}
