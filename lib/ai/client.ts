import OpenAI from "openai";
import {
  ALLOWED_MODELS,
  MODEL_CHAIN,
  MODEL_PARAMS,
  MODEL_ROLES,
  validateModel,
  type ModelRole,
} from "./models";

export const client = new OpenAI({
  baseURL: "https://integrate.api.nvidia.com/v1",
  apiKey: process.env.NVIDIA_API_KEY,
});

export interface LLMChunk {
  content: string | null;
  reasoningContent?: string | null;
  toolCalls: OpenAI.Chat.Completions.ChatCompletionMessageToolCall[];
}

function mergeParams(modelId: string): Record<string, unknown> {
  return MODEL_PARAMS[modelId] ?? {};
}

async function createCompletion(options: {
  modelId: string;
  messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[];
  tools?: OpenAI.Chat.Completions.ChatCompletionTool[];
  maxTokens: number;
  temperature: number;
  params: Record<string, unknown>;
  timeoutMs: number;
}): Promise<OpenAI.Chat.Completions.ChatCompletionMessage> {
  const { modelId, messages, tools, maxTokens, temperature, params, timeoutMs } = options;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await client.chat.completions.create(
      {
        model: modelId,
        messages,
        tools,
        temperature,
        max_tokens: maxTokens,
        stream: false,
        ...params,
      } as unknown as OpenAI.Chat.Completions.ChatCompletionCreateParamsNonStreaming,
      { signal: controller.signal },
    );

    const message = response.choices?.[0]?.message;
    if (!message) throw new Error("Empty LLM response");

    return message as OpenAI.Chat.Completions.ChatCompletionMessage;
  } finally {
    clearTimeout(timer);
  }
}

export async function llmCall(options: {
  role: ModelRole;
  modelId?: string;
  messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[];
  tools?: OpenAI.Chat.Completions.ChatCompletionTool[];
  timeoutMs?: number;
  maxTokens?: number;
  temperature?: number;
}): Promise<OpenAI.Chat.Completions.ChatCompletionMessage> {
  if (!process.env.NVIDIA_API_KEY) {
    throw new Error("NVIDIA_API_KEY is not set");
  }

  const roleConfig = MODEL_ROLES[options.role];
  const override =
    options.modelId && validateModel(options.modelId) ? options.modelId : undefined;

  const chain = override
    ? [override, ...MODEL_CHAIN.filter((m) => m !== override)]
    : [...MODEL_CHAIN];

  const activeChain = options.tools
    ? chain.filter((m) => ALLOWED_MODELS[m]?.supportsTools !== false)
    : chain;
  const limitedChain = roleConfig.maxChain ? activeChain.slice(0, roleConfig.maxChain) : activeChain;

  const maxTokens = options.maxTokens ?? roleConfig.maxTokens ?? 4096;
  const temperature = options.temperature ?? roleConfig.temperature ?? 0.5;
  const timeoutMs = options.timeoutMs ?? roleConfig.timeoutMs ?? 25_000;

  const errors: string[] = [];

  for (let i = 0; i < limitedChain.length; i++) {
    const modelId = limitedChain[i];
    const params = { ...mergeParams(modelId), ...(roleConfig.params ?? {}) };
    try {
      return await createCompletion({
        modelId,
        messages: options.messages,
        tools: options.tools,
        maxTokens,
        temperature,
        params,
        timeoutMs,
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      errors.push(`${modelId}: ${msg}`);
      if (i === limitedChain.length - 1) {
        const last = new Error(`All AI models failed. ${errors.join(" | ")}`);
        throw last;
      }
    }
  }

  throw new Error(`All AI models failed. ${errors.join(" | ")}`);
}

export async function llmText(options: {
  role: ModelRole;
  modelId?: string;
  system?: string;
  user: string;
  timeoutMs?: number;
  maxTokens?: number;
  temperature?: number;
}): Promise<string> {
  const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
    ...(options.system ? [{ role: "system" as const, content: options.system }] : []),
    { role: "user", content: options.user },
  ];

  const message = await llmCall({
    role: options.role,
    modelId: options.modelId,
    messages,
    timeoutMs: options.timeoutMs,
    maxTokens: options.maxTokens,
    temperature: options.temperature,
  });

  return (message.content ?? "").trim();
}

export { ALLOWED_MODELS, validateModel };
export type { ModelRole };
