"use client";

import { type PointerEvent, type ReactNode, useCallback, useEffect, useRef, useState } from "react";
import { GLYPH_BOX } from "@/services/glyph";
import type { Point } from "@/services/svgPath";

export interface DrawnStroke {
  /** Points in the 109×109 glyph box. */
  points: Point[];
  /** Brush width at each point, in glyph box units. */
  widths: number[];
}

interface DrawingCanvasProps {
  strokes: DrawnStroke[];
  onStrokeEnd: (stroke: DrawnStroke) => void;
  /** Optional color per stroke (validation feedback). */
  colors?: (string | undefined)[];
  disabled?: boolean;
  /** SVG content drawn below the ink (model), in the 109×109 box. */
  underlay?: ReactNode;
  /** SVG content drawn above the ink (guide, feedback), in the 109×109 box. */
  overlay?: ReactNode;
  maxSize?: number;
  label: string;
}

const INK = "#1a1a1a";
const MIN_W = 2.2;
const MAX_W = 4.8;

function drawStroke(ctx: CanvasRenderingContext2D, s: DrawnStroke, scale: number, color: string, from = 1) {
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  if (s.points.length === 1) {
    ctx.beginPath();
    ctx.arc(s.points[0].x * scale, s.points[0].y * scale, (s.widths[0] * scale) / 2, 0, Math.PI * 2);
    ctx.fill();
    return;
  }
  for (let i = Math.max(1, from); i < s.points.length; i++) {
    const a = s.points[i - 1];
    const b = s.points[i];
    ctx.lineWidth = ((s.widths[i - 1] + s.widths[i]) / 2) * scale;
    ctx.beginPath();
    ctx.moveTo(a.x * scale, a.y * scale);
    ctx.lineTo(b.x * scale, b.y * scale);
    ctx.stroke();
  }
}

/** Square white writing box with a dashed cross grid; draws with mouse, finger or stylus via Pointer Events. */
export function DrawingCanvas({ strokes, onStrokeEnd, colors, disabled, underlay, overlay, maxSize = 320, label }: DrawingCanvasProps) {
  const wrapper = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const [size, setSize] = useState(maxSize);
  const current = useRef<{ stroke: DrawnStroke; lastT: number } | null>(null);

  useEffect(() => {
    const el = wrapper.current?.parentElement;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => setSize(Math.min(maxSize, Math.floor(entry.contentRect.width))));
    ro.observe(el);
    return () => ro.disconnect();
  }, [maxSize]);

  const redraw = useCallback(() => {
    const c = canvas.current;
    const ctx = c?.getContext("2d");
    if (!c || !ctx) return;
    const dpr = window.devicePixelRatio || 1;
    c.width = size * dpr;
    c.height = size * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, size, size);
    const scale = size / GLYPH_BOX;
    strokes.forEach((s, i) => drawStroke(ctx, s, scale, colors?.[i] ?? INK));
  }, [strokes, colors, size]);

  useEffect(redraw, [redraw]);

  const toBox = (e: PointerEvent<HTMLCanvasElement>): Point => {
    const rect = e.currentTarget.getBoundingClientRect();
    return {
      x: ((e.clientX - rect.left) / rect.width) * GLYPH_BOX,
      y: ((e.clientY - rect.top) / rect.height) * GLYPH_BOX,
    };
  };

  const onPointerDown = (e: PointerEvent<HTMLCanvasElement>) => {
    if (disabled || (e.pointerType === "mouse" && e.button !== 0)) return;
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    const p = toBox(e);
    const w = e.pointerType === "pen" && e.pressure > 0 ? MIN_W + (MAX_W - MIN_W) * e.pressure : (MIN_W + MAX_W) / 2 + 0.6;
    current.current = { stroke: { points: [p], widths: [w] }, lastT: e.timeStamp };
    const ctx = canvas.current?.getContext("2d");
    if (ctx) drawStroke(ctx, current.current.stroke, size / GLYPH_BOX, INK);
  };

  const onPointerMove = (e: PointerEvent<HTMLCanvasElement>) => {
    const cur = current.current;
    if (!cur) return;
    const events = e.nativeEvent.getCoalescedEvents?.() ?? [e.nativeEvent];
    const ctx = canvas.current?.getContext("2d");
    const rect = e.currentTarget.getBoundingClientRect();
    const from = cur.stroke.points.length;
    for (const ev of events.length ? events : [e.nativeEvent]) {
      const p = { x: ((ev.clientX - rect.left) / rect.width) * GLYPH_BOX, y: ((ev.clientY - rect.top) / rect.height) * GLYPH_BOX };
      const last = cur.stroke.points[cur.stroke.points.length - 1];
      const d = Math.hypot(p.x - last.x, p.y - last.y);
      if (d < 0.4) continue;
      const dt = Math.max(1, ev.timeStamp - cur.lastT);
      const speed = d / dt; // box units per ms
      // Faster = thinner, like a brush; smoothed to avoid jumps.
      const target = Math.min(MAX_W, Math.max(MIN_W, MAX_W - speed * 9));
      const prevW = cur.stroke.widths[cur.stroke.widths.length - 1];
      cur.stroke.points.push(p);
      cur.stroke.widths.push(prevW * 0.75 + target * 0.25);
      cur.lastT = ev.timeStamp;
    }
    if (ctx) drawStroke(ctx, cur.stroke, size / GLYPH_BOX, INK, from);
  };

  const onPointerUp = () => {
    const cur = current.current;
    current.current = null;
    if (cur) onStrokeEnd(cur.stroke);
  };

  return (
    <div ref={wrapper} className="relative overflow-hidden rounded-2xl bg-white shadow-card ring-1 ring-black/5" style={{ width: size, height: size }}>
      <svg viewBox={`0 0 ${GLYPH_BOX} ${GLYPH_BOX}`} className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden>
        <g stroke="#d9cfc2" strokeWidth={0.5} strokeDasharray="2 2">
          <line x1={GLYPH_BOX / 2} y1={0} x2={GLYPH_BOX / 2} y2={GLYPH_BOX} />
          <line x1={0} y1={GLYPH_BOX / 2} x2={GLYPH_BOX} y2={GLYPH_BOX / 2} />
        </g>
        {underlay}
      </svg>
      <canvas
        ref={canvas}
        role="img"
        aria-label={label}
        className={`absolute inset-0 h-full w-full ${disabled ? "cursor-default" : "cursor-crosshair"}`}
        style={{ touchAction: "none" }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onContextMenu={(e) => e.preventDefault()}
      />
      <svg viewBox={`0 0 ${GLYPH_BOX} ${GLYPH_BOX}`} className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden>
        {overlay}
      </svg>
    </div>
  );
}
