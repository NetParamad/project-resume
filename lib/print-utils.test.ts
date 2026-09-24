import { describe, expect, it } from "vitest";
import {
  computeInitialScale,
  evaluateFitStep,
  solveFitScale,
  FIT_THRESHOLD_PX,
  MIN_SCALE,
} from "./print-utils";

describe("computeInitialScale", () => {
  it("returns 1 when content already fits", () => {
    expect(computeInitialScale(500)).toBe(1);
    expect(computeInitialScale(FIT_THRESHOLD_PX)).toBe(1);
  });

  it("scales proportionally for overflowing content", () => {
    expect(computeInitialScale(2000)).toBeCloseTo(FIT_THRESHOLD_PX / 2000, 5);
    expect(computeInitialScale(2160)).toBeCloseTo(FIT_THRESHOLD_PX / 2160, 5);
  });

  it("floors at MIN_SCALE for extremely long content", () => {
    expect(computeInitialScale(90_000)).toBe(MIN_SCALE);
  });
});

describe("evaluateFitStep", () => {
  it("flags unsupported when the measured height is 0 (e.g. display:none)", () => {
    expect(evaluateFitStep(2000, 0.54, 0).action).toBe("unsupported");
  });

  it("flags unsupported when zoom had no plausible effect", () => {
    const natural = 2000;
    expect(evaluateFitStep(natural, 0.54, natural * 1.3).action).toBe(
      "unsupported"
    );
    expect(evaluateFitStep(natural, 0.54, natural * 0.7).action).toBe(
      "unsupported"
    );
    expect(evaluateFitStep(natural, 0.54, Number.NaN).action).toBe(
      "unsupported"
    );
  });

  it("reports fits within threshold plus slack", () => {
    expect(evaluateFitStep(2000, 0.54, 1082).action).toBe("fits");
    expect(evaluateFitStep(2000, 0.54, 1000).action).toBe("fits");
  });

  it("requests a smaller scale when still too tall", () => {
    const step = evaluateFitStep(2000, 0.6, 1200);
    expect(step.action).toBe("retry");
    expect(step.scale).toBeCloseTo((0.6 * FIT_THRESHOLD_PX) / 1200, 5);
  });

  it("reports truncated when no meaningful progress is possible at MIN_SCALE", () => {
    const step = evaluateFitStep(20_000, MIN_SCALE, 3200);
    expect(step.action).toBe("truncated");
    expect(step.scale).toBe(MIN_SCALE);
  });

  it("keeps refining instead of truncating when only a few px push over the slack", () => {
    // Regression: a rich resume can land just past the threshold+slack after
    // the first zoom. The tiny refinement (<0.5%) used to be treated as
    // "cannot fit", firing the misleading "PDF too long" error even though
    // the next step fits comfortably.
    const natural = 1938;
    const overSlack = FIT_THRESHOLD_PX + 3;
    const step = evaluateFitStep(
      natural,
      FIT_THRESHOLD_PX / natural,
      overSlack
    );
    expect(step.action).toBe("retry");
    expect(step.scale).toBeCloseTo(
      (FIT_THRESHOLD_PX * FIT_THRESHOLD_PX) / natural / overSlack,
      5
    );
    expect(step.scale).toBeLessThan(FIT_THRESHOLD_PX / natural);
  });

  it("clamps the refined scale to MIN_SCALE while still making progress", () => {
    const step = evaluateFitStep(8_000, 0.16, 1360);
    expect(step.action).toBe("retry");
    expect(step.scale).toBe(MIN_SCALE);
  });
});

describe("solveFitScale", () => {
  const natural = 1938;

  it("converges quickly when a rich resume lands just over the slack", () => {
    // First zoom lands at ~1085px; the next step must fit.
    let measurements = 0;
    const measure = (scale: number) => {
      measurements++;
      // 0.4%-ish overshoot vs. the linear prediction until it fits.
      return natural * scale * 1.004;
    };
    const result = solveFitScale(natural, measure);
    expect(result.action).toBe("fits");
    expect(result.scale).toBeLessThan(FIT_THRESHOLD_PX / natural);
    expect(measurements).toBeLessThanOrEqual(2);
  });

  it("finds a fit within the loop budget for sticky content with fixed-height elements", () => {
    // A 300px footer/avatar that never shrinks makes the first zoom land
    // step-by-step over the slack. 6 steps are enough; the old 4-step budget
    // could burn out and falsely report "too long".
    let measurements = 0;
    const measure = (scale: number) => {
      measurements++;
      return 0.85 * natural * scale + 300;
    };
    const result = solveFitScale(natural, measure);
    expect(result.action).toBe("fits");
    expect(result.scale).toBeGreaterThan(MIN_SCALE);
    expect(measurements).toBeLessThanOrEqual(6);
  });

  it("reports retry-on-budget-exhaustion for impossible sticky content", () => {
    // Content that stubbornly stays a hair over the slack no matter the
    // zoom: every measurement is inside the ±25% tolerance, so the solver
    // keeps refining until the loop budget runs out (never "fits").
    let measurements = 0;
    const measure = () => {
      measurements++;
      return FIT_THRESHOLD_PX + 3;
    };
    const result = solveFitScale(4000, measure);
    expect(result.action).toBe("retry");
    expect(measurements).toBe(6);
    expect(result.scale).toBeLessThan(FIT_THRESHOLD_PX / 4000);
  });

  it("propagates unsupported zoom behaviour", () => {
    // Zoom has no effect: the rect stays at the natural size.
    const result = solveFitScale(natural, () => natural);
    expect(result.action).toBe("unsupported");
  });

  it("truncates immediately at the minimum scale", () => {
    const natural = 20_000;
    const result = solveFitScale(natural, (scale) => natural * scale);
    expect(result.action).toBe("truncated");
    expect(result.scale).toBe(MIN_SCALE);
  });
});

describe("fit loop convergence", () => {
  it("converges to a fitting scale within few iterations", () => {
    const natural = 3000;
    // Simulate zoom rendering slightly larger than the linear prediction.
    const render = (scale: number) => natural * scale * 1.05;
    const result = solveFitScale(natural, render);
    expect(result.action).toBe("fits");
    expect(render(result.scale)).toBeLessThanOrEqual(FIT_THRESHOLD_PX + 2);
  });
});
