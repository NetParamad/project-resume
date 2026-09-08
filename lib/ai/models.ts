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
export const MODEL_CHAIN = [
  "openai/gpt-oss-20b",
  "minimaxai/minimax-m3",
  "nvidia/nemotron-3.5-lightning-30b-a3b",
  "nvidia/nemotron-3-super-120b-a12b",
] as const;

export const ALLOWED_MODELS: Record<string, ModelMeta> = {
  "openai/gpt-oss-20b": {
    label: "GPT-OSS-20B",
    supportsTools: true,
  },
  "minimaxai/minimax-m3": {
    label: "MiniMax-M3",
    supportsTools: true,
  },
  "nvidia/nemotron-3.5-lightning-30b-a3b": {
    label: "Nemotron-3.5-Lightning-30B",
    supportsTools: true,
  },
  "nvidia/nemotron-3-super-120b-a12b": {
    label: "Nemotron-3-Super-120B",
    supportsTools: false,
  },
};

export const MODEL_PARAMS: Record<string, Record<string, unknown>> = {
  "openai/gpt-oss-20b": {
    reasoning_effort: "low",
  },
  "minimaxai/minimax-m3": {},
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
    maxTokens: 4096,
    temperature: 0.4,
    timeoutMs: 50_000,
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
    maxTokens: 8192,
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
