import type { SVGProps } from "react";
import { type GlyphStroke, transformToSvg } from "@/services/glyph";

/** Renders KanjiVG strokes inside a 109×109 SVG coordinate space, compensating the stroke width of scaled glyphs. */
export function GlyphPaths({
  strokes,
  width = 3,
  pathProps,
}: {
  strokes: GlyphStroke[];
  width?: number;
  pathProps?: (index: number) => SVGProps<SVGPathElement>;
}) {
  return strokes.map((s, i) => (
    <g key={i} transform={transformToSvg(s.transform)}>
      <path d={s.d} fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth={width / s.transform.scale} {...pathProps?.(i)} />
    </g>
  ));
}
