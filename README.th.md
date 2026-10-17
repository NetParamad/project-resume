[English](README.md) | [ไทย](README.th.md)

<h1 align="center">Resume Builder</h1>

<p align="center">
  ตัวสร้างเรซูเม่และ CV ออนไลน์ฟรี ขับเคลื่อนด้วย AI (AIRB)
</p>

<p align="center">
  <a href="https://rmutl-resume.vercel.app"><strong>rmutl-resume.vercel.app</strong></a>
</p>

<p align="center">
  <a href="#ภาพรวม">ภาพรวม</a> ·
  <a href="#ฟีเจอร์">ฟีเจอร์</a> ·
  <a href="#เทคโนโลยีที่ใช้">เทคโนโลยี</a> ·
  <a href="#โครงสร้างโปรเจกต์">โครงสร้าง</a> ·
  <a href="#การตั้งค่า-supabase">Supabase</a> ·
  <a href="#เริ่มต้นใช้งาน">เริ่มต้นใช้งาน</a> ·
  <a href="#ตัวแปรสภาพแวดล้อม">ตัวแปรสภาพแวดล้อม</a> ·
  <a href="#วิธีใช้งาน">วิธีใช้งาน</a> ·
  <a href="#หมายเหตุ">หมายเหตุ</a>
</p>

---

## ภาพรวม

Resume Builder เป็นเว็บแอปสำหรับเขียน จัดรูปแบบ และส่งออกเรซูเม่หรือ CV สายวิชาการ ตัวแอปจับคู่ฟอร์มแก้ไขแบบเรียลไทม์เข้ากับตัวอย่างหน้ากระดาษ A4 แบบเห็นทันที แก้ไขตรงไหนก็เห็นผลข้าง ๆ ทันที ข้อมูลเรซูเม่ถูกเก็บใน Supabase ผูกกับบัญชีผู้ใช้ เผยแพร่ผ่านลิงก์สาธารณะที่ระบุด้วย slug ได้ และส่งออกเป็น PDF หน้าเดียวได้จากในเบราว์เซอร์โดยตรง

มีชั้น AI เสริมแบบเลือกใช้ ช่วยปรับสำนวน ปรับเนื้อหาให้ตรงกับประกาศงาน ให้คะแนนเรซูเม่เทียบกับระบบคัดกรองผู้สมัคร (ATS) และเติมฟอร์มอัตโนมัติจากไฟล์ PDF ที่อัปโหลด หน้าจอแปลครบทั้ง **ภาษาอังกฤษและภาษาไทย** ส่วน *เนื้อหา* ของเรซูเม่มีตัวตั้งภาษาของตัวเองแยกต่างหาก

> นี่เป็นโปรเจกต์อิสระ ไม่ใช่บริการอย่างเป็นทางการของมหาวิทยาลัยใด

## ฟีเจอร์

- **แก้ไขแบบเรียลไทม์พร้อมตัวอย่างสด** — แก้ไขแล้วเห็นผลทันทีในแผงตัวอย่าง A4 ข้างฟอร์ม
- **เทมเพลต 7 แบบ** — เลย์เอาต์เรซูเม่ 4 แบบ (Modern, Classic, Minimal, Creative) และเลย์เอาต์ CV สายวิชาการ 3 แบบ (Academic, Comprehensive, Compact) ปรับสีเน้น (accent color) ได้ทุกแบบ
- **สองประเภทเอกสาร** — เรซูเม่ หรือ CV (`documentType`) ใช้ตัวสร้างตัวเดียวกัน โดย CV จะปลดล็อกเทมเพลตสายวิชาการ
- **เครื่องตรวจคะแนน ATS** — ให้คะแนนเรซูเม่เทียบกับระบบคัดกรองผู้สมัคร และเสนอคีย์เวิร์ดที่ขาด โดยรับคำอธิบายงานเป็นอินพุต
- **ผู้ช่วยเขียนด้วย AI** — ปรับปรุง เขียนใหม่ ขัดเกลา แก้ไวยากรณ์ และปรับเนื้อหาให้ตรงกับงานที่สมัคร (`app/api/ai/*`)
- **เอเจนต์ปรับเรซูเม่ด้วย AI** — ตัวปรับปรุงแบบวนซ้ำที่แก้ทีละส่วน ให้คะแนนใหม่ และสรุปการเปลี่ยนแปลงหลายรอบ พร้อมบันทึกสดและมุมมองเทียบความต่างเพื่อนำไปใช้หรือทิ้ง
- **นำเข้าและเติมฟอร์มอัตโนมัติ** — อัปโหลดเรซูเม่เดิม (PDF) ระบบดึงข้อความในเบราว์เซอร์แล้วจับคู่เข้าฟอร์ม
- **ไทยและอังกฤษ** — หน้าจอแปลครบด้วย `next-intl` และเนื้อหาเรซูเม่มีตัวตั้งภาษาแยก (`en` / `th` / ตรวจจับอัตโนมัติ) ที่ควบคุมการจัดการฟอนต์ไทย
- **ส่งออก PDF** — ส่งออกผ่านการพิมพ์ รับประกันว่าออกมาเป็นกระดาษ A4 หน้าเดียว (ดู [ADR‑0001](docs/adr/0001-pdf-fit-one-page.md))
- **ลิงก์แชร์** — เผยแพร่เรซูเม่ที่ URL สาธารณะซึ่งระบุด้วย slug ผ่าน RPC แบบ security-definer (ดู [ADR‑0002](docs/adr/0002-public-share-rpc.md))
- **เก็บบนคลาวด์และประวัติเวอร์ชัน** — เรซูเม่ถูกบันทึกใน Supabase เปิดดูได้จากทุกอุปกรณ์ และมีตาราง `resume_versions` เก็บเวอร์ชัน
- **แดชบอร์ด** — ดูรายการ เปลี่ยนชื่อ ทำสำเนา และลบเรซูเม่/CV
- **ระบบยืนยันตัวตน** — สมัคร/เข้าสู่ระบบด้วยอีเมลและรหัสผ่าน ลืม/ตั้งรหัสผ่านใหม่ และ callback ของ OAuth ผ่าน Supabase Auth
- **ฐานความรูและคู่มือ** — บทความและหน้าสอนใช้งานแบบแปลหลายภาษาที่ `/knowledge`
- **โครงสร้าง SEO** — sitemap, robots, web manifest, รูป Open Graph, canonical URL และ hreflang

## เทคโนโลยีที่ใช้

| ด้าน | ที่เลือกใช้ |
| --- | --- |
| เฟรมเวิร์ก | [Next.js 16](https://nextjs.org) (App Router, Turbopack) · React 19 · TypeScript |
| การจัดสไตล์ | Tailwind CSS v3 · [shadcn/ui](https://ui.shadcn.com) (`components/ui/`) |
| State | Zustand stores (`lib/store/`) |
| i18n | [next-intl](https://next-intl.dev) — ภาษา `en` / `th` (ค่าเริ่มต้น `en`) ดู `i18n/routing.ts` |
| Auth และ DB | [Supabase](https://supabase.com) (Postgres + Auth ผ่านคุกกี้ `@supabase/ssr`) |
| AI | [NVIDIA API](https://build.nvidia.com) (เข้ากันได้กับ OpenAI) ผ่าน SDK `openai` — โมเดลอยู่ใน `lib/ai/models.ts`; มี Gemini เป็นตัวสำรองเสริม |
| นำเข้า PDF | [`pdfjs-dist`](https://mozilla.github.io/pdf.js/) — ดึงข้อความในเบราว์เซอร์ |
| รูปภาพ | [ImageKit](https://imagekit.io) — อัปโหลดและแปลงรูปโปรไฟล์ |
| ตรวจสอบข้อมูล | [zod](https://zod.dev) — สคีมาคำขอใน `lib/validation/` |
| การทดสอบ | [Vitest](https://vitest.dev) + Testing Library |
| โฮสติ้ง | [Vercel](https://vercel.com) (เซิร์ฟเวอร์เลส ดู [ADR‑0004](docs/adr/0004-vercel-deployment.md)) |

## โครงสร้างโปรเจกต์

```
app/
  [locale]/            หน้าต่าง ๆ ที่แยกตามภาษา
    page.tsx           หน้าแรก
    [slug]/            หน้า SEO แบบ landing page
    auth/              ขั้นตอน login · sign-up · ลืม/ตั้งรหัสผ่านใหม่
    dashboard/         รายการเรซูเม่ สร้าง/เปลี่ยนชื่อ/ทำสำเนา/ลบ
    builder/[id]/      ตัวแก้ไข + ตัวอย่างสด
    knowledge/         คู่มือและบทความแปลหลายภาษา
    share/[slug]/      หน้ามุมมองเรซูเม่ที่แชร์สาธารณะ
  api/
    resumes/           CRUD เรซูเม่ของผู้ใช้ที่เข้าสู่ระบบ
    ai/                improve · polish · ats-score · auto-fill · extract-resume
    upload/auth/       เซ็นลายเซ็นอัปโหลด ImageKit
  auth/                callback ของ confirm · oauth
  layout.tsx global-error.tsx not-found.tsx
  globals.css sitemap.ts robots.ts manifest.ts opengraph-image.tsx
components/
  ui/                  คอมโพเนนต์พื้นฐาน shadcn/ui
  builder/             ฟอร์มแก้ไข + แผงตัวอย่าง (sections/ เก็บฟอร์มแต่ละส่วน)
  preview/             ตัวอย่าง A4 · PrintResumePortal · templates/ (เรซูเม่ 4 + cv/ 3)
  ai/                  ไดอะลอก AI (ATS, polish, import, เอเจนต์ปรับปรุง)
  dashboard/ home/ marketing/ share/ auth/ seo/
lib/
  ai/                  ไคลเอนต์ NVIDIA, สายและบทบาทของโมเดล, prompt, ตัวปรับ ATS
  supabase/            ตัวช่วยฝั่ง client และ server
  types/resume.ts      รูปร่างข้อมูลเรซูเม่ (แหล่งอ้างอิงหลัก)
  store/               Zustand stores (เนื้อหาเรซูเม่, ซูมตัวอย่าง, โมเดล/ภาษา AI, toast)
  content/             บทความฐานความรู้และเนื้อหา landing page
  pdf/                 ดึงข้อความ PDF ในเบราว์เซอร์
  validation/          สคีมาคำขอ zod + เทสต์ที่วางข้างกัน
  seo.ts site-url.ts   ตัวช่วย metadata / JSON-LD
  print-utils.ts       การย่อพอดีหนึ่งหน้า PDF
i18n/                  การตั้งค่า routing, request และ navigation ของ next-intl
messages/              en.json · th.json  (ข้อความที่ผู้ใช้เห็นทั้งหมด ต้องมีทั้งสองไฟล์)
supabase/migrations/   SQL ดิบ ที่ต้องรันเองด้วยมือ
proxy.ts               มิดเดิลแวร์: i18n routing + รีเฟรชเซสชัน Supabase
docs/adr/              บันทึกการตัดสินใจเชิงสถาปัตยกรรม (ADR)
docs/agents/           ธรรมเนียมเรื่อง issue tracker, ป้าย triage และโดเมน
```

alias เส้นทาง `@/*` ชี้ไปที่รากของโปรเจกต์ (ดู `tsconfig.json`)

## การตั้งค่า Supabase

1. สร้างโปรเจกต์ที่ [database.new](https://database.new)
2. รันไฟล์ SQL ใน [`supabase/migrations/`](supabase/migrations/) **ตามลำดับ** กับโปรเจกต์ (ผ่าน SQL editor หรือ `psql`) ไฟล์ migration เป็น SQL ดิบที่ตั้งเลขกำกับและต้องรัน **ด้วยมือ** — ไม่มีเครื่องมือ migration ต่อไว้ และเขียนให้รันซ้ำได้อย่างปลอดภัย (idempotent)
3. คัดลอก Project URL และ publishable key (หรือ anon key แบบเดิม) จาก **Project settings → API** ไปใส่ใน `.env.local`

migration จะสร้าง:

| ออบเจกต์ | หน้าที่ |
| --- | --- |
| `resumes` | หนึ่งแถวต่อเรซูเม่/CV หนึ่งชุด: `title`, `template`, `data` (JSONB), `document_type`, `is_public`, `share_slug`, `version` และ timestamp |
| `resume_versions` | แถวประวัติเวอร์ชันที่ผูกกับเรซูเม่ |
| `rate_limits` | ตัวนับที่รองรับตัวจำกัดอัตราแบบกระจาย (เสริม) |
| `get_public_resume(p_slug)` | RPC แบบ security-definer — ช่องทางอ่านสาธารณะเพียงทางเดียวสำหรับเรซูเม่ที่แชร์ (ADR‑0002) |
| `rate_limit_bump(...)` | RPC แบบ security-definer ที่ตัวจำกัดอัตราแบบใช้ร่วมเรียกเมื่อมีอยู่ |

เปิดใช้ Row Level Security บนตาราง `resumes` และ `resume_versions` เจ้าของมีสิทธิ์ CRUD เต็มบนแถวของตัวเอง ส่วนการอ่านสาธารณะต้องผ่าน `get_public_resume` เท่านั้น

## เริ่มต้นใช้งาน

ความต้องการ: **Node.js 22+**, [โปรเจกต์ Supabase](https://database.new) และ (สำหรับฟีเจอร์ AI) NVIDIA API key กับบัญชี ImageKit

```bash
git clone https://github.com/NetParamad/project-resume.git
cd project-resume
npm install
cp .env.example .env.local   # แล้วเติมค่าด้านล่าง
npm run dev                  # http://localhost:3000
```

รันสคีมาฐานข้อมูลก่อน (ดู [การตั้งค่า Supabase](#การตั้งค่า-supabase)) ค่าประกอบ Supabase และ AI ถูกอ่านตอน **request เท่านั้น** แอปจึงบิลด์ได้แม้ไม่มีค่าเหล่านี้ (CI ใช้ค่าหลอก)

### คำสั่งสคริปต์

| คำสั่ง | คำอธิบาย |
| --- | --- |
| `npm run dev` | เปิด dev server ที่ `http://localhost:3000` |
| `npm run build` | บิลด์สำหรับโปรดักชัน |
| `npm run start` | เสิร์ฟบิลด์โปรดักชัน |
| `npm run lint` | ESLint (พื้นฐาน: มีคำเตือน `<img>` 8 จุด ไม่มี error) |
| `npm run typecheck` | `tsc --noEmit` |
| `npm test` | ยูนิตเทสต์ด้วย Vitest (ไฟล์ `*.test.ts` ที่วางข้างโค้ด) |
| `npm run prepare` | ติดตั้ง git hook ของ Husky (รันตอน `npm install`) |

การตรวจสอบก่อนแก้ไขทุกครั้ง = **`tsc --noEmit` + `lint` + `test` + `build`** โดย GitHub Actions ([`.github/workflows/ci.yml`](.github/workflows/ci.yml)) รันทั้งสี่คำสั่งทุกครั้งที่ push และ PR ด้วยค่าตัวแปรสภาพแวดล้อมหลอก

## ตัวแปรสภาพแวดล้อม

คัดลอก `.env.example` เป็น `.env.local` แล้วตั้งค่า (ระบุเฉพาะชื่อ — ห้ามคอมมิตค่าจริง):

| ตัวแปร | จำเป็น | หมายเหตุ |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ | จากหน้าตั้งค่า API ของโปรเจกต์ Supabase |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | ✅ | คีย์ *publishable* ของ Supabase (หรือ *anon* แบบเดิม) |
| `NVIDIA_API_KEY` | สำหรับ AI | ใช้โดยทุกเส้นทาง `app/api/ai/*` |
| `GEMINI_API_KEY` | เสริม | AI ตัวสำรองแบบเสียเงิน ใช้เป็นทางเลือกสุดท้าย; แอปทำงานได้แม้ไม่มี |
| `IMAGEKIT_PRIVATE_KEY` | สำหรับอัปโหลด | เซ็นลายเซ็นฝั่งเซิร์ฟเวอร์สำหรับอัปโหลดรูปโปรไฟล์ |
| `NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY` | สำหรับอัปโหลด | |
| `NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT` | สำหรับอัปโหลด | เช่น `https://ik.imagekit.io/your_id` |
| `NEXT_PUBLIC_SITE_URL` | โปรดักชัน | origin หลักสำหรับ metadata / sitemap / hreflang บน Vercel จะถอยไปใช้ URL ของดีพลอยเมนต์ — ควรตั้งเป็นโดเมนจริง |
| `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` | เสริม | ค่า `content` ของแท็ก meta จาก Search Console |

## วิธีใช้งาน

1. **สมัคร / เข้าสู่ระบบ** — สร้างบัญชีหรือยืนยันตัวตนผ่านขั้นตอนที่ต่อกับ Supabase
2. **สร้างเอกสาร** — เริ่มเรซูเม่หรือ CV ใหม่จากแดชบอร์ด
3. **แก้ไข** — กรอกแต่ละส่วน (ข้อมูลส่วนตัว, สรุป, ประสบการณ์ทำงาน, การศึกษา, ทักษะ, โปรเจกต์, ใบรับรอง, ภาษา และส่วนสายวิชาการอย่างผลงานตีพิมพ์ งานวิจัย การสอน รางวัล และผู้อ้างอิง) ในแผงฟอร์ม โดยตัวอย่าง A4 อัปเดตสด
4. **จัดสไตล์** — เลือกเทมเพลตและสีเน้น สลับภาษาของเนื้อหาเรซูเม่ระหว่างไทยกับอังกฤษ (หรือตรวจจับอัตโนมัติ)
5. **ใช้ AI** — เรียกผู้ช่วย AI เพื่อปรับปรุงหรือขัดเกลาสำนวน ปรับเนื้อหาให้ตรงกับคำอธิบายงาน ขอคะแนน ATS พร้อมคีย์เวิร์ดที่ขาด รันเอเจนต์ปรับปรุงแบบวนซ้ำ หรือนำเข้า PDF เดิมเพื่อเติมฟอร์มอัตโนมัติ
6. **ส่งออก** — ดาวน์โหลด PDF หน้าเดียวผ่านการพิมพ์
7. **แชร์** — เผยแพร่เรซูเม่แล้วคัดลอกลิงก์สาธารณะที่ระบุด้วย slug

## หมายเหตุ

- **การตรวจสอบและธรรมเนียม** — ดูรายการเต็มใน [`AGENTS.md`](AGENTS.md) ข้อความที่ผู้ใช้เห็นทุกจุดต้องผ่าน `next-intl` และต้องมีครบใน **ทั้ง** `messages/en.json` และ `messages/th.json` ควรใช้ `components/ui/*` (shadcn/ui) มากกว่ามาร์กอัปเขียนเอง และรูปร่างข้อมูลเรซูเม่นิยามที่เดียวใน `lib/types/resume.ts`
- **การยืนยันตัวตน** — ทุกเส้นทาง API ต้องยืนยันตัวตนกับ Supabase (`getUser()` → 401)
- **การจำกัดอัตรา** — ปลายทาง AI และ CRUD ถูกจำกัดอัตราต่อผู้ใช้ ตัวจำกัดในหน่วยความจำ (`lib/rate-limit.ts`) นับแยกตามอินสแตนซ์เซิร์ฟเวอร์เลส ส่วน RPC `rate_limit_bump` ให้ที่เก็บแบบกระจายเป็นตัวเลือก
- **ส่งออก PDF** — ใช้การพิมพ์ โดยย่อขนาดด้วย `zoom` และปรับแบบวนซ้ำเพื่อให้เนื้อหายาวพอดีหนึ่งหน้า A4 (ดู ADR‑0001)
- **การดีพลอย** — ดีพลอยบน Vercel ตั้งตัวแปรสภาพแวดล้อมด้านบน ชี้ `NEXT_PUBLIC_SITE_URL` ไปที่โดเมนโปรดักชัน และรัน SQL ใน `supabase/migrations/` กับฐานข้อมูลโปรดักชัน
- **การตัดสินใจเชิงสถาปัตยกรรม** — บันทึกไว้ใน [`docs/adr/`](docs/adr/): PDF พอดีหนึ่งหน้า (0001), RPC แชร์สาธารณะ (0002), ขอบเขตอินพุต (0003), ดีพลอยบน Vercel (0004)
- **สัญญาอนุญาต** — ปัจจุบันยังไม่มีไฟล์ license สงวนลิขสิทธิ์ทั้งหมดโดยผู้จัดทำ
