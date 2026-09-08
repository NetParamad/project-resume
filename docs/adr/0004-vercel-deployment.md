# ADR-0004: Deployment target is Vercel (serverless)

**Status:** Accepted — 2026-08-25

## Decision

Production deploys to Vercel as serverless functions.

## Implications

- **Rate limiting:** in-memory limiter (`lib/rate-limit.ts`) counts per-instance and resets on cold start → replace production enforcement with a shared store; preferred choice is Upstash Redis (`@upstash/ratelimit`) since it fits serverless and has negligible latency from Vercel. Keep the in-memory implementation behind the same interface as fallback/dev.
- **PDF text extraction:** ~~module-level `setWorker(path.join(process.cwd(), "node_modules/..."))` breaks under bundled output~~ **Resolved:** `pdf-parse` was dropped; PDF text is now extracted in the browser (`lib/pdf/extract-pdf-text.ts`, lazy `import("pdfjs-dist")` + `new URL(".../pdf.worker.min.mjs", import.meta.url)`). `POST /api/ai/extract-resume` takes `{ text }` JSON — no PDF parsing runs on the server.
- **`maxDuration`:** every AI route (`ats-score`, `tailor`, `polish`, `auto-fill`, `improve`, `extract-resume`) sets `export const maxDuration = 60` (Vercel Hobby ceiling). Without it the platform kills long LLM calls at ~10–15s and returns a non-JSON 504, which surfaces as the generic client error. Raise on a plan that allows more.
- **SSE route (`/api/ai/improve`):** add `AbortController` wiring + stream `cancel()` handling so client disconnects stop upstream LLM calls; mind function `maxDuration` vs the optimizer's up-to-6-round runtime.
