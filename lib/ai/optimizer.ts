import type OpenAI from "openai";
import { nanoid } from "nanoid";
import { runAgent, type AgentStep } from "./agent";
import { scoreResume } from "./ats";
import { ALLOWED_MODELS } from "./models";

export const MAX_ROUNDS = 6;
export const TARGET_SCORE = 85;

export const OPTIMIZER_SECTIONS = [
  "summary",
  "experience",
  "skills",
  "education",
  "projects",
  "certifications",
  "languages",
  "references",
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

const TOOL_SCHEMA: OpenAI.Chat.Completions.ChatCompletionTool[] = [
  {
    type: "function",
    function: {
      name: "get_ats_score",
      description:
        "Score the current resume draft (0-100) with keyword analysis and suggestions. Call this first and after every change.",
      parameters: {
        type: "object",
        properties: {},
        additionalProperties: false,
      },
    },
  },
  {
    type: "function",
    function: {
      name: "get_section",
      description: "Read the current content of a resume section.",
      parameters: {
        type: "object",
        properties: {
          section: {
            type: "string",
            enum: [...OPTIMIZER_SECTIONS],
          },
        },
        required: ["section"],
        additionalProperties: false,
      },
    },
  },
  {
    type: "function",
    function: {
      name: "update_section",
      description:
        "Rewrite a resume section with ATS-optimized content. Use strong action verbs, quantify achievements with metrics, include job-description keywords. For array sections (experience, skills, education, etc.) pass an array of items and PRESERVE each existing item's 'id' field.",
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

function buildSystemPrompt(locale: string): string {
  if (locale === "th") {
    return `คุณคือ Agent ผู้เชี่ยวชาญด้าน ATS (Applicant Tracking System) เป้าหมายคือปรับปรุงเรซูเม่ให้ได้คะแนน ATS 85+
คุณมีเครื่องมือ (tools) เพื่อตรวจสอบและแก้ไขสำเนาเรซูเม่:
- get_ats_score: ให้คะแนนเรซูเม่ปัจจุบัน (0-100) เรียกเป็นอันดับแรกและเรียกหลังทุกการเปลี่ยนแปลง
- get_section: อ่านเนื้อหาของ section (summary, experience, skills, education, projects, certifications, languages, references)
- update_section: เขียน section ใหม่ให้ผ่าน ATS

กฎ:
1. ต้องเรียก tool เสมอก่อนเขียนอะไร อย่าพิมพ์ข้อความธรรมดาจนกว่าจะทำงานเสร็จ
2. เริ่มด้วย get_ats_score เพื่อวัดคะแนนตั้งต้น
3. จากนั้น get_section ในส่วนที่อ่อน และ update_section เพื่อปรับปรุง:
   - ใช้คำกริยาแสดงความสำเร็จ (พัฒนา, เพิ่ม, ลด, จัดการ, นำทีม, ออกแบบ, ปรับปรุง)
   - ใส่ตัวเลข/metrics ที่วัดผลได้ เช่น เพิ่มยอดขาย 30%, ลดต้นทุน 15%, จัดการทีม 10 คน
   - ใส่ keywords จากรายละเอียดงานเป้าหมาย
   - ความยาว 1-2 บรรทัดต่อหัวข้อ กระชับ
   - หลีกเลี่ยงภาษาเรียบ ๆ คำฟุ่มเฟือย
4. เมื่อแก้ section ประเภท array ต้องรักษา field 'id' ของทุก item เดิมไว้ ห้ามลบ เปลี่ยน หรือสร้าง id ใหม่
5. หลังทุก update_section ให้เรียก get_ats_score อีกครั้งเพื่อยืนยัน
6. หยุดเมื่อคะแนนถึง 85 หรือเมื่อมั่นใจว่าไม่สามารถปรับปรุงได้มากกว่านี้
7. เสร็จแล้วให้พิมพ์ข้อความสรุปการเปลี่ยนแปลง (โดยไม่เรียก tool)`;
  }
  return `You are an expert ATS (Applicant Tracking System) optimization agent. Your goal is to improve the resume so it scores 85+ on an ATS scan.
You have tools to inspect and modify a draft copy of the resume:
- get_ats_score: score the current draft (0-100) with keyword analysis. Call this FIRST and after EVERY change.
- get_section: read a section (summary, experience, skills, education, projects, certifications, languages, references).
- update_section: rewrite a section with ATS-optimized content.

Rules:
1. ALWAYS use a tool before writing anything. Never output plain text until you are completely done.
2. Start by calling get_ats_score to measure the baseline.
3. Then get_section on the weakest sections and update_section to improve them:
   - Use strong action verbs (achieved, led, developed, improved, designed, managed, reduced, increased).
   - Quantify achievements with numbers/metrics (e.g., increased sales 30%, led team of 10, reduced costs 15%).
   - Include relevant keywords from the target job description.
   - Keep each bullet 1-2 lines, concise and impactful.
   - Avoid first-person pronouns, fluff, or generic statements.
4. When updating array sections, PRESERVE the 'id' field of each existing item. Never remove, rename, or invent ids.
5. After every update_section, call get_ats_score again to verify improvement.
6. Stop when the score reaches 85 or higher, or when you determine no more meaningful gains are possible.
7. When finished, output a plain-text summary of the changes you made (no tool calls).`;
}

function coerceToArray(value: unknown): unknown[] {
  if (Array.isArray(value)) return value;
  if (value === null || value === undefined) return [];
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (trimmed.startsWith("[")) {
      try {
        const parsed = JSON.parse(trimmed);
        if (Array.isArray(parsed)) return parsed;
      } catch {
        // fall through
      }
    }
  }
  return [value];
}

function normalizeSection(section: string, value: unknown, current: unknown): unknown {
  if (section === "summary") {
    return typeof value === "string" ? value : "";
  }

  const currentArray = Array.isArray(current) ? current : [];
  const incoming = coerceToArray(value);

  return incoming.map((item) => {
    if (item === null || typeof item !== "object") return item;
    const typed = item as Record<string, unknown>;
    const existing = currentArray.find(
      (c) => (c as Record<string, unknown>)?.id && (c as Record<string, unknown>).id === typed.id,
    ) as Record<string, unknown> | undefined;
    const id =
      typeof typed.id === "string" && typed.id
        ? typed.id
        : (existing?.id as string) ?? nanoid();
    return { ...existing, ...typed, id };
  });
}

function ensureIdsInArrays(data: Record<string, unknown>): Record<string, unknown> {
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
  modelId?: string;
  onStep?: (step: AgentStep) => void;
}): Promise<OptimizeResult> {
  const { resumeData, jobDescription, locale = "en", modelId, onStep } = options;

  const agentModel =
    modelId && ALLOWED_MODELS[modelId]?.supportsTools ? modelId : undefined;

  const draft = JSON.parse(JSON.stringify(resumeData)) as Record<string, unknown>;
  const changes: SectionChange[] = [];
  let lastAction: "score" | "update" | "none" = "none";
  const getLastAction = () => lastAction;

  const systemPrompt = buildSystemPrompt(locale);
  const userContent =
    `Resume JSON:\n${JSON.stringify(resumeData, null, 2)}` +
    (jobDescription?.trim()
      ? `\n\nTarget Job Description:\n${jobDescription.trim()}`
      : "");

  const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
    { role: "system", content: systemPrompt },
    { role: "user", content: userContent },
  ];

  const executeTool = async (
    name: string,
    args: Record<string, unknown>,
  ): Promise<unknown> => {
    switch (name) {
      case "get_ats_score": {
        const result = await scoreResume(draft as object, jobDescription, locale);
        lastAction = "score";
        return result;
      }
      case "get_section": {
        const section = String(args.section ?? "");
        return { section, content: draft[section] ?? null };
      }
      case "update_section": {
        const section = String(args.section ?? "");
        if (!OPTIMIZER_SECTIONS.includes(section as (typeof OPTIMIZER_SECTIONS)[number])) {
          return { ok: false, error: `Unknown section: ${section}` };
        }
        const previous = JSON.parse(JSON.stringify(draft[section] ?? null));
        const next = normalizeSection(section, args.content, draft[section]);
        draft[section] = next;
        lastAction = "update";
        changes.push({
          section,
          previous,
          current: JSON.parse(JSON.stringify(next)),
        });
        return { ok: true, section };
      }
      default:
        return { error: `Unknown tool: ${name}` };
    }
  };

  const result = await runAgent({
    messages,
    tools: TOOL_SCHEMA,
    executeTool,
    maxRounds: MAX_ROUNDS,
    timeoutMs: 90_000,
    modelId: agentModel,
    recoveryPrompt:
      locale === "th"
        ? "คุณตอบกลับด้วยข้อความแต่ไม่ได้เรียกใช้ tool ใด ๆ โปรดทำงานต่อด้วยการเรียกใช้เครื่องมือ เริ่มจาก get_ats_score แล้วตามด้วย get_section หรือ update_section ตามความเหมาะสม และพิมพ์ข้อความสรุปเป็นภาษาไทยก็ต่อเมื่อเสร็จสิ้นการปรับปรุงแล้วเท่านั้น"
        : "You replied with text but did not call any tool. Continue your work by calling a tool: start with get_ats_score, then get_section or update_section as appropriate. Only write your final summary text when you are completely finished improving the resume.",
    onStep,
    checkStop: ({ scores }) => {
      if (scores.length > 0) {
        const last = scores[scores.length - 1];
        if (last >= TARGET_SCORE) return { stop: true, reason: "target_reached" };
      }
      if (scores.length >= 2) {
        const last = scores[scores.length - 1];
        const prev = scores[scores.length - 2];
        if (last <= prev) return { stop: true, reason: "plateau" };
      }
      return { stop: false };
    },
  });

  const finalData = ensureIdsInArrays(draft);

  if (getLastAction() === "update") {
    const finalScore = await scoreResume(finalData as object, jobDescription, locale);
    result.scores.push(finalScore.score);

    if (result.stopReason === "completed" && finalScore.score >= TARGET_SCORE) {
      result.stopReason = "target_reached";
    }
  }

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
