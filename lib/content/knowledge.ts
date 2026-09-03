import type { KnowledgeArticle } from "./types";

/**
 * Informational articles at /{locale}/knowledge/{slug}.
 * The two existing hand-built pages (how-to-use, cv-vs-resume) keep their own
 * routes; these are added via the dynamic [slug] route.
 */
export const KNOWLEDGE_ARTICLES: KnowledgeArticle[] = [
  // ────────────────────────────────────────────────────────────────────────
  {
    slug: "how-to-write-resume",
    breadcrumb: { th: "วิธีเขียน Resume", en: "How to Write a Resume" },
    datePublished: "2026-09-03",
    related: ["ats-resume-guide", "resume-summary-guide"],
    seeAlso: ["resume-builder", "resume-for-fresh-graduate"],
    th: {
      title: "วิธีเขียน Resume ทีละขั้นตอน สำหรับสมัครงาน | RMUTL Resume",
      description:
        "คู่มือเขียนเรซูเม่ตั้งแต่เริ่มต้น — โครงสร้างที่ควรมี วิธีเขียนแต่ละส่วน การใช้ตัวเลขวัดผล การจัดให้พอดี 1 หน้า และการปรับให้ผ่าน ATS",
      h1: "วิธีเขียน Resume ทีละขั้นตอน",
      intro:
        "เรซูเม่ที่ดีไม่ได้แปลว่าสวยที่สุด แต่คือเรซูเม่ที่ทำให้ผู้อ่านเข้าใจภายใน 10 วินาทีว่าคุณเหมาะกับตำแหน่งนี้เพราะอะไร บทความนี้อธิบายโครงสร้างมาตรฐานและวิธีเขียนแต่ละส่วน",
      sections: [
        {
          heading: "1. โครงสร้างมาตรฐานของ Resume",
          body: [
            "เรซูเม่ทั่วไปประกอบด้วย: ข้อมูลติดต่อ, สรุปโดยย่อ (Summary), ประสบการณ์ทำงาน, การศึกษา, ทักษะ และส่วนเสริมตามสายงาน (โปรเจกต์ ใบรับรอง ภาษา) เรียงจากสิ่งที่เกี่ยวข้องกับงานมากที่สุดลงมา",
          ],
        },
        {
          heading: "2. เขียนประสบการณ์ให้วัดผลได้",
          body: [
            "แต่ละบรรทัดใต้ตำแหน่งงานควรขึ้นต้นด้วยคำกริยา และจบด้วยผลลัพธ์ ใช้สูตร 'ทำอะไร + อย่างไร + ได้ผลอะไร' ใส่ตัวเลขเมื่อทำได้ เช่น เปอร์เซ็นต์ จำนวนเงิน จำนวนคน หรือเวลาที่ประหยัดได้",
          ],
          bullets: [
            "อ่อน: ดูแลโซเชียลมีเดียของบริษัท",
            "ดี: เพิ่มผู้ติดตาม Facebook 25% ใน 6 เดือนผ่านคอนเทนต์วิดีโอรายสัปดาห์",
          ],
        },
        {
          heading: "3. เลือกทักษะที่ตรงและพิสูจน์ได้",
          body: [
            "ใส่เฉพาะทักษะที่ใช้งานได้จริงและเกี่ยวกับตำแหน่ง แยกเป็นหมวดถ้ามีหลายด้าน หลีกเลี่ยงการให้คะแนนตัวเองเป็นดาวหรือเปอร์เซ็นต์ เพราะไม่มีมาตรฐานและ ATS อ่านไม่ได้",
          ],
        },
        {
          heading: "4. จัดให้พอดี 1 หน้า",
          body: [
            "สำหรับผู้มีประสบการณ์ไม่เกิน 10 ปี เรซูเม่ควรยาว 1 หน้า ตัดสิ่งที่ไม่เกี่ยวข้องออก เลือกเฉพาะประสบการณ์ที่ดีที่สุด 3–4 รายการ RMUTL Resume จะปรับสัดส่วนให้พอดีหน้าอัตโนมัติ",
          ],
        },
        {
          heading: "5. ปรับให้ตรงกับประกาศงานและ ATS",
          body: [
            "อ่านประกาศงาน หาคำที่ใช้ซ้ำ ๆ (ทักษะ เครื่องมือ คุณสมบัติ) แล้วสะท้อนคำเหล่านั้นในเรซูเม่เมื่อมันตรงกับตัวคุณจริง จากนั้นใช้เครื่องมือ ATS Score ตรวจก่อนส่ง",
          ],
        },
      ],
      faq: [
        {
          q: "ต้องใส่รูปถ่ายไหม",
          a: "ขึ้นกับตลาดและบริษัท สำหรับงานที่กรองด้วย ATS หนัก ๆ แนะนำให้ใส่เฉพาะเมื่อประกาศงานระบุ",
        },
        {
          q: "ควรใส่ที่อยู่เต็มไหม",
          a: "ไม่จำเป็น ใส่แค่จังหวัดหรือเขตก็พอ พร้อมอีเมลและเบอร์โทรที่ติดต่อได้",
        },
        {
          q: "Objective กับ Summary ต่างกันอย่างไร",
          a: "Objective บอกสิ่งที่คุณต้องการ ส่วน Summary บอกสิ่งที่คุณให้บริษัทได้ ปัจจุบันนิยม Summary มากกว่า",
        },
        {
          q: "ควรอัปเดตเรซูเม่บ่อยแค่ไหน",
          a: "ทุกครั้งที่สมัครงานใหม่ ควรปรับ Summary และลำดับเนื้อหาให้ตรงกับตำแหน่งนั้น",
        },
      ],
      ctaTitle: "ลงมือเขียน Resume ของคุณ",
      ctaBody: "ใช้เทมเพลตที่วางโครงสร้างมาให้แล้ว พร้อม AI ช่วยเขียน — ฟรี",
    },
    en: {
      title: "How to Write a Resume, Step by Step | RMUTL Resume",
      description:
        "A guide to writing a resume from scratch — the standard structure, how to write each section, using numbers to show impact, fitting one page, and passing ATS.",
      h1: "How to Write a Resume, Step by Step",
      intro:
        "A good resume isn't the prettiest one — it's the one that makes a reader understand within 10 seconds why you fit the role. This article covers the standard structure and how to write each section.",
      sections: [
        {
          heading: "1. The standard resume structure",
          body: [
            "A typical resume has: contact details, a short summary, work experience, education, skills, and role-specific extras (projects, certificates, languages) — ordered from most relevant to the job downward.",
          ],
        },
        {
          heading: "2. Write experience so it's measurable",
          body: [
            "Each bullet under a role should start with a verb and end with a result. Use 'what + how + outcome', with numbers where possible: percentages, amounts, headcount, or time saved.",
          ],
          bullets: [
            "Weak: managed the company's social media",
            "Strong: grew Facebook followers 25% in 6 months through weekly video content",
          ],
        },
        {
          heading: "3. Pick relevant, provable skills",
          body: [
            "List only skills you can actually use and that relate to the role, grouped into categories if you have several areas. Avoid rating yourself with stars or percentages — they're unstandardised and ATS can't read them.",
          ],
        },
        {
          heading: "4. Fit one page",
          body: [
            "For up to ~10 years of experience, a resume should be one page. Cut what isn't relevant and keep your best 3–4 experiences. RMUTL Resume scales the layout to fit automatically.",
          ],
        },
        {
          heading: "5. Match the posting and ATS",
          body: [
            "Read the job posting, find the repeated terms (skills, tools, requirements), and reflect them in your resume where they genuinely apply to you. Then run the ATS score check before sending.",
          ],
        },
      ],
      faq: [
        {
          q: "Do I need a photo?",
          a: "It depends on the market and company. For heavily ATS-screened roles, add one only if the posting asks.",
        },
        {
          q: "Should I include my full address?",
          a: "No — city or district is enough, with a reachable email and phone number.",
        },
        {
          q: "Objective vs. Summary — what's the difference?",
          a: "An objective states what you want; a summary states what you offer. Summaries are preferred today.",
        },
        {
          q: "How often should I update my resume?",
          a: "Every time you apply — adjust the summary and content order to match that role.",
        },
      ],
      ctaTitle: "Start writing your resume",
      ctaBody: "Use a template with the structure built in, plus an AI assistant — free.",
    },
  },

  // ────────────────────────────────────────────────────────────────────────
  {
    slug: "ats-resume-guide",
    breadcrumb: { th: "ATS Resume คู่มือ", en: "ATS Resume Guide" },
    datePublished: "2026-09-03",
    related: ["how-to-write-resume", "resume-summary-guide"],
    seeAlso: ["ats-resume", "resume-for-software-developer"],
    th: {
      title: "ATS คืออะไร และวิธีทำ Resume ให้ผ่าน ATS | RMUTL Resume",
      description:
        "อธิบาย Applicant Tracking System (ATS) แบบเข้าใจง่าย — ระบบทำงานอย่างไร รูปแบบไหนที่ทำให้ตก และเช็กลิสต์สำหรับทำเรซูเม่ให้ผ่านการคัดกรอง",
      h1: "ATS คืออะไร และทำ Resume ให้ผ่านได้อย่างไร",
      intro:
        "ก่อนที่ HR จะได้อ่านเรซูเม่ของคุณ ในหลายบริษัทมันจะถูกอ่านโดยซอฟต์แวร์ก่อน เรียกว่า Applicant Tracking System (ATS) การเข้าใจว่ามันทำงานอย่างไรช่วยให้คุณไม่ตกรอบเพราะเรื่องเทคนิค",
      sections: [
        {
          heading: "ATS ทำงานอย่างไร",
          body: [
            "ATS รับไฟล์เรซูเม่ แปลงเป็นข้อความ แล้วพยายามแยกออกเป็นช่องข้อมูล เช่น ชื่อ อีเมล ตำแหน่งล่าสุด ช่วงเวลาทำงาน ทักษะ จากนั้นเทียบกับคำอธิบายงานเพื่อให้คะแนนความตรง ผู้สมัครที่คะแนนสูงจะถูกส่งต่อให้คนอ่าน",
          ],
        },
        {
          heading: "สิ่งที่ทำให้ ATS อ่านผิด",
          body: [
            "รูปแบบเหล่านี้มักทำให้ข้อมูลหาย หรือถูกจัดผิดช่อง:",
          ],
          bullets: [
            "ตารางและคอลัมน์หลายชั้นสำหรับจัดวางเนื้อหา",
            "ข้อความสำคัญที่ฝังอยู่ในรูปภาพหรือกราฟิก",
            "หัวข้อที่ตั้งชื่อแปลก (เช่น 'เส้นทางของฉัน' แทน 'ประสบการณ์ทำงาน')",
            "ไฟล์ที่บันทึกเป็นรูปสแกนหรือ PDF จากการถ่ายภาพ",
            "ฟอนต์ตกแต่งที่เครื่องอ่านไม่รองรับ",
          ],
        },
        {
          heading: "เช็กลิสต์ Resume ที่ผ่าน ATS",
          body: [
            "ใช้หัวข้อมาตรฐาน (ประสบการณ์ทำงาน, การศึกษา, ทักษะ), เนื้อหาเป็นข้อความจริงทั้งหมด, โครงสร้างข้อมูลคอลัมน์เดียว, ส่งออกเป็น PDF ข้อความ, ใส่คีย์เวิร์ดจากประกาศงานในบริบทที่จริง และตรวจ ATS Score ก่อนส่ง",
          ],
        },
        {
          heading: "ATS ไม่ได้แทนที่คน",
          body: [
            "แม้ผ่าน ATS แล้ว เรซูเม่ก็ยังต้องอ่านรู้เรื่องและน่าสนใจสำหรับคน อย่าปรับจนภาษาแข็งหรือยัดคีย์เวิร์ดจนไม่เป็นธรรมชาติ เป้าหมายคือผ่านเครื่องและสะดุดตาคนพร้อมกัน",
          ],
        },
      ],
      faq: [
        {
          q: "ทุกบริษัทใช้ ATS ไหม",
          a: "ไม่ทั้งหมด แต่บริษัทขนาดกลางถึงใหญ่และการสมัครผ่านเว็บไซต์รับสมัครส่วนมากใช้ การทำเรซูเม่ให้ ATS อ่านได้จึงไม่มีข้อเสีย",
        },
        {
          q: "Word หรือ PDF ดีกว่ากันสำหรับ ATS",
          a: "ระบบสมัยใหม่ส่วนใหญ่อ่าน PDF ข้อความได้ดี ถ้าประกาศงานระบุให้ส่ง .docx ก็ทำตาม",
        },
        {
          q: "ใส่คีย์เวิร์ดสีขาวซ่อนไว้ได้ผลไหม",
          a: "ไม่ควรทำเด็ดขาด ระบบและ HR ตรวจจับได้ และถือเป็นการหลอกลวงที่ทำให้ใบสมัครถูกตัดทันที",
        },
        {
          q: "เรซูเม่ดีไซน์สวย ๆ ผ่าน ATS ได้ไหม",
          a: "ได้ ถ้าดีไซน์นั้นวางอยู่บนโครงสร้างข้อความจริงและคอลัมน์เดียวในเชิงข้อมูล เทมเพลตของ RMUTL Resume ออกแบบตามหลักนี้",
        },
      ],
      ctaTitle: "ทำ Resume ที่ผ่าน ATS",
      ctaBody: "เทมเพลตผ่าน ATS + เครื่องมือตรวจคะแนน — ฟรี",
    },
    en: {
      title: "What Is ATS and How to Make Your Resume Pass It | RMUTL Resume",
      description:
        "A plain-language explanation of the Applicant Tracking System (ATS) — how it works, which formats fail, and a checklist for a resume that clears screening.",
      h1: "What Is ATS, and How to Pass It",
      intro:
        "In many companies, before a recruiter reads your resume, software reads it first — the Applicant Tracking System (ATS). Understanding how it works keeps you from being cut for a technical reason.",
      sections: [
        {
          heading: "How an ATS works",
          body: [
            "The ATS takes your resume file, converts it to text, and tries to split it into fields — name, email, latest title, dates, skills — then compares it to the job description for a relevance score. High scorers get passed to a human.",
          ],
        },
        {
          heading: "What makes an ATS misread",
          body: [
            "These formats tend to lose information or file it in the wrong field:",
          ],
          bullets: [
            "Tables and multi-level columns used for layout",
            "Important text embedded in images or graphics",
            "Oddly named headings ('My Journey' instead of 'Work Experience')",
            "Files saved as a scan or a photographed PDF",
            "Decorative fonts the parser doesn't support",
          ],
        },
        {
          heading: "An ATS-passing resume checklist",
          body: [
            "Standard headings (Work Experience, Education, Skills), all real text, single-column information structure, exported as a text PDF, keywords from the posting used in genuine context, and an ATS score check before you send.",
          ],
        },
        {
          heading: "ATS doesn't replace people",
          body: [
            "Even after passing the ATS, the resume still has to read well and interest a person. Don't over-optimise into stiff language or unnatural keyword stuffing — the goal is to clear the machine and catch a human at the same time.",
          ],
        },
      ],
      faq: [
        {
          q: "Do all companies use an ATS?",
          a: "Not all, but most mid-to-large companies and applications through job portals do. Making your resume ATS-readable has no downside.",
        },
        {
          q: "Word or PDF for ATS?",
          a: "Most modern systems read text PDFs well. If a posting asks for .docx, follow it.",
        },
        {
          q: "Do hidden white keywords work?",
          a: "Never do this. Systems and recruiters detect it, and it's treated as deception that gets the application rejected immediately.",
        },
        {
          q: "Can a nicely designed resume pass ATS?",
          a: "Yes, if the design sits on real text structure and a single-column information layout. RMUTL Resume templates are built this way.",
        },
      ],
      ctaTitle: "Build an ATS-passing resume",
      ctaBody: "ATS-friendly templates plus a score checker — free.",
    },
  },

  // ────────────────────────────────────────────────────────────────────────
  {
    slug: "resume-summary-guide",
    breadcrumb: { th: "เขียน Summary", en: "Resume Summary" },
    datePublished: "2026-09-03",
    related: ["how-to-write-resume", "ats-resume-guide"],
    seeAlso: ["ai-resume-builder", "resume-for-fresh-graduate"],
    th: {
      title: "วิธีเขียน Summary ใน Resume ให้น่าสนใจ + ตัวอย่าง | RMUTL Resume",
      description:
        "วิธีเขียนส่วนสรุป (Summary) ที่หัวเรซูเม่ให้ HR สนใจใน 5 วินาที พร้อมโครงประโยค ตัวอย่างสำหรับเด็กจบใหม่และผู้มีประสบการณ์ และข้อผิดพลาดที่พบบ่อย",
      h1: "วิธีเขียน Summary ใน Resume",
      intro:
        "Summary คือ 2–4 บรรทัดบนสุดของเรซูเม่ที่ HR อ่านเป็นอย่างแรก มันควรตอบว่า 'คุณคือใคร เก่งอะไร และกำลังมองหางานแบบไหน' ให้จบในย่อหน้าเดียว",
      sections: [
        {
          heading: "โครงประโยคที่ใช้ได้",
          body: [
            "[บทบาท/สาขา] ที่มีประสบการณ์ [X ปี / ด้าน ...] เชี่ยวชาญ [ทักษะหลัก 2–3 อย่าง] เคย [ผลงานเด่น 1 อย่างพร้อมตัวเลข] กำลังมองหาโอกาสในตำแหน่ง [ประเภทงาน]",
          ],
        },
        {
          heading: "ตัวอย่างสำหรับผู้มีประสบการณ์",
          body: [
            "\"นักการตลาดดิจิทัลประสบการณ์ 4 ปี เชี่ยวชาญการทำ SEO และคอนเทนต์ เคยเพิ่มทราฟฟิกออร์แกนิกของเว็บบริษัท 60% ใน 1 ปี มองหาบทบาท Content Lead ในทีมที่ให้ความสำคัญกับข้อมูล\"",
          ],
        },
        {
          heading: "ตัวอย่างสำหรับเด็กจบใหม่",
          body: [
            "\"บัณฑิตสาขาวิศวกรรมคอมพิวเตอร์ สนใจงานพัฒนาเว็บฝั่ง Frontend มีประสบการณ์จากโปรเจกต์จบที่สร้างด้วย React และ TypeScript และการฝึกงาน 2 เดือนในทีมพัฒนาซอฟต์แวร์\"",
          ],
        },
        {
          heading: "ข้อผิดพลาดที่พบบ่อย",
          body: [
            "เขียนกว้างจนไม่บอกอะไร ('ขยัน อดทน เรียนรู้เร็ว'), ยาวเกิน 4 บรรทัด, ใช้สรรพนามบุรุษที่หนึ่ง ('ผม/ฉัน'), และเขียนเวอร์ชันเดียวใช้กับทุกที่โดยไม่ปรับ",
          ],
        },
      ],
      faq: [
        {
          q: "เด็กจบใหม่จำเป็นต้องมี Summary ไหม",
          a: "มีประโยชน์ เพราะช่วยชดเชยการที่ยังไม่มีประสบการณ์ยาว ๆ โดยชี้ให้เห็นทิศทางและจุดแข็งทันที",
        },
        {
          q: "Summary ต่างจาก About me อย่างไร",
          a: "เหมือนกันในทางปฏิบัติ แต่ในเรซูเม่ให้ใช้หัวข้อ 'Summary' หรือ 'สรุปโดยย่อ' เพราะ ATS คุ้นเคยมากกว่า",
        },
        {
          q: "ควรใส่ชื่อบริษัทที่อยากเข้าใน Summary ไหม",
          a: "ไม่จำเป็น แต่การปรับถ้อยคำให้สะท้อนคุณค่าและตำแหน่งของบริษัทนั้นช่วยได้",
        },
        {
          q: "เขียน Summary ภาษาอังกฤษไม่เก่ง ทำยังไง",
          a: "ร่างเป็นไทยก่อน แล้วใช้ผู้ช่วย AI ช่วยแปลและปรับสำนวนให้เป็นมืออาชีพ",
        },
      ],
      ctaTitle: "เขียน Summary ด้วยตัวช่วย AI",
      ctaBody: "ยกร่างและปรับ Summary ให้ตรงแต่ละงาน — ฟรี",
    },
    en: {
      title: "How to Write a Resume Summary That Works (+ Examples) | RMUTL Resume",
      description:
        "How to write the summary at the top of your resume so a recruiter is interested in 5 seconds — a sentence template, examples for new grads and experienced candidates, and common mistakes.",
      h1: "How to Write a Resume Summary",
      intro:
        "The summary is the 2–4 lines at the top of your resume that a recruiter reads first. It should answer 'who you are, what you're good at, and what you're looking for' in a single paragraph.",
      sections: [
        {
          heading: "A sentence template that works",
          body: [
            "[Role/field] with [X years / background in ...], skilled in [2–3 core skills], who [one standout achievement with a number], seeking a [type of role].",
          ],
        },
        {
          heading: "Example for an experienced candidate",
          body: [
            "\"Digital marketer with 4 years in SEO and content, who grew a company site's organic traffic 60% in one year, seeking a Content Lead role on a data-focused team.\"",
          ],
        },
        {
          heading: "Example for a new graduate",
          body: [
            "\"Computer engineering graduate interested in frontend web development, with a final-year project built in React and TypeScript and a 2-month internship on a software team.\"",
          ],
        },
        {
          heading: "Common mistakes",
          body: [
            "Being so broad it says nothing ('hard-working, patient, fast learner'), running past 4 lines, using first-person pronouns ('I'), and writing one version for every application without adjusting.",
          ],
        },
      ],
      faq: [
        {
          q: "Do new graduates need a summary?",
          a: "It helps — it offsets a lack of long experience by pointing to your direction and strengths immediately.",
        },
        {
          q: "Summary vs. 'About me'?",
          a: "Practically the same, but on a resume use 'Summary' — ATS are more familiar with it.",
        },
        {
          q: "Should I name the company I want to join in the summary?",
          a: "Not required, but wording it to reflect that company's values and the role helps.",
        },
        {
          q: "My English writing isn't strong — what do I do?",
          a: "Draft it in Thai first, then use the AI assistant to translate and refine it into professional phrasing.",
        },
      ],
      ctaTitle: "Write your summary with AI help",
      ctaBody: "Draft and tailor your summary per job — free.",
    },
  },
];

export const KNOWLEDGE_SLUGS = KNOWLEDGE_ARTICLES.map((a) => a.slug);

export function getKnowledgeArticle(slug: string): KnowledgeArticle | undefined {
  return KNOWLEDGE_ARTICLES.find((a) => a.slug === slug);
}

/** The two hand-built knowledge pages that have their own route files. */
export const KNOWLEDGE_STATIC_SLUGS = ["how-to-use", "cv-vs-resume"] as const;
