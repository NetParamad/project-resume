import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { enforceRateLimit } from "@/lib/rate-limit";
import { llmText } from "@/lib/ai/client";
import { resolveLocale } from "@/lib/ai/detect-locale";
import { autoFillRequestSchema } from "@/lib/validation/ai";
import { parseJsonBody } from "@/lib/validation/parse";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const limited = await enforceRateLimit(`ai:${user.id}`, 40, 5 * 60 * 1000);
  if (limited) return limited;

  try {
    const parsed = await parseJsonBody(req, autoFillRequestSchema);
    if (parsed.error) return parsed.error;
    const { section, itemId, context, resumeData, prompt: userPrompt, locale: uiLocale, outputLocale, model } = parsed.data;
    const locale = outputLocale ?? resolveLocale(userPrompt, uiLocale);

    // If editing an existing list item, pull its own fields (jobTitle, company, etc.)
    // in as context so the model can reference real data instead of guessing.
    const sectionData = resumeData ? (resumeData as unknown as Record<string, unknown>)[section] : undefined;
    const activeItem = itemId && Array.isArray(sectionData)
      ? (sectionData as Array<Record<string, unknown>>).find((it) => it?.id === itemId)
      : undefined;
    const mergedContext = { ...(context ?? {}), ...(activeItem ?? {}) };

    const systemPrompt = locale === "th"
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
- Output only the requested content, no explanations`;

    const sectionContext = getSectionContext(section, mergedContext, locale);

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
      { code: "ai_error", detail: error instanceof Error ? error.message.slice(0, 500) : undefined },
      { status: 500 },
    );
  }
}

function getSectionContext(
  section: string,
  context: Record<string, unknown> | null,
  locale?: string,
): string {
  const isTh = locale === "th";
  switch (section) {
    case "summary":
      return isTh
        ? "เขียนสรุปภาพรวม (Professional Summary) ความยาว 2-3 บรรทัด ประกอบด้วย: ปีประสบการณ์, ทักษะหลัก 3 อย่าง, อุตสาหกรรมที่เชี่ยวชาญ และความสำเร็จเด่น (ใส่ตัวเลขเฉพาะเมื่อผู้ใช้ให้มาจริง ห้ามกุขึ้นเอง) ใช้ภาษาเรียกตัวเองว่า 'มีประสบการณ์' ไม่ใช้ 'ฉัน' หรือ 'ผม'"
        : "Write a 2-3 line professional summary. Include: years of experience, top 3 skills, key industries, and a career highlight (only include a metric if the user actually provided one — never invent one). Keep under 50 words. Use third-person implied voice (e.g., 'Experienced engineer with...').";
    case "experience":
      return isTh
        ? `เขียนรายละเอียดประสบการณ์ทำงาน 2-3 ข้อ ในรูปแบบ STAR (Situation-Task-Action-Result)
ตำแหน่ง: ${context?.jobTitle || "N/A"}
บริษัท: ${context?.company || "N/A"}
แต่ละข้อ: เริ่มด้วยคำกริยาแสดงความสำเร็จ, อธิบายสิ่งที่ทำและผลลัพธ์ ใส่ตัวเลข/metric ได้เฉพาะเมื่อมีอยู่ในคำขอของผู้ใช้หรือ context ด้านบนเท่านั้น ห้ามกุตัวเลขขึ้นเอง หากไม่มีตัวเลขจริงให้บรรยายผลลัพธ์เชิงคุณภาพแทน
ความยาวไม่เกิน 25 คำต่อข้อ`
        : `Write 2-3 bullet points for this role using STAR format (Situation-Task-Action-Result).
Title: ${context?.jobTitle || "N/A"}
Company: ${context?.company || "N/A"}
Each bullet: start with a strong action verb, describe the challenge/action/result. Only include a number/metric if it's already present in the user's request or the context above — never invent one. If no real figure is available, describe the result qualitatively instead.
Keep under 25 words per bullet.`;
    case "skills":
      return isTh
        ? "แนะนำ 6-10 ทักษะที่เกี่ยวข้องกับตำแหน่งนี้ แบ่งเป็น: ทักษะด้านเทคนิค (เครื่องมือ, ภาษาโปรแกรม), ทักษะด้านกระบวนการ (Agile, Project Management), และทักษะด้านอ่อน (Leadership, Communication) เน้น keywords ที่เป็นที่ต้องการในสายงานนี้"
        : "List 6-10 relevant skills for this role. Categorize as: technical tools & languages, methodologies & processes, and soft skills. Prioritize high-demand keywords for this career field.";
    case "education":
      return isTh
        ? "เขียนข้อมูลการศึกษา 1 รายการในรูปแบบ: วุฒิ | สถาบัน | สาขา | GPA ใช้ชื่อวุฒิ/สาขาเป็นภาษาอังกฤษ ห้ามมีคำอธิบายเพิ่มเติม และห้ามใช้เครื่องหมาย | ในเนื้อหาของแต่ละฟิลด์"
        : "Return a single education entry in this exact format: Degree | Institution | Field | GPA. Keep degree and field names in English. No extra explanations, and do not use '|' inside the field values.";
    case "publications":
      return isTh
        ? "เขียนผลงานวิชาการ 1 รายการในรูปแบบ: ชื่อบทความ | ผู้แต่ง | วารสาร | ปี ใช้รูปแบบ citation วิชาการ (ชื่อเรื่อง, รายชื่อผู้แต่ง, ชื่อวารสาร, ปีพิมพ์) ห้ามมีคำอธิบายเพิ่มเติม และห้ามใช้เครื่องหมาย | ในเนื้อหาของแต่ละฟิลด์"
        : "Write one academic publication in this exact format: Title | Authors | Journal | Year. Use standard academic citation style (article title, author list, journal name, publication year). No extra explanations, and do not use '|' inside the field values.";
    case "awards":
      return isTh
        ? "เขียนคำอธิบายรางวัล 1-2 ประโยค ระบุ: ชื่อรางวัล, ผู้มอบ, ปี และความสำคัญ/บริบทของรางวัล ใช้โทนวิชาการ กระชับ"
        : "Write a 1-2 sentence description of the award: award name, issuer, year, and its significance or context. Use a concise, academic tone.";
    case "teachingExperience":
      return isTh
        ? "เขียนรายละเอียดประสบการณ์สอน 2-3 ข้อ ระบุ: วิชาที่สอน, ระดับผู้เรียน, จำนวนผู้เรียน (ถ้ามี) และผลลัพธ์การเรียนการสอน ใช้คำกริยาวิชาการ กระชับ ไม่เกิน 25 คำต่อข้อ"
        : "Write 2-3 bullet points describing teaching experience: courses taught, student level, class sizes (if known), and teaching outcomes. Use academic action verbs, keep under 25 words per bullet.";
    case "researchExperience":
      return isTh
        ? "เขียนรายละเอียดประสบการณ์วิจัย 2-3 ข้อ ระบุ: คำถาม/ปัญหา, วิธีวิจัย, เครื่องมือ/เทคนิค และผลลัพธ์ (สิ่งพิมพ์/การนำเสนอ) ใช้คำกริยาวิชาการ กระชับ ไม่เกิน 25 คำต่อข้อ"
        : "Write 2-3 bullet points describing research experience: research question or problem, methodology, tools or techniques, and outcomes (publications or presentations). Use academic action verbs, keep under 25 words per bullet.";
    case "projects":
      return isTh
        ? "เขียนอธิบายโปรเจกต์ 1-2 ข้อ ประกอบด้วย: เทคโนโลยีที่ใช้, ปัญหาที่แก้ไข, ผลลัพธ์ (ใส่ตัวเลขเฉพาะเมื่อผู้ใช้ให้มาจริง ห้ามกุขึ้นเอง) ความยาวไม่เกิน 25 คำต่อข้อ"
        : "Write 1-2 bullet points describing the project. Include: technologies used, problem solved, and the outcome (only include a number if the user actually provided one — never invent one). Keep under 25 words each.";
    default:
      return isTh
        ? `ผู้ใช้กำลังเขียนส่วน ${section} ของเรซูเม่ ให้เนื้อหากระชับ ใช้คำกริยาแสดงความสำเร็จ และใส่ตัวเลขได้เฉพาะเมื่อผู้ใช้ให้มาจริงเท่านั้น ห้ามกุขึ้นเอง`
        : `The user is working on the ${section} section of their resume. Keep content concise, start with action verbs, and only include metrics if the user actually provided them — never invent one.`;
  }
}
