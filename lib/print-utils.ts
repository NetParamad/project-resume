"use client";

export const A4_PAGE_HEIGHT_PX = 1122.5;
export const FIT_THRESHOLD_PX = 1080;
export const MIN_SCALE = 0.15;
export const HEAVY_SCALE_THRESHOLD = 0.5;

const ZOOM_TOLERANCE = 0.25;
const PAGE_SLACK_PX = 2;
const MAX_FIT_ITERATIONS = 6;

let printQueued = false;
let fitting = false;

function getPrintElement(): HTMLElement | null {
  return document.querySelector(".print-resume");
}

function triggerPrint(): void {
  if (printQueued) return;
  printQueued = true;
  // Defer so the click handler returns and React can paint (e.g. the toast)
  // before the browser blocks the main thread on the native print dialog.
  setTimeout(() => {
    const done = () => {
      printQueued = false;
      window.removeEventListener("afterprint", done);
    };
    window.addEventListener("afterprint", done);
    window.print();
    // Fallback: afterprint doesn't fire if the dialog is cancelled in
    // some browsers, so release the guard shortly after it closes.
    setTimeout(done, 500);
  }, 50);
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function waitForPrintAssets(el: HTMLElement): Promise<void> {
  try {
    await Promise.race([
      document.fonts?.ready ?? Promise.resolve(),
      sleep(1200),
    ]);
  } catch {
    // Font readiness is best-effort; fall back to whatever is loaded.
  }
  const pending = Array.from(el.querySelectorAll("img")).filter(
    (img) => !img.complete
  );
  if (pending.length > 0) {
    await Promise.race([
      Promise.all(
        pending.map(
          (img) =>
            new Promise<void>((resolve) => {
              img.addEventListener("load", () => resolve(), { once: true });
              img.addEventListener("error", () => resolve(), { once: true });
            })
        )
      ),
      sleep(2000),
    ]);
  }
}

/** Width of an A4 page in CSS pixels (matches the print stylesheet). */
const A4_WIDTH = 794;

const OFFSCREEN_STYLE = `display:block !important; position:absolute !important; top:0; left:-10000px; width:${A4_WIDTH}px; margin:0; padding:0; visibility:hidden;`;

function loosenOverflowChildren(el: HTMLElement): Array<[HTMLElement, string]> {
  const clipped: Array<[HTMLElement, string]> = [];
  el.querySelectorAll<HTMLElement>(".overflow-hidden").forEach((child) => {
    clipped.push([child, child.style.overflow]);
    child.style.overflow = "visible";
  });
  return clipped;
}

/**
 * Set the zoom scale. Zoom is the ONLY scaling mechanism that participates
 * in the print layout pass, so it is what makes a one-page PDF possible —
 * a CSS transform leaves the layout height untouched (browser paginates the
 * natural height) and clips content the moment `overflow:hidden` is set.
 */
function applyScale(el: HTMLElement, scale: number): void {
  el.style.zoom = String(scale);
}

function resetScale(el: HTMLElement): void {
  el.style.zoom = "";
}

/**
 * Re-center the zoomed copy on the paper. Zoom shrinks the layout box but
 * keeps it anchored at the top-left corner — without a nudge the whole
 * resume prints in a left-aligned column and leaves an uneven white band
 * on the right. Chrome translates the `left` offset to `left * zoom * 2/3`
 * on the printed page and renders the box itself at `794 * zoom * 2/3`
 * wide, so the offset that lands the box dead-center is
 * `(794 * (1 - zoom*2/3)) / (zoom*4/3)` (verified against the rasterised
 * output for a range of scale factors).
 */
function centerScaledCopy(el: HTMLElement, scale: number): void {
  el.style.setProperty("position", "absolute", "important");
  el.style.setProperty("top", "0", "important");
  const leftCss = Math.round(
    (A4_WIDTH - (A4_WIDTH * scale * 2) / 3) / ((scale * 4) / 3)
  );
  el.style.setProperty("left", `${leftCss}px`, "important");
}

/**
 * Scale that should be attempted first so content of the given natural
 * height fits within one printable page.
 */
export function computeInitialScale(
  naturalHeight: number,
  threshold: number = FIT_THRESHOLD_PX,
  minScale: number = MIN_SCALE
): number {
  if (naturalHeight <= threshold) return 1;
  return Math.max(minScale, threshold / naturalHeight);
}

export type FitStepAction = "fits" | "retry" | "truncated" | "unsupported";

export interface FitStep {
  action: FitStepAction;
  scale: number;
}

export interface SolveFitResult {
  /** Outcome of the search: the loop budget ran out while still refining. */
  action: FitStepAction;
  /** Scale factor the last step was measured at — apply it verbatim. */
  scale: number;
}

/**
 * Iteratively refine the scale until the measured height fits one page.
 * `measure` must return the element's rendered height at the given scale (a
 * hidden offscreen rect). Action semantics on return:
 * - "fits": measured height is within the threshold. Apply `scale`, done.
 * - "truncated": stuck at the minimum scale — content cannot fully fit.
 * - "unsupported": scaling had no (or an implausible) effect — print unscaled.
 * - "retry": budget exhausted while still refining — treat like "truncated".
 */
export function solveFitScale(
  naturalHeight: number,
  measure: (scale: number) => number,
  maxIterations: number = MAX_FIT_ITERATIONS
): SolveFitResult {
  let step: FitStep = {
    action: "retry",
    scale: computeInitialScale(naturalHeight),
  };
  for (let i = 0; i < maxIterations && step.action === "retry"; i++) {
    step = evaluateFitStep(naturalHeight, step.scale, measure(step.scale));
  }
  return { action: step.action, scale: step.scale };
}

/**
 * Pure decision step for the fit-to-one-page loop.
 * - "unsupported": zoom had no (or an implausible) effect on layout.
 * - "fits": actual height now fits inside one page.
 * - "retry": still too tall — try the returned smaller scale.
 * - "truncated": the scale cannot move forward (hit the minimum) and the
 *   content is still too tall — it cannot fully fit. A few pixels over the
 *   slack still refine ("retry") because that next step fits.
 */
export function evaluateFitStep(
  naturalHeight: number,
  scale: number,
  actualHeight: number,
  threshold: number = FIT_THRESHOLD_PX,
  minScale: number = MIN_SCALE
): FitStep {
  const expected = naturalHeight * scale;
  if (
    !Number.isFinite(actualHeight) ||
    expected <= 0 ||
    actualHeight > expected * (1 + ZOOM_TOLERANCE) ||
    actualHeight < expected * (1 - ZOOM_TOLERANCE)
  ) {
    return { action: "unsupported", scale };
  }
  if (actualHeight <= threshold + PAGE_SLACK_PX) {
    return { action: "fits", scale };
  }
  const refined = Math.max(minScale, (scale * threshold) / actualHeight);
  // Zero forward progress (scale clamped at the minimum). Any real
  // refinement, however small, gets one more measured step — a shrink of
  // even 0.4% resolves the common "just a few px over the slack" case.
  if (refined >= scale) {
    return { action: "truncated", scale: Math.min(scale, refined) };
  }
  return { action: "retry", scale: refined };
}

const FORCED_PROPS = [
  "display",
  "position",
  "visibility",
  "left",
  "top",
  "margin",
  "padding",
] as const;

/**
 * Last-resort guarantee: inline !important beats any stylesheet state,
 * so even a missing/stale print stylesheet cannot produce a blank page.
 */
function forcePrintable(el: HTMLElement): void {
  el.style.setProperty("display", "block", "important");
  el.style.setProperty("position", "static", "important");
  el.style.setProperty("visibility", "visible", "important");
  el.style.setProperty("left", "0", "important");
  el.style.setProperty("top", "0", "important");
  el.style.setProperty("margin", "0", "important");
  el.style.setProperty("padding", "0", "important");
}

function clearForcedStyles(el: HTMLElement): void {
  FORCED_PROPS.forEach((prop) => el.style.removeProperty(prop));
}

export interface PrintFitCallbacks {
  /** Content was auto-scaled down to fit one page. */
  onScaled?: (scale: number) => void;
  /** Content is too long: it was shrunk to the minimum or may be cut off. */
  onTooLong?: (scale: number) => void;
  /** Scaling had no effect; output may be clipped. */
  onCannotFit?: () => void;
}

export async function printResumeFitToOnePage(
  callbacks: PrintFitCallbacks = {}
): Promise<void> {
  const el = getPrintElement();
  if (!el) {
    triggerPrint();
    return;
  }
  // A run is already in flight — it owns printing. Printing now would catch
  // the copy mid-measurement in its hidden offscreen state (blank page).
  if (fitting) return;
  fitting = true;

  const prevCss = el.style.cssText;
  let finalScale: number | null = null;
  let fittedHeight = 0;
  let outcome: "fits" | "too-long" | "cannot-fit" = "fits";

  try {
    resetScale(el);
    el.style.cssText = OFFSCREEN_STYLE;
    const clipped = loosenOverflowChildren(el);

    try {
      await waitForPrintAssets(el);

      const naturalHeight = el.scrollHeight;
      if (naturalHeight > FIT_THRESHOLD_PX) {
        const step = solveFitScale(naturalHeight, (scale) => {
          applyScale(el, scale);
          return el.getBoundingClientRect().height;
        });

        if (step.action === "unsupported") {
          outcome = "cannot-fit";
        } else {
          finalScale = step.scale;
          fittedHeight = Math.round(naturalHeight * step.scale);
          // "too-long" fires when content cannot fully fit OR was shrunk
          // below half its natural size (ADR-0001: too small to read). A
          // fit at >= 0.5x always prints one complete page.
          const tooLong =
            step.action !== "fits" || step.scale < HEAVY_SCALE_THRESHOLD;
          if (tooLong) outcome = "too-long";
        }
      }
    } finally {
      clipped.forEach(([child, overflow]) => {
        child.style.overflow = overflow;
      });
    }
  } catch {
    // Measurement failed — print unscaled rather than not at all.
    finalScale = null;
    outcome = "cannot-fit";
  } finally {
    // ALWAYS restore the element's real inline styles before printing.
    // The offscreen style uses !important and would otherwise win over the
    // print stylesheet, leaving a blank page (left:-10000px/hidden).
    el.style.cssText = prevCss;
    if (finalScale !== null) {
      applyScale(el, finalScale);
      // Escape the print stylesheet's fixed 1122px overflow:hidden box: at
      // scale s it clips content to 1122*s of its natural height. Size the
      // box to the fitted height instead so the whole resume prints and the
      // zoomed content fills the sheet.
      if (fittedHeight > 0) {
        el.style.height = `${fittedHeight}px`;
        el.style.overflow = "visible";
      }
    }
    // Reveal regardless of stylesheet state, then clean up after printing.
    forcePrintable(el);
    // Zoom anchors the shrunk copy top-left; re-center it so the paper is
    // symmetric (must run after forcePrintable's left:0/position:static).
    if (finalScale !== null) centerScaledCopy(el, finalScale);
    fitting = false;

    if (outcome === "too-long") callbacks.onTooLong?.(finalScale ?? MIN_SCALE);
    else if (outcome === "cannot-fit") callbacks.onCannotFit?.();
    else if (finalScale !== null) callbacks.onScaled?.(finalScale);
  }

  const cleanup = () => {
    resetScale(el);
    clearForcedStyles(el);
    window.removeEventListener("afterprint", cleanup);
  };
  window.addEventListener("afterprint", cleanup);
  // afterprint doesn't fire when the dialog is cancelled in some browsers.
  setTimeout(cleanup, 1000);
  triggerPrint();
}
