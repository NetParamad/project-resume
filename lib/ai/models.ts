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

export const MODEL_CHAIN = [
  "openai/gpt-oss-120b",
  "nvidia/nemotron-3-super-120b-a12b",
  "google/gemma-4-31b-it",
  "deepseek-ai/deepseek-v4-pro",
  "nvidia/llama-3.3-nemotron-super-49b-v1.5",
] as const;

export const ALLOWED_MODELS: Record<string, ModelMeta> = {
  "openai/gpt-oss-120b": {
    label: "GPT-OSS-120B",
    supportsTools: true,
  },
  "nvidia/nemotron-3-super-120b-a12b": {
    label: "Nemotron-3-Super-120B",
    supportsTools: true,
  },
  "google/gemma-4-31b-it": {
    label: "Gemma-4-31B-IT",
    supportsTools: false,
  },
  "deepseek-ai/deepseek-v4-pro": {
    label: "DeepSeek-V4-Pro",
    supportsTools: true,
  },
  "nvidia/llama-3.3-nemotron-super-49b-v1.5": {
    label: "Llama-3.3-Nemotron-49B",
    supportsTools: true,
  },
};

export const MODEL_PARAMS: Record<string, Record<string, unknown>> = {
  "openai/gpt-oss-120b": {
    reasoning_effort: "low",
  },
  "nvidia/nemotron-3-super-120b-a12b": {
    reasoning_budget: 4096,
    chat_template_kwargs: { enable_thinking: true },
  },
  "google/gemma-4-31b-it": {},
  "deepseek-ai/deepseek-v4-pro": {},
  "nvidia/llama-3.3-nemotron-super-49b-v1.5": {},
};

export const MODEL_ROLES: Record<ModelRole, RoleConfig> = {
  autofill: {
    maxTokens: 4096,
    temperature: 0.4,
    timeoutMs: 50_000,
  },
  tailor: {
    maxTokens: 8192,
    temperature: 0.3,
    timeoutMs: 90_000,
  },
  extract: {
    maxTokens: 4096,
    temperature: 0.2,
    timeoutMs: 60_000,
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
    maxTokens: 8192,
    temperature: 0.3,
    timeoutMs: 60_000,
  },
};

export function validateModel(modelId: string): boolean {
  return modelId in ALLOWED_MODELS;
}
