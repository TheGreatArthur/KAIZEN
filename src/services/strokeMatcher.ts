import type { Point } from "./svgPath";

export type Stroke = Point[];

export type Tolerance = "easy" | "normal" | "strict";

/** Thresholds in units of the 109×109 KanjiVG box. */
export const TOLERANCES: Record<Tolerance, { shape: number; position: number }> = {
  easy: { shape: 13, position: 20 },
  normal: { shape: 9.5, position: 14 },
  strict: { shape: 6.5, position: 9 },
};

/**
 * - correct: right shape, position and direction
 * - reversed: right shape but drawn in the opposite direction
 * - misordered: matches another expected stroke (stroke order mistake)
 * - wrong: out of shape / position
 * - extra: more strokes than expected
 */
export type StrokeStatus = "correct" | "reversed" | "misordered" | "wrong" | "extra";

export interface StrokeFeedback {
  index: number;
  status: StrokeStatus;
  /** Mean point distance after centering both strokes. */
  shapeDistance: number;
  /** Distance between stroke centroids. */
  positionDistance: number;
  score: number;
}

export interface MatchResult {
  expectedCount: number;
  drawnCount: number;
  strokes: StrokeFeedback[];
  /** Global score out of 100. */
  score: number;
  passed: boolean;
}

export const RESAMPLE_POINTS = 32;
/** Below this length (dots, dakuten ticks), the direction of a stroke is not judged. */
const MIN_DIRECTED_LENGTH = 12;

const dist = (a: Point, b: Point) => Math.hypot(a.x - b.x, a.y - b.y);

export function strokeLength(stroke: Stroke): number {
  let len = 0;
  for (let i = 1; i < stroke.length; i++) len += dist(stroke[i - 1], stroke[i]);
  return len;
}

/** Resamples a polyline into `n` points evenly spaced along its length. */
export function resample(stroke: Stroke, n = RESAMPLE_POINTS): Stroke {
  if (stroke.length === 0) return [];
  const total = strokeLength(stroke);
  if (stroke.length === 1 || total === 0) return Array.from({ length: n }, () => ({ ...stroke[0] }));
  const step = total / (n - 1);
  const out: Point[] = [{ ...stroke[0] }];
  let acc = 0;
  let prev = stroke[0];
  for (let i = 1; i < stroke.length && out.length < n; i++) {
    const cur = stroke[i];
    let seg = dist(prev, cur);
    while (acc + seg >= step && out.length < n) {
      const t = (step - acc) / seg;
      const p = { x: prev.x + t * (cur.x - prev.x), y: prev.y + t * (cur.y - prev.y) };
      out.push(p);
      prev = p;
      seg = dist(prev, cur);
      acc = 0;
    }
    acc += seg;
    prev = cur;
  }
  while (out.length < n) out.push({ ...stroke[stroke.length - 1] });
  return out;
}

function centroid(stroke: Stroke): Point {
  const sum = stroke.reduce((s, p) => ({ x: s.x + p.x, y: s.y + p.y }), { x: 0, y: 0 });
  return { x: sum.x / stroke.length, y: sum.y / stroke.length };
}

function bbox(strokes: Stroke[]) {
  const pts = strokes.flat();
  const xs = pts.map((p) => p.x);
  const ys = pts.map((p) => p.y);
  return { minX: Math.min(...xs), maxX: Math.max(...xs), minY: Math.min(...ys), maxY: Math.max(...ys) };
}

/**
 * Aligns the user drawing on the reference: same bounding-box center, and a uniform
 * scale clamped to ±30% so a slightly smaller/bigger drawing is still accepted
 * while a drawing in the wrong place of the box keeps being penalised.
 */
export function alignDrawing(drawn: Stroke[], expected: Stroke[]): Stroke[] {
  if (drawn.length === 0 || expected.length === 0) return drawn;
  const a = bbox(drawn);
  const b = bbox(expected);
  const sizeA = Math.max(a.maxX - a.minX, a.maxY - a.minY, 1);
  const sizeB = Math.max(b.maxX - b.minX, b.maxY - b.minY, 1);
  const scale = Math.min(1.3, Math.max(1 / 1.3, sizeB / sizeA));
  const ca = { x: (a.minX + a.maxX) / 2, y: (a.minY + a.maxY) / 2 };
  const cb = { x: (b.minX + b.maxX) / 2, y: (b.minY + b.maxY) / 2 };
  // Translation is applied only partially: position errors still count.
  const shift = { x: (cb.x - ca.x) * 0.6, y: (cb.y - ca.y) * 0.6 };
  return drawn.map((s) =>
    s.map((p) => ({ x: ca.x + (p.x - ca.x) * scale + shift.x, y: ca.y + (p.y - ca.y) * scale + shift.y })),
  );
}

interface Comparison {
  shape: number;
  position: number;
  reversed: boolean;
}

/** Compares two resampled strokes: position (centroids), direction (endpoints), shape (mean distance). */
export function compareStrokes(user: Stroke, ref: Stroke): Comparison {
  const cu = centroid(user);
  const cr = centroid(ref);
  const n = user.length;
  const forwardEnds = dist(user[0], ref[0]) + dist(user[n - 1], ref[n - 1]);
  const reverseEnds = dist(user[0], ref[n - 1]) + dist(user[n - 1], ref[0]);
  const directed = strokeLength(ref) >= MIN_DIRECTED_LENGTH;
  const reversed = directed && reverseEnds < forwardEnds * 0.7;

  let shape = 0;
  for (let i = 0; i < n; i++) {
    const r = reversed ? ref[n - 1 - i] : ref[i];
    shape += dist({ x: user[i].x - cu.x, y: user[i].y - cu.y }, { x: r.x - cr.x, y: r.y - cr.y });
  }
  // Short strokes are compared without orientation constraint.
  if (!directed) {
    let alt = 0;
    for (let i = 0; i < n; i++) {
      const r = ref[n - 1 - i];
      alt += dist({ x: user[i].x - cu.x, y: user[i].y - cu.y }, { x: r.x - cr.x, y: r.y - cr.y });
    }
    shape = Math.min(shape, alt);
  }
  return { shape: shape / n, position: dist(cu, cr), reversed };
}

function quality(c: Comparison, tol: { shape: number; position: number }): number {
  const q = 1 - 0.3 * (c.shape / tol.shape) - 0.2 * (c.position / tol.position);
  return Math.min(1, Math.max(0, q));
}

/**
 * Compares strokes drawn by the user with the expected KanjiVG strokes.
 * All strokes must be expressed in the same 109×109 box.
 */
export function matchStrokes(drawnRaw: Stroke[], expectedRaw: Stroke[], tolerance: Tolerance = "normal"): MatchResult {
  const tol = TOLERANCES[tolerance];
  const drawnClean = drawnRaw.filter((s) => s.length > 0);
  const expected = expectedRaw.map((s) => resample(s));
  const drawn = alignDrawing(drawnClean, expectedRaw).map((s) => resample(s));
  const fits = (c: Comparison) => c.shape <= tol.shape && c.position <= tol.position;

  const strokes: StrokeFeedback[] = drawn.map((user, index) => {
    if (index >= expected.length) {
      return { index, status: "extra", shapeDistance: 0, positionDistance: 0, score: 0 };
    }
    const c = compareStrokes(user, expected[index]);
    const q = quality(c, tol);
    let status: StrokeStatus;
    let score: number;
    if (fits(c)) {
      status = c.reversed ? "reversed" : "correct";
      score = c.reversed ? 15 + 35 * q : 70 + 30 * q;
    } else if (expected.some((ref, j) => j !== index && fits(compareStrokes(user, ref)))) {
      status = "misordered";
      score = 15 + 35 * q;
    } else {
      status = "wrong";
      score = 30 * q;
    }
    return { index, status, shapeDistance: c.shape, positionDistance: c.position, score };
  });

  const denominator = Math.max(expected.length, drawn.length, 1);
  const score = Math.round(strokes.reduce((s, f) => s + f.score, 0) / denominator);
  const passed = drawn.length === expected.length && strokes.every((s) => s.status === "correct");
  return { expectedCount: expected.length, drawnCount: drawn.length, strokes, score, passed };
}
