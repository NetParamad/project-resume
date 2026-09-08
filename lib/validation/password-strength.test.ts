import { describe, it, expect } from "vitest";
import {
  evaluatePassword,
  isAcceptablePassword,
  passwordChecks,
  characterClasses,
  MIN_PASSWORD_LENGTH,
} from "./password-strength";

describe("passwordChecks", () => {
  it("flags each character class", () => {
    const byId = Object.fromEntries(
      passwordChecks("Abc123!!").map((c) => [c.id, c.met]),
    );
    expect(byId).toEqual({
      length: true,
      lower: true,
      upper: true,
      digit: true,
      symbol: true,
    });
  });

  it("length check follows MIN_PASSWORD_LENGTH", () => {
    expect(passwordChecks("a".repeat(MIN_PASSWORD_LENGTH - 1))[0].met).toBe(false);
    expect(passwordChecks("a".repeat(MIN_PASSWORD_LENGTH))[0].met).toBe(true);
  });
});

describe("characterClasses", () => {
  it("counts distinct classes, ignoring length", () => {
    expect(characterClasses("abcdefgh")).toBe(1);
    expect(characterClasses("abcABC12")).toBe(3);
    expect(characterClasses("abAB12!@")).toBe(4);
  });
});

describe("evaluatePassword", () => {
  it("rejects an empty or short password", () => {
    expect(evaluatePassword("")).toMatchObject({ acceptable: false, reason: "tooShort" });
    expect(evaluatePassword("Ab1!")).toMatchObject({ acceptable: false, reason: "tooShort" });
  });

  it("rejects a common password", () => {
    expect(evaluatePassword("password123")).toMatchObject({
      acceptable: false,
      reason: "tooCommon",
    });
  });

  it("rejects a password containing the email local-part", () => {
    expect(evaluatePassword("Somchai_2024", "somchai@example.com")).toMatchObject({
      acceptable: false,
      reason: "containsEmail",
    });
  });

  it("ignores a very short email local-part", () => {
    // "abc" is under the 4-char threshold, so it is not treated as sensitive
    expect(evaluatePassword("abcX9$definitely", "abc@example.com").acceptable).toBe(true);
  });

  it("requires at least three character classes", () => {
    expect(evaluatePassword("abcdefghijkl")).toMatchObject({
      acceptable: false,
      reason: "needsVariety",
    });
  });

  it("accepts a strong password and grades it", () => {
    expect(evaluatePassword("Str0ng!pass")).toMatchObject({ acceptable: true });
    expect(evaluatePassword("Str0ng!passphrase-2024").score).toBe(4);
  });

  it("isAcceptablePassword mirrors evaluatePassword.acceptable", () => {
    expect(isAcceptablePassword("Str0ng!pass")).toBe(true);
    expect(isAcceptablePassword("weak")).toBe(false);
  });
});
