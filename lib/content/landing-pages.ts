import type { LandingPage } from "./types";

/**
 * Commercial-intent landing pages served at /{locale}/{slug}.
 * Each page is unique content answering a distinct search intent — never the
 * same body with swapped keywords.
 */
export const LANDING_PAGES: LandingPage[] = [
  // ────────────────────────────────────────────────────────────────────────
  {
    slug: "resume-builder",
    breadcrumb: { th: "สร้าง Resume ออนไลน์", en: "Online Resume Builder" },
    related: ["ats-resume", "ai-resume-builder", "resume-for-fresh-graduate"],
    readMore: ["how-to-write-resume", "ats-resume-guide"],
    th: {
      title: "สร้าง Resume ออนไลน์ฟรี ภาษาไทย/อังกฤษ | RMUTL Resume",
      description:
        "โปรแกรมสร้าง Resume ออนไลน์ฟรี ไม่ต้องติดตั้ง เลือกเทมเพลตที่ผ่าน ATS กรอกข้อมูล พรีวิวสด แล้วดาวน์โหลดเป็น PDF หรือแชร์ลิงก์ รองรับภาษาไทยและอังกฤษ",
      h1: "สร้าง Resume ออนไลน์ฟรี ภายในไม่กี่นาที",
      intro:
        "RMUTL Resume คือเครื่องมือสร้างเรซูเม่ออนไลน์ที่ใช้งานได้ฟรีเต็มรูปแบบ ไม่ต้องดาวน์โหลดโปรแกรม ไม่ต้องมีความรู้ด้านการออกแบบ เพียงเลือกเทมเพลต กรอกข้อมูลของคุณ แล้วระบบจะจัดหน้าให้อ่านง่ายและผ่านระบบคัดกรองใบสมัคร (ATS) โดยอัตโนมัติ",
      sections: [
        {
          heading: "ใช้งานได้ทันทีบนเบราว์เซอร์",
          body: [
            "ทุกอย่างทำงานบนหน้าเว็บ เปิดจากคอมพิวเตอร์หรือมือถือก็ได้ ข้อมูลถูกบันทึกอัตโนมัติบนคลาวด์ กลับมาแก้ต่อเมื่อไหร่ก็ได้ และสร้างเรซูเม่ได้หลายเวอร์ชันสำหรับแต่ละตำแหน่งงาน",
          ],
        },
        {
          heading: "เทมเพลตที่ผ่านมาตรฐาน ATS",
          body: [
            "เทมเพลตทั้ง 7 แบบใช้โครงสร้างข้อความจริง หัวข้อชัดเจน ไม่มีตาราง กล่องข้อความ หรือกราฟิกที่ทำให้ระบบ ATS อ่านไม่ออก คุณจึงมั่นใจได้ว่าข้อมูลสำคัญจะถูกดึงไปแสดงต่อ HR อย่างครบถ้วน",
          ],
        },
        {
          heading: "พรีวิวสดขณะพิมพ์",
          body: [
            "ทุกครั้งที่แก้ไข ตัวอย่างเรซูเม่ด้านข้างจะอัปเดตทันที ปรับสีหลัก จัดลำดับหัวข้อ เพิ่ม–ลบส่วนต่าง ๆ ได้อิสระ และเห็นผลลัพธ์แบบเรียลไทม์ก่อนดาวน์โหลด",
          ],
        },
        {
          heading: "ส่งออก PDF หรือแชร์เป็นลิงก์",
          body: [
            "ดาวน์โหลดเป็นไฟล์ PDF ขนาด A4 หน้าเดียวที่เป็นข้อความจริง (ไม่ใช่รูปภาพ) เหมาะกับการอัปโหลดในระบบสมัครงาน หรือแชร์เป็นลิงก์สาธารณะให้ผู้รับสมัครเปิดดูได้ทันทีโดยไม่ต้องดาวน์โหลด",
          ],
        },
      ],
      faq: [
        {
          q: "ใช้ฟรีจริงไหม มีค่าใช้จ่ายแอบแฝงหรือเปล่า",
          a: "ฟรีทั้งหมด ทั้งการสร้าง แก้ไข ดาวน์โหลด PDF และแชร์ลิงก์ ไม่มีลายน้ำและไม่จำกัดจำนวนเรซูเม่",
        },
        {
          q: "ต้องสมัครสมาชิกก่อนไหม",
          a: "ต้องสมัครบัญชีฟรีเพื่อบันทึกเรซูเม่ไว้บนคลาวด์และกลับมาแก้ไขภายหลัง ใช้อีเมลหรือบัญชี Google ก็ได้",
        },
        {
          q: "สร้างเรซูเม่ภาษาไทยได้ไหม",
          a: "ได้ เนื้อหาของเรซูเม่แยกการตั้งค่าภาษาออกจากภาษาของหน้าเว็บ ระบบจะปรับหัวข้อส่วนต่าง ๆ ให้เป็นภาษาไทยหรืออังกฤษโดยอัตโนมัติตามเนื้อหาที่คุณกรอก",
        },
        {
          q: "เรซูเม่ที่ได้ยาวกี่หน้า",
          a: "ระบบออกแบบให้พอดี 1 หน้า A4 เสมอ โดยปรับสัดส่วนอัตโนมัติ ซึ่งเป็นความยาวมาตรฐานที่ HR ส่วนใหญ่ต้องการ",
        },
      ],
      ctaTitle: "เริ่มสร้าง Resume ของคุณเลย",
      ctaBody: "เลือกเทมเพลต กรอกข้อมูล ดาวน์โหลด PDF — ฟรี ไม่มีข้อจำกัด",
    },
    en: {
      title: "Free Online Resume Builder — Thai & English | RMUTL Resume",
      description:
        "Build a resume online for free — no install. Pick an ATS-friendly template, fill in your details with a live preview, then export to PDF or share a link. Thai and English.",
      h1: "Build Your Resume Online for Free",
      intro:
        "RMUTL Resume is a fully free online resume builder. There is nothing to install and no design skill required — pick a template, enter your details, and the layout stays readable and parseable by Applicant Tracking Systems (ATS) automatically.",
      sections: [
        {
          heading: "Works straight from the browser",
          body: [
            "Everything runs on the web from a laptop or phone. Your work is auto-saved to the cloud so you can pick it up any time, and you can keep several versions tailored to different roles.",
          ],
        },
        {
          heading: "ATS-friendly templates",
          body: [
            "All 7 templates use real text structure with clear headings — no tables, text boxes or graphics that break ATS parsing — so every important detail reaches the recruiter intact.",
          ],
        },
        {
          heading: "Live preview while you type",
          body: [
            "The preview updates on every keystroke. Change the accent color, reorder sections, add or remove blocks, and see the final result in real time before you download.",
          ],
        },
        {
          heading: "Export to PDF or share a link",
          body: [
            "Download a single-page A4 PDF built from real text (not an image), ready for job-application portals — or share a public link a recruiter can open without downloading anything.",
          ],
        },
      ],
      faq: [
        {
          q: "Is it really free? Any hidden costs?",
          a: "Completely free — creating, editing, PDF download and link sharing. No watermark and no limit on the number of resumes.",
        },
        {
          q: "Do I need an account?",
          a: "A free account is needed to save resumes to the cloud and return to edit them later. You can sign in with email or Google.",
        },
        {
          q: "Can I build a Thai resume?",
          a: "Yes. Resume content has its own language setting, separate from the site language, and section headings switch to Thai or English automatically based on what you type.",
        },
        {
          q: "How long is the resume?",
          a: "It is designed to always fit one A4 page by scaling automatically — the standard length most recruiters expect.",
        },
      ],
      ctaTitle: "Start building your resume",
      ctaBody: "Pick a template, fill it in, export the PDF — free, no limits.",
    },
  },

  // ────────────────────────────────────────────────────────────────────────
  {
    slug: "ats-resume",
    breadcrumb: { th: "Resume ผ่าน ATS", en: "ATS Resume" },
    related: ["resume-builder", "ai-resume-builder", "resume-for-software-developer"],
    readMore: ["ats-resume-guide", "how-to-write-resume"],
    th: {
      title: "สร้าง Resume ที่ผ่าน ATS พร้อมตรวจคะแนน | RMUTL Resume",
      description:
        "สร้างเรซูเม่ที่ระบบ ATS อ่านได้ครบถ้วน พร้อมเครื่องมือตรวจ ATS Score และคำแนะนำคีย์เวิร์ดที่ขาด เพื่อเพิ่มโอกาสผ่านด่านคัดกรองใบสมัคร",
      h1: "Resume ที่ผ่าน ATS — ตรวจคะแนนก่อนส่งจริง",
      intro:
        "บริษัทจำนวนมากใช้ระบบ Applicant Tracking System (ATS) กรองใบสมัครก่อนถึงมือ HR หากเรซูเม่จัดรูปแบบไม่ถูกต้องหรือขาดคีย์เวิร์ดสำคัญ ใบสมัครอาจถูกตัดออกตั้งแต่ต้น RMUTL Resume ช่วยให้เรซูเม่ของคุณอ่านได้ครบและวัดผลได้ก่อนส่ง",
      sections: [
        {
          heading: "ATS คืออะไร และทำไมต้องสนใจ",
          body: [
            "ATS คือซอฟต์แวร์ที่อ่านไฟล์เรซูเม่ แยกข้อมูลออกเป็นช่อง (ชื่อ ตำแหน่ง ทักษะ ประสบการณ์) แล้วจับคู่กับคำอธิบายงาน เรซูเม่ที่ใช้ตาราง คอลัมน์ซับซ้อน รูปภาพแทนข้อความ หรือฟอนต์แปลก ๆ มักถูกอ่านผิดเพี้ยน ทำให้คะแนนความตรงต่ำ",
          ],
        },
        {
          heading: "โครงสร้างที่ ATS อ่านออก",
          body: [
            "ทุกเทมเพลตในระบบใช้หัวข้อมาตรฐาน (Experience, Education, Skills) เรียงจากบนลงล่างเป็นคอลัมน์เดียวในเชิงข้อมูล ใช้ข้อความจริงทั้งหมด และส่งออก PDF ที่เป็นข้อความ ไม่ใช่ภาพสแกน",
          ],
        },
        {
          heading: "ตรวจ ATS Score และคีย์เวิร์ดที่ขาด",
          body: [
            "วางคำอธิบายงานที่คุณจะสมัคร ระบบจะให้คะแนนความตรง พร้อมชี้คีย์เวิร์ดและทักษะที่ประกาศงานต้องการแต่ยังไม่มีในเรซูเม่ จากนั้นใช้ AI ช่วยปรับถ้อยคำจนคะแนนผ่านเกณฑ์",
          ],
        },
        {
          heading: "ปรับเรซูเม่ให้ตรงแต่ละงาน",
          body: [
            "ATS ให้คะแนนตามความตรงกับประกาศงานแต่ละใบ การส่งเรซูเม่เวอร์ชันเดียวกับทุกที่จึงเสียเปรียบ ระบบให้คุณทำสำเนาและปรับเฉพาะจุดสำหรับแต่ละตำแหน่งได้ในไม่กี่คลิก",
          ],
        },
      ],
      faq: [
        {
          q: "รูปแบบไฟล์ไหนที่ ATS อ่านได้ดีที่สุด",
          a: "PDF ที่สร้างจากข้อความ (ไม่ใช่ภาพ) อ่านได้ดีที่สุดในระบบส่วนใหญ่ ไฟล์ PDF ที่ RMUTL Resume ส่งออกเป็นข้อความจริงทั้งหมด",
        },
        {
          q: "ควรใส่คีย์เวิร์ดมากแค่ไหน",
          a: "ใส่เฉพาะคีย์เวิร์ดที่ตรงกับทักษะและประสบการณ์จริงของคุณ และสอดคล้องกับประกาศงาน การยัดคีย์เวิร์ดซ้ำ ๆ ทำให้อ่านไม่เป็นธรรมชาติและ HR จับได้",
        },
        {
          q: "ควรใส่รูปถ่ายในเรซูเม่ ATS ไหม",
          a: "สำหรับตลาดที่เน้น ATS แนะนำให้ใส่เฉพาะเมื่อประกาศงานระบุ เพราะบางระบบข้ามรูปภาพหรืออ่านข้อความรอบ ๆ ผิดพลาด เทมเพลตของเรามีทั้งแบบมีและไม่มีรูป",
        },
        {
          q: "ATS Score เท่าไรถึงเรียกว่าผ่าน",
          a: "ไม่มีเลขตายตัว แต่ยิ่งคะแนนความตรงสูงและครอบคลุมคีย์เวิร์ดหลักของประกาศงานมากเท่าไร โอกาสผ่านด่านแรกก็ยิ่งสูง",
        },
      ],
      ctaTitle: "ตรวจ ATS Score ของเรซูเม่คุณ",
      ctaBody: "สร้างเรซูเม่ วางประกาศงาน ดูคะแนนและคีย์เวิร์ดที่ขาด — ฟรี",
    },
    en: {
      title: "ATS Resume Builder with ATS Score Check | RMUTL Resume",
      description:
        "Build a resume ATS software can fully parse, then check your ATS score and see the keywords you are missing to get past the screening stage.",
      h1: "ATS Resume Builder — Check Your Score Before You Apply",
      intro:
        "Many companies screen applications with an Applicant Tracking System (ATS) before a recruiter sees them. A poorly formatted resume — or one missing key terms — can be filtered out early. RMUTL Resume keeps your resume parseable and lets you measure it before you send.",
      sections: [
        {
          heading: "What an ATS is and why it matters",
          body: [
            "An ATS reads your resume file, splits it into fields (name, title, skills, experience), and matches it against the job description. Tables, complex columns, images instead of text, or unusual fonts get misread, which lowers your relevance score.",
          ],
        },
        {
          heading: "Structure an ATS can read",
          body: [
            "Every template uses standard headings (Experience, Education, Skills) in a single logical column, all real text, exported as a text-based PDF rather than a scan.",
          ],
        },
        {
          heading: "Check your ATS score and missing keywords",
          body: [
            "Paste the job description you are applying to and the tool scores your match, highlighting the keywords and skills the posting asks for that are not yet in your resume. Then use the AI assistant to rework the wording until you pass.",
          ],
        },
        {
          heading: "Tailor per job",
          body: [
            "An ATS scores relevance against each individual posting, so sending one identical resume everywhere puts you at a disadvantage. Duplicate and adjust for each role in a few clicks.",
          ],
        },
      ],
      faq: [
        {
          q: "Which file format do ATS read best?",
          a: "A text-based PDF (not an image) is read most reliably by the majority of systems. Every PDF RMUTL Resume exports is real text.",
        },
        {
          q: "How many keywords should I add?",
          a: "Only keywords that match your real skills and experience and align with the posting. Stuffing repeated keywords reads unnaturally and recruiters notice.",
        },
        {
          q: "Should an ATS resume include a photo?",
          a: "In ATS-heavy markets, add one only if the posting asks for it — some systems skip images or misread the text around them. Our templates come with and without a photo.",
        },
        {
          q: "What ATS score counts as passing?",
          a: "There is no fixed number, but the higher your relevance and coverage of the posting's core keywords, the better your odds of clearing the first stage.",
        },
      ],
      ctaTitle: "Check your resume's ATS score",
      ctaBody: "Build a resume, paste a job description, see the score and gaps — free.",
    },
  },

  // ────────────────────────────────────────────────────────────────────────
  {
    slug: "ai-resume-builder",
    breadcrumb: { th: "AI ช่วยเขียน Resume", en: "AI Resume Builder" },
    related: ["resume-builder", "ats-resume", "resume-for-software-developer"],
    readMore: ["how-to-write-resume", "resume-for-fresh-graduate"],
    th: {
      title: "AI ช่วยเขียน Resume ภาษาไทย/อังกฤษ | RMUTL Resume",
      description:
        "ใช้ AI ช่วยเขียนและปรับ Resume — เปลี่ยนหน้าที่งานให้เป็นประโยคที่วัดผลได้ ตรวจไวยากรณ์ ปรับให้ตรงกับตำแหน่งที่สมัคร รองรับภาษาไทยและอังกฤษ",
      h1: "ให้ AI ช่วยเขียน Resume ที่อ่านแล้วน่าจ้าง",
      intro:
        "จุดที่คนส่วนใหญ่ติดคือ 'จะเขียนยังไงให้ดูมืออาชีพ' RMUTL Resume มีผู้ช่วย AI ที่ช่วยยกร่าง ปรับสำนวน และทำให้แต่ละบรรทัดสื่อถึงผลงานจริง โดยที่คุณยังคุมเนื้อหาทั้งหมด",
      sections: [
        {
          heading: "เปลี่ยนหน้าที่งานให้เป็นผลลัพธ์",
          body: [
            "แทนที่จะเขียนว่า 'รับผิดชอบดูแลโซเชียลมีเดีย' AI จะช่วยปรับเป็นประโยคที่มีตัวเลขและผลลัพธ์ เช่น 'เพิ่มยอดเอ็นเกจเมนต์ 40% ใน 3 เดือนผ่านคอนเทนต์รายสัปดาห์' ซึ่งเป็นรูปแบบที่ HR และ ATS ให้น้ำหนัก",
          ],
        },
        {
          heading: "ปรับ ปรับปรุง ขัดเกลา และแก้ไวยากรณ์",
          body: [
            "เลือกข้อความแล้วสั่งให้ AI ปรับปรุงให้กระชับขึ้น เขียนใหม่ในโทนมืออาชีพ หรือแก้ไวยากรณ์ทั้งภาษาไทยและอังกฤษ เหมาะกับคนที่ต้องส่งเรซูเม่ภาษาอังกฤษแต่ไม่มั่นใจสำนวน",
          ],
        },
        {
          heading: "ปรับให้ตรงกับตำแหน่งที่สมัคร",
          body: [
            "วางประกาศงาน แล้ว AI จะเสนอวิธีเน้นประสบการณ์และทักษะที่ตรงกับตำแหน่งนั้นมากขึ้น โดยไม่แต่งเรื่องเพิ่ม ใช้เฉพาะข้อมูลที่คุณมีอยู่แล้ว",
          ],
        },
        {
          heading: "กรอกอัตโนมัติจากเรซูเม่เดิม",
          body: [
            "ถ้ามีเรซูเม่เก่าเป็น PDF อัปโหลดได้เลย ระบบจะดึงข้อความและกรอกลงฟอร์มให้อัตโนมัติ ประหยัดเวลาพิมพ์ใหม่ทั้งหมด แล้วค่อยให้ AI ช่วยขัดเกลาต่อ",
          ],
        },
      ],
      faq: [
        {
          q: "AI จะแต่งข้อมูลที่ไม่จริงให้ไหม",
          a: "ไม่ AI ทำงานกับข้อความที่คุณกรอกเท่านั้น ช่วยปรับสำนวนและโครงประโยค คุณควรตรวจทานทุกครั้งและแก้ให้ตรงกับความจริง",
        },
        {
          q: "ใช้ AI ได้กี่ครั้ง",
          a: "ใช้ได้ฟรีในการใช้งานปกติ มีการจำกัดอัตราการเรียกต่อผู้ใช้เพื่อป้องกันการใช้งานผิดปกติเท่านั้น",
        },
        {
          q: "รองรับการเขียนภาษาอังกฤษไหม",
          a: "รองรับ AI ช่วยปรับสำนวนและตรวจไวยากรณ์ภาษาอังกฤษได้ เหมาะกับการสมัครงานบริษัทข้ามชาติหรือตำแหน่งที่ต้องใช้ภาษาอังกฤษ",
        },
        {
          q: "ต่างจากการให้ ChatGPT เขียนให้ยังไง",
          a: "AI ทำงานอยู่ในเครื่องมือสร้างเรซูเม่โดยตรง จึงเข้าใจโครงสร้างแต่ละส่วน ช่วยทีละจุด และผลลัพธ์เข้าไปอยู่ในเทมเพลตที่ผ่าน ATS ทันทีโดยไม่ต้องคัดลอกไปมา",
        },
      ],
      ctaTitle: "ลองผู้ช่วย AI เขียน Resume",
      ctaBody: "ยกร่าง ปรับสำนวน แก้ไวยากรณ์ — ฟรี ทั้งไทยและอังกฤษ",
    },
    en: {
      title: "AI Resume Builder — Thai & English Writing Assistant | RMUTL Resume",
      description:
        "Use AI to draft and refine your resume — turn duties into measurable results, fix grammar, and tailor to each job. Works in Thai and English.",
      h1: "Let AI Help You Write a Resume Worth Hiring",
      intro:
        "The hardest part is usually 'how do I make this sound professional?' RMUTL Resume has an AI assistant that helps you draft, rephrase, and make every line show real impact — while you stay in control of the content.",
      sections: [
        {
          heading: "Turn duties into results",
          body: [
            "Instead of 'responsible for social media', the AI helps rewrite it as a line with numbers and outcomes — 'grew engagement 40% in 3 months through weekly content' — the format recruiters and ATS weight most.",
          ],
        },
        {
          heading: "Improve, rewrite, polish, fix grammar",
          body: [
            "Select any text and ask the AI to tighten it, rewrite it in a professional tone, or fix grammar in Thai or English — useful when you need an English resume but aren't sure of the phrasing.",
          ],
        },
        {
          heading: "Tailor to the job",
          body: [
            "Paste a posting and the AI suggests how to emphasise the experience and skills that match — without inventing anything, using only what you already provided.",
          ],
        },
        {
          heading: "Auto-fill from an old resume",
          body: [
            "Have an old PDF resume? Upload it and the tool extracts the text and fills the form for you, so you skip retyping and go straight to polishing.",
          ],
        },
      ],
      faq: [
        {
          q: "Will the AI make up information?",
          a: "No. It only works with the text you enter, adjusting phrasing and sentence structure. Always review and correct it to match the truth.",
        },
        {
          q: "How many times can I use the AI?",
          a: "Free for normal use. There is a per-user rate limit only to prevent abuse.",
        },
        {
          q: "Does it support English writing?",
          a: "Yes — the AI can refine phrasing and check English grammar, which helps for multinational companies or English-required roles.",
        },
        {
          q: "How is this different from asking ChatGPT?",
          a: "The AI is built into the resume editor, so it understands each section, helps one part at a time, and the result lands directly in an ATS-friendly template with no copy-pasting.",
        },
      ],
      ctaTitle: "Try the AI writing assistant",
      ctaBody: "Draft, rephrase, fix grammar — free, in Thai and English.",
    },
  },

  // ────────────────────────────────────────────────────────────────────────
  {
    slug: "resume-for-software-developer",
    breadcrumb: { th: "Resume โปรแกรมเมอร์", en: "Developer Resume" },
    related: ["ats-resume", "ai-resume-builder", "resume-for-fresh-graduate"],
    readMore: ["how-to-write-resume", "ats-resume-guide"],
    th: {
      title: "วิธีเขียน Resume สำหรับ Software Developer + สร้างฟรี | RMUTL Resume",
      description:
        "แนวทางเขียนเรซูเม่สำหรับโปรแกรมเมอร์และนักพัฒนาซอฟต์แวร์ — ทักษะ ภาษาโปรแกรม โปรเจกต์ ประสบการณ์ และวิธีให้ผ่าน ATS พร้อมสร้างออนไลน์ฟรี",
      h1: "Resume สำหรับ Software Developer — เขียนยังไงให้ได้สัมภาษณ์",
      intro:
        "เรซูเม่สายพัฒนาซอฟต์แวร์ต้องสื่อ 2 อย่างพร้อมกัน: คุณทำอะไรเป็น (เทคโนโลยี) และคุณสร้างอะไรมาแล้ว (ผลงาน) หน้านี้สรุปสิ่งที่ควรมีในแต่ละส่วน และช่วยคุณสร้างออนไลน์ได้ทันที",
      sections: [
        {
          heading: "ส่วน Skills — จัดกลุ่มให้อ่านง่าย",
          body: [
            "แยกเป็นหมวด เช่น Languages, Frameworks, Databases, Tools/DevOps ใส่เฉพาะสิ่งที่ใช้งานได้จริงในระดับที่พูดถึงตอนสัมภาษณ์ได้ หลีกเลี่ยงการไล่รายชื่อยาวเป็นสิบ ๆ ตัวโดยไม่มีบริบท",
          ],
        },
        {
          heading: "ส่วน Projects — สำคัญที่สุดสำหรับเด็กจบใหม่",
          body: [
            "แต่ละโปรเจกต์ควรมี: ทำอะไร ใช้เทคโนโลยีอะไร บทบาทของคุณ และผลลัพธ์หรือความท้าทายที่แก้ได้ ใส่ลิงก์ GitHub หรือ demo ถ้ามี ตัวอย่าง: 'ระบบจองห้องประชุม (Next.js, PostgreSQL) — ออกแบบ schema และ API รองรับผู้ใช้พร้อมกัน 200 คน'",
          ],
        },
        {
          heading: "ส่วน Experience — เน้นผลกระทบ ไม่ใช่หน้าที่",
          body: [
            "เขียนแต่ละบรรทัดในรูปแบบ 'ทำ X ด้วย Y ส่งผลให้ Z' ใส่ตัวเลขเมื่อทำได้ เช่น ลดเวลาโหลดหน้า ลด bug ที่ report เพิ่ม coverage ของเทสต์ ถ้าเป็นงานฝึกงานหรือ freelance ก็นับได้",
          ],
        },
        {
          heading: "ผ่าน ATS ด้วยการจับคู่คีย์เวิร์ด",
          body: [
            "ประกาศงาน dev มักระบุ stack ชัดเจน ตรวจว่าเทคโนโลยีหลักในประกาศ (เช่น React, TypeScript, AWS) ปรากฏในเรซูเม่ในบริบทจริง ใช้เครื่องมือ ATS Score เช็คก่อนส่ง",
          ],
        },
      ],
      faq: [
        {
          q: "ยังไม่มีประสบการณ์ทำงาน ควรใส่อะไรแทน",
          a: "เน้นส่วน Projects (งานเรียน งานอดิเรก โอเพนซอร์ส) และ Education ใส่คอร์สหรือ certificate ที่เกี่ยวข้อง โปรเจกต์ที่อธิบายได้ดีมีน้ำหนักกว่าประสบการณ์สั้น ๆ ที่ไม่ชัด",
        },
        {
          q: "ควรใส่ GitHub ไหม",
          a: "ควร ถ้าโปรไฟล์มีงานที่จัดระเบียบดีและมี README ลิงก์ GitHub หรือ portfolio ช่วยให้ผู้สัมภาษณ์เห็นโค้ดจริงของคุณ",
        },
        {
          q: "เรซูเม่ dev ควรยาวกี่หน้า",
          a: "1 หน้าสำหรับผู้มีประสบการณ์ไม่เกิน 5–7 ปี ระบบจะจัดให้พอดี 1 หน้าอัตโนมัติ",
        },
        {
          q: "ใส่ระดับความชำนาญเป็นดาวหรือ % ดีไหม",
          a: "ไม่แนะนำ เพราะเป็นการวัดที่ไม่มีมาตรฐานและ ATS อ่านไม่ได้ ให้ระบุผ่านบริบทแทน เช่น จำนวนปีที่ใช้ หรือโปรเจกต์ที่ทำด้วยเทคโนโลยีนั้น",
        },
      ],
      ctaTitle: "สร้าง Resume Developer ของคุณ",
      ctaBody: "มีเทมเพลตที่มีส่วน Projects และ Skills แบบจัดกลุ่ม — ฟรี",
    },
    en: {
      title: "Software Developer Resume Guide + Free Builder | RMUTL Resume",
      description:
        "How to write a resume as a software developer — skills, languages, projects, experience and passing ATS. Build one online for free.",
      h1: "Software Developer Resume — How to Land the Interview",
      intro:
        "A developer resume has to communicate two things at once: what you can build with (technologies) and what you have built (results). This page covers what belongs in each section and lets you build one online right away.",
      sections: [
        {
          heading: "Skills — group them so they scan",
          body: [
            "Split into categories like Languages, Frameworks, Databases, Tools/DevOps. List only what you can actually discuss in an interview, and avoid a flat list of dozens of technologies with no context.",
          ],
        },
        {
          heading: "Projects — the most important section for new grads",
          body: [
            "Each project should show what it does, the tech used, your role, and an outcome or challenge you solved. Add a GitHub or demo link. Example: 'Meeting-room booking system (Next.js, PostgreSQL) — designed the schema and API for 200 concurrent users.'",
          ],
        },
        {
          heading: "Experience — lead with impact, not duties",
          body: [
            "Write each line as 'did X using Y, resulting in Z', with numbers where possible — reduced page load time, cut reported bugs, raised test coverage. Internships and freelance work count.",
          ],
        },
        {
          heading: "Pass ATS through keyword matching",
          body: [
            "Developer postings usually name the stack explicitly. Check that the core technologies from the posting (React, TypeScript, AWS, …) appear in your resume in real context, and use the ATS score check before you send.",
          ],
        },
      ],
      faq: [
        {
          q: "No work experience yet — what goes there instead?",
          a: "Lead with Projects (coursework, side projects, open source) and Education, plus relevant courses or certificates. A well-explained project outweighs a vague short stint.",
        },
        {
          q: "Should I include GitHub?",
          a: "Yes, if your profile has organised work with READMEs. A GitHub or portfolio link lets interviewers see your real code.",
        },
        {
          q: "How long should a developer resume be?",
          a: "One page for up to ~5–7 years of experience. The builder fits everything to one page automatically.",
        },
        {
          q: "Are skill bars or percentages a good idea?",
          a: "No — they are unstandardised and ATS cannot read them. Show proficiency through context instead: years used, or projects built with that technology.",
        },
      ],
      ctaTitle: "Build your developer resume",
      ctaBody: "Templates with grouped Skills and a Projects section — free.",
    },
  },

  // ────────────────────────────────────────────────────────────────────────
  {
    slug: "resume-for-fresh-graduate",
    breadcrumb: { th: "Resume เด็กจบใหม่", en: "Fresh Graduate Resume" },
    related: ["resume-builder", "ai-resume-builder", "resume-for-software-developer"],
    readMore: ["how-to-write-resume", "ats-resume-guide"],
    th: {
      title: "Resume สำหรับเด็กจบใหม่ ไม่มีประสบการณ์ — สร้างฟรี | RMUTL Resume",
      description:
        "วิธีเขียนเรซูเม่สำหรับนักศึกษาจบใหม่และคนไม่มีประสบการณ์ทำงาน — ใช้โปรเจกต์ การฝึกงาน กิจกรรม และทักษะให้เป็นจุดแข็ง พร้อมสร้างออนไลน์ฟรี",
      h1: "Resume สำหรับเด็กจบใหม่ — เขียนยังไงเมื่อยังไม่มีประสบการณ์",
      intro:
        "ไม่มีประสบการณ์ทำงานประจำไม่ได้แปลว่าไม่มีอะไรจะเขียน นักศึกษาจบใหม่มีโปรเจกต์ การฝึกงาน กิจกรรม และผลการเรียนที่ HR ให้ความสำคัญ หน้านี้จะช่วยจัดลำดับสิ่งเหล่านั้นให้เป็นเรซูเม่ที่แข่งขันได้",
      sections: [
        {
          heading: "จัดลำดับหัวข้อใหม่ให้เหมาะกับคนจบใหม่",
          body: [
            "วาง Education ไว้บน ตามด้วย Projects หรือ Internship แล้วค่อย Skills ส่วน Experience ที่ยังน้อยให้อยู่ท้าย ระบบให้คุณลากจัดลำดับหัวข้อได้อิสระ",
          ],
        },
        {
          heading: "ใช้โปรเจกต์และงานฝึกงานเป็นจุดขาย",
          body: [
            "โปรเจกต์จบ งานวิชา หรือการฝึกงาน เขียนแบบเดียวกับประสบการณ์ทำงาน: ทำอะไร ใช้อะไร ได้ผลลัพธ์อะไร เช่น 'ฝึกงานฝ่ายการตลาด 2 เดือน — จัดทำรายงานยอดขายรายสัปดาห์และช่วยทีมวางแผนคอนเทนต์'",
          ],
        },
        {
          heading: "กิจกรรมและบทบาทที่แสดง soft skills",
          body: [
            "การเป็นหัวหน้าโครงการค่าย เหรัญญิกชมรม หรืออาสาสมัคร บอกถึงความรับผิดชอบและการทำงานเป็นทีม ใส่ได้ถ้าเกี่ยวข้องกับตำแหน่งที่สมัคร แต่อย่าใส่ทุกอย่างจนล้น",
          ],
        },
        {
          heading: "เขียน Summary สั้น ๆ ที่ตรงเป้า",
          body: [
            "2–3 บรรทัดบอกว่าคุณเรียนจบสาขาอะไร สนใจงานด้านไหน และมีจุดแข็งอะไร ปรับให้ตรงกับตำแหน่งที่สมัครแต่ละที่ ใช้ AI ช่วยยกร่างได้",
          ],
        },
      ],
      faq: [
        {
          q: "GPA ต่ำ ควรใส่ไหม",
          a: "ถ้าต่ำกว่า 3.00 อาจเลือกไม่ใส่และเน้นโปรเจกต์กับทักษะแทน แต่บางองค์กรขอ GPA ในใบสมัครอยู่แล้ว ให้ดูตามประกาศงาน",
        },
        {
          q: "ไม่เคยฝึกงานเลย ทำยังไง",
          a: "ใช้โปรเจกต์ในห้องเรียน งานกลุ่ม งานอดิเรกที่จับต้องได้ หรือคอร์สออนไลน์ที่มีผลงานส่ง สิ่งเหล่านี้แสดงทักษะได้จริง",
        },
        {
          q: "เรซูเม่เด็กจบใหม่ควรยาวแค่ไหน",
          a: "1 หน้าเสมอ ระบบจัดให้พอดีอัตโนมัติ เนื้อหาที่กระชับและคัดมาแล้วดูดีกว่าการยัดให้เต็มหน้า",
        },
        {
          q: "ควรทำเรซูเม่ภาษาไทยหรืออังกฤษ",
          a: "ทำตามภาษาของประกาศงาน ถ้าไม่ระบุและเป็นบริษัทไทย ภาษาไทยก็เพียงพอ ระบบสร้างได้ทั้งสองภาษาและสลับได้",
        },
      ],
      ctaTitle: "สร้าง Resume เด็กจบใหม่ของคุณ",
      ctaBody: "เทมเพลตที่จัดลำดับ Education และ Projects มาให้ — ฟรี",
    },
    en: {
      title: "Fresh Graduate Resume with No Experience — Free Builder | RMUTL Resume",
      description:
        "How to write a resume as a new graduate with no work experience — turn projects, internships, activities and skills into strengths. Build one online for free.",
      h1: "Fresh Graduate Resume — What to Write With No Experience",
      intro:
        "No full-time experience doesn't mean nothing to write. New graduates have projects, internships, activities and academic results that recruiters value. This page helps you order them into a competitive resume.",
      sections: [
        {
          heading: "Reorder sections for a new graduate",
          body: [
            "Put Education first, then Projects or Internship, then Skills, with limited Experience last. The builder lets you drag sections into any order.",
          ],
        },
        {
          heading: "Use projects and internships as your selling point",
          body: [
            "Write a final-year project, course work or internship like work experience: what you did, what you used, what came out of it — 'Marketing internship, 2 months — produced weekly sales reports and supported content planning.'",
          ],
        },
        {
          heading: "Activities that show soft skills",
          body: [
            "Leading a camp project, being a club treasurer, or volunteering shows responsibility and teamwork. Include them if relevant to the role, but don't list everything until it overflows.",
          ],
        },
        {
          heading: "Write a short, targeted summary",
          body: [
            "2–3 lines on what you studied, the kind of work you want, and your strengths — adjusted for each application. The AI assistant can help draft it.",
          ],
        },
      ],
      faq: [
        {
          q: "Low GPA — should I include it?",
          a: "Below ~3.00 you may leave it off and lead with projects and skills instead — but some employers require GPA on the application anyway, so follow the posting.",
        },
        {
          q: "I've never had an internship. What now?",
          a: "Use classroom projects, group work, tangible side projects, or online courses with submitted work. These demonstrate real skills.",
        },
        {
          q: "How long should a new-grad resume be?",
          a: "Always one page — fitted automatically. Concise, curated content reads better than a page padded to the edges.",
        },
        {
          q: "Thai or English resume?",
          a: "Match the posting's language. If unspecified and it's a Thai company, Thai is fine. The builder does both and switches between them.",
        },
      ],
      ctaTitle: "Build your fresh-graduate resume",
      ctaBody: "Templates that order Education and Projects for you — free.",
    },
  },
];

export const LANDING_SLUGS = LANDING_PAGES.map((p) => p.slug);

export function getLandingPage(slug: string): LandingPage | undefined {
  return LANDING_PAGES.find((p) => p.slug === slug);
}
