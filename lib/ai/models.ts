export type ModelRole = "autofill" | "extract" | "score" | "agent" | "polish";

export interface ModelMeta {
  label: string;
  supportsTools: boolean;
}

export interface RoleConfig {
  maxTokens?: number;
  temperature?: number;
  timeoutMs?: number;
  maxChain?: number;
  params?: Record<string, unknown>;
}

// Ordered fallback chain. Every id here must be invokable by the configured
// NVIDIA_API_KEY on https://integrate.api.nvidia.com/v1 — ids that 404/410 for
// the account make the whole chain fail. Verify against `GET /v1/models` and a
// real chat completion before adding one.
//
// Order matters a lot for the streaming agent route (maxDuration 60s): a slow
// lead model burns the whole budget before any fallback runs. Measured latency
// on this account (single tool-call round):
//   - nemotron-3.5-lightning-30b : ~16s, tool calls OK   → lead
//   - gpt-oss-20b                : ~70s                   → last resort only
//   - nemotron-3-super-120b      : ~22s, NO tool support  → JSON roles only
//   - minimaxai/minimax-m3       : 410 Gone               → removed
export const MODEL_CHAIN = [
  "nvidia/nemotron-3.5-lightning-30b-a3b",
  "nvidia/nemotron-3-super-120b-a12b",
  "openai/gpt-oss-20b",
] as const;

export const ALLOWED_MODELS: Record<string, ModelMeta> = {
  "nvidia/nemotron-3.5-lightning-30b-a3b": {
    label: "Nemotron-3.5-Lightning-30B",
    supportsTools: true,
  },
  "nvidia/nemotron-3-super-120b-a12b": {
    label: "Nemotron-3-Super-120B",
    supportsTools: false,
  },
  "openai/gpt-oss-20b": {
    label: "GPT-OSS-20B",
    supportsTools: true,
  },
};

export const MODEL_PARAMS: Record<string, Record<string, unknown>> = {
  "openai/gpt-oss-20b": {
    reasoning_effort: "low",
  },
  // Lightning streams its chain-of-thought into `content` by default, which
  // corrupts JSON-only replies — keep thinking off outside the agent role.
  "nvidia/nemotron-3.5-lightning-30b-a3b": {
    chat_template_kwargs: { enable_thinking: false },
  },
  "nvidia/nemotron-3-super-120b-a12b": {
    reasoning_budget: 4096,
    chat_template_kwargs: { enable_thinking: true },
  },
};

export const MODEL_ROLES: Record<ModelRole, RoleConfig> = {
  autofill: {
    // Generous enough that no real autofill answer is ever cut short, but
    // bounded — leaving it unset let a slow/verbose reasoning model run
    // past the route's 60s maxDuration (Vercel kills the function mid-call,
    // which looks like a hang followed by a generic error on the client).
    maxTokens: 16384,
    temperature: 0.4,
    // 3 models × 18s worst case = 54s, under the 60s route maxDuration with
    // room to spare for auth/rate-limit checks either side of the LLM call.
    timeoutMs: 18_000,
  },
  extract: {
    maxTokens: 4096,
    temperature: 0.2,
    // Kept short so both retry passes still finish inside the route's
    // maxDuration; a slow model yields a JSON error, not a platform 504.
    timeoutMs: 14_000,
    maxChain: 2,
    params: {
      chat_template_kwargs: { enable_thinking: false },
    },
  },
  score: {
    maxTokens: 4096,
    temperature: 0.2,
    // Single model only. optimizer.ts's rescore step passes its own
    // *remaining budget* as timeoutMs (up to 40s) expecting that to be the
    // total time spent — but maxChain multiplies it per fallback attempt,
    // not per call. Confirmed live: with maxChain 2 the rescore step alone
    // took ~55s (both models tried), pushing total agent-loop time to 62s —
    // over the 60s route maxDuration. ats.ts's own malformed-JSON retry is
    // the resilience layer here instead of a model-fallback chain.
    timeoutMs: 20_000,
    maxChain: 1,
  },
  agent: {
    // Batched update_section calls carry full section JSON — 8k truncates the
    // tool arguments mid-string and the edit lands as a stringified blob.
    maxTokens: 16384,
    temperature: 0.4,
    timeoutMs: 90_000,
    // optimizer.ts overrides timeoutMs to 40s per call and tracks its own
    // ~52s total budget across up to 2 rounds — but that budget check only
    // runs *between* rounds. Without this, a single round's tool-capable
    // chain (lightning + gpt-oss-20b, the latter measured ~70s per call —
    // see MODEL_CHAIN comment) can burn 2 × 40s = 80s on its own, blowing
    // the 60s route maxDuration before the between-round check ever fires.
    // Cap to the lead model only; optimizer's own checkStop is the fallback.
    maxChain: 1,
  },
  polish: {
    maxTokens: 16384,
    temperature: 0.3,
    // A thrown timeout/network error skips polish.ts's own
    // retry-on-malformed-JSON loop, so keep a 2nd model as the real
    // fallback: 2 × 25s = 50s, under the 60s route maxDuration.
    timeoutMs: 25_000,
    maxChain: 2,
  },
};

export function validateModel(modelId: string): boolean {
  return modelId in ALLOWED_MODELS;
}

// Paid model, deliberately excluded from ALLOWED_MODELS/MODEL_CHAIN so the
// normal `modelId` override path (which routes through the NVIDIA client)
// can never reach it by accident. client.ts special-cases two ways in:
// as the automatic last-resort fallback once every free model fails, or —
// when a caller explicitly passes GEMINI_PRIMARY_OVERRIDE_ID as `modelId`
// (the "Use Gemini first" advanced setting) — as the first model tried,
// with the free chain kept as its own one-shot fallback.
// Verified live against this account: supports tool calls over the OpenAI
// compat endpoint. Priced ~$0.25/$1.50 per M input/output tokens (Sep 2026)
// — cheap enough that even a bad day of fallbacks won't dent a small
// prepaid balance, but it's still real money, hence opt-in/fallback-only.
export const GEMINI_FALLBACK_MODEL = "gemini-3.1-flash-lite";
export const GEMINI_FALLBACK_LABEL = "Gemini 3.1 Flash-Lite";

// Sentinel `modelId` value the UI passes to mean "try Gemini before the
// free chain" — not a real model id, never valid against validateModel().
export const GEMINI_PRIMARY_OVERRIDE_ID = "gemini";

// Every AI route caps maxDuration at 60s (Vercel Hobby limit — see
// app/api/ai/*/route.ts). These bound the one extra network call so it
// can't push a request past that ceiling: skip the fallback entirely once
// less than GEMINI_MIN_TIMEOUT_MS would be left, cap its own timeout at
// GEMINI_MAX_TIMEOUT_MS, and always leave GEMINI_SAFETY_MARGIN_MS of
// headroom for whatever the caller does with the response afterward.
export const GEMINI_TOTAL_BUDGET_MS = 55_000;
export const GEMINI_SAFETY_MARGIN_MS = 5_000;
export const GEMINI_MIN_TIMEOUT_MS = 4_000;
export const GEMINI_MAX_TIMEOUT_MS = 15_000;
