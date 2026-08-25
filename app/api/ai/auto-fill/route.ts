import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { enforceRateLimit } from "@/lib/rate-limit";
import { llmText } from "@/lib/ai/client";
import { autoFillRequestSchema } from "@/lib/validation/ai";
import { parseJsonBody } from "@/lib/validation/parse";

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const limited = enforceRateLimit(`ai:${user.id}`, 40, 5 * 60 * 1000);
  if (limited) return limited;

  try {
    const parsed = await parseJsonBody(req, autoFillRequestSchema);
    if (parsed.error) return parsed.error;
    const { section, context, prompt: userPrompt, locale, model } = parsed.data;

    const systemPrompt = locale === "th"
      ? `คุณคือผู้เชี่ยวชาญการเขียนเรซูเม่ที่ผ่าน ATS (Applicant Tracking System)
กฎ:
- ใช้คำกริยาที่แสดงความสำเร็จ (พัฒนา, เพิ่ม, ลด, จัดการ, นำทีม, ออกแบบ, ปรับปรุง)
- ใส่ตัวเลข/metrics ที่วัดผลได้ เช่น เพิ่มยอดขาย 30%, ลดต้นทุน 15%, จัดการทีม 10 คน
- เนื้อหากระทัดรัด ไม่เกิน 1-2 บรรทัดต่อหัวข้อ
- ใส่ keywords ที่เกี่ยวข้องกับตำแหน่งงาน
- หลีกเลี่ยงภาษาพูด คำฟุ่มเฟือย หรือเนื้อหาที่ไม่เฉพาะเจาะจง
- ตอบเฉพาะเนื้อหาที่ขอเท่านั้น ไม่ต้องมีคำอธิบายเพิ่มเติม`
      : `You are an ATS-optimized resume writing expert.
Rules:
- Use strong action verbs (achieved, led, developed, improved, designed, managed, reduced, increased)
- Quantify achievements with numbers/metrics where possible (e.g., increased sales 30%, led team of 10, reduced costs 15%)
- Keep each bullet point 1-2 lines max, concise and impactful
- Include relevant keywords from the target role/industry
- Avoid first-person pronouns, fluff, or generic statements
- Output only the requested content, no explanations`;

    const sectionContext = getSectionContext(section, context, locale);

    const userContent = `${sectionContext}\n\nUser request: ${userPrompt}\n\nProvide the content in a professional ATS-optimized resume style. Return only the content text without any additional explanations.`;

    const text = await llmText({
      role: "autofill",
      modelId: model,
      system: systemPrompt,
      user: userContent,
    });

    return NextResponse.json({ content: text });
  } catch (error) {
    console.error("AI auto-fill error:", error);
    return NextResponse.json(
      { error: "AI service error. Please try again." },
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
        ? "เขียนสรุปอาชีพ (Professional Summary) ความยาว 2-3 บรรทัด ประกอบด้วย: ปีประสบการณ์, ทักษะหลัก 3 อย่าง, อุตสาหกรรมที่เชี่ยวชาญ, และความสำเร็จที่วัดผลได้ ใช้ภาษาเรียกตัวเองว่า 'มีประสบการณ์' ไม่ใช้ 'ฉัน' หรือ 'ผม'"
        : "Write a 2-3 line professional summary. Include: years of experience, top 3 skills, key industries, and a career highlight with metrics. Keep under 50 words. Use third-person implied voice (e.g., 'Experienced engineer with...').";
    case "experience":
      return isTh
        ? `เขียนรายละเอียดประสบการณ์ทำงาน 2-3 ข้อ ในรูปแบบ STAR (Situation-Task-Action-Result)
ตำแหน่ง: ${context?.jobTitle || "N/A"}
บริษัท: ${context?.company || "N/A"}
แต่ละข้อ: เริ่มด้วยคำกริยาแสดงความสำเร็จ, อธิบายสิ่งที่ทำและผลลัพธ์, ใส่ตัวเลข/metrics
ความยาวไม่เกิน 25 คำต่อข้อ`
        : `Write 2-3 bullet points for this role using STAR format (Situation-Task-Action-Result).
Title: ${context?.jobTitle || "N/A"}
Company: ${context?.company || "N/A"}
Each bullet: start with a strong action verb, describe challenge/action/result, include metrics.
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
        ? "เขียนอธิบายโปรเจกต์ 1-2 ข้อ ประกอบด้วย: เทคโนโลยีที่ใช้, ปัญหาที่แก้ไข, ผลลัพธ์ที่วัดได้ ความยาวไม่เกิน 25 คำต่อข้อ"
        : "Write 1-2 bullet points describing the project. Include: technologies used, problem solved, measurable outcome. Keep under 25 words each.";
    default:
      return isTh
        ? `ผู้ใช้กำลังเขียนส่วน ${section} ของเรซูเม่ ให้เนื้อหากระชับ ใส่ตัวเลข และใช้คำกริยาแสดงความสำเร็จ`
        : `The user is working on the ${section} section of their resume. Keep content concise, use metrics, and start with action verbs.`;
  }
}
