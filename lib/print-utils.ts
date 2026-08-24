"use client";

export const A4_PAGE_HEIGHT_PX = 1122.5;
const FIT_THRESHOLD_PX = 1080;
const MIN_SCALE = 0.15;

function getPrintElement(): HTMLElement | null {
  return document.querySelector(".print-resume");
}

export function measurePrintHeight(): number {
  const el = getPrintElement();
  if (!el) return 0;

  const prev = el.style.cssText;
  el.style.cssText =
    "display:block !important; position:absolute !important; top:0; left:-10000px; width:794px; margin:0; padding:0; visibility:hidden;";

  const clipped: Array<[HTMLElement, string]> = [];
  el.querySelectorAll<HTMLElement>(".overflow-hidden").forEach((child) => {
    clipped.push([child, child.style.overflow]);
    child.style.overflow = "visible";
  });

  const height = el.scrollHeight;

  clipped.forEach(([child, overflow]) => {
    child.style.overflow = overflow;
  });
  el.style.cssText = prev;
  return height;
}

export function printResumeFitToOnePage(
  onScaled?: () => void,
  onCannotFit?: () => void,
): void {
  const el = getPrintElement();
  if (!el) {
    window.print();
    return;
  }

  el.style.zoom = "";
  const height = measurePrintHeight();

  if (height <= FIT_THRESHOLD_PX) {
    window.print();
    return;
  }

  if (typeof el.style.zoom === "undefined") {
    onCannotFit?.();
    window.print();
    return;
  }

  const scale = Math.max(MIN_SCALE, FIT_THRESHOLD_PX / height);
  el.style.zoom = String(scale);

  // scrollHeight ignores zoom — use getBoundingClientRect (reflects zoom)
  // to verify the scale actually took effect in this browser.
  const rectHeight = el.getBoundingClientRect().height;
  const expected = height * scale;
  if (
    !Number.isFinite(rectHeight) ||
    rectHeight > expected * 1.25 ||
    rectHeight < expected * 0.75
  ) {
    el.style.zoom = "";
    onCannotFit?.();
    window.print();
    return;
  }

  onScaled?.();

  const cleanup = () => {
    el.style.zoom = "";
    window.removeEventListener("afterprint", cleanup);
  };
  window.addEventListener("afterprint", cleanup);

  window.print();
}
