# 0003. Rule-based stroke matching (no AI)
Date: 2026-10-26
Status: Accepted

## Context
The calligraphy exercise must tell the learner whether each stroke is correct, reversed or drawn in
the wrong order. It must run offline in the browser, be explainable, and be testable.

## Decision
`services/strokeMatcher.ts` compares the drawn strokes with the KanjiVG strokes. Both are expressed in the same 109×109 box:
1. Light global alignment: bounding-box centres are aligned to 60% and scale is clamped to ±30%, so a slightly offset drawing is tolerated but position still matters.
2. Each stroke is resampled to 32 equidistant points.
3. Per stroke, three things are measured: the **position** (distance between centroids), the **direction** (start/end points compared with the reversed pairing) and the **shape** (mean point distance once both strokes are centred).
4. Each stroke gets a status: `correct` (green), `reversed` or `misordered` (orange), `wrong` or `extra` (red). The global score is out of 100, and missing or extra strokes are penalised.
5. Tolerances (`easy` / `normal` / `strict`) are thresholds on shape and position.

## Alternatives considered
- **ML recognition (e.g. a handwriting model)**: heavier, opaque, and it doesn't check stroke order or direction.
- **$1 / $P recognizers**: these classify gestures among candidates. Here the target is known, and a per-stroke diagnosis is needed.
- **Dynamic time warping**: more robust to speed variations, but resampling by arc length already makes the comparison speed-independent at a lower cost.

## Consequences
- Pros: deterministic, unit-tested with real KanjiVG data, instant feedback.
- Cons: thresholds are empirical and may need tuning with real users. Very small strokes (dakuten) are not judged on direction.
