"use client";

import { useEffect, useMemo, useState } from "react";
import { useLocale } from "next-intl";
import { cn } from "@/lib/utils";

interface MonthYearFieldProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  className?: string;
}

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

function parseValue(value: string): { year: number; month: number } | null {
  if (!value) return null;
  const m = value.trim().match(/^(\d{4})-(\d{1,2})$/);
  if (!m) return null;
  const year = Number(m[1]);
  const month = Number(m[2]);
  if (!Number.isFinite(year) || year < 1900 || year > 2200) return null;
  if (month < 1 || month > 12) return null;
  return { year, month };
}

const YEAR_SPAN = 50;

/**
 * Month + year picker displayed in Buddhist Era (พ.ศ.) when the UI locale is
 * Thai, otherwise AD. Always stores the ISO value "YYYY-MM".
 *
 * The two selects are staged locally and only committed (via onChange) once
 * both month and year are set, so picking the first side of a blank field no
 * longer resets the field.
 */
export function MonthYearField({
  value,
  onChange,
  disabled,
  className,
}: MonthYearFieldProps) {
  const locale = useLocale();
  const isThai = locale === "th";
  const parsed = parseValue(value);

  const [staged, setStaged] = useState<{ year?: number; month?: number }>({
    year: parsed?.year,
    month: parsed?.month,
  });

  useEffect(() => {
    const p = parseValue(value);
    setStaged({ year: p?.year, month: p?.month });
  }, [value]);

  const monthOptions = useMemo(() => {
    const intl = new Intl.DateTimeFormat(isThai ? "th-TH" : "en-US", {
      month: "long",
    });
    return Array.from({ length: 12 }, (_, i) =>
      intl.format(new Date(2000, i, 1))
    );
  }, [isThai]);

  const years = useMemo(() => {
    const currentCe = new Date().getFullYear();
    const minCe = Math.min(
      currentCe - YEAR_SPAN,
      parsed?.year ?? currentCe - YEAR_SPAN
    );
    const list: number[] = [];
    for (let y = currentCe + 1; y >= minCe; y--) list.push(y);
    return list;
  }, [parsed?.year]);

  const handleMonth = (raw: string) => {
    const month = raw ? Number(raw) : undefined;
    const year = staged.year;
    setStaged({ year, month });
    if (year !== undefined && month !== undefined) {
      onChange(`${year}-${pad(month)}`);
    } else if (month === undefined && year !== undefined) {
      onChange("");
    }
  };

  const handleYear = (raw: string) => {
    const year = raw ? Number(raw) : undefined;
    const month = staged.month;
    setStaged({ year, month });
    if (year !== undefined && month !== undefined) {
      onChange(`${year}-${pad(month)}`);
    } else if (year === undefined && month !== undefined) {
      onChange("");
    }
  };

  const displayYear = (ce: number) => (isThai ? String(ce + 543) : String(ce));

  return (
    <div className={cn("flex items-center gap-1.5", className)}>
      <select
        value={staged.month ?? ""}
        disabled={disabled}
        onChange={(e) => handleMonth(e.target.value)}
        className="h-8 flex-1 min-w-0 rounded-md border border-input bg-background px-2 text-sm disabled:opacity-50"
      >
        <option value="">—</option>
        {monthOptions.map((name, i) => (
          <option key={name} value={i + 1}>
            {name}
          </option>
        ))}
      </select>
      <select
        value={staged.year ?? ""}
        disabled={disabled}
        onChange={(e) => handleYear(e.target.value)}
        className="h-8 w-24 shrink-0 rounded-md border border-input bg-background px-2 text-sm disabled:opacity-50"
      >
        <option value="">—</option>
        {years.map((y) => (
          <option key={y} value={y}>
            {displayYear(y)}
          </option>
        ))}
      </select>
      {isThai && (
        <span className="shrink-0 text-xs text-muted-foreground whitespace-nowrap">
          พ.ศ.
        </span>
      )}
    </div>
  );
}
