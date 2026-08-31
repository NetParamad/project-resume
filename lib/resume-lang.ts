import { hasThaiInResume } from "./utils";

export type ResumeLang = "en" | "th";

export const resumeLangDict = {
  experience: { en: "Experience", th: "ประสบการณ์การทำงาน" },
  professionalExperience: { en: "Professional Experience", th: "ประสบการณ์การทำงาน" },
  summary: { en: "Professional Summary", th: "สรุปอาชีพ" },
  education: { en: "Education", th: "การศึกษา" },
  skills: { en: "Skills", th: "ทักษะ" },
  certifications: { en: "Certifications", th: "ประกาศนียบัตร" },
  projects: { en: "Projects", th: "โครงการ" },
  languages: { en: "Languages", th: "ภาษา" },
  publications: { en: "Publications", th: "ผลงานตีพิมพ์" },
  researchExperience: { en: "Research Experience", th: "ประสบการณ์วิจัย" },
  research: { en: "Research", th: "งานวิจัย" },
  teachingExperience: { en: "Teaching Experience", th: "ประสบการณ์การสอน" },
  awards: { en: "Awards & Honors", th: "รางวัลและเกียรติยศ" },
  present: { en: "Present", th: "ปัจจุบัน" },
  view: { en: "View", th: "ดู" },
  link: { en: "Link", th: "ลิงก์" },
  yourName: { en: "Your Name", th: "ชื่อของคุณ" },
  gpa: { en: "GPA", th: "เกรดเฉลี่ย" },
  supervisor: { en: "Supervisor", th: "อาจารย์ที่ปรึกษา" },
  doi: { en: "DOI", th: "DOI" },
  pages: { en: "pp.", th: "น." },
  morePublications: { en: "more publications", th: "ผลงานตีพิมพ์เพิ่มเติม" },
  native: { en: "Native", th: "เจ้าของภาษา" },
  fluent: { en: "Fluent", th: "คล่องแคล่ว" },
  advanced: { en: "Advanced", th: "ขั้นสูง" },
  intermediate: { en: "Intermediate", th: "ปานกลาง" },
  basic: { en: "Basic", th: "พื้นฐาน" },
  beginner: { en: "Beginner", th: "เริ่มต้น" },
  expert: { en: "Expert", th: "เชี่ยวชาญ" },
} as const;

export type ResumeLangKey = keyof typeof resumeLangDict;

export function createResumeLang(data: unknown, override?: ResumeLang | null) {
  const isThai = override ? override === "th" : hasThaiInResume(data);
  return (key: ResumeLangKey): string => resumeLangDict[key]?.[isThai ? "th" : "en"] ?? String(key);
}
