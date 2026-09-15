import type OpenAI from "openai";
import { nanoid } from "nanoid";
import { runAgent, type AgentStep } from "./agent";
import { scoreResume } from "./ats";
import { ALLOWED_MODELS, GEMINI_PRIMARY_OVERRIDE_ID } from "./models";
import { resolveResumeLocale } from "./detect-locale";
import { buildPersona, buildTranslationDirective } from "./persona";

// The improve route runs on Vercel (maxDuration 60s). One agent turn of
// update_section calls is ~30s and the post-loop re-score is ~20s, so the
// budget only stretches to a couple of turns.
export const MAX_ROUNDS = 2;
export const TARGET_SCORE = 85;

// The improve route is capped at maxDuration = 60s on Vercel. If we run right up
// to that limit the platform kills the function mid-work and the SSE stream
// closes with no `done` event, leaving the client stuck. Stop the agent loop
// early enough to still run (or deliberately skip) the post-loop re-score and
// emit a real result.
const TOTAL_BUDGET_MS = 52_000;
const RESCORE_RESERVE_MS = 16_000;

export const OPTIMIZER_SECTIONS = [
  "summary",
  "experience",
  "skills",
  "education",
  "projects",
  "certifications",
  "languages",
  "references",
  "publications",
  "researchExperience",
  "teachingExperience",
  "awards",
] as const;

export interface SectionChange {
  section: string;
  previous: unknown;
  current: unknown;
}

export interface OptimizeResult {
  finalData: Record<string, unknown>;
  scores: number[];
  stopReason: string;
  changes: SectionChange[];
  summary: string;
}

// The agent runs inside a ~60s serverless budget, so it gets exactly one tool:
// rewrite a section. The full resume JSON and job description are already in the
// prompt (no need to read sections back), and scoring happens once before and
// once after the loop outside the agent (an in-loop score call costs ~20s).
const TOOL_SCHEMA: OpenAI.Chat.Completions.ChatCompletionTool[] = [
  {
    type: "function",
    function: {
      name: "update_section",
      description:
        "Rewrite a resume section with ATS-optimized content. Use strong action verbs, quantify achievements with metrics, include job-description keywords. For array sections (experience, skills, education, publications, researchExperience, teachingExperience, awards, etc.) pass an array of items and PRESERVE each existing item's 'id' field.",
      parameters: {
        type: "object",
        properties: {
          section: {
            type: "string",
            enum: [...OPTIMIZER_SECTIONS],
          },
          content: {
            description:
              "New section content. For 'summary' a string. For other sections an array of item objects.",
          },
        },
        required: ["section", "content"],
        additionalProperties: false,
      },
    },
  },
];

function buildSystemPrompt(locale: "th" | "en"): string {
  const persona = buildPersona(locale);

  if (locale === "th") {
    return `${persona}

### งานนี้: Agent ปรับปรุงเรซูเม่ให้ผ่าน ATS

เป้าหมายคือปรับปรุงเรซูเม่ให้ผ่าน ATS ได้ดีขึ้น คุณมีเวลาจำกัดมากและมีเครื่องมือเดียว: update_section (เขียน section ใหม่)

JSON เรซูเม่ฉบับเต็มและรายละเอียดงานเป้าหมายอยู่ในข้อความด้านล่างแล้ว

ขั้นตอน:
1. เวลาจริงมีแค่เทิร์นเดียว (เทิร์นที่ 2 มักไม่ทันเพราะหมดเวลา) — ในเทิร์นแรกนี้ ให้พิจารณาทุก section ที่มีเนื้อหาอยู่แล้ว (ไม่ใช่แค่ summary, experience, skills — รวมถึง education, projects, certifications, publications, researchExperience, teachingExperience, awards ด้วย) แล้วเรียก update_section พร้อมกันในคราวเดียว เฉพาะ section ที่ปรับปรุงแล้วได้ประโยชน์จริง เช่น ขาดคำหลักจากรายละเอียดงาน เขียนกว้างๆ ไม่ชัดเจน หรือไม่มีตัวเลขผลลัพธ์ ถ้า section ไหนดีอยู่แล้วไม่มีอะไรให้ปรับปรุงจริงๆ ให้ข้ามไป ไม่ต้องฝืนแก้ทุก section เพราะจะสิ้นเปลือง token โดยเปล่าประโยชน์
2. ยึดหลักการปรับ ATS ในหลักการทำงานหลักด้านบน แทรกคำหลักจากรายละเอียดงานเป้าหมายเท่าที่ข้อเท็จจริงรองรับ และห้ามกุข้อมูล
3. สำหรับ section ที่เป็น array ต้องคง field 'id' ของทุก item เดิมไว้
4. เมื่อแก้ไขเสร็จ ให้พิมพ์ข้อความสรุปการเปลี่ยนแปลงสั้น ๆ เป็นภาษาไทย (โดยไม่เรียก tool)`;
  }

  return `${persona}

### THIS TASK: ATS OPTIMIZATION AGENT

Improve the resume's ATS readiness. You are on a very tight time budget and have a single tool: update_section (rewrite a section).

The full resume JSON and the target job description are already in the message below.

Steps:
1. You realistically only get ONE turn (a second turn almost never fits in the time budget). On this first turn, review every section that already has content — not just summary, experience, and skills, but also education, projects, certifications, publications, researchExperience, teachingExperience, and awards whenever they contain data — and issue update_section calls together only for the sections that would genuinely benefit: missing job-description keywords, weak or vague wording, no quantified results, etc. If a section is already strong and there's nothing meaningful to improve, leave it alone — don't force a rewrite just to touch every section, that wastes your limited output budget.
2. Follow the ATS optimization principles in the core operating principles above, working in keywords from the target job description only where the facts support them. Never fabricate.
3. For array sections, preserve the 'id' field of every existing item.
4. When the edits are done, output a short plain-text summary of the changes (no tool calls).`;
}

function parseJsonArrayString(value: unknown): unknown[] | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!trimmed.startsWith("[")) return null;
  try {
    const parsed = JSON.parse(trimmed);
    return Array.isArray(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

function coerceToArray(value: unknown): unknown[] {
  if (Array.isArray(value)) {
    // Models sometimes pass the whole array as a JSON string, which arrives
    // wrapped as ["[{...}]"]. Unwrap that back into the real array.
    if (value.length === 1) {
      const unwrapped = parseJsonArrayString(value[0]);
      if (unwrapped) return unwrapped;
    }
    return value;
  }
  if (value === null || value === undefined) return [];
  const parsed = parseJsonArrayString(value);
  if (parsed) return parsed;
  return [value];
}

function normalizeSection(
  section: string,
  value: unknown,
  current: unknown
): unknown {
  if (section === "summary") {
    return typeof value === "string" ? value : "";
  }

  const currentArray = Array.isArray(current) ? current : [];
  const incoming = coerceToArray(value);

  return incoming.map((item) => {
    if (item === null || typeof item !== "object") return item;
    const typed = item as Record<string, unknown>;
    const existing = currentArray.find(
      (c) =>
        (c as Record<string, unknown>)?.id &&
        (c as Record<string, unknown>).id === typed.id
    ) as Record<string, unknown> | undefined;
    const id =
      typeof typed.id === "string" && typed.id
        ? typed.id
        : ((existing?.id as string) ?? nanoid());
    return { ...existing, ...typed, id };
  });
}

// Scale the agent's output budget with how much resume content there
// actually is, instead of always paying for MODEL_ROLES.agent's 16384-token
// ceiling. Rewritten content runs roughly 2x the source character count
// (longer bullets, added keywords, tool-call JSON scaffolding); dividing by
// ~3.5 chars/token is conservative enough to cover mixed Thai/English text.
// The floor stays well above the empirically-observed truncation point (see
// the "8k truncates" note on MODEL_ROLES.agent) since a small resume can
// still expand a lot once the model adds JD keywords and quantified results.
const AGENT_MAX_TOKENS_FLOOR = 6_144;
const AGENT_MAX_TOKENS_CEILING = 16_384;
const CHARS_PER_TOKEN = 3.5;
const OUTPUT_EXPANSION_FACTOR = 2;
const SUMMARY_TEXT_OVERHEAD_TOKENS = 400;

function estimateResumeContentChars(
  resumeData: Record<string, unknown>
): number {
  let chars = 0;
  for (const key of OPTIMIZER_SECTIONS) {
    const value = resumeData[key];
    if (key === "summary") {
      if (typeof value === "string") chars += value.length;
      continue;
    }
    if (Array.isArray(value) && value.length > 0) {
      chars += JSON.stringify(value).length;
    }
  }
  return chars;
}

function estimateAgentMaxTokens(resumeData: Record<string, unknown>): number {
  const contentChars = estimateResumeContentChars(resumeData);
  const estimated =
    Math.ceil((contentChars / CHARS_PER_TOKEN) * OUTPUT_EXPANSION_FACTOR) +
    SUMMARY_TEXT_OVERHEAD_TOKENS;
  return Math.min(
    AGENT_MAX_TOKENS_CEILING,
    Math.max(AGENT_MAX_TOKENS_FLOOR, estimated)
  );
}

function ensureIdsInArrays(
  data: Record<string, unknown>
): Record<string, unknown> {
  const arraySections = [...OPTIMIZER_SECTIONS].filter((s) => s !== "summary");
  for (const key of arraySections) {
    const value = data[key];
    if (Array.isArray(value)) {
      data[key] = value.map((item) => {
        if (item && typeof item === "object") {
          const typed = item as Record<string, unknown>;
          if (typeof typed.id !== "string" || !typed.id) {
            return { ...typed, id: nanoid() };
          }
        }
        return item;
      });
    }
  }
  return data;
}

export async function optimizeResume(options: {
  resumeData: Record<string, unknown>;
  jobDescription?: string;
  locale?: string;
  outputLocale?: "th" | "en";
  modelId?: string;
  onStep?: (step: AgentStep) => void;
}): Promise<OptimizeResult> {
  const { resumeData, jobDescription, modelId, onStep } = options;
  const startedAt = Date.now();
  const elapsedMs = () => Date.now() - startedAt;
  const locale =
    options.outputLocale ??
    resolveResumeLocale(resumeData, jobDescription, options.locale);

  // The Gemini-primary sentinel isn't a real ALLOWED_MODELS entry (see
  // GEMINI_PRIMARY_OVERRIDE_ID in models.ts) so it must bypass the
  // supportsTools lookup below — client.ts handles it as its own branch
  // before ever reaching the tool-support filter.
  const agentModel =
    modelId === GEMINI_PRIMARY_OVERRIDE_ID ||
    (modelId && ALLOWED_MODELS[modelId]?.supportsTools)
      ? modelId
      : undefined;

  const draft = JSON.parse(JSON.stringify(resumeData)) as Record<
    string,
    unknown
  >;
  const changes: SectionChange[] = [];

  const systemPrompt = options.outputLocale
    ? `${buildSystemPrompt(locale)}\n\n${buildTranslationDirective(options.outputLocale)}`
    : buildSystemPrompt(locale);
  const userContent =
    `Resume JSON:\n${JSON.stringify(resumeData, null, 2)}` +
    (jobDescription?.trim()
      ? `\n\nTarget Job Description:\n${jobDescription.trim()}`
      : "") +
    `\n\nReview every section now and call update_section, in one batch of tool calls, only for the ones that would genuinely improve — don't limit yourself to summary, experience, and skills, but don't force-rewrite sections that are already strong either.`;

  const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
    { role: "system", content: systemPrompt },
    { role: "user", content: userContent },
  ];

  const executeTool = async (
    name: string,
    args: Record<string, unknown>
  ): Promise<unknown> => {
    if (name !== "update_section") return { error: `Unknown tool: ${name}` };

    const section = String(args.section ?? "");
    if (
      !OPTIMIZER_SECTIONS.includes(
        section as (typeof OPTIMIZER_SECTIONS)[number]
      )
    ) {
      return { ok: false, error: `Unknown section: ${section}` };
    }
    const previous = JSON.parse(JSON.stringify(draft[section] ?? null));
    const next = normalizeSection(section, args.content, draft[section]);
    draft[section] = next;
    changes.push({
      section,
      previous,
      current: JSON.parse(JSON.stringify(next)),
    });
    return { ok: true, section };
  };

  const result = await runAgent({
    messages,
    tools: TOOL_SCHEMA,
    executeTool,
    maxRounds: MAX_ROUNDS,
    timeoutMs: 40_000,
    modelId: agentModel,
    maxTokens: estimateAgentMaxTokens(resumeData),
    checkStop: () => {
      if (elapsedMs() > TOTAL_BUDGET_MS - RESCORE_RESERVE_MS) {
        return { stop: true, reason: "time_budget" };
      }
      return { stop: false };
    },
    recoveryPrompt:
      locale === "th"
        ? "คุณตอบกลับด้วยข้อความแต่ไม่ได้เรียกใช้ tool ใด ๆ ให้เรียก update_section ทันทีสำหรับ section ที่อ่อนที่สุด และพิมพ์ข้อความสรุปเป็นภาษาไทยก็ต่อเมื่อแก้ไขเสร็จแล้วเท่านั้น"
        : "You replied with text but did not call any tool. Call update_section now for the weakest sections. Only write your final summary text once the edits are done.",
    onStep,
  });

  const finalData = ensureIdsInArrays(draft);

  const scores: number[] = [];
  const rescoreBudgetMs = TOTAL_BUDGET_MS - elapsedMs();
  if (changes.length > 0 && rescoreBudgetMs > 6_000) {
    try {
      const finalScore = await scoreResume(
        finalData as object,
        jobDescription,
        locale,
        undefined,
        locale,
        Math.min(rescoreBudgetMs, 40_000)
      );
      scores.push(finalScore.score);

      if (
        result.stopReason === "completed" &&
        finalScore.score >= TARGET_SCORE
      ) {
        result.stopReason = "target_reached";
      }
    } catch {
      // Out of time or the scorer failed — still return the section changes
      // so the user can apply them; the panel re-scores on demand.
    }
  }
  result.scores = scores;

  const lastMessage = result.messages[result.messages.length - 1];
  const modelSummary =
    lastMessage?.role === "assistant" && typeof lastMessage.content === "string"
      ? lastMessage.content.trim()
      : "";

  const summary = modelSummary || buildSummary(changes, locale);

  return {
    finalData,
    scores: result.scores,
    stopReason: result.stopReason,
    changes,
    summary,
  };
}

function buildSummary(changes: SectionChange[], locale: string): string {
  const labels: Record<string, string> =
    locale === "th"
      ? {
          summary: "สรุป",
          experience: "ประสบการณ์ทำงาน",
          education: "การศึกษา",
          skills: "ทักษะ",
          projects: "โปรเจกต์",
          certifications: "ใบรับรอง",
          languages: "ภาษา",
          references: "ข้อมูลอ้างอิง",
          publications: "สิ่งตีพิมพ์",
          researchExperience: "ประสบการณ์วิจัย",
          teachingExperience: "ประสบการณ์สอน",
          awards: "รางวัล",
          head: "ปรับปรุงส่วน: ",
        }
      : {
          summary: "summary",
          experience: "experience",
          education: "education",
          skills: "skills",
          projects: "projects",
          certifications: "certifications",
          languages: "languages",
          references: "references",
          publications: "publications",
          researchExperience: "researchExperience",
          teachingExperience: "teachingExperience",
          awards: "awards",
          head: "Improved ",
        };

  if (changes.length === 0) {
    return locale === "th"
      ? "ไม่มีการเปลี่ยนแปลงเนื้อหา"
      : "No content changes were made.";
  }

  const names = changes.map((c) => labels[c.section] ?? c.section);
  const joined =
    changes.length === 1
      ? names[0]
      : names.slice(0, -1).join(", ") +
        (locale === "th" ? " และ " : " and ") +
        names[names.length - 1];

  return locale === "th"
    ? `ปรับปรุงเรซูเม่แล้ว: ${labels.head}${joined} ให้มีเนื้อหา ATS-friendly มากขึ้น`
    : `Resume improved: ${labels.head}${joined} with more ATS-friendly content.`;
}
