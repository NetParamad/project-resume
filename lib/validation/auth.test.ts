import { describe, it, expect } from "vitest";
import {
  loginSchema,
  signUpSchema,
  forgotPasswordSchema,
  updatePasswordSchema,
  emailSchema,
  passwordSchema,
} from "./auth";

const STRONG = "Str0ng!pass";

describe("emailSchema", () => {
  it("accepts valid email", () => {
    expect(emailSchema.safeParse("user@example.com").success).toBe(true);
  });
  it("rejects missing @", () => {
    expect(emailSchema.safeParse("userexample.com").success).toBe(false);
  });
  it("rejects empty string", () => {
    expect(emailSchema.safeParse("").success).toBe(false);
  });
});

describe("passwordSchema", () => {
  it("accepts a strong password (length + mixed classes)", () => {
    expect(passwordSchema.safeParse(STRONG).success).toBe(true);
  });
  it("rejects a short password", () => {
    expect(passwordSchema.safeParse("Ab1!x").success).toBe(false);
  });
  it("rejects a long-but-single-class password", () => {
    expect(passwordSchema.safeParse("aaaaaaaaaaaa").success).toBe(false);
  });
  it("rejects a common password even if it meets the shape", () => {
    expect(passwordSchema.safeParse("Password123").success).toBe(false);
  });
  it("rejects empty string", () => {
    expect(passwordSchema.safeParse("").success).toBe(false);
  });
});

describe("loginSchema", () => {
  it("accepts valid credentials", () => {
    expect(loginSchema.safeParse({ email: "a@b.com", password: STRONG }).success).toBe(true);
  });
  it("does not apply the new-password policy (old short passwords can still log in)", () => {
    expect(loginSchema.safeParse({ email: "a@b.com", password: "123456" }).success).toBe(true);
  });
  it("rejects invalid email", () => {
    expect(loginSchema.safeParse({ email: "bad", password: STRONG }).success).toBe(false);
  });
  it("rejects an empty password", () => {
    expect(loginSchema.safeParse({ email: "a@b.com", password: "" }).success).toBe(false);
  });
});

describe("signUpSchema", () => {
  it("accepts a strong password with matching repeat", () => {
    const result = signUpSchema.safeParse({
      email: "a@b.com",
      password: STRONG,
      repeatPassword: STRONG,
    });
    expect(result.success).toBe(true);
  });
  it("rejects mismatched passwords", () => {
    const result = signUpSchema.safeParse({
      email: "a@b.com",
      password: STRONG,
      repeatPassword: `${STRONG}x`,
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some((i) => i.path.includes("repeatPassword"))).toBe(true);
    }
  });
  it("rejects a weak password", () => {
    const result = signUpSchema.safeParse({
      email: "a@b.com",
      password: "123456",
      repeatPassword: "123456",
    });
    expect(result.success).toBe(false);
  });
  it("rejects a password built from the email address", () => {
    const result = signUpSchema.safeParse({
      email: "somchai@example.com",
      password: "Somchai123!",
      repeatPassword: "Somchai123!",
    });
    expect(result.success).toBe(false);
  });
});

describe("forgotPasswordSchema", () => {
  it("accepts valid email", () => {
    expect(forgotPasswordSchema.safeParse({ email: "a@b.com" }).success).toBe(true);
  });
  it("rejects invalid email", () => {
    expect(forgotPasswordSchema.safeParse({ email: "bad" }).success).toBe(false);
  });
});

describe("updatePasswordSchema", () => {
  it("accepts a strong password with matching confirm", () => {
    const result = updatePasswordSchema.safeParse({
      password: STRONG,
      confirmPassword: STRONG,
    });
    expect(result.success).toBe(true);
  });
  it("rejects mismatched passwords", () => {
    const result = updatePasswordSchema.safeParse({
      password: STRONG,
      confirmPassword: `${STRONG}x`,
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some((i) => i.path.includes("confirmPassword"))).toBe(true);
    }
  });
  it("rejects a weak password", () => {
    expect(
      updatePasswordSchema.safeParse({ password: "123456", confirmPassword: "123456" }).success,
    ).toBe(false);
  });
});
