import { describe, expect, it } from "vitest";
import {
  parseMonthYear,
  formatMonthYear,
  compareMonthYear,
  shiftMonthYear,
  shiftMonthYearValue,
  isRangeInvalid,
  buildEligibleYears,
  buildEligibleMonths,
} from "./month-year";

describe("parseMonthYear", () => {
  it("parses a valid YYYY-MM value", () => {
    expect(parseMonthYear("2021-03")).toEqual({ year: 2021, month: 3 });
  });

  it("parses a single-digit month", () => {
    expect(parseMonthYear("2021-3")).toEqual({ year: 2021, month: 3 });
  });

  it("returns null for empty / missing input", () => {
    expect(parseMonthYear("")).toBeNull();
    expect(parseMonthYear(undefined)).toBeNull();
    expect(parseMonthYear(null)).toBeNull();
  });

  it("rejects non YYYY-MM shapes", () => {
    expect(parseMonthYear("2021")).toBeNull();
    expect(parseMonthYear("2021-1-1")).toBeNull();
    expect(parseMonthYear("21-03")).toBeNull();
    expect(parseMonthYear("2021/03")).toBeNull();
  });

  it("rejects out-of-range month and year", () => {
    expect(parseMonthYear("2021-00")).toBeNull();
    expect(parseMonthYear("2021-13")).toBeNull();
    expect(parseMonthYear("1800-05")).toBeNull();
    expect(parseMonthYear("2300-05")).toBeNull();
  });
});

describe("compareMonthYear", () => {
  it("orders by year then month", () => {
    expect(
      compareMonthYear({ year: 2020, month: 5 }, { year: 2020, month: 6 })
    ).toBe(-1);
    expect(
      compareMonthYear({ year: 2020, month: 6 }, { year: 2020, month: 5 })
    ).toBe(1);
    expect(
      compareMonthYear({ year: 2019, month: 12 }, { year: 2020, month: 1 })
    ).toBe(-1);
  });

  it("is equal for the same month-year", () => {
    expect(
      compareMonthYear({ year: 2020, month: 5 }, { year: 2020, month: 5 })
    ).toBe(0);
  });
});

describe("formatMonthYear", () => {
  it("pads the month to two digits", () => {
    expect(formatMonthYear({ year: 2020, month: 3 })).toBe("2020-03");
    expect(formatMonthYear({ year: 2020, month: 12 })).toBe("2020-12");
  });
});

describe("shiftMonthYear", () => {
  it("carries over month boundaries", () => {
    expect(shiftMonthYear({ year: 2020, month: 1 }, -1)).toEqual({
      year: 2019,
      month: 12,
    });
    expect(shiftMonthYear({ year: 2020, month: 12 }, 1)).toEqual({
      year: 2021,
      month: 1,
    });
  });

  it("shifts within the same year", () => {
    expect(shiftMonthYear({ year: 2020, month: 6 }, 1)).toEqual({
      year: 2020,
      month: 7,
    });
    expect(shiftMonthYear({ year: 2020, month: 6 }, -3)).toEqual({
      year: 2020,
      month: 3,
    });
  });
});

describe("shiftMonthYearValue", () => {
  it("returns the shifted YYYY-MM string", () => {
    expect(shiftMonthYearValue("2020-01", -1)).toBe("2019-12");
    expect(shiftMonthYearValue("2020-12", 1)).toBe("2021-01");
  });

  it("returns undefined for unparseable input", () => {
    expect(shiftMonthYearValue("", -1)).toBeUndefined();
    expect(shiftMonthYearValue("bad", 1)).toBeUndefined();
    expect(shiftMonthYearValue("2020", 1)).toBeUndefined();
  });
});

describe("isRangeInvalid", () => {
  it("is false when start is before end", () => {
    expect(isRangeInvalid("2020-01", "2020-06")).toBe(false);
    expect(isRangeInvalid("2019-12", "2020-01")).toBe(false);
  });

  it("is true when start is equal to or after end", () => {
    expect(isRangeInvalid("2020-06", "2020-06")).toBe(true);
    expect(isRangeInvalid("2020-06", "2020-01")).toBe(true);
  });

  it("is false when either side is missing", () => {
    expect(isRangeInvalid("", "2020-06")).toBe(false);
    expect(isRangeInvalid("2020-06", "")).toBe(false);
    expect(isRangeInvalid("", "")).toBe(false);
  });
});

describe("buildEligibleYears", () => {
  it("builds a descending window around the current year", () => {
    expect(
      buildEligibleYears({ currentYear: 2024, spanYears: 2, preserve: [] })
    ).toEqual([2025, 2024, 2023, 2022]);
  });

  it("respects a lower year bound", () => {
    expect(
      buildEligibleYears({
        currentYear: 2024,
        spanYears: 50,
        min: { year: 2023, month: 1 },
        preserve: [],
      })
    ).not.toContain(2022);
    expect(
      buildEligibleYears({
        currentYear: 2024,
        spanYears: 50,
        min: { year: 2023, month: 1 },
        preserve: [],
      }).at(-1)
    ).toBe(2023);
  });

  it("respects an upper year bound", () => {
    const out = buildEligibleYears({
      currentYear: 2024,
      spanYears: 50,
      max: { year: 2023, month: 12 },
      preserve: [],
    });
    expect(out).not.toContain(2024);
    expect(out[0]).toBe(2023);
  });

  it("keeps preserved years even when out of range", () => {
    const out = buildEligibleYears({
      currentYear: 2024,
      spanYears: 50,
      max: { year: 2022, month: 12 },
      preserve: [2020, 2030],
    });
    expect(out).toContain(2020);
    expect(out).toContain(2030);
    expect(out[0]).toBe(2030);
  });
});

describe("buildEligibleMonths", () => {
  it("returns all months when unconstrained", () => {
    expect(buildEligibleMonths(undefined, undefined, 2020)).toEqual([
      1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12,
    ]);
    expect(buildEligibleMonths(undefined, undefined, undefined)).toEqual([
      1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12,
    ]);
  });

  it("trims months below a min bound on the boundary year", () => {
    expect(
      buildEligibleMonths({ year: 2020, month: 3 }, undefined, 2020)
    ).toEqual([3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
    expect(
      buildEligibleMonths({ year: 2020, month: 3 }, undefined, 2019)
    ).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
  });

  it("trims months above a max bound on the boundary year", () => {
    expect(
      buildEligibleMonths(undefined, { year: 2020, month: 8 }, 2020)
    ).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
    expect(
      buildEligibleMonths(undefined, { year: 2020, month: 8 }, 2021)
    ).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
  });

  it("intersects min and max on the same boundary year", () => {
    expect(
      buildEligibleMonths(
        { year: 2020, month: 3 },
        { year: 2020, month: 8 },
        2020
      )
    ).toEqual([3, 4, 5, 6, 7, 8]);
  });
});
