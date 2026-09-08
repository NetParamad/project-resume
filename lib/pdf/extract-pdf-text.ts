"use client";

/**
 * Pulls plain text out of a PDF entirely in the browser, so the server never
 * needs a PDF parser (pdfjs' worker path is fragile under serverless bundling).
 * pdfjs is loaded lazily on first use to keep it out of the main bundle.
 *
 * Thai (and other space-less scripts) need care: pdfjs emits each positioned
 * run — and often each combining vowel/tone mark — as its own text item. Naively
 * joining items with a space shreds words ("ประสบการ ณ์ ทํา งาน"). Instead we
 * only insert a separator when the glyph positions show a real gap, then
 * NFC-normalize so split marks recompose.
 */

type PdfjsModule = typeof import("pdfjs-dist");
type TextItemLike = {
  str: string;
  transform: number[];
  width: number;
  height: number;
  hasEOL: boolean;
};

let pdfjsPromise: Promise<PdfjsModule> | null = null;

async function loadPdfjs(): Promise<PdfjsModule> {
  if (!pdfjsPromise) {
    pdfjsPromise = import("pdfjs-dist").then((pdfjs) => {
      pdfjs.GlobalWorkerOptions.workerSrc = new URL(
        "pdfjs-dist/build/pdf.worker.min.mjs",
        import.meta.url,
      ).toString();
      return pdfjs;
    });
  }
  return pdfjsPromise;
}

const endsWithSpace = (s: string) => /\s$/.test(s);
const startsWithSpace = (s: string) => /^\s/.test(s);

const THAI = "\\u0E00-\\u0E7F";

/**
 * Repairs the two ways pdfjs mangles Thai on extraction:
 *  1. SARA AM (ำ) comes out decomposed as NIKHAHIT + SARA AA — NFC won't
 *     recombine it, so do it explicitly.
 *  2. Glyph-level runs leave stray spaces mid-word. Thai is written without
 *     word spaces, so a space flanked by Thai letters is spurious and dropped
 *     (spaces next to digits / Latin — "8 ปี", "ธุรกิจ IT" — are kept).
 * Lookahead only (no lookbehind: Safari 16.0–16.3 lack it).
 */
export function normalizeThaiSpacing(input: string): string {
  return input
    .replace(new RegExp(`([${THAI}])[ \\t]+(?=[${THAI}])`, "g"), "$1")
    .replace(/ํา/g, "ำ");
}

function itemsToText(items: TextItemLike[]): string {
  let out = "";
  let prevEndX: number | null = null;
  let prevBaseline: number | null = null;
  let prevHeight = 0;

  for (const item of items) {
    const x = item.transform[4];
    const y = item.transform[5];
    const height = item.height || prevHeight || 10;

    if (prevEndX !== null && prevBaseline !== null) {
      const sameLine = Math.abs(y - prevBaseline) <= Math.max(height, prevHeight) * 0.5;
      if (!sameLine) {
        if (!out.endsWith("\n")) out += "\n";
      } else {
        const gap = x - prevEndX;
        // A real word break is roughly a quarter-em or wider. Anything less
        // (including the zero / negative advance of a stacked Thai mark) joins.
        const needsSpace =
          gap > Math.max(height, prevHeight) * 0.25 &&
          !endsWithSpace(out) &&
          !startsWithSpace(item.str);
        if (needsSpace) out += " ";
      }
    }

    out += item.str;
    if (item.hasEOL && !out.endsWith("\n")) out += "\n";

    prevEndX = x + (item.width || 0);
    prevBaseline = y;
    prevHeight = height;
  }

  return out;
}

/** Extracted text plus a hint that the PDF carried no selectable text (scanned). */
export interface PdfTextResult {
  text: string;
  hasText: boolean;
}

export async function extractPdfText(file: File): Promise<PdfTextResult> {
  const pdfjs = await loadPdfjs();
  const data = new Uint8Array(await file.arrayBuffer());
  const doc = await pdfjs.getDocument({ data, isEvalSupported: false }).promise;

  try {
    const pages: string[] = [];
    for (let pageNum = 1; pageNum <= doc.numPages; pageNum++) {
      const page = await doc.getPage(pageNum);
      const content = await page.getTextContent();
      const items = content.items.filter(
        (it) => "str" in it && Array.isArray((it as { transform?: unknown }).transform),
      ) as unknown as TextItemLike[];
      pages.push(itemsToText(items).trim());
      page.cleanup();
    }
    const text = normalizeThaiSpacing(
      pages
        .join("\n\n")
        .normalize("NFC")
        .replace(/[ \t]+\n/g, "\n")
        .replace(/\n{3,}/g, "\n\n")
        .replace(/[ \t]{2,}/g, " "),
    ).trim();
    return { text, hasText: text.length > 0 };
  } finally {
    await doc.destroy();
  }
}
