import { extractKanjiVgPaths, pathToPoints, type Point } from "./svgPath";

/** KanjiVG drawings live in a 109×109 box. */
export const GLYPH_BOX = 109;

export interface Transform {
  scale: number;
  dx: number;
  dy: number;
}

export interface GlyphStroke {
  /** Original KanjiVG path data (in the source file coordinates). */
  d: string;
  /** Placement of the source glyph inside the shared box (used for combinations). */
  transform: Transform;
  /** Polyline in the shared 109×109 box. */
  points: Point[];
}

const IDENTITY: Transform = { scale: 1, dx: 0, dy: 0 };

/**
 * Layout of composite glyphs (yōon such as きゃ): the base kana on the left,
 * the small kana (already drawn small by KanjiVG) on the right.
 */
export function layoutFor(count: number): Transform[] {
  if (count <= 1) return [IDENTITY];
  return [
    { scale: 0.62, dx: 0, dy: 21 },
    { scale: 0.62, dx: 44, dy: 21 },
  ];
}

export function transformToSvg(t: Transform): string {
  return `translate(${t.dx} ${t.dy}) scale(${t.scale})`;
}

export function applyTransform(p: Point, t: Transform): Point {
  return { x: p.x * t.scale + t.dx, y: p.y * t.scale + t.dy };
}

/** Builds the strokes of a glyph from the raw KanjiVG files composing it. */
export function composeGlyph(svgSources: string[]): GlyphStroke[] {
  const layout = layoutFor(svgSources.length);
  return svgSources.flatMap((svg, idx) =>
    extractKanjiVgPaths(svg).map((d) => ({
      d,
      transform: layout[idx],
      points: pathToPoints(d).map((p) => applyTransform(p, layout[idx])),
    })),
  );
}

const cache = new Map<string, Promise<string>>();

function fetchSvg(url: string): Promise<string> {
  let p = cache.get(url);
  if (!p) {
    p = fetch(url).then((r) => {
      if (!r.ok) throw new Error(`KanjiVG file not found: ${url}`);
      return r.text();
    });
    p.catch(() => cache.delete(url));
    cache.set(url, p);
  }
  return p;
}

export async function loadGlyph(svgPaths: string[]): Promise<GlyphStroke[]> {
  return composeGlyph(await Promise.all(svgPaths.map(fetchSvg)));
}
