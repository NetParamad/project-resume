"use client";

export const A4_PAGE_HEIGHT_PX = 1122.5;
export const FIT_THRESHOLD_PX = 1080;
export const MIN_SCALE = 0.15;
export const HEAVY_SCALE_THRESHOLD = 0.5;

const ZOOM_TOLERANCE = 0.25;
const PAGE_SLACK_PX = 2;
const MAX_FIT_ITERATIONS = 4;

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
    await Promise.race([document.fonts?.ready ?? Promise.resolve(), sleep(1200)]);
  } catch {
    // Font readiness is best-effort; fall back to whatever is loaded.
  }
  const pending = Array.from(el.querySelectorAll("img")).filter((img) => !img.complete);
  if (pending.length > 0) {
    await Promise.race([
      Promise.all(
        pending.map(
          (img) =>
            new Promise<void>((resolve) => {
              img.addEventListener("load", () => resolve(), { once: true });
              img.addEventListener("error", () => resolve(), { once: true });
            }),
        ),
      ),
      sleep(2000),
    ]);
  }
}

const OFFSCREEN_STYLE =
  "display:block !important; position:absolute !important; top:0; left:-10000px; width:794px; margin:0; padding:0; visibility:hidden;";

function loosenOverflowChildren(el: HTMLElement): Array<[HTMLElement, string]> {
  const clipped: Array<[HTMLElement, string]> = [];
  el.querySelectorAll<HTMLElement>(".overflow-hidden").forEach((child) => {
    clipped.push([child, child.style.overflow]);
    child.style.overflow = "visible";
  });
  return clipped;
}

/**
 * Scale that should be attempted first so content of the given natural
 * height fits within one printable page.
 */
export function computeInitialScale(
  naturalHeight: number,
  threshold: number = FIT_THRESHOLD_PX,
  minScale: number = MIN_SCALE,
): number {
  if (naturalHeight <= threshold) return 1;
  return Math.max(minScale, threshold / naturalHeight);
}

export type FitStepAction = "fits" | "retry" | "truncated" | "unsupported";

export interface FitStep {
  action: FitStepAction;
  scale: number;
}

/**
 * Pure decision step for the fit-to-one-page loop.
 * - "unsupported": zoom had no (or an implausible) effect on layout.
 * - "fits": actual height now fits inside one page.
 * - "retry": still too tall — try the returned smaller scale.
 * - "truncated": already at (or not meaningfully below) the previous scale
 *   and still too tall — content cannot fully fit.
 */
export function evaluateFitStep(
  naturalHeight: number,
  scale: number,
  actualHeight: number,
  threshold: number = FIT_THRESHOLD_PX,
  minScale: number = MIN_SCALE,
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
  if (refined >= scale - 0.005) {
    return { action: "truncated", scale: Math.min(scale, refined) };
  }
  return { action: "retry", scale: refined };
}

function resetZoom(el: HTMLElement): void {
  el.style.zoom = "";
}

const FORCED_PROPS = ["display", "position", "visibility", "left", "top", "margin", "padding"] as const;

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
  /** Browser does not support zoom-based scaling; output may be clipped. */
  onCannotFit?: () => void;
}


export async function printResumeFitToOnePage(
  callbacks: PrintFitCallbacks = {},
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
  let outcome: "fits" | "too-long" | "cannot-fit" = "fits";

  try {
    resetZoom(el);
    el.style.cssText = OFFSCREEN_STYLE;
    const clipped = loosenOverflowChildren(el);

    try {
      await waitForPrintAssets(el);

      const naturalHeight = el.scrollHeight;
      if (naturalHeight > FIT_THRESHOLD_PX) {
        let step: FitStep = { action: "retry", scale: computeInitialScale(naturalHeight) };
        for (let i = 0; i < MAX_FIT_ITERATIONS && step.action === "retry"; i++) {
          el.style.zoom = String(step.scale);
          const actualHeight = el.getBoundingClientRect().height;
          step = evaluateFitStep(naturalHeight, step.scale, actualHeight);
        }

        if (step.action === "unsupported") {
          outcome = "cannot-fit";
        } else {
          finalScale = step.scale;
          const truncated =
            step.action !== "fits" ||
            step.scale < HEAVY_SCALE_THRESHOLD;
          if (truncated) outcome = "too-long";
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
      el.style.zoom = String(finalScale);
    }
    // Reveal regardless of stylesheet state, then clean up after printing.
    forcePrintable(el);
    fitting = false;

    if (outcome === "too-long") callbacks.onTooLong?.(finalScale ?? MIN_SCALE);
    else if (outcome === "cannot-fit") callbacks.onCannotFit?.();
    else if (finalScale !== null) callbacks.onScaled?.(finalScale);
  }

  const cleanup = () => {
    resetZoom(el);
    clearForcedStyles(el);
    window.removeEventListener("afterprint", cleanup);
  };
  window.addEventListener("afterprint", cleanup);
  // afterprint doesn't fire when the dialog is cancelled in some browsers.
  setTimeout(cleanup, 1000);
  triggerPrint();
}
