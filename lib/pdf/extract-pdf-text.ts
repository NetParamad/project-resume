"use client";

/**
 * Pulls plain text out of a PDF entirely in the browser, so the server never
 * needs a PDF parser (pdfjs' worker path is fragile under serverless bundling).
 * pdfjs is loaded lazily on first use to keep it out of the main bundle.
 */

type PdfjsModule = typeof import("pdfjs-dist");

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
      let pageText = "";
      for (const item of content.items) {
        if (!("str" in item)) continue;
        pageText += item.str;
        pageText += item.hasEOL ? "\n" : " ";
      }
      pages.push(pageText.trim());
      page.cleanup();
    }
    const text = pages.join("\n\n").normalize("NFC").replace(/[ \t]+\n/g, "\n").trim();
    return { text, hasText: text.length > 0 };
  } finally {
    await doc.destroy();
  }
}
