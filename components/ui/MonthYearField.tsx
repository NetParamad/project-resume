"use client";

import { useEffect, useMemo, useState } from "react";
import { useLocale } from "next-intl";
import { cn } from "@/lib/utils";
import {
  parseMonthYear,
  formatMonthYear,
  buildEligibleYears,
  buildEligibleMonths,
} from "@/lib/month-year";

interface MonthYearFieldProps {
  value: string;
  onChange: (value: string) => void;
  min?: string;
  max?: string;
  disabled?: boolean;
  className?: string;
}

const YEAR_SPAN = 50;

/**
 * Month + year picker displayed in Buddhist Era (พ.ศ.) when the UI locale is
 * Thai, otherwise AD. Always stores the ISO value "YYYY-MM".
 *
 * The two selects are staged locally and only committed (via onChange) once
 * both month and year are set, so picking the first side of a blank field no
 * longer resets the field.
 *
 * `min`/`max` (ISO "YYYY-MM") constrain the offered years and months so later
 * dates can only be picked on the "start" side and earlier ones on the "end"
 * side.
 */
export function MonthYearField({
  value,
  onChange,
  min,
  max,
  disabled,
  className,
}: MonthYearFieldProps) {
  const locale = useLocale();
  const isThai = locale === "th";
  const parsed = parseMonthYear(value);
  const minParsed = useMemo(() => parseMonthYear(min), [min]);
  const maxParsed = useMemo(() => parseMonthYear(max), [max]);

  const [staged, setStaged] = useState<{ year?: number; month?: number }>({
    year: parsed?.year,
    month: parsed?.month,
  });

  useEffect(() => {
    const p = parseMonthYear(value);
    setStaged({ year: p?.year, month: p?.month });
  }, [value]);

  const years = useMemo(
    () =>
      buildEligibleYears({
        currentYear: new Date().getFullYear(),
        spanYears: YEAR_SPAN,
        min: minParsed ?? undefined,
        max: maxParsed ?? undefined,
        preserve: [parsed?.year, staged.year],
      }),
    [parsed?.year, staged.year, minParsed, maxParsed]
  );

  const monthOptions = useMemo(() => {
    const intl = new Intl.DateTimeFormat(isThai ? "th-TH" : "en-US", {
      month: "long",
    });
    const names = Array.from({ length: 12 }, (_, i) =>
      intl.format(new Date(2000, i, 1))
    );
    return buildEligibleMonths(
      minParsed ?? undefined,
      maxParsed ?? undefined,
      staged.year
    ).map((i) => ({ value: i, name: names[i - 1] }));
  }, [isThai, staged.year, minParsed, maxParsed]);

  const handleMonth = (raw: string) => {
    const month = raw ? Number(raw) : undefined;
    const year = staged.year;
    setStaged({ year, month });
    if (year !== undefined && month !== undefined) {
      onChange(formatMonthYear({ year, month }));
    } else if (month === undefined && year !== undefined) {
      onChange("");
    }
  };

  const handleYear = (raw: string) => {
    const year = raw ? Number(raw) : undefined;
    const month = staged.month;
    setStaged({ year, month });
    if (year !== undefined && month !== undefined) {
      onChange(formatMonthYear({ year, month }));
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
        {monthOptions.map(({ value: v, name }) => (
          <option key={name} value={v}>
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
