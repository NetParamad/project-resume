interface ParsedResume {
  personalInfo: {
    fullName: string;
    email: string;
    phone: string;
    location: string;
    linkedin: string;
    portfolio: string;
    occupation: string;
  };
  summary: string;
  experience: Array<{
    jobTitle: string;
    company: string;
    location: string;
    startDate: string;
    endDate: string;
    current: boolean;
    description: string;
  }>;
  education: Array<{
    degree: string;
    institution: string;
    field: string;
    startDate: string;
    endDate: string;
    gpa: string;
  }>;
  skills: Array<{ name: string; level: string }>;
  certifications: Array<{ name: string; issuer: string; date: string }>;
  projects: Array<{ name: string; url: string; description: string }>;
  languages: Array<{ name: string; proficiency: string }>;
  references: Array<{ name: string; title: string; company: string; email: string; phone: string }>;
}

const SECTION_HEADERS = [
  "professional summary",
  "summary",
  "profile",
  "work experience",
  "experience",
  "employment",
  "education",
  "academic background",
  "skills",
  "technical skills",
  "core competencies",
  "certifications",
  "licenses",
  "projects",
  "personal projects",
  "languages",
  "references",
  "publications",
  "research experience",
  "teaching experience",
  "awards",
  "honors",
  "leadership",
];

const THAI_SECTION_HEADERS: Record<string, string> = {
  "ประวัติส่วนตัว": "header",
  "ข้อมูลส่วนตัว": "header",
  "ข้อมูลติดต่อ": "header",
  "ประวัติโดยย่อ": "summary",
  "สรุปประวัติ": "summary",
  "สรุป": "summary",
  "โปรไฟล์": "summary",
  "ประสบการณ์การทำงาน": "experience",
  "ประสบการณ์ทำงาน": "experience",
  "ประวัติการทำงาน": "experience",
  "ประสบการณ์": "experience",
  "ประวัติการศึกษา": "education",
  "การศึกษา": "education",
  "ทักษะความสามารถ": "skills",
  "ทักษะทางเทคนิค": "skills",
  "ทักษะด้านเทคนิค": "skills",
  "ทักษะพิเศษ": "skills",
  "ความสามารถ": "skills",
  "ทักษะ": "skills",
  "ใบรับรอง": "certifications",
  "ประกาศนียบัตร": "certifications",
  "ใบอนุญาต": "certifications",
  "การรับรอง": "certifications",
  "โครงการ": "projects",
  "โปรเจกต์": "projects",
  "ผลงาน": "projects",
  "ภาษา": "languages",
  "ข้อมูลอ้างอิง": "references",
  "ผู้ให้การอ้างอิง": "references",
  "อ้างอิง": "references",
  "งานวิจัย": "experience",
  "ประสบการณ์วิจัย": "experience",
  "ประสบการณ์สอน": "experience",
  "รางวัล": "certifications",
  "เกียรติประวัติ": "certifications",
  "เกียรติคุณ": "certifications",
  "กิจกรรม": "projects",
  "สิ่งพิมพ์": "projects",
};

const DATE_RANGE_PATTERN = /([a-zก-์.]+\.?\s*\d{2,4})\s*(?:[–—-]|\bto\b|ถึง)\s*([a-zก-์.]+\.?\s*\d{2,4}|ปัจจุบัน|present|current|now)/i;
const YEAR_RANGE_PATTERN = /(\d{4})\s*(?:[–—-]|\bto\b|ถึง)\s*(\d{2,4}|[a-zก-์.]+\.?\s*\d{2,4}|ปัจจุบัน|present|current|now)/i;

const EMAIL_RE = /[a-z0-9._%+\-]+@[a-z0-9.\-]+\.[a-z]{2,}/gi;
const PHONE_RE = /(?:\+?\d{1,3}[-.\s]?)?\(?\d{2,4}\)?[-.\s]?\d{3,4}[-.\s]?\d{3,4}/g;
const URL_RE = /(?:https?:\/\/)?(?:www\.)?[-a-z0-9@:%._\+~#=]{1,256}\.[a-z]{2,6}\b(?:[-a-z0-9@:%_\+.~#?&//=]*)/gi;

function cleanLine(line: string): string {
  return line.replace(/[\u0000-\u001f]/g, "").trim();
}

function normalizeHeaderText(s: string): string {
  return s.toLowerCase().replace(/[^a-zก-์\s]/g, "").trim();
}

function toSectionName(line: string): string | null {
  const parts = line.split(/[|/·•–—-]/);
  for (const part of parts) {
    const p = normalizeHeaderText(part);
    if (!p) continue;
    const th = THAI_SECTION_HEADERS[p];
    if (th) return th;
    if (SECTION_HEADERS.includes(p)) return p;
  }

  const lower = normalizeHeaderText(line);
  if (!lower) return null;

  for (const th of Object.keys(THAI_SECTION_HEADERS)) {
    if (lower === th || (lower.startsWith(th) && lower.length <= th.length + 15)) {
      return THAI_SECTION_HEADERS[th];
    }
  }

  for (const h of SECTION_HEADERS) {
    if (
      lower === h ||
      (lower.startsWith(h) && lower.length <= h.length + 15) ||
      (lower.endsWith(h) && lower.length <= h.length + 15)
    ) {
      return lower;
    }
  }
  return null;
}

function extractDateRange(text: string): { startDate: string; endDate: string; current: boolean; index: number } | null {
  const m = text.match(DATE_RANGE_PATTERN) ?? text.match(YEAR_RANGE_PATTERN);
  if (m) {
    const endRaw = m[2].toLowerCase();
    const current = endRaw === "present" || endRaw === "current" || endRaw === "now" || endRaw === "ปัจจุบัน";
    return { startDate: m[1], endDate: current ? "" : m[2], current, index: m.index ?? 0 };
  }
  return null;
}

function splitIntoSectionBlocks(lines: string[]): Array<{ name: string; lines: string[] }> {
  const sections: Array<{ name: string; lines: string[] }> = [];
  let currentName = "header";
  let currentLines: string[] = [];

  for (const raw of lines) {
    const line = cleanLine(raw);
    if (!line) continue;

    const name = toSectionName(line);
    if (name) {
      if (currentLines.length > 0) {
        sections.push({ name: currentName, lines: currentLines });
      }
      currentName = name;
      currentLines = [];
    } else {
      currentLines.push(line);
    }
  }
  if (currentLines.length > 0) {
    sections.push({ name: currentName, lines: currentLines });
  }
  return sections;
}

function parseHeaderLines(lines: string[]): ParsedResume["personalInfo"] {
  const result: ParsedResume["personalInfo"] = {
    fullName: lines[0] || "",
    email: "",
    phone: "",
    location: "",
    linkedin: "",
    portfolio: "",
    occupation: lines[1] || "",
  };

  for (const line of lines) {
    const emails = line.match(EMAIL_RE);
    if (emails) result.email = emails[0];

    const phones = line.match(PHONE_RE);
    if (phones) result.phone = phones[0];

    const urls = line.match(URL_RE);
    if (urls) {
      for (const u of urls) {
        if (u.includes("linkedin")) result.linkedin = u;
        else if (!result.email?.includes(u)) result.portfolio = u;
      }
    }
  }

  const contactLine = lines.slice(1).join(" ");
  const parts = contactLine.split(/[|•·–-]/).map((s) => s.trim()).filter(Boolean);
  for (const p of parts) {
    if (!result.email && p.match(EMAIL_RE)) result.email = p.match(EMAIL_RE)![0];
    else if (!result.phone && p.match(PHONE_RE)) result.phone = p.match(PHONE_RE)![0];
    else if (!result.location && !p.match(EMAIL_RE) && !p.match(PHONE_RE) && !p.match(URL_RE)) {
      result.location = p;
    }
  }

  return result;
}

function parseSummaryBlock(lines: string[]): string {
  return lines.join(" ").trim();
}

function parseExperienceBlock(lines: string[]): ParsedResume["experience"] {
  const items: ParsedResume["experience"] = [];
  const cleaned = lines.map(cleanLine).filter(Boolean);
  let current: (typeof items)[0] | null = null;
  let bulletBuffer: string[] = [];

  function flushBullets() {
    if (current && bulletBuffer.length > 0) {
      const desc = bulletBuffer
        .map((b) => b.replace(/^[•\-*]\s*/, "").trim())
        .filter(Boolean)
        .join("\n");
      current.description = (current.description + "\n" + desc).trim();
      bulletBuffer = [];
    }
  }

  function flushItem() {
    flushBullets();
    if (current && (current.jobTitle || current.company || current.description)) {
      items.push(current);
    }
    current = null;
  }

  for (let i = 0; i < cleaned.length; i++) {
    const line = cleaned[i];
    if (!line) continue;

    if (line.startsWith("•") || line.startsWith("-") || line.startsWith("*")) {
      bulletBuffer.push(line);
      continue;
    }

    const dateRange = extractDateRange(line);

    if (dateRange) {
      if (current && !current.startDate && (current.jobTitle || current.company)) {
        current.startDate = dateRange.startDate;
        current.endDate = dateRange.endDate;
        current.current = dateRange.current;
        continue;
      }
      flushItem();
      current = { jobTitle: "", company: "", location: "", startDate: dateRange.startDate, endDate: dateRange.endDate, current: dateRange.current, description: "" };

      const beforeDate = line.slice(0, dateRange.index).trim();
      if (beforeDate) {
        const parts = beforeDate.split(/[,|–-]/).map((s) => s.trim()).filter(Boolean);
        if (parts.length === 1) {
          if (parts[0].match(/^[A-Zก-์]/) && !parts[0].includes("@")) {
            current.jobTitle = parts[0];
          } else {
            current.company = parts[0];
          }
        } else if (parts.length >= 2) {
          current.jobTitle = parts[0];
          current.company = parts[1];
        }
      }
      continue;
    }

    const next = cleaned[i + 1];
    const nextIsDate = !!next && !!extractDateRange(next);

    if (current && current.jobTitle && current.startDate) {
      if (nextIsDate) {
        const parts = line.split(/[,|–-]/).map((s) => s.trim()).filter(Boolean);
        flushItem();
        current = {
          jobTitle: parts[0] || line,
          company: parts[1] || "",
          location: "",
          startDate: "",
          endDate: "",
          current: false,
          description: "",
        };
      } else {
        bulletBuffer.push(line);
      }
      continue;
    }

    if (current) {
      if (!current.jobTitle && !current.company) {
        const parts = line.split(/[,|–-]/).map((s) => s.trim()).filter(Boolean);
        if (parts.length >= 2) {
          current.jobTitle = parts[0];
          current.company = parts[1];
          if (parts.length >= 3) current.location = parts[2];
        } else {
          if (line.match(/^[A-Zก-์]/) && !line.includes("@")) {
            current.jobTitle = line;
          } else {
            current.company = line;
          }
        }
      } else if (!current.company && !current.jobTitle?.match(/^[A-Zก-์]/)) {
        current.company = line;
      } else if (!current.jobTitle && current.company) {
        current.jobTitle = line;
      } else {
        bulletBuffer.push(line);
      }
    } else {
      const parts = line.split(/[,|–-]/).map((s) => s.trim()).filter(Boolean);
      current = { jobTitle: parts[0] || "", company: parts[1] || "", location: "", startDate: "", endDate: "", current: false, description: "" };
    }
  }
  flushItem();

  return items;
}

function parseEducationBlock(lines: string[]): ParsedResume["education"] {
  const items: ParsedResume["education"] = [];
  let current: (typeof items)[0] | null = null;

  const degreePatterns = [
    /(bachelor|master|doctor|phd|ph\.d|associate|b\.a|b\.s|m\.a|m\.s|mba|b\.eng|m\.eng|b\.sc|m\.sc)/i,
    /(bachelor['’]?s?\s+(of|in|degree)|master['’]?s?\s+(of|in|degree))/i,
    /(ปริญญาตรี|ปริญญาโท|ปริญญาเอก)/,
  ];

  for (const raw of lines) {
    const line = cleanLine(raw);
    if (!line) continue;

    const dateRange = extractDateRange(line);
    const hasDegree = degreePatterns.some((p) => p.test(line));

    if (hasDegree || dateRange) {
      if (dateRange && !hasDegree && current && !current.startDate && (current.degree || current.institution)) {
        current.startDate = dateRange.startDate;
        current.endDate = dateRange.endDate;
        continue;
      }
      if (current && (current.degree || current.institution)) {
        items.push(current);
      }
      current = { degree: "", institution: "", field: "", startDate: "", endDate: "", gpa: "" };

      if (hasDegree) current.degree = line;
      if (dateRange) {
        current.startDate = dateRange.startDate;
        current.endDate = dateRange.endDate;
      }
    } else if (current) {
      if (!current.institution) {
        current.institution = line;
      } else if (!current.field) {
        current.field = line;
      } else if (!current.gpa && line.match(/gpa|g\.p\.a|grade|score/i)) {
        current.gpa = line.replace(/gpa|g\.p\.a|grade|\:|score/i, "").trim();
      }
    } else {
      current = { degree: line, institution: "", field: "", startDate: "", endDate: "", gpa: "" };
    }
  }
  if (current && (current.degree || current.institution)) {
    items.push(current);
  }
  return items;
}

function parseSkillsBlock(lines: string[]): ParsedResume["skills"] {
  const items: ParsedResume["skills"] = [];

  for (const raw of lines) {
    const line = cleanLine(raw);
    if (!line) continue;

    const names = line
      .replace(/^skills?:?\s*/i, "")
      .split(/[,;•·|/\n]+/)
      .map((s) => s.trim().replace(/^[•\-*]\s*/, ""))
      .filter(Boolean);

    for (const name of names) {
      if (name.length > 1) {
        items.push({ name, level: "intermediate" });
      }
    }
  }
  return items;
}

function parseCertificationsBlock(lines: string[]): ParsedResume["certifications"] {
  const items: ParsedResume["certifications"] = [];
  for (const raw of lines) {
    const line = cleanLine(raw);
    if (!line) continue;
    const parts = line.split(/[,|–-]/).map((s) => s.trim()).filter(Boolean);
    if (parts.length >= 1) {
      items.push({
        name: parts[0],
        issuer: parts[1] || "",
        date: parts[2] || "",
      });
    }
  }
  return items;
}

function parseProjectsBlock(lines: string[]): ParsedResume["projects"] {
  const items: ParsedResume["projects"] = [];
  let current: (typeof items)[0] | null = null;
  let bulletBuffer: string[] = [];

  for (const raw of lines) {
    const line = cleanLine(raw);
    if (!line) continue;

    if (line.startsWith("•") || line.startsWith("-") || line.startsWith("*")) {
      bulletBuffer.push(line);
      continue;
    }

    if (current && current.name && !line.includes("http") && line.match(/^[A-Zก-์]/)) {
      if (bulletBuffer.length > 0) {
        current.description = bulletBuffer.map((b) => b.replace(/^[•\-*]\s*/, "").trim()).filter(Boolean).join("\n");
        bulletBuffer = [];
      }
      items.push(current);
      current = null;
    }

    const urls = line.match(URL_RE);
    const name = urls ? line.replace(urls[0], "").replace(/[|\-–]\s*$/, "").trim() : line;

    if (name || urls) {
      if (current) items.push(current);
      current = { name: name || "Project", url: urls?.[0] || "", description: "" };
    }
  }

  if (bulletBuffer.length > 0 && current) {
    current.description = bulletBuffer.map((b) => b.replace(/^[•\-*]\s*/, "").trim()).filter(Boolean).join("\n");
  }
  if (current && current.name) items.push(current);
  return items;
}

function parseLanguagesBlock(lines: string[]): ParsedResume["languages"] {
  const items: ParsedResume["languages"] = [];
  for (const raw of lines) {
    const line = cleanLine(raw);
    if (!line) continue;
    const entries = line.split(/[,;•·|/\n]+/).map((s) => s.trim()).filter(Boolean);
    for (const entry of entries) {
      const match = entry.match(/^(.+?)\s*[\(\-–]\s*(.+?)\s*\)?$/);
      if (match) {
        items.push({ name: match[1].trim(), proficiency: match[2].trim().toLowerCase() });
      } else {
        items.push({ name: entry.replace(/^[•\-*]\s*/, ""), proficiency: "intermediate" });
      }
    }
  }
  return items;
}

function parseReferencesBlock(lines: string[]): ParsedResume["references"] {
  const items: ParsedResume["references"] = [];
  let current: (typeof items)[0] | null = null;

  for (const raw of lines) {
    const line = cleanLine(raw);
    if (!line) continue;
    if (line.match(/available\s+upon\s+request/i)) {
      items.push({ name: "Available upon request", title: "", company: "", email: "", phone: "" });
      break;
    }

    if (line.match(EMAIL_RE) || line.match(PHONE_RE)) {
      if (!current) current = { name: "", title: "", company: "", email: "", phone: "" };
      const emails = line.match(EMAIL_RE);
      if (emails) current.email = emails[0];
      const phones = line.match(PHONE_RE);
      if (phones) current.phone = phones[0];
      if (current.name && (current.email || current.phone)) {
        items.push(current);
        current = null;
      }
    } else if (!current) {
      current = { name: line, title: "", company: "", email: "", phone: "" };
    } else if (current && !current.title) {
      current.title = line;
    } else if (current && !current.company) {
      current.company = line;
    }
  }
  return items;
}

export function parseResumeText(text: string): ParsedResume {
  const lines = text.split("\n").map(cleanLine).filter(Boolean);
  const sections = splitIntoSectionBlocks(lines);

  const result: ParsedResume = {
    personalInfo: { fullName: "", email: "", phone: "", location: "", linkedin: "", portfolio: "", occupation: "" },
    summary: "",
    experience: [],
    education: [],
    skills: [],
    certifications: [],
    projects: [],
    languages: [],
    references: [],
  };

  for (const section of sections) {
    const name = section.name;

    if (name === "header") {
      result.personalInfo = parseHeaderLines(section.lines);
    } else if (name.match(/^(professional\s+)?(summary|profile)$/)) {
      result.summary = parseSummaryBlock(section.lines);
    } else if (name.match(/^(work\s+)?(experience|employment)$/)) {
      result.experience = parseExperienceBlock(section.lines);
    } else if (name.match(/^(education|academic\s+background)$/)) {
      result.education = parseEducationBlock(section.lines);
    } else if (name.match(/^(skills|technical\s+skills|core\s+competencies)$/)) {
      result.skills = parseSkillsBlock(section.lines);
    } else if (name.match(/^(certifications|licenses?)$/)) {
      result.certifications = parseCertificationsBlock(section.lines);
    } else if (name.match(/^(projects|personal\s+projects)$/)) {
      result.projects = parseProjectsBlock(section.lines);
    } else if (name === "languages") {
      result.languages = parseLanguagesBlock(section.lines);
    } else if (name === "references") {
      result.references = parseReferencesBlock(section.lines);
    }
  }

  return result;
}
