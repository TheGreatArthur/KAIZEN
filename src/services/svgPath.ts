export interface Point {
  x: number;
  y: number;
}

const TOKEN = /([MmLlHhVvCcSsQqTtZzAa])|(-?(?:\d+\.?\d*|\.\d+)(?:e[-+]?\d+)?)/g;

function cubic(p0: Point, p1: Point, p2: Point, p3: Point, t: number): Point {
  const u = 1 - t;
  return {
    x: u * u * u * p0.x + 3 * u * u * t * p1.x + 3 * u * t * t * p2.x + t * t * t * p3.x,
    y: u * u * u * p0.y + 3 * u * u * t * p1.y + 3 * u * t * t * p2.y + t * t * t * p3.y,
  };
}

/**
 * Converts an SVG path `d` attribute into a polyline. Supports the commands used by
 * KanjiVG (M, L, H, V, C, S, Q, T, Z — absolute and relative). Arcs are approximated by a line.
 */
export function pathToPoints(d: string, samplesPerCurve = 12): Point[] {
  const tokens: (string | number)[] = [...d.matchAll(TOKEN)].map((m) => (m[1] !== undefined ? m[1] : Number(m[2])));
  const pts: Point[] = [];
  let i = 0;
  let cmd = "";
  let cur: Point = { x: 0, y: 0 };
  let start: Point = { x: 0, y: 0 };
  let lastCtrl: Point | null = null;
  let lastCmd = "";

  const num = () => tokens[i++] as number;
  const hasNumber = () => typeof tokens[i] === "number";

  const curve = (c1: Point, c2: Point, end: Point) => {
    for (let s = 1; s <= samplesPerCurve; s++) pts.push(cubic(cur, c1, c2, end, s / samplesPerCurve));
  };

  while (i < tokens.length) {
    if (typeof tokens[i] === "string") cmd = tokens[i++] as string;
    else if (!cmd) break;
    const rel = cmd === cmd.toLowerCase();
    const abs = (x: number, y: number): Point => (rel ? { x: cur.x + x, y: cur.y + y } : { x, y });
    const C = cmd.toUpperCase();

    if (C === "Z") {
      pts.push({ ...start });
      cur = { ...start };
      lastCtrl = null;
      lastCmd = C;
      continue;
    }
    if (!hasNumber()) break;

    switch (C) {
      case "M": {
        cur = abs(num(), num());
        start = { ...cur };
        pts.push({ ...cur });
        cmd = rel ? "l" : "L"; // subsequent pairs are implicit line-to
        lastCtrl = null;
        break;
      }
      case "L":
        cur = abs(num(), num());
        pts.push({ ...cur });
        lastCtrl = null;
        break;
      case "H":
        cur = { x: rel ? cur.x + num() : num(), y: cur.y };
        pts.push({ ...cur });
        lastCtrl = null;
        break;
      case "V":
        cur = { x: cur.x, y: rel ? cur.y + num() : num() };
        pts.push({ ...cur });
        lastCtrl = null;
        break;
      case "C": {
        const c1 = abs(num(), num());
        const c2 = abs(num(), num());
        const end = abs(num(), num());
        curve(c1, c2, end);
        lastCtrl = c2;
        cur = end;
        break;
      }
      case "S": {
        const c1 = lastCtrl && (lastCmd === "C" || lastCmd === "S")
          ? { x: 2 * cur.x - lastCtrl.x, y: 2 * cur.y - lastCtrl.y }
          : { ...cur };
        const c2 = abs(num(), num());
        const end = abs(num(), num());
        curve(c1, c2, end);
        lastCtrl = c2;
        cur = end;
        break;
      }
      case "Q":
      case "T": {
        const q: Point = C === "Q"
          ? abs(num(), num())
          : lastCtrl && (lastCmd === "Q" || lastCmd === "T")
            ? { x: 2 * cur.x - lastCtrl.x, y: 2 * cur.y - lastCtrl.y }
            : { ...cur };
        const end = abs(num(), num());
        // Quadratic → cubic control points
        const c1 = { x: cur.x + (2 / 3) * (q.x - cur.x), y: cur.y + (2 / 3) * (q.y - cur.y) };
        const c2 = { x: end.x + (2 / 3) * (q.x - end.x), y: end.y + (2 / 3) * (q.y - end.y) };
        curve(c1, c2, end);
        lastCtrl = q;
        cur = end;
        break;
      }
      case "A": {
        i += 5;
        cur = abs(num(), num());
        pts.push({ ...cur });
        lastCtrl = null;
        break;
      }
    }
    lastCmd = C;
  }
  return pts;
}

/** Extracts the stroke paths of a KanjiVG file, in stroke order. */
export function extractKanjiVgPaths(svg: string): string[] {
  return [...svg.matchAll(/<path\b[^>]*?\sd="([^"]+)"/g)].map((m) => m[1]);
}
