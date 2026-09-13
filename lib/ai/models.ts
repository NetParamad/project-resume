export type ModelRole =
  | "autofill"
  | "tailor"
  | "extract"
  | "score"
  | "agent"
  | "polish";

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
  tailor: {
    maxTokens: 16384,
    temperature: 0.3,
    timeoutMs: 90_000,
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
    timeoutMs: 50_000,
  },
  agent: {
    // Batched update_section calls carry full section JSON — 8k truncates the
    // tool arguments mid-string and the edit lands as a stringified blob.
    maxTokens: 16384,
    temperature: 0.4,
    timeoutMs: 90_000,
  },
  polish: {
    maxTokens: 16384,
    temperature: 0.3,
    timeoutMs: 60_000,
  },
};

export function validateModel(modelId: string): boolean {
  return modelId in ALLOWED_MODELS;
}
