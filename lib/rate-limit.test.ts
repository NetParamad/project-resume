import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { rateLimit } from "./rate-limit";

describe("rateLimit", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-01-01T00:00:00Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("allows requests under the limit", () => {
    const key = `test:${Math.random()}`;
    expect(rateLimit(key, 3, 60_000).ok).toBe(true);
    expect(rateLimit(key, 3, 60_000).ok).toBe(true);
    expect(rateLimit(key, 3, 60_000).ok).toBe(true);
  });

  it("blocks once the limit is reached and reports retryAfterSec", () => {
    const key = `test:${Math.random()}`;
    rateLimit(key, 2, 60_000);
    rateLimit(key, 2, 60_000);
    const blocked = rateLimit(key, 2, 60_000);

    expect(blocked.ok).toBe(false);
    expect(blocked.retryAfterSec).toBeGreaterThan(0);
    expect(blocked.retryAfterSec).toBeLessThanOrEqual(60);
  });

  it("resets the bucket after the window elapses", () => {
    const key = `test:${Math.random()}`;
    rateLimit(key, 1, 1_000);
    expect(rateLimit(key, 1, 1_000).ok).toBe(false);

    vi.advanceTimersByTime(1_001);

    expect(rateLimit(key, 1, 1_000).ok).toBe(true);
  });

  it("tracks separate keys independently", () => {
    const keyA = `a:${Math.random()}`;
    const keyB = `b:${Math.random()}`;

    rateLimit(keyA, 1, 60_000);
    expect(rateLimit(keyA, 1, 60_000).ok).toBe(false);
    expect(rateLimit(keyB, 1, 60_000).ok).toBe(true);
  });
});
