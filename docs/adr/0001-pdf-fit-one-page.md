# ADR-0001: PDF export guarantees a single A4 page via portaled print copy + iterative zoom fit

**Status:** Accepted (implementation in progress) — 2026-08-25

## Context

PDF export is browser-print based: a hidden `.print-resume` copy of the resume is revealed by `@media print` rules and `window.print()` is invoked; the user "saves as PDF". Two defects made long resumes exceed or lose content:

1. **Scaling never worked.** `printResumeFitToOnePage()` set `zoom`, then verified with `getBoundingClientRect().height` while `.print-resume` was `display:none` on screen — the rect height was always `0`, so verification failed, zoom was reset, and content longer than 1122px was silently clipped by the fixed-height `overflow:hidden` print box. Affected every template.
2. **Blank extra pages.** Non-print UI was hidden with `visibility:hidden`, which still occupies layout. Whenever app UI height exceeded one A4 page (tall monitors, mobile builder), the PDF contained trailing blank pages.
3. Thai web fonts and avatar images could finish loading after measurement, making measured height wrong.

## Decision

- Render the printable copy through a React portal to `document.body` (`PrintResumePortal`). Print CSS then does `body > *:not(.print-root) { display:none }`, so pagination depends solely on the resume.
- Keep the print box at 794×1122px with `overflow:hidden` in the stylesheet as the **unscalable fallback** (worst case clips instead of spilling to page 2). On the fitted path the code replaces the box's height with the fitted height and `overflow:visible` at print time, because the fixed box clips a scaled copy to 1122×scale of its natural height, and re-centers the zoomed copy horizontally via `centerScaledCopy()` (Chrome anchors zoomed content top-left, producing a lopsided page).
- Measure offscreen (visible at `left:-10000px`), await `document.fonts.ready` and in-flight images (capped ~2s), then iteratively solve the `zoom` scale (max 6 steps, floor `MIN_SCALE = 0.15`) via the pure helper `evaluateFitStep()`/`solveFitScale()`.
- Toast outcomes: auto-scaled → info; too long (floored at minimum, shrunk below 0.5×, or iterations exhausted) → error warning naming that content may be cut/too small; scaling unsupported → error.

## Consequences

- Call sites pass an options object `{ onScaled, onTooLong, onCannotFit }`; the function is async.
- Any change to preview rendering must be mirrored in both portal call sites (`BuilderLayout.tsx`, `ShareResumeView.tsx`).
- Pure fit logic lives next to `lib/print-utils.ts` and is unit tested (`lib/print-utils.test.ts`).
- The print-time overrides (`height`, `overflow`, centering `position/left`) are `!important` where needed to beat `forcePrintable()` and the stylesheet, and are cleared again with the other forced styles in the print cleanup.
- Horizontal centering is empirical but pinned to DOM print geometry: under `zoom` Chrome scales the printed box by `scale` in both axes (box sits at `leftCss·scale`, `794·scale` wide on the 794px sheet), so `leftCss = 794·(1-scale)/(2·scale)` puts it dead-center — verified against rasterised PDF output; keep `centerScaledCopy()`'s formula in sync if browser print behaviour changes.
