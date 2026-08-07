import type OpenAI from "openai";
import { llmCall } from "./client";

export type AgentStep = {
  type: "round" | "tool" | "score" | "message" | "stop";
  round?: number;
  tool?: string;
  args?: Record<string, unknown>;
  result?: unknown;
  score?: number;
  reason?: string;
};

export interface AgentOptions {
  messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[];
  tools: OpenAI.Chat.Completions.ChatCompletionTool[];
  executeTool: (name: string, args: Record<string, unknown>) => Promise<unknown>;
  maxRounds: number;
  modelId?: string;
  onStep?: (step: AgentStep) => void;
  timeoutMs?: number;
  checkStop?: (ctx: { round: number; scores: number[] }) => { stop: boolean; reason?: string };
  recoveryPrompt?: string;
}

export interface AgentResult {
  messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[];
  scores: number[];
  stopReason: string;
  toolCallsExecuted: number;
}

export async function runAgent(options: AgentOptions): Promise<AgentResult> {
  const {
    messages,
    tools,
    executeTool,
    maxRounds,
    modelId,
    onStep,
    timeoutMs,
    checkStop,
    recoveryPrompt,
  } = options;

  const scores: number[] = [];
  let toolCallsExecuted = 0;
  let stopReason = "completed";

  for (let round = 1; round <= maxRounds; round++) {
    onStep?.({ type: "round", round });

    const message = await llmCall({ role: "agent", messages, tools, timeoutMs, modelId });

    if (!message.tool_calls || message.tool_calls.length === 0) {
      messages.push({
        role: "assistant",
        content: message.content ?? "",
      });

      if (round < maxRounds) {
        onStep?.({ type: "message", result: message.content ?? "" });
        messages.push({
          role: "user",
          content:
            recoveryPrompt ??
            "You replied with text but did not call any tool. Continue your work using the available tools. Only write your final summary text when you are completely finished.",
        });
        continue;
      }

      stopReason = message.content ? "final_message" : "no_tool_calls";
      onStep?.({ type: "stop", reason: stopReason });
      break;
    }

    if (message.content) {
      onStep?.({ type: "message", result: message.content });
      messages.push({
        role: "assistant",
        content: message.content,
        tool_calls: message.tool_calls,
      });
    } else {
      messages.push({
        role: "assistant",
        content: message.content ?? "",
        tool_calls: message.tool_calls,
      });
    }

    for (const tc of message.tool_calls) {
      if (tc.type !== "function") continue;

      let args: Record<string, unknown> = {};
      try {
        args = tc.function.arguments ? JSON.parse(tc.function.arguments) : {};
      } catch {
        args = {};
      }

      onStep?.({ type: "tool", tool: tc.function.name, args, round });

      let result: unknown;
      try {
        result = await executeTool(tc.function.name, args);
      } catch (err) {
        result = { error: err instanceof Error ? err.message : "Tool execution failed" };
      }

      toolCallsExecuted++;

      const score = extractScore(tc.function.name, result);
      if (score !== null) {
        scores.push(score);
        onStep?.({ type: "score", score, round });
      }

      messages.push({
        role: "tool",
        tool_call_id: tc.id,
        content: JSON.stringify(result),
      });
    }

    if (checkStop) {
      const verdict = checkStop({ round, scores });
      if (verdict.stop) {
        stopReason = verdict.reason ?? "guardrail";
        onStep?.({ type: "stop", reason: stopReason });
        break;
      }
    }
  }

  return { messages, scores, stopReason, toolCallsExecuted };
}

function extractScore(toolName: string, result: unknown): number | null {
  if (toolName !== "get_ats_score") return null;
  const r = result as { score?: unknown };
  if (typeof r?.score === "number" && Number.isFinite(r.score)) {
    return Math.max(0, Math.min(100, r.score));
  }
  return null;
}
