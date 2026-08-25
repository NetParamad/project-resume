import { describe, expect, it } from "vitest";
import {
  computeInitialScale,
  evaluateFitStep,
  FIT_THRESHOLD_PX,
  MIN_SCALE,
} from "./print-utils";

describe("computeInitialScale", () => {
  it("returns 1 when content already fits", () => {
    expect(computeInitialScale(500)).toBe(1);
    expect(computeInitialScale(FIT_THRESHOLD_PX)).toBe(1);
  });

  it("scales proportionally for overflowing content", () => {
    expect(computeInitialScale(2000)).toBeCloseTo(0.54, 5);
    expect(computeInitialScale(2160)).toBeCloseTo(0.5, 5);
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
    expect(evaluateFitStep(natural, 0.54, natural * 1.3).action).toBe("unsupported");
    expect(evaluateFitStep(natural, 0.54, natural * 0.7).action).toBe("unsupported");
    expect(evaluateFitStep(natural, 0.54, Number.NaN).action).toBe("unsupported");
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

  it("clamps the refined scale to MIN_SCALE while still making progress", () => {
    const step = evaluateFitStep(8_000, 0.16, 1360);
    expect(step.action).toBe("retry");
    expect(step.scale).toBe(MIN_SCALE);
  });
});

describe("fit loop convergence", () => {
  it("converges to a fitting scale within few iterations", () => {
    const natural = 3000;
    // Simulate zoom rendering slightly larger than the linear prediction.
    const render = (scale: number) => natural * scale * 1.05;

    let step: ReturnType<typeof evaluateFitStep> = {
      action: "retry",
      scale: computeInitialScale(natural),
    };
    let iterations = 0;
    while (step.action === "retry" && iterations < 4) {
      step = evaluateFitStep(natural, step.scale, render(step.scale));
      iterations++;
    }

    expect(step.action).toBe("fits");
    expect(iterations).toBeLessThanOrEqual(4);
    expect(render(step.scale)).toBeLessThanOrEqual(FIT_THRESHOLD_PX + 2);
  });
});
