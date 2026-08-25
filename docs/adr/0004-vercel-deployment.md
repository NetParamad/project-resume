# ADR-0004: Deployment target is Vercel (serverless)

**Status:** Accepted — 2026-08-25

## Decision

Production deploys to Vercel as serverless functions.

## Implications

- **Rate limiting:** in-memory limiter (`lib/rate-limit.ts`) counts per-instance and resets on cold start → replace production enforcement with a shared store; preferred choice is Upstash Redis (`@upstash/ratelimit`) since it fits serverless and has negligible latency from Vercel. Keep the in-memory implementation behind the same interface as fallback/dev.
- **pdf-parse/pdfjs worker:** the current module-level `setWorker(path.join(process.cwd(), "node_modules/..."))` will likely break under bundled/standalone output. Import/reference the worker statically so the bundler traces it, and verify `POST /api/ai/extract-resume` on a real deploy before launch.
- **SSE route (`/api/ai/improve`):** add `AbortController` wiring + stream `cancel()` handling so client disconnects stop upstream LLM calls; mind function `maxDuration` vs the optimizer's up-to-6-round runtime.
