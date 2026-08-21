"use client";

import { useResumeStore } from "@/lib/store/resume-store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const PRESETS = [
  { name: "Blue", color: "#3b82f6" },
  { name: "Indigo", color: "#6366f1" },
  { name: "Purple", color: "#a855f7" },
  { name: "Pink", color: "#ec4899" },
  { name: "Red", color: "#ef4444" },
  { name: "Orange", color: "#f97316" },
  { name: "Amber", color: "#f59e0b" },
  { name: "Green", color: "#22c55e" },
  { name: "Teal", color: "#14b8a6" },
  { name: "Cyan", color: "#06b6d4" },
  { name: "Gray", color: "#6b7280" },
  { name: "Black", color: "#111111" },
];

export function ThemeForm() {
  const accentColor = useResumeStore((s) => s.data.theme?.accentColor ?? "#f97316");
  const updateTheme = useResumeStore((s) => s.updateTheme);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Theme</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex flex-wrap gap-2">
          {PRESETS.map(({ name, color }) => (
            <button
              key={color}
              type="button"
              title={name}
              onClick={() => updateTheme({ accentColor: color })}
              className={`w-7 h-7 rounded-full border-2 transition-all ${
                accentColor === color ? "border-foreground scale-110" : "border-transparent"
              }`}
              style={{ backgroundColor: color }}
            />
          ))}
        </div>
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={accentColor}
            onChange={(e) => updateTheme({ accentColor: e.target.value })}
            className="w-9 h-9 rounded cursor-pointer border border-input"
          />
          <span className="text-xs text-muted-foreground font-mono">{accentColor}</span>
        </div>
      </CardContent>
    </Card>
  );
}
