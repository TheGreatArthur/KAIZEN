import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { composeGlyph } from "../glyph";
import { matchStrokes, resample, strokeLength, type Stroke } from "../strokeMatcher";
import { pathToPoints } from "../svgPath";

const glyph = (...files: string[]) =>
  composeGlyph(files.map((f) => readFileSync(join(process.cwd(), "public/kanjivg", f), "utf8")));

/** Deterministic pseudo-random jitter to simulate a hand-drawn stroke. */
function wobble(stroke: Stroke, amplitude: number, seed = 1): Stroke {
  let s = seed;
  const rnd = () => ((s = (s * 16807) % 2147483647) / 2147483647 - 0.5) * 2;
  return stroke.map((p) => ({ x: p.x + rnd() * amplitude, y: p.y + rnd() * amplitude }));
}

const A = glyph("03042.svg").map((s) => s.points); // あ, 3 strokes

describe("svg path parsing", () => {
  it("parses absolute and relative cubic commands", () => {
    const pts = pathToPoints("M10,10c0,10,10,10,10,0S30,0,30,10L40,10");
    expect(pts[0]).toEqual({ x: 10, y: 10 });
    expect(pts.at(-1)).toEqual({ x: 40, y: 10 });
    expect(pts.find((p) => p.x === 20 && p.y === 10)).toBeTruthy();
  });

  it("composes yōon glyphs from two files", () => {
    const kya = glyph("0304d.svg", "03083.svg");
    expect(kya).toHaveLength(4 + 3);
    for (const p of kya.flatMap((s) => s.points)) {
      expect(p.x).toBeGreaterThanOrEqual(0);
      expect(p.x).toBeLessThanOrEqual(109);
    }
  });
});

describe("resample", () => {
  it("returns evenly spaced points preserving endpoints", () => {
    const line: Stroke = [{ x: 0, y: 0 }, { x: 10, y: 0 }, { x: 100, y: 0 }];
    const r = resample(line, 11);
    expect(r).toHaveLength(11);
    expect(r[0]).toEqual({ x: 0, y: 0 });
    expect(r[10].x).toBeCloseTo(100);
    expect(r[5].x).toBeCloseTo(50);
    expect(strokeLength(r)).toBeCloseTo(100);
  });

  it("handles a single point (tap)", () => {
    expect(resample([{ x: 5, y: 5 }], 4)).toHaveLength(4);
  });
});

describe("matchStrokes", () => {
  it("gives a perfect score to the reference strokes", () => {
    const r = matchStrokes(A, A);
    expect(r.passed).toBe(true);
    expect(r.score).toBeGreaterThanOrEqual(98);
    expect(r.strokes.every((s) => s.status === "correct")).toBe(true);
  });

  it("accepts a slightly shaky, slightly shifted drawing", () => {
    const drawn = A.map((s, i) => wobble(s.map((p) => ({ x: p.x + 4, y: p.y - 3 })), 2, i + 1));
    const r = matchStrokes(drawn, A, "normal");
    expect(r.passed).toBe(true);
    expect(r.score).toBeGreaterThan(80);
  });

  it("flags a stroke drawn in the reverse direction", () => {
    const drawn = [A[0], [...A[1]].reverse(), A[2]];
    const r = matchStrokes(drawn, A);
    expect(r.strokes[1].status).toBe("reversed");
    expect(r.passed).toBe(false);
  });

  it("flags strokes drawn in the wrong order", () => {
    const r = matchStrokes([A[1], A[0], A[2]], A);
    expect(r.strokes[0].status).toBe("misordered");
    expect(r.strokes[1].status).toBe("misordered");
    expect(r.strokes[2].status).toBe("correct");
  });

  it("flags out-of-shape strokes and penalises missing or extra strokes", () => {
    const scribble: Stroke = [{ x: 10, y: 100 }, { x: 100, y: 95 }];
    const wrong = matchStrokes([A[0], scribble, A[2]], A);
    expect(wrong.strokes[1].status).toBe("wrong");

    const missing = matchStrokes([A[0], A[1]], A);
    expect(missing.passed).toBe(false);
    expect(missing.score).toBeLessThanOrEqual(67);

    const extra = matchStrokes([...A, scribble], A);
    expect(extra.strokes[3].status).toBe("extra");
    expect(extra.passed).toBe(false);
  });

  it("is more lenient in easy mode than in strict mode", () => {
    const drawn = A.map((s, i) => wobble(s, 7, i + 3));
    const easy = matchStrokes(drawn, A, "easy");
    const strict = matchStrokes(drawn, A, "strict");
    expect(easy.score).toBeGreaterThan(strict.score);
    expect(easy.strokes.filter((s) => s.status === "correct").length).toBeGreaterThanOrEqual(
      strict.strokes.filter((s) => s.status === "correct").length,
    );
  });
});
