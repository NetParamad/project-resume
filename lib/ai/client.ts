import OpenAI from "openai";
import {
  ALLOWED_MODELS,
  GEMINI_FALLBACK_MODEL,
  GEMINI_MAX_TIMEOUT_MS,
  GEMINI_MIN_TIMEOUT_MS,
  GEMINI_PRIMARY_OVERRIDE_ID,
  GEMINI_SAFETY_MARGIN_MS,
  GEMINI_TOTAL_BUDGET_MS,
  MODEL_CHAIN,
  MODEL_PARAMS,
  MODEL_ROLES,
  validateModel,
  type ModelRole,
} from "./models";

// Worst-case time budget for the "Use Gemini first" path: capped low
// because Gemini is normally fast (seconds, not tens of seconds) and this
// number is added on top of a full free-chain fallback attempt below it —
// see the call site for the combined-worst-case math.
const GEMINI_PRIMARY_TIMEOUT_MS = GEMINI_MAX_TIMEOUT_MS;
// The one free-model fallback tried if the Gemini-first attempt fails is
// capped independently of the role's own timeoutMs (which can run up to 90s
// for the agent role) so "Gemini first" can never itself blow the route's
// 60s maxDuration: GEMINI_PRIMARY_TIMEOUT_MS (15s) + this (20s) stays well
// under it for every role.
const GEMINI_PRIMARY_FALLBACK_TIMEOUT_MS = 20_000;

export const client = new OpenAI({
  baseURL: "https://integrate.api.nvidia.com/v1",
  apiKey: process.env.NVIDIA_API_KEY,
});

// Paid fallback client — see GEMINI_FALLBACK_MODEL in models.ts for why it's
// kept off the primary chain. The Gemini OpenAI-compat endpoint 400s on any
// NVIDIA-specific body field (chat_template_kwargs, reasoning_budget), so
// its call site below must never pass roleConfig.params through to it.
const geminiClient = new OpenAI({
  baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/",
  apiKey: process.env.GEMINI_API_KEY,
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
  apiClient: OpenAI;
  modelId: string;
  messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[];
  tools?: OpenAI.Chat.Completions.ChatCompletionTool[];
  maxTokens?: number;
  temperature: number;
  params: Record<string, unknown>;
  timeoutMs: number;
}): Promise<OpenAI.Chat.Completions.ChatCompletionMessage> {
  const {
    apiClient,
    modelId,
    messages,
    tools,
    maxTokens,
    temperature,
    params,
    timeoutMs,
  } = options;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await apiClient.chat.completions.create(
      {
        model: modelId,
        messages,
        tools,
        temperature,
        // Omitted entirely (not just a large number) when unset, so the
        // provider's own per-model ceiling applies instead of ours cutting
        // the answer short.
        ...(maxTokens !== undefined ? { max_tokens: maxTokens } : {}),
        stream: false,
        ...params,
      } as unknown as OpenAI.Chat.Completions.ChatCompletionCreateParamsNonStreaming,
      { signal: controller.signal }
    );

    const message = response.choices?.[0]?.message;
    if (!message) throw new Error("Empty LLM response");

    // Reasoning models can burn the entire max_tokens budget on hidden
    // "thinking" before emitting any answer, leaving `content` null/empty
    // with finish_reason "length" — a 200 response with no real output. Treat
    // that as a failure so the caller's fallback chain retries the next
    // model instead of silently returning an empty string as success.
    const hasToolCalls = (message.tool_calls?.length ?? 0) > 0;
    if (!hasToolCalls && !message.content?.trim()) {
      throw new Error(
        `Empty completion content (finish_reason: ${response.choices?.[0]?.finish_reason ?? "unknown"})`
      );
    }

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

  const startedAt = Date.now();

  const roleConfig = MODEL_ROLES[options.role];
  const forceGeminiPrimary = options.modelId === GEMINI_PRIMARY_OVERRIDE_ID;
  const override =
    options.modelId && !forceGeminiPrimary && validateModel(options.modelId)
      ? options.modelId
      : undefined;

  const chain = override
    ? [override, ...MODEL_CHAIN.filter((m) => m !== override)]
    : [...MODEL_CHAIN];

  const activeChain = options.tools
    ? chain.filter((m) => ALLOWED_MODELS[m]?.supportsTools !== false)
    : chain;
  const limitedChain = roleConfig.maxChain
    ? activeChain.slice(0, roleConfig.maxChain)
    : activeChain;

  const maxTokens = options.maxTokens ?? roleConfig.maxTokens;
  const temperature = options.temperature ?? roleConfig.temperature ?? 0.5;
  const timeoutMs = options.timeoutMs ?? roleConfig.timeoutMs ?? 25_000;

  const errors: string[] = [];
  const geminiConfigured = Boolean(process.env.GEMINI_API_KEY);

  // "Use Gemini first" advanced setting: try the paid model before the free
  // chain instead of after it. Bounded to a short timeout of its own (not
  // the role's, which can run up to 90s) plus exactly one capped free-model
  // fallback if it fails — see the constants above for why that combination
  // can never blow the route's 60s maxDuration regardless of role.
  if (forceGeminiPrimary) {
    if (!geminiConfigured) {
      throw new Error(
        "Gemini was selected as the primary model but GEMINI_API_KEY is not set"
      );
    }
    try {
      return await createCompletion({
        apiClient: geminiClient,
        modelId: GEMINI_FALLBACK_MODEL,
        messages: options.messages,
        tools: options.tools,
        maxTokens,
        temperature,
        params: {},
        timeoutMs: GEMINI_PRIMARY_TIMEOUT_MS,
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      errors.push(`${GEMINI_FALLBACK_MODEL}: ${msg}`);
    }

    const fallbackModelId = limitedChain[0];
    if (fallbackModelId) {
      const params = {
        ...mergeParams(fallbackModelId),
        ...(roleConfig.params ?? {}),
      };
      try {
        return await createCompletion({
          apiClient: client,
          modelId: fallbackModelId,
          messages: options.messages,
          tools: options.tools,
          maxTokens,
          temperature,
          params,
          timeoutMs: Math.min(timeoutMs, GEMINI_PRIMARY_FALLBACK_TIMEOUT_MS),
        });
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        errors.push(`${fallbackModelId}: ${msg}`);
      }
    }

    throw new Error(`All AI models failed. ${errors.join(" | ")}`);
  }

  for (const [i, modelId] of limitedChain.entries()) {
    // A role's worst-case free-chain time (maxChain × timeoutMs) can exceed
    // what's left of GEMINI_TOTAL_BUDGET_MS once one model has already
    // failed — e.g. polish's 2×25s leaves 0ms for Gemini afterward, silently
    // defeating the fallback on exactly the day both free models struggle.
    // Always let the first attempt run at its full configured timeout (keeps
    // today's fast-success path untouched); only skip further free attempts
    // once trying one more would leave no real time for Gemini to help.
    if (i > 0 && geminiConfigured) {
      const elapsed = Date.now() - startedAt;
      const remainingAfterAttempt =
        GEMINI_TOTAL_BUDGET_MS -
        (elapsed + timeoutMs) -
        GEMINI_SAFETY_MARGIN_MS;
      if (remainingAfterAttempt < GEMINI_MIN_TIMEOUT_MS) {
        errors.push(`${modelId}: skipped — reserving time for Gemini fallback`);
        break;
      }
    }

    const params = { ...mergeParams(modelId), ...(roleConfig.params ?? {}) };
    try {
      return await createCompletion({
        apiClient: client,
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
    }
  }

  // Every free model failed — spend a bit of the prepaid Gemini credit as a
  // last resort, but only if enough of the route's 60s maxDuration budget
  // is actually left (see GEMINI_* constants in models.ts). Skipping when
  // time is too tight is intentional: better to fail exactly as before than
  // risk the platform killing the function mid-call.
  if (process.env.GEMINI_API_KEY) {
    const remaining = GEMINI_TOTAL_BUDGET_MS - (Date.now() - startedAt);
    const geminiTimeoutMs = Math.min(
      remaining - GEMINI_SAFETY_MARGIN_MS,
      GEMINI_MAX_TIMEOUT_MS
    );
    if (geminiTimeoutMs >= GEMINI_MIN_TIMEOUT_MS) {
      try {
        return await createCompletion({
          apiClient: geminiClient,
          modelId: GEMINI_FALLBACK_MODEL,
          messages: options.messages,
          tools: options.tools,
          maxTokens,
          temperature,
          params: {},
          timeoutMs: geminiTimeoutMs,
        });
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        errors.push(`${GEMINI_FALLBACK_MODEL}: ${msg}`);
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
    ...(options.system
      ? [{ role: "system" as const, content: options.system }]
      : []),
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
