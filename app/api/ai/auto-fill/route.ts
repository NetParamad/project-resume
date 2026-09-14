import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { enforceRateLimit } from "@/lib/rate-limit";
import { llmText } from "@/lib/ai/client";
import { resolveLocale } from "@/lib/ai/detect-locale";
import { autoFillRequestSchema } from "@/lib/validation/ai";
import { parseJsonBody } from "@/lib/validation/parse";
import {
  SECTION_FIELDS,
  SECTION_PRIMARY_FIELD,
  fieldLabel,
} from "@/lib/ai/section-fields";
import type { SectionType } from "@/lib/types/resume";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const limited = await enforceRateLimit(`ai:${user.id}`, 40, 5 * 60 * 1000);
  if (limited) return limited;

  try {
    const parsed = await parseJsonBody(req, autoFillRequestSchema);
    if (parsed.error) return parsed.error;
    const {
      section,
      itemId,
      context,
      resumeData,
      prompt: userPrompt,
      locale: uiLocale,
      outputLocale,
      model,
    } = parsed.data;
    const locale = outputLocale ?? resolveLocale(userPrompt, uiLocale);

    // If editing an existing list item, pull its own fields (jobTitle, company, etc.)
    // in as context so the model can reference real data instead of guessing.
    const sectionData = resumeData
      ? (resumeData as unknown as Record<string, unknown>)[section]
      : undefined;
    const activeItem =
      itemId && Array.isArray(sectionData)
        ? (sectionData as Array<Record<string, unknown>>).find(
            (it) => it?.id === itemId
          )
        : undefined;
    const mergedContext = { ...(context ?? {}), ...(activeItem ?? {}) };

    // When the user explicitly picked an output language (rather than
    // leaving it on auto-detect), the "User request" text embedded in the
    // prompt below is often the field's *existing* content in whatever
    // language it was originally written in (the dialog prefills it for
    // "Improve with AI"). Without an explicit instruction, the model tends
    // to mirror that embedded text's language instead of the one the Thai/
    // English system prompt above it is merely *written* in — so the
    // locale picker silently did nothing for anyone editing existing
    // content. State the requirement outright, and only when it's an
    // explicit choice: auto mode should keep detecting from the prompt.
    const forcedLanguageNote = outputLocale
      ? locale === "th"
        ? '\n- ผู้ใช้เลือกภาษาผลลัพธ์เป็นภาษาไทยไว้อย่างชัดเจน: เขียนคำตอบเป็นภาษาไทยเท่านั้น ไม่ว่า "User request" ด้านล่างหรือข้อมูลอ้างอิงที่แนบมาจะเป็นภาษาอะไรก็ตาม แปลความหมายแล้วเรียบเรียงใหม่เป็นภาษาไทยที่เป็นธรรมชาติและเป็นทางการ'
        : '\n- The user has explicitly chosen English output: write your answer only in English, regardless of what language the "User request" below or any attached reference data is written in. Translate the meaning and rephrase it naturally in English.'
      : "";

    const systemPrompt =
      (locale === "th"
        ? `คุณคือผู้เชี่ยวชาญการเขียนเรซูเม่ที่ผ่าน ATS (Applicant Tracking System)
กฎ:
- ใช้คำกริยาที่แสดงความสำเร็จ (พัฒนา, เพิ่ม, ลด, จัดการ, นำทีม, ออกแบบ, ปรับปรุง)
- ห้ามกุตัวเลข เปอร์เซ็นต์ หรือ metric ขึ้นมาเองโดยเด็ดขาด ใส่ตัวเลข/metric ได้เฉพาะเมื่อผู้ใช้ระบุไว้ในคำขอหรือใน context ที่ให้มาเท่านั้น หากไม่มีตัวเลขจริง ให้เขียนบรรยายผลลัพธ์เชิงคุณภาพแทน (เช่น "ปรับปรุงกระบวนการทำงานให้มีประสิทธิภาพมากขึ้น") โดยไม่ใส่ตัวเลขที่คาดเดาขึ้นเอง
- เนื้อหากระทัดรัด ไม่เกิน 1-2 บรรทัดต่อหัวข้อ
- ใส่ keywords ที่เกี่ยวข้องกับตำแหน่งงาน
- หากมีข้อมูลเรซูเม่ของผู้ใช้แนบมาด้วย ให้ใช้อ้างอิงเพื่อความสอดคล้องกับส่วนอื่น (เช่น ทักษะ ตำแหน่งงานอื่น ถ้อยคำที่เคยใช้) แต่ห้ามยกข้อมูลนั้นมาทั้งหมด และห้ามใช้เป็นแหล่งกุข้อเท็จจริงใหม่
- หลีกเลี่ยงภาษาพูด คำฟุ่มเฟือย หรือเนื้อหาที่ไม่เฉพาะเจาะจง
- ตอบเฉพาะเนื้อหาที่ขอเท่านั้น ไม่ต้องมีคำอธิบายเพิ่มเติม`
        : `You are an ATS-optimized resume writing expert.
Rules:
- Use strong action verbs (achieved, led, developed, improved, designed, managed, reduced, increased)
- NEVER invent numbers, percentages, or metrics on your own. Only include a number/metric if the user's request or the provided context explicitly gives you one. If no real figure is available, describe the outcome qualitatively instead (e.g. "streamlined the workflow for greater efficiency") without making up a number.
- Keep each bullet point 1-2 lines max, concise and impactful
- Include relevant keywords from the target role/industry
- If the user's existing resume data is attached below, use it for consistency (e.g. skills already listed, other roles, phrasing already used) — but don't dump it back verbatim, and don't use it as license to invent new facts.
- Avoid first-person pronouns, fluff, or generic statements
- Output only the requested content, no explanations`) + forcedLanguageNote;

    // `section` is validated only as a non-empty string by the request schema
    // (arbitrary client input, not an enum) — cast once here at the boundary;
    // an unrecognized value just falls through to getSectionContext's
    // `default:` case and the SECTION_FIELDS lookups below return undefined,
    // both handled gracefully rather than crashing.
    const sectionContext = getSectionContext(
      section as SectionType,
      mergedContext,
      locale
    );

    const referenceBlock = resumeData
      ? locale === "th"
        ? `\n\nข้อมูลเรซูเม่ปัจจุบันของผู้ใช้ (สำหรับอ้างอิงเท่านั้น ใช้เพื่อความสอดคล้อง เช่น ทักษะที่มีอยู่แล้ว, ตำแหน่ง/บริษัทอื่น, ถ้อยคำที่เคยใช้ — ห้ามคัดลอกทั้งหมด และห้ามใช้เป็นข้ออ้างในการกุข้อเท็จจริงใหม่ที่ไม่ปรากฏอยู่ที่นี่หรือในคำขอของผู้ใช้):\n${JSON.stringify(resumeData)}`
        : `\n\nUser's current resume data (reference only — use it to stay consistent, e.g. skills already listed, other roles/companies, phrasing already used; do not copy it verbatim, and do not use it as license to invent new facts that aren't here or in the user's request):\n${JSON.stringify(resumeData)}`
      : "";

    const userContent = `${sectionContext}\n\nUser request: ${userPrompt}${referenceBlock}\n\nProvide the content in a professional ATS-optimized resume style. Return only the content text without any additional explanations.`;

    const text = await llmText({
      role: "autofill",
      modelId: model ?? undefined,
      system: systemPrompt,
      user: userContent,
    });

    return NextResponse.json({ content: text });
  } catch (error) {
    console.error("AI auto-fill error:", error);
    return NextResponse.json(
      {
        code: "ai_error",
        detail:
          error instanceof Error ? error.message.slice(0, 500) : undefined,
      },
      { status: 500 }
    );
  }
}

/**
 * When a list item's own identifying field (job title, award name, etc.) is
 * still empty, the user is likely pasting one freeform blob to fill the
 * whole entry at once rather than just the description. Ask the model to
 * split its answer across all of that section's fields in that case; when
 * the basics are already filled in, keep the existing plain-description
 * behavior unchanged.
 */
function structuredFallbackInstruction(
  section: SectionType,
  locale?: string
): string {
  const fields = SECTION_FIELDS[section];
  if (!fields) return "";
  const isTh = locale === "th";
  const orderTh = fields.map((f) => f.label.th).join(" | ");
  const orderEn = fields.map((f) => f.label.en).join(" | ");
  return isTh
    ? `\n\nนอกจากนี้ ถ้าคำขอของผู้ใช้มีข้อมูลที่ยังไม่ได้กรอกในระบบด้วย (เช่น ชื่อ/สถานที่/วันที่) ให้ส่งคำตอบทั้งหมดกลับเป็นบรรทัดเดียวในรูปแบบ: ${orderTh} — ใช้เครื่องหมาย "|" คั่นแต่ละส่วนเท่านั้น ห้ามใช้ "|" ภายในเนื้อหาของส่วนใด ส่วนที่ไม่มีข้อมูลให้ปล่อยว่างแต่ยังคงใส่ "|" คั่นตำแหน่งไว้ตามเดิม ส่วนรายละเอียด/คำอธิบายให้เขียนเป็นย่อหน้าเดียวต่อเนื่อง ห้ามขึ้นบรรทัดใหม่หรือใช้เครื่องหมาย - นำหน้า`
    : `\n\nAlso, if the user's request includes information not yet filled in the form (e.g. name/location/dates), return the ENTIRE answer as a single line in this format: ${orderEn} — separate parts with "|" only, never inside any part's own content. Leave a part blank if unknown, but keep its "|" position. Write the description part as one continuous flowing paragraph, not line breaks or bullet points.`;
}

function hasBasics(
  section: SectionType,
  context: Record<string, unknown> | null
): boolean {
  const key = SECTION_PRIMARY_FIELD[section];
  return Boolean(key && context?.[key]);
}

/**
 * The auto-fill dialog prefills its prompt box with the item's own current
 * text (e.g. an old job's description) so "Improve with AI" has something
 * to refine. If the user then changes the company/job title field but
 * doesn't also rewrite that prefilled text, the request still narrates the
 * old role. A soft "defer to the context above" instruction wasn't enough —
 * live testing showed the model still repeated old-org details (e.g. a
 * hospital) most of the time. Naming the actual known values explicitly and
 * telling it to strip/replace any *other* organization mentioned works far
 * more reliably. Only relevant when hasBasics() is true, i.e. there's an
 * actual field value to reconcile against.
 */
function staleContentNote(
  section: SectionType,
  context: Record<string, unknown> | null,
  locale?: string
): string {
  const fields = SECTION_FIELDS[section] ?? [];
  const known = fields
    .filter((f) => f.key !== "description")
    .map((field) =>
      context?.[field.key]
        ? `${fieldLabel(field, locale)}: ${context[field.key]}`
        : null
    )
    .filter((line): line is string => line !== null)
    .join(", ");
  if (!known) return "";

  return locale === "th"
    ? `\n\nเนื้อหานี้เป็นของ ${known} เท่านั้น ห้ามพูดถึงองค์กร/หน่วยงาน/บริบทอื่นที่ไม่ตรงกับข้อมูลนี้ แม้คำขอของผู้ใช้จะอ้างถึงที่อื่นก็ตาม (อาจเป็นข้อความเดิมจากรายการก่อนหน้าที่ยังไม่ได้แก้ไข) — ให้ดึงเฉพาะทักษะ/การกระทำ/ผลลัพธ์ทั่วไปจากคำขอมาปรับใช้ แล้วตัดหรือแทนที่ชื่อองค์กร/บริบทเฉพาะเจาะจงอื่นด้วยบริบทของ ${known} แทน`
    : `\n\nThis content is specifically for ${known}. Do not mention any organization, department, or domain other than that, even if the user's request refers to a different one (it may be leftover text from a previous entry that wasn't rewritten) — reuse only the general skills, actions, and outcome types from the request, and strip or replace any other organization's name or specific domain with generic phrasing appropriate to ${known} instead.`;
}

/**
 * Appends whichever follow-on instruction applies to a "base" prompt: when
 * the item's basics are already filled in, warn the model off stale
 * leftover context (staleContentNote); otherwise invite it to split its
 * answer across every field (structuredFallbackInstruction). Shared by
 * every section below instead of repeating the same ternary five times.
 */
function withBasicsAwareSuffix(
  section: SectionType,
  context: Record<string, unknown> | null,
  locale: string | undefined,
  base: string
): string {
  return hasBasics(section, context)
    ? base + staleContentNote(section, context, locale)
    : base + structuredFallbackInstruction(section, locale);
}

function getSectionContext(
  section: SectionType,
  context: Record<string, unknown> | null,
  locale?: string
): string {
  const isTh = locale === "th";
  switch (section) {
    case "summary":
      return isTh
        ? "เขียนสรุปภาพรวม (Professional Summary) ความยาว 2-3 บรรทัด ประกอบด้วย: ปีประสบการณ์, ทักษะหลัก 3 อย่าง, อุตสาหกรรมที่เชี่ยวชาญ และความสำเร็จเด่น (ใส่ตัวเลขเฉพาะเมื่อผู้ใช้ให้มาจริง ห้ามกุขึ้นเอง) ใช้ภาษาเรียกตัวเองว่า 'มีประสบการณ์' ไม่ใช้ 'ฉัน' หรือ 'ผม'"
        : "Write a 2-3 line professional summary. Include: years of experience, top 3 skills, key industries, and a career highlight (only include a metric if the user actually provided one — never invent one). Keep under 50 words. Use third-person implied voice (e.g., 'Experienced engineer with...').";
    case "experience": {
      const base = isTh
        ? `เขียนรายละเอียดประสบการณ์ทำงานเป็นย่อหน้าเดียวต่อเนื่อง 2-4 ประโยค (ห้ามขึ้นบรรทัดใหม่หรือใช้เครื่องหมาย - นำหน้าแต่ละประโยคเด็ดขาด) โดยใช้แนวคิด STAR (Situation-Task-Action-Result) ในการเรียบเรียงเนื้อหา
ตำแหน่ง: ${context?.jobTitle || "N/A"}
บริษัท: ${context?.company || "N/A"}
เริ่มประโยคแรกด้วยคำกริยาแสดงความสำเร็จ อธิบายสิ่งที่ทำและผลลัพธ์ต่อเนื่องกันไปเป็นร้อยแก้ว ใส่ตัวเลข/metric ได้เฉพาะเมื่อมีอยู่ในคำขอของผู้ใช้หรือ context ด้านบนเท่านั้น ห้ามกุตัวเลขขึ้นเอง หากไม่มีตัวเลขจริงให้บรรยายผลลัพธ์เชิงคุณภาพแทน
ความยาวไม่เกิน 60 คำ`
        : `Write the experience description as a single flowing paragraph of 2-4 sentences (no line breaks, no leading "-" or bullet markers) using STAR (Situation-Task-Action-Result) to structure the content.
Title: ${context?.jobTitle || "N/A"}
Company: ${context?.company || "N/A"}
Start the first sentence with a strong action verb, then describe the challenge/action/result as continuous prose. Only include a number/metric if it's already present in the user's request or the context above — never invent one. If no real figure is available, describe the result qualitatively instead.
Keep under 60 words total.`;
      return withBasicsAwareSuffix(section, context, locale, base);
    }
    case "skills":
      return isTh
        ? "แนะนำ 6-10 ทักษะที่เกี่ยวข้องกับตำแหน่งนี้ แบ่งเป็น: ทักษะด้านเทคนิค (เครื่องมือ, ภาษาโปรแกรม), ทักษะด้านกระบวนการ (Agile, Project Management), และทักษะด้านอ่อน (Leadership, Communication) เน้น keywords ที่เป็นที่ต้องการในสายงานนี้"
        : "List 6-10 relevant skills for this role. Categorize as: technical tools & languages, methodologies & processes, and soft skills. Prioritize high-demand keywords for this career field.";
    case "education": {
      const fields = SECTION_FIELDS.education ?? [];
      const orderTh = fields.map((f) => f.label.th).join(" | ");
      const orderEn = fields.map((f) => f.label.en).join(" | ");
      return isTh
        ? `เขียนข้อมูลการศึกษา 1 รายการในรูปแบบ: ${orderTh} ใช้ชื่อวุฒิ/สาขาเป็นภาษาอังกฤษ วันที่ใช้รูปแบบ YYYY-MM ส่วนที่ไม่ทราบให้ปล่อยว่างแต่ยังคงเครื่องหมาย | คั่นตำแหน่งไว้ ห้ามมีคำอธิบายเพิ่มเติม และห้ามใช้เครื่องหมาย | ในเนื้อหาของแต่ละฟิลด์`
        : `Return a single education entry in this exact format: ${orderEn}. Keep degree and field names in English, dates as YYYY-MM. Leave a part blank if unknown but keep its "|" position. No extra explanations, and do not use '|' inside the field values.`;
    }
    case "publications": {
      const fields = SECTION_FIELDS.publications ?? [];
      const orderTh = fields.map((f) => f.label.th).join(" | ");
      const orderEn = fields.map((f) => f.label.en).join(" | ");
      return isTh
        ? `เขียนผลงานวิชาการ 1 รายการในรูปแบบ: ${orderTh} ใช้รูปแบบ citation วิชาการ ส่วนที่ไม่มีข้อมูล (เช่น เล่มที่/หน้า/DOI/ลิงก์) ให้ปล่อยว่างแต่ยังคงเครื่องหมาย | คั่นตำแหน่งไว้ ห้ามมีคำอธิบายเพิ่มเติม และห้ามใช้เครื่องหมาย | ในเนื้อหาของแต่ละฟิลด์`
        : `Write one academic publication in this exact format: ${orderEn}. Use standard academic citation style. Leave a part blank if unknown (e.g. volume/pages/doi/url) but keep its "|" position. No extra explanations, and do not use '|' inside the field values.`;
    }
    case "awards": {
      const base = isTh
        ? "เขียนคำอธิบายรางวัล 1-2 ประโยค ระบุ: ชื่อรางวัล, ผู้มอบ, ปี และความสำคัญ/บริบทของรางวัล ใช้โทนวิชาการ กระชับ"
        : "Write a 1-2 sentence description of the award: award name, issuer, year, and its significance or context. Use a concise, academic tone.";
      return withBasicsAwareSuffix(section, context, locale, base);
    }
    case "teachingExperience": {
      const base = isTh
        ? "เขียนรายละเอียดประสบการณ์สอนเป็นย่อหน้าเดียวต่อเนื่อง 2-4 ประโยค (ห้ามขึ้นบรรทัดใหม่หรือใช้เครื่องหมาย - นำหน้า) ระบุ: วิชาที่สอน, ระดับผู้เรียน, จำนวนผู้เรียน (ถ้ามี) และผลลัพธ์การเรียนการสอน ใช้คำกริยาวิชาการ กระชับ ความยาวไม่เกิน 60 คำ"
        : 'Write the teaching experience description as a single flowing paragraph of 2-4 sentences (no line breaks, no leading "-" or bullet markers): courses taught, student level, class sizes (if known), and teaching outcomes. Use academic action verbs, concise. Keep under 60 words total.';
      return withBasicsAwareSuffix(section, context, locale, base);
    }
    case "researchExperience": {
      const base = isTh
        ? "เขียนรายละเอียดประสบการณ์วิจัยเป็นย่อหน้าเดียวต่อเนื่อง 2-4 ประโยค (ห้ามขึ้นบรรทัดใหม่หรือใช้เครื่องหมาย - นำหน้า) ระบุ: คำถาม/ปัญหา, วิธีวิจัย, เครื่องมือ/เทคนิค และผลลัพธ์ (สิ่งพิมพ์/การนำเสนอ) ใช้คำกริยาวิชาการ กระชับ ความยาวไม่เกิน 60 คำ"
        : 'Write the research experience description as a single flowing paragraph of 2-4 sentences (no line breaks, no leading "-" or bullet markers): research question or problem, methodology, tools or techniques, and outcomes (publications or presentations). Use academic action verbs, concise. Keep under 60 words total.';
      return withBasicsAwareSuffix(section, context, locale, base);
    }
    case "projects": {
      const base = isTh
        ? "เขียนอธิบายโปรเจกต์เป็นย่อหน้าเดียวต่อเนื่อง 1-3 ประโยค (ห้ามขึ้นบรรทัดใหม่หรือใช้เครื่องหมาย - นำหน้า) ประกอบด้วย: เทคโนโลยีที่ใช้, ปัญหาที่แก้ไข, ผลลัพธ์ (ใส่ตัวเลขเฉพาะเมื่อผู้ใช้ให้มาจริง ห้ามกุขึ้นเอง) ความยาวไม่เกิน 50 คำ"
        : 'Write the project description as a single flowing paragraph of 1-3 sentences (no line breaks, no leading "-" or bullet markers). Include: technologies used, problem solved, and the outcome (only include a number if the user actually provided one — never invent one). Keep under 50 words total.';
      return withBasicsAwareSuffix(section, context, locale, base);
    }
    default:
      return isTh
        ? `ผู้ใช้กำลังเขียนส่วน ${section} ของเรซูเม่ ให้เนื้อหากระชับ ใช้คำกริยาแสดงความสำเร็จ และใส่ตัวเลขได้เฉพาะเมื่อผู้ใช้ให้มาจริงเท่านั้น ห้ามกุขึ้นเอง`
        : `The user is working on the ${section} section of their resume. Keep content concise, start with action verbs, and only include metrics if the user actually provided them — never invent one.`;
  }
}
