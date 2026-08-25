# ADR-0003: Strict input-limit profile

**Status:** Implemented (body cap, zod bounds, CRUD rate limit, upload cap) — 2026-08-25

## Context

Nothing bounds what a client can push into Postgres or server memory: zod schemas accept unbounded arrays/strings, `/api/resumes` CRUD has no rate limit despite 1.5s client autosave, and the PDF upload path loads the whole file into RAM with no size check. One user can exhaust DB/storage/AI budget.

## Decision

Adopt the strict profile:

- Cap JSON request bodies (~1 MB) centrally in `parseJsonBody` → `413` above the cap.
- Add explicit max bounds to all zod schemas: string lengths and array lengths per field (`resumeDataSchema` and friends). Bounds must be generous enough for real CVs but finite.
- Rate-limit resumes CRUD (e.g. 60 req / 5 min / user) using the shared limiter abstraction.
- Cap PDF uploads at 10 MB: reject early on `file.size` and re-check byte length after buffering.

## Consequences

- API-level limit errors stay English but carry machine-readable fields (`code: "body_too_large" | "rate_limited"`, `maxBytes`, `retryAfterSec`) so clients can map them to localized messages; the PDF upload route localizes inline since it already branches on `locale`.
- The zod `template` enum mirrors the DB CHECK constraint exactly (same 7 ids), so it cannot reject previously storable values.
- Bounds changes require updating co-located tests under `lib/validation`.
- The limiter store itself is governed by the deployment-target ADR.
