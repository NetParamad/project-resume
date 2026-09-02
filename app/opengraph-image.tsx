import { ImageResponse } from "next/og";
import { SITE_NAME, UNIVERSITY } from "@/lib/seo";

export const alt = `${SITE_NAME} — Free ATS Resume Builder for ${UNIVERSITY.abbr} students`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const chips = ["AI writing assistant", "ATS score checker", "PDF export", "Thai & English"];

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "80px",
          background: "linear-gradient(135deg, #ffffff 0%, #fff7ed 100%)",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
          <svg
            width="88"
            height="88"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#c2410c"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12.5 22H18a2 2 0 0 0 2-2V7l-5-5H6a2 2 0 0 0-2 2v9.5" />
            <path d="M14 2v4a2 2 0 0 0 2 2h4" />
            <path d="M13.378 15.626a1 1 0 1 0-3.004-3.004l-5.01 5.012a2 2 0 0 0-.506.854l-.837 2.87a.5.5 0 0 0 .62.62l2.87-.837a2 2 0 0 0 .854-.506z" />
          </svg>
          <div style={{ display: "flex", fontSize: "40px", fontWeight: 700, color: "#1c1917" }}>
            {SITE_NAME}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
          <div
            style={{
              display: "flex",
              fontSize: "66px",
              fontWeight: 800,
              color: "#1c1917",
              lineHeight: 1.1,
            }}
          >
            Free ATS Resume Builder
          </div>
          <div style={{ display: "flex", fontSize: "32px", color: "#57534e", lineHeight: 1.3 }}>
            {`For students and graduates of ${UNIVERSITY.nameEn} (${UNIVERSITY.abbr})`}
          </div>
        </div>

        <div style={{ display: "flex", gap: "16px" }}>
          {chips.map((chip) => (
            <div
              key={chip}
              style={{
                display: "flex",
                fontSize: "23px",
                color: "#c2410c",
                background: "#ffedd5",
                borderRadius: "999px",
                padding: "10px 24px",
              }}
            >
              {chip}
            </div>
          ))}
        </div>
      </div>
    ),
    { ...size },
  );
}
