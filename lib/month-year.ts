export interface MonthYear {
  year: number;
  month: number;
}

const MIN_YEAR = 1900;
const MAX_YEAR = 2200;

export function parseMonthYear(
  value: string | null | undefined
): MonthYear | null {
  if (!value) return null;
  const m = value.trim().match(/^(\d{4})-(\d{1,2})$/);
  if (!m) return null;
  const year = Number(m[1]);
  const month = Number(m[2]);
  if (!Number.isFinite(year) || year < MIN_YEAR || year > MAX_YEAR) return null;
  if (month < 1 || month > 12) return null;
  return { year, month };
}

export function formatMonthYear(m: MonthYear): string {
  return `${m.year}-${String(m.month).padStart(2, "0")}`;
}

export function compareMonthYear(a: MonthYear, b: MonthYear): number {
  if (a.year !== b.year) return a.year < b.year ? -1 : 1;
  if (a.month !== b.month) return a.month < b.month ? -1 : 1;
  return 0;
}

export function shiftMonthYear(m: MonthYear, delta: number): MonthYear {
  const total = m.year * 12 + (m.month - 1) + delta;
  return { year: Math.floor(total / 12), month: (total % 12) + 1 };
}

export function shiftMonthYearValue(
  value: string,
  delta: number
): string | undefined {
  const parsed = parseMonthYear(value);
  if (!parsed) return undefined;
  return formatMonthYear(shiftMonthYear(parsed, delta));
}

/**
 * True when the start/end pair is invalid, i.e. both are set and start is not
 * strictly before end. Missing or unparseable sides are not treated as an
 * error.
 */
export function isRangeInvalid(start: string, end: string): boolean {
  const s = parseMonthYear(start);
  const e = parseMonthYear(end);
  if (!s || !e) return false;
  return compareMonthYear(s, e) >= 0;
}

export function buildEligibleYears(opts: {
  currentYear: number;
  spanYears: number;
  min?: MonthYear;
  max?: MonthYear;
  preserve: (number | undefined)[];
}): number[] {
  const { currentYear, spanYears, min, max, preserve } = opts;
  const earliest = currentYear - spanYears;
  const base: number[] = [];
  for (let y = currentYear + 1; y >= earliest; y--) base.push(y);

  const filtered = base.filter(
    (y) => (!min || y >= min.year) && (!max || y <= max.year)
  );

  // Keep existing values visible even when they fall outside the bounds so a
  // stored (e.g. imported) out-of-range date can still be reviewed and fixed;
  // the range warning is the enforcement backstop there.
  for (const kept of preserve) {
    if (kept !== undefined && !filtered.includes(kept)) filtered.push(kept);
  }

  return filtered.sort((a, b) => b - a);
}

export function buildEligibleMonths(
  min?: MonthYear,
  max?: MonthYear,
  year?: number
): number[] {
  if (year === undefined) return Array.from({ length: 12 }, (_, i) => i + 1);
  return Array.from({ length: 12 }, (_, i) => i + 1).filter(
    (m) =>
      (!min || year !== min.year || m >= min.month) &&
      (!max || year !== max.year || m <= max.month)
  );
}
